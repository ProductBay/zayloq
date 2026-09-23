"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { FullPageState } from "@/components/ui/states";
export default function Home() { const { status } = useAuth(); const router = useRouter(); useEffect(() => { if (status === "authenticated") router.replace("/dashboard"); if (status === "unauthenticated") router.replace("/login"); }, [status, router]); return <FullPageState kind={status === "unavailable" ? "error" : "loading"} title={status === "unavailable" ? "Studio unavailable" : "Opening Zayloq Studio"} description={status === "unavailable" ? "The API could not be reached." : "Restoring your secure workspace…"} />; }
