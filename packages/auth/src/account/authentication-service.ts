import { AuthProvider, getDatabaseClient, type PrismaClient } from "@zayloq/database";

import type { AuthConfig } from "../config/index.js";
import { verifyPassword } from "../crypto/index.js";
import { InvalidCredentialsError } from "../errors/index.js";
import { normalizeEmail } from "../identity/index.js";
import { getDummyPasswordHash } from "../security/index.js";
import { SessionService } from "../sessions/index.js";
import { toSafeUser, type AuthenticationResult } from "../types/index.js";

export interface PasswordAuthenticationInput { email: string; password: string; ipAddress?: string; userAgent?: string; }

export class AuthenticationService {
  private readonly sessions: SessionService;
  constructor(config: AuthConfig, private readonly db: PrismaClient = getDatabaseClient()) { this.sessions = new SessionService(config, db); }

  async authenticateWithPassword(input: PasswordAuthenticationInput): Promise<AuthenticationResult> {
    let email: string;
    try { email = normalizeEmail(input.email); } catch { await verifyPassword(await getDummyPasswordHash(), input.password); throw new InvalidCredentialsError(); }
    const user = await this.db.user.findUnique({ where: { email }, include: { credentials: { where: { provider: AuthProvider.PASSWORD }, select: { passwordHash: true }, take: 1 } } });
    const passwordHash = user?.credentials[0]?.passwordHash ?? await getDummyPasswordHash();
    const valid = await verifyPassword(passwordHash, input.password);
    if (!user || !user.credentials[0]?.passwordHash || !valid) throw new InvalidCredentialsError();
    const created = await this.sessions.createSession({ userId: user.id, ipAddress: input.ipAddress, userAgent: input.userAgent });
    return { ...created, user: toSafeUser(user) };
  }
}
