# Phase 2 Integration Readiness

Status: Ready for unavailable-safe Phase 3 shells after Phase 2.9 approval; blocked for real inference
Baseline: `31644e7`

## Readiness decision

The platform boundaries are ready to accept application shells that consume `AIService` and display explicit unavailable/needs-model states. They are not ready to accept a real runtime provider or model artifact. Phase 3 must preserve the null provider as the default and cannot convert missing capability into generated content.

## Phase 3 entry checklist

All items must remain true on the Phase 2.9 closeout revision:

- [x] Legacy tutor and assessment paths do not return fake or canned AI output.
- [x] `AIService` returns typed unavailable/needs-model/failed outcomes without fabricated output.
- [x] Provider selection fails closed when governance, readiness, compatibility or implementation evidence is missing.
- [x] A candidate or unapproved model cannot become ready.
- [x] A non-implemented runtime cannot generate output.
- [x] Readiness UI and public copy do not claim capabilities beyond current evidence.
- [x] Platform AI and evaluation modules contain no named exam-track concepts.
- [x] Phase 2.9 `npm test`, lint, build and `verify:all` evidence is recorded as passing.
- [x] Phase 2.9 diff and staged set are confirmed free of protected paths.
- [ ] The Phase 2.9 closeout commit is reviewed and explicitly approved before Phase 3 implementation starts.

## Gates before any real model integration

Every item below is blocking. “Candidate”, “likely”, placeholder values and research notes do not satisfy a gate.

- [ ] A final runtime-provider ADR selects an exact provider/version and supersedes ADR-0004.
- [ ] Runtime package and transitive license notices are verified at the pinned version.
- [ ] Exact model, tokenizer, configuration, conversion and compiled-library commercial-use rights are verified.
- [ ] Redistribution and project-hosting strategy is approved, including notices and revocation.
- [ ] A real benchmark run has reproducible evidence, thresholds and target-hardware records.
- [ ] Exact artifact checksum, byte size, immutable version and build/conversion provenance are recorded.
- [ ] Supported device tiers and browser matrix are declared from measurements, not capability labels alone.
- [ ] Privacy and security review covers prompt/output handling, local storage, telemetry, CSP, supply chain and abuse limits.
- [ ] User consent/download UX covers exact size, storage quota, progress, cancel/retry, offline state, cache inventory and deletion.
- [ ] Operational rollback covers dependency removal, artifact revocation, cache cleanup, provider disablement and null-adapter restoration.
- [ ] Provider-specific tests prove no implicit network/model load and no generated result without complete provenance.
- [ ] Human approval records link the provider, artifact, benchmark, license, security and rollout decisions.

Until every required gate passes, provider status stays `not-implemented` or unavailable, artifact approval stays blocked, and no real model URL enters production configuration.

## Proposed Phase 3 order

This is a gated implementation proposal, not authorization to start.

### Phase 3.1 — AI Tutor shell

Use `AIService` for a generic conversation shell. Preserve explicit unavailable/needs-model states, no canned answer and no real provider integration.

### Phase 3.2 — Practice Generator shell

Add a generic practice-generation request boundary and structured-output placeholder. No generated content is published while runtime/model readiness is unavailable.

### Phase 3.3 — Learner Memory service integration

Connect validated learning evidence to the generic learner-memory boundary with consent and local-first behavior. Model output must never write memory directly.

### Phase 3.4 — Writing Coach shell

Create a track-neutral writing feedback shell over `AIService`. Keep assessment and corrections unavailable without approved runtime/model evidence.

### Phase 3.5 — Speaking Coach shell

Create a track-neutral speaking shell. Raw audio remains ephemeral by default; transcription/acoustic assessment stays unavailable until separately approved.

### Phase 3.6 — Language Learning Hub integration

Expose readiness and the approved shells from a general language-learning hub without a large redesign or capability overclaim.

### Phase 3.7 — Product Pack boundary

Prove that IELTS, TOEIC, TOEFL and later tracks own their rubrics, scores, disclosures and task semantics. Platform Core remains exam-neutral.

## Required checkpoint after each shell

- Targeted tests start RED and end GREEN.
- Full platform tests, lint, build and `verify:all` pass.
- No provider dependency, model URL or download is added without the separate real-model gate set.
- UI reports unavailable honestly and returns no output when unavailable.
- Protected paths remain untouched unless a separately approved task explicitly changes scope.

## Rollback invariant

Every Phase 3 shell must remain usable as an honest unavailable state when the provider factory resolves to the null provider. Removing a candidate provider or revoking an artifact must not require rewriting product-pack or learning-domain consumers.
