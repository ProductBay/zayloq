export type AiErrorCode = "CONFIGURATION_ERROR" | "UNKNOWN_PROVIDER" | "REQUEST_TOO_LARGE" | "CONCURRENCY_LIMITED" | "TIMEOUT" | "CANCELLED" | "RATE_LIMITED" | "PROVIDER_UNAVAILABLE" | "INVALID_PROVIDER_RESPONSE" | "PROVIDER_REJECTED" | "MISSING_PRICE" | "USAGE_UNAVAILABLE" | "INSUFFICIENT_CREDITS" | "BILLING_CONFLICT" | "IDEMPOTENCY_REPLAY" | "INVALID_ATTRIBUTION";
export class AiError extends Error { constructor(readonly code: AiErrorCode, message: string, readonly retryable = false, readonly retryAfterMs?: number) { super(message); this.name = "AiError"; } }
export function sanitizeProviderError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  return new AiError("PROVIDER_UNAVAILABLE", "The AI provider is temporarily unavailable.", true);
}
