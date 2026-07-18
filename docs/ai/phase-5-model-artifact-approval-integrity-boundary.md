# Phase 5.10 — Explicit Human Artifact Approval & Integrity Pinning Boundary

## Status

Boundary-only implementation. Production remains blocked-safe: no artifact selection is recorded, no approval session is available, and no checksum is pinned or verified.

## Purpose

Phase 5.10 is an artifact approval and integrity-pinning boundary only. It defines deterministic contracts for two separate explicit human decisions: artifact governance approval and integrity pin-plan approval. It does not make either decision automatically.

## Relationship to Phase 5.5

Phase 5.5 supplies immutable revision, required weight-file inventory, exact observed bytes, file roles, and integrity-algorithm evidence. Phase 5.10 consumes that evidence without changing it and never treats observed metadata as local verification.

## Relationship to Phase 5.8

Phase 5.8 governs four model-level requirements. Governance decisions complete is only a prerequisite for later selection; it is not model or license approval and is not rewritten by this phase.

## Relationship to Phase 5.9

Phase 5.9 records an explicit artifact scope. Current artifact selections recorded = 0, so current Phase 5.10 approval sessions available = 0. Synthetic selections used by tests do not change Phase 5.9 production results.

## Artifact selection versus artifact approval

Selection identifies one exact candidate, repository, immutable revision, format, variant, inventory, and size. Approval is a later explicit human decision that the selected scope may proceed to benchmark-planning review. Selection alone never approves an artifact.

## Artifact approval versus model and license approval

Artifact approval does not approve the model or its license. `modelApproved` and `licenseApproved` remain false even in the synthetic artifact-approval-complete path.

## Integrity evidence versus pinning

Integrity evidence reports which official integrity algorithm classes and file metadata were observed. Pinning accepts expected values for an exact selected file scope. Evidence does not generate a pin plan automatically.

## Integrity pinning versus verification

Pinning does not verify checksum. Verification requires obtaining the actual file and comparing a locally computed value, which is outside Phase 5.10. Every pin item keeps `verified=false`.

## Approval prerequisites

The boundary opens only after a Phase 5.9 `selection-recorded` result that remains consistent with Phase 5.5. The selected option, repository, revision, format, variant, shard inventory, exact bytes, provenance, integrity status, and policy revisions must still match. A complete valid pin plan must also exist before human approval can be recorded.

## Human approval decisions

Artifact decisions are `not-recorded`, `approve-for-benchmark-planning`, `reject`, or `request-more-evidence`. Integrity-pinning decisions are `not-recorded`, `approve-pin-plan`, `reject`, or `request-more-evidence`. Neither decision defaults to approval.

## Integrity pin plan

A pin plan binds candidate and tier, selected option, repository, immutable revision, format, variant, quantization label, required file names, file-level pin items, artifact-selection revision, integrity-evidence revision, and pin-plan revision. Production currently contains no pin plan or digest value.

## Supported integrity algorithms

The boundary accepts canonical 64-character lowercase hexadecimal values only for `sha256` and `lfs-sha256`. `xet-content-hash`, `git-object-id`, `host-specific`, and `unknown` remain evidence classifications and are not accepted automatically as production pin algorithms.

## Required file coverage

Required names and pin-item names must be unique. The plan must contain exactly one pin per selected required weight file, no missing or extra file, matching file role and exact official byte size. Source revision and source evidence identity must also match.

## Approval scope

The scope includes candidate identity, tier, model class, exact model name, selected option, repository, revision, format, variant, quantization label, shard count, exact weight bytes, tokenizer/config provenance, integrity status and algorithms, governance/selection/evidence revisions, pin-plan revision, approval-policy revision, required file set, and file-level pin metadata.

## Scope invalidation

Any candidate, tier, identity, repository, revision, format, variant, quantization, inventory, size, provenance, algorithm, evidence revision, policy revision, required-file, or expected-pin change invalidates previous approval. Approval never carries between candidates, tiers, revisions, Safetensors and GGUF, or base and quantized variants.

## Partial decisions

When exactly one required decision has been explicitly recorded, the session is `partially-recorded`. It cannot approve an artifact, pin a checksum, or proceed to benchmark planning.

## More-evidence requests

Either human decision may request more evidence. The session becomes `more-evidence-requested`, with artifact approval and checksum pinning both false.

## Rejections

A rejection in either decision makes the session `rejected`. Rejection does not change historical selection evidence, approval registries, or manifests.

## Artifact approval complete

`artifact-approval-complete` requires a valid current selection, a complete pin plan, explicit `approve-for-benchmark-planning`, explicit `approve-pin-plan`, and an unmodified scope. It only permits benchmark-planning review. It does not verify a checksum, publish a manifest, authorize a download, pass a benchmark, initialize a runtime, or activate a model.

## Benchmark-planning boundary

Phase 5.10 can expose `canProceedToBenchmarkPlanning=true` only in synthetic tests that satisfy both explicit decisions. Benchmark planning and execution remain separate future work, and production eligibility is zero.

## Approval registry boundary

`localModelApprovalRegistry.ts` remains unchanged. Synthetic approvals do not update candidate model, license, artifact, benchmark, download, or runtime flags.

## Artifact manifest boundary

`localModelArtifactManifest.ts` remains unchanged. Synthetic pin plans do not publish checksum values, download locations, or runtime artifact entries.

## Current production state

Current artifact selections recorded = 0. Current artifact approval sessions available = 0. Current artifact approvals recorded = 0. Current integrity pinning decisions recorded = 0. Approved artifacts, checksums pinned, checksums verified, benchmark-planning candidates, download locations, benchmark passes, downloadable artifacts, runtime-ready artifacts, and active models are all zero.

## Tier-matrix compatibility

Ultra-low remains deterministic no-model fallback. Light remains Qwen3-0.6B, Standard remains Qwen3-1.7B, and Pro remains Qwen3-4B. No approval session is created for Ultra-low, and approval does not open a tier or bypass entitlement or benchmark requirements.

## Privacy and persistence

The boundary stores no reviewer name, email, identifier, signature, timestamp, learner data, random token, browser metadata, or persistent state. It uses no local storage, session storage, IndexedDB, CacheStorage, Supabase, or network call.

## Failure handling

Unknown candidates, stale scopes, evidence conflict, missing or duplicate files, unsupported algorithms, malformed values, size mismatch, source-revision mismatch, invalid decision flags, and forbidden approval/readiness claims fail closed with deterministic machine-readable blockers. Blockers never expose raw expected values.

## Safety invariants

Phase 5.1–5.9 history remains unchanged. Approval registry and artifact manifest remain unchanged. There is no direct artifact URL, download, cache, checksum verification, benchmark execution, runtime initialization, inference, or active model. Phase 4 blocked-safe closeout remains intact.

## Non-goals

This phase does not conduct legal review, approve a model or license, select an artifact, create official digest values, verify files, publish an artifact manifest, configure downloads, run benchmarks, initialize inference, recommend an artifact, or activate a model. Synthetic approvals and pin items exist only in tests.
