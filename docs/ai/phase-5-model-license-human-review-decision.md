# Phase 5.2 — Human Model & License Review Decision Gate

## Status

Phase 5.2 is a decision gate only. The current three production candidates remain `needs-more-evidence`; no human decision has been recorded.

## Purpose

This phase separates Phase 5.1 evidence records from explicit human product and legal decisions. It validates whether evidence is complete enough for a responsible reviewer to decide whether a candidate may enter a future artifact-review phase.

## Relationship to Phase 5.1

Phase 5.1 remains the source of official-source evidence facts. Phase 5.2 consumes those records without browsing again, changing license facts, changing candidate identity, or editing the evidence registry.

## Evidence versus human decision

Evidence collection is not a human decision. Apache-2.0 metadata, commercial-use evidence, or redistribution evidence does not automatically approve product use, derivatives, quantization, tokenizer files, artifacts, benchmarks, runtime execution, or downloads.

## Human review categories

The gate keeps independent decisions for exact model identity, base license, commercial use, redistribution, derived-artifact hosting, derivative works, quantization and conversion, attribution and NOTICE obligations, tokenizer terms, and acceptable-use scope. One category never auto-approves another.

## Evidence completeness gate

Evidence is checked before any human decision. Missing official evidence, unresolved identity, unresolved license text, unknown required license facts, or source conflicts block approval for artifact review. Current records remain incomplete because product-specific conversion, hosting, tokenizer, acceptable-use, browser/runtime, and artifact evidence is unresolved.

## Decision statuses

The deterministic statuses are `needs-more-evidence`, `awaiting-human-decision`, `approved-for-artifact-review`, `rejected`, and `attention-required`. Production currently uses only `needs-more-evidence`.

## Approved-for-artifact-review meaning

Approved-for-artifact-review is not model approval. It is not license approval, artifact approval, benchmark pass, download authorization, runtime readiness, or model activation. It only permits a future, separate artifact-review phase to be considered.

## Invalid decision combinations

An approved category with incomplete or conflicting evidence is invalid. A recorded approval with a mismatched candidate ID or tier, an unsupported `not-applicable` decision, an unrecorded explicit decision, an unknown candidate, or duplicate decision records requires attention and cannot proceed.

## Current production state

The current three candidates need more evidence. No human decision has been recorded. The counts remain: three needs-more-evidence candidates, zero awaiting decisions, zero approved for artifact review, zero rejected, zero model approvals, zero license approvals, zero artifact approvals, zero benchmark passes, zero downloads, and zero active models.

## Tier-matrix compatibility

Ultra-low remains deterministic fallback with no model record. Light remains Qwen3-0.6B, Standard remains Qwen3-1.7B, and Pro remains Qwen3-4B. This gate does not duplicate hardware thresholds, open a tier, alter entitlement, or make 4B active.

## Approval registry boundary

The production approval registry is unchanged. Decision-gate output cannot set model, license, artifact, benchmark, runtime, downloadable, or active-model booleans to true.

## Privacy and persistence

No reviewer name, email, identifier, signature, timestamp, personal data, or free-form legal conclusion is collected. Decisions are not persisted to local storage, session storage, IndexedDB, CacheStorage, Supabase, or cloud sync.

## Failure handling

Unknown candidates, identity or tier mismatches, source conflicts, incomplete evidence with fake approvals, invalid `not-applicable` decisions, and duplicate records fail closed with deterministic machine-readable blockers.

## Safety invariants

There is no network request, download, cache write, benchmark execution, runtime initialization, inference, recommendation, score, or model activation. Synthetic human approvals exist only in tests. The Phase 4 blocked-safe foundation remains intact.

## Non-goals

Phase 5.2 does not provide legal advice, record a real human approval, change evidence facts, approve models or licenses, review artifacts, approve checksums or URLs, run benchmarks, initialize a runtime, or make a model downloadable or active.
