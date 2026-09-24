import assert from "node:assert/strict";
import { test } from "node:test";
import { connectDatabase, disconnectDatabase, getDatabaseClient } from "@zayloq/database";
import { loadEnvironment } from "@zayloq/config";
import { buildApp } from "../app.js";
import { MemoryAuthTokenDelivery } from "../auth/delivery.js";
import type { AuthRateLimiter } from "../auth/rate-limiter.js";

const run = process.env.CONTROL_PLANE_HTTP_INTEGRATION_TEST === "1"; const origin = "http://localhost:3001";
const limiter: AuthRateLimiter = { consume: async (request) => ({ allowed: true, remaining: request.limit - 1, retryAfterSeconds: request.windowSeconds }) };
function cookie(response: { headers: Record<string, string | string[] | number | undefined> }) { const value = response.headers["set-cookie"]; return String(Array.isArray(value) ? value[0] : value).split(";", 1)[0]!; }
test("real authenticated project HTTP lifecycle and cross-tenant rejection", { skip: !run, timeout: 180_000 }, async () => {
  await connectDatabase(); const db = getDatabaseClient(); const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`; const emails = [`studio-a-${unique}@example.test`, `studio-b-${unique}@example.test`];
  const environment = loadEnvironment({ ...process.env, NODE_ENV: "test", ZAYLOQ_ENV: "test", AUTH_TRUSTED_ORIGINS: origin }); const app = await buildApp({ environment, delivery: new MemoryAuthTokenDelivery(), limiter, logger: false }); const headers = (session?: string) => ({ origin, ...(session ? { cookie: session } : {}) });
  try {
    const registrations = await Promise.all(emails.map((email, index) => app.inject({ method: "POST", url: "/v1/auth/register", headers: headers(), payload: { email, password: "correct horse battery staple control plane", displayName: `Tenant ${index + 1}` } })));
    assert.deepEqual(registrations.map(({ statusCode }) => statusCode), [201, 201]); const [sessionA, sessionB] = registrations.map(cookie);
    assert.equal((await app.inject({ method: "GET", url: "/v1/projects" })).statusCode, 401);
    assert.equal((await app.inject({ method: "GET", url: "/v1/projects/not-a-uuid", headers: headers(sessionA) })).statusCode, 400);
    assert.equal((await app.inject({ method: "POST", url: "/v1/projects", headers: headers(sessionA), payload: { name: "" } })).statusCode, 400);
    const created = await app.inject({ method: "POST", url: "/v1/projects", headers: headers(sessionA), payload: { name: "Persistent studio", prompt: "Build a durable customer portal" } });
    assert.equal(created.statusCode, 201); const body = created.json(); const projectId = body.project.id as string; assert.equal(body.promptPersisted, false); assert.equal(body.environment.type, "DEVELOPMENT");
    const membership = await db.membership.findFirstOrThrow({ where: { user: { email: emails[0] } }, include: { organization: true } }); assert.equal(membership.role, "OWNER");
    assert.equal((await app.inject({ method: "GET", url: `/v1/projects/${projectId}`, headers: headers(sessionA) })).statusCode, 200);
    for (const method of ["GET", "PATCH", "POST"] as const) { const url = method === "POST" ? `/v1/projects/${projectId}/archive` : `/v1/projects/${projectId}`; const response = await app.inject({ method, url, headers: headers(sessionB), ...(method === "PATCH" ? { payload: { name: "Cross tenant" } } : {}) }); assert.equal(response.statusCode, 404); }
    assert.equal((await app.inject({ method: "GET", url: `/v1/projects/${projectId}/environments`, headers: headers(sessionB) })).statusCode, 404);
    const renamed = await app.inject({ method: "PATCH", url: `/v1/projects/${projectId}`, headers: headers(sessionA), payload: { name: "Persistent studio renamed" } }); assert.equal(renamed.json().project.name, "Persistent studio renamed");
    assert.equal((await app.inject({ method: "GET", url: `/v1/projects/${projectId}`, headers: headers(sessionA) })).json().project.name, "Persistent studio renamed");
    assert.equal((await app.inject({ method: "POST", url: `/v1/projects/${projectId}/archive`, headers: headers(sessionA) })).statusCode, 200);
    assert.equal((await app.inject({ method: "GET", url: "/v1/projects", headers: headers(sessionA) })).json().projects.length, 0);
    assert.equal((await db.projectEnvironment.count({ where: { projectId, type: "DEVELOPMENT" } })), 1);
  } finally { await app.close(); await db.user.deleteMany({ where: { email: { in: emails } } }); await disconnectDatabase(); }
});
