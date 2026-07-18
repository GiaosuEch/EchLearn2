# Phase 5.7 — Unresolved Model Governance Evidence Closure Review

## Status

Evidence-closure review completed for the three exact Qwen3 production candidates. This phase records official factual evidence only. Every human, approval, selection, checksum, benchmark, download, runtime, and active-model boundary remains blocked.

## Purpose

Phase 5.7 closes four factual gaps identified by the Phase 5.6 governance packet:

- tokenizer-license-scope;
- acceptable-use-scope;
- derived-artifact-hosting evidence for a future human decision;
- quantization-conversion evidence for a future human decision.

Evidence closure is not legal advice, governance approval, model approval, license approval, artifact selection, or artifact approval.

## Relationship to Phase 5.1

Phase 5.1 remains unchanged. Its historical evidence records still report tokenizer and acceptable-use gaps because those records capture what had been reviewed at that phase. Phase 5.7 is additive and does not rewrite that history.

No historical registry is modified.

## Relationship to Phase 5.2

Phase 5.2 remains unchanged. No human model or license decision is recorded, and no candidate is approved for artifact review.

## Relationship to Phase 5.3

Phase 5.3 supplies exact repository identity, immutable revision, official tokenizer-file provenance, repository-level license files, and official Qwen quantized-repository evidence. Phase 5.7 consumes those facts without changing the provenance registry.

## Relationship to Phase 5.4

Phase 5.4 remains unchanged. No human artifact selection is recorded and no artifact is selected.

## Relationship to Phase 5.5

Phase 5.5 remains unchanged. Integrity and exact-size evidence does not pin or verify a checksum and does not authorize a download.

## Relationship to Phase 5.6

Phase 5.6 remains an immutable historical packet. Phase 5.7 provides an additive impact preview:

- tokenizer-license-scope could move from unresolved to satisfied factual evidence;
- acceptable-use-scope could move from unresolved to satisfied factual evidence;
- derived-artifact-hosting remains requires-human-decision;
- quantization-conversion remains requires-human-decision.

The current Phase 5.6 packet is not mutated and no packet becomes approved.

## Evidence closure versus governance decision

Factual evidence closure means official source material is sufficiently identified and summarized. A governance decision is an explicit human approve or reject action. Phase 5.7 performs only the former.

All four requirements still require human review. Derived-hosting and quantization remain explicit product and legal decisions even though the factual source base is sufficient to present those decisions.

## Source quality rules

Only primary official sources are used:

- exact Qwen repositories and immutable file trees on the Qwen Hugging Face organization;
- exact repository Apache-2.0 license pages;
- official Qwen3 publisher documentation;
- the official Qwen Usage Policy;
- official Qwen GGUF model cards;
- the Apache Software Foundation license text and license-application guidance.

Community mirrors, community quantizations, third-party legal summaries, search snippets, direct binary URLs, and signed or credential-bearing links are excluded.

Research date: `2026-07-18`.

## Tokenizer provenance

Each exact immutable Qwen3 repository contains publisher-hosted tokenizer assets, including `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, and `merges.txt`. The official model cards load the tokenizer from the same exact repository identity.

The reviewed trees contain a root `LICENSE` file and no separate tokenizer-specific `LICENSE`, separate tokenizer `NOTICE`, or declared upstream-tokenizer terms file.

## Tokenizer license scope

The official repository metadata identifies Apache-2.0, the exact immutable repository contains a root Apache-2.0 license, and official Apache guidance describes placing the license in the top directory of a distribution. These sources provide factual repository-distribution evidence for the tokenizer files.

Status for all three candidates: `factual-evidence-collected`.

This does not set `licenseApproved=true`. Human product and legal review remains required, including confirmation that no external upstream material introduces additional obligations.

## Upstream tokenizer terms

No separate upstream tokenizer repository or tokenizer-specific terms are declared in the reviewed exact model cards, immutable trees, or repository license files. This is a factual observation, not a guarantee that no external rights could exist.

No upstream conflict was located. Human review remains required.

## Acceptable-use policy search

The official Qwen Usage Policy, last updated 21 March 2025, states that it applies to Qwen platforms, APIs, and open-source models, for commercial and non-commercial use. It describes universal standards, prohibited activities, high-risk use requirements, and enforcement.

## Acceptable-use applicability

Because the official policy explicitly includes open-source models, Phase 5.7 records factual applicability evidence for the Qwen3 candidates.

Status for all three candidates: `factual-evidence-collected`.

The policy is organization-level and time-versioned. Human review must confirm its current applicability for the product, jurisdiction, user group, and future policy updates. The result is not `not-applicable` and is not a governance approval.

## Derived-artifact hosting evidence

Apache-2.0 grants rights to reproduce, prepare derivative works, and distribute the work or derivative works in source or object form and in any medium, subject to conditions including:

- providing recipients a copy of the license;
- prominent notices on modified files;
- retaining applicable copyright, patent, trademark, and attribution notices;
- handling NOTICE content when a NOTICE file is included;
- respecting the absence of a general trademark grant.

These facts support future review of distinct scenarios:

- internal or private hosting;
- distribution to end users;
- CDN or object-storage delivery;
- distribution of modified or quantized weights;
- accompanying tokenizer, configuration, and support files.

Status for all three candidates: `sufficient-for-human-decision`.

No scenario is approved in Phase 5.7.

## Quantization and conversion evidence

The official Qwen3 documentation includes quantization guidance, and the Qwen organization publishes official GGUF repositories for Qwen3-0.6B, Qwen3-1.7B, and Qwen3-4B. Those repositories provide official publisher conversion provenance and retain Apache-2.0 repository metadata.

Apache-2.0 supplies derivative-work and redistribution facts, but product-specific conversion still requires review of modification notices, license and attribution handling, artifact naming, trademark use, tokenizer and configuration bundling, quality, runtime compatibility, and distribution strategy.

Status for all three candidates: `sufficient-for-human-decision`.

No quantization is selected, recommended, approved, benchmarked, or activated.

## Apache-2.0 modification and redistribution facts

Apache-2.0 permits preparation of derivative works and distribution in source or object form, with or without modifications, in any medium, provided the license conditions are met. These are factual license mechanics, not a product-specific legal conclusion.

## Attribution, NOTICE and modification obligations

A future distribution review must address:

- license-copy delivery;
- prominent modification notices;
- retention of applicable notices;
- NOTICE handling if a source distribution includes a NOTICE file;
- documentation or display placement where required.

The reviewed exact base repositories do not contain a separate NOTICE file, but that absence does not remove the other Apache-2.0 conditions.

## Trademark limitations

Apache-2.0 does not grant general permission to use licensor trade names, trademarks, service marks, or product names beyond reasonable descriptive use and required NOTICE reproduction. Product branding and artifact naming remain human review items.

## Light candidate closure

- Candidate: `qwen3-0-6b-candidate`
- Exact model: `Qwen3-0.6B`
- Repository: `Qwen/Qwen3-0.6B`
- Revision: `c1899de289a04d12100db370d81485cdf75e47ca`
- Tokenizer provenance: official exact-repository assets
- Tokenizer-license evidence: repository-level Apache-2.0 factual evidence collected
- Acceptable-use evidence: official Qwen Usage Policy applies to open-source models
- Derived-hosting evidence: sufficient for human decision
- Quantization evidence: official `Qwen/Qwen3-0.6B-GGUF` provenance plus Apache-2.0 facts
- Conflicts: none located
- Human decision required: yes
- Model, license, and artifact approvals: false

## Standard candidate closure

- Candidate: `qwen3-1-7b-candidate`
- Exact model: `Qwen3-1.7B`
- Repository: `Qwen/Qwen3-1.7B`
- Revision: `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`
- Tokenizer provenance: official exact-repository assets
- Tokenizer-license evidence: repository-level Apache-2.0 factual evidence collected
- Acceptable-use evidence: official Qwen Usage Policy applies to open-source models
- Derived-hosting evidence: sufficient for human decision
- Quantization evidence: official `Qwen/Qwen3-1.7B-GGUF` provenance plus Apache-2.0 facts
- Conflicts: none located
- Human decision required: yes
- Model, license, and artifact approvals: false

## Pro candidate closure

- Candidate: `qwen3-4b-candidate`
- Exact model: `Qwen3-4B`
- Repository: `Qwen/Qwen3-4B`
- Revision: `1cfa9a7208912126459214e8b04321603b3df60c`
- Tokenizer provenance: official exact-repository assets
- Tokenizer-license evidence: repository-level Apache-2.0 factual evidence collected
- Acceptable-use evidence: official Qwen Usage Policy applies to open-source models
- Derived-hosting evidence: sufficient for human decision
- Quantization evidence: official `Qwen/Qwen3-4B-GGUF` provenance plus Apache-2.0 facts
- Conflicts: none located
- Human decision required: yes
- Model, license, and artifact approvals: false

## Factual requirements closed

Across three candidates:

- six requirement records are `factual-evidence-collected`;
- six requirement records are `sufficient-for-human-decision`;
- tokenizer-license and acceptable-use factual gaps have official source support;
- derived-hosting and quantization have sufficient factual support to present to a human decision maker.

## Requirements still unresolved

No factual requirement remains unresolved in the Phase 5.7 closure registry based on the reviewed official sources.

This does not imply governance completion. Temporal policy applicability, product scenarios, upstream-rights confirmation, distribution design, artifact selection, and runtime evidence still require later human and technical review.

## Requirements requiring human decision

All twelve requirement records retain `humanDecisionRequired=true`.

In particular, derived-artifact hosting and quantization or conversion remain explicit human product and legal decisions.

## Conflicting evidence

No conflicting official evidence was located for the reviewed repository, license, policy, or quantized-repository sources.

Any future source conflict must move the affected requirement to `conflicting-evidence` and keep every approval boundary false.

## Current production state

- Human decisions recorded: `0`
- Models approved: `0`
- Licenses approved: `0`
- Artifacts selected: `0`
- Artifacts approved: `0`
- Checksums pinned: `0`
- Benchmarks passed: `0`
- Downloadable artifacts: `0`
- Runtime-ready artifacts: `0`
- Active models: `0`

Production execution remains unavailable.

No model active.

## Tier-matrix compatibility

- Ultra-low: deterministic fallback, no model governance closure record
- Light: Qwen3-0.6B
- Standard: Qwen3-1.7B
- Pro: Qwen3-4B

Phase 5.7 does not change device thresholds, entitlement, candidate identity, or active tier.

## Privacy and persistence

The registry contains official evidence metadata only. It stores no reviewer identity, signature, user content, timestamp-generated token, access credential, checksum, human decision, or persisted interaction.

Application runtime performs no browsing, network request, database write, or storage persistence.

## Safety invariants

- No historical registry or policy is modified.
- No human decision is recorded.
- No model or license is approved.
- No artifact is selected or approved.
- No checksum is pinned or verified.
- No benchmark is passed.
- No download or cache write occurs.
- No runtime is initialized.
- No inference runs.
- No model is active.
- Phase 4 blocked-safe closeout remains intact.

## Non-goals

Phase 5.7 does not provide legal advice, record governance approval, select an artifact, approve a checksum plan, configure a download location, run a benchmark, implement a runtime, or activate local AI.

Official human-review references:

- https://huggingface.co/Qwen/Qwen3-0.6B
- https://huggingface.co/Qwen/Qwen3-1.7B
- https://huggingface.co/Qwen/Qwen3-4B
- https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- https://huggingface.co/Qwen/Qwen3-4B-GGUF
- https://github.com/QwenLM/Qwen3
- https://qwen.ai/usagepolicy
- https://www.apache.org/licenses/LICENSE-2.0.html
- https://www.apache.org/legal/apply-license.html
