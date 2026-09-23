"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { FullPageState } from "../ui/states";

export function ProtectedGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => { if (status === "unauthenticated") router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [status, router, pathname]);
  if (status === "loading") return <FullPageState kind="loading" title="Opening your Studio" description="Restoring your secure session…" />;
  if (status === "unavailable") return <FullPageState kind="error" title="Studio is temporarily unavailable" description="We could not reach the Zayloq API. Check your connection and try again." />;
  if (status !== "authenticated") return <FullPageState kind="loading" title="Redirecting" description="Taking you to sign in…" />;
  return children;
}

export function PublicOnlyGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth(); const router = useRouter();
  useEffect(() => { if (status === "authenticated") router.replace("/dashboard"); }, [status, router]);
  if (status === "loading") return <FullPageState kind="loading" title="Checking your session" description="One moment…" />;
  return children;
}
