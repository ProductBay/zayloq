"use client";
import { useAuth } from "@/components/auth/auth-provider";
import { Dashboard } from "@/components/dashboard/dashboard";
export default function DashboardPage() { const { user } = useAuth(); return user ? <Dashboard user={user} /> : null; }
