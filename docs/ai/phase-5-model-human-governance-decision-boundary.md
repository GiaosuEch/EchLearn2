# Phase 5.8 — Explicit Human Governance Decision Boundary

## Status

Implemented as an in-memory, deterministic decision boundary. Current production creates three available sessions with twelve unrecorded requirement decisions. No production decision is inferred or recorded.

## Purpose

Phase 5.8 provides an explicit human governance decision boundary over the factual closure evidence produced by Phase 5.7. It records no reviewer identity and performs no model, license, artifact, benchmark, download, runtime, or activation action.

## Relationship to Phase 5.2

Phase 5.2 remains a historical model-and-license review gate. Phase 5.8 is additive and does not rewrite its production results, decisions, blockers, or approval state.

## Relationship to Phase 5.6

Phase 5.6 remains the historical governance review packet. Phase 5.8 uses candidate identity consistency from that foundation without mutating the packet or converting reconciled evidence into approval.

## Relationship to Phase 5.7

Phase 5.7 supplies four candidate-specific factual closure records: tokenizer license scope, acceptable-use scope, derived-artifact hosting, and quantization/conversion. Phase 5.8 consumes those records without changing their facts, source references, or status history.

## Evidence closure versus human decision

Evidence does not create decisions automatically. `factual-evidence-collected`, `sufficient-for-human-decision`, and a conservatively permitted `no-separate-policy-located` status only make a requirement available for explicit human review. Every production decision begins as `not-recorded`.

## Decision boundary versus model approval

Phase 5.8 is a human decision boundary only. A `proceed` decision means that a human reviewer does not block the next governance review step for that requirement. It is not model approval, license approval, artifact selection, artifact approval, checksum pinning, benchmark evidence, download authorization, runtime readiness, or model activation.

## Governance requirements

Each candidate has exactly four independent requirements:

- `tokenizer-license-scope`
- `acceptable-use-scope`
- `derived-artifact-hosting`
- `quantization-conversion`

A decision for one requirement never supplies a decision for another.

## Decision item statuses

Each item is one of `not-recorded`, `proceed`, `reject`, or `request-more-evidence`. The recorded flag must match the item value. There is no default `proceed` path.

## Decision session statuses

Sessions use `unavailable`, `awaiting-human-decision`, `partially-recorded`, `more-evidence-requested`, `governance-decisions-complete`, `rejected`, `invalidated`, or `attention-required`. None of these states means model or artifact approval.

## Decision prerequisites

A session is available only when candidate identity, tier, model class, repository, immutable revision, all four requirement records, and closure statuses are internally consistent. Unresolved or rejected factual evidence keeps the session unavailable. Conflicting evidence requires attention.

## Decision scope

The deterministic scope contains candidate ID, tier, model class, exact model name, official repository ID, observed revision, all four closure statuses, evidence-closure revision, and governance-decision-policy revision. It contains no timestamp, reviewer identity, random token, URL, checksum, browser metadata, or learner content.

## Scope invalidation

A decision is invalidated when any candidate identity, repository, revision, closure status, evidence revision, or policy revision changes. Decisions cannot carry between Light, Standard, and Pro candidates or between old and current evidence scopes.

## Partial decisions

A session with at least one valid recorded item but fewer than four completed decisions is `partially-recorded`. It cannot proceed to artifact-selection review.

## More-evidence requests

Any `request-more-evidence` item moves the session to `more-evidence-requested`. It cannot proceed until a future evidence phase supplies a new valid scope and a new explicit decision.

## Rejections

Any recorded `reject` item makes the session `rejected`. Rejection never produces an artifact selection or approval action.

## Governance decisions complete

`governance-decisions-complete` requires exactly four valid, recorded `proceed` decisions in the current scope. Twelve explicit requirement decisions are required across the three production candidates. Governance decisions complete is not artifact selection, artifact approval, download authorization, benchmark pass, runtime readiness, or model activation.

## Artifact-selection review boundary

A complete session may only signal eligibility for a future artifact-selection review boundary. Phase 5.8 does not modify the historical Phase 5.4 selection gate and does not create a selected artifact.

## Current production state

Current human decisions recorded = 0. Current decision sessions awaiting review = 3. Total required decision items = 12. Completed governance sessions = 0. Candidates eligible for artifact-selection review = 0. Model approvals, license approvals, artifact selections, artifact approvals, checksums, benchmarks, downloads, runtime-ready artifacts, and active models all remain zero.

## Tier-matrix compatibility

Ultra-low remains deterministic fallback with no governance session. Light maps to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B. Phase 5.8 does not rewrite device thresholds, entitlements, benchmark gates, or active-tier state.

## Privacy and persistence

The boundary stores no reviewer name, email, identifier, signature, timestamp, or free-form legal conclusion. Sessions are constructed in memory and are not written to local storage, IndexedDB, CacheStorage, Supabase, a database, or a network service.

## Failure handling

Unknown candidates, missing requirements, duplicate requirements, inconsistent recorded flags, stale scopes, and unsupported approval claims fail closed. Blockers are deterministic, machine-readable, unique, and contain no URL, checksum, or reviewer PII.

## Safety invariants

- No production decision defaults to `proceed`.
- No Phase 5.1–5.7 registry or policy is modified.
- Approval registry and artifact manifest remain unchanged.
- No model or license is approved.
- No artifact is selected or approved.
- No checksum is pinned or verified.
- No benchmark is passed.
- No download, cache write, runtime initialization, inference, or active model exists.
- No network request or AI service call is made.
- Phase 4 blocked-safe closeout remains intact.

## Non-goals

Phase 5.8 does not provide a public reviewer UI, persist decisions, identify reviewers, approve governance, select artifacts, approve artifacts, pin integrity values, plan downloads, run benchmarks, initialize a model runtime, perform inference, or recommend a model or artifact.
