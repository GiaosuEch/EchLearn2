# Quality gates

## Completion rule

A phase is incomplete if any required gate is failing, skipped, unrun, or dependent on fabricated/mock output. Passing static scripts alone is not enough; evidence must match the risk of the change.

## Required commands

- `npm.cmd test` — deterministic unit/integration tests.
- `npm.cmd run build` — TypeScript project build and Vite production bundle.
- `npm.cmd run lint` — source lint.
- `npm.cmd run verify:all` — complete static/contract verification.

Dependency installation must use the committed npm lockfile, start with scripts disabled, and only enable reviewed package scripts if actually required.

## Mandatory verification scripts

| Script | Must prove |
| --- | --- |
| `verify_no_fake_ai_claims` | Active AI/IELTS paths contain no mock, canned, examiner-equivalence, or simulated-success behavior. Discovery covers relevant directories rather than a legacy allowlist. |
| `verify_no_random_scoring` | `Math.random`, random libraries, timestamps, or unstable IDs cannot influence scoring, evaluation, evidence, fingerprints, or publication. Cosmetic randomness is explicitly scoped outside assessment modules. |
| `verify_ielts_test_uniqueness` | Fingerprint implementation is stable; exact and seeded near duplicates are rejected; threshold/version is declared. |
| `verify_ai_service_contracts` | Feature code uses the provider/evaluation contracts, typed capability failures, provenance, and validated structured output. |
| `verify_ui_routes` | Every declared IELTS route resolves to a component and production build has no blank route state. |
| `verify_accessibility_basics` | Landmarks, page headings, accessible names, labels, focus/reduced-motion hooks, and non-color status primitives exist. |
| `verify_production_ai_readiness` | Only approved manifest entries can be exposed; each has license decision, pinned versions, project-hosted URL, size, digest/integrity, benchmark record, and notices. Empty approved registry is valid and means local model features stay unavailable. |

Each script must include negative self-test fixtures or unit tests proving that a known violation makes the gate fail. A script that only checks for the presence of friendly strings is not a gate.

## Assessment gates

- Fixed label `uncalibrated beta estimate` is application-controlled and adjacent to every band-like value.
- Writing criteria include response-linked evidence, confidence, limitations, and provenance.
- Speaking includes `Estimated feedback based on transcript and measurable audio signals.`
- Pronunciation is `not assessed` unless the approved manifest points to a separately validated acoustic evaluator and calibration record.
- Insufficient/invalid evidence causes abstention, not a default number.
- No wording implies official IELTS, examiner certification, or score validity.

## Model benchmark gates

- Candidate and approved registries are separate.
- Commercial use and redistribution are reviewed per artifact, not inferred from runtime license.
- Same versioned evaluation cases and rubric are used across candidates for a tier.
- Structured-output validity, evidence validity, abstention, safety, latency, peak memory, initialization failure, and target-hardware results are recorded.
- Promotion requires declared thresholds and human review. “Best available” without a recorded comparison is not promotion evidence.
- Multi-GB benchmark tests are opt-in and never silently downloaded in CI.

## Privacy and security gates

- `.env`, secrets, raw audio, model binaries, and caches are absent from Git.
- Model output is parsed/validated and cannot execute HTML, SQL, shell, navigation, or account actions.
- Raw audio has no persistence write path by default.
- Transcript/evidence sync fails closed without current category consent.
- Two-user Supabase policy tests prove owner-only select/insert/update/delete on every learner table.
- Export and deletion are scoped to the authenticated owner and auditable without storing sensitive payloads in logs.
- Security headers and CSP allow only required app, Supabase, and project artifact origins.
- Native dependency audit findings are triaged by severity and reachability; no unmitigated reachable high/critical issue ships.

## Browser gates

Critical flows:

1. Deterministic mode on a browser without WebGPU.
2. Compatible-device model consent, quota warning, progress, cancellation, retry, integrity success/failure, cache delete.
3. Writing submit -> validated result or honest unavailable/abstention state.
4. Speaking permission -> local transcript -> measurable feedback -> audio disposal.
5. Consent off/on/revoke plus export/delete.
6. Offline reload after a successful cached-pack setup.
7. Keyboard and responsive walkthrough of all IELTS routes.

Record console errors, failed network requests, screenshot/state evidence, browser/version, and which checks were manual.

## Phase exit gates

- Phase 1: policy/provider/registry/evaluation tests and truthful verification pass.
- Phase 2: Writing Coach gates pass; no fake Writing path remains.
- Phase 3: Speaking/privacy gates pass; no fake Speaking path remains.
- Phase 4: generation/evidence/uniqueness gates pass.
- Phase 5: memory/consent/RLS/export/delete/planner gates pass.
- Phase 6: UI/accessibility/responsive gates pass.
- Phase 7: clean install, full test/build/lint/verify, audit, performance, security, and browser evidence pass.

