import { MembershipRole } from "@zayloq/database";
import { ApiError } from "../auth/api-errors.js";

export type OrganizationPermission = "read" | "manage-projects" | "manage-organization";

const permissions: Record<MembershipRole, ReadonlySet<OrganizationPermission>> = {
  OWNER: new Set(["read", "manage-projects", "manage-organization"]),
  ADMIN: new Set(["read", "manage-projects", "manage-organization"]),
  MEMBER: new Set(["read"])
};

export function requirePermission(role: MembershipRole | null, permission: OrganizationPermission): MembershipRole {
  if (!role || !permissions[role].has(permission)) {
    throw new ApiError(404, "RESOURCE_NOT_FOUND", "The requested resource was not found.");
  }
  return role;
}
