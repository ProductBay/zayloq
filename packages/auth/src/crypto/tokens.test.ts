import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSecureToken, hashToken, verifyTokenHash } from "./tokens.js";

test("opaque tokens provide 256 bits and deterministic non-plaintext hashes", () => {
  const first = generateSecureToken();
  const second = generateSecureToken();
  assert.notEqual(first, second);
  assert.equal(Buffer.from(first, "base64url").byteLength, 32);
  assert.equal(hashToken(first), hashToken(first));
  assert.notEqual(hashToken(first), first);
  assert.equal(verifyTokenHash(hashToken(first), first), true);
  assert.equal(verifyTokenHash(hashToken(first), second), false);
});
