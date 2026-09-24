import type { EnvironmentType, MembershipRole, Organization, OrganizationStatus, Project, ProjectEnvironment, ProjectStatus } from "@zayloq/database";

export interface OrganizationDto { id: string; name: string; slug: string; status: OrganizationStatus; role: MembershipRole; createdAt: string; updatedAt: string; }
export interface MembershipDto { id: string; userId: string; email: string; displayName: string | null; role: MembershipRole; createdAt: string; updatedAt: string; }
export interface ProjectDto { id: string; organizationId: string; name: string; slug: string; status: ProjectStatus; createdAt: string; updatedAt: string; }
export interface EnvironmentDto { id: string; projectId: string; type: EnvironmentType; createdAt: string; updatedAt: string; }

export function organizationDto(organization: Organization, role: MembershipRole): OrganizationDto {
  return { id: organization.id, name: organization.name, slug: organization.slug, status: organization.status, role, createdAt: organization.createdAt.toISOString(), updatedAt: organization.updatedAt.toISOString() };
}
export function projectDto(project: Project): ProjectDto {
  return { id: project.id, organizationId: project.organizationId, name: project.name, slug: project.slug, status: project.status, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString() };
}
export function environmentDto(environment: ProjectEnvironment): EnvironmentDto {
  return { id: environment.id, projectId: environment.projectId, type: environment.type, createdAt: environment.createdAt.toISOString(), updatedAt: environment.updatedAt.toISOString() };
}
