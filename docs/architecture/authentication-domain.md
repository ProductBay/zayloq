# Authentication domain

ZP-0E.4 implements authentication as a reusable `@zayloq/auth` domain package. HTTP handlers, cookies, browser transport, and email delivery sit above this package; persistence sits below it in `@zayloq/database`. No Fastify authentication route is part of this phase.

## Security model

Passwords use Argon2id through the maintained `argon2` package. Hash strings retain their algorithm, salt, and tuning parameters. The current parameters are 64 MiB memory, three iterations, and one lane. Passwords must be 12–1024 characters; passphrases are accepted without composition rules. Passwords and hashes never appear in public DTOs.

Session, verification, and reset tokens are opaque 32-byte values generated with Node's cryptographic RNG and encoded as base64url. Only their SHA-256 digest is persisted. A database leak therefore does not directly disclose bearer tokens. Raw tokens are returned once to the caller responsible for transport or delivery and must never be logged.

Email identities are trimmed and lowercased. They are syntax-checked and limited to the schema's 320 characters. Provider-specific transformations (dot removal, alias removal, or domain rewriting) are deliberately absent. PASSWORD credentials use a null `providerKey`; canonical identity lookup uses `User.email`.

## Lifecycles and transactions

- Registration normalizes identity, validates and hashes the password, then creates the user, PASSWORD credential, and hashed verification token in one transaction.
- Login uses a dummy Argon2id verification path for missing users/credentials and always exposes the same invalid-credentials error. This reduces obvious timing differences but does not claim perfect timing resistance.
- Sessions are server-managed records. Validation checks ACTIVE status and expiry. `lastSeenAt` is touched only after the configured threshold. Sessions can be individually revoked, revoked by user, or bulk-marked EXPIRED.
- Creating a verification or reset token supersedes outstanding tokens by marking them used because the existing schema has no separate invalidation field.
- Verification atomically claims a still-unused, unexpired token and updates `emailVerifiedAt`; the conditional claim prevents replay.
- Password reset hashes the new password before entering a transaction, then atomically claims the token, updates the PASSWORD credential, invalidates sibling reset tokens, and revokes active sessions. A conditional claim prevents replay.

Defaults are 30 days for sessions, 24 hours for email verification, one hour for password reset, and five minutes for session touch. `@zayloq/config` validates the corresponding `AUTH_*_SECONDS` environment variables.

## Boundaries and extension points

Public results contain only `SafeUser`, `SafeSession`, delivery-neutral raw token results, and typed errors with stable codes and safe messages. Prisma credential and token records are internal persistence details. The service facade accepts the shared Prisma client, enabling API, Studio, worker, and future service consumption without embedding business rules in routes.

The current `AuditEvent` model requires an `organizationId`. Registration, login, verification, reset, and session operations are user-scoped before an organization necessarily exists, so emitting audit rows would require fabricated ownership or a schema change. This phase intentionally does neither. A future approved audit-schema evolution should add platform/user-scoped security events; callers may meanwhile record compatible organization-scoped events after successful domain operations without including secrets.

OAuth providers can later add provider-specific credential services while preserving the normalized user identity and safe DTO boundary. MFA can be enforced between primary credential verification and session issuance once dedicated factors/challenges have approved persistence.

Known limitations and intentionally deferred responsibilities are HTTP `/auth` endpoints, cookies, CSRF, browser transport, email/SMS delivery, Google/GitHub OAuth, MFA/TOTP, passkeys, UI, invitations, RBAC middleware, billing authorization, API keys, generated-app auth, SSO/SAML, and SCIM. Account-state enforcement is limited because the current `User` model has no suspension/deactivation state. Token invalidation shares `usedAt` with consumption because no invalidation column exists.
