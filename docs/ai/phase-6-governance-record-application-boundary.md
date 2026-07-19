# Phase 6.8 — Explicit Persisted Governance Record Application Boundary

## Status

Application-layer boundary authored. No production application action has run, no application decision is persisted, and no governance record has been applied downstream.

## Purpose

Phase 6.8 defines a pure typed policy that decides whether a persisted governance record verified by Phase 6.7 may proceed to a later downstream-review phase. It does not perform downstream work.

## Phase 6 scope

Phase 6.8 consumes the Phase 6.4 persistence envelope, the exact Phase 6.7 verification result, a caller-supplied current scope, an explicit application action, and an optional previous in-memory decision.

## Relationship to Phase 6.4

The Phase 6.4 persistence-envelope validator remains authoritative. Phase 6.8 reuses that validator and does not duplicate the persistence contract.

## Relationship to Phase 6.7

Only an exact, complete `verified` Phase 6.7 result may enter application evaluation. A verified persisted row is evidence of persistence integrity, not governance application, artifact selection, approval, model readiness, or activation.

## Pure application policy boundary

The policy is synchronous, deterministic, side-effect free, and has no database, Supabase, RPC, network, storage, timer, clock, or random dependency.

## Explicit human action gate

Only literal `explicitApplicationRequested === true` opens evaluation. Truthy strings or numbers do not. Importing the module or rendering readiness UI never performs application.

## Verification acceptance

The policy requires the full Phase 6.7 invariant set: one explicit read, visible and verified record, matched envelope, candidate/model/actor/timestamp verification, no raw exposure, and every downstream or readiness claim still false.

## Verification-envelope binding

The verification result must match the expected envelope's persistence key, canonical record key, canonical outcome, schema revision, and policy revision.

## Current application scope

The current scope contains candidate ID and tier, model identity and immutable revision, evidence and governance policy revisions, application policy revision, canonical record revision, persistence key, canonical record key, and canonical outcome.

## Stale detection

Changes to persistence identity, canonical identity or outcome, model revision, evidence revision, governance policy revisions, canonical record revision, or application policy revision fail closed. Phase 6.8 never refreshes Phase 6.7 automatically.

## Candidate and model mismatch handling

Candidate/tier mismatches, model identity mismatches, repository mismatches, and revision mismatches have distinct deterministic statuses and safe issue codes.

## Canonical outcome semantics

`finalized-proceed` may become `eligible-for-downstream-review` after every gate passes. `finalized-rejected` remains blocked as `outcome-rejected`. `finalized-more-evidence` remains blocked as `more-evidence-required`. Unknown outcomes fail closed.

## Deterministic application decision key

The logical key includes candidate ID, observed revision, canonical record key, canonical outcome, and application policy revision. It contains no actor ID, timestamp, random value, hash, checksum, signature, or database row ID.

## Previous-decision replay protection

An identical previous in-memory decision is detected deterministically and returned as an idempotent replay warning without a persistence or downstream-application claim. Conflicting or different-scope previous decisions fail closed.

## Eligible-for-downstream-review semantics

Eligibility only means that a later phase may begin artifact-selection review. It does not mean an artifact is selected, approved, downloadable, benchmarked, runtime-ready, or active.

## Persistence boundary

Phase 6.8 does not persist the application decision. Authoritative persistence belongs to Phase 7.1.

## Downstream application boundary

No governance record is applied downstream. No artifact-selection operation, model/license approval, checksum verification, benchmark execution, download, runtime initialization, or inference occurs.

## Actor privacy

The application request contains no actor, role, permission, reviewer name, email, token, or session field. Results do not expose the actor, raw envelope, raw verification object, database record ID, or reviewed timestamp.

## Current production state

- Automatic applications: 0
- Explicit production application attempts: 0
- Accepted production verifications: 0
- Eligible production decisions: 0
- Persisted application decisions: 0
- Records applied downstream: 0
- Artifact-selection reviews eligible: 0
- Selected artifacts: 0
- Active models: 0

## Failure handling

Malformed runtime inputs and hostile getters fail closed to typed `failed-safe` output. Blockers and warnings are deterministic, unique, ordered, and never contain raw application data.

## Safety invariants

Phase 4, Phase 5, Phase 6.1–6.7, migrations, the Supabase client, approval registry, and artifact manifest remain unchanged. Core functionality remains available without local AI.

## Non-goals

No migration, RPC, database query, database write, Supabase integration, UI action, application persistence, artifact selection, approval, checksum verification, benchmark, download, runtime, inference, or model activation.

## Phase 7.1 entry conditions

A later separately reviewed phase may define immutable persistence for an explicit application decision. It must preserve scope binding, replay protection, server authorization, and the separation between application eligibility and downstream artifact operations.
