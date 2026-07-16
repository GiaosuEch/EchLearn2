# Phase 3 Readiness Task Board

Status: Phase 2.9 gates GREEN; do not start Phase 3 until the closeout report is explicitly approved.

## Phase 2.9 closeout

- [x] P2.9-01 Closeout and integration-readiness docs match current code evidence.
- [x] P2.9-02 Platform glossary defines foundation, provider placeholder, selection and inference readiness.
- [x] P2.9-03 Full tests, lint, build and `verify:all` pass.
- [x] P2.9-04 Diff/staged set passes whitespace and protected-path audit.
- [ ] P2.9-05 Closeout commit/report is reviewed and explicitly approved before Phase 3.

## Proposed Phase 3 sequence

- [ ] P3.1 AI Tutor shell using `AIService`, unavailable-safe.
- [ ] P3.2 Practice Generator shell with bounded structured output, unavailable-safe.
- [ ] P3.CA Checkpoint A: service shell pattern passes full gates and human review.
- [ ] P3.3 Learner Memory service integration with validated evidence and consent.
- [ ] P3.4 Writing Coach shell, track-neutral and unavailable-safe.
- [ ] P3.5 Speaking Coach shell, ephemeral-audio default and unavailable-safe.
- [ ] P3.CB Checkpoint B: privacy, evidence and coach gates pass.
- [ ] P3.6 Language Learning Hub integration without large redesign.
- [ ] P3.7 Product Pack boundary proof for later IELTS/TOEIC/TOEFL modules.
- [ ] P3.CF Final checkpoint: all project gates and architecture boundaries pass.

## Real model integration — blocked

- [ ] RM-01 Final provider ADR accepted and ADR-0004 superseded.
- [ ] RM-02 Exact runtime/model licenses and commercial/redistribution rights verified.
- [ ] RM-03 Project hosting, immutable version, checksum and artifact size approved.
- [ ] RM-04 Real benchmark passes declared thresholds on target device tiers.
- [ ] RM-05 Privacy/security/supply-chain review approved.
- [ ] RM-06 User download consent, size/quota, progress, cancel/retry, cache/delete UX verified.
- [ ] RM-07 Rollback, revocation and null-provider restoration tested.

## Standing verification for every Phase 3 task

- [ ] Targeted RED/GREEN tests recorded.
- [ ] `npm test` passes.
- [ ] `npm run lint` exits 0; warnings are classified.
- [ ] `npm run build` passes.
- [ ] `npm run verify:all` passes.
- [ ] `git diff --check` passes.
- [ ] No unapproved dependency, model URL, download or inference appears.
- [ ] Protected paths remain untouched unless the task explicitly authorizes them.
