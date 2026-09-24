import type { AiProviderName, AiRequest, AiResponse, AiStructuredRequest } from "../contracts/types.js";
import { sanitizeProviderError } from "../errors/ai-error.js";
import type { AiGateway } from "../gateway/ai-gateway.js";
import type { AiCostCalculator } from "./cost-accounting.js";
import type { CreditPricingPolicy } from "./credit-pricing.js";
import { UsageAccountingService } from "./usage-accounting.js";

export interface BillingContext { organizationId: string; userId: string; projectId?: string; environmentId?: string; operationType: string; idempotencyKey: string; reservationUnits: bigint; provider: AiProviderName; model: string; }
type Logger = { info(values: object, message: string): void; warn(values: object, message: string): void };
const silent: Logger = { info() {}, warn() {} };
export class MeteredAiGateway {
  constructor(private readonly gateway: AiGateway, private readonly accounting: UsageAccountingService, private readonly costs: AiCostCalculator, private readonly credits: CreditPricingPolicy, private readonly logger: Logger = silent) {}
  generateText(request: AiRequest, billing: BillingContext) { return this.execute(request, billing, () => this.gateway.generateText(request)); }
  generateStructured<T>(request: AiStructuredRequest<T>, billing: BillingContext) { return this.execute(request, billing, () => this.gateway.generateStructured(request)); }
  private async execute<T>(request: AiRequest, billing: BillingContext, operation: () => Promise<AiResponse<T>>) {
    const target = this.gateway.resolveTarget(request); if (target.provider !== billing.provider || target.model !== billing.model) throw new Error("AI execution target and billing target must match.");
    this.costs.estimate({ provider: target.provider, model: target.model, usage: { inputTokens: 0, outputTokens: 0 }, at: new Date() });
    const { usage, reservation } = await this.accounting.createAndReserve({ ...billing, logicalModelRole: request.modelRole });
    let response: AiResponse<T>;
    try {
      response = await operation();
    } catch (cause) {
      const error = sanitizeProviderError(cause);
      await this.accounting.release(billing.organizationId, reservation.id, error.code).catch(() => undefined);
      this.logger.warn({ usageEventId: usage.id, organizationId: billing.organizationId, projectId: billing.projectId, logicalRole: request.modelRole, provider: billing.provider, operationType: billing.operationType, status: "FAILED", code: error.code }, "Metered AI operation failed.");
      throw error;
    }
    const providerCost = this.costs.estimate({ provider: response.provider, model: response.model, usage: response.usage, at: usage.createdAt });
    const charge = this.credits.calculate(providerCost);
    await this.accounting.settle(billing.organizationId, reservation.id, charge.units, { provider: response.provider, model: response.model, providerRequestId: response.requestId, ...response.usage, providerCostMicros: providerCost.amountMicros, currency: providerCost.currency, pricingVersion: `${providerCost.pricingVersion}/${charge.policyVersion}`, retryCount: response.retryCount, latencyMs: response.latencyMs });
    this.logger.info({ usageEventId: usage.id, organizationId: billing.organizationId, projectId: billing.projectId, logicalRole: request.modelRole, provider: response.provider, operationType: billing.operationType, status: "COMPLETED", latencyMs: response.latencyMs, ...response.usage, creditAmountUnits: charge.units.toString() }, "Metered AI operation completed.");
    return response;
  }
}
