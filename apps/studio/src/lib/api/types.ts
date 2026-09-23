export interface PublicUser { id: string; email: string; displayName: string | null; emailVerified: boolean; createdAt: string; updatedAt: string; }
export interface PublicSession { id: string; expiresAt: string; lastSeenAt: string | null; }
export interface AuthenticatedResponse { user: PublicUser; session: PublicSession; }
export interface SessionResponse { authenticated: boolean; user?: PublicUser; session?: PublicSession; }
export interface PublicApiError { code: string; message: string; }
