export interface SafeUser { id: string; email: string; displayName: string | null; emailVerifiedAt: Date | null; createdAt: Date; updatedAt: Date; }
export interface SafeSession { id: string; userId: string; status: "ACTIVE" | "REVOKED" | "EXPIRED"; expiresAt: Date; lastSeenAt: Date | null; revokedAt: Date | null; revokeReason: string | null; createdAt: Date; updatedAt: Date; }
export interface SessionResult { token: string; session: SafeSession; }
export interface AuthenticationResult extends SessionResult { user: SafeUser; }
export interface ValidatedSession { session: SafeSession; user: SafeUser; }
export interface RegistrationResult { user: SafeUser; emailVerificationToken: string; emailVerificationExpiresAt: Date; }
export interface EmailVerificationResult { user: SafeUser; verifiedAt: Date; }
export interface PasswordResetResult { userId: string; passwordChangedAt: Date; revokedSessionCount: number; }

type UserShape = { id: string; email: string; displayName: string | null; emailVerifiedAt: Date | null; createdAt: Date; updatedAt: Date };
type SessionShape = { id: string; userId: string; status: "ACTIVE" | "REVOKED" | "EXPIRED"; expiresAt: Date; lastSeenAt: Date | null; revokedAt: Date | null; revokeReason: string | null; createdAt: Date; updatedAt: Date };
export function toSafeUser(user: UserShape): SafeUser { return { id: user.id, email: user.email, displayName: user.displayName, emailVerifiedAt: user.emailVerifiedAt, createdAt: user.createdAt, updatedAt: user.updatedAt }; }
export function toSafeSession(session: SessionShape): SafeSession { return { id: session.id, userId: session.userId, status: session.status, expiresAt: session.expiresAt, lastSeenAt: session.lastSeenAt, revokedAt: session.revokedAt, revokeReason: session.revokeReason, createdAt: session.createdAt, updatedAt: session.updatedAt }; }
