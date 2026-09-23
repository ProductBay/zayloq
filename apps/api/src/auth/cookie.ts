import type { FastifyReply, FastifyRequest } from "fastify";

export interface SessionCookieConfig { name: string; secure: boolean; maxAgeSeconds: number; }

export function readSessionCookie(request: FastifyRequest, config: SessionCookieConfig): string | undefined {
  return request.cookies[config.name];
}

export function setSessionCookie(reply: FastifyReply, token: string, config: SessionCookieConfig): void {
  reply.setCookie(config.name, token, { httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: config.maxAgeSeconds });
}

export function clearSessionCookie(reply: FastifyReply, config: SessionCookieConfig): void {
  reply.clearCookie(config.name, { httpOnly: true, secure: config.secure, sameSite: "lax", path: "/" });
}
