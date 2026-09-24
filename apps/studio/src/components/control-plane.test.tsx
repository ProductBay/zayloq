import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { organizationApi, projectApi } from "@/lib/api/control-plane-service";
import { OrganizationProvider } from "./organizations/organization-provider";
import { ProjectsView } from "./projects/project-list";
import { CreateProjectForm } from "./projects/create-project-form";
import { WorkspaceShell } from "./projects/workspace-shell";

const push = vi.fn(); const replace = vi.fn(); const refresh = vi.fn();
const router = { push, replace, refresh };
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/projects", useSearchParams: () => new URLSearchParams() }));
vi.mock("@/lib/api/control-plane-service", () => ({ organizationApi: { list: vi.fn() }, projectApi: { get: vi.fn(), environments: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), archive: vi.fn() } }));
const organization = { id: "11111111-1111-4111-8111-111111111111", name: "Builder's organization", slug: "builder", status: "ACTIVE" as const, role: "OWNER" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
const project = { id: "22222222-2222-4222-8222-222222222222", organizationId: organization.id, name: "Customer portal", slug: "customer-portal", status: "ACTIVE" as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
beforeEach(() => { vi.clearAllMocks(); vi.mocked(organizationApi.list).mockResolvedValue({ organizations: [organization] }); vi.mocked(projectApi.list).mockResolvedValue({ projects: [project] }); vi.mocked(projectApi.get).mockResolvedValue({ project }); vi.mocked(projectApi.environments).mockResolvedValue({ environments: [{ id: "env-1", projectId: project.id, type: "DEVELOPMENT", createdAt: project.createdAt, updatedAt: project.updatedAt }] }); }); afterEach(cleanup);
const withOrganization = (node: React.ReactNode) => render(<OrganizationProvider>{node}</OrganizationProvider>);
describe("persisted Studio project flow", () => {
  it("renders real organization projects", async () => { withOrganization(<ProjectsView />); expect(await screen.findByText("Customer portal")).toBeInTheDocument(); });
  it("renders the persisted-project empty state", async () => { vi.mocked(projectApi.list).mockResolvedValue({ projects: [] }); withOrganization(<ProjectsView />); expect(await screen.findByText("No projects yet")).toBeInTheDocument(); });
  it("creates a project and navigates to the returned real id", async () => { vi.mocked(projectApi.create).mockResolvedValue({ project, environment: { id: "env-1", projectId: project.id, type: "DEVELOPMENT", createdAt: project.createdAt, updatedAt: project.updatedAt }, promptPersisted: false }); withOrganization(<CreateProjectForm />); await userEvent.type(screen.getByLabelText("Project name"), project.name); await userEvent.type(screen.getByLabelText("What do you want to build?"), "Build a customer portal"); await userEvent.click(screen.getByRole("button", { name: /Create project/ })); await waitFor(() => expect(push).toHaveBeenCalledWith(`/projects/${project.id}`)); });
  it("loads real workspace context and renames then archives with confirmation", async () => { vi.mocked(projectApi.update).mockResolvedValue({ project: { ...project, name: "Renamed portal" } }); vi.mocked(projectApi.archive).mockResolvedValue({ project: { ...project, status: "ARCHIVED" } }); vi.spyOn(window, "confirm").mockReturnValue(true); withOrganization(<WorkspaceShell projectId={project.id} />); expect(await screen.findByText("Customer portal")).toBeInTheDocument(); expect(screen.getByText(/DEVELOPMENT/)).toBeInTheDocument(); await userEvent.click(screen.getByRole("tab", { name: "Settings" })); const input = screen.getByLabelText("Project name"); await userEvent.clear(input); await userEvent.type(input, "Renamed portal"); await userEvent.click(screen.getByRole("button", { name: "Save name" })); await waitFor(() => expect(projectApi.update).toHaveBeenCalled()); await userEvent.click(screen.getByRole("button", { name: "Archive project" })); await waitFor(() => expect(projectApi.archive).toHaveBeenCalled()); expect(push).toHaveBeenCalledWith("/projects"); });
});
