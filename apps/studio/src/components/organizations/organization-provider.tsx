"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import { organizationApi } from "@/lib/api/control-plane-service";
import type { Organization } from "@/lib/api/types";
type State = { organizations: Organization[]; current: Organization | null; loading: boolean; error: string; select(id: string): void; refresh(): Promise<void>; };
const Context = createContext<State | null>(null);
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]); const [selected, setSelected] = useState<string>(); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const refresh = useCallback(async () => { setLoading(true); setError(""); try { const result = await organizationApi.list(); setOrganizations(result.organizations); setSelected((value) => result.organizations.some((item) => item.id === value) ? value : result.organizations[0]?.id); } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Organizations could not be loaded."); } finally { setLoading(false); } }, []);
  useEffect(() => { let active = true; organizationApi.list().then((result) => { if (!active) return; setOrganizations(result.organizations); setSelected(result.organizations[0]?.id); }).catch((cause) => { if (active) setError(cause instanceof ApiClientError ? cause.message : "Organizations could not be loaded."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const current = organizations.find((item) => item.id === selected) ?? null;
  const value = useMemo(() => ({ organizations, current, loading, error, select: setSelected, refresh }), [organizations, current, loading, error, refresh]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useOrganization() { const value = useContext(Context); if (!value) throw new Error("useOrganization must be used inside OrganizationProvider"); return value; }
