# AI usage, billing, and credits

Zayloq places `MeteredAiGateway` between product operations and the provider-neutral AI gateway. A caller supplies authenticated tenant attribution, an operation type, a database-backed idempotency key, and a conservative maximum credit reservation. The service validates membership and project/environment ownership, creates a pending usage event, reserves credits, calls the gateway, stores normalized usage, and atomically settles the actual charge.

## Precision and pricing

Provider cost is stored as integer currency micro-units (`providerCostMicros`); credit values are integer credit units. One display credit is currently `1,000,000` units. No financial path uses floating point. Every completed event stores the price-catalog version and applied provider cost, so historical entries are never repriced.

`AiPricingCatalog` selects the newest provider/model record whose effective date is not later than the request. Records separately price normal input, cached input, and output tokens per million. Missing prices or missing required provider usage fail closed. Production prices are configuration/data, not constants in application logic. OpenAI reports cached input separately, and output-token totals can include non-visible reasoning tokens; the normalized provider response is therefore the accounting source of truth.

The initial `CostPlusCreditPolicy` converts currency micro-units to credit units with configurable units-per-micro, basis-point markup, and minimum operation charge. Its version is stored beside the provider price version. Later plan, promotion, enterprise, and operation-specific policies can implement the same boundary without rewriting ledger history.

## Ledger and reservation invariants

The organization account tracks available, reserved, lifetime-granted, and lifetime-consumed units. A conditional database update moves available funds to reserved funds, preventing concurrent overspend. Settlement requires an active, same-organization reservation, rejects charges above the reservation, moves the actual amount to lifetime consumption, and returns unused units. Failure releases the full reservation. A reservation can be settled or released only once.

Ledger rows are append-only through the domain service. `GRANT`, `RESERVATION`, `CONSUMPTION`, and `RELEASE` entries record signed movements and durable references; `ADJUSTMENT` and `REFUND` are reserved for future internal workflows. There are no public grant or ledger-mutation routes.

## Idempotency, failures, and security

The database unique key `(organizationId, userId, operationType, idempotencyKey)` is the critical idempotency invariant. A replay returns a safe conflict and cannot create another reservation or charge. Read queries always authorize organization membership and scope records by organization; project and environment attribution is validated before funds move.

Provider failures store only a safe error code and release the reservation. Token counts are never fabricated. Because the current gateway error contract does not expose authenticated partial usage, failed requests are fully released; a future provider receipt contract can explicitly settle verified partial usage. If a provider succeeds but pricing or settlement fails, the reservation remains active and the usage event remains pending for reconciliation—funds are not made spendable again after real provider consumption.

Usage records and logs exclude prompts, generated source, API keys, cookies, bearer tokens, and plaintext session material. Structured logs may include tenant/resource identifiers, model role, provider, operation, status, latency, normalized token counts, and integer charge values.

The authenticated read surface is `GET /v1/ai/usage`, `GET /v1/ai/usage/:usageId`, `GET /v1/billing/credits`, and `GET /v1/billing/credits/ledger`, each requiring `organizationId`. Future subscriptions and top-ups should grant funds through privileged internal services and append ledger entries with typed external references.
