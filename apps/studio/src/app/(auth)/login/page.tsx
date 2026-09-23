import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { PublicOnlyGate } from "@/components/auth/auth-gates";
import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() { return <PublicOnlyGate><AuthCard eyebrow="Welcome back" title="Sign in to your Studio" description="Continue building products and businesses with Zayloq." footer={<>New to Zayloq? <Link href="/signup">Create an account</Link></>}><Suspense fallback={null}><LoginForm /></Suspense></AuthCard></PublicOnlyGate>; }
