import assert from "node:assert/strict";
import { test } from "node:test";
import { InvalidEmailError } from "../errors/index.js";
import { normalizeEmail, validateEmail } from "./email.js";

test("email normalization is conservative", () => {
  assert.equal(normalizeEmail("  User.Name+tag@Example.COM "), "user.name+tag@example.com");
});

test("invalid email is rejected with a typed error", () => {
  assert.equal(validateEmail("not-an-email").valid, false);
  assert.throws(() => normalizeEmail(""), InvalidEmailError);
});
