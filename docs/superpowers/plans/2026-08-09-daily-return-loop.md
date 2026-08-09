# Daily-return loop implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the authenticated dashboard into a truthful daily-return loop with one learning action, live mission progress, and data-driven Ech Buri feedback.

**Architecture:** A pure `dailyFocusService` projects existing deterministic missions and stored counters into one `DailyFocus` view model. `DashboardPage` consumes it with the existing adaptive plan and mission subscription. `EchBuriAnimated` gains a vector-only `streak` state; no new backend table is introduced.

**Tech Stack:** React 19, TypeScript, React Router, Motion, Zustand, existing Supabase-backed mission service, Node test runner, Playwright.

## Global Constraints

- Keep `daily_mission_progress` as the only persisted daily-mission state.
- Every focus destination is an existing `/app/...` learning route.
- Derive mascot state only from focus, mission completion, and streak values; retain reduced-motion and animation preference gates.
- Preserve dashboard metrics, mission claims, lesson routes, and 320px behavior.

---

### Task 1: Daily focus view model

**Files:**
- Create: `src/services/dailyFocusService.ts`
- Create: `test/ui/dailyFocus.test.ts`

**Interfaces:**
- Produces `createDailyFocus({ missions, currentLanguage, recommendedLessonPath, streak }): DailyFocus`.
- `DailyFocus` has `status`, `title`, `detail`, `progressLabel`, `actionLabel`, `actionPath`, and `mascotState`.

- [ ] **Step 1: Write the failing behavior tests**

```ts
it('uses the first unfinished mission as the one daily action', () => {
  const focus = createDailyFocus({ missions: [mission('listening', 1, 3), mission('lessons', 1, 1)], currentLanguage: 'en', recommendedLessonPath: '/app/lesson?id=en_mod_1', streak: 0 });
  assert.equal(focus.actionPath, '/app/listening');
  assert.equal(focus.progressLabel, '1 / 3');
  assert.equal(focus.mascotState, 'listening');
});

it('celebrates only when every mission is complete', () => {
  const focus = createDailyFocus({ missions: [mission('xp', 50, 50), mission('lessons', 1, 1)], currentLanguage: 'en', recommendedLessonPath: '/app/lesson?id=en_mod_1', streak: 4 });
  assert.equal(focus.status, 'complete');
  assert.equal(focus.mascotState, 'cheering');
  assert.equal(focus.actionPath, '/app/missions');
});
```

- [ ] **Step 2: Run RED**

Run: `node --test test/ui/dailyFocus.test.ts`

Expected: FAIL because `dailyFocusService.ts` does not exist.

- [ ] **Step 3: Implement the minimal projection**

```ts
const routeByMissionType = { listening: '/app/listening', speaking: '/app/speaking', reading: '/app/reading', writing: '/app/writing', vocabulary: '/app/vocabulary', grammar: '/app/grammar' };

export function createDailyFocus(input: DailyFocusInput): DailyFocus {
  const next = input.missions.find((mission) => !mission.completed);
  return next ? incompleteFocus(next, input) : completeFocus();
}
```

Generic mission types (`xp`, `lessons`, `perfect_lessons`) use `recommendedLessonPath` or `/app/lesson?id=${currentLanguage}_mod_1&lesId=${currentLanguage}_les_1`. Map listening to `listening`, an active streak to `streak`, and other unfinished focus to `thinking`.

- [ ] **Step 4: Run GREEN and commit**

Run: `node --test test/ui/dailyFocus.test.ts`

Expected: PASS.

```bash
git add src/services/dailyFocusService.ts test/ui/dailyFocus.test.ts
git commit -m "feat: derive one daily learning focus"
```

### Task 2: Prominent streak state for Ech Buri

**Files:**
- Modify: `src/components/mascot/EchBuriAnimated.tsx`
- Modify: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Extends `EchBuriAnimationState` with `streak`.
- Produces an inline-vector flame halo and transform-only bounce.

- [ ] **Step 1: Write the failing mascot test**

```ts
test('Ech Buri has a distinct streak state without raster art', async () => {
  const component = await source(componentPath);
  assert.match(component, /'streak'/);
  assert.match(component, /streak: \{ y:/);
  assert.match(component, /state === 'streak'/);
  assert.doesNotMatch(component, /<image|\.png|\.gif|lottie/i);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because `streak` is absent.

- [ ] **Step 3: Add the state**

Add `streak` to body, eye, and book variants. Render a small orange flame halo only when `state === 'streak'`. Keep the `motionEnabled` guard and animate only transform and opacity.

- [ ] **Step 4: Run GREEN and commit**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: PASS.

```bash
git add src/components/mascot/EchBuriAnimated.tsx test/ui/echBuriAnimated.test.ts
git commit -m "feat: add Ech Buri streak feedback"
```

### Task 3: Dashboard focus card and live feedback

**Files:**
- Modify: `src/pages/app/DashboardPage.tsx`
- Modify: `e2e/echBuriExperience.spec.ts`
- Modify: `test/ui/dashboardMetrics.test.ts`

**Interfaces:**
- Consumes `generateDailyMissions`, `readMissionState`, `syncMissionStateFromRemote`, `subscribeToMissionProgress`, `applyProgressToMissions`, and `createDailyFocus`.
- Produces `aria-label="Việc học quan trọng hôm nay"` with one real learning link.

- [ ] **Step 1: Write failing source and browser tests**

```ts
it('dashboard subscribes to real mission progress before composing focus', async () => {
  const page = await source('src/pages/app/DashboardPage.tsx');
  assert.match(page, /subscribeToMissionProgress/);
  assert.match(page, /createDailyFocus/);
  assert.match(page, /Việc học quan trọng hôm nay/);
});

test('dashboard gives an authenticated learner one daily focus action', async ({ page }) => {
  await seedAuthenticatedLearner(page);
  await page.goto('/app/dashboard');
  await expect(page.getByLabel('Việc học quan trọng hôm nay')).toBeVisible();
  await expect(page.getByLabel('Việc học quan trọng hôm nay').getByRole('link')).toHaveCount(1);
});
```

- [ ] **Step 2: Run RED**

Run: `node --test test/ui/dashboardMetrics.test.ts`

Run: `npx playwright test e2e/echBuriExperience.spec.ts --grep "daily focus"`

Expected: FAIL because DashboardPage has no focus service, mission subscription, or labelled primary card.

- [ ] **Step 3: Implement dashboard composition**

Derive templates with `generateDailyMissions(todayKey(), userId.length)`. Initialize from `readMissionState(userId)`, call `syncMissionStateFromRemote(userId)`, subscribe only to events for the matching user, apply progress, then create focus after the adaptive plan resolves or defaults.

Replace the generic hero learning CTA with the focus CTA. Keep the group link. Render `EchBuriAnimated` with `dailyFocus.mascotState` and a short `aria-live="polite"` message in the focus card. Do not create a nested `main` landmark.

- [ ] **Step 4: Run GREEN and commit**

Run: `node --test test/ui/dashboardMetrics.test.ts`

Run: `npx playwright test e2e/echBuriExperience.spec.ts --grep "daily focus|dashboard greets"`

Expected: PASS with one primary focus link and a visible mascot state.

```bash
git add src/pages/app/DashboardPage.tsx e2e/echBuriExperience.spec.ts test/ui/dashboardMetrics.test.ts
git commit -m "feat: focus dashboard on daily return"
```

### Task 4: Release verification

**Files:**
- Modify: `docs/superpowers/specs/2026-08-09-daily-return-loop-design.md`
- Modify: `docs/superpowers/plans/2026-08-09-daily-return-loop.md`

- [ ] **Step 1: Run quality gates**

Run: `npm test && npm run build && npm run lint`

Expected: tests and build pass; lint may retain documented legacy warnings but no new error.

- [ ] **Step 2: Run browser checks**

Run: `npx playwright test e2e/echBuriExperience.spec.ts`

Expected: PASS including 320px no-overflow coverage and daily focus.

- [ ] **Step 3: Commit documentation and push**

```bash
git add docs/superpowers/specs/2026-08-09-daily-return-loop-design.md docs/superpowers/plans/2026-08-09-daily-return-loop.md
git commit -m "docs: add daily return delivery plan"
git push origin main
```
