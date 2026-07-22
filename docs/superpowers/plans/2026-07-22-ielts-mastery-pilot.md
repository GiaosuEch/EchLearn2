# IELTS Band 7.5+ Mastery Protocol Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a feature-flagged, offline-first IELTS Mastery pilot route with an immutable curriculum bundle, deterministic two-form SRS mastery, privacy-safe persistence, and pilot quality gates.

**Architecture:** Keep the legacy IELTS Vocabulary Trainer untouched. Add a self-contained `src/features/ieltsMastery/` feature with pure curriculum and SRS modules, a repository that uses local storage first and Supabase when configured, and a new `/app/ielts/mastery` route. The browser computes learner-facing mastery deterministically; no AI, ASR, audio, raw answer persistence, or score claim participates in V1 progression.

**Tech Stack:** React 19, TypeScript 6, React Router 8, Zustand 5, Supabase JS 2, Node built-in test runner, Vite 8, Tailwind 4.

## Global Constraints

- Preserve `src/curriculum/ieltsVocabulary.ts`, `src/pages/app/ielts/IELTSVocabularyPage.tsx`, and their route behavior; this pilot is parallel.
- V1 targets authenticated or local-mode IELTS Band 5.5–6.0 learners only; it must not promise an IELTS band or examination result.
- Mastery is deterministic: Context Match and Active Cloze only. Voice and every AI feature remain non-blocking.
- A curriculum bundle is versioned, SHA-256 verified, editorially approved, and never mutated in place.
- Audit persistence stores metadata only; it must not persist raw typed answers, audio, generated output, or credentials.
- SRS intervals use calendar time (T+1, T+3, T+7, T+16, T+30, T+60); at most one Credit Session is awarded per calendar day.
- Do not add an unapproved runtime, model URL, provider dependency, service-role key, or Supabase schema rewrite.
- All database additions are additive migrations with owner-only RLS. Audit attempts are append-only (select/insert only); updates or individual deletions are prohibited. Deleting the entire enrollment may cascade-delete its attempts to honor a learner's deletion request.
- Do not stage or commit unrelated dirty-worktree files.

---

## File structure

```text
src/features/ieltsMastery/
  curriculum/types.ts                 # Immutable bundle and entry contract
  curriculum/validate.ts              # Pure schema, uniqueness and hash checks
  curriculum/pilotBundle.ts           # Frozen reviewed V1 bundle and manifest
  engine/types.ts                     # Attempt, entry state, session and cohort types
  engine/attempt.ts                   # Deterministic answer/latency/focus evaluation
  engine/schedule.ts                  # Calendar due dates and state transitions
  engine/session.ts                   # One-credit-per-day and new-item budget policy
  data/repository.ts                  # Local/Supabase persistence boundary
  data/localRepository.ts             # localStorage implementation
  data/supabaseRepository.ts          # Supabase implementation and idempotent sync
  ui/MasteryEnrollment.tsx            # Eligibility and transparent consent screen
  ui/MasterySession.tsx               # Review-first two-form session experience
  ui/MasteryProgress.tsx              # Short/long term, debt, session and ETA display
  IELTSMasteryPilotPage.tsx           # Page composition and recovery flow
src/pages/app/ielts/IELTSMasteryPilotPage.tsx  # Route-level export shim
supabase/migrations/011_ielts_mastery_pilot.sql # Additive owner-RLS pilot tables
test/platform/ieltsMasteryCurriculum.test.ts
test/platform/ieltsMasteryEngine.test.ts
test/platform/ieltsMasterySession.test.ts
test/platform/ieltsMasteryPersistence.test.ts
test/platform/ieltsMasteryShell.test.ts
scripts/verify_ielts_mastery_pilot.cjs
docs/runbooks/IELTS_MASTERY_PILOT.md
```

## Task 1: Define the immutable curriculum contract

**Files:**
- Create: `src/features/ieltsMastery/curriculum/types.ts`
- Create: `src/features/ieltsMastery/curriculum/validate.ts`
- Test: `test/platform/ieltsMasteryCurriculum.test.ts`

**Consumes:** RFC sections 2–4.

**Produces:** `MasteryCurriculumBundle`, `MasteryEntry`, synchronous `validateBundle(bundle)`, asynchronous `verifyBundleHash(bundle)`, and `canonicalBundlePayload(bundle)` for all later tasks.

- [ ] **Step 1: Write failing contract tests**

```ts
assert.deepEqual(validateBundle(validBundle), { ok: true, issues: [] });
assert.equal(validateBundle({ ...validBundle, entries: [validEntry, validEntry] }).ok, false);
assert.equal(validateBundle(bundleWithMissingClozeAnswer).ok, false);
assert.equal((await verifyBundleHash(validBundle)).ok, true);
assert.equal((await verifyBundleHash(bundleWithIncorrectHash)).ok, false);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test test/platform/ieltsMasteryCurriculum.test.ts`  
Expected: FAIL because the feature modules do not exist.

- [ ] **Step 3: Add the exact public contract**

```ts
export type MasteryForm = 'context-match' | 'active-cloze';
export type MasteryStage = 't1' | 't3' | 't7' | 't16' | 't30' | 't60';

export interface MasteryEntry {
  readonly id: string;
  readonly term: string;
  readonly bandLevel: '7.0' | '7.5' | '8.0' | '8.5';
  readonly topic: string;
  readonly coreMeaning: string;
  readonly collocationPattern: string;
  readonly contexts: readonly { readonly skill: 'writing_task_2' | 'speaking_part_2_3'; readonly sampleSentence: string; readonly contextNote: string }[];
  readonly prompts: { readonly contextMatch: { readonly prompt: string; readonly choices: readonly string[]; readonly correctAnswer: string }; readonly activeCloze: { readonly prompt: string; readonly acceptedAnswers: readonly string[] } };
  readonly provenance: { readonly sourceRef: string; readonly verifiedBy: string; readonly verifiedAt: string; readonly revision: string };
}

export interface MasteryCurriculumBundle {
  readonly schemaVersion: 1;
  readonly curriculumVersion: string;
  readonly publishedAt: string;
  readonly sha256: string;
  readonly entries: readonly MasteryEntry[];
}
```

- [ ] **Step 4: Implement deterministic validation**

`validateBundle` is synchronous and must reject non-ISO publish/review times, duplicate IDs, duplicate choices, answer keys absent from choices, empty approved answers, missing both required contexts, invalid source reference, and malformed SHA-256 fields. `verifyBundleHash` is asynchronous, uses browser-native Web Crypto SHA-256 against `canonicalBundlePayload`, and reports whether the calculated digest matches `sha256` without blocking UI parsing.

- [ ] **Step 5: Run focused tests and format/type checks**

Run: `node --test test/platform/ieltsMasteryCurriculum.test.ts`  
Expected: PASS.

Run: `npx.cmd tsc --noEmit -p tsconfig.app.json`  
Expected: exit 0.

- [ ] **Step 6: Commit only the scoped files**

```powershell
git add src/features/ieltsMastery/curriculum test/platform/ieltsMasteryCurriculum.test.ts
git commit -m "feat: add immutable mastery curriculum contract"
```

## Task 2: Produce and freeze the reviewed 600-entry curriculum bundle

**Files:**
- Create: `src/features/ieltsMastery/curriculum/pilotBundle.ts`
- Create: `docs/runbooks/IELTS_MASTERY_CURRICULUM_REVIEW.md`
- Modify: `test/platform/ieltsMasteryCurriculum.test.ts`

**Consumes:** Task 1 contracts and the product owner's independent-content, two-key editorial approval protocol.

**Produces:** A 600-entry `PILOT_MASTERY_BUNDLE` that validates and a repeatable editorial review record.

- [ ] **Step 1: Add failing freeze tests**

```ts
assert.equal(PILOT_MASTERY_BUNDLE.entries.length, 600);
assert.equal(validateBundle(PILOT_MASTERY_BUNDLE).ok, true);
assert.ok(PILOT_MASTERY_BUNDLE.entries.every((entry) => entry.bandLevel !== '7.0' || entry.term.length > 0));
assert.equal(new Set(PILOT_MASTERY_BUNDLE.entries.map((entry) => entry.id)).size, 600);
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test test/platform/ieltsMasteryCurriculum.test.ts`  
Expected: FAIL because the approved bundle is absent.

- [ ] **Step 3: Author content through the approved batch protocol**

Create 600 independently worded entries in three reviewed batches of 200. For every entry, include both required prompt forms, two relevant Writing/Speaking contexts, a permitted reference identifier/link, an editor identifier, ISO approval time, and editorial revision. Do not copy dictionary definitions or examples. The review runbook must require: schema check, expert review, a recorded Approve/Edit/Reject decision, and a regenerated content hash after every approved batch.

- [ ] **Step 4: Generate the published manifest from canonical data**

`pilotBundle.ts` must export one frozen object, not a runtime generator:

```ts
export const PILOT_MASTERY_BUNDLE: MasteryCurriculumBundle = Object.freeze({
  schemaVersion: 1,
  curriculumVersion: '2026.07.0',
  publishedAt: '2026-07-22T00:00:00.000Z',
  sha256: '<generated-64-lowercase-hex-digest>',
  entries: Object.freeze(entries),
});
```

The digest is generated from `canonicalBundlePayload`, then the final result must pass `validateBundle` in the test.

- [ ] **Step 5: Run focused verification**

Run: `node --test test/platform/ieltsMasteryCurriculum.test.ts`  
Expected: PASS with exactly 600 validated entries.

- [ ] **Step 6: Commit only after named expert approval is recorded**

```powershell
git add src/features/ieltsMastery/curriculum/pilotBundle.ts docs/runbooks/IELTS_MASTERY_CURRICULUM_REVIEW.md test/platform/ieltsMasteryCurriculum.test.ts
git commit -m "feat: freeze reviewed IELTS mastery pilot curriculum"
```

## Task 3: Implement deterministic attempt evaluation and entry state transitions

**Files:**
- Create: `src/features/ieltsMastery/engine/types.ts`
- Create: `src/features/ieltsMastery/engine/attempt.ts`
- Create: `src/features/ieltsMastery/engine/schedule.ts`
- Test: `test/platform/ieltsMasteryEngine.test.ts`

**Consumes:** Task 1 entry contracts.

**Produces:** `evaluateAttempt`, `applyAttempt`, and `getDueAt` used by persistence and UI.

- [ ] **Step 1: Write failing behavior tests**

```ts
assert.equal(evaluateAttempt({ form: 'context-match', answer: 'foster a sense of community', shownAtMs: 1_000, firstInteractionAtMs: 1_600, focused: true }).outcome, 'pass');
assert.equal(evaluateAttempt({ form: 'context-match', answer: 'wrong', shownAtMs: 1_000, firstInteractionAtMs: 1_400, focused: true }).outcome, 'guessing-fail');
assert.equal(evaluateAttempt({ form: 'active-cloze', answer: 'FOSTER   A SENSE OF COMMUNITY', shownAtMs: 1_000, firstInteractionAtMs: 1_600, focused: true }).outcome, 'pass');
assert.equal(evaluateAttempt({ form: 'active-cloze', answer: 'foster a sense of community', shownAtMs: 1_000, firstInteractionAtMs: 1_200, focused: true }).outcome, 'invalid-latency');
```

- [ ] **Step 2: Run test and verify failure**

Run: `node --test test/platform/ieltsMasteryEngine.test.ts`  
Expected: FAIL because the engine modules do not exist.

- [ ] **Step 3: Define the engine interfaces**

```ts
export type EntryStatus = 'unseen' | 'learning' | 'short-term-mastered' | 'long-term-mastered';
export interface EntryState { readonly entryId: string; readonly curriculumVersion: string; readonly status: EntryStatus; readonly stage: MasteryStage; readonly dueAt: string; readonly lapses: number; readonly updatedAt: string; }
export interface AttemptInput { readonly form: MasteryForm; readonly answer: string; readonly shownAtMs: number; readonly firstInteractionAtMs: number; readonly focused: boolean; }
export interface AttemptEvaluation { readonly outcome: 'pass' | 'answer-fail' | 'guessing-fail' | 'invalid-latency' | 'focus-fail'; readonly latencyMs: number | null; readonly latencyValid: boolean; }
```

- [ ] **Step 4: Implement exact deterministic rules**

Normalize Active Cloze answers by Unicode NFKC, trim, collapse internal whitespace, and lowercase. A pass requires an allowed normalized answer, focus, and `300 <= latencyMs < 2000`. A Context Match wrong answer below 2000ms returns `guessing-fail`. All failures set stage `t1`, increment lapses, and schedule T+1. Passing both forms at each stage advances to the next fixed calendar interval; T+16 sets `short-term-mastered` and T+60 sets `long-term-mastered`.

- [ ] **Step 5: Test all transitions**

Add assertions for both forms required at each stage, T+1/T+3/T+7/T+16/T+30/T+60 dates, wrong late answer, focus loss, clock-negative latency, and a T+60 Long-term Mastered result.

Run: `node --test test/platform/ieltsMasteryEngine.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit scoped implementation**

```powershell
git add src/features/ieltsMastery/engine test/platform/ieltsMasteryEngine.test.ts
git commit -m "feat: add deterministic mastery SRS engine"
```

## Task 4: Add calendar-aware session and recovery policy

**Files:**
- Create: `src/features/ieltsMastery/engine/session.ts`
- Modify: `src/features/ieltsMastery/engine/types.ts`
- Test: `test/platform/ieltsMasterySession.test.ts`

**Consumes:** Task 3 `EntryState` and due-date semantics.

**Produces:** `createSessionPlan`, `awardCreditSession`, `getRecoveryState`, and `calculateEta`.

- [ ] **Step 1: Write failing policy tests**

```ts
assert.equal(createSessionPlan({ dueReviewMinutes: 31, remainingNewEntries: 10 }).newEntryQuota, 0);
assert.equal(createSessionPlan({ dueReviewMinutes: 20, remainingNewEntries: 10 }).newEntryQuota, 8);
assert.equal(awardCreditSession({ creditedCalendarDays: ['2026-07-22'], calendarDay: '2026-07-22' }).kind, 'extra-practice');
assert.equal(getRecoveryState({ reviewDebt: 81, averageDailyReviews: 50, consecutiveInactiveDays: 0 }).mode, 'recovery');
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test test/platform/ieltsMasterySession.test.ts`  
Expected: FAIL because `session.ts` is absent.

- [ ] **Step 3: Implement the policy contract**

```ts
export interface SessionPlan { readonly reviewMinutes: number; readonly newEntryQuota: 0 | 1 | 2 | 3 | 5 | 6 | 7 | 8; readonly reason: 'review-debt' | 'limited-capacity' | 'standard-capacity' | 'freeze-period'; }
export interface SessionCredit { readonly kind: 'credit-session' | 'extra-practice'; readonly calendarDay: string; }
```

Sessions 74–90 always return `freeze-period` and quota zero. Review debt at or above 30 projected minutes returns `review-debt` and quota zero. One credit is possible per recorded local enrollment calendar day; all same-day work is Extra Practice. Recovery begins when debt exceeds `1.5 * averageDailyReviews`, fewer than five credit days occur in the current week, or inactivity reaches three consecutive days. The ETA must be deterministic from debt, average clearance capacity, and missed days.

- [ ] **Step 4: Run focused tests**

Run: `node --test test/platform/ieltsMasterySession.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit scoped implementation**

```powershell
git add src/features/ieltsMastery/engine/session.ts src/features/ieltsMastery/engine/types.ts test/platform/ieltsMasterySession.test.ts
git commit -m "feat: add mastery session and recovery policy"
```

## Task 5: Build privacy-safe local persistence and export/delete controls

**Files:**
- Create: `src/features/ieltsMastery/data/repository.ts`
- Create: `src/features/ieltsMastery/data/localRepository.ts`
- Test: `test/platform/ieltsMasteryPersistence.test.ts`

**Consumes:** Tasks 1, 3, and 4.

**Produces:** `MasteryRepository` local implementation with idempotent attempt IDs, snapshot export, and deletion.

- [ ] **Step 1: Write failing local repository tests**

```ts
const repository = createLocalMasteryRepository(fakeStorage);
await repository.appendAttempt(attempt);
await repository.appendAttempt(attempt);
assert.equal((await repository.listAttempts(enrollmentId)).length, 1);
assert.doesNotMatch(JSON.stringify(await repository.exportEnrollment(enrollmentId)), /answer|audio|transcript/i);
await repository.deleteEnrollment(enrollmentId);
assert.equal(await repository.getEnrollment(enrollmentId), null);
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test test/platform/ieltsMasteryPersistence.test.ts`  
Expected: FAIL because the repository modules are absent.

- [ ] **Step 3: Define the repository interface**

```ts
export interface MasteryRepository {
  getEnrollment(id: string): Promise<MasteryEnrollment | null>;
  saveEnrollment(value: MasteryEnrollment): Promise<void>;
  listStates(enrollmentId: string): Promise<readonly EntryState[]>;
  saveState(value: EntryState): Promise<void>;
  appendAttempt(value: AttemptAudit): Promise<boolean>;
  listAttempts(enrollmentId: string): Promise<readonly AttemptAudit[]>;
  exportEnrollment(enrollmentId: string): Promise<unknown>;
  deleteEnrollment(enrollmentId: string): Promise<void>;
}
```

`AttemptAudit` must include an immutable client-generated UUID used as its idempotency key, form, stage, result metadata, timestamps, and bundle version. It must not contain the answer text, audio, transcript, AI output, or any secret.

- [ ] **Step 4: Implement local storage behavior**

Use a feature-specific namespace rather than the legacy `echlern_ielts_vocabulary_progress_v1` key. Reject malformed storage safely, deduplicate by attempt ID, and persist an atomically replaced feature snapshot. Export a JSON-safe object containing enrolment, states, and metadata-only attempts. Delete only keys owned by this feature.

- [ ] **Step 5: Run focused test**

Run: `node --test test/platform/ieltsMasteryPersistence.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit scoped implementation**

```powershell
git add src/features/ieltsMastery/data test/platform/ieltsMasteryPersistence.test.ts
git commit -m "feat: add local mastery pilot persistence"
```

## Task 6: Add additive Supabase persistence and owner-only RLS

**Files:**
- Create: `supabase/migrations/011_ielts_mastery_pilot.sql`
- Create: `src/features/ieltsMastery/data/supabaseRepository.ts`
- Modify: `src/features/ieltsMastery/data/repository.ts`
- Modify: `scripts/verify_supabase_migrations.cjs`
- Test: `test/platform/ieltsMasteryPersistence.test.ts`

**Consumes:** Task 5 repository contract.

**Produces:** A local-or-Supabase repository selection that never duplicates an attempt or stores raw learner answers.

- [ ] **Step 1: Add failing source and migration-contract tests**

```ts
assert.match(migration, /create table.*mastery_pilot_enrollments/is);
assert.match(migration, /unique\s*\(user_id, attempt_id\)/i);
assert.match(migration, /for delete/i);
assert.doesNotMatch(migration, /\banswer\s+text\b|\baudio\b|\btranscript\b/i);
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test test/platform/ieltsMasteryPersistence.test.ts`  
Expected: FAIL because the migration and repository do not exist.

- [ ] **Step 3: Add the migration**

Create additive tables `mastery_pilot_enrollments`, `mastery_entry_states`, `mastery_attempt_audits`, and `mastery_credit_sessions`. Include `user_id`, curriculum version, timezone, state metadata, and idempotency IDs; omit raw answer/audio/transcript fields. Add unique constraints for `(user_id, attempt_id)` and `(user_id, enrollment_id, calendar_day)`; enable RLS and create owner-only select, insert, update, and delete policies on every learner table. Add due-date and user indexes.

- [ ] **Step 4: Implement repository selection and sync semantics**

When Supabase is absent, return the Task 5 repository. When configured, persist the same contract with `upsert` only where the migration has an explicit unique key; append attempts with `attempt_id` conflict-ignore behavior. On reconnect, send local attempts in stable created-at/attempt-ID order and save server-confirmed state. A duplicate attempt ID must return `false` and must never create a second mastery transition.

- [ ] **Step 5: Verify SQL and source contracts**

Run: `node --test test/platform/ieltsMasteryPersistence.test.ts`  
Expected: PASS.

Run: `node scripts/verify_supabase_migrations.cjs`  
Expected: exit 0 after adding the new migration to the verifier's ordered inventory.

- [ ] **Step 6: Manually run two-user staging proof before pilot**

Use two non-admin test accounts. Verify each account can create/read/update/delete only its own enrolment, state, attempts, and sessions; verify cross-user select, update, and delete are rejected. Record results in the pilot runbook.

- [ ] **Step 7: Commit scoped implementation**

```powershell
git add supabase/migrations/011_ielts_mastery_pilot.sql src/features/ieltsMastery/data scripts/verify_supabase_migrations.cjs test/platform/ieltsMasteryPersistence.test.ts
git commit -m "feat: persist mastery pilot with owner-only sync"
```

## Task 7: Implement transparent enrolment and the pilot route shell

**Files:**
- Create: `src/features/ieltsMastery/ui/MasteryEnrollment.tsx`
- Create: `src/features/ieltsMastery/IELTSMasteryPilotPage.tsx`
- Create: `src/pages/app/ielts/IELTSMasteryPilotPage.tsx`
- Modify: `src/App.tsx`
- Test: `test/platform/ieltsMasteryShell.test.ts`

**Consumes:** Tasks 1, 4, and 5.

**Produces:** `/app/ielts/mastery` and a saved explicit enrolment before any session begins.

- [ ] **Step 1: Write failing route and copy tests**

```ts
assert.match(app, /path="ielts\/mastery"/);
assert.match(page, /Band 5\.5.*6\.0/s);
assert.match(page, /90 credit sessions/i);
assert.match(page, /does not guarantee.*IELTS/i);
assert.doesNotMatch(page, /AIService|createPlatformAIService|fetch\s*\(/);
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test test/platform/ieltsMasteryShell.test.ts`  
Expected: FAIL because the route and shell do not exist.

- [ ] **Step 3: Implement enrolment requirements**

The enrolment screen must show audience eligibility, 25–35 minutes per session, one credit per day, calendar SRS intervals, 90-session/maintenance timeline, deterministic two-form mastery, privacy summary, export/delete availability, and no IELTS-score guarantee. Enrolment writes curriculum version/hash and timezone only after the learner explicitly confirms the protocol.

- [ ] **Step 4: Add the isolated route**

Add `IELTSMasteryPilotPage` to the `/app/ielts/mastery` route. Do not change the existing `/app/ielts/vocabulary` route or its page. The route page renders enrolment until `MasteryRepository.getEnrollment` returns an active valid enrolment.

- [ ] **Step 5: Run focused test**

Run: `node --test test/platform/ieltsMasteryShell.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit scoped implementation**

```powershell
git add src/features/ieltsMastery/ui/MasteryEnrollment.tsx src/features/ieltsMastery/IELTSMasteryPilotPage.tsx src/pages/app/ielts/IELTSMasteryPilotPage.tsx src/App.tsx test/platform/ieltsMasteryShell.test.ts
git commit -m "feat: add mastery pilot enrolment route"
```

## Task 8: Build the review-first two-form session experience

**Files:**
- Create: `src/features/ieltsMastery/ui/MasterySession.tsx`
- Create: `src/features/ieltsMastery/ui/MasteryProgress.tsx`
- Modify: `src/features/ieltsMastery/IELTSMasteryPilotPage.tsx`
- Modify: `test/platform/ieltsMasteryShell.test.ts`

**Consumes:** Tasks 3–7.

**Produces:** A functional session that records valid metadata attempts and only grants mastery through the deterministic engine.

- [ ] **Step 1: Add failing UI source tests**

```ts
assert.match(sessionSource, /context-match/);
assert.match(sessionSource, /active-cloze/);
assert.match(sessionSource, /firstInteractionAtMs/);
assert.match(progressSource, /Recovery Mode/);
assert.doesNotMatch(sessionSource, /speechRecognition|MediaRecorder|AIService|fetch\s*\(/);
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test test/platform/ieltsMasteryShell.test.ts`  
Expected: FAIL because the session UI is absent.

- [ ] **Step 3: Implement session ordering and instrumentation**

Render all due reviews before new entries. Capture prompt-ready time only after the browser has painted the prompt; record the first relevant touch or keypress exactly once. On blur/visibility loss before answer completion, submit a focus-fail result without an answer. Context Match must render approved choices; Active Cloze must never display its accepted answers before submission. The component passes only the selected answer transiently to `evaluateAttempt` and writes metadata-only `AttemptAudit` values.

- [ ] **Step 4: Implement progress and recovery copy**

`MasteryProgress` displays Short-term Mastered, Long-term Mastered, review debt, Session `n/90`, time budget, curriculum version, and a clear reason for new-item quota. In recovery, show the reason, a deterministic revised ETA, and a review-first action; do not show streaks, XP, fake AI feedback, or a band estimate.

- [ ] **Step 5: Run focused tests and browser smoke checks**

Run: `node --test test/platform/ieltsMasteryShell.test.ts`  
Expected: PASS.

Manual check: enrol locally, complete Context Match then Active Cloze, reload, confirm the state survives, complete a second same-day session, and confirm it is Extra Practice rather than a new credit session.

- [ ] **Step 6: Commit scoped implementation**

```powershell
git add src/features/ieltsMastery/ui/MasterySession.tsx src/features/ieltsMastery/ui/MasteryProgress.tsx src/features/ieltsMastery/IELTSMasteryPilotPage.tsx test/platform/ieltsMasteryShell.test.ts
git commit -m "feat: add deterministic mastery pilot sessions"
```

## Task 9: Add dashboard discovery, feature flag, export/delete, and pilot operations

**Files:**
- Create: `src/features/ieltsMastery/featureFlag.ts`
- Create: `src/features/ieltsMastery/ui/MasteryDataControls.tsx`
- Modify: `src/pages/app/DashboardPage.tsx`
- Modify: `src/features/ieltsMastery/IELTSMasteryPilotPage.tsx`
- Create: `docs/runbooks/IELTS_MASTERY_PILOT.md`
- Modify: `test/platform/ieltsMasteryShell.test.ts`

**Consumes:** Tasks 5–8.

**Produces:** A controlled advanced-track entry, learner data controls, and a repeatable 30-session pilot operating runbook.

- [ ] **Step 1: Write failing discovery and privacy tests**

```ts
assert.match(dashboard, /\/app\/ielts\/mastery/);
assert.match(dataControls, /Export/);
assert.match(dataControls, /Delete/);
assert.match(flag, /IELTS_MASTERY_PILOT_ENABLED/);
assert.doesNotMatch(dataControls, /audio|transcript|answer/i);
```

- [ ] **Step 2: Run focused test and verify failure**

Run: `node --test test/platform/ieltsMasteryShell.test.ts`  
Expected: FAIL because discovery and controls are absent.

- [ ] **Step 3: Implement feature flag and learner controls**

Feature discovery defaults off unless `VITE_IELTS_MASTERY_PILOT_ENABLED === 'true'`; the route must show a clear unavailable/closed-pilot state when disabled. The dashboard card must be labeled Pilot/Advanced Track and cannot claim a score outcome. Export calls the repository metadata-only export. Delete requires a confirmation step, deletes only pilot-owned records, and shows a completion state.

- [ ] **Step 4: Write the operational runbook**

The runbook must define eligibility screening, consent, feature-flag enable/disable, cohort IDs, weekly review of compliance/accuracy/latency/debt/engine-failure metrics, the 30-session gate, incident severity, rollback, and the rule that Supabase project-owner analytics are the only staff view until a separately authorized staff-RBAC analytics surface is built.

- [ ] **Step 5: Run focused test**

Run: `node --test test/platform/ieltsMasteryShell.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit scoped implementation**

```powershell
git add src/features/ieltsMastery/featureFlag.ts src/features/ieltsMastery/ui/MasteryDataControls.tsx src/features/ieltsMastery/IELTSMasteryPilotPage.tsx src/pages/app/DashboardPage.tsx docs/runbooks/IELTS_MASTERY_PILOT.md test/platform/ieltsMasteryShell.test.ts
git commit -m "feat: add mastery pilot operations controls"
```

## Task 10: Wire full verification and release evidence

**Files:**
- Create: `scripts/verify_ielts_mastery_pilot.cjs`
- Modify: `package.json`
- Modify: `docs/runbooks/IELTS_MASTERY_PILOT.md`

**Consumes:** Tasks 1–9.

**Produces:** A repeatable hard-gate command and release checklist.

- [ ] **Step 1: Write a failing verifier invocation**

Run: `node scripts/verify_ielts_mastery_pilot.cjs`  
Expected: FAIL because the verifier is absent.

- [ ] **Step 2: Implement source-level hard gates**

The verifier must fail when the pilot route is missing, the legacy vocabulary route is changed or removed, bundle validation fails, the bundle has fewer than 600 entries, a required form is absent, banned AI/voice/network APIs appear in the mastery engine/UI, raw answer/audio fields appear in pilot persistence/migration, the one-credit daily policy is absent, or the feature flag/rollback path is absent.

- [ ] **Step 3: Register exact test command**

Add every mastery test file to the existing explicit `test` and `test:platform` lists in `package.json`; add `verify:ielts-mastery` with `node scripts/verify_ielts_mastery_pilot.cjs`. Extend `verify:all` by appending `npm run verify:ielts-mastery`.

- [ ] **Step 4: Run the full evidence set**

Run: `npm.cmd test`  
Expected: all existing and mastery platform tests pass.

Run: `npm.cmd run lint`  
Expected: exit 0; classify any pre-existing warning separately.

Run: `npm.cmd run build`  
Expected: exit 0.

Run: `npm.cmd run verify:ielts-mastery`  
Expected: exit 0.

Run: `npm.cmd run verify:all`  
Expected: exit 0.

Run: `git diff --check`  
Expected: no whitespace errors in the scoped changes.

- [ ] **Step 5: Record pilot readiness evidence**

In the runbook, record the exact curriculum version/hash, reviewer approval identifiers, migration version, test/build/verification outputs, two-user RLS result, and feature-flag default state. Do not record learner answers, audio, credentials, or private keys.

- [ ] **Step 6: Commit release evidence only after all gates pass**

```powershell
git add scripts/verify_ielts_mastery_pilot.cjs package.json docs/runbooks/IELTS_MASTERY_PILOT.md
git commit -m "test: verify IELTS mastery pilot release gates"
```

## Milestones and dependencies

| Milestone | Tasks | Exit condition |
|---|---:|---|
| M1: Trusted curriculum foundation | 1–2 | 600 reviewed, hashed, validated entries |
| M2: Deterministic protocol | 3–4 | Pure SRS and session policy tests pass |
| M3: Safe learner data | 5–6 | Local/Supabase idempotency and owner-only RLS proven |
| M4: Pilot experience | 7–9 | Parallel route, enrolment, sessions, recovery, controls, runbook |
| M5: Release evidence | 10 | All hard gates and production build pass |

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Editorial review cannot approve 600 entries | Do not enable the feature flag or make the pilot claim; ship no partial bundle as the advertised V1. |
| Existing migration drift blocks a clean deployment | Run the Task 6 two-user staging proof before enrolment; do not alter unrelated legacy migrations in this plan. |
| Client clock/local storage is tampered with | Treat browser controls as protocol integrity checks, not a security credential; pause credit on clock anomalies and preserve audit metadata. |
| Review load exceeds the 35-minute budget | Freeze new items through Task 4 policy and send learners to Recovery Mode with a recalculated ETA. |
| Pilot data is mistaken for causal proof | Restrict early reporting to feasibility; require a separate randomized or matched study before comparative product claims. |

## Self-review

- Spec coverage: Tasks 1–2 cover immutable, reviewed curriculum; Tasks 3–4 cover deterministic mastery, latency, calendar SRS, recovery, and session cap; Tasks 5–6 cover metadata-only persistence and RLS; Tasks 7–9 cover pilot route, UX, feature flag, export/delete, and operations; Task 10 covers hard gates, rollback evidence, and verification.
- Placeholder scan: no implementation step uses an unresolved placeholder; the `<generated-64-lowercase-hex-digest>` in Task 2 is explicitly generated by the Task 1 canonical hashing function and is not a hand-authored value.
- Type consistency: `MasteryCurriculumBundle`, `EntryState`, `AttemptAudit`, and `MasteryRepository` are defined before later tasks consume them.
