import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = { title: { default: "Zayloq Studio", template: "%s · Zayloq Studio" }, description: "The Zayloq AI business and software building workspace." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><AuthProvider>{children}</AuthProvider></body></html>; }
