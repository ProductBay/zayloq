import assert from "node:assert/strict";
import { test } from "node:test";
import { hashToken } from "@zayloq/auth";
import { loadEnvironment } from "@zayloq/config";
import { connectDatabase, connectRedis, disconnectDatabase, disconnectRedis, getDatabaseClient, getRedisClient } from "@zayloq/database";
import { buildApp } from "../app.js";
import { MemoryAuthTokenDelivery } from "./delivery.js";
import { authRateLimitKey } from "./rate-limiter.js";

const runIntegration = process.env.AUTH_HTTP_INTEGRATION_TEST === "1";
const origin = "http://localhost:3000";
const password = "correct horse battery staple http old";
const newPassword = "correct horse battery staple http new";
function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const value = response.headers["set-cookie"];
  const serialized = Array.isArray(value) ? value[0] : String(value ?? "");
  assert.ok(serialized);
  return serialized.split(";", 1)[0]!;
}

test("production authentication HTTP lifecycle", { skip: !runIntegration, timeout: 180_000 }, async () => {
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `auth-http-${unique}@example.test`;
  const missingEmail = `missing-${unique}@example.test`;
  const delivery = new MemoryAuthTokenDelivery();
  const environment = loadEnvironment({ ...process.env, ZAYLOQ_ENV: "test", NODE_ENV: "test", API_TRUST_PROXY: "true", AUTH_TRUSTED_ORIGINS: origin, AUTH_LOGIN_RATE_LIMIT_MAX: "2" });
  await connectDatabase(); await connectRedis();
  const app = await buildApp({ environment, delivery, logger: false });
  const db = getDatabaseClient(); const redis = getRedisClient();
  let userId: string | undefined;
  const rateKeys = new Set<string>();
  const headers = (ip: string, cookie?: string) => ({ origin, "x-forwarded-for": ip, ...(cookie ? { cookie } : {}) });
  const remember = (action: string, ipAddress: string, identity?: string) => rateKeys.add(authRateLimitKey({ action, ipAddress, identity }));

  try {
    remember("register", "10.0.0.1", email);
    const registered = await app.inject({ method: "POST", url: "/v1/auth/register", headers: headers("10.0.0.1"), payload: { email: ` ${email.toUpperCase()} `, password, displayName: "HTTP Auth" } });
    assert.equal(registered.statusCode, 201);
    const body = registered.json(); userId = body.user.id;
    assert.equal(body.user.email, email); assert.equal(JSON.stringify(body).includes("passwordHash"), false); assert.equal(JSON.stringify(body).includes("tokenHash"), false);
    const registrationCookie = cookieFrom(registered);
    assert.match(String(registered.headers["set-cookie"]), /HttpOnly/i); assert.match(String(registered.headers["set-cookie"]), /SameSite=Lax/i); assert.match(String(registered.headers["set-cookie"]), /Path=\//i);
    const duplicate = await app.inject({ method: "POST", url: "/v1/auth/register", headers: headers("10.0.0.1"), payload: { email, password } });
    assert.equal(duplicate.statusCode, 409); assert.equal(duplicate.json().error.code, "ACCOUNT_ALREADY_EXISTS");
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/session", headers: headers("10.0.0.1", registrationCookie) })).json().authenticated, true);
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/me", headers: headers("10.0.0.1", registrationCookie) })).statusCode, 200);
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/me" })).statusCode, 401);

    remember("email-verification", "10.0.0.2", email);
    const verificationRequest = await app.inject({ method: "POST", url: "/v1/auth/email-verification/request", headers: headers("10.0.0.2", registrationCookie) });
    assert.equal(verificationRequest.statusCode, 202); assert.equal(JSON.stringify(verificationRequest.json()).includes("token"), false);
    const verification = delivery.latest("email-verification", userId!); assert.ok(verification);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/email-verification/confirm", headers: headers("10.0.0.2"), payload: { token: verification.token } })).json().user.emailVerified, true);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/email-verification/confirm", headers: headers("10.0.0.2"), payload: { token: verification.token } })).json().error.code, "TOKEN_ALREADY_USED");

    remember("login", "10.0.0.3", email); remember("login", "10.0.0.4", missingEmail); remember("login", "10.0.0.5", email);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.3"), payload: { email, password: "wrong password long enough" } })).json().error.code, "INVALID_CREDENTIALS");
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.4"), payload: { email: missingEmail, password } })).json().error.code, "INVALID_CREDENTIALS");
    const login = await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.5"), payload: { email, password } });
    assert.equal(login.statusCode, 200); const loginCookie = cookieFrom(login);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/logout", headers: headers("10.0.0.5", loginCookie) })).statusCode, 204);
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/session", headers: headers("10.0.0.5", loginCookie) })).json().authenticated, false);

    remember("login", "10.0.0.6", email); remember("login", "10.0.0.7", email);
    const sessionA = cookieFrom(await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.6"), payload: { email, password } }));
    const sessionB = cookieFrom(await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.7"), payload: { email, password } }));
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/logout-all", headers: headers("10.0.0.6", sessionA) })).statusCode, 204);
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/session", headers: headers("10.0.0.7", sessionB) })).json().authenticated, false);

    remember("login", "10.0.0.8", email); remember("password-reset", "10.0.0.9", email); remember("password-reset", "10.0.0.10", missingEmail);
    const resetSession = cookieFrom(await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.8"), payload: { email, password } }));
    const resetRequest = await app.inject({ method: "POST", url: "/v1/auth/password-reset/request", headers: headers("10.0.0.9"), payload: { email } });
    const missingReset = await app.inject({ method: "POST", url: "/v1/auth/password-reset/request", headers: headers("10.0.0.10"), payload: { email: missingEmail } });
    assert.equal(resetRequest.statusCode, 202); assert.deepEqual(resetRequest.json(), missingReset.json()); assert.equal(JSON.stringify(resetRequest.json()).includes("token"), false);
    const reset = delivery.latest("password-reset", userId!); assert.ok(reset);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/password-reset/confirm", headers: headers("10.0.0.9"), payload: { token: reset.token, newPassword } })).statusCode, 200);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/password-reset/confirm", headers: headers("10.0.0.9"), payload: { token: reset.token, newPassword } })).json().error.code, "TOKEN_ALREADY_USED");
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/session", headers: headers("10.0.0.8", resetSession) })).json().authenticated, false);
    remember("login", "10.0.0.11", email); remember("login", "10.0.0.12", email);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.11"), payload: { email, password } })).statusCode, 401);
    const newLogin = await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.12"), payload: { email, password: newPassword } }); assert.equal(newLogin.statusCode, 200);
    const expiringCookie = cookieFrom(newLogin); const rawToken = expiringCookie.slice(expiringCookie.indexOf("=") + 1);
    await db.authSession.update({ where: { tokenHash: hashToken(rawToken) }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    assert.equal((await app.inject({ method: "GET", url: "/v1/auth/session", headers: headers("10.0.0.12", expiringCookie) })).json().authenticated, false);

    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.13"), payload: { email: "bad", password: "x" } })).statusCode, 400);
    assert.equal((await app.inject({ method: "POST", url: "/v1/auth/logout", headers: { origin: "https://evil.example" } })).statusCode, 403);
    remember("login", "10.0.0.99", missingEmail);
    await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.99"), payload: { email: missingEmail, password } });
    await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.99"), payload: { email: missingEmail, password } });
    const limited = await app.inject({ method: "POST", url: "/v1/auth/login", headers: headers("10.0.0.99"), payload: { email: missingEmail, password } });
    assert.equal(limited.statusCode, 429); assert.equal(limited.json().error.code, "RATE_LIMITED");
  } finally {
    await app.close();
    if (userId) await db.user.deleteMany({ where: { id: userId, email } });
    if (rateKeys.size) await redis.del(...rateKeys);
    delivery.clear(); await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
  }
});
