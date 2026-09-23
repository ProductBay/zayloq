# Zayloq Production Architecture

## Product

Zayloq is an AI software creation platform operated by A'Dash Technologies Group.

Its production objective is to transform a user request into a structured, testable and deployable software product.

Core lifecycle:

Idea
→ Product Specification
→ Architecture
→ Code Generation
→ Secure Build
→ Validation
→ Preview
→ Deployment
→ Iterative AI Maintenance

## Architectural Principles

1. Multi-tenant by design.
2. Provider-neutral AI infrastructure.
3. Generated code never executes directly inside the control-plane API.
4. AI output is treated as untrusted input.
5. Every generated project is isolated by organization and project.
6. Secrets are never exposed to generated application source.
7. Builds execute through controlled workers and isolated runtimes.
8. Production deployments are immutable releases.
9. All important mutations are auditable.
10. Zayloq must support rollback.
11. Infrastructure providers remain replaceable behind Zayloq abstractions.
12. Usage must be measurable for billing and abuse prevention.

## Production Systems

### Studio
Customer-facing Zayloq product.

### Control Plane
Accounts, organizations, projects, permissions, environments, deployments and configuration.

### Intelligence
AI provider abstraction, orchestration, structured generation and model routing.

### Architect
Transforms user intent into structured ProductSpec and ArchitectureSpec documents.

### Builder
Produces and modifies project files from controlled generation plans.

### Runtime
Executes generated code in isolated build environments.

### QA
Validates generated applications and feeds structured failures into repair workflows.

### Data
Project database provisioning, schema management and migrations.

### Deploy
Preview and production releases, domains and rollback.

### Billing
Subscriptions, entitlements and metered usage.

### Observability
Logs, traces, metrics, audit events and operational monitoring.

## Repository Direction

apps/
  marketing/
  web/
  api/
  worker/

packages/
  database/
  shared/
  config/
  ai/
  auth/
  builder/
  runtime/
  deployment/
  billing/
  observability/
  security/
  integrations/

infrastructure/
docs/
tooling/

The existing Next.js marketing application remains untouched until its migration into apps/marketing is performed as a separately validated change.
