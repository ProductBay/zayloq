"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "./auth-provider";

export function LoginForm() {
  const { login } = useAuth(); const router = useRouter(); const search = useSearchParams();
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    try { await login(String(data.get("email")), String(data.get("password"))); const next = search.get("next"); router.replace(next?.startsWith("/") ? next : "/dashboard"); }
    catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Sign in could not be completed."); setBusy(false); }
  }
  return <form onSubmit={submit} className="auth-form"><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={320} /></label><label><span className="label-row">Password<Link href="/forgot-password">Forgot password?</Link></span><input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <>Sign in to Studio <ArrowRight /></>}</button></form>;
}
