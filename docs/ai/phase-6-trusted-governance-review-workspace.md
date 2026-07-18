# Phase 6.3 Trusted Governance Review Workspace Boundary

## Status

Phase 6.3 is a governance review workspace boundary only. The current production state has zero trusted actor contexts, three locked workspaces, zero decisions recorded, and zero finalized records.

## Purpose

This phase defines deterministic in-memory workspace state and explicit review events for the four governance requirements. It does not create a public administration surface or operational approval path.

## Phase 6 scope

The workspace connects the Phase 6.2 mapped actor contract to the Phase 6.1 canonical decision-record authority. Authentication, persistence, artifact operations, benchmark execution, and runtime remain separate future phases.

## Relationship to Phase 5.7

Phase 5.7 remains the factual evidence-closure source. Its exact candidates, repositories, revisions, requirement IDs, and closure statuses are read without mutation.

## Relationship to Phase 5.12

Phase 5 closeout remains foundation-complete and production remains blocked-safe. Phase 6.3 does not establish model or runtime readiness.

## Relationship to Phase 6.1

Phase 6.1 remains the canonical record authority. The workspace maps its in-memory draft into the Phase 6.1 evaluator only after an explicit finalization request.

## Relationship to Phase 6.2

The workspace remains locked unless Phase 6.2 reports `trusted-context-ready`, supplies a compatible mapped actor context, and provides the exact current assertion scope.

## Trusted actor prerequisite

A trusted actor context must come from the provider-neutral Phase 6.2 adapter. Phase 6.3 does not authenticate a user, grant a role, or create an actor fixture in production.

## Workspace boundary

The workspace is a pure state boundary. It creates no route, form, network request, database write, audit record, or external side effect.

## Workspace access states

Statuses are `unavailable`, `locked-no-trusted-context`, `ready-for-review`, `draft-in-progress`, `ready-to-finalize`, `finalize-requested`, `finalized-proceed`, `finalized-rejected`, `finalized-more-evidence`, `invalidated`, and `attention-required`.

## Governance requirements

Every candidate workspace contains exactly:

- `tokenizer-license-scope`
- `acceptable-use-scope`
- `derived-artifact-hosting`
- `quantization-conversion`

## Draft decisions

Draft values are `not-recorded`, `proceed`, `reject`, and `request-more-evidence`. The workspace does not default any decision to proceed and does not infer a decision from evidence status.

## Explicit review start

The `begin-review` event is allowed only after a trusted actor context and current candidate/evidence scope are valid. It records no decision.

## Explicit decision events

`set-decision` changes exactly one requirement. `clear-decision` returns exactly one requirement to `not-recorded`. `reset-draft` clears all in-memory decisions without persistence.

## Explicit finalization request

Completing four decisions does not auto-finalize. A separate `request-finalize` event is required; `cancel-finalize` removes that request while preserving the draft.

## Canonical record integration

On explicit finalization, the workspace supplies the mapped Phase 6.2 actor context, exact Phase 5.7 scope, four explicit decisions, and the caller-injected clock to Phase 6.1. Phase 6.3 does not duplicate canonical record validation.

## Finalized proceed outcome

A `finalized-proceed` workspace contains a Phase 6.1 canonical record in memory and may enter future trusted persistence and artifact-selection recording review. It is not model approval, license approval, artifact selection, artifact approval, download authorization, or runtime readiness.

## Rejected outcome

A `finalized-rejected` record does not proceed to artifact-selection recording review.

## More-evidence outcome

A `finalized-more-evidence` record does not proceed downstream and keeps the model lifecycle blocked.

## Workspace scope

The scope locks candidate ID, tier, model class, exact model name, official repository, immutable revision, four evidence-closure statuses, evidence and decision-policy revisions, Phase 6.1 record-policy revision, Phase 6.2 assertion/context/adapter revisions, Phase 6.3 policy revision, and the exact canonical actor assertion scope.

## Scope invalidation

Actor, role set, permission set, authentication outcome, authorization outcome, candidate, tier, model, repository, revision, evidence status, or policy revision changes invalidate the old draft. Drafts never carry between actors, candidates, tiers, or revisions.

## Actor privacy

Internal policy state may carry the opaque actor subject required by Phase 6.1. View models, candidate rows, blockers, warnings, and readiness UI do not expose actor subject, email, name, token, session, or raw role and permission arrays.

## In-memory draft boundary

Drafts exist only as immutable pure-function inputs and outputs. No local storage, browser database, file write, or cloud synchronization is used.

## Persistence boundary

Drafts are not persisted. Canonical records are not persisted. Trusted persistence remains a separately reviewed future phase.

## Signature boundary

Records are not signed and Phase 6.3 creates no signing key, signature, digest, or timestamp beyond the explicit caller-injected Phase 6.1 review clock.

## Downstream application boundary

No record is applied to artifact selection. Model, license, artifact, checksum, benchmark, download, and runtime operations remain blocked.

## Current production state

Current trusted actor contexts = 0. Current locked workspaces = 3. Current decisions recorded = 0. Current finalize requests = 0. Current finalized records = 0. Current persisted records = 0. Current downstream applications = 0. Current active models = 0.

## Tier-matrix compatibility

Light remains Qwen3-0.6B, Standard remains Qwen3-1.7B, and Pro remains Qwen3-4B. Ultra-low remains deterministic fallback without a model workspace. No entitlement bypasses device or benchmark gates.

## Failure handling

Malformed requirements, stale scope, lost authorization, candidate mismatch, revision mismatch, forbidden lifecycle claims, or unauthorized events fail closed as `invalidated` or `attention-required`. Input is never silently normalized into a valid review.

## Safety invariants

No Supabase, migration, RLS, Auth call, network, persistence, public admin route, review form, model download, cache write, benchmark, runtime, inference, or active model is introduced. Phase 4, Phase 5, Phase 6.1, and Phase 6.2 remain unchanged. Approval registry and artifact manifest remain unchanged. Phase 5 closeout remains foundation-complete. Production remains blocked-safe.

## Non-goals

This phase does not authenticate reviewers, render an interactive production review form, persist drafts or records, sign records, apply records downstream, approve models or artifacts, verify checksums, execute benchmarks, or activate a model.

## Future phase entry conditions

A later Auth integration must supply a real sanitized assertion. The workspace may only be mounted in an internal protected admin surface. Persistence must be a separate reviewed phase with immutable auditability. Applying finalized records downstream requires a separate authorized operation. Artifact selection, checksum verification, benchmark execution, download, and runtime remain blocked until their later gates pass.
