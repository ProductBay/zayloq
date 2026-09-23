import { AuthProvider, getDatabaseClient, Prisma, type PrismaClient } from "@zayloq/database";

import type { AuthConfig } from "../config/index.js";
import { generateSecureToken, hashPassword, hashToken, validatePassword } from "../crypto/index.js";
import { AccountAlreadyExistsError, WeakPasswordError } from "../errors/index.js";
import { normalizeEmail } from "../identity/index.js";
import { toSafeUser, type RegistrationResult } from "../types/index.js";

export interface RegistrationInput { email: string; password: string; displayName?: string; }

export class RegistrationService {
  constructor(private readonly config: AuthConfig, private readonly db: PrismaClient = getDatabaseClient()) {}

  async register(input: RegistrationInput): Promise<RegistrationResult> {
    const email = normalizeEmail(input.email);
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.valid) throw new WeakPasswordError({ errors: passwordValidation.errors });
    const passwordHash = await hashPassword(input.password);
    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpiresAt = new Date(Date.now() + this.config.emailVerificationTtlMs);
    const displayName = input.displayName?.trim() || null;

    try {
      const user = await this.db.$transaction(async (tx) => {
        const created = await tx.user.create({ data: { email, displayName } });
        await tx.userCredential.create({ data: { userId: created.id, provider: AuthProvider.PASSWORD, providerKey: null, passwordHash } });
        await tx.emailVerificationToken.create({ data: { userId: created.id, tokenHash: hashToken(emailVerificationToken), expiresAt: emailVerificationExpiresAt } });
        return created;
      });
      return { user: toSafeUser(user), emailVerificationToken, emailVerificationExpiresAt };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new AccountAlreadyExistsError(error);
      throw error;
    }
  }
}
