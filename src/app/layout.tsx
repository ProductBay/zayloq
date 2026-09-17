import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zayloq — Describe it. Build it. Launch it.",
  description:
    "Zayloq is an AI-powered business and software builder by A'Dash Technologies. Built for the Caribbean. Engineered for the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
