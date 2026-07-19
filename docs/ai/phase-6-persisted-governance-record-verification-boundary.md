# Phase 6.7 Persisted Governance Record Verification Boundary

## Status

The typed persisted-record verification boundary is authored. The application does not automatically connect a production read client or query a production database.

## Purpose

Phase 6.7 defines a narrow, deterministic, fail-closed repository for reading one persisted local-model governance audit record and verifying it against an exact Phase 6.4 persistence envelope.

## Baseline

Phase 6.5 owns the append-only table, forced Row Level Security, reviewer-only SELECT policy, immutable trigger, and protected append RPC. Phase 6.6 owns the explicit append repository boundary. Neither phase is modified here.

## Direct SELECT through forced RLS

The repository uses the injected browser client's structural query chain:

```text
from('local_model_governance_records')
  .select(EXACT_ALLOWLISTED_COLUMNS)
  .eq('persistence_key', expectedEnvelope.persistenceKey)
  .limit(2)
```

No read RPC or migration is added. The repository does not create a Supabase client and does not bypass forced RLS.

## Exact selected columns

Only these columns are selected: `id`, persistence and idempotency keys, schema and policy revisions, canonical record key/revision/outcome, candidate and model identity, database actor ID, canonical review time, and the stored persistence envelope. The repository never selects `*` or private RBAC tables.

## Explicit action gate

Only literal `explicitActionRequested === true` permits a query. Module import, repository construction, and readiness rendering perform zero reads.

## Phase 6.4 validation reuse

The expected envelope is validated by `validateLocalModelGovernanceRecordPersistenceEnvelope` before the repository accesses the client. Invalid envelopes fail closed without a query and only safe issue codes are returned.

## RLS ambiguity

Zero rows are reported as `not-found-or-not-visible`. A client cannot safely distinguish a missing row from a row hidden by forced RLS.

## Strict response and row contract

The query response must contain `data` and `error`. Successful data must be an array containing zero or one row. More than one row is malformed. A visible row must contain exactly the allowlisted selected keys; missing or extra keys are rejected.

## Bigint-safe record ID

Positive safe integer numbers and canonical positive decimal strings are normalized to strings. Large decimal strings are never parsed through JavaScript numbers, preventing precision loss.

## Revision normalization

Schema, policy, and canonical record revisions accept safe positive integer numbers or canonical positive decimal strings. Invalid numeric forms are malformed; valid but different revisions are verification mismatches.

## Timestamp verification

The persisted `reviewed_at` must be a valid RFC3339 timestamp with an explicit timezone and must represent the same instant as the canonical Phase 6.1 review time. The repository uses no current clock and creates no timestamp.

## Stable canonical JSON comparison

The stored envelope and expected envelope are compared as JSON values. Object keys are sorted lexicographically, array order is preserved, and non-JSON or cyclic values fail closed. Raw or canonicalized envelopes are not returned.

## Verification scope

Verification covers persistence and idempotency keys, schema and policy revisions, canonical record key/revision/outcome, candidate tier, model identity, repository revision, database actor binding, review instant, and exact stored envelope value. All checks must pass before `verified` is returned.

## Safe mismatch codes

Mismatches return deterministic issue codes in a fixed order without including actual row values, actor identifiers, timestamps, repository identifiers, or envelope bodies.

## Safe error mapping

Authentication and authorization database codes map to safe application statuses. Client transport failures map to `transport-unavailable`; unknown or malformed database errors map to `failed-safe`. Raw errors, stacks, details, hints, and query data are never exposed.

## No repeated query

Each operation performs zero or one query. There is no loop, polling, delayed execution, background work, or fallback query.

## Existing Supabase client

The canonical browser client remains in `src/lib/supabase.ts`. Phase 6.7 does not modify it or instantiate another client. A narrow structural read port is supplied through dependency injection, and current production state remains disconnected.

## Readiness boundary

The readiness card is read-only. It does not provide Verify, Refresh, Search, or connection controls and does not import the concrete repository.

## Current production state

Automatic reads, explicit verification attempts, read invocations, visible records, verified records, and downstream applications are all zero. No model, license, or artifact is approved. No artifact is selected, no checksum or benchmark is verified, no download is available, and no model is active.

## Non-goals

This phase does not add a migration, read RPC, write operation, production query, authentication operation, reviewer assignment, downstream application, model download, benchmark, runtime initialization, or inference.
