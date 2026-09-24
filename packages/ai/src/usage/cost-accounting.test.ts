import assert from "node:assert/strict";
import test from "node:test";
import { AiError } from "../errors/ai-error.js";
import { CatalogAiCostCalculator, StaticAiPricingCatalog } from "./cost-accounting.js";
import { CostPlusCreditPolicy } from "./credit-pricing.js";
const calculator = new CatalogAiCostCalculator(new StaticAiPricingCatalog([{ provider: "OPENAI", model: "test-model", effectiveFrom: new Date("2026-01-01"), currency: "USD", inputMicrosPerMillion: BigInt(2_000_000), cachedInputMicrosPerMillion: BigInt(500_000), outputMicrosPerMillion: BigInt(8_000_000), version: "fixture-v1" }]));
test("cost calculator prices ordinary, cached, and output tokens precisely", () => {
  const result = calculator.estimate({ provider: "OPENAI", model: "test-model", at: new Date("2026-02-01"), usage: { inputTokens: 1_000, cachedInputTokens: 400, outputTokens: 200 } });
  assert.deepEqual(result, { currency: "USD", amountMicros: BigInt(3_000), pricingVersion: "fixture-v1" });
});
test("cost calculator fails closed without an active price", () => assert.throws(() => calculator.estimate({ provider: "OPENAI", model: "missing", at: new Date(), usage: { inputTokens: 1, outputTokens: 1 } }), (error) => error instanceof AiError && error.code === "MISSING_PRICE"));
test("cost-plus policy uses integer units, markup, and minimum", () => {
  const policy = new CostPlusCreditPolicy({ unitsPerCurrencyMicro: BigInt(2), markupBasisPoints: BigInt(12_500), minimumChargeUnits: BigInt(5), version: "default-v1" });
  assert.equal(policy.calculate({ currency: "USD", amountMicros: BigInt(10), pricingVersion: "x" }).units, BigInt(25));
  assert.equal(policy.calculate({ currency: "USD", amountMicros: BigInt(0), pricingVersion: "x" }).units, BigInt(5));
});
