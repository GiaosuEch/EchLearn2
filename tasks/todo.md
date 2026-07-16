# Phase task board

## In progress

- QF-01 Publish locked phase 0/1 documents and local tracker.

## Ready

- QF-02 Establish test runner without an unreviewed dependency.
- QF-03 RED tests: assessment disclosure, evidence, abstention, pronunciation boundary.
- QF-04 GREEN: assessment policy and result types.
- QF-05 RED tests: capability failure and model-promotion policy.
- QF-06 GREEN: provider/model registry contracts.
- QF-07 Replace fake/random verification and add negative self-tests.
- QF-08 Convert active fake coach paths to deterministic/unavailable states.
- QF-09 Record build/lint/test/verify baseline and fix phase 1 regressions.

## Blocked by later phase order

- WC-* Writing Coach.
- SC-* Speaking Coach.
- TG-* Test Generator.
- MP-* Memory and Planner migrations/RLS/UI.
- UI-* IELTS visual system.
- HV-* Hard verification/release report.

## Definition of done for each task

- The declared behavior has a test that failed before implementation where applicable.
- Relevant tests, typecheck/build, lint, and verification pass after the change.
- Security/privacy implications are recorded.
- The issue includes evidence and the change is committed atomically.

