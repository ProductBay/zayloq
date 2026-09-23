# Zayloq Security Invariants

These rules are architectural requirements.

## Tenant Isolation

Every tenant-owned operation must verify organization membership and resource ownership.

Never authorize access using only:

- projectId
- buildId
- deploymentId
- conversationId
- fileId

## Generated Code

Generated code is untrusted.

It must never execute inside:

- the API process
- the web process
- the AI orchestration process

Execution must occur through an isolated runtime.

## Secrets

Secrets must never:

- appear in prompts unless explicitly required and safely mediated
- be written into generated source files
- be returned through public APIs
- appear in build logs
- be committed to Git

Generated applications receive secrets through deployment environment injection.

## AI

AI output must be validated before it becomes executable state.

Structured AI operations must use schemas.

The AI model does not determine authorization.

The AI model does not receive unrestricted infrastructure credentials.

## Builds

Build workers require:

- execution timeout
- CPU limits
- memory limits
- filesystem isolation
- restricted network policy
- dependency controls
- log limits
- process termination

## Audit

Security-sensitive mutations must produce audit events.

Examples:

- membership changes
- role changes
- project deletion
- secret changes
- production deployment
- rollback
- API key creation/revocation
- billing entitlement changes
