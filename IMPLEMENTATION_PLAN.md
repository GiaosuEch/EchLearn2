# Locked implementation plan

Locked: 2026-07-16  
Baseline commit: `e5c1d43`

## Delivery discipline

Each phase is implemented as small TDD slices. A slice starts with a failing behavior test, adds the minimum implementation, runs relevant tests/typecheck/build, and creates an atomic commit. Later-phase UI is not exposed behind fabricated data; incomplete local capabilities stay explicitly unavailable.

## Phase 1 — Quality and evaluation foundation

1. Add assessment policy constants/types and tests for disclaimer, evidence, confidence, limitation, pronunciation state, and abstention.
2. Add provider capability/result/error contracts and contract tests.
3. Add candidate/approval manifest schema and tests that fail closed.
4. Add versioned evaluation case/result registry and benchmark runner interfaces; no model dependency yet.
5. Replace shallow fake/random verification with discoverable, negative-tested gates.
6. Contain current fake IELTS coach paths by converting them to explicit deterministic/unavailable behavior.
7. Establish test/build/lint/verification baseline and record failures as evidence.

Exit: issue 01 gates pass.

## Phase 2 — Writing Coach

1. Define versioned rubric/evidence structured-output schema.
2. Implement deterministic preflight metrics and eligibility/abstention.
3. Implement local-provider evaluation orchestration and defensive validation.
4. Persist consent-safe Writing evidence/history.
5. Replace active Writing pages with the real contract and fixed disclosure.
6. Benchmark candidate models for Writing and promote only if thresholds pass.

Exit: issue 02 gates pass.

## Phase 3 — Speaking Coach

1. Implement ephemeral audio capture lifecycle and disposal tests.
2. Add local ASR provider behind capability/download management.
3. Compute deterministic duration, WPM, pause, filler, and transcript-based language signals.
4. Add generated transcript coaching with defensive validation.
5. Keep pronunciation `not assessed`; render required measurement disclosure.
6. Add consented transcript/evidence persistence and browser privacy checks.

Exit: issue 03 gates pass.

## Phase 4 — Test Generator

1. Implement canonicalization, SHA-256 fingerprint, shingle signature, and similarity tests.
2. Add candidate schema and deterministic structure/evidence validators.
3. Add model proposal orchestration with bounded regeneration.
4. Add atomic fingerprint/registry persistence and concurrency checks.
5. Add learner-facing rejection/retry states and registry-backed test history.

Exit: issue 04 gates pass.

## Phase 5 — Learner Memory and Study Planner

1. Add Supabase migrations for consent, memory, tests/fingerprints, evaluations, mistakes, plans, and data requests.
2. Add owner-only RLS and two-user CRUD policy tests.
3. Add local-first category store and consent-gated sync engine.
4. Add correct/delete/export/revoke flows.
5. Build an editable planner that cites stored learner evidence and has deterministic behavior when local generation is unavailable.

Exit: issue 05 gates pass.

## Phase 6 — IELTS UI polish

1. Introduce semantic tokens and restrained surfaces.
2. Standardize capability, download, assessment, evidence, consent, and empty-state components.
3. Refactor IELTS routes without changing verified domain behavior.
4. Retain Ech Buri with reduced nonessential motion and serious coaching placement.
5. Complete keyboard, contrast, reduced-motion, responsive, and screen-reader checks.

Exit: issue 06 gates pass.

## Phase 7 — Hard verification

1. Clean install with reviewed dependency scripts and lockfile.
2. Full test, build, lint, static verification, migration policy tests, and dependency audit.
3. Browser critical-path, offline/cache, accessibility, console/network, and performance checks.
4. Model artifact/CDN/integrity/license/benchmark readiness review.
5. Produce a Vietnamese final report that separates passing evidence, limitations, configuration still needed, and any human/external verification not completed.

Exit: issue 07 gates pass and working tree is intentionally clean or documented.

## Risk register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Small local model fails nuanced IELTS feedback | Misleading or low-value coaching | Per-task benchmark, evidence validation, abstention, deterministic fallback; no forced tier assignment. |
| Browser WebGPU/storage incompatibility | AI unavailable or interrupted | Capability probe, no-install deterministic mode, quota checks, recoverable worker/cache lifecycle. |
| Artifact redistribution is not permitted | Commercial/legal exposure | Per-artifact review blocks promotion; `NEEDS_VERIFICATION` is not shippable. |
| Existing fake behavior survives in an unscanned route | Trust failure | Directory/contract discovery, negative gate fixtures, browser route inventory. |
| RLS policy mistake leaks learner data | Severe privacy breach | Owner-only pattern, two-user CRUD tests, no browser service role, minimal payloads. |
| Generated tests are plausible but invalid/duplicate | Learning harm | Candidate lifecycle, evidence validator, exact + near duplicate registry, atomic publication. |
| UI work masks incomplete quality | False sense of progress | Enforced phase order and unavailable states; UI polish blocked by issues 01–05. |
| “Offline” cache is evicted | Broken expectation | Wording says after download while retained; readiness probes, persistence request, retry/delete. |

## Decision log

- Browser-first, zero-install local AI; optional future local-runtime adapters do not change feature contracts.
- No fixed tier model before benchmark and license approval.
- Project-controlled production artifacts with immutable manifest and integrity checks.
- Netlify + Supabase default, portable static architecture.
- Local-first learner data and no raw-audio retention by default.
- All band-like outputs are uncalibrated beta estimates until lawful calibration succeeds.

