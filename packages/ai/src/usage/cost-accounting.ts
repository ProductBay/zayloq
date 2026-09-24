import type { AiUsage } from "../contracts/types.js";
export interface AiCostEstimate { currency: string; amount: string; pricingVersion: string; }
export interface AiCostCalculator { estimate(input: { provider: string; model: string; usage: AiUsage; at: Date }): AiCostEstimate | null; }
export class UnconfiguredCostCalculator implements AiCostCalculator { estimate(): null { return null; } }
