# Phase 4 Model License and Artifact Approval Checklist

## Status

Status: Proposed review registry. No candidate is approved, downloadable, configured for runtime, benchmark-approved, or ready for generated coach content.

This document records research metadata and required gates only. It does not create a model artifact manifest, runtime configuration, download flow, cache behavior, or inference path.

## Candidate registry

| Candidate | Tier | Intended review | Approval state |
|---|---|---|---|
| Qwen3-0.6B | Light | Small-device feasibility and fallback-quality evaluation | Blocked; all approval flags remain false |
| Qwen3-1.7B | Standard | Primary quality, latency, and memory evaluation | Blocked; all approval flags remain false |
| Qwen3-4B | Pro | Stronger-device quality evaluation behind capability gates | Blocked; all approval flags remain false |

## Official-source review record

Research was checked against primary project sources on July 17, 2026:

- The official `Qwen/Qwen3-0.6B` repository reports Apache-2.0 license metadata.
- The official `Qwen/Qwen3-1.7B` repository reports Apache-2.0 license metadata.
- The official `Qwen/Qwen3-4B` repository reports Apache-2.0 license metadata.
- The official MLC WebLLM repository reports Apache-2.0 for the runtime candidate.
- The official Transformers.js repository reports Apache-2.0 for the secondary runtime candidate.
- The official llama.cpp repository reports MIT for the deferred runtime candidate.

This source review is not product approval. Tokenizer files, notices, commercial/product use, redistribution or hosting strategy, quantized derivatives, transitive notices, and the exact artifact selected later still require dedicated review.

Official source identifiers are stored as review text only. They are not runtime artifact locations.

## Required approval checklist

Every candidate must complete all of the following before promotion:

- Verify the license from an official source.
- Confirm product and commercial use is allowed.
- Confirm redistribution terms or define an approved hosting strategy.
- Review tokenizer and auxiliary-file licensing.
- Review the source and licensing of any quantized derivative.
- Document artifact provenance and immutable version identity.
- Approve an integrity checksum plan.
- Define storage quota, cache lifecycle, eviction, and recovery policy.
- Define a user-controlled artifact deletion path.
- Preserve unavailable-safe behavior when an artifact cannot run.
- Pass the Phase 4.3 benchmark suite.
- Pass safety and output-quality gates.
- Review quality across all 13 supported languages.
- Prohibit official assessment-scoring claims.

## Artifact and runtime boundaries

Phase 4.2 does not define or approve:

- an artifact manifest;
- an artifact location;
- a download location;
- an artifact checksum;
- a quantization build;
- a tokenizer package;
- a cache implementation;
- a runtime adapter;
- generated coach output.

The existing unavailable-safe shell behavior remains the rollback path.

## Next phase gates

Before Phase 4.3 benchmark work begins:

1. Select an exact immutable source revision for review.
2. Complete legal/product review for model, tokenizer, notices, and derivatives.
3. Define artifact provenance and integrity evidence without enabling download.
4. Approve storage, deletion, offline fallback, and recovery policy.
5. Prepare deterministic multilingual benchmark cases for all 13 supported languages.
6. Keep every approval and runtime flag false until evidence is reviewed and explicitly promoted.
