import { ProtectedGate } from "@/components/auth/auth-gates";
import { StudioShell } from "@/components/layout/studio-shell";
import { OrganizationProvider } from "@/components/organizations/organization-provider";
export default function ProtectedLayout({ children }: { children: React.ReactNode }) { return <ProtectedGate><OrganizationProvider><StudioShell>{children}</StudioShell></OrganizationProvider></ProtectedGate>; }
