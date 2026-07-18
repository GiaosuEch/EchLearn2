# Phase 5.9 — Explicit Human Artifact Selection Recording Boundary

## Status

Implemented as a deterministic, in-memory boundary. Current production has three unavailable selection sessions, zero recorded selections, zero selected artifacts, and zero active models.

## Purpose

Phase 5.9 records an explicit human artifact scope only after governance decisions and focused artifact evidence satisfy the selection prerequisites. It does not choose or approve an artifact automatically.

## Relationship to Phase 5.3

Phase 5.3 supplies official repository identity, immutable revision, artifact format, variant evidence, weight inventory, tokenizer/config provenance, and provenance metadata. Phase 5.9 reads that evidence without changing it.

## Relationship to Phase 5.4

Phase 5.4 remains the historical artifact-selection decision gate. Phase 5.9 is additive and does not rewrite Phase 5.4 results or tests.

## Relationship to Phase 5.5

Phase 5.5 supplies exact observed weight bytes, shard integrity evidence, and integrity algorithm classes. Exact weight bytes identify the selected scope; they are not approved download size.

## Relationship to Phase 5.8

Phase 5.8 must report `governance-decisions-complete` and allow artifact-selection review before Phase 5.9 can open a session. Current governance decisions complete = 0, so current selection sessions available = 0.

## Governance decision versus artifact selection

A completed governance decision only permits a future artifact-selection review. Artifact evidence does not create selection automatically, and a governance `proceed` decision does not select a repository, format, revision, or quantization.

## Artifact selection versus artifact approval

Phase 5.9 is an artifact-selection recording boundary only. select is not artifact approval. Selection recorded is not checksum pinning, checksum verification, download authorization, benchmark evidence, runtime readiness, or model activation.

## Selection prerequisites

The boundary requires a current Phase 5.8 completion, matching candidate/tier/model/repository/revision identity, conflict-free provenance and integrity evidence, immutable revision, known format, known variant, complete weight inventory, exact observed weight bytes, tokenizer/config provenance, and integrity metadata suitable for human selection review.

## Selectable artifact options

Options are deterministic and derived only from explicit evidence. The current builder can represent an official base option when all required fields are available. Official quantized evidence does not become selectable until its own immutable revision, exact size, inventory, tokenizer/config provenance, and integrity evidence are available. No option is labeled recommended, best, fastest, smallest, browser-friendly, or preferred.

## Selection decisions

Decision states are `not-recorded`, `select`, `reject`, and `request-more-evidence`. Production defaults to `not-recorded`; there is no default `select`.

## Selection session statuses

Session statuses are `unavailable`, `awaiting-human-selection`, `selection-recorded`, `more-evidence-requested`, `rejected`, `invalidated`, and `attention-required`.

## Selection scope

The scope binds candidate ID, tier, model class, exact model name, official repository, immutable revision, format, base/quantized variant, quantization label, shard count, exact weight bytes, tokenizer/config provenance, integrity evidence status and algorithms, governance revisions, artifact-evidence revision, integrity-evidence revision, and Phase 5.9 policy revision.

## Scope invalidation

A recorded selection is invalidated when any scope field changes. Selection cannot carry between candidates, tiers, revisions, formats, base and quantized variants, quantization labels, weight sizes, integrity evidence, governance revisions, or policy revisions.

## Base and quantized variants

An official base artifact may become an option only from exact base-repository evidence. Official quantized repositories are evidence only; Phase 5.9 does not choose GGUF, Safetensors, Q4, Q5, Q6, Q8, or any other variant automatically.

## Repository and revision identity

Repository ID and immutable revision are part of the selection identity. A branch name, approximate model class, nearby repository, or changed revision cannot reuse an earlier selection.

## Exact size and integrity identity

Exact weight bytes come from Phase 5.5 file evidence and are part of scope invalidation. They are not a final runtime bundle size, storage approval, checksum pin, or download authorization.

## More-evidence requests

A recorded `request-more-evidence` decision blocks selection and artifact-approval review. It does not mutate Phase 5.3 or Phase 5.5 evidence.

## Rejections

A recorded `reject` decision blocks effective selection and future artifact-approval review. It does not modify the historical approval registry.

## Selection recorded

A selection is recorded only when an explicit `select` decision names a current deterministic option and supplies an exact matching scope. Synthetic selections exist only in tests. Current human artifact selections recorded = 0.

## Artifact-approval review boundary

A valid recorded selection may proceed only to a future artifact approval and integrity-pinning review. Artifact approval, checksum pinning, checksum verification, download-location approval, benchmark approval, and runtime activation remain false.

## Current production state

Production has three candidates, three unavailable sessions, zero awaiting sessions, zero recorded human selections, zero selected artifacts, zero artifact-approval-eligible candidates, zero approved artifacts, zero pinned or verified checksums, zero download locations, zero benchmark passes, zero downloadable or runtime-ready artifacts, and zero active models.

## Tier-matrix compatibility

Ultra-low remains deterministic fallback with no model or selection session. Light maps to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B. Phase 5.9 does not change hardware thresholds, entitlement, benchmark gates, or active tier state.

## Privacy and persistence

The boundary stores no reviewer name, email, ID, signature, timestamp, random token, learner data, browser metadata, or free-form legal conclusion. Decisions are in-memory values only; there is no local storage, session storage, IndexedDB, CacheStorage, Supabase, database, or network persistence.

## Failure handling

Unknown candidates, incomplete governance, insufficient evidence, conflicts, invalid decision flags, unknown or duplicate options, and scope mismatches fail closed. Invalid inputs are never silently normalized into a recorded selection.

## Safety invariants

Phase 5.1–5.8 history remains unchanged. The approval registry and artifact manifest remain unchanged. No direct artifact URL, checksum value, dependency, download, cache, benchmark, runtime, inference, or active model is introduced. Phase 4 blocked-safe closeout remains intact.

## Non-goals

Phase 5.9 does not provide public selection controls, human identity capture, persistence, artifact approval, checksum pinning or verification, download configuration, model acquisition, benchmarking, inference, recommendation, scoring, readiness claims, or model activation.
