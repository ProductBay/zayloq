"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api/auth-service";
import type { PublicUser } from "@/lib/api/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "unavailable";
interface AuthContextValue { status: AuthStatus; user: PublicUser | null; refresh: () => Promise<void>; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, displayName?: string) => Promise<void>; logout: () => Promise<void>; }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<PublicUser | null>(null);
  const refresh = useCallback(async () => {
    try { const result = await authApi.session(); setUser(result.user ?? null); setStatus(result.authenticated && result.user ? "authenticated" : "unauthenticated"); }
    catch { setUser(null); setStatus("unavailable"); }
  }, []);
  useEffect(() => {
    let active = true;
    void authApi.session().then((result) => {
      if (!active) return;
      setUser(result.user ?? null);
      setStatus(result.authenticated && result.user ? "authenticated" : "unauthenticated");
    }).catch(() => {
      if (!active) return;
      setUser(null);
      setStatus("unavailable");
    });
    return () => { active = false; };
  }, []);
  const login = useCallback(async (email: string, password: string) => { const result = await authApi.login(email, password); setUser(result.user); setStatus("authenticated"); }, []);
  const register = useCallback(async (email: string, password: string, displayName?: string) => { const result = await authApi.register(email, password, displayName); setUser(result.user); setStatus("authenticated"); }, []);
  const logout = useCallback(async () => { try { await authApi.logout(); } finally { setUser(null); setStatus("unauthenticated"); router.replace("/login"); router.refresh(); } }, [router]);
  const value = useMemo(() => ({ status, user, refresh, login, register, logout }), [status, user, refresh, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider."); return value; }
