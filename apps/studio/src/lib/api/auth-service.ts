import { apiRequest } from "./client";
import type { AuthenticatedResponse, PublicUser, SessionResponse } from "./types";

export const authApi = {
  session: () => apiRequest<SessionResponse>("/v1/auth/session"),
  me: () => apiRequest<{ user: PublicUser }>("/v1/auth/me"),
  login: (email: string, password: string) => apiRequest<AuthenticatedResponse>("/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, displayName?: string) => apiRequest<AuthenticatedResponse>("/v1/auth/register", { method: "POST", body: JSON.stringify({ email, password, ...(displayName ? { displayName } : {}) }) }),
  logout: () => apiRequest<void>("/v1/auth/logout", { method: "POST" }),
  logoutAll: () => apiRequest<void>("/v1/auth/logout-all", { method: "POST" }),
  requestVerification: () => apiRequest<{ message: string }>("/v1/auth/email-verification/request", { method: "POST" }),
  confirmVerification: (token: string) => apiRequest<{ user: PublicUser }>("/v1/auth/email-verification/confirm", { method: "POST", body: JSON.stringify({ token }) }),
  requestPasswordReset: (email: string) => apiRequest<{ message: string }>("/v1/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) }),
  confirmPasswordReset: (token: string, newPassword: string) => apiRequest<{ passwordReset: boolean }>("/v1/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token, newPassword }) })
};
