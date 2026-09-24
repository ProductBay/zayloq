import { apiRequest } from "./client";
import type { Organization, Project, ProjectEnvironment } from "./types";
export const organizationApi = {
  list: () => apiRequest<{ organizations: Organization[] }>("/v1/organizations"),
  create: (name: string) => apiRequest<{ organization: Organization }>("/v1/organizations", { method: "POST", body: JSON.stringify({ name }) }),
  update: (id: string, name: string) => apiRequest<{ organization: Organization }>(`/v1/organizations/${id}`, { method: "PATCH", body: JSON.stringify({ name }) })
};
export const projectApi = {
  list: (organizationId?: string, includeArchived = false) => { const query = new URLSearchParams(); if (organizationId) query.set("organizationId", organizationId); if (includeArchived) query.set("includeArchived", "true"); return apiRequest<{ projects: Project[] }>(`/v1/projects${query.size ? `?${query}` : ""}`); },
  get: (id: string) => apiRequest<{ project: Project }>(`/v1/projects/${id}`),
  create: (input: { name: string; prompt?: string; organizationId?: string }) => apiRequest<{ project: Project; environment: ProjectEnvironment; promptPersisted: false }>("/v1/projects", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, name: string) => apiRequest<{ project: Project }>(`/v1/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  archive: (id: string) => apiRequest<{ project: Project }>(`/v1/projects/${id}/archive`, { method: "POST" }),
  environments: (id: string) => apiRequest<{ environments: ProjectEnvironment[] }>(`/v1/projects/${id}/environments`)
};
