import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { AiProvider, AiResponse, AiUsage, ResolvedAiRequest, ResolvedStructuredRequest } from "../../contracts/types.js";
import { AiError } from "../../errors/ai-error.js";

type GeminiResponse = { text?: string; modelVersion?: string; responseId?: string; candidates?: Array<{ finishReason?: string }>; usageMetadata?: { promptTokenCount?: number; cachedContentTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } };
type GeminiModels = { generateContent(input: object): Promise<GeminiResponse> };
const normalizedUsage = (value: GeminiResponse["usageMetadata"]): AiUsage => ({ ...(value?.promptTokenCount !== undefined ? { inputTokens: value.promptTokenCount } : {}), ...(value?.cachedContentTokenCount !== undefined ? { cachedInputTokens: value.cachedContentTokenCount } : {}), ...(value?.candidatesTokenCount !== undefined ? { outputTokens: value.candidatesTokenCount } : {}), ...(value?.totalTokenCount !== undefined ? { totalTokens: value.totalTokenCount } : {}) });
const contents = (request: ResolvedAiRequest) => request.messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
function safeProviderError(error: unknown): never {
  if (error instanceof AiError) throw error;
  if (error instanceof ApiError) { if (error.status === 429 || error.status === 408 || error.status >= 500) throw new AiError(error.status === 429 ? "RATE_LIMITED" : "PROVIDER_UNAVAILABLE", "The AI provider is temporarily unavailable.", true); if (error.status === 401 || error.status === 403) throw new AiError("CONFIGURATION_ERROR", "The AI provider configuration is invalid."); throw new AiError("PROVIDER_REJECTED", "The AI provider rejected the request."); }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) throw new AiError("CANCELLED", "The AI request was cancelled.");
  throw new AiError("PROVIDER_UNAVAILABLE", "The AI provider is temporarily unavailable.", true);
}
export class GeminiProvider implements AiProvider {
  readonly name = "GEMINI" as const; private readonly models: GeminiModels;
  constructor(apiKey: string, client?: GoogleGenAI) { this.models = (client ?? new GoogleGenAI({ apiKey })).models as GeminiModels; }
  async generateText(request: ResolvedAiRequest): Promise<AiResponse<string>> { return this.generate(request); }
  async generateStructured<T>(request: ResolvedStructuredRequest<T>): Promise<AiResponse<T>> {
    const response = await this.generate(request, { responseMimeType: "application/json", responseJsonSchema: z.toJSONSchema(request.schema) }); let decoded: unknown;
    try { decoded = JSON.parse(response.output); } catch { throw new AiError("INVALID_PROVIDER_RESPONSE", "The AI provider returned invalid structured output."); }
    const parsed = request.schema.safeParse(decoded); if (!parsed.success) throw new AiError("INVALID_PROVIDER_RESPONSE", "The AI provider returned invalid structured output."); return { ...response, output: parsed.data };
  }
  private async generate(request: ResolvedAiRequest, structured?: object): Promise<AiResponse<string>> {
    const started = Date.now();
    try {
      const response = await this.models.generateContent({ model: request.model, contents: contents(request), config: { systemInstruction: request.system, maxOutputTokens: request.maxOutputTokens, temperature: request.temperature, abortSignal: request.signal, ...structured } });
      const output = response.text?.trim(); if (!output) throw new AiError("INVALID_PROVIDER_RESPONSE", "The AI provider returned an invalid response.");
      return { provider: this.name, model: request.model, output, finishReason: response.candidates?.[0]?.finishReason ?? null, usage: normalizedUsage(response.usageMetadata), latencyMs: Date.now() - started, requestId: response.responseId, retryCount: 0 };
    } catch (error) { return safeProviderError(error); }
  }
}
