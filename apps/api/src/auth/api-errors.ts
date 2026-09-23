import { AuthError } from "@zayloq/auth";
import type { FastifyReply } from "fastify";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(readonly statusCode: number, readonly code: string, message: string) { super(message); this.name = "ApiError"; }
}

const AUTH_STATUS: Partial<Record<string, number>> = {
  INVALID_CREDENTIALS: 401, SESSION_NOT_FOUND: 401, SESSION_EXPIRED: 401, SESSION_REVOKED: 401,
  ACCOUNT_ALREADY_EXISTS: 409, EMAIL_ALREADY_VERIFIED: 409,
  INVALID_EMAIL: 400, WEAK_PASSWORD: 400, INVALID_TOKEN: 400, EXPIRED_TOKEN: 400, TOKEN_ALREADY_USED: 400, CREDENTIAL_NOT_FOUND: 400
};

export function sendPublicError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) return reply.code(400).send({ error: { code: "INVALID_REQUEST", message: "The request is invalid." } });
  if (error instanceof ApiError) return reply.code(error.statusCode).send({ error: { code: error.code, message: error.message } });
  if (error instanceof AuthError) return reply.code(AUTH_STATUS[error.code] ?? 400).send({ error: { code: error.code, message: error.message } });
  reply.log.error({ err: error }, "Authentication request failed.");
  return reply.code(500).send({ error: { code: "INTERNAL_ERROR", message: "The request could not be completed." } });
}
