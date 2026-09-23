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

Account-state enforcement is limited because the current `User` model has no suspension/deactivation state. Token invalidation shares `usedAt` with consumption because no invalidation column exists.

## HTTP authentication boundary

ZP-0E.5 exposes `POST /v1/auth/register`, `login`, `logout`, `logout-all`, email-verification `request`/`confirm`, password-reset `request`/`confirm`, plus `GET /v1/auth/session` and `/me`. Fastify handlers validate transport input and delegate all password, token, credential, and session behavior to this domain package.

The browser transport is an opaque session token in the `zayloq_session` cookie (configurable by `AUTH_COOKIE_NAME`). It is `HttpOnly`, `SameSite=Lax`, scoped to `/`, bounded by the domain session TTL, and `Secure` in production. Tokens and hashes are absent from response bodies. `/session` returns `{ authenticated: false }` with HTTP 200 for missing or invalid sessions; protected endpoints return a sanitized 401 error.

The reusable guard validates the cookie through `AuthService.sessions` and attaches only `SafeUser` and `SafeSession` as the request principal. Public user DTOs reduce `emailVerifiedAt` to a boolean; public session DTOs contain only the ID and timestamps. API errors have a stable `{ error: { code, message } }` shape and never serialize Prisma errors, causes, stacks, hashes, credentials, or request secrets.

All state-changing auth requests require an `Origin` or `Referer` whose origin appears in the validated `AUTH_TRUSTED_ORIGINS` allow-list. This complements `SameSite=Lax`; a synchronizer-token mechanism can be added if future cross-site embedding or browser requirements demand it. Credentialed CORS uses the same explicit allow-list and never uses `*`. Helmet supplies baseline security headers, while request bodies are limited to 16 KiB by default.

Login, registration, password-reset requests, and verification requests use a Redis-backed fixed-window limiter keyed by action plus SHA-256-derived IP and canonical-email identifiers. Plain email addresses, passwords, and tokens are not stored in limiter keys. Redis failure closes the protected operation with a sanitized 503 response. Limits and window length are environment-configurable. Forwarded client IPs are trusted only when `API_TRUST_PROXY=true` is explicitly configured for a deployment behind a trusted proxy.

`AuthTokenDelivery` is the provider-neutral email handoff. Production defaults to an explicitly unavailable adapter rather than pretending delivery occurred. The memory adapter captures raw tokens only in development/tests and is not reachable through HTTP. Password-reset request responses are deliberately identical for known and unknown accounts, including internal delivery failure. A production email provider remains required before launch.

Pino redacts Authorization, Cookie, password, new-password, token, and session-token fields. Operational request IDs and status logging remain available.

Deferred work includes a real email provider, Google/GitHub OAuth, MFA, passkeys, advanced bot protection, Studio UI, and any future CSRF-token mechanism required by expanded cross-site flows.
