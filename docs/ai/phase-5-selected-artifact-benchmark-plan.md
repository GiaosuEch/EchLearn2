# Phase 5.11 Selected Artifact Benchmark Evidence Plan Boundary

## Status
Implemented as a deterministic, blocked-safe benchmark evidence plan boundary. Current artifact approvals complete = 0, plan sessions available = 0, approved plans = 0, executions = 0, measurements = 0, and passes = 0.

## Purpose
Phase 5.11 is a benchmark evidence plan boundary only. It defines what a future benchmark must exercise and measure for an exact approved artifact without running a benchmark.

## Relationship to Phase 4.3
The existing benchmark foundation remains unchanged and owns generic benchmark dimensions, safety concepts, statuses, and future pass/fail policy.

## Relationship to Phase 4.4
The Device Tier Gate remains the sole owner of hardware classification and numeric hardware thresholds. Phase 5.11 records only the target candidate tier.

## Relationship to Phase 4.6
Runtime-capability metadata remains unchecked until a future execution phase. This phase does not probe WebGPU, request adapters, or claim compatibility.

## Relationship to Phase 5.10
A plan can be proposed only after an exact artifact approval and integrity-pin decision are complete and still current. Production has no such approval.

## Artifact approval versus benchmark planning
Artifact approval permits benchmark planning review only. It does not create measurements, verification, download authorization, or runtime readiness.

## Benchmark planning versus benchmark execution
Benchmark plan approval is not benchmark execution. Execution must occur in a separate future boundary.

## Benchmark execution versus benchmark pass
Execution produces evidence; it does not automatically pass the artifact. This phase produces neither execution nor evidence.

## Benchmark pass versus runtime readiness
A future benchmark pass would still not automatically activate a runtime or model. Compatibility, integrity verification, and activation remain separate gates.

## Plan prerequisites
The exact candidate, artifact option, repository, immutable revision, format, variant, exact bytes, artifact-approval revision, pin-plan revision, selection revision, and integrity-evidence revision must match.

## Benchmark plan decisions
Decision values are `not-recorded`, `approve-plan-for-future-execution`, `reject`, and `request-more-evidence`. Production defaults to `not-recorded`.

## Plan session statuses
Statuses are unavailable, awaiting-plan-review, benchmark-plan-approved, more-evidence-requested, rejected, invalidated, and attention-required.

## Approved artifact scope
The scope contains no URL, digest, timestamp, reviewer identity, browser metadata, learner content, or random token.

## Benchmark plan scope
The scope binds candidate identity, tier, model class, selected option, repository, immutable revision, format, variant, quantization, shard count, exact bytes, and all governing revisions.

## Scope invalidation
Any candidate, artifact, approval, pin-plan, benchmark-foundation, device-policy, plan-policy, scenario, measurement, run-count, or fallback change invalidates the old plan.

## Scenario categories
The plan covers runtime initialization, AI Tutor, Practice Generator, Writing Coach, transcript-only Speaking Coach, consent-aware Learner Memory, and deterministic fallback continuity.

## Measurement requirements
Measurement names include initialization duration, first-output latency, total duration, output count and throughput, peak and steady memory, execution errors, crashes, fallback availability, and output-contract validity. No measurement value exists in Phase 5.11.

## AI Tutor scenarios
A single-turn contract and a low-resource 3–5 turn context contract use deterministic synthetic fixtures only.

## Practice Generator scenarios
The future scenario requires exactly five structured, answerable items.

## Writing Coach scenarios
The future output contract requires Đánh giá, Lỗi sai, and Câu mẫu viết lại.

## Speaking Coach scenarios
The future scenario consumes transcript text only and does not imply speech recognition.

## Learner Memory scenarios
Only consented metadata and bounded context may be represented; raw learner submissions are excluded.

## Deterministic fallback continuity
Fallback continuity is always required and must preserve the core app after model failure.

## Run-count requirements
The plan records deterministic minimum and warm-up counts. It does not record timings, throughput, memory, quality scores, or outcomes.

## Failure and crash handling
A future run must stop safely on crash, record errors, preserve fallback, and never crash the core app.

## Device Tier Gate ownership
Phase 5.11 does not copy RAM, GPU, storage, entitlement, or browser thresholds and cannot bypass device classification.

## Benchmark-threshold ownership
Existing benchmark policy owns numeric performance thresholds and future pass/fail evaluation. This phase does not duplicate them.

## Future benchmark-execution boundary
An approved plan only permits a future execution review. It does not start execution, verify checksum, download artifacts, or initialize runtime.

## Current production state
Three candidates have unavailable plan sessions. No plan decision is recorded; no plan is approved; no execution, measurement, pass, failure, download, runtime-ready artifact, or active model exists.

## Tier-matrix compatibility
Ultra-low remains deterministic fallback. Light maps to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B. Plan approval cannot open or bypass a tier.

## Privacy and persistence
No reviewer PII, signature, timestamp, persistence, network request, learner content, or raw browser metadata is used.

## Safety invariants
Phase 4 and Phase 5.1–5.10 history remain unchanged. Approval registry and artifact manifest remain unchanged. No direct artifact URL, download, cache, runtime, inference, checksum verification, fake measurement, or fake benchmark pass is introduced. Phase 4 blocked-safe closeout remains intact.

## Non-goals
No benchmark execution, pass/fail evaluation, runtime probe, download, cache, installation, inference, activation, recommendation, scoring, or model readiness is implemented.
