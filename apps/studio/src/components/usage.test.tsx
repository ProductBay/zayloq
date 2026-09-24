import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usageApi } from "@/lib/api/usage-service";
import { OrganizationProvider } from "./organizations/organization-provider";
import { UsageView } from "./usage/usage-view";
vi.mock("@/lib/api/control-plane-service", () => ({ organizationApi: { list: vi.fn(async () => ({ organizations: [{ id: "11111111-1111-4111-8111-111111111111", name: "Usage org", slug: "usage", status: "ACTIVE", role: "OWNER", createdAt: "2026-01-01", updatedAt: "2026-01-01" }] })) } }));
vi.mock("@/lib/api/usage-service", () => ({ usageApi: { credits: vi.fn(), usage: vi.fn(), ledger: vi.fn() } }));
beforeEach(() => { vi.mocked(usageApi.credits).mockResolvedValue({ credits: { organizationId: "11111111-1111-4111-8111-111111111111", availableBalanceUnits: "2000000", reservedBalanceUnits: "0", lifetimeGrantedUnits: "2000000", lifetimeConsumedUnits: "500000", updatedAt: "2026-01-01" } }); vi.mocked(usageApi.usage).mockResolvedValue({ usage: [] }); vi.mocked(usageApi.ledger).mockResolvedValue({ ledger: [] }); }); afterEach(cleanup);
describe("usage and credits view", () => {
  it("shows persisted balances and honest empty states", async () => { render(<OrganizationProvider><UsageView /></OrganizationProvider>); expect(await screen.findByText("2")).toBeInTheDocument(); expect(screen.getByText("No AI usage yet")).toBeInTheDocument(); expect(screen.getByText("No credit activity yet")).toBeInTheDocument(); });
  it("shows persisted usage and ledger entries", async () => { vi.mocked(usageApi.usage).mockResolvedValue({ usage: [{ id: "event", provider: "OPENAI", providerModel: "fixture", logicalModelRole: "FAST", operationType: "PLAN", inputTokens: 10, cachedInputTokens: 2, outputTokens: 5, totalTokens: 15, providerCostMicros: "20", currency: "USD", creditsChargedUnits: "1000000", status: "COMPLETED", createdAt: "2026-01-01" }] }); vi.mocked(usageApi.ledger).mockResolvedValue({ ledger: [{ id: "entry", type: "CONSUMPTION", amountUnits: "-1000000", category: "AI_CONSUMPTION", description: null, createdAt: "2026-01-01" }] }); render(<OrganizationProvider><UsageView /></OrganizationProvider>); expect(await screen.findByText("PLAN")).toBeInTheDocument(); expect(screen.getByText("CONSUMPTION")).toBeInTheDocument(); });
});
