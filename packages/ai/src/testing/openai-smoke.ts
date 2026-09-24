import { getAiConfigurationState, loadAiBillingEnvironment, loadAiEnvironment } from "@zayloq/config";
import { getDatabaseClient } from "@zayloq/database";
import { createAiGateway } from "../gateway/factory.js";
import { CatalogAiCostCalculator, pricingCatalogFromJson } from "../usage/cost-accounting.js";
import { CostPlusCreditPolicy } from "../usage/credit-pricing.js";
import { MeteredAiGateway } from "../usage/metered-ai-gateway.js";
import { UsageAccountingService } from "../usage/usage-accounting.js";
if (process.env.AI_OPENAI_SMOKE !== "1") { console.log("OpenAI billing smoke: SKIPPED (set AI_OPENAI_SMOKE=1 to opt in)."); process.exit(0); }
const state = getAiConfigurationState();
if (!state.configured) { console.log("OpenAI smoke: SKIPPED (AI configuration unavailable)."); process.exit(0); }
const config = loadAiEnvironment(); const billing = loadAiBillingEnvironment(); const db = getDatabaseClient(); const accounting = new UsageAccountingService(db); const key = crypto.randomUUID();
const user = await db.user.create({ data: { email: `ai-smoke-${key}@example.test` } }); const organization = await db.organization.create({ data: { name: "AI smoke fixture", slug: `ai-smoke-${key}` } }); await db.membership.create({ data: { userId: user.id, organizationId: organization.id, role: "OWNER" } }); await accounting.grantForTesting(organization.id, BigInt(10_000_000), key);
try {
  const gateway = await createAiGateway(config); const metered = new MeteredAiGateway(gateway, accounting, new CatalogAiCostCalculator(pricingCatalogFromJson(billing.AI_PRICING_CATALOG_JSON)), new CostPlusCreditPolicy({ unitsPerCurrencyMicro: BigInt(billing.AI_CREDIT_UNITS_PER_CURRENCY_MICRO), markupBasisPoints: BigInt(billing.AI_CREDIT_MARKUP_BPS), minimumChargeUnits: BigInt(billing.AI_CREDIT_MIN_CHARGE_UNITS), version: "configured-v1" }));
  const result = await metered.generateText({ task: "text", modelRole: "FAST", provider: "OPENAI", system: "Follow the user's exact output instruction.", messages: [{ role: "user", content: "Return exactly the word ZAYLOQ_READY." }], maxOutputTokens: 16 }, { organizationId: organization.id, userId: user.id, operationType: "OPENAI_SMOKE", idempotencyKey: key, reservationUnits: BigInt(10_000_000), provider: "OPENAI", model: config.AI_FAST_MODEL! });
  if (result.output.trim() !== "ZAYLOQ_READY") throw new Error("OpenAI smoke response did not match the expected value."); const event = await db.aiUsageEvent.findFirstOrThrow({ where: { organizationId: organization.id, operationType: "OPENAI_SMOKE" } }); console.log(JSON.stringify({ provider: result.provider, model: result.model, success: true, latencyMs: result.latencyMs, usage: result.usage, providerCostMicros: event.providerCostMicros?.toString(), creditUnits: event.creditsChargedUnits.toString() }));
} finally { if (process.env.AI_SMOKE_CLEANUP === "1") { await db.organization.delete({ where: { id: organization.id } }); await db.user.delete({ where: { id: user.id } }); } }
