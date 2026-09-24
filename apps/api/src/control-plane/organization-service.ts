import { MembershipRole, OrganizationStatus, Prisma, getDatabaseClient, type PrismaClient } from "@zayloq/database";
import { ApiError } from "../auth/api-errors.js";
import { requirePermission } from "./policy.js";
import { organizationDto, type MembershipDto, type OrganizationDto } from "./public-dto.js";

function slugify(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "organization"; }

export class OrganizationService {
  constructor(private readonly db: PrismaClient = getDatabaseClient()) {}

  async list(userId: string): Promise<OrganizationDto[]> {
    const memberships = await this.db.membership.findMany({ where: { userId, organization: { status: OrganizationStatus.ACTIVE } }, include: { organization: true }, orderBy: { createdAt: "asc" } });
    return memberships.map((membership) => organizationDto(membership.organization, membership.role));
  }

  async get(userId: string, organizationId: string): Promise<OrganizationDto> {
    const membership = await this.db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId } }, include: { organization: true } });
    requirePermission(membership?.role ?? null, "read");
    if (!membership || membership.organization.status === OrganizationStatus.ARCHIVED) throw new ApiError(404, "RESOURCE_NOT_FOUND", "The requested resource was not found.");
    return organizationDto(membership.organization, membership.role);
  }

  async create(userId: string, name: string): Promise<OrganizationDto> {
    return this.db.$transaction(async (tx) => {
      const suffix = crypto.randomUUID().slice(0, 8);
      const organization = await tx.organization.create({ data: { name, slug: `${slugify(name)}-${suffix}`, memberships: { create: { userId, role: MembershipRole.OWNER } } } });
      await tx.auditEvent.create({ data: { organizationId: organization.id, actorUserId: userId, action: "organization.created", resourceType: "organization", resourceId: organization.id, metadata: { name } } });
      return organizationDto(organization, MembershipRole.OWNER);
    });
  }

  async ensureDefault(userId: string, displayName: string | null, email: string): Promise<OrganizationDto> {
    const existing = await this.db.membership.findFirst({ where: { userId, organization: { status: OrganizationStatus.ACTIVE } }, include: { organization: true }, orderBy: { createdAt: "asc" } });
    if (existing) return organizationDto(existing.organization, existing.role);
    const ensure = () => this.db.$transaction(async (tx) => {
      const slug = `personal-${userId}`;
      const name = `${displayName?.trim() || email.split("@")[0] || "My"}'s organization`;
      const organization = await tx.organization.upsert({ where: { slug }, update: {}, create: { name, slug } });
      const membership = await tx.membership.upsert({ where: { userId_organizationId: { userId, organizationId: organization.id } }, update: {}, create: { userId, organizationId: organization.id, role: MembershipRole.OWNER } });
      const auditExists = await tx.auditEvent.findFirst({ where: { organizationId: organization.id, action: "organization.created", resourceId: organization.id } });
      if (!auditExists) await tx.auditEvent.create({ data: { organizationId: organization.id, actorUserId: userId, action: "organization.created", resourceType: "organization", resourceId: organization.id, metadata: { default: true } } });
      return organizationDto(organization, membership.role);
    });
    try { return await ensure(); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return ensure();
      throw error;
    }
  }

  async update(userId: string, organizationId: string, name: string): Promise<OrganizationDto> {
    return this.db.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({ where: { userId_organizationId: { userId, organizationId } } });
      const role = requirePermission(membership?.role ?? null, "manage-organization");
      const organization = await tx.organization.update({ where: { id: organizationId, status: { not: OrganizationStatus.ARCHIVED } }, data: { name } }).catch(() => { throw new ApiError(404, "RESOURCE_NOT_FOUND", "The requested resource was not found."); });
      await tx.auditEvent.create({ data: { organizationId, actorUserId: userId, action: "organization.updated", resourceType: "organization", resourceId: organizationId, metadata: { name } } });
      return organizationDto(organization, role);
    });
  }

  async memberships(userId: string, organizationId: string): Promise<MembershipDto[]> {
    const own = await this.db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId } } });
    requirePermission(own?.role ?? null, "read");
    const memberships = await this.db.membership.findMany({ where: { organizationId }, include: { user: true }, orderBy: { createdAt: "asc" } });
    return memberships.map(({ user, ...membership }) => ({ id: membership.id, userId: membership.userId, email: user.email, displayName: user.displayName, role: membership.role, createdAt: membership.createdAt.toISOString(), updatedAt: membership.updatedAt.toISOString() }));
  }
}
