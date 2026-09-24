-- CreateEnum
CREATE TYPE "AiUsageStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreditReservationStatus" AS ENUM ('ACTIVE', 'SETTLED', 'RELEASED');

-- CreateEnum
CREATE TYPE "CreditLedgerEntryType" AS ENUM ('GRANT', 'RESERVATION', 'RELEASE', 'CONSUMPTION', 'ADJUSTMENT', 'REFUND');

-- CreateTable
CREATE TABLE "ai_usage_events" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "projectId" UUID,
    "environmentId" UUID,
    "provider" VARCHAR(40) NOT NULL,
    "providerModel" VARCHAR(160) NOT NULL,
    "logicalModelRole" VARCHAR(40) NOT NULL,
    "operationType" VARCHAR(100) NOT NULL,
    "idempotencyKey" VARCHAR(160) NOT NULL,
    "providerRequestId" VARCHAR(255),
    "inputTokens" INTEGER,
    "cachedInputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "providerCostMicros" BIGINT,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "pricingVersion" VARCHAR(160),
    "creditsChargedUnits" BIGINT NOT NULL DEFAULT 0,
    "status" "AiUsageStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "failureCode" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ai_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_accounts" (
    "organizationId" UUID NOT NULL,
    "availableBalanceUnits" BIGINT NOT NULL DEFAULT 0,
    "reservedBalanceUnits" BIGINT NOT NULL DEFAULT 0,
    "lifetimeGrantedUnits" BIGINT NOT NULL DEFAULT 0,
    "lifetimeConsumedUnits" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_accounts_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "ai_usage_reservations" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "usageEventId" UUID NOT NULL,
    "reservedUnits" BIGINT NOT NULL,
    "settledUnits" BIGINT,
    "status" "CreditReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "ai_usage_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_ledger_entries" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "usageEventId" UUID,
    "reservationId" UUID,
    "type" "CreditLedgerEntryType" NOT NULL,
    "amountUnits" BIGINT NOT NULL,
    "referenceType" VARCHAR(80) NOT NULL,
    "referenceId" VARCHAR(160) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_events_organizationId_createdAt_idx" ON "ai_usage_events"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_events_userId_createdAt_idx" ON "ai_usage_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_events_projectId_createdAt_idx" ON "ai_usage_events"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_events_operationType_createdAt_idx" ON "ai_usage_events"("operationType", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_events_status_createdAt_idx" ON "ai_usage_events"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_events_organizationId_userId_operationType_idempot_key" ON "ai_usage_events"("organizationId", "userId", "operationType", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_reservations_usageEventId_key" ON "ai_usage_reservations"("usageEventId");

-- CreateIndex
CREATE INDEX "ai_usage_reservations_organizationId_status_idx" ON "ai_usage_reservations"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ai_usage_reservations_userId_createdAt_idx" ON "ai_usage_reservations"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_ledger_entries_organizationId_createdAt_idx" ON "credit_ledger_entries"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "credit_ledger_entries_usageEventId_idx" ON "credit_ledger_entries"("usageEventId");

-- CreateIndex
CREATE INDEX "credit_ledger_entries_reservationId_idx" ON "credit_ledger_entries"("reservationId");

-- CreateIndex
CREATE INDEX "credit_ledger_entries_type_createdAt_idx" ON "credit_ledger_entries"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "project_environments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_accounts" ADD CONSTRAINT "credit_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_reservations" ADD CONSTRAINT "ai_usage_reservations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_reservations" ADD CONSTRAINT "ai_usage_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_reservations" ADD CONSTRAINT "ai_usage_reservations_usageEventId_fkey" FOREIGN KEY ("usageEventId") REFERENCES "ai_usage_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_usageEventId_fkey" FOREIGN KEY ("usageEventId") REFERENCES "ai_usage_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_ledger_entries" ADD CONSTRAINT "credit_ledger_entries_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "ai_usage_reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
