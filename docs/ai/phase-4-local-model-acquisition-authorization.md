# Phase 4.9 Local Model Acquisition Action Authorization Gate

## Status

Phase 4.9 is authorization policy only. It adds a deterministic, in-memory boundary after acquisition preflight and explicit consent. It does not provide an acquisition executor.

## Purpose

The gate answers whether one explicit action request for one current candidate and artifact scope may be handed to a future executor. Authorization is not execution evidence and does not change model state.

## Relationship to Phase 4.7

Phase 4.7 remains the source of truth for acquisition prerequisites. Authorization requires the final preflight result to be `preflight-passed`, to allow future acquisition planning, and to contain no blockers. Phase 4.9 does not recreate approval, benchmark, device, environment, artifact, cache, or storage policy.

## Relationship to Phase 4.8

Phase 4.8 remains the source of truth for explicit candidate-specific consent. Authorization requires current confirmed consent, a recorded decision, a valid consent scope, and a `confirmed` confirmation mapping.

## Consent versus action authorization

Consent records an explicit user decision for a disclosure scope. Action authorization is a separate one-attempt policy envelope created only after a later explicit action request. Consent is not authorization, and neither state starts acquisition.

## Explicit action request

An eligible session starts in `awaiting-action-request`. Only the `request-authorization` event can move it to `authorized`. Initial sessions never authorize automatically, and reset never restores authorization without a new explicit request.

## Authorization scope

The scope contains candidate ID, candidate tier, artifact candidate ID, disclosed download size, expected storage impact, disclosure revision, authorization policy revision, access tier, assigned device tier, benchmark status, WebGPU status, connection kind, normalized battery safety, thermal status, and storage quota status. It contains no URL, checksum value, raw user agent, user content, timestamp, or random token.

## Current-facts revalidation

Every event revalidates the current final preflight, current consent, disclosure completeness, consent-scope match, and normalized authorization scope. Facts are consumed from the existing Phase 4.7 and Phase 4.8 results rather than reconstructed from UI copy.

## One-attempt authorization

Authorization is candidate-specific, artifact-specific, in-memory, and one-attempt only. `futureExecutorHandoffAllowed` is true only while the session is `authorized`. No executor is called by this policy.

## Authorization consumption

`consume` closes one authorized permit and moves the session to `consumed`. Consume does not mean a download started or succeeded. It does not mark download completion, write cache, initialize runtime, or activate a model. A new permit requires reset or rebuild followed by another explicit action request.

## Scope and policy invalidation

Candidate, tier, artifact, disclosed size, storage impact, disclosure revision, policy revision, entitlement, assigned device tier, benchmark status, WebGPU, connection, battery safety bucket, thermal state, or storage status changes invalidate the old permit. A blocked preflight or non-current consent also invalidates authorization. A small battery percentage change within the same safe bucket does not invalidate solely by percentage.

## Current production state

The current three production candidates cannot request authorization. Their approvals remain pending, benchmarks remain not-run, artifact sizes remain unknown, checksums remain missing, acquisition locations remain absent, Phase 4.7 preflights remain blocked, and Phase 4.8 consent remains unavailable. Authorization availability, authorized sessions, consumed permits, downloads, and active models are all zero.

## Tier-matrix compatibility

`localAiDeviceTierPolicy.ts` remains the single source of truth for device classification. The existing direction remains ultra-low with deterministic fallback and no model, light with the 0.6B class only after every gate passes, standard with the 1.7B class only after every gate passes, and pro with the 4B class only after every gate passes. Authorization does not open a tier, change entitlement, bypass benchmark, or make the 4B class active.

## Privacy and persistence

Authorization exists only in memory. There is no local persistence, database write, Supabase write, cloud sync, analytics request, timestamp, expiry timer, or random identifier. No user content, transcript, writing submission, or learner memory is collected.

## Failure handling

Missing, stale, mismatched, or blocked facts produce unavailable or invalidated sessions with deterministic, unique reasons. Invalid events do not throw and do not create execution claims. The core app and deterministic fallback remain available.

## Safety invariants

No network request, model download, cache write, checksum verification, runtime initialization, benchmark execution, inference, generated output, model readiness, or model activation occurs. Authorization does not bypass approval, benchmark, hardware, entitlement, capability, connection, battery, thermal, or storage gates. Preferred AI tier is not entitlement. Synthetic authorization fixtures are test-only.

## Non-goals

Phase 4.9 does not add a download executor, installer, cache writer, checksum verifier, runtime adapter, benchmark runner, model selector, recommendation system, active tier, progress UI, worker, service worker, persistence layer, model binary, tokenizer, dependency, API key, or external location.
