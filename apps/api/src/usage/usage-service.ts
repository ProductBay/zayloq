import { prisma } from "@zayloq/database";
import { ApiError } from "../auth/api-errors.js";

const bigint = (value: bigint | null) => value === null ? null : value.toString();
export class UsageReadService {
  private async authorize(userId: string, organizationId: string) {
    if (!await prisma.membership.findUnique({ where: { userId_organizationId: { organizationId, userId } }, select: { id: true } })) throw new ApiError(404, "NOT_FOUND", "Organization not found.");
  }
  async list(userId: string, organizationId: string) {
    await this.authorize(userId, organizationId);
    const rows = await prisma.aiUsageEvent.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 });
    return rows.map(this.usageDto);
  }
  async get(userId: string, organizationId: string, usageId: string) {
    await this.authorize(userId, organizationId);
    const row = await prisma.aiUsageEvent.findFirst({ where: { id: usageId, organizationId } });
    if (!row) throw new ApiError(404, "NOT_FOUND", "Usage event not found.");
    return this.usageDto(row);
  }
  async credits(userId: string, organizationId: string) {
    await this.authorize(userId, organizationId);
    const row = await prisma.creditAccount.findUnique({ where: { organizationId } });
    return row ? { organizationId, availableBalanceUnits: bigint(row.availableBalanceUnits), reservedBalanceUnits: bigint(row.reservedBalanceUnits), lifetimeGrantedUnits: bigint(row.lifetimeGrantedUnits), lifetimeConsumedUnits: bigint(row.lifetimeConsumedUnits), updatedAt: row.updatedAt } : { organizationId, availableBalanceUnits: "0", reservedBalanceUnits: "0", lifetimeGrantedUnits: "0", lifetimeConsumedUnits: "0", updatedAt: null };
  }
  async ledger(userId: string, organizationId: string) {
    await this.authorize(userId, organizationId);
    const rows = await prisma.creditLedgerEntry.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: 100 });
    return rows.map((row) => ({ id: row.id, type: row.type, amountUnits: bigint(row.amountUnits), referenceType: row.referenceType, referenceId: row.referenceId, category: row.category, description: row.description, usageEventId: row.usageEventId, createdAt: row.createdAt }));
  }
  private usageDto(row: Awaited<ReturnType<typeof prisma.aiUsageEvent.findFirst>> & {}) {
    if (!row) throw new Error("Usage event is required.");
    return { id: row.id, organizationId: row.organizationId, userId: row.userId, projectId: row.projectId, environmentId: row.environmentId, provider: row.provider, providerModel: row.providerModel, logicalModelRole: row.logicalModelRole, operationType: row.operationType, providerRequestId: row.providerRequestId, inputTokens: row.inputTokens, cachedInputTokens: row.cachedInputTokens, outputTokens: row.outputTokens, totalTokens: row.totalTokens, providerCostMicros: bigint(row.providerCostMicros), currency: row.currency, creditsChargedUnits: bigint(row.creditsChargedUnits), status: row.status, retryCount: row.retryCount, latencyMs: row.latencyMs, createdAt: row.createdAt, completedAt: row.completedAt };
  }
}
