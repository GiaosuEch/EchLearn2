# Local AI Foundation Closeout

Status: Phase 2.9 GREEN; Local AI Foundation closed; real AI integration not started
Audit date: 2026-07-16
Audited baseline: `31644e7 feat: add local runtime provider skeleton`

## Executive conclusion

Phase 2 established a fail-closed, provider-neutral Local AI Foundation for the AI Language Learning Platform. It can detect approximate device/browser capability, govern candidate artifacts, represent runtime and service states, show honest readiness, and reject provider selection when evidence or approval is missing.

This is not real AI inference and is not production-ready for AI content generation. No runtime provider is implemented, no model is approved or installed by production configuration, no model bytes are downloaded, and every placeholder provider returns explicit unavailable output with `isAiGenerated: false`.

## Delivered foundation

| Slice | Delivered capability | Commit |
|---|---|---|
| 2.1 | Browser, WebGPU/WASM, storage, network and approximate device capability report with conservative tiers | `bf5850d` |
| 2.2 | Versioned artifact manifest, approval/readiness/integrity contracts and explicit user-action download permission | `0022e09` |
| 2.3 | Generic local runtime request/response contract, state machine and unavailable adapter | `75ff4f4` |
| 2.4 | Generic `AIService`, request/response guards, provenance requirements and unavailable-safe behavior | `9fb7041` |
| 2.5 | Readiness view model and accessible panel that does not generate output | `09d6d5b` |
| 2.6 | Candidate comparison, license matrix, benchmark plan and proposed provider-evaluation ADR without selecting a provider | `10df3cc` |
| 2.7 | Legacy tutor routed through `AIService`; fake/canned tutor, assessment and marketing claims removed or disabled | `820a261` |
| 2.8 | Provider contracts, placeholder factory and fail-closed selection for null, WebLLM, Transformers.js, WASM and future cloud profiles | `31644e7` |

The Phase 2 change set from the Phase 1B baseline `fac4da4` through `31644e7` touched 64 tracked files. A path audit found no protected-path changes.

## Not delivered

Phase 2 did not:

- install WebLLM, Transformers.js, ONNX Runtime Web or another inference dependency;
- approve, pin, host, download, cache or execute a real model artifact;
- implement a provider session, worker, tokenizer, inference loop or streaming output;
- run a real model benchmark or record real latency, memory, quality or device results;
- implement the full download lifecycle, quota management, cancel/retry, cache inventory or artifact revocation workflow;
- make AI Tutor, Practice Generator, Writing Coach or Speaking Coach generate AI content;
- calibrate assessment output against lawful examiner-scored data;
- ship a cloud provider, browser API key or learner-content upload path;
- prove target-browser/device production performance, security or accessibility for real inference;
- implement the broader entitlement, privacy-filtered observability or learner-memory integration targets.

## Why this is not real inference

A capability report is device evidence, not a running model. An approved artifact record is governance evidence, not model bytes. A provider placeholder is a boundary, not an implementation. The current default adapter has no session and returns `runtime-not-implemented`; placeholder providers have status `not-implemented`; successful generated output requires complete runtime/model provenance that no current provider can supply.

Therefore no application surface may interpret Phase 2 readiness contracts as generated content capability.

## Production readiness limitation

The foundation is suitable for building unavailable-safe shells and for evaluating future candidates. It is not production-ready for AI content generation because the final provider decision, exact dependency, exact model artifact, licenses, benchmark measurements, device thresholds, hosting, privacy/security review, download UX, operational controls and rollback evidence do not exist.

## Closeout audit

Audited areas:

- `src/platform/ai/`
- `src/platform/evaluation/`
- `src/services/aiTutor.ts`
- `src/services/speechAnalysis.ts`
- `src/services/writingFeedback.ts`
- `src/components/ai/`
- Phase 2.7 marketing/public copy

| Audit question | Finding |
|---|---|
| Fake or canned AI output | None found in active audited AI paths. Legacy tutor and assessment entry points return explicit unavailable states. |
| Random assessment | None found; the platform scanner reports zero blocking or unclassified assessment randomness. |
| Real production model URL | None found in audited production modules. `example.test` URLs exist only in test fixtures. |
| WebLLM/Transformers.js dependency | Not present. Provider names are identifiers for placeholders and benchmark candidates only. |
| Exam-specific terms in Platform Core | None found in `src/platform/ai/` or `src/platform/evaluation/`. |
| Provider falsely marked implemented | None. Null is `unavailable`; every candidate provider is `not-implemented`. |
| `isAiGenerated: true` while unavailable | None. The true variant exists only in success contracts and is guarded by runtime/model provenance checks. |
| Public capability overclaim | Audited copy says Local AI is in development and automated assessment is unavailable until an approved model is installed. |

## Protected paths

The Phase 2 diff did not touch:

- `.env` files or secrets;
- `src/curriculum/`;
- `public/data/`;
- audio assets;
- Supabase migrations;
- dependency lockfiles.

## Dependencies deliberately not added

No Phase 2 runtime dependency was added. In particular, the project does not depend on:

- `@mlc-ai/web-llm` or a `webllm` package;
- `@huggingface/transformers` or `@xenova/transformers`;
- ONNX Runtime Web for model execution;
- a cloud model SDK.

## Remaining legacy warnings and limitations

- Lint exits successfully but reports pre-existing warnings in legacy UI, practice and utility files outside the Phase 2 platform modules.
- Production build exits successfully but reports existing chunk-size and ineffective dynamic-import warnings.
- `src/services/writingFeedback.ts#getStudyPlan` remains an unused, deterministic, exam-pack-oriented legacy helper. Phase 2.9 removed its artificial delay and labels its result `deterministic-rule` with `isAiGenerated: false`; it should be moved or retired only in a scoped pack cleanup, not folded into Platform Core.
- Some legacy verification messages use historical “AI” wording for deterministic practice flows. They are not evidence of model inference.
- Capability tiers use available browser/device signals and remain approximate until real provider benchmarks validate target hardware.
- The proposed provider-evaluation ADR (`docs/adr/0004-local-ai-runtime-provider-evaluation.md`) intentionally approves no provider. A later final provider ADR must supersede it.

## Verification evidence

The closeout revision may be committed only after these commands pass on the Phase 2.9 diff:

| Gate | Required result | Closeout result |
|---|---|---|
| `npm test` | All platform tests pass | PASS — 128/128 |
| `npm run lint` | Exit 0; legacy warnings classified | PASS — exit 0 with legacy warnings |
| `npm run build` | TypeScript and Vite build pass | PASS — build completed with legacy bundle warnings |
| `npm run verify:all` | All configured verification gates pass | PASS |
| `git diff --check` | No whitespace errors | PASS |
| Protected-path audit | No protected path in diff/staged set | PASS |

## Closeout decision

Phase 2 Local AI Foundation is GREEN because the Phase 2.9 closeout gates passed. This closes foundation work only. It does not authorize real provider integration, model download, inference, generated assessment, or production AI claims.
