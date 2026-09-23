import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { PublicOnlyGate } from "@/components/auth/auth-gates";
import { SignupForm } from "@/components/auth/signup-form";
export default function SignupPage() { return <PublicOnlyGate><AuthCard eyebrow="Start building" title="Create your Zayloq account" description="Your production workspace begins here." footer={<>Already have an account? <Link href="/login">Sign in</Link></>}><SignupForm /></AuthCard></PublicOnlyGate>; }
