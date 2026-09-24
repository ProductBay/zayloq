import { EnvironmentType, OrganizationStatus, ProjectStatus, getDatabaseClient, type PrismaClient } from "@zayloq/database";
import { ApiError } from "../auth/api-errors.js";
import { requirePermission } from "./policy.js";
import { environmentDto, projectDto, type EnvironmentDto, type ProjectDto } from "./public-dto.js";
import { OrganizationService } from "./organization-service.js";

function slugify(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "project"; }

export class ProjectService {
  constructor(private readonly db: PrismaClient = getDatabaseClient(), private readonly organizations = new OrganizationService(db)) {}

  private async membership(userId: string, organizationId: string) { return this.db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId } } }); }
  private async authorizedProject(userId: string, projectId: string, permission: "read" | "manage-projects") {
    const project = await this.db.project.findUnique({ where: { id: projectId }, include: { organization: { include: { memberships: { where: { userId } } } } } });
    if (!project || project.organization.status === OrganizationStatus.ARCHIVED) throw new ApiError(404, "RESOURCE_NOT_FOUND", "The requested resource was not found.");
    requirePermission(project.organization.memberships[0]?.role ?? null, permission);
    return project;
  }

  async list(userId: string, organizationId?: string, includeArchived = false): Promise<ProjectDto[]> {
    if (organizationId) requirePermission((await this.membership(userId, organizationId))?.role ?? null, "read");
    const projects = await this.db.project.findMany({ where: { ...(organizationId ? { organizationId } : { organization: { memberships: { some: { userId } } } }), ...(includeArchived ? {} : { status: ProjectStatus.ACTIVE }) }, orderBy: { updatedAt: "desc" } });
    return projects.map(projectDto);
  }

  async get(userId: string, projectId: string): Promise<ProjectDto> { return projectDto(await this.authorizedProject(userId, projectId, "read")); }

  async create(input: { userId: string; email: string; displayName: string | null; organizationId?: string; name: string }): Promise<{ project: ProjectDto; environment: EnvironmentDto }> {
    const organization = input.organizationId ? await this.organizations.get(input.userId, input.organizationId) : await this.organizations.ensureDefault(input.userId, input.displayName, input.email);
    requirePermission((await this.membership(input.userId, organization.id))?.role ?? null, "manage-projects");
    return this.db.$transaction(async (tx) => {
      const project = await tx.project.create({ data: { organizationId: organization.id, name: input.name, slug: `${slugify(input.name)}-${crypto.randomUUID().slice(0, 8)}` } });
      const environment = await tx.projectEnvironment.create({ data: { projectId: project.id, type: EnvironmentType.DEVELOPMENT } });
      await tx.auditEvent.create({ data: { organizationId: organization.id, projectId: project.id, actorUserId: input.userId, action: "project.created", resourceType: "project", resourceId: project.id, metadata: { name: input.name } } });
      return { project: projectDto(project), environment: environmentDto(environment) };
    });
  }

  async update(userId: string, projectId: string, name: string): Promise<ProjectDto> {
    const existing = await this.authorizedProject(userId, projectId, "manage-projects");
    if (existing.status === ProjectStatus.ARCHIVED) throw new ApiError(409, "PROJECT_ARCHIVED", "Archived projects cannot be updated.");
    return this.db.$transaction(async (tx) => {
      const project = await tx.project.update({ where: { id: projectId }, data: { name } });
      await tx.auditEvent.create({ data: { organizationId: project.organizationId, projectId, actorUserId: userId, action: "project.updated", resourceType: "project", resourceId: projectId, metadata: { name } } });
      return projectDto(project);
    });
  }

  async archive(userId: string, projectId: string): Promise<ProjectDto> {
    const existing = await this.authorizedProject(userId, projectId, "manage-projects");
    if (existing.status === ProjectStatus.ARCHIVED) return projectDto(existing);
    return this.db.$transaction(async (tx) => {
      const project = await tx.project.update({ where: { id: projectId }, data: { status: ProjectStatus.ARCHIVED, archivedAt: new Date() } });
      await tx.auditEvent.create({ data: { organizationId: project.organizationId, projectId, actorUserId: userId, action: "project.archived", resourceType: "project", resourceId: projectId } });
      return projectDto(project);
    });
  }

  async environments(userId: string, projectId: string): Promise<EnvironmentDto[]> {
    await this.authorizedProject(userId, projectId, "read");
    return (await this.db.projectEnvironment.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } })).map(environmentDto);
  }
}
