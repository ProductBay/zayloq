import type { AiEnvironment } from "@zayloq/config";
import type { AiProvider, AiRequest, AiResponse, AiStructuredRequest, ResolvedAiRequest } from "../contracts/types.js";
import { AiError, sanitizeProviderError } from "../errors/ai-error.js";
import { ModelResolver } from "../models/model-resolver.js";
import { AiProviderRegistry } from "../providers/registry.js";
import { enforceRequestPolicy, safeRequestTelemetry } from "../security/request-policy.js";
import type { AiConcurrencyController, AiConcurrencyLease } from "./concurrency.js";
type Logger = { info(values: object, message: string): void; warn(values: object, message: string): void; };
const silent: Logger = { info() {}, warn() {} };
export class AiGateway {
  private readonly models: ModelResolver;
  constructor(private readonly config: AiEnvironment, private readonly registry: AiProviderRegistry, private readonly concurrency: AiConcurrencyController, private readonly logger: Logger = silent) { this.models = new ModelResolver(config); }
  generateText(request: AiRequest) { return this.execute(request, (provider, resolved) => provider.generateText(resolved)); }
  generateStructured<T>(request: AiStructuredRequest<T>) { return this.execute(request, (provider, resolved) => provider.generateStructured({ ...resolved, schema: request.schema, schemaName: request.schemaName })); }
  private async execute<T>(request: AiRequest, operation: (provider: AiProvider, resolved: ResolvedAiRequest) => Promise<AiResponse<T>>): Promise<AiResponse<T>> {
    enforceRequestPolicy(request, this.config.AI_MAX_REQUEST_CHARS);
    const providerName = this.models.provider(); const provider = this.registry.get(providerName); const model = this.models.resolve(request.modelRole); const controller = new AbortController(); let timedOut = false; let lease: AiConcurrencyLease | undefined;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, request.timeoutMs ?? this.config.AI_REQUEST_TIMEOUT_MS); const onAbort = () => controller.abort(); request.signal?.addEventListener("abort", onAbort, { once: true }); const telemetry = { ...safeRequestTelemetry(request), provider: providerName, model };
    try {
      lease = await this.concurrency.acquire(request.metadata, controller.signal);
      for (let attempt = 0; attempt < this.config.AI_RETRY_ATTEMPTS; attempt++) {
        try { const result = await operation(provider, { ...request, provider: providerName, model, maxOutputTokens: Math.min(request.maxOutputTokens ?? this.config.AI_MAX_OUTPUT_TOKENS, this.config.AI_MAX_OUTPUT_TOKENS), signal: controller.signal }); const normalized = { ...result, retryCount: attempt }; this.logger.info({ ...telemetry, latencyMs: result.latencyMs, usage: result.usage, retryCount: attempt }, "AI request completed."); return normalized; }
        catch (cause) { if (controller.signal.aborted) throw new AiError(timedOut ? "TIMEOUT" : "CANCELLED", timedOut ? "The AI request timed out." : "The AI request was cancelled."); const error = sanitizeProviderError(cause); if (!error.retryable || attempt + 1 >= this.config.AI_RETRY_ATTEMPTS) throw error; this.logger.warn({ ...telemetry, code: error.code, retryCount: attempt + 1 }, "Retrying transient AI request."); await delay(error.retryAfterMs ?? Math.min(1_000, 100 * 2 ** attempt), controller.signal); }
      }
      throw new AiError("PROVIDER_UNAVAILABLE", "The AI provider is temporarily unavailable.");
    } catch (cause) { const error = sanitizeProviderError(cause); this.logger.warn({ ...telemetry, code: error.code }, "AI request failed."); throw error; }
    finally { clearTimeout(timeout); request.signal?.removeEventListener("abort", onAbort); await lease?.release(); }
  }
}
function delay(milliseconds: number, signal: AbortSignal) { return new Promise<void>((resolve, reject) => { const onAbort = () => { clearTimeout(timer); reject(new AiError("CANCELLED", "The AI request was cancelled.")); }; const timer = setTimeout(() => { signal.removeEventListener("abort", onAbort); resolve(); }, milliseconds); signal.addEventListener("abort", onAbort, { once: true }); }); }
