# Local-first IELTS Coach specification

Status: ready-for-agent  
Locked: 2026-07-16  
Decision owner: Product owner

## Problem Statement

Vietnamese IELTS learners need useful Writing, Speaking, test-practice, and planning support without recurring model API charges or surrendering private learning data by default. The current application presents random, hardcoded, or delayed canned behavior as AI and as IELTS scoring, has no credible model-selection benchmark, no duplicate-test registry, and no consent-safe learner-memory boundary. This makes learning claims unreliable and prevents a responsible commercial release.

## Solution

Build a zero-model-key, local-first IELTS learning coach that always exposes its real capability state. The application will provide deterministic learning tools on every supported browser and opt-in local model tiers on compatible devices. Candidate models will be promoted to Light, Standard, or Pro Local only after commercial-license review and a versioned internal benchmark. Writing and Speaking feedback will cite learning evidence, separate measured signals from inference, and label every band-like output `uncalibrated beta estimate` until a lawful examiner-rated calibration set exists.

The system will self-host approved model artifacts with pinned versions and checksums, manage download/cache lifecycle, keep raw audio ephemeral, and sync only consented learner data through owner-only Supabase RLS. The implementation proceeds through quality gates before feature expansion or visual polish.

## User Stories

1. As a learner, I want the site to open without installing software, so that I can begin in basic mode immediately.
2. As a learner on an unsupported device, I want a clear capability explanation, so that I am not given simulated AI output.
3. As a learner, I want to choose an AI tier only after seeing its approximate download and storage cost, so that I control my device resources.
4. As a learner, I want model download progress, cancellation, retry, and recovery, so that multi-hundred-megabyte downloads are manageable.
5. As a learner, I want to see which engine and model version produced feedback, so that the result is transparent.
6. As a learner, I want cached models listed and deletable, so that I can reclaim storage.
7. As a learner, I want downloaded local features to continue offline when browser storage retains them, so that practice is resilient.
8. As a learner, I want Writing feedback organized by IELTS-relevant criteria and linked to excerpts from my response, so that I know what to improve.
9. As a learner, I want band-like Writing output labeled `uncalibrated beta estimate`, so that I do not mistake it for an official score.
10. As a learner, I want the coach to decline an estimate when evidence is insufficient, so that a number is never fabricated.
11. As a learner, I want Speaking transcription to remain on my device by default, so that my voice is private.
12. As a learner, I want raw audio discarded after local processing by default, so that recordings do not silently accumulate.
13. As a learner, I want transcript-level grammar, vocabulary, coherence, words-per-minute, pause, filler, and duration feedback, so that measurable signals guide practice.
14. As a learner, I want pronunciation shown as not assessed when there is no validated acoustic evaluator, so that transcript accuracy is not misrepresented as pronunciation quality.
15. As a learner, I want Speaking feedback to state `Estimated feedback based on transcript and measurable audio signals.`, so that its basis is explicit.
16. As a learner, I want new practice tests to avoid exact and near duplicates of tests I have already seen, so that practice remains useful.
17. As a learner, I want generated test questions validated against their passage and answer evidence, so that plausible-looking invalid items are rejected.
18. As a learner, I want a study plan built from my actual mistakes and history, so that tasks are relevant.
19. As a learner, I want to edit or reset my study plan, so that the coach does not control my schedule.
20. As a learner, I want my memory categories visible, correctable, and deletable, so that personalization remains under my control.
21. As a guest, I want my learning history stored locally, so that sign-in is not required.
22. As a signed-in learner, I want to choose which learning categories sync, so that consent is granular.
23. As a signed-in learner, I want to revoke sync consent, so that future uploads stop without blocking local study.
24. As a signed-in learner, I want to export my stored data in a portable format, so that I can inspect or move it.
25. As a signed-in learner, I want to delete my cloud learner data, so that I can exercise data-control rights.
26. As a learner, I want the UI to distinguish rule-based coaching from generated coaching, so that “AI” is not used as a marketing disguise.
27. As a learner, I want Vietnamese explanations and English IELTS examples, so that advanced concepts remain accessible.
28. As a keyboard or assistive-technology user, I want every IELTS flow operable and clearly labeled, so that the product is inclusive.
29. As a product owner, I want every candidate model compared on the same versioned cases, so that tier selection is evidence-based.
30. As a product owner, I want license and redistribution review to block promotion, so that commercial use is defensible.
31. As a product owner, I want approved artifacts served from project-controlled storage with integrity verification, so that production does not depend on mutable third-party paths.
32. As a product owner, I want evaluation records to retain engine, prompt, rubric, model, artifact, and dataset versions, so that regressions are traceable.
33. As a learning scientist, I want an explicit future calibration seam, so that lawful examiner-rated data can quantify bias and error without redesigning the product.
34. As a learning scientist, I want evidence coverage and abstention measured, so that superficially confident feedback is penalized.
35. As an engineer, I want structured provider contracts and typed failure states, so that unavailable local AI never falls through to fake output.
36. As an engineer, I want owner-only RLS tests for every learner table and operation, so that cross-user access fails closed.
37. As an engineer, I want Netlify-specific configuration isolated from application logic, so that Vercel or VPS deployment remains possible.
38. As a reviewer, I want hard gates for tests, build, lint, static claims, random scoring, routes, accessibility, uniqueness, contracts, and production model readiness, so that completion has objective evidence.
39. As a reviewer, I want the Ech Buri mascot and green identity retained with restrained effects, so that the brand remains recognizable and credible.

## Implementation Decisions

- Define one stable local-capability boundary for text generation, structured evaluation, transcription, embeddings, artifact lifecycle, and explicit unavailable states.
- Keep the deterministic coach available without model download. It may return authored guidance and measurable signals, but no AI claim or band estimate.
- Detect secure context, WebGPU, storage quota, cache state, and worker initialization at runtime. Device labels are advisory; an initialization probe is authoritative.
- Keep candidate selection in a versioned registry. A tier assignment requires benchmark promotion; no UI or service imports a model identifier directly.
- Treat all model output as untrusted. Structured outputs are parsed, schema-validated, size-bounded, evidence-checked, and rejected on failure.
- Self-host only approved production artifacts. The manifest pins model/runtime/tokenizer versions, byte size, license decision, SHA-256 or stronger digest, and integrity metadata.
- Model download is always opt-in. Cancellation aborts network and worker initialization; retry is explicit; partial or invalid artifacts never become ready.
- Define assessment provenance on every result: method, model/artifact version where applicable, rubric version, evidence, confidence, limitations, and creation time.
- Use a fixed UI label constant for `uncalibrated beta estimate`; do not let a model choose or omit the disclaimer.
- Keep pronunciation outside the band calculation until a separately validated acoustic evaluator and lawful calibration evidence exist.
- Normalize generated test content, compute an exact cryptographic fingerprint, and compute a deterministic near-duplicate signature. Reject collisions and above-threshold similarity before registry insertion.
- Generate questions in a candidate state, then deterministically verify structure, answerability, passage evidence, and uniqueness before publishing.
- Store guest memory locally. Authenticated sync is category-specific and consent-gated; revocation stops future sync but does not silently delete local data.
- Create owner-scoped Supabase tables for learner memory, consent, test registry, fingerprints, evaluations, mistakes, study plans, and data export/delete requests.
- Enable RLS on every learner table. Policies bind row ownership to the authenticated subject for select, insert, update, and delete; service-role operations are never exposed to the browser.
- Raw audio remains an in-memory/blob processing input and is released after analysis unless a future, separate recording-storage consent is designed.
- Keep deployment adapters and environment configuration outside domain services; Netlify remains the default build target rather than a runtime dependency.
- Defer broad IELTS visual restyling until quality, Writing, Speaking, generation, and memory exit gates pass.

## Testing Decisions

- The primary seam is the public coach/provider contract: given a capability state and learner input, assert the complete returned result or typed failure without testing internal calls.
- Evaluation policy tests assert fixed disclaimers, evidence requirements, abstention, confidence bounds, and absence of official-score wording.
- Model registry tests assert that unbenchmarked, unlicensed, unpinned, or checksum-missing candidates cannot be promoted.
- Artifact lifecycle tests cover quota rejection, progress monotonicity, cancellation, retry, integrity failure, cache listing, and deletion.
- Test-generation tests cover canonical normalization, stable fingerprints, exact duplicate rejection, near-duplicate rejection, evidence validation, and atomic registry insertion.
- Privacy tests cover no raw-audio persistence, no sync before consent, revocation behavior, export shape, and deletion behavior.
- SQL policy tests must use two authenticated identities and prove each CRUD operation cannot cross ownership boundaries.
- Browser tests cover unsupported WebGPU, first download, cancel/retry, offline cached readiness, Writing and Speaking disclosures, consent, keyboard flow, responsive layouts, and clean console/network behavior.
- Static verification scans the actual source and service boundaries, not a hand-selected list of legacy files. Visual-only randomness is allowed; randomness in scoring, evaluation, test identity, or learner evidence is forbidden.
- Model benchmarks run separately from deterministic unit tests, record target hardware and latency, and never make CI dependent on downloading multi-GB artifacts.

## Out of Scope

- Official IELTS scoring, examiner certification, or claims of equivalence to IELTS partners.
- Autonomous online weight training or self-modifying model weights in the browser.
- Mandatory Ollama, desktop installers, paid model APIs, or centrally hosted GPU inference.
- Automatic multi-GB downloads or silent background model upgrades.
- Raw-audio cloud storage.
- Teacher/admin cross-user dashboards until a separately authorized role and privacy model exists.
- General-purpose autonomous tool execution, web browsing, filesystem access, or account actions driven by model output.
- Final visual redesign before the functional phases and gates are verified.

## Further Notes

“Self-learning” means retrieval from user-controlled learner memory, not unsupervised weight mutation. Browser offline availability is guaranteed only after a successful download while the browser retains the cache. The benchmark is an internal regression instrument, not calibration evidence. Any future lawful calibration work must version the dataset, rater protocol, consent/license basis, population, uncertainty, bias checks, and mapping separately from model-quality evaluation.

