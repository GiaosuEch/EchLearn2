# Phase 7.1 Authoritative Governance Application Record

## Status

Source contract authored. The migration is not applied by the application and no remote deployment is claimed.

## Purpose

Phase 7.1 converts an eligible in-memory Phase 6.8 application decision into a sanitized, append-only application-record envelope and authors the database boundary that can persist it later through an explicit protected RPC.

## Baseline

Phase 6.9 closed the Phase 6 source contracts while keeping all production governance, verification, application, artifact, download, benchmark, runtime, and model counters at zero.

## Existing reviewer role reuse

The existing `model-governance-reviewer` role is reused. Phase 7.1 does not create a second reviewer role.

## Separate application permission

The migration adds the exact permission `record-model-governance-application` and maps it to the existing reviewer role. This permission is separate from `record-model-governance-decision`.

## No production reviewer assignment

No user-role assignment, reviewer UUID, reviewer email, service account, or production actor fixture is seeded.

## Sanitized application envelope

The application envelope contains only the Phase 6.8 application decision key, deterministic idempotency key, schema and policy revisions, exact source governance binding, candidate identity, observed model revision, application status, review eligibility, and immutable safety flags.

The envelope does not contain actor identity, role, permission, browser authentication material, reviewer details, database record ID, timestamp, raw verification result, or raw governance persistence envelope.

## Eligibility boundary

The builder accepts only `eligible-for-downstream-review` decisions with literal explicit application action, accepted and current verification, current candidate/model/revision scope, `finalized-proceed`, and all persistence/downstream/approval/download/runtime/model flags still false.

Rejected, more-evidence, stale, malformed, incomplete, or hostile runtime inputs fail closed.

## Deterministic keys

The Phase 6.8 application decision key is reused exactly. The application idempotency key is:

`<applicationDecisionKey>:idempotency:schema-1`

Neither key is a hash, checksum, signature, timestamp, actor identifier, or database ID.

## Database table

The migration creates `public.local_model_governance_application_records` with an identity primary key, unique application decision and idempotency keys, source governance binding, canonical outcome, candidate scope, server-derived actor, immutable JSON envelope, and server-created `created_at` timestamp.

The source governance persistence key references `public.local_model_governance_records(persistence_key)` with `ON UPDATE RESTRICT` and `ON DELETE RESTRICT`.

## Server-derived actor

The append RPC derives the application actor from `auth.uid()`. The client does not send actor, role, or permission fields.

## Authorization helper

`private.has_local_model_governance_application_permission()` accepts no parameters, derives the current user from `auth.uid()`, and checks the exact existing reviewer role plus the new exact application permission.

User metadata, profile flags, subscription tier, generic admin/owner claims, and client-supplied roles are not authorization sources.

## Source governance record binding

Before insert, the protected RPC reloads the source row from `public.local_model_governance_records` and verifies:

- source persistence key;
- canonical record key;
- canonical record revision;
- canonical outcome;
- candidate ID;
- candidate tier;
- observed revision.

The source outcome must be `finalized-proceed`. A missing source row raises `governance-application-source-record-required`. A scope mismatch raises `governance-application-source-record-mismatch`.

## Protected append RPC

The exact write boundary is:

`public.append_local_model_governance_application_record(p_application jsonb)`

It is `SECURITY DEFINER`, locks `search_path`, validates exact JSON keys and values, rechecks server authorization, derives the actor, cross-checks the source governance row, and performs one append-only insert.

Authentication and authorization failures use sanitized stable SQLSTATE/message pairs. Raw envelope, SQL, stack, query details, and database internals are not included in errors.

## Duplicate handling

The first valid request returns `inserted`.

An identical duplicate with the same logical keys and immutable envelope returns `identical-existing-application-envelope`, the existing record ID, and the existing application decision key without inserting or updating.

A conflicting duplicate raises `governance-application-conflicting-duplicate`. Existing rows are never overwritten, merged, or updated.

## Row Level Security

RLS is enabled and forced. The only client-facing table policy is authenticated SELECT guarded by the exact application permission helper.

There is no client INSERT, UPDATE, or DELETE policy. Ordinary authenticated users without the exact role and permission see no application rows.

## Privilege hardening

All table and identity-sequence privileges are revoked from `PUBLIC`, `anon`, `authenticated`, and `service_role`. Authenticated users receive only table SELECT and protected RPC EXECUTE.

The public append RPC is the only client write boundary. Direct INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER privileges are not granted.

## Immutability

A `BEFORE UPDATE OR DELETE` trigger rejects mutation with `local-model-governance-application-records-immutable`. The trigger is a defense-in-depth control beyond RLS and grants.

## No automatic persistence

Phase 7.1 does not instantiate a Supabase client, call the RPC, add a persistence button, run an effect, retry, poll, queue, or write on module import or UI render.

## Current production state

- New reviewer roles: 0
- Seeded reviewer assignments: 0
- Seeded application records: 0
- Automatic persistence attempts: 0
- Explicit production persistence attempts: 0
- Production RPC invocations: 0
- App-acknowledged inserted records: 0
- App-acknowledged existing records: 0
- Persisted application records claimed: 0
- Records applied downstream: 0
- Artifact-selection reviews eligible in production: 0
- Selected artifacts: 0
- Approved artifacts: 0
- Approved models and licenses: 0
- Checksums and benchmarks: 0
- Downloads and runtime-ready artifacts: 0
- Active models: 0

## Downstream boundary

Persisting an application record does not apply it to artifact selection. Artifact selection, approval, checksum verification, benchmark execution, download, runtime initialization, inference, and activation remain separate future phases.

## Local runtime verification requirements

A later local Supabase verification run must prove migration reset and lint, permission mapping, zero seeded assignments/records, forced RLS, privilege matrices, helper behavior, source-record binding, all three duplicate paths, direct mutation denial, immutable-trigger enforcement, and clean rollback.

No remote migration, production database write, or production application persistence is performed by this source patch.
