# AI Language Learning Platform Specification

Status: ready-for-agent
Locked: 2026-07-16
Decision owner: Product owner

## Problem Statement

The current application contains valuable multilingual curriculum, language-learning flows, audio, and learner infrastructure, but its new AI architecture was framed too narrowly as an IELTS product. That direction would force shared services, data, assessment, UI, and model governance to know IELTS concepts and make future General English, Conversation, Pronunciation, TOEIC, TOEFL, and other-language experiences expensive forks.

The baseline also contains random, canned, or hardcoded behavior presented as personalized AI/assessment, while existing verification can report green. The platform needs trustworthy shared foundations before any new pack feature or visual polish.

## Solution

Build an AI Language Learning Platform with three dependency layers: Platform Core, Learning Domain, and Product Packs. Platform Core owns local AI, model/artifact governance, evaluation, validation, privacy infrastructure, entitlement/pricing, observability, and security without knowing a language or exam. Learning Domain owns generic curriculum, practice, assessment, feedback, learner memory, planning, mistakes, and content concepts. Product Packs compose those contracts into General English, Conversation, Pronunciation, IELTS Academic, and future tracks.

IELTS Academic becomes the first premium exam track. It owns all IELTS tasks, rubrics, band-like values, disclosures, calibration policy, benchmarks, and content-uniqueness rules. Existing multilingual curriculum/data/audio/migrations remain untouched during the pivot and Platform Quality Foundation.

## User Stories

1. As a learner, I want one app for languages, skills, and specialized tracks, so that my learning history is coherent.
2. As a learner, I want useful deterministic learning when local AI is unavailable, so that unsupported hardware does not block study.
3. As a learner, I want deterministic behavior labeled honestly, so that it is never disguised as AI.
4. As a learner, I want explicit capability and error states, so that failures never produce fake personalized output.
5. As a learner, I want model downloads to disclose size/storage and support progress, cancel, retry, and deletion, so that I control device resources.
6. As a learner, I want generated feedback tied to Evidence, Confidence, and Limitations, so that I can judge and act on it.
7. As a learner, I want an assessment to abstain when evidence is insufficient, so that values are not invented.
8. As a learner, I want memory, mistakes, and study plans under my control, so that personalization remains correctable.
9. As a guest, I want learning data local by default, so that sign-in is optional.
10. As a signed-in learner, I want category/purpose consent before sync, so that cloud data use is explicit.
11. As a learner, I want to revoke consent and export/delete my data regardless of plan, so that data rights do not depend on payment.
12. As a learner, I want raw audio discarded by default, so that recordings do not silently accumulate.
13. As a learner, I want clear Language, CourseTrack, and SkillArea navigation, so that packs do not fragment the experience.
14. As a learner, I want General English and Conversation experiences that do not look like exam simulations, so that learning purpose stays clear.
15. As a learner, I want Pronunciation claims disabled unless an acoustic method is validated, so that transcripts are not misrepresented.
16. As an IELTS learner, I want IELTS Academic as a focused premium track, so that specialized exam behavior is available without taking over the app.
17. As a future TOEIC/TOEFL learner, I want a new track to reuse the same platform, so that quality and privacy remain consistent.
18. As a multilingual learner, I want existing curriculum and audio preserved, so that the architecture pivot does not destroy content.
19. As a product owner, I want entitlements evaluated centrally, so that pricing changes do not scatter feature checks across pages.
20. As a product owner, I want candidate models compared on versioned benchmarks, so that tiers are selected by evidence.
21. As a product owner, I want model license and redistribution review to block promotion, so that commercial use is defensible.
22. As a product owner, I want Project-hosted immutable artifacts with integrity verification, so that production avoids mutable third-party paths.
23. As an engineer, I want Platform Core free of pack imports/terms, so that new packs do not require core rewrites.
24. As an engineer, I want one generic AssessmentResult/Rubric/Evidence contract, so that track policies remain adapters.
25. As an engineer, I want one generic GeneratedContentFingerprint mechanism, so that each pack can supply its own novelty policy.
26. As an engineer, I want track manifests with namespaces and compatibility checks, so that packs register safely.
27. As an engineer, I want model output treated as untrusted structured data, so that it cannot execute actions or inject content.
28. As an engineer, I want owner-only RLS proven by two-user CRUD tests, so that learner sync fails closed.
29. As a reviewer, I want negative-tested no-fake/no-random gates, so that verification cannot remain false-green.
30. As a reviewer, I want protected-path checks for curriculum/data/audio/migrations, so that platform work cannot silently damage them.
31. As a reviewer, I want test, build, lint, verify, browser, security, and performance claims backed by actual runs, so that completion is evidence-based.
32. As an accessibility user, I want shared learning and pack UI keyboard/screen-reader accessible, so that specialized tracks remain inclusive.

## Implementation Decisions

- Enforce one-way dependencies from Product Packs to Learning Domain to Platform Core.
- Keep Platform Core free of named languages, exams, tasks, rubrics, scores, and uniqueness thresholds.
- Use generic AssessmentResult, RubricCriterion, Evidence, Confidence, Limitation, and SkillFeedback contracts.
- Use generic GeneratedContentFingerprint mechanics; each Product Pack owns canonical content fields, similarity policy, thresholds, and validators.
- Separate Model Candidates from Approved Model Artifacts and keep an empty approved registry valid.
- Select models per capability/tier only after commercial-license, benchmark, artifact, device, and security approval.
- Use browser-first local AI with deterministic non-AI learning on unsupported devices.
- Treat model output as untrusted structured data and prohibit direct action execution.
- Keep guest data local; gate authenticated sync by category/purpose Consent Grants.
- Centralize entitlement/pricing decisions and keep data-control rights independent from entitlement.
- Register Product Packs through versioned namespaced manifests with capabilities, rubrics, content, routes, consent purposes, entitlement, and evaluation references.
- Preserve existing multilingual curriculum, public data, audio assets, and migrations during pivot/foundation; later integration uses additive adapters.
- Keep Netlify/Supabase as defaults behind portable application boundaries.

## Testing Decisions

- Primary Phase 1 seam: public platform policy/contract functions, tested as pure deterministic behavior with no model/download/database dependency.
- Architectural fitness tests scan platform modules for forbidden pack imports and named exam terms.
- AI honesty/no-random tests include seeded violations that must fail.
- Model-promotion tests verify every missing approval dimension fails closed.
- Structured-output tests assert parsing, bounds, evidence validation, and rejection/abstention.
- Track-module tests register a minimal fake pack and reject namespace, compatibility, entitlement, and isolation violations.
- Privacy tests cover no raw-audio persistence, no sync before consent, revocation, export/delete, and two-user RLS.
- Protected-path tests hash/inventory curriculum, public data, audio, and migrations when the active task does not authorize changes.
- Product Pack suites extend platform tests without replacing them.
- Browser/model benchmarks remain opt-in and record hardware/browser/artifact versions.

## Out of Scope

- Implementing new production features before this pivot commit.
- Choosing a specific local model before benchmark and license review.
- Rewriting multilingual curriculum, public data, audio assets, or existing migrations during Phase 1.
- Implementing every Product Pack at once.
- Official exam scoring or examiner-equivalence claims.
- Autonomous model-weight training or model-generated tool execution.
- Whole-app visual redesign before functional/platform gates pass.

## Further Notes

The IELTS-first commit remains valuable historical evidence for audit, research, license, privacy, and calibration constraints. It is superseded architecturally, not erased. Product-pack-specific claims can be stricter than generic platform policy but never weaker than platform honesty, privacy, security, validation, and evidence rules.
