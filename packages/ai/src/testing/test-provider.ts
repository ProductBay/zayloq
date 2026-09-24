import type { AiProvider, AiResponse, ResolvedAiRequest, ResolvedStructuredRequest } from "../contracts/types.js";
import { AiError } from "../errors/ai-error.js";
type Behavior = "success" | "transient" | "rejected" | "hang";
export class TestAiProvider implements AiProvider {
  readonly name = "OPENAI" as const; calls = 0;
  constructor(private readonly options: { text?: string; structured?: unknown; behavior?: Behavior; transientFailures?: number; usage?: { inputTokens?: number; cachedInputTokens?: number; outputTokens?: number; totalTokens?: number } } = {}) {}
  async generateText(request: ResolvedAiRequest): Promise<AiResponse<string>> { await this.before(request); return this.response(this.options.text ?? "TEST_RESPONSE", request.model); }
  async generateStructured<T>(request: ResolvedStructuredRequest<T>): Promise<AiResponse<T>> { await this.before(request); const parsed = request.schema.safeParse(this.options.structured ?? {}); if (!parsed.success) throw new AiError("INVALID_PROVIDER_RESPONSE", "The AI provider returned invalid structured output."); return this.response(parsed.data, request.model); }
  private async before(request: ResolvedAiRequest) { this.calls++; if (request.signal.aborted) throw new AiError("CANCELLED", "cancelled"); if (this.options.behavior === "hang") await new Promise<void>((_resolve, reject) => request.signal.addEventListener("abort", () => reject(new AiError("CANCELLED", "cancelled")), { once: true })); if (this.options.behavior === "rejected") throw new AiError("PROVIDER_REJECTED", "The provider rejected the request."); if (this.options.behavior === "transient" && this.calls <= (this.options.transientFailures ?? 1)) throw new AiError("PROVIDER_UNAVAILABLE", "Temporary provider failure.", true, 1); }
  private response<T>(output: T, model: string): AiResponse<T> { return { provider: this.name, model, output, finishReason: "completed", usage: this.options.usage ?? {}, latencyMs: 1, requestId: "test-request", retryCount: 0 }; }
}
