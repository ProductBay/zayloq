import type { AiUsage } from "../contracts/types.js";
import { AiError } from "../errors/ai-error.js";
import { z } from "zod";
export interface AiPriceRecord { provider: string; model: string; effectiveFrom: Date; currency: string; inputMicrosPerMillion: bigint; cachedInputMicrosPerMillion?: bigint; outputMicrosPerMillion: bigint; version: string; }
export interface AiCostEstimate { currency: string; amountMicros: bigint; pricingVersion: string; }
export interface AiCostCalculator { estimate(input: { provider: string; model: string; usage: AiUsage; at: Date }): AiCostEstimate; }
export interface AiPricingCatalog { findPrice(provider: string, model: string, at: Date): AiPriceRecord | undefined; }
export class StaticAiPricingCatalog implements AiPricingCatalog {
  constructor(private readonly prices: readonly AiPriceRecord[]) {}
  findPrice(provider: string, model: string, at: Date) { return this.prices.filter((price) => price.provider === provider && price.model === model && price.effectiveFrom <= at).sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0]; }
}
const serializedPrice = z.object({ provider: z.string().min(1), model: z.string().min(1), effectiveFrom: z.iso.datetime(), currency: z.string().length(3), inputMicrosPerMillion: z.string().regex(/^\d+$/), cachedInputMicrosPerMillion: z.string().regex(/^\d+$/).optional(), outputMicrosPerMillion: z.string().regex(/^\d+$/), version: z.string().min(1) }).strict();
export function pricingCatalogFromJson(value: string): StaticAiPricingCatalog {
  let decoded: unknown; try { decoded = JSON.parse(value); } catch { throw new AiError("CONFIGURATION_ERROR", "AI pricing catalog JSON is invalid."); }
  const parsed = z.array(serializedPrice).safeParse(decoded); if (!parsed.success) throw new AiError("CONFIGURATION_ERROR", "AI pricing catalog is invalid.");
  return new StaticAiPricingCatalog(parsed.data.map((price) => ({ ...price, effectiveFrom: new Date(price.effectiveFrom), inputMicrosPerMillion: BigInt(price.inputMicrosPerMillion), cachedInputMicrosPerMillion: price.cachedInputMicrosPerMillion === undefined ? undefined : BigInt(price.cachedInputMicrosPerMillion), outputMicrosPerMillion: BigInt(price.outputMicrosPerMillion) })));
}
const million = BigInt(1_000_000);
const ceilDiv = (value: bigint, divisor: bigint) => (value + divisor - BigInt(1)) / divisor;
export class CatalogAiCostCalculator implements AiCostCalculator {
  constructor(private readonly catalog: AiPricingCatalog) {}
  estimate({ provider, model, usage, at }: { provider: string; model: string; usage: AiUsage; at: Date }): AiCostEstimate {
    const price = this.catalog.findPrice(provider, model, at);
    if (!price) throw new AiError("MISSING_PRICE", `No active price is configured for ${provider}/${model}.`);
    if (usage.inputTokens === undefined || usage.outputTokens === undefined) throw new AiError("USAGE_UNAVAILABLE", "Provider token usage is required for billing.");
    const cached = usage.cachedInputTokens ?? 0;
    if (![usage.inputTokens, usage.outputTokens, cached].every(Number.isSafeInteger) || cached < 0 || cached > usage.inputTokens) throw new AiError("USAGE_UNAVAILABLE", "Provider token usage is invalid.");
    const amountMicros = ceilDiv(BigInt(usage.inputTokens - cached) * price.inputMicrosPerMillion, million) + ceilDiv(BigInt(cached) * (price.cachedInputMicrosPerMillion ?? price.inputMicrosPerMillion), million) + ceilDiv(BigInt(usage.outputTokens) * price.outputMicrosPerMillion, million);
    return { currency: price.currency, amountMicros, pricingVersion: price.version };
  }
}
