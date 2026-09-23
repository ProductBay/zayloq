import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateSecureToken(): string { return randomBytes(32).toString("base64url"); }
export function hashToken(rawToken: string): string { return createHash("sha256").update(rawToken, "utf8").digest("hex"); }
export function verifyTokenHash(expectedHash: string, rawToken: string): boolean {
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(hashToken(rawToken), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
