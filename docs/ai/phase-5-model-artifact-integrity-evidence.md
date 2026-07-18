# Phase 5.5 — Official Artifact Integrity, Exact Size & Checksum Evidence Review

## Status
Evidence review implemented. All production selection, approval, checksum, download, benchmark, runtime, and activation gates remain blocked-safe.

## Purpose
Phase 5.5 records official immutable-revision file inventories, exact weight-file byte sizes, and integrity-metadata availability for the three existing Qwen candidates. It does not choose an artifact, store a digest value in runtime code, pin or verify a checksum, define a download bundle, or activate a model.

## Relationship to Phase 5.3
Phase 5.3 established the official repository identities, immutable revisions, Safetensors format, shard inventory, and preliminary tensor-payload totals. Phase 5.5 reuses those identities and reviews exact file bytes plus integrity metadata without modifying the Phase 5.3 registry.

## Relationship to Phase 5.4
Phase 5.4 remains the human artifact-selection gate. Current production selected-artifact count remains zero. Integrity evidence does not record or imply a selection.

## Integrity evidence versus checksum pinning
Integrity evidence means an official host exposes integrity metadata for an observed file at an immutable revision. Checksum pinning would select a digest as a production expectation. No digest value is stored in the Phase 5.5 runtime registry and no production checksum is pinned.

## Checksum pinning versus checksum verification
Pinning is a governance/configuration decision. Verification requires obtaining the approved file, hashing it locally with the specified algorithm, and comparing the result with the pinned expectation. Phase 5.5 performs neither operation.

## Source quality rules
Only official Qwen repositories and official Hugging Face repository/documentation pages were used. Community mirrors, third-party conversions, direct binary locations, signed locations, tokens, and CDN bridges are excluded from runtime evidence.

## Immutable revision scope
The reviewed immutable revisions are inherited from Phase 5.3:

- Qwen3-0.6B: `c1899de289a04d12100db370d81485cdf75e47ca`
- Qwen3-1.7B: `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`
- Qwen3-4B: `1cfa9a7208912126459214e8b04321603b3df60c`

Repository commit identifiers are provenance evidence, not file checksums. Branch `main` is not used as immutable artifact identity.

## Weight file inventory
- Qwen3-0.6B: one `model.safetensors` weight file.
- Qwen3-1.7B: two Safetensors weight shards.
- Qwen3-4B: three Safetensors weight shards.

File names are metadata only and are not converted into runtime download locations.

## Weight index consistency
Qwen3-0.6B is a single-file artifact and does not require an index. Qwen3-1.7B and Qwen3-4B have official index evidence whose referenced shard sets match the reviewed inventories. Duplicate names, missing indexed shards, unexpected mappings, and double-counted files fail deterministic validation.

## Exact weight-size evidence
Phase 5.5 records exact official weight-file bytes rather than rounded repository labels:

- Light / Qwen3-0.6B: `1,503,300,328` bytes, approximately `1433.66 MiB`.
- Standard / Qwen3-1.7B: `4,063,515,592` bytes, approximately `3875.27 MiB`.
- Pro / Qwen3-4B: `8,044,982,000` bytes, approximately `7672.29 MiB`.

These are sums of exact observed weight-file sizes. They differ from Safetensors index tensor-payload totals because file containers include overhead.

## Support-file size evidence
The immutable inventories include config, generation config, tokenizer, tokenizer config, vocabulary, merges, license, model-card, and applicable index files. Phase 5.5 records their roles but does not promote rounded display sizes into exact bytes. Exact aggregate support-file bytes remain unavailable.

## Final download-size boundary
`futureDownloadSizeBytes` and `futureDownloadSizeMb` remain `null`. Exact weight-file bytes are not the final product download size because no runtime bundle or required support-file set has been selected or approved.

## Integrity metadata availability
Official large-file metadata exposes integrity identifiers for every reviewed weight file. Phase 5.5 stores only availability and algorithm classes. Digest values are not stored in runtime TypeScript, selected, pinned, verified, or copied into the production artifact manifest.

## Integrity algorithm distinctions
Git commit identifiers, Git object identifiers, Git LFS SHA-256 identifiers, Xet content hashes, and host-specific identifiers are separate concepts. Phase 5.5 does not convert one class into another or claim metadata observation is local verification.

## LFS metadata
The official host exposes Git LFS SHA-256 metadata for reviewed weight files. The registry records `lfs-sha256` availability only and does not record digest values.

## Xet metadata
Hugging Face documents Xet as content-addressable storage and exposes Xet metadata on large-file pages. The registry records `xet-content-hash` as an observed algorithm class while preserving its distinction from LFS SHA-256.

## Git object identifiers
Small Git-tracked support files may use Git object identifiers in Hub cache semantics. Phase 5.5 does not infer per-file support integrity from a repository commit or promote a Git object ID to SHA-256.

## Light candidate integrity evidence
- Candidate: `qwen3-0-6b-candidate`
- Exact model: Qwen3-0.6B
- Tier/class: Light / 0.6B
- Official repository: `Qwen/Qwen3-0.6B`
- Immutable revision: confirmed
- Inventory: one exact weight file; index absent by design
- Index/shard consistency: confirmed
- Exact observed weight bytes/MiB: `1,503,300,328` / approximately `1433.66`
- Support-file evidence: roles observed; exact aggregate support bytes pending
- Integrity metadata: observed for the weight file
- Algorithms observed: LFS SHA-256 and Xet content hash, kept distinct
- Missing evidence: complete support-file integrity review, approved runtime bundle, human review
- Conflicts: none observed
- Human review required: true
- Artifact selected/approved: false / false
- Checksum pinned/verified: false / false

## Standard candidate integrity evidence
- Candidate: `qwen3-1-7b-candidate`
- Exact model: Qwen3-1.7B
- Tier/class: Standard / 1.7B
- Official repository: `Qwen/Qwen3-1.7B`
- Immutable revision: confirmed
- Inventory: two exact weight shards plus index evidence
- Index/shard consistency: confirmed
- Exact observed weight bytes/MiB: `4,063,515,592` / approximately `3875.27`
- Support-file evidence: roles observed; exact aggregate support bytes pending
- Integrity metadata: observed for both shards
- Algorithms observed: LFS SHA-256 and Xet content hash, kept distinct
- Missing evidence: complete support-file integrity review, approved runtime bundle, human review
- Conflicts: none observed
- Human review required: true
- Artifact selected/approved: false / false
- Checksum pinned/verified: false / false

## Pro candidate integrity evidence
- Candidate: `qwen3-4b-candidate`
- Exact model: Qwen3-4B
- Tier/class: Pro / 4B
- Official repository: `Qwen/Qwen3-4B`
- Immutable revision: confirmed
- Inventory: three exact weight shards plus index evidence
- Index/shard consistency: confirmed
- Exact observed weight bytes/MiB: `8,044,982,000` / approximately `7672.29`
- Support-file evidence: roles observed; exact aggregate support bytes pending
- Integrity metadata: observed for all three shards
- Algorithms observed: LFS SHA-256 and Xet content hash, kept distinct
- Missing evidence: complete support-file integrity review, approved runtime bundle, human review
- Conflicts: none observed
- Human review required: true
- Artifact selected/approved: false / false
- Checksum pinned/verified: false / false

## Missing integrity evidence
All candidates still require a complete support-file integrity review, an approved runtime-bundle definition, human integrity review, artifact selection, governance approval, checksum-pinning decision, local verification plan, benchmark evidence, and runtime compatibility review.

## Conflicting evidence
No unresolved conflict was found in repository identities, immutable revisions, shard inventories, exact weight-file byte sizes, or algorithm classifications. A future conflict must produce `conflicting-evidence` and keep downstream gates blocked.

## Human integrity review requirements
Human review must decide the approved bundle, support files, integrity algorithms, digest expectations, required license/notice material, and local verification procedure. Evidence collection does not make those decisions.

## Current production state
Production remains blocked-safe: three candidates, zero selections, zero approved artifacts, zero runtime-recorded checksum values, zero pinned or verified checksums, zero configured download locations, zero passed benchmarks, zero downloadable/cacheable/runtime-ready artifacts, and zero active models.

## Tier-matrix compatibility
Ultra-low remains deterministic fallback with no artifact. Light maps to Qwen3-0.6B, Standard to Qwen3-1.7B, and Pro to Qwen3-4B. Phase 5.5 does not change hardware thresholds, entitlement, model assignment, or active tier.

## Privacy and runtime boundaries
The registry contains no learner data, browser metadata, reviewer PII, generated timestamps, tokens, credentials, signed locations, direct binary locations, or digest values. Application runtime performs no browsing, network request, persistence, download, cache operation, benchmark, runtime initialization, or inference.

## Safety invariants
- Integrity evidence is not checksum pinning.
- Checksum pinning is not verification.
- Official host metadata is not local verification.
- Exact weight bytes are not final approved download bytes.
- Repository total is not automatically runtime bundle size.
- Artifact selected and approved remain false.
- Checksum pinned and verified remain false.
- Downloadable, cacheable, runtime-ready, and model-active remain false.
- Phase 5.4 selected-artifact count remains zero.
- Phase 4 blocked-safe closeout remains intact.

## Non-goals
Phase 5.5 does not select or approve an artifact, store production digest values, pin or verify checksums, configure a download location, download or cache files, define storage requirements, benchmark a model, initialize a runtime, run inference, recommend a variant, or activate any model.
