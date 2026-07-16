# AI Language Learning Platform Architecture

## Objective

Build one trustworthy language-learning platform that can host multiple languages, learning tracks, and premium exam packs. Local AI is shared infrastructure; it is not the product identity. IELTS Academic is the first premium exam track and must not shape Platform Core interfaces.

## Three-layer architecture

```text
Product Packs
  General English | Conversation | Pronunciation | IELTS Academic | future packs
          |
          v
Learning Domain
  Language | CourseTrack | SkillArea | Lesson | PracticeSession
  Assessment | Rubric | LearnerMemory | StudyPlan | ContentRegistry
          |
          v
Platform Core
  Local AI | Models/Artifacts | Evaluation | Validation | Privacy/Sync
  Entitlement/Pricing | Observability | Security
```

Dependencies point downward. Platform Core cannot import Learning Domain or Product Pack concepts. Learning Domain can request platform capabilities through stable interfaces. Product Packs compose both layers and own every track-specific policy.

## Platform Core responsibilities

- Detect local device/browser capabilities and expose typed Capability States.
- Govern candidate and approved model artifacts without fixing a model before benchmark.
- Download, verify, cache, retry, cancel, and delete project-hosted artifacts.
- Run versioned EvaluationBenchmarks and record comparable evidence.
- Validate Structured Output before it reaches a learning workflow.
- Enforce no-fake-AI and no-random-assessment policies.
- Provide category-specific consent, local-first sync, export, and deletion infrastructure.
- Evaluate Entitlements and pricing plans without putting plan checks in feature pages.
- Emit privacy-filtered Platform Events for reliability, performance, and security.
- Apply secure defaults, resource limits, integrity verification, and dependency governance.

Platform Core does not know IELTS bands, named exam tasks, IELTS parts, Task Response, IELTS uniqueness thresholds, or any curriculum-specific rule.

## Learning Domain responsibilities

- Represent Language, CourseTrack, SkillArea, Lesson, and PracticeSession consistently across packs.
- Apply a Rubric to Evidence through the generic assessment engine.
- Return AssessmentResult, Confidence, Limitation, and SkillFeedback without assuming a particular exam scale.
- Own learner-controlled memory, study plans, mistake notebooks, and content registry semantics.
- Own GeneratedContentFingerprint as a generic content-registry concept; packs supply their comparison policy and threshold.

## Product Pack responsibilities

- Publish a pack manifest with identity, version, supported languages, audience, CourseTracks, and entitlement requirements.
- Contribute content, route composition, rubrics, assessment value semantics, disclosures, and validation policies.
- Declare required platform capabilities but handle unavailable states honestly.
- Keep pack-specific data and benchmarks namespaced.
- Never bypass platform consent, artifact approval, output validation, security, or no-fake/no-random rules.

## Composition example

The IELTS Academic Pack may define Writing Task 1/2, Speaking Part 1/2/3, band-like estimates, the fixed beta disclosure, and IELTS test novelty rules. It consumes generic AssessmentResult, RubricCriterion, Evidence, Confidence, Limitation, SkillFeedback, GeneratedContentFingerprint, and EvaluationBenchmark contracts. Removing the pack leaves Platform Core and every other pack intact.

## Data ownership

| Data | Owner | Pack visibility |
| --- | --- | --- |
| Model/artifact manifest and benchmark metadata | Platform Core | Read through capability interfaces |
| Consent grants, sync jobs, export/delete requests | Platform Core | Request by declared category/purpose |
| Languages, tracks, skills, lessons, practice sessions | Learning Domain | Packs contribute namespaced definitions |
| Assessment results, evidence, learner memory, study plans, mistakes | Learning Domain | Pack-scoped access through owner/consent rules |
| Exam tasks, track rubrics, scoring labels, content rules | Product Pack | Owning pack only |
| Raw audio | Ephemeral platform boundary | No persistence by default |

## Deployment

The frontend/PWA targets Netlify and Supabase is the default auth/sync/database provider. Host-specific redirects and headers remain adapters. Domain, pack, AI, storage, and entitlement interfaces use portable web/application boundaries so the same build can move to Vercel or VPS.

## Protected baseline assets

The existing multilingual curriculum, public language data, audio assets, and Supabase migrations are protected during the architecture pivot. Integrating them into ContentRegistry or pack manifests requires later additive adapters and verification, not destructive rewrites.

## Architectural fitness checks

- Platform directories contain no exam names, band terms, or pack imports.
- A minimal fake Product Pack can register without editing Platform Core.
- IELTS Academic can be disabled without breaking generic learning routes.
- Model/runtime replacement does not change Learning Domain or pack contracts.
- Entitlement changes do not require feature-page conditionals.
- All track output passes platform structured-output and privacy policies.
