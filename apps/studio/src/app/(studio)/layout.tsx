import { ProtectedGate } from "@/components/auth/auth-gates";
import { StudioShell } from "@/components/layout/studio-shell";
export default function ProtectedLayout({ children }: { children: React.ReactNode }) { return <ProtectedGate><StudioShell>{children}</StudioShell></ProtectedGate>; }
