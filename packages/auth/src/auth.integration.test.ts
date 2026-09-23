import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthProvider, connectDatabase, disconnectDatabase, getDatabaseClient } from "@zayloq/database";
import { AuthService } from "./auth-service.js";
import { hashToken } from "./crypto/index.js";
import { AccountAlreadyExistsError, ExpiredTokenError, InvalidCredentialsError, SessionExpiredError, SessionNotFoundError, SessionRevokedError, TokenAlreadyUsedError } from "./errors/index.js";

test("production authentication lifecycle against PostgreSQL", { skip: process.env.AUTH_INTEGRATION_TEST !== "1", timeout: 120_000 }, async () => {
  const db = getDatabaseClient();
  await connectDatabase();
  const auth = new AuthService(undefined, db);
  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `auth-smoke-${unique}@example.test`;
  const oldPassword = "correct horse battery staple old";
  const newPassword = "correct horse battery staple new";
  let userId: string | undefined;

  try {
    const registration = await auth.registration.register({ email: `  ${email.toUpperCase()}  `, password: oldPassword, displayName: "Auth Smoke" });
    userId = registration.user.id;
    assert.equal(registration.user.email, email);
    assert.equal("passwordHash" in registration.user, false);
    const credential = await db.userCredential.findUniqueOrThrow({ where: { userId_provider: { userId, provider: AuthProvider.PASSWORD } } });
    assert.notEqual(credential.passwordHash, oldPassword);
    assert.match(credential.passwordHash ?? "", /^\$argon2id\$/);
    const verificationRecord = await db.emailVerificationToken.findUniqueOrThrow({ where: { tokenHash: hashToken(registration.emailVerificationToken) } });
    assert.notEqual(verificationRecord.tokenHash, registration.emailVerificationToken);
    await assert.rejects(() => auth.registration.register({ email, password: oldPassword }), AccountAlreadyExistsError);

    const verified = await auth.emailVerification.consumeEmailVerificationToken(registration.emailVerificationToken);
    assert.ok(verified.user.emailVerifiedAt);
    await assert.rejects(() => auth.emailVerification.consumeEmailVerificationToken(registration.emailVerificationToken), TokenAlreadyUsedError);
    await assert.rejects(() => auth.authentication.authenticateWithPassword({ email, password: "wrong password long enough" }), InvalidCredentialsError);
    await assert.rejects(() => auth.authentication.authenticateWithPassword({ email: `missing-${unique}@example.test`, password: oldPassword }), InvalidCredentialsError);

    const login = await auth.authentication.authenticateWithPassword({ email, password: oldPassword, ipAddress: "127.0.0.1", userAgent: "zayloq-auth-smoke" });
    const storedSession = await db.authSession.findUniqueOrThrow({ where: { tokenHash: hashToken(login.token) } });
    assert.notEqual(storedSession.tokenHash, login.token);
    assert.equal((await auth.sessions.validateSession(login.token)).user.id, userId);
    await assert.rejects(() => auth.sessions.validateSession("invalid-session-token"), SessionNotFoundError);
    await auth.sessions.revokeSession(login.token, "test_revoke");
    await assert.rejects(() => auth.sessions.validateSession(login.token), SessionRevokedError);

    const expired = await auth.sessions.createSession({ userId });
    await db.authSession.update({ where: { id: expired.session.id }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    await assert.rejects(() => auth.sessions.validateSession(expired.token), SessionExpiredError);
    const firstActive = await auth.sessions.createSession({ userId });
    const secondActive = await auth.sessions.createSession({ userId });
    assert.equal(await auth.sessions.revokeAllUserSessions(userId, "test_all"), 2);
    await assert.rejects(() => auth.sessions.validateSession(firstActive.token), SessionRevokedError);
    await assert.rejects(() => auth.sessions.validateSession(secondActive.token), SessionRevokedError);

    const expiredVerification = await auth.emailVerification.createEmailVerificationToken(userId);
    await db.emailVerificationToken.update({ where: { tokenHash: hashToken(expiredVerification.token) }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    await assert.rejects(() => auth.emailVerification.consumeEmailVerificationToken(expiredVerification.token), ExpiredTokenError);

    const resetSession = await auth.authentication.authenticateWithPassword({ email, password: oldPassword });
    const reset = await auth.passwordReset.createPasswordResetToken(userId);
    assert.notEqual((await db.passwordResetToken.findUniqueOrThrow({ where: { tokenHash: hashToken(reset.token) } })).tokenHash, reset.token);
    assert.ok((await auth.passwordReset.consumePasswordResetToken(reset.token, newPassword)).revokedSessionCount >= 1);
    await assert.rejects(() => auth.passwordReset.consumePasswordResetToken(reset.token, newPassword), TokenAlreadyUsedError);
    await assert.rejects(() => auth.sessions.validateSession(resetSession.token), SessionRevokedError);
    await assert.rejects(() => auth.authentication.authenticateWithPassword({ email, password: oldPassword }), InvalidCredentialsError);
    assert.equal((await auth.authentication.authenticateWithPassword({ email, password: newPassword })).user.id, userId);

    const expiredReset = await auth.passwordReset.createPasswordResetToken(userId);
    await db.passwordResetToken.update({ where: { tokenHash: hashToken(expiredReset.token) }, data: { expiresAt: new Date(Date.now() - 1_000) } });
    await assert.rejects(() => auth.passwordReset.consumePasswordResetToken(expiredReset.token, oldPassword), ExpiredTokenError);
  } finally {
    if (userId) await db.user.deleteMany({ where: { id: userId, email } });
    await disconnectDatabase();
  }
});
