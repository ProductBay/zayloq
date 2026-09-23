import { WorkspaceShell } from "@/components/projects/workspace-shell";
export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <WorkspaceShell projectId={projectId} />; }
