# Proposed Plan: Phase 3 Application Integration Shells

Status: Proposed; not started
Depends on: Phase 2.9 closeout GREEN and explicit approval
Foundation baseline: `31644e7`

## Objective

Integrate the generic `AIService` boundary into small, track-neutral application shells while preserving unavailable-safe behavior. Phase 3 does not authorize a real runtime dependency, model URL, artifact download, inference, generated assessment or exam-pack implementation.

## Architecture decisions

- Every shell consumes `AIService`; no shell imports a provider package or model artifact URL.
- The null/unavailable provider remains the default and must produce a useful explicit unavailable state.
- Generated output is accepted only from the existing success contract with complete model/runtime provenance and structured validation where applicable.
- Learner memory accepts validated learning evidence through its own service; raw model output cannot write memory directly.
- Writing, speaking and product-pack concepts stay outside Platform Core.
- Real provider integration is a separate gated decision described in `PHASE_2_INTEGRATION_READINESS.md`.

## Task 3.1: AI Tutor shell

**Description:** Replace the legacy entry-point-only behavior with a generic conversation shell that consumes `AIService` and renders unavailable/needs-model/failed states honestly.

**Acceptance criteria:**

- [ ] No canned response, simulated delay or fake generation path exists.
- [ ] Unavailable responses contain no output and `isAiGenerated` remains false.
- [ ] The shell is language-platform generic and contains no exam-pack vocabulary.

**Verification:** Targeted TDD tests, then `npm test`, lint, build and `verify:all`.

**Dependencies:** Phase 2.9 approval.
**Estimated scope:** Medium, 3-5 files.

## Task 3.2: Practice Generator shell

**Description:** Add a generic structured practice-generation request shell without publishing generated content while runtime/model readiness is unavailable.

**Acceptance criteria:**

- [ ] Request and output schema are bounded and track-neutral.
- [ ] Missing provider/model returns explicit unavailable or needs-model.
- [ ] No generated item enters the ContentRegistry without validation and provenance.

**Verification:** Targeted TDD tests plus full project gates.

**Dependencies:** Task 3.1 service-consumption pattern.
**Estimated scope:** Medium, 3-5 files.

## Checkpoint A: Service shell pattern

- [ ] Tasks 3.1-3.2 pass full gates.
- [ ] No runtime dependency, model URL, download or inference has been introduced.
- [ ] Human review confirms unavailable-state UX before learner-data integration.

## Task 3.3: Learner Memory service integration

**Description:** Route validated learning evidence into a generic local-first learner-memory service, gated by category/purpose consent for sync.

**Acceptance criteria:**

- [ ] Memory records cite validated evidence and source provenance.
- [ ] AI output cannot directly mutate memory or study plans.
- [ ] Sync remains disabled without explicit consent; no migration change occurs without separate authorization.

**Verification:** Unit and two-user isolation tests where persistence is in scope, plus full project gates.

**Dependencies:** Checkpoint A and a separately approved data/persistence scope.
**Estimated scope:** Medium; split further before implementation if migrations are authorized.

## Task 3.4: Writing Coach shell

**Description:** Build a track-neutral writing shell over `AIService` with explicit unavailable behavior and no score or correction claims without evidence.

**Acceptance criteria:**

- [ ] No hardcoded score, band, correction, rewrite or canned feedback is shown.
- [ ] Output validation and limitations are visible when a future success response exists.
- [ ] Exam-specific rubrics remain in Product Packs.

**Verification:** Targeted TDD tests plus full project gates.

**Dependencies:** Checkpoint A; Task 3.3 only if learner evidence is persisted.
**Estimated scope:** Medium, 3-5 files.

## Task 3.5: Speaking Coach shell

**Description:** Build a track-neutral speaking shell with ephemeral audio and unavailable transcription/acoustic assessment until separately approved capabilities exist.

**Acceptance criteria:**

- [ ] Raw audio is not persisted by default.
- [ ] No pronunciation, fluency or score is fabricated.
- [ ] Consent, runtime and provider limitations are explicit.

**Verification:** Targeted TDD tests, browser permission/error checks and full project gates.

**Dependencies:** Checkpoint A; privacy review before any audio sync.
**Estimated scope:** Medium, 3-5 files.

## Checkpoint B: Learning evidence and coaches

- [ ] Tasks 3.3-3.5 pass full gates.
- [ ] Privacy review confirms no implicit learner-content transfer or raw-audio persistence.
- [ ] Product copy still makes no real-inference claim.

## Task 3.6: Language Learning Hub integration

**Description:** Expose readiness and approved shells from the general learning hub with restrained changes and no large UI redesign.

**Acceptance criteria:**

- [ ] Hub navigation is language-platform first.
- [ ] Capability status is textual and accessible, not color-only.
- [ ] Disabled/unavailable tools remain understandable and do not imply generated output.

**Verification:** Route, accessibility and browser smoke tests plus full project gates.

**Dependencies:** Checkpoint B.
**Estimated scope:** Medium, 3-5 files.

## Task 3.7: Product Pack boundary proof

**Description:** Define how later IELTS, TOEIC, TOEFL and other packs consume generic shells while owning their task names, rubrics, estimates, disclosures and benchmarks.

**Acceptance criteria:**

- [ ] Platform Core imports no Product Pack modules or named exam concepts.
- [ ] Pack-specific scores and claims cannot bypass generic AI/assessment gates.
- [ ] One minimal boundary test proves pack isolation without implementing a full pack.

**Verification:** Architectural fitness tests plus full project gates.

**Dependencies:** Task 3.6.
**Estimated scope:** Medium, 3-5 files.

## Final Phase 3 checkpoint

- [ ] All tasks and checkpoints are reviewed and GREEN.
- [ ] Real model integration gates remain separate and unbypassed.
- [ ] `npm test`, lint, build, `verify:all` and `git diff --check` pass.
- [ ] Protected paths are untouched unless explicitly authorized by a scoped task.
- [ ] No production AI claim exceeds measured and approved capability.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| A shell quietly adds canned output to appear complete | Trust and quality failure | TDD asserts unavailable has no output; no-fake gate scans active surfaces. |
| Shells couple directly to a provider | Provider lock-in and bypassed policy | Consumers use `AIService` only; provider factory stays in Platform Core. |
| Memory stores unvalidated model claims | Persistent learner harm | Evidence validation and service-owned writes; AI output never writes directly. |
| Speaking flow persists audio implicitly | Privacy breach | Ephemeral default, explicit consent and separate persistence authorization. |
| Exam terminology leaks into shared code | Platform architecture regression | Product Pack boundary tests and forbidden-term scans. |
| Phase 3 is mistaken for real inference approval | Premature dependency/model rollout | Enforce the separate real-model gate checklist and final provider ADR. |

## Open decisions before implementation

- Human approval of this Phase 3 order and per-task scope.
- Whether Task 3.3 is local-only or includes separately authorized Supabase changes.
- Which shell is the first browser-tested tracer bullet after the unavailable-safe contract is approved.
