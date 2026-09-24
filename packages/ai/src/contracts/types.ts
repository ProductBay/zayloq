import type { z } from "zod";
export type AiProviderName = "OPENAI";
export type AiModelRole = "FAST" | "REASONING" | "GENERATION";
export type AiTask = "text" | "structured" | "planning" | "generation" | "repair" | "classification" | "summarization" | "extraction";
export interface AiMessage { role: "user" | "assistant"; content: string; }
export interface AiAttribution { userId?: string; organizationId?: string; projectId?: string; environmentId?: string; operationId?: string; }
export interface AiRequest { task: AiTask; modelRole: AiModelRole; system?: string; messages: AiMessage[]; maxOutputTokens?: number; temperature?: number; metadata?: AiAttribution; signal?: AbortSignal; timeoutMs?: number; }
export interface AiStructuredRequest<T> extends AiRequest { schema: z.ZodType<T>; schemaName: string; }
export interface AiUsage { inputTokens?: number; outputTokens?: number; totalTokens?: number; }
export interface AiResponse<T> { provider: AiProviderName; model: string; output: T; finishReason: string | null; usage: AiUsage; latencyMs: number; requestId?: string; retryCount: number; }
export interface ResolvedAiRequest extends AiRequest { provider: AiProviderName; model: string; maxOutputTokens: number; signal: AbortSignal; }
export interface ResolvedStructuredRequest<T> extends ResolvedAiRequest { schema: z.ZodType<T>; schemaName: string; }
export interface AiProvider { readonly name: AiProviderName; generateText(request: ResolvedAiRequest): Promise<AiResponse<string>>; generateStructured<T>(request: ResolvedStructuredRequest<T>): Promise<AiResponse<T>>; }
