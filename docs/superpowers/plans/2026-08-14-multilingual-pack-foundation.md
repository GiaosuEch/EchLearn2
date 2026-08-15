# Multilingual Pack Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Japanese JLPT N5, Chinese HSK 1, and Korean TOPIK I starter one validated pack registry and explicit, deterministic lesson-route resolution.

**Architecture:** `src/domain/learning/learningPackRegistry.ts` owns language-neutral pack contracts, validation, progress-node normalization, and route/lesson resolution. Thin adapters in each curriculum translate existing descriptors and SRS data into that contract; pages consume the resolver and render a recovery card instead of guessing a lesson. Completion remains historical/monotonic while SRS mastery remains current instructional evidence.

**Tech Stack:** React 19, TypeScript, React Router 8, Zustand, Node test runner, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-14-multilingual-pack-foundation-design.md`

## Global Constraints

- Use local/static content only; never call a text-generation API at runtime.
- Product manifests are versioned and published content must use namespaced IDs.
- Browser route locks are instructional UX, never an authorization claim.
- Invalid, locked, cross-skill, draft, and unknown lesson links render an explicit recovery state; no fallback to a different lesson.
- Failed first SRS reviews do not count as mastery.
- Preserve Japanese `FuriganaText`, Chinese `HanziPinyinText`, Korean `HangulRomanizationText`, Ech Buri, and existing visual identity.
- Do not commit from this dirty worktree; verification evidence is reported against the working tree.

---

### Task 1: Learning-pack contracts and route resolver

**Files:**
- Create: `src/domain/learning/learningPackRegistry.ts`
- Test: `test/domain/learningPackRegistry.test.ts`

**Interfaces:**
- Produces `LearningPackDefinition`, `LearningLessonDescriptor`, `LearningPathNode`, `LearningPackRegistry`, and `LessonRouteResolution`.
- Consumes `ProductPackManifest` from `src/domain/learning/productPackManifest.ts` and `LessonProgress` from `src/stores/srsStore.ts` only through supplied adapter functions.

- [ ] **Step 1: Write the failing registry test**

```ts
const registry = new LearningPackRegistry([testPack]);
assert.equal(registry.resolveLessonRoute('/app/test/grammar', 'test:grammar:known', path).kind, 'ready');
assert.equal(registry.resolveLessonRoute('/app/test/grammar', 'test:reading:known', path).kind, 'invalid');
assert.match(registry.validate().join('\n'), /duplicate route/);
```

- [ ] **Step 2: Run the focused test and verify it fails because the module does not exist**

Run: `node --test test/domain/learningPackRegistry.test.ts`

Expected: FAIL with module-not-found for `learningPackRegistry.ts`.

- [ ] **Step 3: Implement the minimal generic contract**

```ts
export type LessonRouteResolution =
  | { kind: 'ready'; pack: LearningPackDefinition; lesson: LearningLessonDescriptor }
  | { kind: 'invalid'; reason: 'unknown-route' | 'invalid-lesson' | 'locked-lesson' };

export class LearningPackRegistry {
  resolveLessonRoute(route: string, requestedLessonId: string | null, nodes: readonly LearningPathNode[]): LessonRouteResolution {
    // Require route ownership, matching skill, a published pack, and an active/completed node.
  }
}
```

Validate duplicate pack IDs/routes/lesson IDs, malformed or duplicate review IDs, missing prerequisites, prerequisite cycles, unpublished route exposure, and non-namespaced lesson IDs. For a missing query, choose the first compatible active/completed lesson in declared registry order. Return `invalid` for all other cases.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test test/domain/learningPackRegistry.test.ts`

Expected: PASS.

### Task 2: Adapt the three curricula into published pack definitions

**Files:**
- Create: `src/packs/japaneseJlptN5Pack.ts`
- Create: `src/packs/chineseHsk1Pack.ts`
- Modify: `src/packs/koreanTopik1Pack.ts`
- Modify: `src/curriculum/japaneseCurriculumRegistry.ts`
- Modify: `src/curriculum/chineseHskRegistry.ts`
- Modify: `src/curriculum/koreanTopikRegistry.ts`
- Create: `src/packs/learningPacks.ts`
- Test: `test/domain/learningPacks.test.ts`

**Interfaces:**
- Consumes `LearningPackDefinition` and `LearningPackRegistry` from Task 1.
- Produces `LEARNING_PACKS`, `learningPackRegistry`, and one adapter per language with `resolvePath({ items, lessonProgress })`.

- [ ] **Step 1: Write failing integration tests**

```ts
assert.deepEqual(learningPackRegistry.validate(), []);
for (const route of ['/app/japanese/grammar', '/app/chinese/reading', '/app/korean/pronunciation']) {
  assert.equal(learningPackRegistry.getPackForRoute(route)?.manifest.publicationState, 'published');
}
```

Add fixtures proving: a `n: 0` review cannot unlock vocabulary-dependent grammar; a completed prerequisite still enables its dependent lesson when current review data later resets; and content descriptors have a matching registry lesson.

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test test/domain/learningPacks.test.ts`

Expected: FAIL because `learningPacks.ts` is absent.

- [ ] **Step 3: Implement adapters without duplicating content**

```ts
export const JAPANESE_JLPT_N5_PACK: LearningPackDefinition = {
  manifest: { id: 'ja-jlpt-n5', version: '1.0.0', publicationState: 'published', /* ... */ },
  lessons: mapJapaneseLessons(JAPANESE_LESSON_REGISTRY),
  routes: { '/app/japanese/grammar': 'grammar', /* ... */ },
  resolvePath: ({ items, lessonProgress }) => resolveJapanesePathProgress({ level: 'N5', reviewItems: items, lessonProgress }),
};
```

Make Japanese mapping preserve `getJapaneseLessonProgressId`; make Chinese and Korean mappings preserve their current namespaced IDs. Update Korean’s unlock disclosure/policy to `historical-completion` and resolve prerequisites using `completed || percent >= minimumPercent` for lesson-based prerequisites. Preserve review cards as current-mastery only.

- [ ] **Step 4: Run focused integration and existing curriculum tests**

Run: `node --test test/domain/learningPacks.test.ts test/ui/japaneseCurriculumRegistry.test.ts test/ui/chineseHskRegistry.test.ts test/ui/koreanTopikRegistry.test.ts`

Expected: PASS.

### Task 3: Explicit recovery UI and strict lesson selection

**Files:**
- Create: `src/components/learning/LessonRouteRecovery.tsx`
- Modify: `src/pages/app/japanese/GrammarPracticePage.tsx`
- Modify: `src/pages/app/japanese/ReadingPracticePage.tsx`
- Modify: `src/pages/app/chinese/ChineseLessonPage.tsx`
- Modify: `src/pages/app/chinese/ChineseVocabularyPage.tsx`
- Modify: `src/pages/app/korean/KoreanLessonPage.tsx`
- Modify: `src/pages/app/korean/KoreanVocabularyPage.tsx`
- Test: `test/ui/multilingualLessonRouting.test.ts`

**Interfaces:**
- Consumes `learningPackRegistry.resolveLessonRoute(route, requestedLessonId, pathNodes)` from Task 2.
- Produces reusable `LessonRouteRecovery` with `reason`, `dashboardTo`, and optional `continueTo` props.

- [ ] **Step 1: Write failing source and behavior tests**

```ts
assert.match(source, /LessonRouteRecovery/);
assert.doesNotMatch(source, /find\([^\n]+\)\s*\?\?\s*.*find/);
assert.equal(resolve('/app/korean/grammar', 'ko:topik:topik1:reading:introduction-01').kind, 'invalid');
```

Include invalid/mismatched/locked query IDs for each language and assert a recovery link uses the language dashboard path.

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test test/ui/multilingualLessonRouting.test.ts`

Expected: FAIL because the recovery component and strict resolver usage are absent.

- [ ] **Step 3: Replace fallback selection with resolver output**

```tsx
const resolution = learningPackRegistry.resolveLessonRoute(location.pathname, requestedLessonId, path);
if (resolution.kind === 'invalid') {
  return <LessonRouteRecovery reason={resolution.reason} dashboardTo="/app/korean" />;
}
const lesson = findContentById(resolution.lesson.id);
if (!lesson) return <LessonRouteRecovery reason="invalid-lesson" dashboardTo="/app/korean" />;
```

The recovery component must use a semantic `<section aria-labelledby>`, a focus-visible dashboard `<Link>`, no auto-redirect, and plain language explaining the reason. Keep each language’s existing script-rendering component intact.

- [ ] **Step 4: Run focused UI tests**

Run: `node --test test/ui/multilingualLessonRouting.test.ts test/ui/japaneseCurriculumRegistry.test.ts test/ui/chineseHskUi.test.ts test/ui/koreanTopikUi.test.ts`

Expected: PASS.

### Task 4: Route composition and browser verification

**Files:**
- Modify: `src/App.tsx`
- Create: `e2e/multilingual-routing.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes published routes from `learningPackRegistry` and `LessonRouteRecovery` from Task 3.
- Produces the three language route families nested under `LanguageEntitlementGuard` as UX access policy, plus `test:e2e:multilingual`.

- [ ] **Step 1: Write failing browser tests**

```ts
await page.goto('/app/korean/grammar?lesson=ko:topik:topik1:reading:introduction-01');
await expect(page.getByRole('heading', { name: /bài học không hợp lệ/i })).toBeVisible();
await page.getByRole('link', { name: /quay về lộ trình/i }).press('Enter');
await expect(page).toHaveURL(/\/app\/korean$/);
```

Repeat this route/recovery/keyboard assertion for `/app/japanese/grammar` and `/app/chinese/reading`.

- [ ] **Step 2: Run the browser test and verify failure**

Run: `npm.cmd run test:e2e:multilingual`

Expected: FAIL before route guard composition and recovery UI exist.

- [ ] **Step 3: Nest the language routes under the existing guard**

Move only Japanese, Chinese, and Korean route declarations inside `<Route element={<LanguageEntitlementGuard />}>`. Keep the guard’s behavior labelled as UX routing; do not modify pricing or server authorization.

- [ ] **Step 4: Run exact browser check**

Run: `npm.cmd run test:e2e:multilingual`

Expected: PASS with each invalid deep link recoverable by keyboard.

### Task 5: Whole-change verification and critical review

**Files:**
- Modify: `package.json`
- Modify: `docs/superpowers/specs/2026-08-14-multilingual-pack-foundation-design.md` only if verification exposes a contradiction.

**Interfaces:**
- Consumes all tasks above.
- Produces package `test` coverage for the new unit tests and a written evidence summary in the handoff.

- [ ] **Step 1: Add all new Node tests to the existing `test` script**

Add `test/domain/learningPackRegistry.test.ts`, `test/domain/learningPacks.test.ts`, and `test/ui/multilingualLessonRouting.test.ts` after existing Korean tests.

- [ ] **Step 2: Run unit verification**

Run: `npm.cmd run test`

Expected: all test files pass.

- [ ] **Step 3: Run production build**

Run: `npm.cmd run build`

Expected: TypeScript compilation and Vite build pass.

- [ ] **Step 4: Run source lint and inspect warnings**

Run: `npm.cmd run lint`

Expected: no errors in changed source files; report unrelated existing warnings precisely.

- [ ] **Step 5: Conduct final adversarial audit**

Check the implemented contracts against every invariant in the design: no silent fallback; invalid links are recoverable; route ownership is unique; completion does not relock; review failures do not unlock; no premium claim rests on browser state; scripts retain correct language annotations. Report any unrun browser test or untouched existing flaw as a limitation instead of claiming completion.
