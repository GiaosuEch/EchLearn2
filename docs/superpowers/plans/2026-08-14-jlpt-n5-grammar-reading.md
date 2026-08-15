# JLPT N5 Grammar and Reading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver offline JLPT N5 grammar and reading trainers with SRS-backed lesson progress and dashboard unlocks.

**Architecture:** A static product-pack lesson registry supplies structured Japanese segments, examples, questions, answers, and analyses. Question IDs use SM-2 in `srsStore`; a sibling lesson-progress record aggregates only lesson completion. Japanese practice pages consume the registry and dashboard derives status from the store.

**Tech Stack:** React 19, TypeScript, Zustand persist, React Router, Motion, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-08-14-jlpt-n5-grammar-reading-design.md`

## Global Constraints

- Use only authored local/mock content; no content API or runtime text generation.
- Render Japanese lesson text with `FuriganaText` when a reading is available.
- Keep SM-2 behavior intact for every question ID.
- A lesson completes at 80% and retains its best attained progress.

---

### Task 1: Author N5 curriculum and rule test

**Files:**
- Create: `src/curriculum/jlptN5Lessons.ts`
- Create: `test/ui/jlptN5Curriculum.test.ts`

**Interfaces:**
- Produces: `JLPT_N5_LESSONS`, `JapaneseSegment`, `getLessonCompletion`, and `calculateLessonXp`.
- Consumes: no API, remote data, or generated text.

- [ ] **Step 1: Write the failing curriculum test**

```ts
assert.equal(JLPT_N5_LESSONS['grammar-1'].skill, 'grammar');
assert.equal(getLessonCompletion(2, 3).completed, false);
assert.equal(calculateLessonXp(3, 3), 50);
```

- [ ] **Step 2: Run the test and verify it fails because the registry does not exist**

Run: `node --test test/ui/jlptN5Curriculum.test.ts`

- [ ] **Step 3: Add the static lessons and pure progression helpers**

```ts
export function getLessonCompletion(correct: number, total: number) {
  const percent = Math.round((Math.max(0, Math.min(correct, total)) / Math.max(1, total)) * 100);
  return { percent, completed: percent >= 80 };
}
```

- [ ] **Step 4: Re-run the test**

Run: `node --test test/ui/jlptN5Curriculum.test.ts`

### Task 2: Persist lesson progress beside SM-2

**Files:**
- Modify: `src/stores/srsStore.ts`

**Interfaces:**
- Consumes: a lesson ID, correct answer count, and question total.
- Produces: `recordLessonAttempt(lessonId, correct, total): LessonProgress` and `getLessonProgress(lessonId)`.

- [ ] **Step 1: Add a `LessonProgress` record**

```ts
interface LessonProgress {
  id: string; attempts: number; lastScore: number; bestScore: number;
  total: number; percent: number; completed: boolean; completedAt?: number;
}
```

- [ ] **Step 2: Record the best percentage without modifying `recordReview` SM-2 behavior**

```ts
const completed = current.completed || bestPercent >= 80;
```

- [ ] **Step 3: Run the curriculum test and production type check**

Run: `node --test test/ui/jlptN5Curriculum.test.ts && npm.cmd run build`

### Task 3: Replace Japanese trainer placeholders

**Files:**
- Modify: `src/pages/app/japanese/GrammarPracticePage.tsx`
- Modify: `src/pages/app/japanese/ReadingPracticePage.tsx`

**Interfaces:**
- Consumes: `JLPT_N5_LESSONS`, `recordReview`, `recordLessonAttempt`, `calculateLessonXp`, and `MascotFeedback`.
- Produces: fully answerable N5 grammar and reading routes.

- [ ] **Step 1: Render structured Japanese segments with the common primitive**

```tsx
segment.ruby
  ? <FuriganaText base={segment.base} ruby={segment.ruby} />
  : <span>{segment.base}</span>
```

- [ ] **Step 2: Record each selection as an SM-2 review and give mascot feedback**

```ts
recordReview(`jlpt:n5:${lesson.id}:${question.id}`, isCorrect ? 5 : 1);
setMascotEmotion(isCorrect ? 'happy' : 'sad');
```

- [ ] **Step 3: Finalize the lesson and award deterministic XP**

```ts
const progress = recordLessonAttempt(lesson.id, correctCount, lesson.questions.length);
void addXP(calculateLessonXp(correctCount, lesson.questions.length), `JLPT N5 ${lesson.id}`);
```

- [ ] **Step 4: Run the build**

Run: `npm.cmd run build`

### Task 4: Derive skill-tree unlock state

**Files:**
- Modify: `src/pages/app/japanese/JapaneseDashboardPage.tsx`

**Interfaces:**
- Consumes: `lessonProgress` and namespaced question IDs.
- Produces: `grammar-1` and `reading-1` statuses and percentage rings.

- [ ] **Step 1: Exclude `jlpt:` review IDs from the vocabulary prerequisite**

```ts
const vocabularyProgress = Math.min(100, Object.keys(srsItems).filter((id) => !id.startsWith('jlpt:')).length * 5);
```

- [ ] **Step 2: Derive grammar then reading status**

```ts
status: grammarCompleted ? 'completed' : grammarUnlocked ? 'active' : 'locked'
status: readingCompleted ? 'completed' : grammarCompleted ? 'active' : 'locked'
```

- [ ] **Step 3: Run focused test and build**

Run: `node --test test/ui/jlptN5Curriculum.test.ts && npm.cmd run build`
