"use client";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/lib/api/client";
import { projectApi } from "@/lib/api/control-plane-service";
import type { Project } from "@/lib/api/types";
import { useOrganization } from "../organizations/organization-provider";
import { EmptyState } from "../ui/states";

export function ProjectList({ compact = false, onCount }: { compact?: boolean; onCount?(count: number): void }) {
  const organization = useOrganization(); const organizationId = organization.current?.id; const router = useRouter(); const [projects, setProjects] = useState<Project[]>([]); const [loadedFor, setLoadedFor] = useState<string>(); const [error, setError] = useState("");
  useEffect(() => { let active = true; projectApi.list(organizationId).then((result) => { if (!active) return; setProjects(result.projects); setError(""); setLoadedFor(organizationId ?? "all"); onCount?.(result.projects.length); }).catch((cause) => { if (!active) return; if (cause instanceof ApiClientError && cause.status === 401) router.replace("/login?next=%2Fprojects"); else setError(cause instanceof ApiClientError ? cause.message : "Projects could not be loaded."); setLoadedFor(organizationId ?? "all"); }); return () => { active = false; }; }, [organizationId, onCount, router]);
  if (loadedFor !== (organizationId ?? "all") || organization.loading) return <div className="data-state" role="status">Loading projects…</div>;
  if (error || organization.error) return <div className="data-state error" role="alert">{error || organization.error}<button className="secondary-button" onClick={() => location.reload()}>Try again</button></div>;
  if (!projects.length) return <EmptyState eyebrow="Project library" title="No projects yet" description="Create your first persisted project. Zayloq will also create its development control-plane environment." action={<Link href="/projects/new" className="text-link">Create your first project <ArrowRight /></Link>} />;
  return <div className={`project-list ${compact ? "compact" : ""}`}>{projects.slice(0, compact ? 5 : undefined).map((project) => <Link href={`/projects/${project.id}`} key={project.id} className="project-row"><div><strong>{project.name}</strong><span>{organization.organizations.find((item) => item.id === project.organizationId)?.name ?? "Organization"} · {project.status.toLowerCase()}</span></div><time>{new Date(project.updatedAt).toLocaleDateString()}</time><ArrowRight /></Link>)}</div>;
}

export function ProjectsView() { return <div className="page-stack"><header className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Projects</h1><p>Persisted projects in {useOrganization().current?.name ?? "your organizations"}.</p></div><Link href="/projects/new" className="primary-button small"><Plus /> Create project</Link></header><div className="surface-card"><ProjectList /></div></div>; }
