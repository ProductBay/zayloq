import type { AuthService, SafeSession, SafeUser } from "@zayloq/auth";
import type { FastifyReply, FastifyRequest } from "fastify";

import { ApiError } from "./api-errors.js";
import { clearSessionCookie, readSessionCookie, type SessionCookieConfig } from "./cookie.js";

export interface AuthPrincipal { user: SafeUser; session: SafeSession; }

declare module "fastify" {
  interface FastifyRequest { authPrincipal: AuthPrincipal | null; }
}

export function createAuthGuard(auth: AuthService, cookie: SessionCookieConfig) {
  async function authenticate(request: FastifyRequest): Promise<AuthPrincipal | null> {
    const token = readSessionCookie(request, cookie);
    if (!token) return null;
    try {
      const validated = await auth.sessions.validateSession(token);
      request.authPrincipal = validated;
      return validated;
    } catch {
      return null;
    }
  }

  async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (await authenticate(request)) return;
    clearSessionCookie(reply, cookie);
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
  }

  return { authenticate, requireAuth };
}
