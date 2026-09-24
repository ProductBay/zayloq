import type { AiCostEstimate } from "./cost-accounting.js";

export const CREDIT_UNIT_SCALE = BigInt(1_000_000);
export interface CreditCharge { units: bigint; policyVersion: string; }
export interface CreditPricingPolicy { calculate(cost: AiCostEstimate): CreditCharge; }
export class CostPlusCreditPolicy implements CreditPricingPolicy {
  constructor(private readonly config: { unitsPerCurrencyMicro: bigint; markupBasisPoints: bigint; minimumChargeUnits: bigint; version: string }) {
    if (config.unitsPerCurrencyMicro < BigInt(0) || config.markupBasisPoints < BigInt(0) || config.minimumChargeUnits < BigInt(0)) throw new Error("Credit pricing values must be non-negative.");
  }
  calculate(cost: AiCostEstimate): CreditCharge {
    const numerator = cost.amountMicros * this.config.unitsPerCurrencyMicro * this.config.markupBasisPoints;
    const calculated = numerator === BigInt(0) ? BigInt(0) : (numerator + BigInt(9_999)) / BigInt(10_000);
    return { units: calculated < this.config.minimumChargeUnits ? this.config.minimumChargeUnits : calculated, policyVersion: this.config.version };
  }
}
