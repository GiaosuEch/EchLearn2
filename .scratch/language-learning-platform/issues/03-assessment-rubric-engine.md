# Generic Assessment and Rubric Engine

Status: ready-for-agent
Phase: 3
Blocked by: 01, 02

## Outcome

Implement generic Rubric, RubricCriterion, Evidence, AssessmentResult, Confidence, Limitation, SkillFeedback, abstention, and GeneratedContentFingerprint contracts without exam-specific fields.

## Exit gates

- Results are evidence/provenance complete or abstain.
- Randomness cannot assign assessment state.
- Structured observations are validated as untrusted data.
- Product Pack values remain namespaced extensions.
