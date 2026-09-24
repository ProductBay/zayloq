import assert from "node:assert/strict";
import { test } from "node:test";
import { MembershipRole, connectDatabase, disconnectDatabase, getDatabaseClient } from "@zayloq/database";
import { ApiError } from "../auth/api-errors.js";
import { OrganizationService } from "./organization-service.js";
import { ProjectService } from "./project-service.js";

const run = process.env.CONTROL_PLANE_INTEGRATION_TEST === "1";
test("organization and project control-plane lifecycle with tenant isolation", { skip: !run, timeout: 180_000 }, async () => {
  await connectDatabase(); const db = getDatabaseClient(); const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const users = await Promise.all(["owner", "admin", "member", "outsider"].map((label) => db.user.create({ data: { email: `${label}-${suffix}@example.test`, displayName: label } })));
  const [owner, admin, member, outsider] = users; const organizations = new OrganizationService(db); const projects = new ProjectService(db, organizations);
  try {
    const defaultOrganizations = await Promise.all([organizations.ensureDefault(owner.id, owner.displayName, owner.email), organizations.ensureDefault(owner.id, owner.displayName, owner.email)]);
    assert.equal(defaultOrganizations[0].id, defaultOrganizations[1].id);
    assert.equal(defaultOrganizations[0].role, MembershipRole.OWNER);
    assert.equal((await organizations.list(owner.id)).length, 1);
    const organizationId = defaultOrganizations[0].id;
    await db.membership.createMany({ data: [{ userId: admin.id, organizationId, role: MembershipRole.ADMIN }, { userId: member.id, organizationId, role: MembershipRole.MEMBER }] });
    assert.equal((await organizations.memberships(owner.id, organizationId)).length, 3);
    assert.equal((await organizations.update(admin.id, organizationId, "Updated organization")).name, "Updated organization");
    await assert.rejects(() => organizations.update(member.id, organizationId, "Forbidden"), (error: unknown) => error instanceof ApiError && error.statusCode === 404);

    const first = await projects.create({ userId: owner.id, email: owner.email, displayName: owner.displayName, name: "First project", organizationId });
    assert.equal(first.environment.type, "DEVELOPMENT");
    const second = await projects.create({ userId: admin.id, email: admin.email, displayName: admin.displayName, name: "Admin project", organizationId });
    assert.equal((await projects.list(owner.id, organizationId)).length, 2);
    assert.equal((await projects.get(member.id, first.project.id)).id, first.project.id);
    await assert.rejects(() => projects.create({ userId: member.id, email: member.email, displayName: member.displayName, name: "Member project", organizationId }), (error: unknown) => error instanceof ApiError && error.statusCode === 404);
    assert.equal((await projects.update(admin.id, first.project.id, "Renamed project")).name, "Renamed project");
    assert.equal((await projects.environments(owner.id, first.project.id))[0]?.type, "DEVELOPMENT");

    for (const operation of [() => projects.get(outsider.id, first.project.id), () => projects.update(outsider.id, first.project.id, "Attack"), () => projects.archive(outsider.id, first.project.id), () => projects.environments(outsider.id, first.project.id)]) {
      await assert.rejects(operation, (error: unknown) => error instanceof ApiError && error.statusCode === 404);
    }
    await projects.archive(owner.id, first.project.id);
    assert.deepEqual((await projects.list(owner.id, organizationId)).map((item) => item.id), [second.project.id]);
    assert.equal((await projects.list(owner.id, organizationId, true)).length, 2);
    const actions = await db.auditEvent.findMany({ where: { organizationId }, select: { action: true } });
    assert.ok(actions.some(({ action }) => action === "project.created")); assert.ok(actions.some(({ action }) => action === "project.updated")); assert.ok(actions.some(({ action }) => action === "project.archived"));
  } finally { await db.user.deleteMany({ where: { id: { in: users.map(({ id }) => id) } } }); await disconnectDatabase(); }
});
