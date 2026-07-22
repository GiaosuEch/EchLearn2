# Phase 7.2 — Verified Governance Application Record to Artifact Selection Review Bridge

## Status

Source boundary authored. No production application record has been read or verified by this phase, no bridge decision has been persisted, and no downstream artifact operation has occurred.

## Purpose

Phase 7.2 adds two separate application-layer boundaries:

1. A narrow, explicit, forced-RLS-respecting direct-read repository for a persisted Phase 7.1 governance application record.
2. A pure bridge policy that may produce only an in-memory `eligible-for-artifact-selection-review` decision after a second explicit action and complete scope revalidation.

## Phase 7.1 baseline

The boundary consumes the exact Phase 7.1 application persistence envelope and reuses `validateLocalModelGovernanceApplicationRecordPersistenceEnvelope`. It does not modify Phase 7.1 source, its migration, RBAC, RLS, immutable trigger, append RPC, or application envelope policy.

## No migration, schema, or RPC

Phase 7.2 does not create a migration, table, view, function, trigger, policy, grant, or RPC. Phase 7.2 creates no RPC. It performs no database write. The existing Supabase browser client is not modified or instantiated again.

## Narrow injected read client

The repository receives a narrow structural client through dependency injection. Construction does not query. Current production state does not automatically connect or invoke that client.

The exact query boundary is:

- table: `local_model_governance_application_records`;
- selected columns: `id,application_decision_key,application_idempotency_key,schema_revision,application_policy_revision,source_governance_persistence_key,canonical_record_key,canonical_record_revision,canonical_outcome,candidate_id,candidate_tier,observed_revision,application_status,artifact_selection_review_eligible,application_actor_user_id,application_envelope,created_at`;
- filter: `application_decision_key = expectedApplicationEnvelope.applicationDecisionKey`;
- limit: `2`.

There is no wildcard selection, `.single()`, `.maybeSingle()`, fallback query, actor filter, role filter, permission filter, RPC, or write.

## Forced-RLS behavior and zero-row ambiguity

Reads remain subject to the forced RLS contract authored in Phase 7.1. Zero visible rows are reported as `not-found-or-not-visible`. The client does not claim the row is absent because RLS may hide an existing row.

## Explicit verification gate

Only literal `explicitVerificationRequested === true` permits a read. Truthy strings or numbers do not open the gate. Module import, repository construction, view-model construction, and readiness rendering perform no read.

## Phase 7.1 validator reuse

The exact expected envelope is validated before querying. Invalid envelopes stop before I/O and return sanitized Phase 7.1 issue codes. The repository does not duplicate or weaken the Phase 7.1 envelope contract.

## Strict persisted-row verification

A successful response must contain exactly one row with exactly the selected columns. The repository verifies:

- positive bigint-safe record identity;
- application decision and idempotency keys;
- schema and application-policy revisions;
- source governance persistence key;
- canonical key, revision, and `finalized-proceed` outcome;
- candidate ID, tier, and observed revision;
- `eligible-for-downstream-review` application status;
- artifact-selection review eligibility;
- exact JSON value equality of the persisted application envelope.

Missing keys, extra keys, invalid types, invalid revisions, multiple rows, or malformed wrappers fail closed.

## Actor and timestamp validation without exposure

`application_actor_user_id` must have a valid UUID shape and `created_at` must be a valid RFC3339 instant with timezone. Neither value is returned by the repository or bridge decision. Phase 7.2 never accepts a client actor field.

## Stable JSON equality

Envelope comparison recursively sorts object keys, preserves array order, rejects cycles and non-JSON values, and does not mutate either value. Raw or canonicalized envelope content is never returned.

## Safe error normalization

PostgreSQL code `28000` maps to `authentication-required`; `42501` maps to `authorization-required`. Client failures without a trusted database code map to `transport-unavailable`. Unknown or malformed database errors map to `failed-safe`. Raw messages, details, hints, stacks, rows, actors, timestamps, and envelopes are not exposed.

## Separate pure bridge policy

The bridge evaluator is synchronous, deterministic, side-effect free, and does not call the repository. It receives the expected envelope, exact verification result, caller-provided current scope, literal explicit bridge action, and an optional previous bridge decision.

## Explicit bridge gate

Only literal `explicitBridgeRequested === true` permits evaluation. Verification never triggers the bridge automatically, and readiness rendering performs no bridge action.

## Verification acceptance and binding

The policy accepts only a complete `verified` result with exactly one explicit read, valid envelope, visible and verified record, exact immutable-field and envelope matches, valid actor/timestamp columns, no raw exposure, and every downstream/approval/runtime flag still false.

The result is rebound to the expected Phase 7.1 envelope across application keys, source governance key, canonical scope, candidate scope, observed revision, revisions, status, and review eligibility. Any mismatch is stale and fails closed.

## Current-scope revalidation

The current bridge scope is deterministically built from the Phase 7.1 envelope. Candidate or tier switching is rejected. Observed, schema, application-policy, canonical-record, or bridge-policy revision changes are rejected. Key or canonical-scope changes are treated as a stale application record.

No mutable artifact registry is used to repair scope.

## Deterministic bridge decision key

The key format is:

`local-model-artifact-selection-review:<candidateId>:<observedRevision>:<applicationDecisionKey>:bridge-policy-revision-1`

It contains no actor, database ID, timestamp, random value, hash, URL, file name, checksum, or concrete artifact identity.

## Replay and conflict protection

An identical previous in-memory decision is recognized as a replay and returns the same eligibility with a sanitized warning. It is not called newly persisted. A conflicting or differently scoped previous decision returns `previous-decision-conflict`. Previous decisions are never overwritten or mutated.

## Artifact-selection review eligibility semantics

`artifactSelectionReviewEligible = true` means only that a later phase may begin a separate explicit review of candidate artifact variants. It does not mean an artifact exists, is selected, is approved, is downloadable, or is runtime ready.

## Safety boundaries

Phase 7.2 performs no bridge persistence, downstream application, artifact selection, artifact approval, model or license approval, checksum verification, benchmark execution, download, runtime initialization, inference, or model activation.

## Current production state

All current production counters remain zero:

- automatic reads and bridges;
- explicit production read and bridge attempts;
- production read invocations;
- verified application records;
- eligible or persisted bridge decisions;
- downstream applications;
- artifact-review eligibility, selection, and approval;
- model/license approval;
- checksum and benchmark results;
- downloads, runtime-ready artifacts, and active models.

## Phase 7.3 entry condition

A later Phase 7.3 may begin only as a separate explicit artifact-selection review program. It must consume a valid Phase 7.2 bridge decision, preserve stale/replay protection, avoid automatic selection, and keep artifact approval, download, benchmark, runtime, and activation as separately reviewed operations.
