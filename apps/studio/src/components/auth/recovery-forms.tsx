"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { authApi } from "@/lib/api/auth-service";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "./auth-provider";

function Message({ text, error = false }: { text: string; error?: boolean }) { return <div className={error ? "form-error" : "form-success"} role={error ? "alert" : "status"}>{!error && <CheckCircle2 />}{text}</div>; }

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget); try { const result = await authApi.requestPasswordReset(String(data.get("email"))); setMessage(result.message); } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "The request could not be completed."); } finally { setBusy(false); } }
  return <form onSubmit={submit} className="auth-form"><label>Email address<input name="email" type="email" autoComplete="email" required /></label>{message && <Message text={message} />}{error && <Message text={error} error />}<button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : "Request reset instructions"}</button></form>;
}

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? ""; const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget); try { await authApi.confirmPasswordReset(token, String(data.get("password"))); setMessage("Your password has been reset. You can now sign in."); } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "The password could not be reset."); } finally { setBusy(false); } }
  if (!token) return <Message text="This reset link is missing its secure token. Request a new link." error />;
  return <form onSubmit={submit} className="auth-form"><label>New password<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} /></label>{message && <Message text={message} />}{error && <Message text={error} error />}<button className="primary-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : "Set new password"}</button></form>;
}

export function VerifyEmailForm() {
  const token = useSearchParams().get("token") ?? ""; const { user, refresh } = useAuth(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  async function request() { setBusy(true); setError(""); try { const result = await authApi.requestVerification(); setMessage(result.message); } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Verification could not be requested."); } finally { setBusy(false); } }
  async function confirm() { setBusy(true); setError(""); try { await authApi.confirmVerification(token); await refresh(); setMessage("Your email is verified."); } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Verification could not be completed."); } finally { setBusy(false); } }
  return <div className="auth-form">{user?.emailVerified ? <Message text="Your email is already verified." /> : <><p className="form-note">{token ? "Confirm this verification link to secure your account." : `We can send verification instructions for ${user?.email ?? "your account"}.`}</p>{message && <Message text={message} />}{error && <Message text={error} error />}<button type="button" className="primary-button" disabled={busy || (!token && !user)} onClick={() => void (token ? confirm() : request())}>{busy ? <LoaderCircle className="spin" /> : token ? "Verify email" : "Request verification instructions"}</button></>}</div>;
}
