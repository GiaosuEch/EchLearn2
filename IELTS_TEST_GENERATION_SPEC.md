# IELTS test generation specification

## Goal

Create varied IELTS practice material that is answerable from its source content and provably not an exact or near duplicate of published tests in the learner/project registry. A model may propose candidates; deterministic validation decides publication.

## Lifecycle

`requested -> candidate -> structurally_valid -> evidence_valid -> unique -> published`

Any failed check moves the candidate to `rejected` with machine-readable reasons. Rejected content is never presented as a completed test.

## Canonical representation

The canonical test contains test type, module, task/question type, instructions, passage or prompt, questions, answer options, accepted answer, evidence span/rationale, difficulty target, source/provenance, and generator versions.

Before fingerprinting:

1. Unicode-normalize to NFKC.
2. Lowercase locale-insensitively for fingerprint comparison.
3. Normalize whitespace and punctuation spacing.
4. Preserve semantic numbers and option ordering.
5. Serialize fields in a fixed schema order.

## Duplicate prevention

- Exact fingerprint: SHA-256 of the canonical serialization.
- Near-duplicate signature: normalized token 5-shingle set for prompt/passage/questions.
- Similarity: Jaccard intersection-over-union of shingles.
- Initial rejection threshold: `>= 0.72` against any published item in the applicable module/type registry.
- The threshold is a versioned quality parameter and must be re-evaluated on a labeled duplicate/non-duplicate set; changing it requires benchmark evidence.
- Database uniqueness on the exact fingerprint prevents concurrent exact duplicates. Near-duplicate check and publication occur in an atomic server-side operation or transaction boundary.

Generated surface rewrites with the same scenario, passage facts, question structure, and answer evidence are expected to exceed the similarity gate; cosmetic paraphrase is not novelty.

## Deterministic validators

All candidates must pass:

- schema and supported-type validation;
- content-length and item-count rules for the declared practice mode;
- no missing/duplicate question IDs;
- answer option consistency;
- answer evidence exists in the source passage or an explicitly allowed reasoning rule;
- answer does not contradict its evidence;
- no answer leakage in instructions;
- language and prohibited-content checks;
- exact and near-duplicate checks;
- version/provenance completeness.

Model self-critique is optional evidence, never a validation gate.

## Registry and privacy

The test registry stores published metadata and generation provenance. User-specific exposure/attempt records are owner-scoped. Shared catalog fingerprints may be project-owned, but a learner must not infer another user's identity or responses from them. Raw learner answers are not part of a shared fingerprint.

## Evaluation

Measure:

- schema-valid candidate rate;
- evidence-valid item rate;
- duplicate rejection precision/recall on labeled pairs;
- answer-review acceptance rate;
- difficulty distribution drift;
- regeneration count and latency;
- escaped invalid item rate (release blocker).

## Release gates

- Exact duplicate insertion is impossible under concurrency.
- Seeded paraphrase fixtures above threshold are rejected.
- Every published answer has machine-checked evidence or an allowed reasoning type.
- Generator/model/prompt/validator/fingerprint versions are recorded.
- `verify_ielts_test_uniqueness` passes without network or model downloads.

