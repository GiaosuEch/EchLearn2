# Phase 4.10 Local Model Acquisition Executor Boundary

## Status

Phase 4.10 is an executor boundary only. Production remains unavailable-safe and no acquisition executor is enabled.

## Purpose

The boundary defines how a current one-attempt authorization may be handed to a future executor without performing model acquisition in this phase.

## Relationship to Phase 4.7

Phase 4.7 remains the source of acquisition prerequisite policy. The boundary does not reconstruct approval, benchmark, device, environmental, or storage eligibility.

## Relationship to Phase 4.8

Phase 4.8 remains the source of explicit candidate-specific consent. The boundary cannot substitute consent or reuse consent for another scope.

## Relationship to Phase 4.9

Phase 4.9 remains the source of one-attempt action authorization. Phase 4.10 revalidates that authorization immediately before any handoff and uses the Phase 4.9 consume transition only after an accepted handoff.

## Authorization versus executor handoff

Authorization is a policy permit. Executor handoff is the transfer of a normalized request to an executor port. Neither state means that a model was downloaded, cached, installed, initialized, or activated.

## Execution request contract

The request contains candidate and artifact identity, disclosed size and storage impact, policy revisions, access tier, assigned device tier, benchmark status, the normalized authorization scope, and the one-attempt invariant. It contains no model URL, artifact URL, checksum value, raw user agent, model bytes, tokenizer, learner data, timestamp, or random token.

## Executor port

The asynchronous executor port accepts only the normalized request and returns a contract outcome. It does not decide approval, benchmark, device tier, consent, or authorization validity.

## Unavailable-safe production executor

Production executor is unavailable. It returns `executor-unavailable`, does not throw, does not call network or storage, and never reports a handoff as accepted.

## Handoff acceptance

A handoff can be attempted only after the Phase 4.9 authorization has been revalidated as current and authorized. `handoff-accepted` means only that the executor port accepted responsibility for the request. Handoff accepted does not mean download started.

## Authorization consumption

The boundary consumes authorization through the existing Phase 4.9 policy only after a valid accepted response. Authorization consumed does not mean download completed. Unavailable, rejected, malformed, or failed handoffs do not consume authorization.

## Failure and rejection handling

Blocked authorization prevents request construction and executor invocation. Executor rejection remains non-consuming. Executor failure is caught and normalized without exposing raw exceptions. Malformed or contradictory responses map to unavailable, rejected, or failed-safe outcomes.

## Current production state

The current three production candidates cannot create execution requests. Their preflight, consent, and authorization states remain blocked or unavailable, and the production executor is unavailable. Requests built, executor invocations, accepted handoffs, consumed authorizations, downloads, and active models all remain zero.

## Tier-matrix compatibility

Device classification continues to come only from `localAiDeviceTierPolicy.ts`: ultra-low uses deterministic fallback with no model, Light maps to the 0.6B class, Standard maps to the 1.7B class, and Pro maps to the 4B class when every existing gate passes. The executor boundary does not change tiers, entitlement, or benchmark requirements.

## Privacy and persistence

Execution requests and executor results remain in memory. There is no localStorage, Supabase, cloud sync, database write, audit persistence, timestamp identifier, or random request identifier.

## Safety invariants

There is no network request, model download, artifact URL, cache write, checksum verification, runtime initialization, inference, generated output, model readiness, or active model. Executor acceptance and authorization consumption never alter these invariants. Core app and deterministic fallback remain available independently of the executor boundary.

## Non-goals

Phase 4.10 does not implement a downloader, model installer, cache writer, checksum verifier, benchmark runner, runtime adapter, model activation flow, progress reporting, byte accounting, speed estimate, ETA, retry workflow, or cloud executor.
