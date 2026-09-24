import type { AuthService } from "@zayloq/auth";
import type { ApiAuthEnvironment, ZayloqEnvironment } from "@zayloq/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { createAuthGuard } from "../auth/auth-guard.js";
import type { SessionCookieConfig } from "../auth/cookie.js";
import { UsageReadService } from "./usage-service.js";
const querySchema = z.object({ organizationId: z.string().uuid() });
export async function usageRoutes(app: FastifyInstance, options: { auth: AuthService; environment: ZayloqEnvironment; apiAuth: ApiAuthEnvironment; usage?: UsageReadService }) {
  const cookie: SessionCookieConfig = { name: options.apiAuth.cookieName, secure: options.environment.ZAYLOQ_ENV === "production", maxAgeSeconds: options.environment.AUTH_SESSION_TTL_SECONDS };
  const guard = createAuthGuard(options.auth, cookie); const service = options.usage ?? new UsageReadService(); const userId = (request: FastifyRequest) => request.authPrincipal!.user.id;
  app.get("/v1/ai/usage", { preHandler: guard.requireAuth }, async (request) => { const query = querySchema.parse(request.query); return { usage: await service.list(userId(request), query.organizationId) }; });
  app.get("/v1/ai/usage/:usageId", { preHandler: guard.requireAuth }, async (request) => { const query = querySchema.parse(request.query); const { usageId } = z.object({ usageId: z.string().uuid() }).parse(request.params); return { usage: await service.get(userId(request), query.organizationId, usageId) }; });
  app.get("/v1/billing/credits", { preHandler: guard.requireAuth }, async (request) => { const query = querySchema.parse(request.query); return { credits: await service.credits(userId(request), query.organizationId) }; });
  app.get("/v1/billing/credits/ledger", { preHandler: guard.requireAuth }, async (request) => { const query = querySchema.parse(request.query); return { ledger: await service.ledger(userId(request), query.organizationId) }; });
}
