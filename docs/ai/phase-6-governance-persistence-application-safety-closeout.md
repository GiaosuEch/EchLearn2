# Phase 6.9 Governance Persistence and Application Safety Closeout

## Status

Phase 6 source contracts are closed. This is a source-level closeout, not evidence that a production governance flow, database read, database write, application decision, artifact operation, model download, benchmark, runtime, or inference has occurred.

## Purpose

Phase 6.9 locks the authored governance chain behind a deterministic closeout contract. It verifies nine Phase 6 boundaries, server-authoritative controls, explicit action gates, zero production claims, and zero downstream state before Phase 7 design may begin.

## Phase 6 boundary inventory

The closeout inventory contains exactly nine boundaries:

1. `phase-6.1-canonical-decision-record`
2. `phase-6.2-trusted-actor-context`
3. `phase-6.3-governance-review-workspace`
4. `phase-6.4-persistence-envelope-contract`
5. `phase-6.5a-server-rbac`
6. `phase-6.5-persistence-schema-rls`
7. `phase-6.6-append-repository`
8. `phase-6.7-persisted-record-verification`
9. `phase-6.8-explicit-record-application`

Production runtime does not inspect the filesystem to build this inventory. Regression tests verify the actual files, registrations, and migration markers.

## Phase 6.1 canonical decision record

Phase 6.1 remains the authority for canonical finalized governance records. No production canonical record is claimed finalized by the closeout.

## Phase 6.2 trusted actor context

Phase 6.2 maps only a sanitized, externally verified actor assertion. Client-provided identity, role, permission, metadata, or generic admin state is not accepted as governance authority.

## Phase 6.3 governance review workspace

Phase 6.3 requires an explicit review start, four explicit governance decisions, and a separate finalization request. Current production workspace actions remain zero.

## Phase 6.4 persistence envelope

Phase 6.4 defines the exact immutable persistence envelope, deterministic logical keys, append-only semantics, and three audit outcomes. The logical keys are not signatures, checksums, or cryptographic proofs.

## Phase 6.5A server-authoritative RBAC

The exact reviewer role and permission remain server-controlled. Ordinary users cannot self-assign governance authority. Generic admin, owner, subscription tier, profile metadata, and user metadata are not substitutes.

## Phase 6.5 persistence schema and RLS

The governance records table remains protected by forced RLS, restricted grants, an append-only RPC, deterministic duplicate handling, and an immutable update/delete trigger. Existing migrations are unchanged by Phase 6.9.

## Phase 6.6 explicit append repository

Application append requests remain explicit, use the exact Phase 6.4 envelope, call the protected RPC at most once, do not retry automatically, and do not expose raw database errors.

## Phase 6.7 explicit persisted-record verification

Persisted-record reads remain explicit and subject to forced RLS. A zero-row result remains `not-found-or-not-visible` because the client cannot safely distinguish absence from RLS invisibility. Exact row, identity, revision, actor binding, timestamp instant, and envelope JSON equality are required.

## Phase 6.8 explicit record application

A fully verified result and literal explicit human action are required. Current scope and revisions are revalidated. Rejected and more-evidence outcomes remain blocked. Proceed creates only downstream-review eligibility in memory.

## Server-authoritative controls

Closeout requires server-authoritative RBAC, forced RLS, append-only persistence, and the exact persistence envelope. Client role trust, generic admin bypass, and service credentials in the application are prohibited.

## Explicit persistence, verification, and application

Automatic governance writes, reads, and applications must remain zero. Repository and policy modules do not execute production actions on import or readiness rendering.

## Stale and replay protection

Phase 6.8 rejects stale candidate, model, revision, record, policy, persistence-key, canonical-key, and outcome scopes. Identical in-memory decisions are recognized without claiming a new persisted or applied decision. Conflicting previous decisions fail closed.

## Outcome semantics

`finalized-proceed` may enter a separate downstream review. `finalized-rejected` and `finalized-more-evidence` remain blocked. None of these outcomes is model approval, license approval, artifact selection, artifact approval, checksum verification, benchmark success, download readiness, runtime readiness, or model activation.

## Current static production state

All automatic-action, production-attempt, persisted-record, verified-record, persisted-application-decision, downstream-application, artifact, approval, checksum, benchmark, download, runtime, and active-model counters are zero. No production governance flow has executed.

## Safety invariants

- No network, database, Supabase, RPC, storage, clock, random source, worker, queue, retry, or telemetry exists in the closeout policy.
- No raw envelope, actor identity, database row, token, credential, migration content, or raw error is returned.
- Phase 6.1 through Phase 6.8 sources remain unchanged.
- Existing migrations, the Supabase client, approval registry, artifact manifest, dependencies, and lockfiles remain unchanged.
- The core application and deterministic fallback remain available without local AI.

## Phase 7 entry condition

`phase7DesignEntryEligible` means only that Phase 7 may begin as a separate design program for authoritative application-decision persistence and an explicit artifact-selection bridge. Phase 7 must preserve server authorization, immutable audit history, explicit human action, stale/replay protection, and blocked download/runtime state until later reviewed gates pass.

## Non-goals

Phase 6.9 does not persist or verify a production record, persist an application decision, apply a record downstream, select or approve an artifact, approve a model or license, verify a checksum, execute a benchmark, download a model, initialize a runtime, perform inference, or activate a model.
