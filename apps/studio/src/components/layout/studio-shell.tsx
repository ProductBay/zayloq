"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, ChevronDown, Cloud, FolderKanban, Gauge, Menu, Rocket, Settings, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/auth-provider";
import { Logo } from "../ui/logo";

const links = [
  ["/dashboard", "Dashboard", Gauge], ["/projects", "Projects", FolderKanban], ["/builds", "Builds", Box], ["/deployments", "Deployments", Rocket], ["/settings", "Settings", Settings]
] as const;

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const { user, logout } = useAuth(); const [open, setOpen] = useState(false); const [account, setAccount] = useState(false);
  return <div className="studio-root"><header className="studio-topbar"><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</button><Logo compact /><div className="environment-pill"><span /> Production Studio</div><div className="account-wrap"><button className="account-button" onClick={() => setAccount(!account)} aria-expanded={account}><span className="avatar">{(user?.displayName ?? user?.email ?? "Z")[0]?.toUpperCase()}</span><span className="account-copy"><strong>{user?.displayName ?? "Zayloq user"}</strong><small>{user?.email}</small></span><ChevronDown /></button>{account && <div className="account-menu"><div><strong>{user?.displayName ?? "Account"}</strong><span>{user?.email}</span></div><Link href="/settings" onClick={() => setAccount(false)}>Account settings</Link><button onClick={() => void logout()}>Sign out</button></div>}</div></header><aside className={`studio-sidebar ${open ? "is-open" : ""}`}><nav aria-label="Studio navigation">{links.map(([href, label, Icon]) => <Link key={href} href={href} className={pathname === href || (href === "/projects" && pathname.startsWith("/projects")) ? "active" : ""} onClick={() => setOpen(false)}><Icon />{label}{(label === "Builds" || label === "Deployments") && <small>Later</small>}</Link>)}</nav><div className="sidebar-foot"><Cloud /><div><strong>Control plane</strong><span>Connected securely</span></div></div></aside><main className="studio-main">{children}</main>{open && <button aria-label="Close navigation overlay" className="nav-overlay" onClick={() => setOpen(false)} />}</div>;
}
