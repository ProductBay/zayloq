# AI provider gateway

## Fast-track boundary

`@zayloq/ai` is the server-only intelligence boundary for the fast-track builder pipeline: planner, file generation, isolated build, autonomous repair, and live preview. A'Dash knowledge ingestion, repository ingestion, RAG, embeddings, vector storage, capability registry, and fine-tuning are explicitly deferred. The Studio never imports the OpenAI SDK or calls a provider directly.

The future call chain is `Studio -> API -> planning/generation service -> AI Gateway -> provider`. Long-running generation will use the same package from the worker.

## Provider abstraction and registry

Application code uses `AiGateway`, `AiRequest`, `AiStructuredRequest`, and normalized `AiResponse`; it never receives OpenAI SDK objects. `AiProviderRegistry` currently registers only `OPENAI`, while the interface permits later Anthropic, Google, local, or specialized adapters without changing planner or generator services. The deterministic `TestAiProvider` exists only under the testing directory.

The OpenAI adapter uses the official Node SDK Responses API with server-side credentials and `store: false`. Text uses `output_text`. Structured generation uses Responses `text.format` JSON Schema and then independently validates decoded output with the caller's Zod schema. This follows the official [text generation](https://developers.openai.com/api/docs/guides/text) and [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) guidance.

## Logical models and configuration

Business code selects `FAST`, `REASONING`, or `GENERATION`. `ModelResolver` maps those roles to `AI_FAST_MODEL`, `AI_REASONING_MODEL`, and `AI_GENERATION_MODEL`; no model identifier is embedded in application logic. `AI_DEFAULT_PROVIDER`, timeouts, maximum output tokens, maximum request characters, retry attempts, and concurrency limits are centralized in `@zayloq/config`.

General API/worker configuration remains loadable without AI credentials. `loadAiEnvironment` fails closed only when an AI-enabled path is constructed. `getAiConfigurationState` reports booleans and provider name without exposing keys or model identifiers. `/ready` remains database/Redis readiness and never probes OpenAI.

## Request and response contracts

Requests keep system instructions separate from user/assistant messages and carry task, logical role, optional temperature/output budget, timeout, signal, and internal attribution. Attribution can name user, organization, project, environment, and operation but is used only for concurrency and safe telemetry; it is not sent to OpenAI.

Responses normalize provider, resolved model, typed output, finish state, available token usage, latency, provider request ID, and retry count. Missing token counts remain missing. Usage is not money, and `AiCostCalculator` is a separate unconfigured boundary so pricing can later be versioned rather than hardcoded.

## Reliability

Every request receives a combined configurable timeout and caller cancellation signal. Errors normalize to configuration, unknown provider, request size, concurrency, timeout, cancellation, throttling, provider unavailable, invalid response, or provider rejection categories. Raw provider exceptions are never propagated.

Only explicitly retryable transient failures are retried, with bounded attempts and backoff. Authentication, policy, invalid request, and schema-validation failures are not retried. SDK retries are disabled so the gateway owns amplification policy.

Redis concurrency acquisition atomically enforces global, organization, and user counters with expiring leases; release is idempotent. An in-memory implementation supports isolated tests. This is concurrency protection, not a quota or billing system.

## Security and observability

Request policy rejects empty messages and oversized combined system/message content. Secrets are never interpolated into prompts. OpenAI keys come only from server environment configuration and are never written to PostgreSQL or Redis. Observability redacts OpenAI keys, generic API keys, authorization/cookie fields, provider secrets, tokens, and credentials.

Telemetry contains provider, logical role, resolved configured model, operation/task, message count, input character count, safe attribution, latency, success/failure category, retries, and provider-supplied token usage. Full prompts, outputs, credentials, and future proprietary context are not logged.

## Diagnostics and smoke testing

`getAiConfigurationState` is the non-network diagnostic. `npm run smoke:openai --workspace @zayloq/ai` makes exactly one tiny request only when complete AI configuration is present and validates the exact response `ZAYLOQ_READY`; otherwise it prints `SKIPPED`. It never prints the key, authorization, prompts, or raw SDK response.

Automated tests use the test provider and mocked SDK transport, never paid network requests.

## Known limitations

Streaming, persistent usage/cost records, distributed quotas, pricing tables, provider fallback, circuit breakers, planner/generator orchestration, durable jobs, RAG/knowledge systems, generated files, build runtime, repair, and preview are deferred. The non-streaming primitives are sufficient for ZP-1B planning and ZP-1C generation to begin behind worker/API services.
