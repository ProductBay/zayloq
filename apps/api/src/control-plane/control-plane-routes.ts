import type { AuthService } from "@zayloq/auth";
import type { ApiAuthEnvironment, ZayloqEnvironment } from "@zayloq/config";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { ApiError } from "../auth/api-errors.js";
import { createAuthGuard } from "../auth/auth-guard.js";
import type { AuthRateLimiter } from "../auth/rate-limiter.js";
import type { SessionCookieConfig } from "../auth/cookie.js";
import { OrganizationService } from "./organization-service.js";
import { ProjectService } from "./project-service.js";

const idSchema = z.string().uuid();
const nameSchema = z.string().trim().min(1).max(160);
const organizationCreateSchema = z.object({ name: nameSchema }).strict();
const organizationUpdateSchema = z.object({ name: nameSchema }).strict();
const projectCreateSchema = z.object({ name: nameSchema, organizationId: idSchema.optional(), prompt: z.string().trim().min(1).max(20_000).optional() }).strict();
const projectUpdateSchema = z.object({ name: nameSchema }).strict();
const listProjectsSchema = z.object({ organizationId: idSchema.optional(), includeArchived: z.enum(["true", "false"]).optional() });

export interface ControlPlaneRouteOptions {
  auth: AuthService;
  limiter: AuthRateLimiter;
  environment: ZayloqEnvironment;
  apiAuth: ApiAuthEnvironment;
  organizations?: OrganizationService;
  projects?: ProjectService;
}

export async function controlPlaneRoutes(app: FastifyInstance, options: ControlPlaneRouteOptions) {
  const organizations = options.organizations ?? new OrganizationService();
  const projects = options.projects ?? new ProjectService();
  const cookie: SessionCookieConfig = { name: options.apiAuth.cookieName, secure: options.environment.ZAYLOQ_ENV === "production", maxAgeSeconds: options.environment.AUTH_SESSION_TTL_SECONDS };
  const guard = createAuthGuard(options.auth, cookie);
  const user = (request: FastifyRequest) => request.authPrincipal!.user;

  async function mutationLimit(request: FastifyRequest, reply: { header(name: string, value: string | number): unknown }) {
    let result;
    try { result = await options.limiter.consume({ action: "control-plane-mutation", ipAddress: request.ip || "unknown", identity: user(request).id, limit: 60, windowSeconds: options.apiAuth.rateLimitWindowSeconds }); }
    catch { throw new ApiError(503, "RATE_LIMIT_UNAVAILABLE", "The service is temporarily unavailable."); }
    reply.header("X-RateLimit-Remaining", result.remaining);
    if (!result.allowed) { reply.header("Retry-After", result.retryAfterSeconds); throw new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later."); }
  }

  app.get("/v1/organizations", { preHandler: guard.requireAuth }, async (request) => ({ organizations: await organizations.list(user(request).id) }));
  app.post("/v1/organizations", { preHandler: guard.requireAuth }, async (request, reply) => { const input = organizationCreateSchema.parse(request.body); await mutationLimit(request, reply); return reply.code(201).send({ organization: await organizations.create(user(request).id, input.name) }); });
  app.get("/v1/organizations/:organizationId", { preHandler: guard.requireAuth }, async (request) => { const { organizationId } = z.object({ organizationId: idSchema }).parse(request.params); return { organization: await organizations.get(user(request).id, organizationId) }; });
  app.patch("/v1/organizations/:organizationId", { preHandler: guard.requireAuth }, async (request, reply) => { const { organizationId } = z.object({ organizationId: idSchema }).parse(request.params); const input = organizationUpdateSchema.parse(request.body); await mutationLimit(request, reply); return { organization: await organizations.update(user(request).id, organizationId, input.name) }; });
  app.get("/v1/organizations/:organizationId/memberships", { preHandler: guard.requireAuth }, async (request) => { const { organizationId } = z.object({ organizationId: idSchema }).parse(request.params); return { memberships: await organizations.memberships(user(request).id, organizationId) }; });

  app.get("/v1/projects", { preHandler: guard.requireAuth }, async (request) => { const query = listProjectsSchema.parse(request.query); return { projects: await projects.list(user(request).id, query.organizationId, query.includeArchived === "true") }; });
  app.post("/v1/projects", { preHandler: guard.requireAuth }, async (request, reply) => { const input = projectCreateSchema.parse(request.body); await mutationLimit(request, reply); const principal = user(request); const result = await projects.create({ userId: principal.id, email: principal.email, displayName: principal.displayName, organizationId: input.organizationId, name: input.name }); return reply.code(201).send({ ...result, promptPersisted: false }); });
  app.get("/v1/projects/:projectId", { preHandler: guard.requireAuth }, async (request) => { const { projectId } = z.object({ projectId: idSchema }).parse(request.params); return { project: await projects.get(user(request).id, projectId) }; });
  app.patch("/v1/projects/:projectId", { preHandler: guard.requireAuth }, async (request, reply) => { const { projectId } = z.object({ projectId: idSchema }).parse(request.params); const input = projectUpdateSchema.parse(request.body); await mutationLimit(request, reply); return { project: await projects.update(user(request).id, projectId, input.name) }; });
  app.post("/v1/projects/:projectId/archive", { preHandler: guard.requireAuth }, async (request, reply) => { const { projectId } = z.object({ projectId: idSchema }).parse(request.params); await mutationLimit(request, reply); return { project: await projects.archive(user(request).id, projectId) }; });
  app.get("/v1/projects/:projectId/environments", { preHandler: guard.requireAuth }, async (request) => { const { projectId } = z.object({ projectId: idSchema }).parse(request.params); return { environments: await projects.environments(user(request).id, projectId) }; });
}
