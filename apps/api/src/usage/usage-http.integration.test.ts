import assert from "node:assert/strict";
import { test } from "node:test";
import { connectDatabase, disconnectDatabase, getDatabaseClient } from "@zayloq/database";
import { loadEnvironment } from "@zayloq/config";
import { UsageAccountingService } from "@zayloq/ai";
import { buildApp } from "../app.js";
import { MemoryAuthTokenDelivery } from "../auth/delivery.js";
import type { AuthRateLimiter } from "../auth/rate-limiter.js";
const run = process.env.AI_USAGE_HTTP_INTEGRATION_TEST === "1"; const origin = "http://localhost:3001";
const limiter: AuthRateLimiter = { consume: async (request) => ({ allowed: true, remaining: request.limit - 1, retryAfterSeconds: request.windowSeconds }) };
const cookie = (response: { headers: Record<string, string | string[] | number | undefined> }) => String(response.headers["set-cookie"]).split(";", 1)[0]!;
test("usage and credit endpoints authorize, isolate tenants, and return persisted DTOs", { skip: !run, timeout: 180_000 }, async () => {
  await connectDatabase(); const db = getDatabaseClient(); const key = crypto.randomUUID(); const emails = [`usage-a-${key}@example.test`, `usage-b-${key}@example.test`]; const environment = loadEnvironment({ ...process.env, NODE_ENV: "test", ZAYLOQ_ENV: "test", AUTH_TRUSTED_ORIGINS: origin }); const app = await buildApp({ environment, delivery: new MemoryAuthTokenDelivery(), limiter, logger: false });
  try {
    const registered = await Promise.all(emails.map((email) => app.inject({ method: "POST", url: "/v1/auth/register", headers: { origin }, payload: { email, password: "correct horse battery staple usage" } }))); assert.deepEqual(registered.map((response) => response.statusCode), [201, 201]); const sessions = registered.map(cookie); await Promise.all(sessions.map((session, index) => app.inject({ method: "POST", url: "/v1/projects", headers: { origin, cookie: session }, payload: { name: `Usage fixture ${index}` } })));
    const memberships = await Promise.all(emails.map((email) => db.membership.findFirstOrThrow({ where: { user: { email } } }))); const accounting = new UsageAccountingService(db); await accounting.grantForTesting(memberships[0]!.organizationId, BigInt(100), key); const reserved = await accounting.createAndReserve({ organizationId: memberships[0]!.organizationId, userId: memberships[0]!.userId, provider: "OPENAI", model: "fixture", logicalModelRole: "FAST", operationType: "HTTP_TEST", idempotencyKey: key, reservationUnits: BigInt(50) }); await accounting.settle(memberships[0]!.organizationId, reserved.reservation.id, BigInt(20), { inputTokens: 2, outputTokens: 1, totalTokens: 3, providerCostMicros: BigInt(10), currency: "USD", pricingVersion: "fixture", retryCount: 0, latencyMs: 1 });
    assert.equal((await app.inject({ method: "GET", url: `/v1/ai/usage?organizationId=${memberships[0]!.organizationId}` })).statusCode, 401);
    const usage = await app.inject({ method: "GET", url: `/v1/ai/usage?organizationId=${memberships[0]!.organizationId}`, headers: { cookie: sessions[0] } }); assert.equal(usage.statusCode, 200); assert.equal(usage.json().usage[0].totalTokens, 3);
    const credits = await app.inject({ method: "GET", url: `/v1/billing/credits?organizationId=${memberships[0]!.organizationId}`, headers: { cookie: sessions[0] } }); assert.equal(credits.json().credits.availableBalanceUnits, "80");
    const ledger = await app.inject({ method: "GET", url: `/v1/billing/credits/ledger?organizationId=${memberships[0]!.organizationId}`, headers: { cookie: sessions[0] } }); assert.equal(ledger.json().ledger.length, 4);
    assert.equal((await app.inject({ method: "GET", url: `/v1/ai/usage?organizationId=${memberships[0]!.organizationId}`, headers: { cookie: sessions[1] } })).statusCode, 404);
  } finally { await app.close(); await db.organization.deleteMany({ where: { memberships: { some: { user: { email: { in: emails } } } } } }); await db.user.deleteMany({ where: { email: { in: emails } } }); await disconnectDatabase(); }
});
