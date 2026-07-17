# Phase 4 Local Model Artifact and Cache Policy

## Status

Proposed metadata and policy contract only. No artifact is approved, downloadable, cacheable, installed, or connected to a runtime.

## Artifact candidates

The manifest lists three candidate records aligned with the light, standard, and pro model candidates. Quantization, size estimates, storage location, integrity value, and runtime configuration remain unselected. Every record requires license, artifact, benchmark, and integrity approval.

## Cache budgets

- Ultra-low: zero model-cache budget.
- Light: planning range of roughly 500 MB to 1 GB.
- Standard: planning range of roughly 1 GB to 2 GB.
- Pro: no budget is enabled until artifact and benchmark review define a safe device-specific limit.

All budgets are policy ceilings, not reservations or evidence that an artifact can run.

## Future action gates

A future artifact operation must pass all of these gates before it can be offered:

1. Adaptive device-tier policy permits the candidate tier.
2. Model and artifact approval are complete.
3. Benchmark and safety gates are complete.
4. Browser capability is confirmed for the selected runtime.
5. Connection, battery, thermal, and storage conditions are safe.
6. The user explicitly confirms the operation.

Cellular, offline, low-battery, hot-device, unsupported-browser, unknown-quota, failed-benchmark, or unapproved-artifact states keep the operation blocked.

## User deletion and recovery

Users must receive a clear control to delete local artifact data. Cache failure must never block the core learning app. A future corrupted-cache recovery flow must remove invalid local data and return to deterministic or unavailable-safe behavior. Re-acquisition may only occur after the same approval and user-confirmation gates pass again.

## Integrity contract

Every production artifact must use immutable version identity and a reviewed integrity value. Verification must happen before runtime use. This phase records only that integrity verification is required; it does not provide an artifact location or integrity value.

## Non-goals

This phase does not implement storage estimation, browser storage access, artifact acquisition, cache writes, integrity computation, deletion, recovery, runtime loading, inference, or generated output. It adds no runtime package, remote service, credential, model binary, tokenizer artifact, or production artifact manifest.
