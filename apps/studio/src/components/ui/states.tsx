import { AlertTriangle, LoaderCircle, SearchX } from "lucide-react";

export function FullPageState({ kind, title, description }: { kind: "loading" | "error" | "not-found"; title: string; description: string }) {
  const Icon = kind === "loading" ? LoaderCircle : kind === "error" ? AlertTriangle : SearchX;
  return <main className="full-state"><div className="state-icon"><Icon className={kind === "loading" ? "spin" : ""} aria-hidden /></div><h1>{title}</h1><p>{description}</p></main>;
}

export function EmptyState({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <section className="empty-state">{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2><p>{description}</p>{action}</section>;
}
