"use client";
import { useEffect, useState } from "react";
import { useOrganization } from "../organizations/organization-provider";
import { EmptyState, FullPageState } from "../ui/states";
import { usageApi } from "@/lib/api/usage-service";
import type { AiUsageEvent, CreditLedgerEntry, CreditSummary } from "@/lib/api/types";
const credits = (units: string) => (Number(units) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 });
export function UsageView() {
  const organization = useOrganization();
  if (organization.loading || !organization.current) return <FullPageState kind="loading" title="Loading usage" description="Fetching persisted usage and credits…" />;
  return <OrganizationUsage key={organization.current.id} organizationId={organization.current.id} />;
}
function OrganizationUsage({ organizationId }: { organizationId: string }) {
  const [summary, setSummary] = useState<CreditSummary>(); const [usage, setUsage] = useState<AiUsageEvent[]>([]); const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; Promise.all([usageApi.credits(organizationId), usageApi.usage(organizationId), usageApi.ledger(organizationId)]).then(([creditResult, usageResult, ledgerResult]) => { if (active) { setSummary(creditResult.credits); setUsage(usageResult.usage); setLedger(ledgerResult.ledger); } }).catch(() => active && setError("Usage and credit data could not be loaded.")).finally(() => active && setLoading(false)); return () => { active = false; }; }, [organizationId]);
  if (loading) return <FullPageState kind="loading" title="Loading usage" description="Fetching persisted usage and credits…" />; if (error) return <FullPageState kind="error" title="Usage unavailable" description={error} />;
  return <div className="page-stack"><header className="page-heading"><div><span className="eyebrow">Accounting</span><h1>Usage & credits</h1><p>Persisted AI consumption and organization credit activity.</p></div></header><div className="metric-grid"><article className="surface-card"><span>Credits available</span><strong>{credits(summary?.availableBalanceUnits ?? "0")}</strong></article><article className="surface-card"><span>Credits reserved</span><strong>{credits(summary?.reservedBalanceUnits ?? "0")}</strong></article><article className="surface-card"><span>Credits used</span><strong>{credits(summary?.lifetimeConsumedUnits ?? "0")}</strong></article><article className="surface-card"><span>AI operations</span><strong>{usage.length}</strong></article></div><section className="surface-card"><h2>Recent usage</h2>{usage.length === 0 ? <EmptyState title="No AI usage yet" description="Metered AI operations will appear here after they run." /> : <div className="data-list">{usage.map((item) => <div key={item.id}><strong>{item.operationType}</strong><span>{item.providerModel} · {item.status} · {item.totalTokens ?? "—"} tokens · {credits(item.creditsChargedUnits)} credits</span></div>)}</div>}</section><section className="surface-card"><h2>Credit ledger</h2>{ledger.length === 0 ? <EmptyState title="No credit activity yet" description="Grants, reservations, consumption, and releases will appear here." /> : <div className="data-list">{ledger.map((item) => <div key={item.id}><strong>{item.type}</strong><span>{credits(item.amountUnits)} credits · {item.category}</span></div>)}</div>}</section></div>;
}
