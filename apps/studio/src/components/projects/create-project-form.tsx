"use client";
import { ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { projectApi } from "@/lib/api/control-plane-service";
import { useOrganization } from "../organizations/organization-provider";
export function CreateProjectForm() {
  const router = useRouter(); const organization = useOrganization(); const [name, setName] = useState(""); const [prompt, setPrompt] = useState(""); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSubmitting(true); setError(""); try { const result = await projectApi.create({ name, prompt, organizationId: organization.current?.id }); await organization.refresh(); router.push(`/projects/${result.project.id}`); } catch (cause) { if (cause instanceof ApiClientError && cause.status === 401) router.replace("/login?next=%2Fprojects%2Fnew"); else setError(cause instanceof ApiClientError ? cause.message : "The project could not be created."); setSubmitting(false); } }
  return <form className="composer project-form" onSubmit={submit}><label htmlFor="project-name">Project name</label><input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} placeholder="Customer portal" /><label htmlFor="build-prompt"><Sparkles /> What do you want to build?</label><textarea id="build-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} required maxLength={20000} rows={7} placeholder="Describe the outcome, audience, and important workflows…" /><p className="form-note">The project will be saved now. This prompt will not be persisted until the planning schema is introduced.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="composer-actions"><span>Creates a DEVELOPMENT environment</span><button className="composer-submit" disabled={submitting || !name.trim() || !prompt.trim()}>{submitting ? "Creating…" : "Create project"} <ArrowUp /></button></div></form>;
}
