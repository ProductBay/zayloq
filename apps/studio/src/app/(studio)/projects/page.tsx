import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
export default function ProjectsPage() { return <div className="page-stack"><header className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Projects</h1><p>Your Zayloq-built products will be organized here.</p></div><Link href="/projects/new" className="primary-button small"><Plus /> Create project</Link></header><div className="surface-card"><EmptyState eyebrow="Project library" title="No projects yet" description="Project persistence is coming next. Start with a clear description of what you want to build." action={<Link href="/projects/new" className="text-link">Open the project composer <ArrowRight /></Link>} /></div></div>; }
