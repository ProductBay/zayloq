export type AuthErrorCode = "INVALID_CREDENTIALS" | "INVALID_EMAIL" | "WEAK_PASSWORD" | "ACCOUNT_ALREADY_EXISTS" | "SESSION_NOT_FOUND" | "SESSION_EXPIRED" | "SESSION_REVOKED" | "INVALID_TOKEN" | "EXPIRED_TOKEN" | "TOKEN_ALREADY_USED" | "EMAIL_ALREADY_VERIFIED" | "CREDENTIAL_NOT_FOUND";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly details?: Readonly<Record<string, unknown>>;
  constructor(code: AuthErrorCode, message: string, options?: { cause?: unknown; details?: Readonly<Record<string, unknown>> }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.code = code;
    this.details = options?.details;
  }
}

export class InvalidCredentialsError extends AuthError { constructor() { super("INVALID_CREDENTIALS", "The email or password is invalid."); } }
export class InvalidEmailError extends AuthError { constructor() { super("INVALID_EMAIL", "The email address is invalid."); } }
export class WeakPasswordError extends AuthError { constructor(details?: Readonly<Record<string, unknown>>) { super("WEAK_PASSWORD", "The password does not meet the password policy.", { details }); } }
export class AccountAlreadyExistsError extends AuthError { constructor(cause?: unknown) { super("ACCOUNT_ALREADY_EXISTS", "An account with this email already exists.", { cause }); } }
export class SessionNotFoundError extends AuthError { constructor() { super("SESSION_NOT_FOUND", "The session is invalid."); } }
export class SessionExpiredError extends AuthError { constructor() { super("SESSION_EXPIRED", "The session has expired."); } }
export class SessionRevokedError extends AuthError { constructor() { super("SESSION_REVOKED", "The session has been revoked."); } }
export class InvalidTokenError extends AuthError { constructor() { super("INVALID_TOKEN", "The token is invalid."); } }
export class ExpiredTokenError extends AuthError { constructor() { super("EXPIRED_TOKEN", "The token has expired."); } }
export class TokenAlreadyUsedError extends AuthError { constructor() { super("TOKEN_ALREADY_USED", "The token has already been used."); } }
export class EmailAlreadyVerifiedError extends AuthError { constructor() { super("EMAIL_ALREADY_VERIFIED", "The email address is already verified."); } }
export class CredentialNotFoundError extends AuthError { constructor() { super("CREDENTIAL_NOT_FOUND", "A password credential was not found."); } }
