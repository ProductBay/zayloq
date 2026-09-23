import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth/auth-provider";
import { ProtectedGate } from "./auth/auth-gates";
import { LoginForm } from "./auth/login-form";
import { SignupForm } from "./auth/signup-form";
import { AiComposer } from "./projects/ai-composer";
import { WorkspaceShell } from "./projects/workspace-shell";
import { StudioShell } from "./layout/studio-shell";
import { ApiClientError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth-service";

const replace = vi.fn(); const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }), usePathname: () => "/dashboard", useSearchParams: () => new URLSearchParams() }));
vi.mock("@/lib/api/auth-service", () => ({ authApi: { session: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() } }));

const user = { id: "user-1", email: "builder@example.test", displayName: "Builder", emailVerified: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
const session = { id: "session-1", expiresAt: new Date(Date.now() + 60_000).toISOString(), lastSeenAt: null };

beforeEach(() => { vi.clearAllMocks(); vi.mocked(authApi.session).mockResolvedValue({ authenticated: false }); });
afterEach(cleanup);

describe("authentication UI", () => {
  it("submits the login form and renders safe API errors", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiClientError("INVALID_CREDENTIALS", "The email or password is invalid.", 401));
    render(<AuthProvider><LoginForm /></AuthProvider>);
    await userEvent.type(screen.getByLabelText("Email address"), "builder@example.test");
    await userEvent.type(screen.getByLabelText(/Password/), "incorrect password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in to Studio" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("email or password is invalid");
  });

  it("submits the signup form through the auth service", async () => {
    vi.mocked(authApi.register).mockResolvedValue({ user, session });
    render(<AuthProvider><SignupForm /></AuthProvider>);
    await userEvent.type(screen.getByLabelText(/Display name/), "Builder");
    await userEvent.type(screen.getByLabelText("Email address"), user.email);
    await userEvent.type(screen.getByLabelText(/Password/), "correct horse battery staple");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(authApi.register).toHaveBeenCalledWith(user.email, "correct horse battery staple", "Builder"));
  });

  it("bootstraps a session and redirects protected unauthenticated routes", async () => {
    render(<AuthProvider><ProtectedGate><div>Protected content</div></ProtectedGate></AuthProvider>);
    await waitFor(() => expect(authApi.session).toHaveBeenCalled());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=%2Fdashboard"));
  });

  it("logs out through the API and clears UI state", async () => {
    vi.mocked(authApi.session).mockResolvedValue({ authenticated: true, user, session }); vi.mocked(authApi.logout).mockResolvedValue(undefined);
    function LogoutProbe() { const auth = useAuth(); return <button onClick={() => void auth.logout()}>Test logout</button>; }
    render(<AuthProvider><LogoutProbe /></AuthProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Test logout" }));
    await waitFor(() => expect(authApi.logout).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith("/login");
  });
});

describe("Studio foundation", () => {
  it("keeps create-project submission honest", async () => {
    render(<AiComposer />); await userEvent.type(screen.getByLabelText("What do you want to build?"), "Build a booking platform"); await userEvent.click(screen.getByRole("button", { name: /Prepare with Zayloq/ }));
    expect(screen.getByRole("status")).toHaveTextContent("has not been submitted or stored");
  });

  it("renders workspace shells without fabricated files or builds", async () => {
    render(<WorkspaceShell projectId="project-shell" />); expect(screen.getByText("Preview unavailable")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Files" })); expect(screen.getByText("No generated files")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Database" })); expect(screen.getByText(/control-plane database/)).toBeInTheDocument();
  });

  it("supports collapsible responsive navigation", async () => {
    vi.mocked(authApi.session).mockResolvedValue({ authenticated: true, user, session });
    render(<AuthProvider><StudioShell><div>Page</div></StudioShell></AuthProvider>);
    const menu = screen.getByRole("button", { name: "Open navigation" }); fireEvent.click(menu);
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();
  });
});
