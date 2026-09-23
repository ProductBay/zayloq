import { getDatabaseClient, type PrismaClient } from "@zayloq/database";

import { normalizeEmail } from "../identity/index.js";
import { toSafeUser, type SafeUser } from "../types/index.js";

export class AccountLookupService {
  constructor(private readonly db: PrismaClient = getDatabaseClient()) {}

  async findUserByEmail(emailInput: string): Promise<SafeUser | null> {
    const email = normalizeEmail(emailInput);
    const user = await this.db.user.findUnique({ where: { email } });
    return user ? toSafeUser(user) : null;
  }
}
