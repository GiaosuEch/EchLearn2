# IELTS Academic Product Pack — Test Generation Specification

## Ownership

This document belongs exclusively to the IELTS Academic Product Pack. It is not a Platform Core or generic Learning Domain specification. Platform Core provides AI honesty/validation infrastructure; Learning Domain provides ContentRegistry and GeneratedContentFingerprint. This pack owns IELTS task schemas, evidence rules, similarity policy, thresholds, claims, and evaluation cases.

## Goal

Create varied IELTS Academic practice material that is answerable from its source content and is not an exact or near duplicate of published IELTS-pack content. A model may propose candidates; deterministic pack validators decide publication.

## Pack lifecycle

`requested -> candidate -> structurally-valid -> evidence-valid -> unique -> published`

Any failed check moves the candidate to `rejected` with machine-readable pack reasons. Rejected content is never presented as a completed test.

## IELTS canonical representation

The pack defines test module, task/question type, instructions, passage or prompt, questions, options, accepted answer, evidence span/rationale, difficulty target, source/provenance, and generator/validator versions.

Before using Learning Domain's GeneratedContentFingerprint:

1. Unicode-normalize to NFKC.
2. Lowercase locale-insensitively for comparison.
3. Normalize whitespace and punctuation spacing.
4. Preserve semantic numbers and option ordering.
5. Serialize pack fields in a fixed schema order.

## IELTS duplicate policy

- Exact fingerprint: SHA-256 of canonical serialization.
- Near-duplicate signature: normalized token 5-shingle set across relevant prompt/passage/questions.
- Similarity: Jaccard intersection-over-union of shingles.
- Initial pack rejection threshold: `>= 0.72` against published content in the applicable IELTS module/type registry.
- Threshold/version is pack-owned and must be validated on labeled duplicate/non-duplicate pairs before release.
- Database uniqueness prevents concurrent exact duplicates; near-duplicate validation and publication use an atomic server-side boundary.

This threshold and “IELTS test uniqueness” must never appear in Platform Core.

## Pack validators

- supported IELTS module/task/question schema;
- content length and item-count rules for the declared practice mode;
- question/option/answer consistency;
- answer Evidence exists in the source or an allowed reasoning rule;
- no contradiction or answer leakage;
- pack language/prohibited-content rules;
- exact/near duplicate policy;
- complete pack/model/prompt/validator/fingerprint provenance.

Model self-critique is optional information, never a publication gate.

## Registry and privacy

Shared fingerprint mechanics belong to Learning Domain. IELTS publication metadata and generator policies are namespaced to the pack. Learner exposure/attempts remain owner-scoped; shared fingerprints never contain learner answers or identity.

## Pack evaluation

- schema-valid candidate rate;
- evidence-valid item rate;
- duplicate rejection precision/recall;
- answer-review acceptance;
- difficulty distribution drift;
- regeneration count/latency;
- escaped invalid item rate, which is a release blocker.

## Pack release gates

- Exact duplicate insertion is impossible under concurrency.
- Seeded IELTS paraphrase fixtures above the pack threshold are rejected.
- Every published answer has machine-checked Evidence or an allowed reasoning type.
- Generator/model/prompt/validator/fingerprint versions are recorded.
- IELTS-specific verification runs as a Product Pack overlay after platform gates pass.
