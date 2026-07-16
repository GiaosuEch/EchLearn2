# Locked Platform-first Implementation Plan

Locked: 2026-07-16
Baseline commit: `e5c1d43`
IELTS-first documentation commit retained for history: `4cf7704`

## Delivery discipline

Each phase lands as small TDD slices. A slice starts with a platform-first failing behavior test, adds the minimum implementation, runs the relevant test/typecheck/build checks, and commits atomically. Product Pack behavior cannot enter Platform Core, and no later pack/UI phase is exposed through fake data while a foundation phase is incomplete.

## Phase 0 — Architecture pivot

1. Remove the incomplete IELTS-specific RED test command and tests from the dirty working tree.
2. Replace the single IELTS context with Platform Core, Learning Domain, and Product Pack contexts.
3. Supersede IELTS-first architecture, plan, gates, UI, and tracker documents.
4. Preserve audit, research, license, privacy decisions, and existing source/data/assets/migrations.
5. Commit the pivot independently before production implementation.

Exit: platform-first docs committed; protected baseline paths unchanged.

## Phase 1 — Platform Quality Foundation

1. Add a dependency-free test command using the current Node toolchain.
2. RED: generic AI honesty and no-random-assessment policy tests.
3. GREEN: minimal policy/result helpers with typed violations.
4. RED/GREEN: generic Capability State and Structured Output validation contracts.
5. RED/GREEN: Model Candidate promotion policy and EvaluationBenchmark records without selecting a model.
6. Replace shallow fake/random verification with discoverable, negative-tested platform gates.
7. Add architectural fitness tests preventing Product Pack terms/imports in Platform Core.
8. Record test/build/lint/verify status honestly and fix only Phase 1 regressions.

No local-model runtime dependency, Product Pack feature, UI polish, curriculum rewrite, or migration is in Phase 1.

Exit: Platform Quality Foundation issue gates pass.

## Phase 2 — Local AI Foundation (closed at 2.9)

Delivered in small slices:

1. Capability detector with conservative browser/device tiers.
2. Artifact manifest, approval, integrity, storage-readiness and explicit user-action download-permission contracts.
3. Local runtime adapter/state boundary with a null/unavailable implementation.
4. Generic `AIService` boundary with request/response/provenance guards.
5. Honest readiness panel that generates no output.
6. Provider/model benchmark planning, license matrix and proposed evaluation ADR without a provider decision.
7. Legacy AI service and public-claim safety integration.
8. Runtime provider abstraction with unavailable WebLLM, Transformers.js, WASM and future-cloud placeholders.
9. Closeout and Phase 3 integration-readiness audit.

Exit: foundation tests and project gates pass; no provider dependency, model download or inference exists. This exit does not claim target-device production readiness, full artifact lifecycle, entitlement, observability or real AI security approval.

## Phase 3 — Application integration shells (proposed; not started)

1. AI Tutor shell using `AIService`, unavailable-safe.
2. Practice Generator shell with bounded structured output, unavailable-safe.
3. Learner Memory service integration with validated evidence and consent boundaries.
4. Writing Coach shell, track-neutral and unavailable-safe.
5. Speaking Coach shell with ephemeral raw audio by default and unavailable assessment.
6. Language Learning Hub integration without a large redesign.
7. Product Pack boundary proof for later IELTS, TOEIC, TOEFL and other tracks.

Exit: shells consume only generic services, remain useful in explicit unavailable states, pass full gates and preserve pack isolation. Real provider/model integration remains blocked by the separate decision checklist in `PHASE_2_INTEGRATION_READINESS.md`.

## Phase 4 — Learner continuity persistence and data control

1. Harden and persist the Phase 3 LearnerMemory integration, StudyPlan, and MistakeNotebook behavior.
2. Add category/purpose Consent Grants and gated sync.
3. Add authorized Supabase schema/RLS for generic learner data, export, and deletion.
4. Run two-user CRUD isolation tests before exposing sync.
5. Keep raw audio ephemeral; pack-specific evidence uses generic consent categories.

Exit: learner-data/privacy issue gates pass.

## Phase 5 — Full track modules and content registry

1. Expand the Phase 3 boundary proof into the Product Pack manifest/schema and registration lifecycle.
2. Add namespace, compatibility, entitlement, route, capability, and failure isolation.
3. Adapt one existing learning flow to the ContentRegistry without modifying curriculum source assets.
4. Add generic candidate validation and fingerprint orchestration; packs provide domain policies.
5. Register a minimal test pack to prove extension without core changes.

Exit: track-module/content issue gates pass.

## Phase 6 — Product Packs

1. Stabilize General English foundations against existing curriculum.
2. Add Conversation practice using generic assessment and approved capabilities.
3. Keep Pronunciation claims disabled until an acoustic capability and validation evidence exist.
4. Implement IELTS Academic as the first premium exam track, owning all IELTS tasks, estimates, disclosures, benchmarks, and uniqueness rules.
5. Defer IELTS General, TOEIC, TOEFL, and additional pack expansions until the module contract is proven.

Exit: each pack's own overlay gates pass without weakening platform gates.

## Phase 7 — Whole-platform UI system

1. Introduce semantic platform tokens and restrained surfaces.
2. Standardize capability, artifact, assessment, evidence, consent, entitlement, locked-pack, and empty states.
3. Compose pack navigation and identity without fragmenting core UX.
4. Retain Ech Buri with reduced nonessential motion.
5. Complete keyboard, contrast, reduced-motion, responsive, and screen-reader checks across generic and pack flows.

Exit: platform UI/accessibility gates pass.

## Phase 8 — Hard verification

1. Clean install with reviewed scripts and committed lockfile.
2. Full tests, build, lint, platform verification, pack overlays, migration/RLS tests, and dependency audit.
3. Browser critical paths, offline/cache, accessibility, console/network, and performance checks.
4. Artifact/CDN/integrity/license/benchmark and entitlement review.
5. Produce a final report separating evidence, limitations, configuration, and manual/external checks.

## Risk register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| IELTS concepts leak back into core | Future tracks require forks or core rewrites | Context map, namespace rules, forbidden-term/import fitness tests. |
| Over-generalized abstractions delay useful learning | Platform becomes architecture without product value | Implement thin contracts, prove with one existing flow and a minimal test pack. |
| Small local model fails learning quality | Misleading coaching | Per-capability/per-pack benchmarks, Evidence validation, abstention, deterministic mode. |
| Browser/device/storage incompatibility | AI unavailable or interrupted | Capability probes, quota/integrity/cache lifecycle, honest states. |
| Artifact license/redistribution failure | Commercial exposure | Per-artifact review blocks promotion. |
| Existing fake behavior survives | Trust failure | Discoverable negative-tested gates before pack work. |
| RLS/data policy mistake | Privacy breach | Owner-only patterns, two-user CRUD tests, no browser service role. |
| Pivot damages multilingual content | Regression across the current app | Protected-path gate and additive adapters only. |

## Locked decisions

- Product identity is AI Language Learning Platform.
- IELTS Academic is the first premium exam track.
- Three layers: Platform Core, Learning Domain, Product Packs.
- Platform Core never owns exam-specific concepts.
- Existing multilingual curriculum, public data, audio, and migrations remain untouched during the pivot/foundation.
- Netlify + Supabase are defaults, not architectural lock-in.
- No fixed model before benchmark/license/artifact approval.
