# Phase 0 audit report

Audit date: 2026-07-16  
Baseline: `e5c1d43`  
Scope: static code/configuration audit of the extracted application before large changes

## Executive finding

The baseline is not production-ready as an AI IELTS product. Existing verification reports green while multiple active IELTS paths generate random scores, canned “AI” feedback, fake transcripts, hardcoded histories, and mock dashboard state. The first engineering priority is therefore to make the gates truthful and define enforceable assessment/provider contracts.

## Confirmed fake or misleading behavior

| Area | Evidence in baseline | Risk | Required disposition |
| --- | --- | --- | --- |
| Tutor service | `src/services/aiTutor.ts` explicitly uses mock behavior, random delay, and canned replies. | Users are told AI exists when no inference happened. | Replace with typed local capability provider or explicit unavailable state. |
| Speech analysis | `src/services/speechAnalysis.ts` creates random transcript, score, word analysis, and phonetic-looking output. | Fabricated personal/audio assessment. | Remove random path; separate local transcript, measurable signals, and not-assessed pronunciation. |
| Writing feedback | `src/services/writingFeedback.ts` generates random rubric values and fixed corrections. | Fabricated IELTS-like scoring. | Replace with evidence-linked evaluation contract and abstention. |
| IELTS Writing flow | `src/pages/app/ielts/IELTSWritingPage.tsx` creates random band results. | Misleading high-stakes-style claim. | Remove immediately; show deterministic authored feedback or unavailable state until coach is real. |
| IELTS Speaking flow | `src/pages/app/ielts/IELTSSpeakingPage.tsx` creates random criterion bands and labels an AI examiner. | False examiner and pronunciation implications. | Remove claim/scoring; use measurable signal contract. |
| AI Writing page | `src/pages/app/ielts/AIWritingCoachPage.tsx` returns fixed feedback and score after a timeout. | A loading animation disguises canned output as inference. | Wire to provider contract; fail visibly when unavailable. |
| AI Speaking page | `src/pages/app/ielts/AISpeakingCoachPage.tsx` returns fixed percentages and feedback after a timeout. | Fabricated learner-specific feedback. | Wire to transcript/audio-signal contract; no invented percentages. |
| IELTS dashboard | `src/pages/ielts/IELTSDashboardPage.tsx` contains hardcoded skill bands and `mockChartData`. | Fake progress appears personal. | Use real persisted attempts or clearly labeled demo/empty state. |
| Mistake notebook | `src/pages/app/ielts/MistakeNotebookPage.tsx` contains fake mistakes and dates. | Fabricated memory. | Use real learner evidence or empty state. |
| Mock-test center | `src/pages/app/ielts/MockTestCenterPage.tsx` presents static completions/history. | False activity and weak test lifecycle. | Back with test registry/attempts or clearly labeled catalog state. |
| Test data | `src/data/ieltsData.ts` is static and has no fingerprint/similarity registry. | Duplicate and unverifiable generated content cannot be controlled. | Add candidate/validation/fingerprint/publication lifecycle. |

## False-green quality gates

- `scripts/verify_no_fake_ai_claims.cjs` scans a narrow legacy file list and misses the active IELTS coach/service files above.
- Existing Writing and Speaking verification scripts check for selected strings or structures but do not prove that results derive from input.
- `npm run verify:all` passed on the baseline despite confirmed fake/random assessment. A green baseline result is therefore not evidence of production AI readiness.
- The new gates must discover relevant files by directory/contract boundaries, include negative fixtures or self-tests, distinguish cosmetic randomness from assessment randomness, and fail when fake markers or official-score wording occur.

## Data and security findings

- `.env` exists locally. The ZIP's `.gitignore` ended with corrupted bytes around its environment entry; this was repaired before Git initialization, and `.env` was verified ignored and absent from the baseline commit.
- Frontend Supabase configuration uses public URL/anon configuration and should never receive a service-role secret.
- Current migrations do not provide the newly authorized learner-memory, consent, registry, fingerprint, evaluation, mistake, plan, export, and deletion model.
- IELTS result service expectations and the current `005_ielts_attempts.sql` schema require reconciliation before sync work.
- Owner-only RLS behavior is not yet proven with cross-user tests.

## UI and accessibility findings

- The base design relies heavily on translucent surfaces, gradients, glows, and raw color values, reducing the clarity expected of a serious education product.
- IELTS routes are visually and behaviorally inconsistent.
- Some icon-only controls and complex navigation states require accessible names, focus review, skip navigation, and keyboard validation.
- Global reduced-motion handling and disciplined focus states are incomplete.
- UI polish is deliberately deferred until functional quality phases pass.

## Baseline verification status

| Check | Result | Interpretation |
| --- | --- | --- |
| Existing `verify:all` | Passed before changes | False-green; insufficient coverage. |
| Build | Not yet established at audit time | Dependencies were not installed in the extracted ZIP. |
| Browser QA | Not run at audit time | No dev server/build available yet. |
| Model inference | Absent | No approved local model runtime/artifact is wired. |
| Official calibration | Absent | All future band-like results must be `uncalibrated beta estimate`. |

## Immediate containment

1. Establish truthful verification and assessment policy tests.
2. Define capability/provider/model-registry contracts without choosing a model prematurely.
3. Remove or disable fake assessment paths before claiming any coach feature.
4. Build the internal evaluation registry and benchmark harness.
5. Proceed to Writing only after phase 1 gates pass.

