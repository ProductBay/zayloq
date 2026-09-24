import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { AuthService } from "@zayloq/auth";
import { loadApiAuthEnvironment, loadEnvironment, type ZayloqEnvironment } from "@zayloq/config";
import { createLogger } from "@zayloq/observability";
import Fastify from "fastify";

import { ApiError, sendPublicError } from "./auth/api-errors.js";
import { authRoutes } from "./auth/auth-routes.js";
import { MemoryAuthTokenDelivery, UnavailableAuthTokenDelivery, type AuthTokenDelivery } from "./auth/delivery.js";
import { RedisAuthRateLimiter, type AuthRateLimiter } from "./auth/rate-limiter.js";
import { healthRoutes } from "./routes/health.js";
import { controlPlaneRoutes } from "./control-plane/control-plane-routes.js";
import { usageRoutes } from "./usage/usage-routes.js";

export interface BuildAppOptions { environment?: ZayloqEnvironment; auth?: AuthService; delivery?: AuthTokenDelivery; limiter?: AuthRateLimiter; logger?: boolean; }

export async function buildApp(options: BuildAppOptions = {}) {
  const environment = options.environment ?? loadEnvironment();
  const apiAuth = loadApiAuthEnvironment(environment as unknown as NodeJS.ProcessEnv);
  const logger = createLogger({ service: "zayloq-api", level: environment.LOG_LEVEL });
  const app = Fastify({ loggerInstance: options.logger === false ? undefined : logger, logger: options.logger === false ? false : undefined, bodyLimit: apiAuth.bodyLimitBytes, trustProxy: environment.API_TRUST_PROXY });
  const auth = options.auth ?? new AuthService({
    sessionTtlMs: environment.AUTH_SESSION_TTL_SECONDS * 1_000,
    emailVerificationTtlMs: environment.AUTH_EMAIL_VERIFICATION_TTL_SECONDS * 1_000,
    passwordResetTtlMs: environment.AUTH_PASSWORD_RESET_TTL_SECONDS * 1_000,
    sessionTouchIntervalMs: environment.AUTH_SESSION_TOUCH_INTERVAL_SECONDS * 1_000
  });
  const delivery = options.delivery ?? (environment.ZAYLOQ_ENV === "production" ? new UnavailableAuthTokenDelivery() : new MemoryAuthTokenDelivery());
  const limiter = options.limiter ?? new RedisAuthRateLimiter();

  await app.register(cookie);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { credentials: true, origin(origin, callback) { callback(null, !origin || apiAuth.trustedOrigins.includes(origin)); } });

  app.addHook("preHandler", async (request) => {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method) || !request.url.startsWith("/v1/")) return;
    const source = request.headers.origin ?? request.headers.referer;
    let origin: string | undefined;
    try { origin = source ? new URL(source).origin : undefined; } catch { throw new ApiError(403, "UNTRUSTED_ORIGIN", "The request origin is not trusted."); }
    if (!origin || !apiAuth.trustedOrigins.includes(origin)) {
      throw new ApiError(403, "UNTRUSTED_ORIGIN", "The request origin is not trusted.");
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    return sendPublicError(error, reply);
  });

  await app.register(healthRoutes);
  await app.register(authRoutes, { auth, delivery, limiter, environment, apiAuth });
  await app.register(controlPlaneRoutes, { auth, limiter, environment, apiAuth });
  await app.register(usageRoutes, { auth, environment, apiAuth });
  return app;
}
