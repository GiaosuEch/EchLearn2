# Phase 4.8 Local Model Acquisition Consent Boundary

## Status

Phase 4.8 is consent policy only. Consent is explicit and candidate-specific, and the decision boundary remains in memory after the Phase 4.7 acquisition preflight gate.

## Purpose

The boundary records whether a user explicitly confirms or declines one disclosed candidate and artifact scope. It does not download, install, cache, initialize, benchmark, or activate a model.

## Relationship to Phase 4.7

Phase 4.7 remains the source of truth for acquisition prerequisites. Phase 4.8 first consumes a preflight result with confirmation set to `not-requested`, evaluates disclosure completeness, records an in-memory decision, maps that decision back to a Phase 4.7 confirmation input, and then re-evaluates the existing preflight policy.

## Consent versus preflight

Preflight decides whether approval, artifact, benchmark, device, entitlement, WebGPU, connection, battery, thermal, and storage prerequisites pass. Consent is a separate explicit decision and cannot create or bypass those facts. A `preflight-passed` result does not mean model ready, runtime ready, downloaded, installed, or active.

## Explicit user decision

Initial consent is never confirmed. There is no automatic opt-in, silent confirmation, default approval, reused preference, or consent inferred from AI Settings or Learner Memory. The supported decisions are awaiting, confirmed, declined, unavailable, and invalidated.

## Candidate-specific scope

Consent is bound to candidate ID, candidate tier, artifact candidate ID, disclosed download size, expected storage impact, and a deterministic disclosure revision. It cannot carry from Light to Standard, Standard to Pro, or between different artifacts.

## Required disclosure

A complete disclosure requires the candidate and tier, artifact identity, model-class label from approved registry metadata, a finite positive estimated download size, a finite positive expected storage impact, Wi-Fi and battery requirements, local and cloud processing statements, cache-removal information, and a clear statement of what confirmation means.

The current artifact size remains unknown. The policy does not infer size from parameter count, tier, cache budget, quantization, or connection speed.

## Scope invalidation

Scope change invalidates consent. A changed candidate, tier, artifact, size, storage impact, or disclosure revision resets the confirmation input to `not-requested`. A previously recorded decision is also invalidated when preflight or disclosure becomes ineligible.

## Consent state transitions

Blocked or incomplete inputs produce `unavailable`. Eligible and complete inputs produce `awaiting-user-decision`. Only an explicit confirm event can produce `confirmed`, and only an explicit decline event can produce `declined`. Reset removes the in-memory decision and re-evaluates the current input.

## Mapping back to preflight

Confirmed maps to Phase 4.7 `confirmed`, declined maps to `declined`, and unavailable, awaiting, or invalidated maps to `not-requested`. Confirmation is only an input to Phase 4.7. It does not authorize an execution action.

## Current production state

The three current production candidates remain blocked and cannot request consent. Their model, license, and artifact approvals remain false; benchmark status remains `not-run`; checksum metadata remains missing; download location remains absent; and artifact size remains unknown. Consent availability, recorded consent, downloads, and active models are all zero.

## Tier-matrix compatibility

`localAiDeviceTierPolicy.ts` remains the only source of device classification thresholds. The existing direction remains ultra-low with deterministic fallback and no model, Light with the 0.6B class, Standard with the 1.7B class, and Pro with the 4B class only when every existing gate passes. Consent cannot raise a tier, change entitlement, bypass benchmark or hardware, or turn a model class into an active model.

## Privacy and persistence

Consent is in-memory only. There is no localStorage, sessionStorage, Supabase write, cloud sync, network request, analytics write, timestamp, expiry timer, or user-content collection. No raw user agent, transcript, writing submission, or learner memory enters the consent scope.

## Failure handling

Missing or inconsistent input stays unavailable-safe. Invalid events do not throw and cannot create confirmation. Missing disclosure values are returned as deterministic machine-readable fields. The core app remains available even when consent cannot be offered.

## Safety invariants

There is no download, cache write, checksum verification, runtime initialization, benchmark execution, inference, generated output, recommendation, score, or model active state. `downloadAuthorizedForExecution`, `downloadStarted`, `cacheWritten`, `runtimeInitialized`, `modelReady`, and `modelActive` remain false in every consent result.

## Non-goals

Phase 4.8 does not add a download executor, artifact writer, cache manager, checksum verifier, runtime adapter, model activation flow, background worker, persistence layer, production approval, production benchmark pass, or active consent path for current candidates. Synthetic prerequisite-pass and consent fixtures are test-only.
