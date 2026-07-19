# Phase 6.5 — Supabase Governance Persistence Schema & RLS

## Status

Migration authored in source. The application does not apply it, remote deployment is not performed, and application persisted-record counts remain zero.

## Purpose

Phase 6.5 defines the database storage, forced-RLS, protected append RPC, idempotency, and immutability boundaries for canonical governance audit records.

## Phase 6 scope

This phase adds one migration, static schema status, static tests, documentation, and a read-only readiness summary. It does not add a frontend repository or any runtime persistence call.

## Relationship to Phase 5.12

Phase 5 remains `foundation-complete` and production remains blocked-safe. This database boundary does not establish model or runtime readiness.

## Relationship to Phase 6.1

Phase 6.1 remains the canonical governance-record authority. The SQL validator mirrors its finalized record fields, four explicit decisions, outcome consistency, immutable safety flags, and opaque actor subject.

## Relationship to Phase 6.2

Phase 6.2 remains the trusted external assertion adapter. The persistence RPC does not accept an actor, role, or permission parameter from the client.

## Relationship to Phase 6.3

Phase 6.3 remains the explicit review and finalization workspace. Phase 6.5 does not finalize records or create production fixtures.

## Relationship to Phase 6.4

The migration mirrors the exact Phase 6.4 envelope allowlist and logical persistence/idempotency key algorithms. These logical keys are not cryptographic proofs.

## Relationship to Phase 6.5A

The migration reuses `private.has_local_model_governance_permission()` and does not create a second authorization system or duplicate RBAC tables.

## Authorization foundation prerequisite

The server-authoritative RBAC prerequisite was verified locally before this phase. That prerequisite evidence does not imply this migration is remotely applied.

## Server-authoritative reviewer role

The exact role is `model-governance-reviewer`.

## Exact reviewer permission

The exact permission is `record-model-governance-decision`.

## Authentication versus authorization

`auth.uid()` identifies the database caller. The existing private helper separately verifies the exact role-permission assignment.

## Database actor binding

The RPC derives `actor_user_id` from `auth.uid()` and requires the canonical record's opaque `actorSubjectId` to equal `auth.uid()::text`. Payload actor identity is not authoritative.

## Governance records table

`public.local_model_governance_records` stores an identity row ID, logical keys, schema and policy revisions, canonical record metadata, exact candidate identity, database actor, canonical review time, and the allowlisted JSON envelope.

## Column allowlist

The table stores no reviewer email or name, credential, JWT, session, signature, learner content, raw evidence, model binary, or download URL.

## Candidate identity constraints

Check constraints lock Light to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B with exact repository identities and immutable revisions. Ultra-low has no model governance record.

## Canonical outcome constraints

Allowed audit outcomes are `finalized-proceed`, `finalized-rejected`, and `finalized-more-evidence`.

## Persistence envelope validation

The private validator requires the exact Phase 6.4 top-level keys, duplicate policy, append-only flags, current revisions, canonical metadata, and logical keys. Missing or extra fields fail closed.

## Canonical record validation

The validator requires exactly four unique governance requirements, explicit decisions, no `not-recorded` value, valid closure statuses, safe canonical flags, and decision/outcome consistency.

## Append-only RPC

`public.append_local_model_governance_record(jsonb)` is the only authenticated append path. Direct table insert is not granted and no INSERT policy exists.

## SECURITY DEFINER boundary

The append RPC is `SECURITY DEFINER`, derives the actor server-side, rechecks the exact RBAC helper, validates the entire envelope, and performs only a plain append insert.

## Function search path

Security-sensitive functions use `SET search_path = ''`, and relation/function references are schema-qualified.

## Function privilege restrictions

RPC execution is revoked from `PUBLIC` and `anon`, then granted to `authenticated`. The RPC still rejects callers for whom the exact RBAC helper is false.

## Row Level Security

The governance table has RLS enabled and forced.

## SELECT policy

Only `authenticated` callers for whom `private.has_local_model_governance_permission()` returns true may select rows.

## Direct client write restrictions

Anon has no access. Authenticated clients have no direct INSERT, UPDATE, DELETE, TRUNCATE, or identity-sequence privilege.

## Immutable trigger

A private trigger function rejects every UPDATE and DELETE before row mutation.

## Update prohibition

No update policy, update RPC, upsert, replace, or `ON CONFLICT DO UPDATE` path exists.

## Delete prohibition

No delete policy or delete RPC exists, and the immutable trigger rejects DELETE.

## Idempotent identical duplicates

A unique-violation path compares the exact stored and incoming envelopes. An identical envelope returns `identical-existing-envelope` without adding or changing a row.

## Conflicting duplicate rejection

A matching logical key with different content raises a sanitized conflict error and does not leak the existing envelope.

## Actor privacy

The opaque actor subject participates in canonical validation and audit equality but is not rendered by the view model or readiness UI. Email, display name, and credentials are not stored.

## Data minimization

Only canonical governance record data and Phase 6.4 envelope metadata are stored. Raw evidence and learner submissions are excluded.

## Migration-authored versus migration-applied

The source contains one authored migration. The application does not run migrations, and authored SQL does not prove a remote database has applied it.

## Local database verification

The Phase 6.5A RBAC prerequisite was locally verified. Phase 6.5 migration/runtime verification must be reported only from actual isolated local database commands and tests.

## Remote deployment boundary

No project link, database push, remote SQL, or production migration application is part of this phase.

## Repository boundary

No frontend Supabase repository or RPC client is configured.

## Current production state

Application persistence attempts, repository writes, claimed persisted records, downstream applications, approved models, approved artifacts, downloads, runtime-ready artifacts, and active models are all zero.

## Failure handling

Malformed envelopes, forged actor binding, missing authorization, invalid logical keys, stale identities, and conflicting duplicates fail closed with stable sanitized errors.

## Safety invariants

Existing migrations and Phase 4–6.5A source remain unchanged. Approval registry and artifact manifest remain unchanged. No record is automatically applied downstream, and no model lifecycle state is activated.

## Non-goals

No frontend persistence repository, reviewer assignment, remote deployment, artifact operation, checksum verification, benchmark, download, runtime, inference, or active model is implemented.

## Future phase entry conditions

A typed repository/RPC client may be considered only after isolated local database validation passes. Remote deployment requires separate approval. Server-side authorization must be rechecked, browser code must never use service-role credentials, acknowledgements must not imply downstream application, and artifact selection remains a separate explicit operation.
