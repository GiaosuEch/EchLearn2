# Phase 6.2 — External Trusted Actor Context Adapter Boundary

## Status

Boundary implemented as a deterministic, provider-neutral adapter contract. Production has no external assertion and maps no trusted actor context.

## Purpose

Phase 6.2 validates a sanitized assertion supplied by a future external authentication boundary and maps only the exact governance reviewer role and permission into the Phase 6.1 trusted actor context. It does not authenticate a user, call a provider, create a governance record, or persist anything.

## Phase 6 scope

This phase is an external trusted actor context adapter only. It prepares a narrow input boundary for a future admin workspace while all governance decisions, artifact operations, benchmark execution, downloads, runtime initialization, and inference remain blocked.

## Relationship to Phase 5.12

Phase 5 closeout remains foundation-complete and production remains blocked-safe. Phase 6.2 does not alter candidate evidence, governance boundaries, artifact boundaries, benchmark planning, fallback continuity, or feature parity.

## Relationship to Phase 6.1

The adapter output is structurally compatible with the Phase 6.1 trusted actor context. A valid mapped context may be supplied to the Phase 6.1 record policy, but it does not add decisions, request finalization, invoke a review clock, persist a record, or apply a record downstream.

## External Auth boundary

A future external Auth boundary owns credential verification, session validation, and role assignment. It must provide a sanitized assertion only after those responsibilities are complete. Phase 6.2 never connects directly to an authentication provider.

## Adapter boundary

The adapter validates assertion shape, authentication and authorization outcomes, exact claims, opaque subject rules, revisions, contradictions, and prior-scope consistency. It reports whether a trusted context can be mapped without claiming that authentication was performed by the adapter.

## Authentication versus assertion mapping

The adapter does not authenticate users and does not validate JWTs or sessions. It only evaluates whether the external assertion reports `authenticated` and whether the assertion is internally consistent.

## Authorization versus role mapping

Authorization must be reported as `granted`, and both exact required claims must be present. The adapter does not infer authorization from general roles, subscriptions, entitlements, email domains, or client-controlled metadata.

## Sanitized external assertion

The assertion contains only:

- Opaque actor subject ID.
- Authentication outcome.
- Authorization outcome.
- Verified role IDs.
- Verified permission IDs.
- External-boundary source identifier.
- Assertion revision.
- Actor-context revision.

## Strict assertion allowlist

Runtime keys are checked against the exact assertion schema. Any additional field fails closed with a machine-readable issue. Missing fields, malformed arrays, duplicates, unknown outcomes, and revision mismatches also fail closed.

## Credential exclusion

The assertion contains no email, display name, password, token, cookie, raw session, signed payload, credential, or provider metadata. No Supabase, no Auth call, no migration, no RLS, no network, and no browser storage are added.

## Actor subject privacy

The subject is opaque, eight to 128 characters, has no leading or trailing whitespace, contains no whitespace or `@`, and uses only conservative safe characters. It is never displayed in readiness UI or copied into blockers and warnings.

## Exact reviewer role

The only accepted role is:

`model-governance-reviewer`

Matching is exact and case-sensitive. Values are not trimmed, lowercased, or aliased.

## Exact authorization permission

The only accepted permission is:

`record-model-governance-decision`

The permission is mandatory in addition to the exact role.

## Generic admin claims

Generic `admin`, `owner`, `administrator`, staff, entitlement, subscription, and domain claims do not grant reviewer access. Additional verified claims may coexist, but they are not mapped into the Phase 6.1 context.

## Trusted actor context mapping

A context is mapped only when the assertion schema is valid, the external source is correct, current revisions match, authentication is reported, authorization is granted, the opaque subject is valid, and both exact claims are present. The output always uses the fixed Phase 6.1 actor role, scope, source, and revision.

## Adapter statuses

- `unavailable`: no assertion exists.
- `unauthenticated`: a valid assertion reports no authentication and no contradictory grant.
- `unauthorized`: authentication is reported but authorization or exact claims are insufficient.
- `trusted-context-ready`: all mapping rules pass.
- `invalidated`: a prior scope or policy revision no longer matches.
- `attention-required`: malformed, contradictory, unexpected, or incompatible input was received.

## Assertion scope

The scope includes the actor subject, authentication and authorization outcomes, canonical sorted role and permission sets, authentication source, assertion revision, actor-context revision, and adapter-policy revision.

## Scope invalidation

Mapped context is invalidated when the actor, outcomes, role set, permission set, source, or revisions change. Context is not carried between actors or across changed authorization and policy scopes.

## Revision handling

`LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION` and `LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION` are deterministic revision constants. The Phase 6.1 actor-context revision is reused directly.

## Phase 6.1 compatibility

Synthetic integration tests pass a mapped context into Phase 6.1. With no explicit decisions, Phase 6.1 remains `awaiting-explicit-decisions`; no record is finalized, persisted, signed, or applied downstream, and the review clock is not called.

## Current production state

- Current external assertions = 0.
- Current trusted actor contexts mapped = 0.
- Governance record contracts available = 3.
- Candidates eligible to open a trusted decision draft = 0.
- Governance decisions recorded = 0.
- Governance records finalized = 0.
- Governance records persisted = 0.
- Records applied downstream = 0.
- Models, licenses, and artifacts approved = 0.
- Downloads, runtime-ready artifacts, and active models = 0.

No production actor subject is hardcoded.

## Persistence boundary

Phase 6.2 does not persist assertions or mapped contexts. Persistence, audit records, database schema, and RLS remain separate reviewed work.

## Admin workspace boundary

No admin route, login control, role editor, decision form, or finalization control is introduced. A future workspace must remain unavailable unless this adapter returns `trusted-context-ready`.

## Provider neutrality

The assertion does not identify a provider and contains no provider session object. A separately reviewed external adapter may later produce the sanitized contract without passing credentials into platform policy.

## Failure handling

Malformed and contradictory assertions return `attention-required`. Missing exact authorization returns `unauthorized`. Stale scope returns `invalidated`. No invalid input is normalized into a trusted context.

## Safety invariants

- Authentication and authorization are not performed by the adapter.
- No credential, token, cookie, or session is read.
- No actor identity is generated.
- No role or permission is granted automatically.
- No governance decision or record is created automatically.
- No persistence, downstream application, model approval, artifact selection, checksum verification, benchmark pass, download, runtime, inference, or active model is created.
- Phase 4, Phase 5, and Phase 6.1 history remain unchanged.
- Approval registry and artifact manifest remain unchanged.
- Phase 5 closeout remains foundation-complete.
- Production remains blocked-safe.

## Non-goals

Login, logout, provider integration, credential verification, Supabase Auth, migration, RLS, admin UI, governance controls, record persistence, artifact operations, checksum execution, benchmark execution, download, cache, runtime, and inference are outside Phase 6.2.

## Future phase entry conditions

- Phase 6.3 may consume a mapped context in an admin review workspace.
- Real authentication must be supplied by a separately reviewed external Auth adapter.
- Provider integration must never pass raw credentials into platform policy.
- Admin workspace access must remain unavailable without `trusted-context-ready`.
- Persistence and RLS must remain separate reviewed phases.
- Model download and runtime remain blocked until every later gate passes.
