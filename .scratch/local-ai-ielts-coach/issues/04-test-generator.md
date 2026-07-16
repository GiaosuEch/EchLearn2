# Test Generator

Status: ready-for-agent  
Phase: 4  
Blocked by: 01, 02, 03

## Outcome

Generate evidence-valid IELTS practice items that are rejected when exact or near duplicates exist.

## Exit gates

- Stable fingerprints and near-duplicate signatures are persisted.
- Candidate items cannot publish before structure, answer, evidence, and uniqueness validation.
- Concurrency cannot insert the same fingerprint twice.
- Unit, integration, build, and uniqueness verification pass.

