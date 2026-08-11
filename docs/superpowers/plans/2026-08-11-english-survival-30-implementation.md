# English Survival 30 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a truthful, evidence-based 30-lesson English survival course for Vietnamese beginners that leads to observable A1-early communication tasks.

**Architecture:** Keep the generic 365-day generator available for other languages, but make English lessons 1–30 resolve to a hand-authored `englishSurvival30` content package. A dedicated lesson player renders the fixed learning loop (context → understand → shadow → context cue → personal production → retrieval) and stores only completion/retrieval/self-review evidence through existing learning services.

**Tech Stack:** React 19, TypeScript, React Router 8, Zustand, existing `recordPracticeAttempt`, `progressService`, Supabase/local fallback, Node test runner.

## Global Constraints

- The course serves Vietnamese speakers at Pre-A1 to early A1; it does not claim full A1, IELTS readiness, native-level speech, or automatic pronunciation scoring.
- Every lesson has one observable CEFR-style `Can-do`, 2–4 reusable chunks, a comprehension task, a personal production task, a retrieval task, Vietnamese context help, and self-review.
- Browser/device TTS may be presented only as a synthetic listening guide; it must never be labelled native audio or used to determine pronunciation quality.
- Human-model audio requires explicit asset owner, license, transcript, accent and speed metadata before publication.
- A lesson can be recorded as complete only after production and retrieval have both been submitted. Audio recording is optional; typed production remains an equal path.
- Preserve current generic courses for non-English languages and do not touch user-owned audit images or the unmerged worktree.

---

### Task 1: Define the course contract and reject template-only English content

**Files:**
- Create: `src/curriculum/englishSurvival30.ts`
- Create: `test/ui/englishSurvival30Content.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `EnglishSurvivalLesson`, `EnglishSurvivalUnit`, `englishSurvival30`, `getEnglishSurvivalLesson(id)` and `isEnglishSurvivalLesson(id)`.
- `EnglishSurvivalLesson` has `id`, `unit`, `order`, `titleVi`, `titleEn`, `canDoVi`, `scenario`, `dialogue`, `chunks`, `contextCue`, `comprehension`, `production`, `retrieval`, `selfReview`, and optional `audioAsset`.

- [ ] **Step 1: Write the failing contract test**

```ts
assert.equal(englishSurvival30.length, 30);
assert.ok(englishSurvival30.every((lesson) => lesson.chunks.length >= 2 && lesson.chunks.length <= 4));
assert.ok(englishSurvival30.every((lesson) => lesson.production.rejectExactModelCopy));
assert.ok(englishSurvival30.every((lesson) => lesson.retrieval.acceptedAnswers.length > 0));
assert.doesNotMatch(JSON.stringify(englishSurvival30), /IELTS|native audio|AI chấm/i);
```

- [ ] **Step 2: Run the contract test and confirm it fails because the package does not exist**

Run: `node --test test/ui/englishSurvival30Content.test.ts`

Expected: failure resolving `englishSurvival30`.

- [ ] **Step 3: Create the explicit TypeScript contract**

```ts
export type EnglishSurvivalLesson = {
  id: `en-survival-${number}`;
  unit: 1 | 2 | 3 | 4 | 5 | 6;
  order: number;
  titleVi: string;
  titleEn: string;
  canDoVi: string;
  scenario: { settingVi: string; roles: [string, string] };
  dialogue: { speaker: 'A' | 'B'; text: string; vi: string }[];
  chunks: { text: string; vi: string; useWhenVi: string; vietnameseLearnerCueVi: string }[];
  contextCue: { titleVi: string; bodyVi: string };
  comprehension: { promptVi: string; options: string[]; correctAnswer: string; explanationVi: string };
  production: { promptVi: string; requiredSlots: string[]; exemplar: string; rejectExactModelCopy: true };
  retrieval: { promptVi: string; acceptedAnswers: string[]; answerHintVi: string };
  selfReview: string[];
  audioAsset?: { url: string; owner: string; license: string; accent: string; speed: 'slow' | 'normal'; transcript: string };
};
```

- [ ] **Step 4: Run the focused test and commit the contract**

Run: `node --test test/ui/englishSurvival30Content.test.ts`

Expected: PASS once the content package exists.

```bash
git add src/curriculum/englishSurvival30.ts test/ui/englishSurvival30Content.test.ts package.json
git commit -m "feat: add English survival curriculum contract"
```

### Task 2: Author units 1–2 — meeting people and daily identity

**Files:**
- Modify: `src/curriculum/englishSurvival30.ts`
- Modify: `test/ui/englishSurvival30Content.test.ts`

**Interfaces:**
- Adds lessons `en-survival-1` through `en-survival-10` to the Task 1 contract.
- Produces content for greeting, name, origin, spelling, repair, family, work/study, routine, time and checkpoint introduction.

- [ ] **Step 1: Extend the test with exact lesson IDs and production requirements**

```ts
const firstTen = englishSurvival30.slice(0, 10);
assert.deepEqual(firstTen.map((lesson) => lesson.id), [
  'en-survival-1', 'en-survival-2', 'en-survival-3', 'en-survival-4', 'en-survival-5',
  'en-survival-6', 'en-survival-7', 'en-survival-8', 'en-survival-9', 'en-survival-10',
]);
assert.ok(firstTen.every((lesson) => lesson.production.requiredSlots.length >= 2));
```

- [ ] **Step 2: Author the ten lesson records**

Use these titles in order: `Hello and goodbye`, `What is your name?`, `Where are you from?`, `How do you spell that?`, `Could you say that again?`, `My family`, `Work or study`, `My daily routine`, `What time is it?`, `Checkpoint: meet me in the lobby`.

Every dialogue must be 2–4 turns, every production prompt must force a new name/place/time/person, and lesson 10 must require an introduction plus one clarification request.

- [ ] **Step 3: Run the focused test and commit**

Run: `node --test test/ui/englishSurvival30Content.test.ts`

Expected: PASS with no duplicate title or Can-do.

```bash
git add src/curriculum/englishSurvival30.ts test/ui/englishSurvival30Content.test.ts
git commit -m "feat: author English survival units one and two"
```

### Task 3: Author units 3–4 — food, shopping, transport and plans

**Files:**
- Modify: `src/curriculum/englishSurvival30.ts`
- Modify: `test/ui/englishSurvival30Content.test.ts`

**Interfaces:**
- Adds lessons `en-survival-11` through `en-survival-20`.
- Produces content for café orders, preferences, prices, payment, shopping checkpoint, times, places, directions, meeting arrangements and transport checkpoint.

- [ ] **Step 1: Add content completeness assertions for lessons 11–20**

```ts
const middleTen = englishSurvival30.slice(10, 20);
assert.ok(middleTen.every((lesson) => lesson.dialogue.length >= 2));
assert.ok(middleTen.every((lesson) => lesson.selfReview.length === 4));
assert.ok(middleTen.every((lesson) => !lesson.audioAsset));
```

- [ ] **Step 2: Author the ten lesson records**

Use these titles in order: `At a café`, `I would like…`, `How much is it?`, `Paying by card`, `Checkpoint: order and change an item`, `Days and times`, `Where is the meeting?`, `Asking for directions`, `Getting there by bus`, `Checkpoint: arrange a meeting`.

Lessons 11–15 must use only ordinary food/drink and money situations. Lessons 16–20 must include at least one repair phrase such as `Sorry, where is…?` or `Could you repeat that?`.

- [ ] **Step 3: Run the focused test and commit**

Run: `node --test test/ui/englishSurvival30Content.test.ts`

Expected: PASS.

```bash
git add src/curriculum/englishSurvival30.ts test/ui/englishSurvival30Content.test.ts
git commit -m "feat: author English survival units three and four"
```

### Task 4: Author units 5–6 — social interaction and repair

**Files:**
- Modify: `src/curriculum/englishSurvival30.ts`
- Modify: `test/ui/englishSurvival30Content.test.ts`

**Interfaces:**
- Adds lessons `en-survival-21` through `en-survival-30`.
- Produces lesson 30 role-play with a 45–60 second survival outcome.

- [ ] **Step 1: Add end-of-course Can-do assertions**

```ts
const finalLesson = englishSurvival30.at(-1)!;
assert.equal(finalLesson.id, 'en-survival-30');
assert.match(finalLesson.canDoVi, /45|60|tình huống/i);
assert.ok(finalLesson.production.requiredSlots.includes('câu hỏi lại'));
```

- [ ] **Step 2: Author the final ten lesson records**

Use these titles in order: `Things I like`, `Would you like to…?`, `Yes, that sounds good`, `Sorry, I cannot`, `Checkpoint: make a plan`, `I need help`, `I do not understand`, `Can you show me?`, `One more time, please`, `Final checkpoint: a day in the city`.

Lesson 30 must combine greeting, self-introduction, a practical request, one response, and one repair phrase. It must not use IELTS vocabulary, scoring, or a promise of fluency.

- [ ] **Step 3: Run content tests and commit**

Run: `node --test test/ui/englishSurvival30Content.test.ts`

Expected: PASS.

```bash
git add src/curriculum/englishSurvival30.ts test/ui/englishSurvival30Content.test.ts
git commit -m "feat: complete English survival thirty lessons"
```

### Task 5: Resolve the curated course before generated English lessons

**Files:**
- Modify: `src/curriculum/courseRegistry.ts`
- Create: `src/curriculum/englishSurvivalCourse.ts`
- Create: `test/ui/englishSurvivalRouting.test.ts`

**Interfaces:**
- `englishSurvivalCourse` exposes six `CourseUnit` modules, each with five lessons mapped to `en-survival-*` IDs.
- `getCourseForLanguage('en')` returns these six modules; non-English remains on `generateMegaCourse`.

- [ ] **Step 1: Write failing routing tests**

```ts
assert.equal(getCourseForLanguage('en')?.flatMap((unit) => unit.lessons).length, 30);
assert.equal(getCourseForLanguage('en')?.[0].lessons[0].id, 'en-survival-1');
assert.equal(getCourseForLanguage('ja')?.[0].id, 'ja_mod_1');
```

- [ ] **Step 2: Implement a six-module English course adapter**

Build module metadata from `englishSurvival30` rather than duplicating titles. Set each module description to its real Can-do cluster and use `mixed` as the lesson type only if `CourseUnit` is extended; otherwise use `speaking` without implying automatic pronunciation assessment.

- [ ] **Step 3: Run routing tests and commit**

Run: `node --test test/ui/englishSurvivalRouting.test.ts`

Expected: PASS and no regression for Japanese fallback.

```bash
git add src/curriculum/courseRegistry.ts src/curriculum/englishSurvivalCourse.ts test/ui/englishSurvivalRouting.test.ts
git commit -m "feat: route English roadmap to survival course"
```

### Task 6: Build truthful progress persistence for a survival lesson

**Files:**
- Create: `src/services/englishSurvivalProgressService.ts`
- Create: `test/ui/englishSurvivalProgress.test.ts`
- Modify: `src/services/practiceLearningIntegration.ts`

**Interfaces:**
- `completeEnglishSurvivalLesson(input)` consumes `{ lesson, userId?, nativeLanguage, interfaceLanguage, comprehensionCorrect, productionText, retrievalAnswer, selfReview, recordingDurationSec? }`.
- It rejects blank production, exact exemplar copy, wrong retrieval, or fewer than four self-review responses.
- On success it calls `recordPracticeAttempt` with `score: 1`, `total: 1`, `skillType: 'lesson'`, then `progressService.markLessonCompleted` for authenticated learners.

- [ ] **Step 1: Write failing behavior tests**

```ts
await assert.rejects(() => completeEnglishSurvivalLesson({ ...valid, productionText: valid.lesson.production.exemplar }));
await assert.rejects(() => completeEnglishSurvivalLesson({ ...valid, retrievalAnswer: 'wrong phrase' }));
const result = await completeEnglishSurvivalLesson(valid);
assert.equal(result.completed, true);
assert.equal(result.proficiencyScore, undefined);
```

- [ ] **Step 2: Implement validation and one completion event**

Normalize whitespace/case before comparison. Treat a production text as new only when it is not exactly the exemplar and contains all required slot values. Store only modality and duration—not audio binary or a derived language score—in practice metadata.

- [ ] **Step 3: Run persistence tests and commit**

Run: `node --test test/ui/englishSurvivalProgress.test.ts`

Expected: PASS; storage metadata never contains `band`, `pronunciationScore`, or `aiScore`.

```bash
git add src/services/englishSurvivalProgressService.ts src/services/practiceLearningIntegration.ts test/ui/englishSurvivalProgress.test.ts
git commit -m "feat: persist truthful survival lesson completion"
```

### Task 7: Create the dedicated 20-minute lesson player

**Files:**
- Create: `src/pages/app/EnglishSurvivalLessonPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/app/CourseRoadmapPage.tsx`
- Create: `test/ui/englishSurvivalLessonPage.test.ts`

**Interfaces:**
- Route: `/app/english-survival?lesson=en-survival-1` inside `LanguageEntitlementGuard`.
- Reads one lesson from `getEnglishSurvivalLesson`, renders six fixed stages, and calls `completeEnglishSurvivalLesson` only after valid production/retrieval/self-review.
- English roadmap’s “Học bài tiếp theo” links to this route only when `currentLanguage` is `en` or `en-US`.

- [ ] **Step 1: Write a static route and copy integrity test**

```ts
assert.match(app, /path="english-survival"/);
assert.match(page, /Nghe trong ngữ cảnh/);
assert.match(page, /Nhại có hướng dẫn/);
assert.match(page, /Tự tạo câu của bạn/);
assert.doesNotMatch(page, /native audio|AI chấm|IELTS band/i);
```

- [ ] **Step 2: Implement the six-stage state machine**

Render stage progression as `context`, `comprehension`, `shadow`, `contextCue`, `production`, `retrieval`, `selfReview`. The “shadow” stage may offer existing device TTS only with copy `Nghe mẫu tổng hợp từ thiết bị`; it cannot mark speaking quality. Keep `BuriLoadingState` for missing/invalid lesson IDs and show a retry-safe route back to `/app/roadmap`.

- [ ] **Step 3: Wire roadmap and validate responsive behavior**

The roadmap calculates the next unfinished `en-survival-*` lesson from `progressService.getCompletedLessons`. On narrow screens, stages are a single column, controls are at least 44px, and no fixed desktop sidebar is required to complete a lesson.

- [ ] **Step 4: Run focused tests and commit**

Run: `node --test test/ui/englishSurvivalLessonPage.test.ts test/ui/englishSurvivalRouting.test.ts test/ui/englishSurvivalProgress.test.ts`

Expected: PASS.

```bash
git add src/pages/app/EnglishSurvivalLessonPage.tsx src/App.tsx src/pages/app/CourseRoadmapPage.tsx test/ui/englishSurvivalLessonPage.test.ts
git commit -m "feat: add English survival lesson player"
```

### Task 8: Add publication-quality safeguards and final verification

**Files:**
- Modify: `scripts/verify_no_fake_ai_claims.cjs`
- Modify: `package.json`
- Create: `scripts/verify_english_survival_content.cjs`
- Modify: `docs/superpowers/specs/2026-08-11-english-survival-30-design.md`

**Interfaces:**
- `npm run verify:english-survival` runs contract, route, progress and copy checks.
- Content verifier exits non-zero when a lesson misses a required block, duplicates a Can-do/title, uses unsupported claims, or publishes an audio asset without ownership metadata.

- [ ] **Step 1: Write a failing verifier case in the Node test**

```ts
assert.throws(() => validateEnglishSurvivalLesson({ ...lesson, selfReview: [] }));
assert.throws(() => validateEnglishSurvivalLesson({ ...lesson, audioAsset: { url: 'x' } } as any));
```

- [ ] **Step 2: Implement the command and claim guard**

Scan `englishSurvival30` for exactly 30 lessons, unique IDs/titles/Can-dos, complete exercise blocks, banned claims, and full audio asset metadata. Add the command to `package.json` without changing `verify:all` until the focused command passes locally.

- [ ] **Step 3: Run full verification and commit**

Run: `npm run verify:english-survival && npm test && npm run build && npm run lint && node scripts/verify_no_fake_ai_claims.cjs`

Expected: all commands exit 0; lint warnings from unrelated `.agents` directories may remain warnings, not failures.

```bash
git add scripts/verify_english_survival_content.cjs scripts/verify_no_fake_ai_claims.cjs package.json docs/superpowers/specs/2026-08-11-english-survival-30-design.md
git commit -m "test: guard English survival content quality"
```

## Plan self-review

- **Coverage:** Tasks 1–4 author the full 30 lessons; Task 5 routes English without breaking other languages; Task 6 persists truthful evidence; Task 7 delivers the responsive learning loop; Task 8 enforces content/claim quality.
- **Completeness scan:** every task names its interfaces, files, test command and completion condition. Human audio remains intentionally optional until rights/metadata exist, with no synthetic claim of native quality.
- **Type consistency:** lesson IDs use `en-survival-*` across content, adapter, persistence, route and tests; completion always uses an evidence event, never a derived proficiency score.
