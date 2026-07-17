# Phase 4 Local Model Benchmark Plan

## Status

Planned. Benchmark status is not run; no result has been collected and no candidate is approved by this document.

## Purpose

This plan defines deterministic contracts for evaluating browser-local runtime and model candidates after license, artifact, and runtime review gates are approved. It does not install a runtime, load an artifact, invoke generation, or change AI shell behavior.

## Benchmark dimensions

The harness plans checks for runtime capability, artifact-size budget, initialization time, first-token latency, sustained generation speed, peak memory risk, cancellation and reload recovery, corrupted-cache recovery, unsupported-device fallback, multilingual instruction following, tutor usefulness, practice generation usefulness, writing feedback usefulness, transcript-based speaking feedback usefulness, safety behavior, and audit/provenance metadata.

A separate gate verifies that generated feedback is not presented as an authoritative assessment result.

## Language corpus metadata

The corpus contains one short, original instruction for each of the 13 supported languages: `en`, `vi`, `fr`, `de`, `es`, `zh`, `ja`, `ko`, `it`, `pt`, `ru`, `th`, and `ar`.

Corpus entries contain no learner data, no copyrighted passage, and no expected model answer. They are deterministic metadata for a later isolated benchmark.

## Browser capability contract

A later runtime probe must verify secure-context status, graphics capability, adapter creation, device creation, and storage-estimate support. These values remain unchecked in Phase 4.3.

An unsupported or failed device must return to the existing unavailable-safe shell behavior.

## Result contract

The result schema supports `not-run`, `running`, `failed`, and `completed` states. The default factory returns `not-run` with null timestamps, null metrics, no provenance record, no safety flags, and no notes.

Phase 4.3 creates no stored benchmark result and no generated response.

## Execution prerequisites

Before an isolated benchmark may run:

1. Candidate license and product-use review must be approved.
2. Artifact provenance and integrity planning must be approved.
3. Runtime candidate review must be approved for an isolated environment.
4. Device-tier budgets and storage policy must be defined.
5. Safety and multilingual evaluation criteria must be reviewed.
6. Cancellation, failure, and rollback behavior must preserve unavailable-safe shells.

## Safety boundaries

This plan adds no runtime dependency, artifact location, cache behavior, remote credential, network integration, or inference path. It does not call the generic AI service and does not alter learner-memory consent or coach output gates.

A later phase must record real measurements and provenance before any benchmark or model approval can change.
