# AI Language Learning Platform

## Product definition

This repository is an AI Language Learning Platform. IELTS Academic is the first premium exam track, not the platform itself. General English, Conversation, Pronunciation, future exam tracks, and additional languages are product packs composed on shared platform and learning-domain contracts.

## Stack

- React 19, TypeScript 6, Vite 8, Tailwind CSS 4.
- Supabase for authentication and consented sync.
- Netlify is the default frontend host; application architecture must remain portable to Vercel or a conventional static/VPS host.
- Local inference must not require a paid model API or model-provider API key.

## Current commands

- Install: `npm.cmd ci --ignore-scripts`
- Build: `npm.cmd run build`
- Lint: `npm.cmd run lint`
- Full legacy verification: `npm.cmd run verify:all`
- Test: not configured at the docs-pivot commit; Platform Quality Foundation must add a passing, platform-first test command before production logic.

## Architecture boundaries

### Platform Core

Owns local-AI capability detection, model registry, artifact management, evaluation harness, structured-output validation, no-fake/no-random policies, consent/sync/export/delete infrastructure, entitlement/pricing, observability, and security.

Platform Core must not contain IELTS bands, Task Response, IELTS Speaking parts, Writing tasks, or IELTS test-generation rules.

### Learning Domain

Owns Language, CourseTrack, SkillArea, Lesson, PracticeSession, Assessment, Rubric, LearnerMemory, StudyPlan, MistakeNotebook, and ContentRegistry concepts.

### Product Packs

Define track-specific content, rubrics, routes, claims, generation rules, and UI composition. IELTS Academic is one pack. IELTS General, TOEIC, TOEFL, and other language/exam packs can be added without changing Platform Core.

Read `CONTEXT-MAP.md` and the relevant context glossary before naming or exposing an interface.

## Non-negotiable platform rules

- Never use random, hardcoded, delayed canned, or fabricated output as AI or personalized assessment.
- If a capability is unavailable, return an explicit state. Do not simulate success.
- Generic assessment vocabulary is `AssessmentResult`, `RubricCriterion`, `Evidence`, `Confidence`, `Limitation`, and `SkillFeedback`.
- Track-specific scoring, labels, disclaimers, and calibration policies live in the owning product pack.
- No model is assigned to a tier before commercial-license review and a versioned benchmark.
- Production artifacts are project-hosted, version-pinned, integrity-checked, and opt-in downloads with progress, cancel, retry, quota warning, and cache deletion.
- Raw audio is not retained by default. Transcript or learning evidence may sync only after explicit consent.
- Every learner-data table must enforce owner-only RLS for select, insert, update, and delete.
- Preserve all existing multilingual curriculum, public data, audio assets, and migrations unless a separately approved task explicitly changes them.
- Keep Ech Buri and the green identity while preferring a restrained, readable education UI over glassmorphism or decorative gradients.

## Delivery order

1. Platform Quality Foundation.
2. Local AI runtime and artifact lifecycle.
3. Generic assessment/rubric engine and learning-domain contracts.
4. Learner memory, consent, sync, export, and delete.
5. Track modules and generic content registry/fingerprinting.
6. Product packs, with IELTS Academic as the first premium exam track.
7. Whole-platform UI system.
8. Hard verification.

Do not expose a later phase before the current phase exit gates pass.

## Engineering discipline

- Read the active spec, relevant context glossary, ADRs, issue, source files, and tests before editing.
- Follow thin TDD slices: RED, GREEN, REFACTOR, verify, commit.
- Treat model output as untrusted data. Parse and validate structured output; never execute it as HTML, SQL, shell, navigation, or account actions.
- Keep changes minimal and rollback-friendly. Do not refactor unrelated code.
- Never read, print, stage, or commit `.env`, credentials, raw learner audio, model binaries, or local caches.
- Do not claim tests, build, lint, verification, browser QA, or security checks passed unless the command/check actually ran on the reported revision.

## Agent skills

### Issue tracker

Platform issues and specs live in `.scratch/language-learning-platform/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The local tracker uses the canonical triage states. See `docs/agents/triage-labels.md`.

### Domain docs

This is a multi-context repository. See `CONTEXT-MAP.md` and `docs/agents/domain.md`.
