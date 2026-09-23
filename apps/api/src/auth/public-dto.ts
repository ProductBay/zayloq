import type { SafeSession, SafeUser } from "@zayloq/auth";

export function publicUser(user: SafeUser) {
  return { id: user.id, email: user.email, displayName: user.displayName, emailVerified: user.emailVerifiedAt !== null, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() };
}

export function publicSession(session: SafeSession) {
  return { id: session.id, expiresAt: session.expiresAt.toISOString(), lastSeenAt: session.lastSeenAt?.toISOString() ?? null };
}
