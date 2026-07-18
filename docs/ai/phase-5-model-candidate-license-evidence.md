# Phase 5.1 — Exact Model Candidate & License Evidence Review

## Status

Evidence review only. All three production candidates remain blocked and require human product and legal approval.

## Purpose

Collect current primary-source evidence for the exact candidates already present in the approval registry without approving a model, artifact, benchmark, runtime, or download path.

## Phase 4 baseline

Phase 4 acquisition foundation is closed in a production blocked-safe state. Phase 5.1 does not change the Phase 4 registry, artifact manifest, tier policy, closeout result, or unavailable production executor.

## Candidate identity

The current registry identifies exactly Qwen3-0.6B, Qwen3-1.7B, and Qwen3-4B. Their official Qwen organization model cards confirm those repository identities and the Apache-2.0 metadata. No candidate is inferred from parameter class alone.

## Evidence methodology

The review was performed on 2026-07-18. Claims are limited to official Qwen model cards, exact repository license files, the official Qwen3 repository, and the Qwen Team release announcement. Evidence review is not legal approval.

## Source quality rules

Primary evidence must be published by Qwen or the official Qwen organization. Community mirrors, search snippets without opened sources, third-party benchmark pages, direct binary links, signed links, and model-artifact download links are excluded.

## Light candidate evidence

- Candidate ID: `qwen3-0-6b-candidate`
- Exact candidate: Qwen3-0.6B
- Tier and class: Light, 0.6B
- Publisher: Qwen Team, Alibaba Cloud
- Official model card: https://huggingface.co/Qwen/Qwen3-0.6B
- Official license: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- License identifier: Apache-2.0
- Review status: evidence-incomplete
- Missing evidence: product-specific quantization interpretation, hosted-derived-artifact terms, tokenizer license scope, separate acceptable-use scope, browser runtime evidence, and artifact provenance
- Conflicts: none found
- Human review required: yes
- Approval remains false

## Standard candidate evidence

- Candidate ID: `qwen3-1-7b-candidate`
- Exact candidate: Qwen3-1.7B
- Tier and class: Standard, 1.7B
- Publisher: Qwen Team, Alibaba Cloud
- Official model card: https://huggingface.co/Qwen/Qwen3-1.7B
- Official license: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- License identifier: Apache-2.0
- Review status: evidence-incomplete
- Missing evidence: product-specific quantization interpretation, hosted-derived-artifact terms, tokenizer license scope, separate acceptable-use scope, browser runtime evidence, and artifact provenance
- Conflicts: none found
- Human review required: yes
- Approval remains false

## Pro candidate evidence

- Candidate ID: `qwen3-4b-candidate`
- Exact candidate: Qwen3-4B
- Tier and class: Pro, 4B
- Publisher: Qwen Team, Alibaba Cloud
- Official model card: https://huggingface.co/Qwen/Qwen3-4B
- Official license: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- License identifier: Apache-2.0
- Review status: evidence-incomplete
- Missing evidence: product-specific quantization interpretation, hosted-derived-artifact terms, tokenizer license scope, separate acceptable-use scope, browser runtime evidence, and artifact provenance
- Conflicts: none found
- Human review required: yes
- Approval remains false

## License comparison

The three exact repositories identify Apache-2.0 and contain the Apache 2.0 license text. The official Qwen3 repository also states that Qwen3 open-weight models are licensed under Apache 2.0. This shared evidence does not approve product use.

## Commercial-use evidence

Apache-2.0 grants broad use and patent rights and contains no non-commercial restriction. Commercial and internal-business use are recorded as supported evidence, subject to human review of the planned product, distribution, notices, trademarks, and any separate terms.

## Redistribution evidence

Apache-2.0 permits redistribution in source or object form subject to its conditions, including providing the license, marking changed files, preserving applicable notices, and handling a NOTICE file when present. Commercial use permission is not treated as a substitute for redistribution review.

## Derivative and quantization evidence

The license expressly grants rights to prepare and distribute derivative works. Phase 5.1 does not make a final legal conclusion that every planned quantization, conversion, hosting arrangement, or browser-format artifact is approved. `quantizationAllowed` therefore remains unknown pending product/legal and artifact-specific review.

## Attribution and notice requirements

Redistribution must preserve applicable copyright, patent, trademark, and attribution notices, provide the license, identify modifications, and preserve relevant NOTICE content when present. Apache-2.0 does not grant general trademark rights.

## Acceptable-use restrictions

No separate Qwen3 acceptable-use policy was located in the reviewed exact model repositories or official Qwen3 repository sources. The field remains unknown rather than being treated as not applicable.

## Tokenizer evidence

Tokenizer files are present in the official model repositories, but Phase 5.1 did not locate tokenizer-specific terms that conclusively establish whether every tokenizer and auxiliary file shares exactly the same redistribution scope. Separate tokenizer terms therefore remain unknown.

## Runtime compatibility evidence

Official model cards document Transformers-oriented use and model architecture metadata. No official browser/WebGPU compatibility evidence was located for these exact candidates. No RAM, token-per-second, device benchmark, WebLLM, or Transformers.js claim is made.

## Missing evidence

All candidates still require quantization/conversion review, derived-artifact hosting review, tokenizer scope review, acceptable-use scope confirmation, browser-runtime evidence, immutable artifact provenance, artifact size, checksum, and benchmark evidence.

## Conflicting evidence

No conflict was found among the reviewed official model-card, exact license, official repository, and official release sources. Any later official conflict must change the status to `conflicting-evidence` and keep the candidate blocked.

## Human review requirements

Human product and legal review remains required for all three candidates. The review must cover the intended commercial product, redistribution/hosting, derivative artifacts, quantization, tokenizer files, notices, trademarks, acceptable-use restrictions, and geographic or access requirements.

## Approval boundaries

Evidence review is not model approval. Evidence review is not artifact approval. It is not benchmark evidence, runtime readiness, or legal advice. `modelApproved`, `licenseApproved`, `artifactApproved`, `benchmarkVerified`, `runtimeReady`, `downloadable`, and `modelActive` remain false.

## Current production state

There are three candidates and zero approved, license-approved, artifact-approved, benchmark-passed, downloadable, runtime-ready, or active candidates. Production execution remains unavailable.

## Safety invariants

No benchmark, download, cache write, checksum verification, runtime initialization, inference, or model activation occurs. Application runtime performs no evidence browsing or network request. There is no direct artifact URL, signed URL, access token, fake size, or fake checksum. Phase 4 blocked-safe invariants remain intact.

## Non-goals

Phase 5.1 does not select an artifact, approve a license, download weights, add a tokenizer, choose quantization, benchmark devices, integrate a runtime, activate a model, recommend a candidate, or provide definitive legal advice.
