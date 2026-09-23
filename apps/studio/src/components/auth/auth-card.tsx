import { Logo } from "../ui/logo";

export function AuthCard({ eyebrow, title, description, children, footer }: { eyebrow: string; title: string; description: string; children: React.ReactNode; footer: React.ReactNode }) {
  return <main className="auth-page"><div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" /><section className="auth-card"><Logo /><div className="auth-heading"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}<div className="auth-footer">{footer}</div></section><p className="auth-security">Secure, server-managed sessions. Your credentials stay private.</p></main>;
}
