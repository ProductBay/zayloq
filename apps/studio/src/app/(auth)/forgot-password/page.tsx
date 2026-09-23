import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/recovery-forms";
export default function ForgotPasswordPage() { return <AuthCard eyebrow="Account recovery" title="Reset your password" description="Enter your email and we’ll request secure reset instructions if an account exists." footer={<Link href="/login">Return to sign in</Link>}><ForgotPasswordForm /></AuthCard>; }
