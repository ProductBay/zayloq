import type { PublicApiError } from "./types";

const configuredUrl = process.env.NEXT_PUBLIC_ZAYLOQ_API_URL ?? "http://localhost:4000";
export const API_BASE_URL = configuredUrl.replace(/\/$/, "");

export class ApiClientError extends Error {
  constructor(readonly code: string, message: string, readonly status: number) { super(message); this.name = "ApiClientError"; }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers }
    });
  } catch {
    throw new ApiClientError("API_UNAVAILABLE", "Zayloq is temporarily unavailable. Please try again.", 0);
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => null) as { error?: PublicApiError } | null;
  if (!response.ok) {
    const publicError = payload?.error;
    throw new ApiClientError(publicError?.code ?? "REQUEST_FAILED", publicError?.message ?? "The request could not be completed.", response.status);
  }
  return payload as T;
}
