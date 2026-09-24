import type { PrismaClient } from "@zayloq/database";
import { AiError } from "../errors/ai-error.js";

export type UsageAttribution = { organizationId: string; userId: string; projectId?: string; environmentId?: string };
export class UsageAccountingService {
  constructor(private readonly db: PrismaClient) {}
  async authorize(input: UsageAttribution) {
    const membership = await this.db.membership.findUnique({ where: { userId_organizationId: { organizationId: input.organizationId, userId: input.userId } }, select: { id: true } });
    if (!membership) throw new AiError("INVALID_ATTRIBUTION", "The user is not a member of the organization.");
    if (input.projectId) {
      const project = await this.db.project.findFirst({ where: { id: input.projectId, organizationId: input.organizationId }, select: { id: true } });
      if (!project) throw new AiError("INVALID_ATTRIBUTION", "The project is outside the organization.");
    }
    if (input.environmentId) {
      const environment = await this.db.projectEnvironment.findFirst({ where: { id: input.environmentId, project: { organizationId: input.organizationId, ...(input.projectId ? { id: input.projectId } : {}) } }, select: { id: true } });
      if (!environment) throw new AiError("INVALID_ATTRIBUTION", "The environment is outside the attributed project.");
    }
  }
  async grantForTesting(organizationId: string, amountUnits: bigint, referenceId = crypto.randomUUID()) {
    if (amountUnits <= BigInt(0)) throw new Error("Grant must be positive.");
    return this.db.$transaction(async (tx) => {
      const account = await tx.creditAccount.upsert({ where: { organizationId }, create: { organizationId, availableBalanceUnits: amountUnits, lifetimeGrantedUnits: amountUnits }, update: { availableBalanceUnits: { increment: amountUnits }, lifetimeGrantedUnits: { increment: amountUnits } } });
      await tx.creditLedgerEntry.create({ data: { organizationId, type: "GRANT", amountUnits, referenceType: "TEST_GRANT", referenceId, category: "CREDIT_GRANT", description: "Internal deterministic test grant" } });
      return account;
    }, { isolationLevel: "Serializable" });
  }
  async createAndReserve(input: UsageAttribution & { provider: string; model: string; logicalModelRole: string; operationType: string; idempotencyKey: string; reservationUnits: bigint }) {
    if (input.reservationUnits < BigInt(0)) throw new Error("Reservation cannot be negative.");
    await this.authorize(input);
    try {
      return await this.db.$transaction(async (tx) => {
        const usage = await tx.aiUsageEvent.create({ data: { organizationId: input.organizationId, userId: input.userId, projectId: input.projectId, environmentId: input.environmentId, provider: input.provider, providerModel: input.model, logicalModelRole: input.logicalModelRole, operationType: input.operationType, idempotencyKey: input.idempotencyKey } });
        await tx.creditAccount.upsert({ where: { organizationId: input.organizationId }, create: { organizationId: input.organizationId }, update: {} });
        const changed = await tx.creditAccount.updateMany({ where: { organizationId: input.organizationId, availableBalanceUnits: { gte: input.reservationUnits } }, data: { availableBalanceUnits: { decrement: input.reservationUnits }, reservedBalanceUnits: { increment: input.reservationUnits } } });
        if (changed.count !== 1) throw new AiError("INSUFFICIENT_CREDITS", "The organization has insufficient credits.");
        const reservation = await tx.aiUsageReservation.create({ data: { organizationId: input.organizationId, userId: input.userId, usageEventId: usage.id, reservedUnits: input.reservationUnits } });
        await tx.creditLedgerEntry.create({ data: { organizationId: input.organizationId, usageEventId: usage.id, reservationId: reservation.id, type: "RESERVATION", amountUnits: -input.reservationUnits, referenceType: "AI_USAGE", referenceId: usage.id, category: "AI_RESERVATION" } });
        return { usage, reservation };
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      const existing = await this.db.aiUsageEvent.findUnique({ where: { organizationId_userId_operationType_idempotencyKey: { organizationId: input.organizationId, userId: input.userId, operationType: input.operationType, idempotencyKey: input.idempotencyKey } }, select: { id: true } });
      if (existing) throw new AiError("IDEMPOTENCY_REPLAY", `Operation already accepted as usage event ${existing.id}.`);
      throw error;
    }
  }
  async settle(organizationId: string, reservationId: string, actualUnits: bigint, usage: { provider?: string; model?: string; providerRequestId?: string; inputTokens?: number; cachedInputTokens?: number; outputTokens?: number; totalTokens?: number; providerCostMicros: bigint; currency: string; pricingVersion: string; retryCount: number; latencyMs: number }) {
    return this.db.$transaction(async (tx) => {
      const reservation = await tx.aiUsageReservation.findFirst({ where: { id: reservationId, organizationId }, include: { usageEvent: true } });
      if (!reservation || reservation.status !== "ACTIVE" || actualUnits < BigInt(0) || actualUnits > reservation.reservedUnits) throw new AiError("BILLING_CONFLICT", "The reservation cannot be settled.");
      const unused = reservation.reservedUnits - actualUnits;
      const changed = await tx.creditAccount.updateMany({ where: { organizationId, reservedBalanceUnits: { gte: reservation.reservedUnits } }, data: { reservedBalanceUnits: { decrement: reservation.reservedUnits }, availableBalanceUnits: { increment: unused }, lifetimeConsumedUnits: { increment: actualUnits } } });
      if (changed.count !== 1) throw new AiError("BILLING_CONFLICT", "Credit account invariant failed.");
      await tx.aiUsageReservation.update({ where: { id: reservation.id }, data: { status: "SETTLED", settledUnits: actualUnits, settledAt: new Date() } });
      const { model, ...normalized } = usage; await tx.aiUsageEvent.update({ where: { id: reservation.usageEventId }, data: { ...normalized, ...(model ? { providerModel: model } : {}), creditsChargedUnits: actualUnits, status: "COMPLETED", completedAt: new Date() } });
      if (actualUnits > BigInt(0)) await tx.creditLedgerEntry.create({ data: { organizationId, usageEventId: reservation.usageEventId, reservationId, type: "CONSUMPTION", amountUnits: -actualUnits, referenceType: "AI_USAGE", referenceId: reservation.usageEventId, category: "AI_CONSUMPTION" } });
      if (unused > BigInt(0)) await tx.creditLedgerEntry.create({ data: { organizationId, usageEventId: reservation.usageEventId, reservationId, type: "RELEASE", amountUnits: unused, referenceType: "AI_USAGE", referenceId: reservation.usageEventId, category: "UNUSED_RESERVATION" } });
    }, { isolationLevel: "Serializable" });
  }
  async release(organizationId: string, reservationId: string, failureCode?: string) {
    return this.db.$transaction(async (tx) => {
      const reservation = await tx.aiUsageReservation.findFirst({ where: { id: reservationId, organizationId } });
      if (!reservation || reservation.status !== "ACTIVE") throw new AiError("BILLING_CONFLICT", "The reservation cannot be released.");
      await tx.creditAccount.update({ where: { organizationId }, data: { reservedBalanceUnits: { decrement: reservation.reservedUnits }, availableBalanceUnits: { increment: reservation.reservedUnits } } });
      await tx.aiUsageReservation.update({ where: { id: reservation.id }, data: { status: "RELEASED", releasedAt: new Date() } });
      await tx.aiUsageEvent.update({ where: { id: reservation.usageEventId }, data: { status: "FAILED", failureCode, completedAt: new Date() } });
      await tx.creditLedgerEntry.create({ data: { organizationId, usageEventId: reservation.usageEventId, reservationId, type: "RELEASE", amountUnits: reservation.reservedUnits, referenceType: "AI_USAGE", referenceId: reservation.usageEventId, category: "FAILED_OPERATION" } });
    }, { isolationLevel: "Serializable" });
  }
}
