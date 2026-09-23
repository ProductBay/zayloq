import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/recovery-forms";
export default function ResetPasswordPage() { return <AuthCard eyebrow="Secure reset" title="Choose a new password" description="Resetting your password will revoke existing sessions." footer={<Link href="/login">Return to sign in</Link>}><Suspense fallback={null}><ResetPasswordForm /></Suspense></AuthCard>; }
