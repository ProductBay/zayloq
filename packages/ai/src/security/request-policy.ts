import type { AiRequest } from "../contracts/types.js";
import { AiError } from "../errors/ai-error.js";
export function requestCharacterCount(request: AiRequest): number { return (request.system?.length ?? 0) + request.messages.reduce((sum, message) => sum + message.content.length, 0); }
export function enforceRequestPolicy(request: AiRequest, maxCharacters: number) { if (!request.messages.length || request.messages.some((message) => !message.content.trim())) throw new AiError("PROVIDER_REJECTED", "The AI request is invalid."); if (requestCharacterCount(request) > maxCharacters) throw new AiError("REQUEST_TOO_LARGE", "The AI request exceeds the permitted size."); }
export function safeRequestTelemetry(request: AiRequest) { return { task: request.task, modelRole: request.modelRole, messageCount: request.messages.length, inputCharacters: requestCharacterCount(request), attribution: request.metadata }; }
