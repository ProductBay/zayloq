import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, PASSWORD_POLICY, validatePassword, verifyPassword } from "./password.js";

test("Argon2id hashes and verifies valid passwords", async () => {
  const password = "a long correct horse battery staple";
  const hash = await hashPassword(password);
  assert.match(hash, /^\$argon2id\$/);
  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(hash, password), true);
  assert.equal(await verifyPassword(hash, "incorrect password value"), false);
});

test("password policy accepts passphrases and rejects unsafe lengths", () => {
  assert.equal(validatePassword("simple passphrase with spaces").valid, true);
  assert.equal(validatePassword("too-short").valid, false);
  assert.equal(validatePassword("x".repeat(PASSWORD_POLICY.maximumLength + 1)).valid, false);
});
