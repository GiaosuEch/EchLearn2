# Phase 5.4 Human Artifact Variant Selection Decision Gate

## Status

Phase 5.4 is a human artifact-selection gate only. Production remains blocked-safe and no artifact is selected.

## Purpose

The gate evaluates whether an explicit human selection is consistent with the current model/license review and official artifact evidence. It does not choose an artifact for the reviewer.

## Relationship to Phase 5.1

Phase 5.1 records model and license evidence. Phase 5.4 does not change those facts or convert evidence into approval.

## Relationship to Phase 5.2

Phase 5.2 must return `approved-for-artifact-review` before Phase 5.4 can accept a selection. Current model and license review has not passed for any production candidate.

## Relationship to Phase 5.3

Phase 5.3 records official repository, revision, format, inventory, size, tokenizer, and config evidence. Current artifact evidence remains incomplete for all three candidates.

## Artifact evidence versus artifact selection

Artifact evidence describes observed official facts. Artifact selection is a separate explicit human decision tied to one exact scope. Evidence never selects an artifact automatically.

## Artifact selection versus artifact approval

Selected-for-artifact-approval-review is not artifact approval. It only permits a future governance review of the selected scope.

## Selection prerequisites

A selection requires a passed Phase 5.2 result, complete and conflict-free Phase 5.3 evidence, a recorded human decision, and an exact scope match. Current production satisfies none of the selection paths.

## Selection scope

The scope binds candidate ID, tier, model class, exact model name, official repository, immutable revision, format, variant kind, quantization label, shard count, exact aggregate size, tokenizer/config evidence status, evidence revision, and policy revision.

## Variant and format identity

Base and quantized variants are distinct. Safetensors and GGUF are distinct. A selection cannot carry between formats, variants, or quantization labels.

## Revision and size identity

A revision or exact-size change invalidates the old selection. Rounded or inferred sizes are not accepted as scope identity.

## Selection statuses

The statuses are `blocked-by-model-license-review`, `needs-more-artifact-evidence`, `awaiting-human-selection`, `selected-for-artifact-approval-review`, `rejected`, and `attention-required`.

## Invalid selection combinations

The gate fails closed for unrecorded selections, missing scopes, scope mismatches, unsupported variants, selection before review pass, selection with incomplete/conflicting evidence, or any claim of artifact approval, checksum pinning, downloadability, runtime readiness, or model activity.

## Scope invalidation

Candidate, tier, model class, repository, revision, format, variant, quantization, shard count, size, tokenizer/config evidence, evidence revision, or policy revision changes invalidate a prior selection.

## Current production state

There are three candidates. Model/license review passed count is zero, human artifact selections recorded is zero, and current selected artifact count is zero. Approved, checksum-pinned, downloadable, runtime-ready, and active artifact counts are also zero.

## Tier-matrix compatibility

Ultra-low remains deterministic fallback with no artifact record. Light maps to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B. The gate does not rewrite device thresholds or open higher tiers.

## Approval registry and manifest boundary

The approval registry and production artifact manifest remain unchanged. Phase 5.4 does not write a selected production artifact record.

## Privacy and persistence

There is no reviewer PII, signature, timestamp, random ID, storage, database write, cloud sync, or runtime network request.

## Failure handling

Invalid or mismatched input returns deterministic machine-readable blockers. It is not silently normalized into a valid selection.

## Safety invariants

No direct artifact URL, checksum, download, cache, benchmark, runtime initialization, inference, or active model is introduced. Phase 4 blocked-safe closeout remains intact.

## Non-goals

This phase does not approve artifacts, pin checksums, configure download locations, benchmark models, select a recommended quantization, initialize a runtime, or activate local AI. Synthetic selections exist only in tests.
