# Phase 5.3 — Official Artifact Variant & Provenance Evidence Review

## Status

Evidence review implemented. All three production artifact candidates remain unselected, unapproved, non-downloadable, non-cacheable, runtime-unready, and inactive.

## Purpose

Phase 5.3 records official repository, revision, format, inventory, configuration, tokenizer, license, integrity-metadata, and official quantized-variant evidence for the three exact Qwen3 candidates. It does not select or approve an artifact.

## Relationship to Phase 5.1

Phase 5.1 records exact model identity and license evidence. Phase 5.3 reuses those exact identities and adds artifact provenance evidence without changing any model or license fact.

## Relationship to Phase 5.2

Phase 5.2 remains blocked with three candidates needing more evidence and zero human decisions recorded. Artifact evidence collection does not create a human decision or approve a candidate for artifact review.

## Artifact evidence versus artifact selection

Artifact evidence is not artifact selection. Repository existence, weight files, an immutable revision, or an official quantized repository do not choose a production artifact. `artifactSelected`, `artifactApproved`, `downloadable`, `cacheable`, `runtimeReady`, and `modelActive` remain false.

## Source quality rules

Evidence uses only official Qwen organization repositories, official Hugging Face repository pages, official commit pages, official model cards, and the official QwenLM/Qwen3 repository. Community mirrors and third-party conversions are excluded.

Human-review references are repository pages only. No direct binary, tokenizer-download, CDN bridge, signed, or credential-bearing URL is recorded.

## Official repository identity

The exact mappings are:

- `qwen3-0-6b-candidate` → `Qwen/Qwen3-0.6B`
- `qwen3-1-7b-candidate` → `Qwen/Qwen3-1.7B`
- `qwen3-4b-candidate` → `Qwen/Qwen3-4B`

The official publisher context is Qwen Team, Alibaba Cloud, supported by the Qwen organization repositories and `QwenLM/Qwen3`.

## Revision and immutability evidence

Official commit histories expose the following immutable revisions observed on 2026-07-18:

- Qwen3-0.6B: `c1899de289a04d12100db370d81485cdf75e47ca`
- Qwen3-1.7B: `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`
- Qwen3-4B: `1cfa9a7208912126459214e8b04321603b3df60c`

These revisions are evidence metadata only. They are not pinned into the production artifact manifest and are not approved revisions.

## Weight format evidence

The official repositories expose non-quantized Safetensors weights for all three exact candidates. Safetensors evidence is not browser compatibility, runtime readiness, or product selection.

## File inventory evidence

Observed official weight inventory:

- Qwen3-0.6B: one `model.safetensors` weight file; no weight index file shown.
- Qwen3-1.7B: two Safetensors shards and `model.safetensors.index.json`.
- Qwen3-4B: three Safetensors shards and `model.safetensors.index.json`.

Each repository also shows config, generation config, tokenizer assets, tokenizer config, LICENSE, and README/model-card files.

## Aggregate size evidence

The official Safetensors index metadata supplies exact aggregate weight totals for Qwen3-1.7B (`4,063,479,808` bytes) and Qwen3-4B (`8,044,936,192` bytes). The single-file Qwen3-0.6B repository page exposes only a rounded display size in the reviewed source, so its exact aggregate bytes and MiB remain unresolved. The registry never estimates size from parameter count, model tier, cache budget, or rounded display values.

## Config evidence

`config.json` and `generation_config.json` are present in all three official repositories. Their presence does not make an artifact selected or runtime-ready.

## Tokenizer evidence

Official tokenizer assets, including tokenizer JSON/config and vocabulary/merge data, are present in the reviewed repositories. Phase 5.3 does not download, package, approve, or assign tokenizer terms.

## License and NOTICE evidence

An Apache-2.0 LICENSE file is present in all three repositories. No separate NOTICE file was observed in the official file trees. NOTICE absence is recorded as absence, not presence, and does not remove human legal review requirements.

## LFS and integrity metadata

Official Hugging Face file pages expose Xet/LFS-style integrity metadata for large weight files. Phase 5.3 records only that integrity metadata is available. It does not record checksum values, verify a checksum, or pin a checksum into the production manifest.

Revision evidence is not checksum verification.

## Official quantized variants

Official Qwen organization GGUF repositories were found for all three candidates:

- `Qwen/Qwen3-0.6B-GGUF` with official q8_0 evidence.
- `Qwen/Qwen3-1.7B-GGUF` with official q8_0 evidence.
- `Qwen/Qwen3-4B-GGUF` with official q4_K_M, q5_0, q5_K_M, q6_K, and q8_0 evidence.

These repositories are evidence only. No quantization is recommended, selected, approved, downloaded, or claimed browser-compatible.

## Light candidate artifact evidence

- Candidate: `qwen3-0-6b-candidate`
- Exact model: Qwen3-0.6B
- Tier/class: Light / 0.6B
- Official repository: `Qwen/Qwen3-0.6B`
- Revision: immutable commit observed
- Format/inventory: Safetensors, one weight file, no index file observed
- Exact aggregate size: unresolved
- Config/tokenizer/license/model-card: present
- NOTICE: absent in reviewed tree
- LFS/Xet integrity metadata: available
- Official quantized evidence: Qwen-owned GGUF repository
- Status: evidence-incomplete
- Human review required: yes
- Artifact selected/approved: false / false

## Standard candidate artifact evidence

- Candidate: `qwen3-1-7b-candidate`
- Exact model: Qwen3-1.7B
- Tier/class: Standard / 1.7B
- Official repository: `Qwen/Qwen3-1.7B`
- Revision: immutable commit observed
- Format/inventory: Safetensors, two weight shards, index present
- Exact aggregate size: `4,063,479,808` bytes (`3,875.2` MiB display), from official Safetensors index metadata
- Config/tokenizer/license/model-card: present
- NOTICE: absent in reviewed tree
- LFS/Xet integrity metadata: available
- Official quantized evidence: Qwen-owned GGUF repository
- Status: evidence-incomplete
- Human review required: yes
- Artifact selected/approved: false / false

## Pro candidate artifact evidence

- Candidate: `qwen3-4b-candidate`
- Exact model: Qwen3-4B
- Tier/class: Pro / 4B
- Official repository: `Qwen/Qwen3-4B`
- Revision: immutable commit observed
- Format/inventory: Safetensors, three weight shards, index present
- Exact aggregate size: `8,044,936,192` bytes (`7,672.2` MiB display), from official Safetensors index metadata
- Config/tokenizer/license/model-card: present
- NOTICE: absent in reviewed tree
- LFS/Xet integrity metadata: available
- Official quantized evidence: Qwen-owned GGUF repository
- Status: evidence-incomplete
- Human review required: yes
- Artifact selected/approved: false / false

## Missing evidence

Qwen3-0.6B still requires exact aggregate byte metadata. All candidates require explicit human artifact selection, checksum selection and verification planning, and browser/runtime compatibility evidence. Artifact review must also decide whether any official base or quantized variant meets product, license, storage, benchmark, and safety requirements.

## Conflicting evidence

No conflict was found among the official repository identities, revisions, or reviewed file trees. A future conflict must move the affected record to `conflicting-evidence` and keep it blocked.

## Human artifact review requirements

A human must review the exact revision, complete file inventory, exact byte sizes, tokenizer/config provenance, integrity plan, selected format and quantization, license obligations, storage impact, benchmark evidence, and runtime compatibility before any artifact selection or approval.

## Current production state

Three model candidates remain registered. Selected artifacts, approved artifacts, pinned checksums, configured download locations, passed benchmarks, downloadable/cacheable artifacts, runtime-ready artifacts, and active models all remain zero. Production execution remains unavailable.

Current human decision gate remains blocked.

## Tier-matrix compatibility

Ultra-low remains deterministic fallback with no model artifact. Light maps to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B. Phase 5.3 does not alter Device Tier Policy or activate the 4B class.

## Privacy and runtime boundaries

The application runtime performs no browsing or network request. Evidence metadata contains no learner content, access token, signed URL, checksum value, model bytes, tokenizer bytes, or direct artifact location. Nothing is persisted by Phase 5.3.

## Safety invariants

Artifact evidence is not artifact approval. Repository existence is not approval. Revision evidence is not checksum verification. Size evidence is not storage approval. Official quantization evidence is not runtime compatibility. No download, cache write, benchmark, runtime initialization, inference, or model activation occurs.

Phase 4 production blocked-safe invariants remain intact.

## Non-goals

Phase 5.3 does not select an artifact, alter the production manifest, approve a model/license/artifact, pin a checksum, configure a download location, estimate missing sizes, run benchmarks, implement a browser runtime, or enable acquisition.
