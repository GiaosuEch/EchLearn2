# Phase 6.1 Trusted Human Governance Decision Record Contract

## Status

Contract foundation only. Current trusted actor contexts = 0. Current finalized governance records = 0. Production remains blocked-safe.

## Purpose

Phase 6.1 is a decision-record contract only. It defines a canonical, deterministic contract for a future trusted governance operation. It does not create a production reviewer, decision, approval, persistence layer, or downstream artifact action.

## Phase 6 scope

Phase 6 begins trusted governance operations incrementally. This phase contains only types, pure validation, deterministic record construction, an empty production state, a view model, tests, and documentation.

## Relationship to Phase 5.7

The record contract consumes the exact four evidence-closure requirements and their current statuses from Phase 5.7. It does not mutate evidence, reinterpret official sources, or replace the closure registry.

## Relationship to Phase 5.8

The record contract reuses the requirement meanings, exact candidate scope, evidence revision, and fail-closed rules from the Phase 5.8 human decision boundary. Current Phase 5.8 production decisions remain zero.

## Relationship to Phase 5.12

Phase 5 closeout remains foundation-complete and production blocked-safe. Phase 6.1 does not establish model readiness or runtime readiness.

## Evidence versus decision

Evidence describes reviewed facts. A decision is an explicit human action. Evidence never creates `proceed`, `reject`, or `request-more-evidence` automatically.

## Decision boundary versus decision record

Phase 5.8 defines when a decision is structurally permitted. Phase 6.1 defines the canonical record produced after trusted actor context, four explicit decisions, a matching scope, and explicit finalization are supplied.

## Trusted actor context

The caller supplies an actor contract with an opaque subject ID, role, authentication state, authorization state, authorization scope, authentication source, and actor-context revision. The policy does not authenticate the actor itself.

## Authentication boundary

Authentication must come from a future trusted external boundary. Phase 6.1 does not validate JWT values or Supabase sessions and does not decode tokens.

## Authorization boundary

The only accepted role is `model-governance-reviewer`. The only accepted authorization scope is `record-model-governance-decision`. Both authentication and authorization verification must be true.

## Actor privacy

The actor subject is opaque, bounded, and not an email or display name. Records contain no reviewer name, reviewer email, password, token, session object, or raw JWT.

## Governance requirements

Every record contains exactly:

- `tokenizer-license-scope`
- `acceptable-use-scope`
- `derived-artifact-hosting`
- `quantization-conversion`

The requirements remain independent. Four proceed decisions are not model approval or license approval.

## Draft decisions

Draft inputs may contain `not-recorded`, `proceed`, `reject`, or `request-more-evidence`. Decision flags must match their values, requirement IDs must be unique, and evidence statuses must match current Phase 5.7 evidence.

## Explicit finalization

A structurally complete draft is not finalized automatically. `finalizeRequested=true` is required, together with a valid trusted actor, four explicit decisions, a current scope, and a valid injected ISO review clock.

## Canonical finalized record

A canonical record contains the exact scope, final decisions, opaque actor subject, actor role, injected review time, outcome, deterministic key, and immutable boundary flags. It remains unpersisted, unsigned, and unapplied.

## Deterministic record key

The record key is assembled from explicit non-secret fields: candidate ID, immutable model revision, evidence-closure revision, Phase 5.8 policy revision, Phase 6.1 policy revision, and record revision. It is not a cryptographic signature, integrity hash, checksum, or digest.

## Record scope

The scope binds candidate ID, tier, model class, exact model name, repository, immutable revision, all four closure statuses, evidence revision, decision-policy revision, record-policy revision, and record revision.

## Scope invalidation

Any change to candidate identity, repository, revision, closure status, requirement set, evidence revision, policy revision, or record revision invalidates the old record. Records do not carry between Light, Standard, Pro, candidates, or model revisions.

## Record revisions

Updates require a new draft and record revision. A finalized record is not mutated silently.

## Proceed outcome

Four explicit proceed decisions may produce `finalized-proceed`. The record can then be considered by a future trusted persistence and artifact-selection-recording review. It is not model approval, license approval, or artifact selection.

## Rejected outcome

Any explicit reject decision produces `finalized-rejected`. The canonical rejection may be eligible for future trusted persistence but cannot proceed to artifact selection.

## More-evidence outcome

When no rejection exists and at least one requirement requests more evidence, the result is `finalized-more-evidence`. It cannot proceed downstream.

## Persistence boundary

Phase 6.1 does not persist records. `eligibleForTrustedPersistence=true` means only that a future separately reviewed repository layer may accept the canonical record. No Supabase is added. No migration is created. No RLS policy, database table, cloud sync, or local storage is added.

## Signature boundary

No record is signed. Phase 6.1 creates no signing key, digital signature, fake signature, or integrity claim.

## Artifact-selection application boundary

No record is applied to artifact selection. Application requires a future explicit and separately authorized operation. Approval registry and artifact manifest remain unchanged.

## Current production state

- Candidates and record contracts: 3
- Trusted actor contexts: 0
- Explicit decisions recorded: 0
- Finalized governance records: 0
- Persisted records: 0
- Signed records: 0
- Records applied to artifact selection: 0
- Models and licenses approved: 0
- Artifacts selected or approved: 0
- Checksums verified: 0
- Benchmarks passed: 0
- Downloads, runtime-ready artifacts, and active models: 0

## Tier-matrix compatibility

Light remains Qwen3-0.6B, Standard remains Qwen3-1.7B, and Pro remains Qwen3-4B. Ultra-low remains deterministic fallback without a model record contract.

## Failure handling

Missing actor context waits for a trusted actor. Invalid actor contracts, malformed decision items, invalid clocks, and forbidden lifecycle claims require attention. Scope drift produces invalidation. Inputs are never silently normalized into valid records.

## Safety invariants

No production actor identity is hardcoded. No decision defaults to proceed. No record is persisted, signed, or applied. There is no network, Auth call, database call, local persistence, model download, benchmark, runtime initialization, inference, or active model. Phase 4 and Phase 5 sources remain unchanged.

## Non-goals

This phase does not add an admin workspace, login flow, Supabase integration, migration, RLS, repository implementation, signature system, artifact selection, artifact approval, checksum verification, model download, benchmark execution, runtime, or inference.

## Future phase entry conditions

Phase 6.2 may add an admin review workspace using this contract. Authentication must come from a trusted external Auth boundary. Persistence and RLS require a separate reviewed phase. Persisted records must be immutable and auditable. Artifact-selection application must be explicit and separately authorized. Model download and runtime remain blocked until all later gates pass.
