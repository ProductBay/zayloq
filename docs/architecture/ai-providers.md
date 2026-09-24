# AI provider architecture

Zayloq product code calls the provider-neutral `AiGateway`, normally through `MeteredAiGateway`. The gateway owns request policy, timeouts, cancellation, retries, concurrency, model resolution, and safe telemetry. `AiProviderRegistry` contains server-side adapters and is the only provider lookup boundary.

Requests may select `OPENAI` or `GEMINI` explicitly; otherwise `AI_DEFAULT_PROVIDER` is used. `ModelResolver` maps `FAST`, `REASONING`, and `GENERATION` to provider-specific configured model identifiers. This keeps application and future builder logic independent of provider request formats and leaves room for additional registry adapters.

## Adapters and structured output

The OpenAI adapter uses the Responses API. The Gemini adapter uses Google's current `@google/genai` SDK. Both translate Zayloq messages, system instructions, output limits, temperature, and cancellation into provider requests and return only the normalized Zayloq response.

For structured output, adapters send the caller's JSON Schema where supported, parse the returned JSON, and independently validate it with the original Zod schema. Provider claims of schema compliance are never trusted on their own.

Gemini usage normalization maps `promptTokenCount` to input tokens, `cachedContentTokenCount` to cached input, `candidatesTokenCount` to output, and `totalTokenCount` to total. Missing values remain absent. Gemini thought-token metadata is not mapped into a fabricated category; the provider-supplied total is retained when present.

## Metering and pricing

Every billable provider operation must use `MeteredAiGateway`. Before creating a reservation or contacting a provider, metering confirms that an effective price exists for the selected provider/model. This prevents unpriced Gemini or OpenAI consumption. On success, actual provider/model identity and normalized usage are persisted, cost is calculated from the effective-dated catalog, and the reservation is settled through the same credit ledger used by every provider.

The caller must supply a conservative reservation amount and the same provider/model selected for execution. A mismatch is rejected. Historical events retain the applied catalog and credit-policy versions.

## Failure and fallback behavior

The gateway retries bounded transient errors from the selected provider. Authentication, configuration, rejected requests, and invalid structured output are non-retryable. Automatic cross-provider fallback is deliberately deferred: the current reservation represents one provider/model price envelope, and silently switching models could invalidate the reservation or create ambiguous partial-provider billing. Callers can make a new, explicitly attributed and idempotent operation after a safely recorded failure.

Google documents that aborting the client request does not guarantee cancellation at the service and applicable usage may still be charged. The current normalized error contract does not provide a verified usage receipt on cancellation, so cancelled operations release their reservation; provider reconciliation is a known limitation to address with asynchronous provider receipts.

## Security and diagnostics

Provider keys stay in validated server configuration. They are never included in browser variables, API DTOs, database rows, Redis values, or diagnostic responses. Logging redacts `OPENAI_API_KEY`, `GEMINI_API_KEY`, authorization values, API-key fields, and `x-goog-api-key` headers. Prompts, generated source, and raw SDK responses are not logged.

Diagnostics report only `configured` or `not_configured` per provider. The Gemini smoke harness is excluded from normal tests and requires `ZAYLOQ_RUN_REAL_GEMINI_SMOKE=true`; it also requires configured effective pricing and executes through the metered gateway.
