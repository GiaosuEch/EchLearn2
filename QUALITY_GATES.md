# Platform Quality Gates

## Completion rule

A phase or Product Pack is incomplete if any required gate is failing, skipped, unrun, false-green, or dependent on fabricated output. Platform gates cannot be weakened by a pack. A passing legacy script is not production evidence until it has a negative test proving it catches a seeded violation.

## Command evidence

- `npm.cmd test` — must be configured in Platform Quality Foundation before new production logic.
- `npm.cmd run build` — TypeScript and Vite production bundle.
- `npm.cmd run lint` — source lint.
- `npm.cmd run verify:all` — legacy umbrella that must incorporate new platform gates before it is trusted.

Reports state `not run`, `pass`, or `fail` for each command on the reported revision. Never infer one command's result from another.

## Mandatory platform gates

| Gate | Must prove |
| --- | --- |
| `verify_no_fake_ai_claims` | Active AI/learning paths contain no mock, canned, delayed simulated, hardcoded personalized, or simulated-success behavior. |
| `verify_no_random_assessment` | Randomness, clocks, unstable IDs, or random libraries cannot influence AssessmentResult, Evidence, Confidence, Limitation, SkillFeedback, content fingerprints, publication, or learner identity. Cosmetic randomness is scoped elsewhere. |
| `verify_platform_boundaries` | Platform Core imports no Learning Domain/Product Pack modules and contains no named exam/pack concepts. |
| `verify_structured_output_contracts` | Generated output is parsed, bounded, schema/evidence validated, and rejected/abstained on failure. |
| `verify_model_promotion_policy` | Only complete license/benchmark/project-hosted/version/digest/device/security records can produce an Approved Model Artifact. Empty approved registry is valid. |
| `verify_artifact_lifecycle` | Download consent, size/quota, progress, cancel/retry, integrity, atomic readiness, cache listing, and deletion contracts exist and are tested. |
| `verify_consent_data_controls` | Sync requires active category/purpose consent; revocation, export, and deletion are owner-scoped; raw audio has no default persistence. |
| `verify_entitlement_contracts` | Pack/capability access is decided centrally with allowed/denied/upgrade reason states; data rights do not depend on entitlement. |
| `verify_observability_privacy` | Platform Events omit learner content, raw audio, prompts, tokens, secrets, and cross-user identifiers. |
| `verify_pack_registration` | Pack manifests are namespaced, compatible, isolated, entitlement-aware, and cannot bypass platform policy. |
| `verify_curriculum_integrity` | Protected multilingual curriculum, public data, audio assets, and migrations are unchanged unless the active issue explicitly authorizes them. |
| `verify_ui_routes_accessibility` | Generic and enabled-pack routes resolve with headings, names, labels, keyboard/focus/reduced-motion primitives, and honest disabled states. |

Each gate has a unit/self-test or fixture showing a known violation fails.

## Generic assessment gates

- AssessmentResult includes method/rubric/provenance, criterion results, Evidence, Confidence, Limitations, and optional abstention.
- No generic field assumes an exam score or IELTS Band.
- Missing/invalid Evidence causes omission or abstention, never a default value.
- Randomness cannot assign any assessment value.
- Track-defined values/disclosures are namespaced and validated by the owning pack.
- Internal EvaluationBenchmark results never imply calibration or official validity.

## Model and AI gates

- Candidate and approved registries are separate.
- Same versioned benchmark cases and criteria are used for comparable candidates.
- Structured-output validity, evidence validity, abstention, safety, latency, memory, initialization failures, and target hardware are recorded.
- Model promotion requires human review and declared thresholds.
- Multi-GB benchmarks are opt-in and never silently downloaded in CI.
- Unsupported/unavailable local AI remains explicit; deterministic behavior is not labeled AI.

## Privacy and security gates

- `.env`, secrets, raw audio, model binaries, and caches are absent from Git.
- User/model input is validated at boundaries and output is escaped/validated.
- No model output executes HTML, SQL, shell, navigation, or account actions.
- Owner-only RLS is proven with two-user select/insert/update/delete tests for every learner table before release.
- Dependency install scripts are blocked until reviewed; audit findings are triaged by severity and reachability.
- CSP/security headers allow only required app, Supabase, and project-artifact origins.

## Product Pack overlay gates

Every pack adds its own content, rubric, claims, benchmark, route, entitlement, accessibility, and privacy checks without changing the platform gates. Exam-specific task names, score semantics, disclosures, and uniqueness thresholds live only in that overlay.

For IELTS Academic, pack gates own band-like beta labels, Writing/Speaking criteria, task/part structure, transcript/audio-signal limitations, pronunciation boundary, and IELTS content uniqueness. Platform Core only sees generic result/evidence/fingerprint contracts.

## Phase exits

- Phase 1: generic honesty/random/boundary/result/capability/model/evaluation tests and new gates pass.
- Phase 2 Local AI Foundation: capability, artifact governance/readiness, unavailable runtime/service, readiness UI, benchmark planning, legacy safety and placeholder-provider gates pass. This does not claim real inference or target-device production readiness.
- Phase 3 application integration: unavailable-safe tutor/practice/memory/writing/speaking/hub shells and Product Pack boundary gates pass; real provider integration remains separately gated.
- Phase 4: memory/consent/RLS/export/delete gates pass.
- Phase 5: track-module/content-registry/isolation/protected-content gates pass.
- Phase 6: enabled Product Pack overlay gates pass.
- Phase 7: whole-platform UI/accessibility/responsive gates pass.
- Phase 8: clean install, full test/build/lint/verify, audit, performance, security, and browser evidence pass.
