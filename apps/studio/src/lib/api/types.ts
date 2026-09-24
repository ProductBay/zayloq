export interface PublicUser { id: string; email: string; displayName: string | null; emailVerified: boolean; createdAt: string; updatedAt: string; }
export interface PublicSession { id: string; expiresAt: string; lastSeenAt: string | null; }
export interface AuthenticatedResponse { user: PublicUser; session: PublicSession; }
export interface SessionResponse { authenticated: boolean; user?: PublicUser; session?: PublicSession; }
export interface PublicApiError { code: string; message: string; }
export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";
export interface Organization { id: string; name: string; slug: string; status: "ACTIVE" | "SUSPENDED" | "ARCHIVED"; role: MembershipRole; createdAt: string; updatedAt: string; }
export interface Project { id: string; organizationId: string; name: string; slug: string; status: "ACTIVE" | "SUSPENDED" | "ARCHIVED"; createdAt: string; updatedAt: string; }
export interface ProjectEnvironment { id: string; projectId: string; type: "DEVELOPMENT" | "PREVIEW" | "PRODUCTION"; createdAt: string; updatedAt: string; }
