# ZP-0B Workspace Migration

## Current State

The repository root currently contains the production-tested Zayloq marketing application.

It remains operational during the workspace migration.

## Target Applications

### apps/marketing
Public Zayloq website.

### apps/studio
Authenticated customer product where users create and manage software projects.

### apps/api
Zayloq control-plane API.

Responsibilities include:

- organizations
- memberships
- projects
- environments
- conversations
- specifications
- builds
- deployments
- domains
- usage
- billing control
- audit events

### apps/worker
Asynchronous job processor.

Responsibilities include:

- AI generation jobs
- architecture generation
- code generation
- build orchestration
- repair jobs
- deployment jobs
- background maintenance

## Migration Rule

The root marketing application will not move until:

1. workspace configuration exists;
2. workspace package resolution passes;
3. API and worker shells exist;
4. root application still builds;
5. migration has a dedicated Git checkpoint.

This prevents infrastructure work from destabilizing the existing public site.
