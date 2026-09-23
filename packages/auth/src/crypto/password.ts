import argon2 from "argon2";

import { WeakPasswordError } from "../errors/index.js";

export const PASSWORD_POLICY = { minimumLength: 12, maximumLength: 1024 } as const;
export interface PasswordValidationResult { valid: boolean; errors: string[]; }

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (typeof password !== "string" || password.length < PASSWORD_POLICY.minimumLength) errors.push(`Password must contain at least ${PASSWORD_POLICY.minimumLength} characters.`);
  if (typeof password === "string" && password.length > PASSWORD_POLICY.maximumLength) errors.push(`Password must not exceed ${PASSWORD_POLICY.maximumLength} characters.`);
  return { valid: errors.length === 0, errors };
}

export async function hashPassword(password: string): Promise<string> {
  const validation = validatePassword(password);
  if (!validation.valid) throw new WeakPasswordError({ errors: validation.errors });
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 65_536, timeCost: 3, parallelism: 1 });
}

export async function verifyPassword(passwordHash: string, candidatePassword: string): Promise<boolean> {
  if (candidatePassword.length > PASSWORD_POLICY.maximumLength) return false;
  try { return await argon2.verify(passwordHash, candidatePassword); } catch { return false; }
}
