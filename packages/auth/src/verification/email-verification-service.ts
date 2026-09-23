import { getDatabaseClient, type PrismaClient } from "@zayloq/database";

import type { AuthConfig } from "../config/index.js";
import { generateSecureToken, hashToken } from "../crypto/index.js";
import { EmailAlreadyVerifiedError, ExpiredTokenError, InvalidTokenError, TokenAlreadyUsedError } from "../errors/index.js";
import type { AuthDatabase } from "../internal/database.js";
import { toSafeUser, type EmailVerificationResult } from "../types/index.js";

export interface EmailVerificationTokenResult { token: string; expiresAt: Date; }

export class EmailVerificationService {
  constructor(private readonly config: AuthConfig, private readonly db: PrismaClient = getDatabaseClient()) {}

  async invalidateExistingEmailVerificationTokens(userId: string, db: AuthDatabase = this.db): Promise<number> {
    const result = await db.emailVerificationToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
    return result.count;
  }

  async createEmailVerificationToken(userId: string): Promise<EmailVerificationTokenResult> {
    return this.db.$transaction(async (tx) => {
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + this.config.emailVerificationTtlMs);
      await this.invalidateExistingEmailVerificationTokens(userId, tx);
      await tx.emailVerificationToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
      return { token, expiresAt };
    });
  }

  async consumeEmailVerificationToken(token: string): Promise<EmailVerificationResult> {
    const tokenHash = hashToken(token);
    const existing = await this.db.emailVerificationToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!existing) throw new InvalidTokenError();
    if (existing.usedAt) throw new TokenAlreadyUsedError();
    if (existing.expiresAt <= new Date()) throw new ExpiredTokenError();
    if (existing.user.emailVerifiedAt) throw new EmailAlreadyVerifiedError();

    return this.db.$transaction(async (tx) => {
      const verifiedAt = new Date();
      const claimed = await tx.emailVerificationToken.updateMany({ where: { id: existing.id, usedAt: null, expiresAt: { gt: verifiedAt } }, data: { usedAt: verifiedAt } });
      if (claimed.count !== 1) throw new TokenAlreadyUsedError();
      const user = await tx.user.update({ where: { id: existing.userId }, data: { emailVerifiedAt: verifiedAt } });
      return { user: toSafeUser(user), verifiedAt };
    });
  }
}
