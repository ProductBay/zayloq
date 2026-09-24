# Project control plane

## Ownership model

`User -> Membership -> Organization -> Project -> ProjectEnvironment` is the durable control-plane ownership chain. A project is the stable boundary for future planning, retrieval, generation, runtime, validation, and deployment resources. PostgreSQL is authoritative; Studio browser state only selects among organizations already returned by the API.

Organizations have ACTIVE, SUSPENDED, or ARCHIVED status. Membership is unique per user and organization. Projects have organization-local unique slugs and use ACTIVE, SUSPENDED, or ARCHIVED status. Archive is a soft transition with `archivedAt`; no project is hard-deleted through the API.

## Authorization matrix

| Capability | OWNER | ADMIN | MEMBER |
| --- | --- | --- | --- |
| Read organization/projects/environments | Yes | Yes | Yes |
| Create, rename, archive projects | Yes | Yes | No |
| Update organization | Yes | Yes | No |
| List memberships | Yes | Yes | Yes |

The reusable policy is evaluated server-side from database membership. IDs and roles supplied by browsers are never treated as authority. Missing membership and unauthorized resource access return the same 404 contract to reduce tenant enumeration.

## Default organization

The first project request without an organization invokes `ensureDefault`. It uses the deterministic unique slug `personal-{userId}`, an organization upsert, a unique membership upsert, and a transaction. Retries and concurrent requests therefore converge on one organization and one OWNER membership. Users who already have an active membership use their oldest active organization. Explicit organizations can also be created.

## Project and environment lifecycle

Project creation first resolves and authorizes the organization, then transactionally creates the project, its single DEVELOPMENT control-plane environment, and `project.created` audit event. PREVIEW and PRODUCTION remain valid enum values but no runtime or deployment is implied. Rename writes `project.updated`. Archive writes ARCHIVED, `archivedAt`, and `project.archived`; active lists exclude archived projects unless `includeArchived=true` is explicitly requested.

## Prompt persistence decision

The schema has no appropriate project-initialization or planning-input model. The build prompt is therefore accepted only as transient request input and is deliberately not written to an unrelated Project, AuditEvent, or environment field. The create response says `promptPersisted: false`, and Studio tells the user before submission. ZP-1D should introduce a versioned planning-request model with lifecycle, provenance, and retention semantics before prompts become durable. No Prisma migration is needed in this phase.

## HTTP API

All routes require the existing HttpOnly session. All mutations also pass trusted-origin enforcement and a Redis-backed, per-user control-plane mutation limit.

- `GET/POST /v1/organizations`
- `GET/PATCH /v1/organizations/:organizationId`
- `GET /v1/organizations/:organizationId/memberships`
- `GET/POST /v1/projects`
- `GET/PATCH /v1/projects/:projectId`
- `POST /v1/projects/:projectId/archive`
- `GET /v1/projects/:projectId/environments`

Route IDs are UUID-validated and bodies are strict, trimmed, and length-limited. Public DTOs contain identifiers, display fields, status/role, and timestamps only; Prisma records and internal archival fields are not serialized directly.

## Audit behavior

`organization.created`, `organization.updated`, `project.created`, `project.updated`, and `project.archived` are written with organization, actor, resource, and safe name/default metadata. Audit writes share the state-changing transaction. Prompts, credentials, cookies, tokens, and request bodies are not audit metadata.

## Studio integration

The typed API service is the only fetch boundary. Organization context loads authorized organizations and keeps the current selection in memory. Dashboard counts and recent projects, project lists, creation, workspace project/environment context, rename, and archive all use real API data. A 401 returns users to login; safe unavailable/not-found errors render without leaking internal exceptions.

## Tenant isolation

Project list queries join through membership. Project detail, mutation, archive, and environment reads resolve the project and membership together before returning data. This prevents cross-tenant reads, writes, archives, environment enumeration, and ID-based bypasses.

## Deferred functionality

HTTP idempotency keys, membership administration UI, prompt persistence, AI providers, knowledge retrieval, capabilities, planning, generated files, isolated builds, previews, repair, deployments, application databases, billing, and project restoration remain deferred. Project IDs created here are the ownership keys those systems should reference.
