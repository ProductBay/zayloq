import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/recovery-forms";
export default function VerifyEmailPage() { return <AuthCard eyebrow="Account security" title="Verify your email" description="Verification helps protect your Zayloq identity." footer={<Link href="/dashboard">Continue to dashboard</Link>}><Suspense fallback={null}><VerifyEmailForm /></Suspense></AuthCard>; }
