"use client";

import { Braces, Database, Eye, FileCode2, Hammer, Rocket, TerminalSquare } from "lucide-react";
import { useState } from "react";
import { AiComposer } from "./ai-composer";

const tabs = ["Preview", "Files", "Database", "Logs", "Build"] as const;
type Tab = typeof tabs[number];

function WorkspacePanel({ tab }: { tab: Tab }) {
  const content: Record<Tab, [React.ElementType, string, string]> = {
    Preview: [Eye, "Preview unavailable", "A live runtime preview will appear here after project generation and isolated builds are implemented."],
    Files: [FileCode2, "No generated files", "Generated project files will appear here. No source files have been fabricated."],
    Database: [Database, "Project database not provisioned", "This panel will manage databases belonging to generated customer projects—not Zayloq's control-plane database."],
    Logs: [TerminalSquare, "No runtime logs", "Build and preview logs will appear once an isolated runtime exists."],
    Build: [Hammer, "Build pipeline not connected", "Planning, generation, installation, validation, repair, and preview stages will be reported here."],
  };
  const [Icon, title, description] = content[tab];
  return <div className="workspace-empty"><div><Icon /><span>Future capability</span></div><h2>{title}</h2><p>{description}</p></div>;
}

export function WorkspaceShell({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<Tab>("Preview");
  return <section className="workspace"><header className="workspace-header"><div><span className="eyebrow">Workspace shell</span><h1>Untitled project</h1><p>ID: {projectId}</p></div><div><button className="secondary-button" disabled><Eye /> Preview</button><button className="primary-button small" disabled><Rocket /> Deploy</button></div></header><div className="workspace-grid"><aside className="ai-panel"><div className="panel-label"><Braces /> Zayloq AI</div><div className="conversation-empty"><SparkIcon /><h2>Start with an idea</h2><p>Describe the product you want to create. AI planning is not connected yet.</p></div><AiComposer compact /></aside><div className="runtime-panel"><div role="tablist" aria-label="Project workspace panels" className="workspace-tabs">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div><WorkspacePanel tab={tab} /></div></div></section>;
}

function SparkIcon() { return <div className="spark-icon"><Braces /></div>; }
