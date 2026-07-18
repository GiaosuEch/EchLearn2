# Phase 6.5A — Server-Authoritative Governance RBAC Foundation

## Status
Migration authored, not applied by the application. Local database verification has not run. Phase 6.5 remains blocked.

## Purpose
Define database-backed, server-authoritative governance roles and permissions without assigning a production reviewer.

## Phase 6 scope
This phase adds one private RBAC migration, static status types, a read-only view model, tests, documentation, and a readiness summary only.

## Relationship to Phase 5.12
Phase 5 closeout remains foundation-complete and production remains blocked-safe.

## Relationship to Phase 6.1
The canonical decision-record contract remains unchanged; no actor or finalized record is created.

## Relationship to Phase 6.2
The external actor adapter remains unchanged and still has no production assertion.

## Relationship to Phase 6.3
All three production review workspaces remain locked.

## Relationship to Phase 6.4
The append-only persistence contract remains unchanged; no persistence request or write occurs.

## Relationship to blocked Phase 6.5
Phase 6.5 stopped because this server-authoritative foundation was missing. Authorship alone does not unblock it.

## Why Phase 6.5A is required
Future persistence authorization must not trust role, permission, identity, profile, subscription, or metadata supplied by a browser.

## Database-backed RBAC
The design uses protected relational catalogs and assignments, not custom access-token claims.

## Private schema
The migration creates or reuses `private`, revokes broad access, and does not expose its tables through public views.

## Role catalog
The exact static role is `model-governance-reviewer`, revision 1.

## Permission catalog
The exact static permission is `record-model-governance-decision`, revision 1. No wildcard exists.

## Role-permission mapping
One protected mapping joins the exact role to the exact permission.

## User-role assignments
Assignments reference `auth.users` and the role catalog. Initial seeded assignments = 0.

## No production reviewer assignment
No reviewer UUID, email, account, service identity, or fixture is inserted. Authorized reviewers claimed = 0.

## Server-authoritative authorization
Protected database rows and the current database actor are the only authorization source.

## Exact reviewer role
Generic administrator, owner, moderator, staff, study-group role, chat role, subscription, and entitlement labels are insufficient.

## Exact governance permission
Only `record-model-governance-decision` satisfies this boundary.

## Authorization helper
`private.has_local_model_governance_permission()` is parameterless, stable, security-definer, and returns only a boolean.

## Authentication versus authorization
Authentication provides `auth.uid()`; authorization additionally requires the exact protected assignment and mapping.

## auth.uid actor binding
The helper derives the actor from `auth.uid()`, returns false for a null actor, and accepts no actor, role, or permission parameters.

## RLS and default deny
All four private tables have row-level security enabled and forced. No client policy is created.

## Grant restrictions
PUBLIC, `anon`, and `authenticated` have no table privileges. `authenticated` receives only schema usage and helper execution.

## Self-assignment prevention
There is no self-row policy, table DML grant, or assignment endpoint; ordinary users cannot self-assign governance access.

## Assignment-management boundary
No assign, revoke, list, invitation, or role-management RPC exists. That authority requires a separately reviewed phase.

## Catalog seed versus user assignment
One role, one permission, and one mapping are policy catalog seeds. No user-role assignment is seeded.

## Actor privacy
Only a user UUID may appear in the protected assignment table. No email, display name, token, session, learner content, or arbitrary metadata is stored.

## Migration-authored versus migration-applied
An authored SQL file is not an applied migration. Static source keeps migration and remote application flags false.

## Local database verification
Local verification is pending. RLS behavior, self-assignment prevention, and helper results are not claimed runtime-verified.

## Remote deployment boundary
No project link, database push, remote SQL, production credential, or deployment occurs.

## Current production state
Roles = 1; permissions = 1; mappings = 1; user-role assignments seeded = 0; authorized reviewers = 0; governance records persisted = 0; active models = 0.

## Failure handling
Unexpected client privilege, assignment seed, client-controlled authorization, or missing exact helper semantics fails static validation.

## Safety invariants
Phase 4, Phase 5, and Phase 6.1–6.4 remain unchanged. Approval registry and artifact manifest remain unchanged. There is no application database call, record persistence, downstream application, model approval, artifact selection, download, benchmark, runtime, inference, or active model.

## Non-goals
No governance-record table, append RPC, assignment API, custom token hook, admin UI, reviewer account, repository, deployment, or model lifecycle operation is created.

## Phase 6.5 re-entry conditions
1. Apply the migration to an isolated local stack.
2. Pass static and local database tests.
3. Prove ordinary users cannot read or mutate private RBAC tables or self-assign.
4. Prove the helper is false before an assignment.
5. Prove it is true only after a trusted database-owner test fixture inserts the exact assignment.
6. Reset all test assignments.
7. Rerun Phase 6.5 against the new baseline.
8. Reuse this helper rather than creating a second authorization system.
