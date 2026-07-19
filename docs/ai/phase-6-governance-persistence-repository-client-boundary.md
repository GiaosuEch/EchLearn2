# Phase 6.6 — Typed Governance Persistence Repository & Supabase RPC Client Boundary

## Status

Boundary authored. Production RPC client wiring, automatic writes, persistence attempts, and downstream application remain unavailable.

## Purpose

Phase 6.6 adds a narrow, typed application repository boundary for an explicit append request to the server-authoritative Phase 6.5 RPC. It does not create a database client, perform a production write, or change governance state.

## Baseline

The boundary consumes the Phase 6.4 persistence-envelope contract and the Phase 6.5 RPC contract. Phase 6.5A remains the database authorization authority. Phase 4, Phase 5, and Phase 6.1–6.5 behavior is unchanged.

## Existing Supabase client foundation

The repository already contains a canonical browser client in `src/lib/supabase.ts`. Phase 6.6 does not modify it or instantiate a second client. The repository factory accepts a narrow structural `.rpc()` client through dependency injection, so the existing client may be supplied by a later explicitly reviewed integration phase.

## Typed repository boundary

The repository exposes an unavailable implementation and an injected-client implementation. Construction is side-effect free. Module import, factory construction, and readiness rendering do not call the RPC.

## Narrow RPC client

The client port only requires:

- a function name;
- a read-only argument object;
- a promise-like response containing unknown `data` and `error` values.

The boundary does not expose a broad concrete Supabase client type and does not read environment configuration.

## Exact RPC contract

The function name is exactly `append_local_model_governance_record`.

The only argument is:

```text
p_envelope
```

No actor ID, actor role, authorization permission, access token, JWT, session, timestamp, or request identifier is sent separately.

## Explicit action gate

Only the literal boolean `true` in `explicitActionRequested` opens the append gate. Missing, false, string, numeric, or other truthy values do not cause an RPC invocation.

## Phase 6.4 validation reuse

The repository calls `validateLocalModelGovernanceRecordPersistenceEnvelope` before repository availability or transport is used. Invalid envelopes fail closed with safe Phase 6.4 issue codes and zero RPC invocations. The repository does not duplicate the canonical envelope policy.

## Response normalization

The repository accepts one strict RPC result row, either as a single-element array or a direct-row wrapper. The row must contain exactly:

- `result_status`;
- `record_id`;
- `persistence_key`.

Allowed statuses are `inserted` and `identical-existing-envelope`. The returned persistence key must equal the requested envelope key.

## Bigint-safe record identifiers

Positive integer strings are preserved without numeric conversion. Positive safe integer numbers are converted to decimal strings. Zero, negative, fractional, exponent, unsafe numeric, or malformed identifiers are rejected as malformed responses.

## Inserted result

`inserted` acknowledges one new server-side insert. The repository reports one invocation, an exact record ID string, and the matching persistence key. This acknowledgement does not apply the record downstream.

## Identical existing result

`identical-existing-envelope` acknowledges the server's deterministic idempotent result. It confirms an existing identical row and is not represented as a new insert, an error, or an additional attempt.

## Safe error mapping

The repository allowlists only database error `code` and `message` for classification. It maps exact authentication, authorization, conflict, and validation errors to typed application statuses. Unknown database failures fail closed. Client/transport failures become `transport-unavailable`.

Raw errors, stack traces, details, hints, SQL text, and envelope content are never returned by the repository result.

## No repeated invocation

One repository operation performs zero calls when gated or invalid and exactly one call after a valid explicit attempt. Authentication, authorization, validation, conflict, transport, malformed response, and unknown failures do not trigger an additional call.

## No direct table mutation

The boundary never performs direct table insert, select-after-write, update, delete, truncate, overwrite, or upsert. Only the protected append RPC is available.

## Authorization boundary

The database derives the actor and verifies the exact Phase 6.5A reviewer authorization. Phase 6.6 does not trust client role data, user metadata, generic administrator claims, or entitlement state.

## Privacy and secrets

The repository does not read or store a service credential, anonymous key, Supabase URL, token, session, reviewer identity, or actor metadata. It does not log the envelope or database errors.

## Readiness boundary

The readiness card is read-only. It describes the authored repository contract and reports zero current automatic calls, explicit production attempts, RPC invocations, app-acknowledged records, and downstream applications.

## Current production state

- Repository boundary authored: yes.
- Production RPC client connected by this phase: no.
- Automatic RPC calls: 0.
- Explicit production persistence attempts: 0.
- RPC invocations from current production state: 0.
- Inserted records acknowledged by the app: 0.
- Identical existing records acknowledged by the app: 0.
- Records applied downstream: 0.
- Approved models, licenses, and artifacts: 0.
- Downloadable or runtime-ready artifacts: 0.
- Active models: 0.

## Non-goals

Phase 6.6 does not add UI actions, automatic persistence, background writes, database migrations, remote deployment, reviewer assignment, artifact selection, approval, checksum verification, benchmark execution, model acquisition, runtime initialization, or inference.

## Future entry conditions

A future phase may wire the existing canonical Supabase client into this factory from a protected, explicit governance action surface. That integration must preserve the literal action gate, exact envelope policy, one-call behavior, safe error mapping, database authorization, and separate downstream-application boundary.
