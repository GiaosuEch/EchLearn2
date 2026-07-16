# Assessment and Rubric Engine

## Objective

Provide one generic, evidence-first assessment contract for every language, skill, and Product Pack without embedding a named exam scale in Platform Core or Learning Domain.

## Core concepts

### Rubric

A versioned learning-purpose definition containing RubricCriteria, evidence requirements, permitted result value types, aggregation rules, abstention rules, and method constraints.

### RubricCriterion

Defines a criterion identifier, learner-facing intent, required Evidence kinds, optional value semantics, feedback constraints, and limitations. Criterion identifiers are namespaced by their owner, for example a generic fluency criterion versus a pack-specific exam criterion.

### Evidence

References a bounded learner excerpt or measurable signal with source, range/time span, method, and observation. Model chain-of-thought is never Evidence.

### AssessmentResult

Contains:

- assessment, rubric, method, and version provenance;
- criterion results;
- Evidence references;
- Confidence with interpretation/version;
- Limitations;
- SkillFeedback and next actions;
- optional track-defined values;
- calibration status;
- optional abstention reason.

The generic engine does not expose an `ieltsBand` field or any named exam value.

## Processing flow

1. Validate PracticeSession input, declared purpose, size, and consent boundary.
2. Resolve an authorized Rubric from Learning Domain or the active Product Pack.
3. Collect deterministic measurable Evidence.
4. Optionally request structured observations from an approved capability.
5. Parse and validate generated observations as untrusted data.
6. Verify each observation references allowed Evidence.
7. Apply criterion, aggregation, confidence, limitation, and abstention rules deterministically.
8. Return AssessmentResult with provenance.
9. Persist locally; sync only under an active Consent Grant.

## Policy separation

- Platform Core enforces structured-output, no-fake, no-random, resource, privacy, and provenance invariants.
- Learning Domain defines generic Rubrics and assessment storage semantics.
- Product Packs define pack-specific criteria, value mappings, disclosures, calibration state labels, and content validation.

IELTS Band, Task Response, Writing Task 1/2, Speaking Part 1/2/3, and IELTS-specific abstention/disclosure rules belong exclusively to the IELTS Academic Pack.

## Confidence and calibration

Confidence describes evidence support under a named method; it is not an official-validity claim. Calibration status is explicit and can be `not-applicable`, `uncalibrated`, `calibrating`, or `calibrated` with a versioned record. A Product Pack may provide stricter terms and UI copy.

Calibration requires lawful representative data, qualified independent ratings where relevant, rater protocol/agreement, held-out evaluation, error intervals, bias analysis, provenance, and versioning. Internal model benchmarks do not create calibration.

## Determinism rules

- Randomness cannot assign values, confidence, evidence, limitations, publication state, or learner identity.
- The engine never fills missing criterion values with defaults.
- Missing or invalid Evidence causes criterion omission or abstention according to the Rubric.
- Aggregation is deterministic, versioned, and owned by the Rubric.
- Generated feedback can vary, but its schema, evidence references, permitted claims, and final policy decision are deterministic.

## Testing seams

- Rubric validation and namespacing.
- Evidence range/source validation.
- AssessmentResult completeness and provenance.
- Confidence bounds and interpretation.
- Limitation and abstention behavior.
- Invalid/untrusted structured output rejection.
- Random-assessment/static fake-output negative fixtures.
- Pack criterion isolation from generic modules.
