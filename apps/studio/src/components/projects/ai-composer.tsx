"use client";

import { ArrowUp, Paperclip, Sparkles } from "lucide-react";
import { useState } from "react";

export function AiComposer({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState(""); const [notice, setNotice] = useState("");
  function submit(event: React.FormEvent) { event.preventDefault(); if (!prompt.trim()) return; setNotice("Project creation and AI planning arrive in a future phase. Your prompt has not been submitted or stored."); }
  return <form className={`composer ${compact ? "compact" : ""}`} onSubmit={submit}><label htmlFor="build-prompt"><Sparkles /> What do you want to build?</label><textarea id="build-prompt" value={prompt} onChange={(event) => { setPrompt(event.target.value); setNotice(""); }} rows={compact ? 4 : 7} placeholder="Describe your website, app, marketplace, SaaS, or internal tool…" onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") event.currentTarget.form?.requestSubmit(); }} /><div className="composer-actions"><button type="button" className="icon-button" disabled title="Attachments are coming later" aria-label="Add attachment (coming later)"><Paperclip /></button><span>⌘ Enter to submit</span><button className="composer-submit" disabled={!prompt.trim()}>Prepare with Zayloq <ArrowUp /></button></div>{notice && <p className="composer-notice" role="status">{notice}</p>}</form>;
}
