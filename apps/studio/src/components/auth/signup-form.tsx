"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "./auth-provider";

export function SignupForm() {
  const { register } = useAuth(); const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    try { await register(String(data.get("email")), String(data.get("password")), String(data.get("displayName") || "") || undefined); router.replace("/verify-email"); }
    catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Your account could not be created."); setBusy(false); }
  }
  return <form onSubmit={submit} className="auth-form"><label>Display name <span className="optional">Optional</span><input name="displayName" autoComplete="name" maxLength={160} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={320} /></label><label>Password<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} aria-describedby="password-help" /><small id="password-help">Use at least 12 characters. Passphrases work well.</small></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <>Create account <ArrowRight /></>}</button><p className="legal-copy">By continuing, you agree to Zayloq&apos;s <Link href="https://zayloq.ai/terms">Terms</Link> and <Link href="https://zayloq.ai/privacy">Privacy Policy</Link>.</p></form>;
}
