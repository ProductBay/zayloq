import { AuthProvider, Prisma } from "@zayloq/database";

import { hashPassword, verifyPassword } from "../crypto/index.js";
import { AccountAlreadyExistsError, CredentialNotFoundError } from "../errors/index.js";
import type { AuthDatabase } from "../internal/database.js";

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createPasswordCredential(db: AuthDatabase, userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  try {
    await db.userCredential.create({ data: { userId, provider: AuthProvider.PASSWORD, providerKey: null, passwordHash } });
  } catch (error) {
    if (isUniqueConflict(error)) throw new AccountAlreadyExistsError(error);
    throw error;
  }
}

export async function findPasswordCredentialByUserId(db: AuthDatabase, userId: string) {
  return db.userCredential.findUnique({ where: { userId_provider: { userId, provider: AuthProvider.PASSWORD } }, select: { id: true, userId: true, provider: true, createdAt: true, updatedAt: true } });
}

export async function verifyPasswordCredential(db: AuthDatabase, userId: string, candidatePassword: string): Promise<boolean> {
  const credential = await db.userCredential.findUnique({ where: { userId_provider: { userId, provider: AuthProvider.PASSWORD } }, select: { passwordHash: true } });
  return credential?.passwordHash ? verifyPassword(credential.passwordHash, candidatePassword) : false;
}

export async function changePassword(db: AuthDatabase, userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  const result = await db.userCredential.updateMany({ where: { userId, provider: AuthProvider.PASSWORD }, data: { passwordHash } });
  if (result.count !== 1) throw new CredentialNotFoundError();
}
