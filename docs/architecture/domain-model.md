# Zayloq Core Domain Model

## Identity

User
Organization
Membership
Session

## Projects

Project
ProjectEnvironment
ProjectRevision
ProjectFile

## Intelligence

Conversation
Message
GenerationRun
ModelInvocation
ProductSpecification
ArchitectureSpecification

## Builds

Build
BuildStep
BuildLog
BuildArtifact

## Deployments

Deployment
Release
Domain
EnvironmentVariable

## Usage

UsageEvent
UsageAggregate
Entitlement

## Security

AuditEvent
ApiKey
SecretReference

## Future Commerce

Store
Product
Variant
Inventory
Cart
Order
Payment
Refund
Fulfillment

Commerce entities will be introduced through a dedicated production phase rather than mixed into the initial control-plane schema.

## Tenant Boundary

Organization is the primary tenant boundary.

Organization
  -> Memberships
  -> Projects
       -> Environments
       -> Revisions
       -> Conversations
       -> Builds
       -> Deployments

All tenant-owned resources must be queried through their organization boundary.

A resource identifier alone must never be considered authorization.
