import type { AuthService } from "@zayloq/auth";
import type { ApiAuthEnvironment, ZayloqEnvironment } from "@zayloq/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

import { ApiError, sendPublicError } from "./api-errors.js";
import { createAuthGuard } from "./auth-guard.js";
import { clearSessionCookie, readSessionCookie, setSessionCookie, type SessionCookieConfig } from "./cookie.js";
import type { AuthTokenDelivery } from "./delivery.js";
import { publicSession, publicUser } from "./public-dto.js";
import type { AuthRateLimiter, RateLimitRequest } from "./rate-limiter.js";

const emailSchema = z.string().trim().min(1).max(320).email();
const passwordSchema = z.string().min(1).max(1_024);
const tokenSchema = z.string().min(20).max(512);
const registerSchema = z.object({ email: emailSchema, password: passwordSchema, displayName: z.string().trim().min(1).max(160).optional() }).strict();
const loginSchema = z.object({ email: emailSchema, password: passwordSchema }).strict();
const emailOnlySchema = z.object({ email: emailSchema }).strict();
const tokenOnlySchema = z.object({ token: tokenSchema }).strict();
const resetConfirmSchema = z.object({ token: tokenSchema, newPassword: passwordSchema }).strict();

export interface AuthRouteOptions {
  auth: AuthService;
  delivery: AuthTokenDelivery;
  limiter: AuthRateLimiter;
  environment: ZayloqEnvironment;
  apiAuth: ApiAuthEnvironment;
}

function clientIp(request: FastifyRequest): string { return request.ip || "unknown"; }

export async function authRoutes(app: FastifyInstance, options: AuthRouteOptions) {
  const { auth, delivery, limiter, environment, apiAuth } = options;
  const cookie: SessionCookieConfig = { name: apiAuth.cookieName, secure: environment.ZAYLOQ_ENV === "production", maxAgeSeconds: environment.AUTH_SESSION_TTL_SECONDS };
  const guard = createAuthGuard(auth, cookie);
  app.decorateRequest("authPrincipal", null);

  async function limit(request: FastifyRequest, reply: Parameters<typeof sendPublicError>[1], input: Omit<RateLimitRequest, "ipAddress" | "windowSeconds">) {
    let result;
    try { result = await limiter.consume({ ...input, ipAddress: clientIp(request), windowSeconds: apiAuth.rateLimitWindowSeconds }); }
    catch { throw new ApiError(503, "RATE_LIMIT_UNAVAILABLE", "Authentication is temporarily unavailable."); }
    reply.header("X-RateLimit-Remaining", result.remaining);
    if (!result.allowed) { reply.header("Retry-After", result.retryAfterSeconds); throw new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later."); }
  }

  app.post("/v1/auth/register", async (request, reply) => {
    try {
      const input = registerSchema.parse(request.body);
      await limit(request, reply, { action: "register", identity: input.email, limit: apiAuth.registrationRateLimitMax });
      const registered = await auth.registration.register(input);
      const issued = await auth.sessions.createSession({ userId: registered.user.id, ipAddress: clientIp(request), userAgent: request.headers["user-agent"] });
      const deliveryResult = await delivery.deliver({ kind: "email-verification", userId: registered.user.id, email: registered.user.email, token: registered.emailVerificationToken, expiresAt: registered.emailVerificationExpiresAt });
      setSessionCookie(reply, issued.token, cookie);
      return reply.code(201).send({ user: publicUser(registered.user), session: publicSession(issued.session), verificationDelivery: deliveryResult.accepted ? "accepted" : "unavailable" });
    } catch (error) { return sendPublicError(error, reply); }
  });

  app.post("/v1/auth/login", async (request, reply) => {
    try {
      const input = loginSchema.parse(request.body);
      await limit(request, reply, { action: "login", identity: input.email, limit: apiAuth.loginRateLimitMax });
      const result = await auth.authentication.authenticateWithPassword({ ...input, ipAddress: clientIp(request), userAgent: request.headers["user-agent"] });
      setSessionCookie(reply, result.token, cookie);
      return { user: publicUser(result.user), session: publicSession(result.session) };
    } catch (error) { return sendPublicError(error, reply); }
  });

  app.get("/v1/auth/session", async (request, reply) => {
    const principal = await guard.authenticate(request);
    if (!principal) { clearSessionCookie(reply, cookie); return { authenticated: false }; }
    return { authenticated: true, user: publicUser(principal.user), session: publicSession(principal.session) };
  });

  app.get("/v1/auth/me", { preHandler: guard.requireAuth }, async (request) => ({ user: publicUser(request.authPrincipal!.user) }));

  app.post("/v1/auth/logout", async (request, reply) => {
    try { const token = readSessionCookie(request, cookie); if (token) await auth.sessions.revokeSession(token, "user_logout"); clearSessionCookie(reply, cookie); return reply.code(204).send(); }
    catch (error) { clearSessionCookie(reply, cookie); return sendPublicError(error, reply); }
  });

  app.post("/v1/auth/logout-all", { preHandler: guard.requireAuth }, async (request, reply) => {
    try { await auth.sessions.revokeAllUserSessions(request.authPrincipal!.user.id, "user_logout_all"); clearSessionCookie(reply, cookie); return reply.code(204).send(); }
    catch (error) { return sendPublicError(error, reply); }
  });

  app.post("/v1/auth/email-verification/request", { preHandler: guard.requireAuth }, async (request, reply) => {
    try {
      await limit(request, reply, { action: "email-verification", identity: request.authPrincipal!.user.email, limit: apiAuth.recoveryRateLimitMax });
      if (request.authPrincipal!.user.emailVerifiedAt) throw new ApiError(409, "EMAIL_ALREADY_VERIFIED", "The email address is already verified.");
      const created = await auth.emailVerification.createEmailVerificationToken(request.authPrincipal!.user.id);
      const delivered = await delivery.deliver({ kind: "email-verification", userId: request.authPrincipal!.user.id, email: request.authPrincipal!.user.email, token: created.token, expiresAt: created.expiresAt });
      return reply.code(202).send({ message: "Verification instructions were requested.", delivery: delivered.accepted ? "accepted" : "unavailable" });
    } catch (error) { return sendPublicError(error, reply); }
  });

  app.post("/v1/auth/email-verification/confirm", async (request, reply) => {
    try { const input = tokenOnlySchema.parse(request.body); const result = await auth.emailVerification.consumeEmailVerificationToken(input.token); return { user: publicUser(result.user) }; }
    catch (error) { return sendPublicError(error, reply); }
  });

  app.post("/v1/auth/password-reset/request", async (request, reply) => {
    const publicResponse = { message: "If an account exists for that email, reset instructions have been requested." };
    try {
      const input = emailOnlySchema.parse(request.body);
      await limit(request, reply, { action: "password-reset", identity: input.email, limit: apiAuth.recoveryRateLimitMax });
      try {
        const user = await auth.accounts.findUserByEmail(input.email);
        if (user) { const created = await auth.passwordReset.createPasswordResetToken(user.id); await delivery.deliver({ kind: "password-reset", userId: user.id, email: user.email, token: created.token, expiresAt: created.expiresAt }); }
      } catch {
        request.log.warn("Password reset request could not be completed internally.");
      }
      return reply.code(202).send(publicResponse);
    } catch (error) { return sendPublicError(error, reply); }
  });

  app.post("/v1/auth/password-reset/confirm", async (request, reply) => {
    try { const input = resetConfirmSchema.parse(request.body); await auth.passwordReset.consumePasswordResetToken(input.token, input.newPassword); clearSessionCookie(reply, cookie); return { passwordReset: true }; }
    catch (error) { return sendPublicError(error, reply); }
  });
}
