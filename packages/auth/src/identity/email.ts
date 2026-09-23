import { InvalidEmailError } from "../errors/index.js";

const MAX_EMAIL_LENGTH = 320;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailValidationResult { valid: boolean; normalizedEmail?: string; errors: string[]; }

export function validateEmail(email: string): EmailValidationResult {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const errors: string[] = [];
  if (!normalizedEmail) errors.push("Email is required.");
  if (normalizedEmail.length > MAX_EMAIL_LENGTH) errors.push(`Email must not exceed ${MAX_EMAIL_LENGTH} characters.`);
  if (normalizedEmail && !EMAIL_PATTERN.test(normalizedEmail)) errors.push("Email format is invalid.");
  return errors.length === 0 ? { valid: true, normalizedEmail, errors } : { valid: false, errors };
}

export function normalizeEmail(email: string): string {
  const result = validateEmail(email);
  if (!result.valid || !result.normalizedEmail) throw new InvalidEmailError();
  return result.normalizedEmail;
}
