import { AuthProvider, getDatabaseClient, SessionStatus, type PrismaClient } from "@zayloq/database";

import type { AuthConfig } from "../config/index.js";
import { generateSecureToken, hashPassword, hashToken } from "../crypto/index.js";
import { CredentialNotFoundError, ExpiredTokenError, InvalidTokenError, TokenAlreadyUsedError } from "../errors/index.js";
import type { AuthDatabase } from "../internal/database.js";
import type { PasswordResetResult } from "../types/index.js";

export interface PasswordResetTokenResult { token: string; expiresAt: Date; }

export class PasswordResetService {
  constructor(private readonly config: AuthConfig, private readonly db: PrismaClient = getDatabaseClient()) {}

  async invalidateExistingPasswordResetTokens(userId: string, db: AuthDatabase = this.db): Promise<number> {
    const result = await db.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
    return result.count;
  }

  async createPasswordResetToken(userId: string): Promise<PasswordResetTokenResult> {
    return this.db.$transaction(async (tx) => {
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + this.config.passwordResetTtlMs);
      await this.invalidateExistingPasswordResetTokens(userId, tx);
      await tx.passwordResetToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
      return { token, expiresAt };
    });
  }

  async consumePasswordResetToken(token: string, newPassword: string): Promise<PasswordResetResult> {
    const tokenHash = hashToken(token);
    const existing = await this.db.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!existing) throw new InvalidTokenError();
    if (existing.usedAt) throw new TokenAlreadyUsedError();
    if (existing.expiresAt <= new Date()) throw new ExpiredTokenError();
    const passwordHash = await hashPassword(newPassword);

    return this.db.$transaction(async (tx) => {
      const passwordChangedAt = new Date();
      const claimed = await tx.passwordResetToken.updateMany({ where: { id: existing.id, usedAt: null, expiresAt: { gt: passwordChangedAt } }, data: { usedAt: passwordChangedAt } });
      if (claimed.count !== 1) throw new TokenAlreadyUsedError();
      const credential = await tx.userCredential.updateMany({ where: { userId: existing.userId, provider: AuthProvider.PASSWORD }, data: { passwordHash } });
      if (credential.count !== 1) throw new CredentialNotFoundError();
      await tx.passwordResetToken.updateMany({ where: { userId: existing.userId, id: { not: existing.id }, usedAt: null }, data: { usedAt: passwordChangedAt } });
      const revoked = await tx.authSession.updateMany({ where: { userId: existing.userId, status: SessionStatus.ACTIVE }, data: { status: SessionStatus.REVOKED, revokedAt: passwordChangedAt, revokeReason: "password_reset" } });
      return { userId: existing.userId, passwordChangedAt, revokedSessionCount: revoked.count };
    });
  }
}
