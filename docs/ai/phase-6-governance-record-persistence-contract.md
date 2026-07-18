# Phase 6.4 — Trusted Governance Record Persistence Contract Boundary

## Status

Phase 6.4 is a persistence contract only. The current production state has zero finalized governance records, zero persistence requests ready, zero persistence attempts, zero repository writes, and zero persisted records.

## Purpose

Define a deterministic, provider-neutral, append-only persistence envelope for a canonical Phase 6.1 governance record without performing persistence.

## Phase 6 scope

This phase specifies data contracts, validation, immutable envelope construction, deterministic logical keys, duplicate handling, and read-only readiness reporting. It does not implement storage or downstream application.

## Relationship to Phase 5.12

Phase 5 closeout remains foundation-complete and production remains blocked-safe. Model and runtime readiness remain unestablished.

## Relationship to Phase 6.1

Phase 6.1 remains the canonical record authority. Phase 6.4 accepts only valid finalized records produced under that contract and never changes their decisions or outcome.

## Relationship to Phase 6.2

Phase 6.2 remains the external trusted actor-context adapter boundary. Phase 6.4 does not authenticate actors or consume raw authentication assertions.

## Relationship to Phase 6.3

Phase 6.3 remains the workspace and explicit-finalization boundary. Production workspaces are locked, so no production finalized record reaches Phase 6.4.

## Canonical record authority

The canonical record key, revision, exact candidate scope, four explicit decision items, opaque actor subject, actor role, reviewed time, and outcome come from Phase 6.1. Phase 6.4 does not recreate or reinterpret them.

## Persistence contract boundary

`persistence-request-ready` means only that an allowlisted immutable request can be reviewed for a future repository handoff. It does not mean a write occurred or a record was stored.

## Persistence envelope

The envelope contains deterministic logical keys, schema and policy revisions, append operation, duplicate policy, the canonical record, candidate identity, the canonical reviewed time, and immutable/append-only safety flags.

## Payload allowlist

Runtime validation rejects envelope, record, scope, or decision fields outside their exact allowlists. Rejected field values are never copied into blockers or warnings.

## Data minimization

The envelope contains only canonical governance data and minimal persistence metadata. It excludes raw evidence documents, adapter assertions, raw role arrays, learner content, transcripts, writing submissions, audio, prompts, credentials, and provider metadata.

## Actor privacy

The opaque actor subject remains inside the canonical audit record for future audit equality. It is never placed in logical keys, blockers, warnings, view models, or readiness UI.

## Finalized outcomes

Proceed, rejected and more-evidence records are all valid audit outcomes when the Phase 6.1 canonical record is valid and finalized.

## Proceed audit records

A finalized proceed record may produce a persistence request, but it remains unpersisted, unsigned, and unapplied downstream. It does not approve a model, license, or artifact.

## Rejected audit records

A finalized rejected record remains rejected in the envelope. Persistence preparation must never rewrite it as proceed.

## More-evidence audit records

A finalized more-evidence record remains more-evidence in the envelope. It is an audit outcome, not downstream authorization.

## Deterministic persistence key

The logical persistence key derives from candidate ID, observed immutable revision, canonical record key, canonical record revision, and persistence schema revision. It excludes actor subject, reviewed time, database identifiers, and random values.

## Deterministic idempotency key

The idempotency key deterministically extends the logical persistence key. The same exact canonical record produces the same key; a record revision or scope change produces a different key.

## Logical key versus cryptographic proof

The persistence key is not a signature, hash or checksum. The idempotency key is not cryptographic proof. Phase 6.4 creates no digest, signing key, signature, or verification claim.

## Append-only semantics

The only allowed operation is `append`. Update, delete, replace and upsert are forbidden. Client overwrite and client delete are also forbidden.

## Immutability

Every envelope is immutable and append-only. A new canonical record revision requires a new envelope; an existing envelope is never mutated.

## Record revisions

Canonical record revision remains owned by Phase 6.1. Persistence schema and policy revisions are separate deterministic Phase 6.4 contract revisions.

## Duplicate handling

An existing envelope with the same persistence key and identical explicit content is classified as an identical duplicate. A future repository may treat it as an idempotent no-op; Phase 6.4 performs no write.

## Conflicting duplicate handling

An existing envelope with the same persistence key but different explicit content is a conflict. Conflicting records must be rejected and cannot proceed to repository handoff review.

## Persistence scope

Scope locks record key/revision, candidate, tier, model, repository, immutable revision, evidence and decision-policy revisions, persistence revisions, outcome, reviewed time, actor role, authorization scope, opaque actor subject, and the exact four decisions.

## Scope invalidation

A request is invalidated when candidate, model, repository, revision, actor, outcome, decision set, reviewed time, evidence revision, record revision, schema revision, or policy revision changes. Requests never carry between candidates, tiers, revisions, actors, or outcomes.

## Repository boundary

No persistence repository is configured. There is no repository implementation, repository acknowledgement, or persisted-record retrieval in Phase 6.4.

## Persistence attempt boundary

Current persistence attempts = 0 and current repository writes = 0. Request readiness is not a persistence attempt and cannot claim a successful write.

## Current production state

- Persistence contracts: 3.
- Finalized governance records: 0.
- Persistence requests ready: 0.
- Persistence attempts: 0.
- Repository writes: 0.
- Persisted records: 0.
- Signed records: 0.
- Records applied downstream: 0.
- Models, licenses, and artifacts approved: 0.
- Checksums verified and benchmarks passed: 0.
- Downloadable, runtime-ready, and active models: 0.

## Supabase boundary

No Supabase integration, client, Auth call, or storage operation is present.

## Migration and RLS boundary

No migration, table, SQL, or RLS policy is created. Server-side authorization and append-only enforcement belong to a separately reviewed future phase.

## Downstream application boundary

No record is applied downstream. A persistence request or future repository acknowledgement must not select an artifact, approve an artifact, authorize a download, pass a benchmark, or activate a model.

## Failure handling

Malformed records, forbidden fields, unsupported operations, stale scopes, forged lifecycle flags, invalid revisions, and conflicting duplicates fail closed with deterministic machine-readable findings.

## Safety invariants

No new timestamp is generated; canonical `reviewedAt` is preserved. No network, persistence, database, local storage, signature, download, cache, benchmark, runtime, inference, or active model is introduced. Phase 4, Phase 5, and Phase 6.1–6.3 remain unchanged. Approval registry and artifact manifest remain unchanged. Phase 5 closeout remains foundation-complete. Production remains blocked-safe.

## Non-goals

This phase does not provide a repository, database schema, persistence attempt, update/delete operation, signature, downstream application, model or artifact approval, checksum verification, benchmark execution, download, runtime, or inference.

## Future phase entry conditions

Phase 6.5 may implement a separately reviewed persistence repository. A real repository must enforce append-only immutable revisions, verify idempotency, reject conflicts, recheck authentication and authorization server-side, and prevent ordinary users from inserting governance records. Repository acknowledgements must not imply downstream application. Applying persisted records to artifact selection remains a separate authorized operation, and model download/runtime remain blocked.
