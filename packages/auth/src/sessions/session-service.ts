import { getDatabaseClient, SessionStatus, type PrismaClient } from "@zayloq/database";

import type { AuthConfig } from "../config/index.js";
import { generateSecureToken, hashToken } from "../crypto/index.js";
import { SessionExpiredError, SessionNotFoundError, SessionRevokedError } from "../errors/index.js";
import { toSafeSession, toSafeUser, type SessionResult, type ValidatedSession } from "../types/index.js";
import type { CreateSessionInput } from "./session-types.js";

export class SessionService {
  constructor(private readonly config: AuthConfig, private readonly db: PrismaClient = getDatabaseClient()) {}

  async createSession(input: CreateSessionInput): Promise<SessionResult> {
    const token = generateSecureToken();
    const now = new Date();
    const session = await this.db.authSession.create({ data: { userId: input.userId, tokenHash: hashToken(token), expiresAt: new Date(now.getTime() + this.config.sessionTtlMs), lastSeenAt: now, ipAddress: input.ipAddress, userAgent: input.userAgent } });
    return { token, session: toSafeSession(session) };
  }

  async validateSession(token: string): Promise<ValidatedSession> {
    const now = new Date();
    const record = await this.db.authSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
    if (!record) throw new SessionNotFoundError();
    if (record.status === SessionStatus.REVOKED) throw new SessionRevokedError();
    if (record.status === SessionStatus.EXPIRED || record.expiresAt <= now) {
      if (record.status === SessionStatus.ACTIVE) await this.db.authSession.updateMany({ where: { id: record.id, status: SessionStatus.ACTIVE }, data: { status: SessionStatus.EXPIRED } });
      throw new SessionExpiredError();
    }
    const staleBefore = new Date(now.getTime() - this.config.sessionTouchIntervalMs);
    if (!record.lastSeenAt || record.lastSeenAt <= staleBefore) await this.touchSession(record.id, now);
    return { session: toSafeSession({ ...record, lastSeenAt: record.lastSeenAt && record.lastSeenAt > staleBefore ? record.lastSeenAt : now }), user: toSafeUser(record.user) };
  }

  async touchSession(sessionId: string, now = new Date()): Promise<boolean> {
    const staleBefore = new Date(now.getTime() - this.config.sessionTouchIntervalMs);
    const result = await this.db.authSession.updateMany({ where: { id: sessionId, status: SessionStatus.ACTIVE, expiresAt: { gt: now }, OR: [{ lastSeenAt: null }, { lastSeenAt: { lte: staleBefore } }] }, data: { lastSeenAt: now } });
    return result.count === 1;
  }

  async revokeSession(token: string, reason?: string): Promise<boolean> {
    const now = new Date();
    const result = await this.db.authSession.updateMany({ where: { tokenHash: hashToken(token), status: SessionStatus.ACTIVE }, data: { status: SessionStatus.REVOKED, revokedAt: now, revokeReason: reason?.slice(0, 255) } });
    return result.count === 1;
  }

  async revokeAllUserSessions(userId: string, reason?: string): Promise<number> {
    const result = await this.db.authSession.updateMany({ where: { userId, status: SessionStatus.ACTIVE }, data: { status: SessionStatus.REVOKED, revokedAt: new Date(), revokeReason: reason?.slice(0, 255) } });
    return result.count;
  }

  async cleanupExpiredSessions(now = new Date()): Promise<number> {
    const result = await this.db.authSession.updateMany({ where: { status: SessionStatus.ACTIVE, expiresAt: { lte: now } }, data: { status: SessionStatus.EXPIRED } });
    return result.count;
  }
}
