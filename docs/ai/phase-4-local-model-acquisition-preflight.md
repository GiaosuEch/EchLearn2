# Phase 4.7 Local Model Acquisition Preflight Gate

## Status

Phase 4.7 is policy only. It introduces no model download, cache write, checksum verification, runtime initialization, inference, or model activation.

## Purpose

The acquisition preflight is the single deterministic policy answer to whether a future phase may consider preparing one specific local model acquisition attempt. A preflight result is not runtime readiness or model readiness.

## Existing foundations

The orchestration consumes the existing approval registry, artifact manifest, benchmark status, runtime capability probe, Adaptive Device Tier Gate, and artifact cache policy. It does not replace or bypass those foundations.

## Preflight inputs

Inputs are normalized policy facts: candidate identity, artifact matching, governance approvals, benchmark evidence, device-gate output, capability metadata, environmental safety, storage status, entitlement, cache-policy output, and explicit confirmation state.

## Candidate and artifact matching

Candidates and artifacts join only by candidate ID, then their tiers must match. Display names, preferred AI tier, device strength, and entitlement never select a candidate implicitly. The current mapping remains light to 0.6B, standard to 1.7B, and pro to 4B because those values come from the existing registry.

## Governance approval gates

Model, license, and artifact approvals remain sourced from the current approval registry and manifest. Research metadata is not product approval, and an artifact candidate is not an approved artifact.

## Benchmark gate

Current benchmark statuses remain not-run. A benchmark plan, completed capability probe, strong device, or higher entitlement does not create benchmark evidence.

## Device and entitlement gate

The preflight maps the capability result to the existing device profile and calls the existing Device Tier Policy. It does not duplicate hardware thresholds. Ultra-low remains no-model fallback; light corresponds to the current 0.6B class, standard to 1.7B, and pro to 4B only when every existing gate passes. Preferred AI tier is not entitlement, and entitlement cannot bypass hardware or benchmark gates.

## Capability and environmental gates

WebGPU must be supported, connection metadata must explicitly report Wi-Fi, valid battery metadata below 15 percent is unsafe, and hot thermal status blocks. WebGPU presence and a completed probe do not imply runtime readiness.

## Storage quota handling

Storage status is derived only from observed remaining MiB and an explicit required artifact size. Missing, negative, or non-finite values remain unknown. Current artifact sizes remain unknown, so current production storage status remains blocked. Cache budget is never substituted for artifact size, and quota does not reveal HDD or SSD hardware.

## Explicit user confirmation

Confirmation is an in-memory policy input for one candidate attempt. It is offered only after every other prerequisite passes. Confirmed state does not bypass any blocker, declined state blocks, and confirmation is not stored in Learner Memory or settings.

## Preflight statuses

`blocked` means at least one prerequisite or declined confirmation prevents planning. `awaiting-user-confirmation` means every non-confirmation prerequisite passed. `preflight-passed` means the normalized policy facts and explicit confirmation passed, but preflight-passed does not mean model ready.

## Current production state

The current three candidates remain blocked. Current benchmark statuses remain not-run, artifact sizes remain unknown, download locations remain absent, and checksums remain missing. No current candidate is downloadable, cached, initialized, or active.

## Privacy and persistence

The policy performs no network request, persistence, analytics, user-content collection, learner-memory write, or raw user-agent storage. Confirmation remains ephemeral.

## Failure handling

Missing candidate, artifact, capability, connection, storage, or approval metadata remains blocked-safe. The core app and deterministic fallback do not depend on preflight success.

## Safety invariants

Every result is policy-only. Download started, cache written, runtime initialized, model ready, model active, and generated output remain false. Strong devices still require approval and benchmark evidence, and full AI-facing feature UI remains available on weak devices.

## Non-goals

This phase does not download, install, cache, delete, verify, benchmark, initialize, execute, recommend, score, or activate a model. It adds no operational download, install, consent, or activation control.
