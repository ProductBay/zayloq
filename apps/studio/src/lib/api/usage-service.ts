import { apiRequest } from "./client";
import type { AiUsageEvent, CreditLedgerEntry, CreditSummary } from "./types";
const query = (organizationId: string) => `organizationId=${encodeURIComponent(organizationId)}`;
export const usageApi = {
  usage: (organizationId: string) => apiRequest<{ usage: AiUsageEvent[] }>(`/v1/ai/usage?${query(organizationId)}`),
  credits: (organizationId: string) => apiRequest<{ credits: CreditSummary }>(`/v1/billing/credits?${query(organizationId)}`),
  ledger: (organizationId: string) => apiRequest<{ ledger: CreditLedgerEntry[] }>(`/v1/billing/credits/ledger?${query(organizationId)}`)
};
