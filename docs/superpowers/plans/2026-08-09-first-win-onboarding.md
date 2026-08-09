# First-win onboarding implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an end-to-end first-win flow from a public CTA to an authenticated starter lesson with saved progress.

**Architecture:** A public intent page owns the pre-auth draft. A small persistence service owns owner-scoped `first_win_progress` data. An authenticated lesson page consumes the saved goal and real vocabulary, saves completion idempotently, and records the existing daily mission event.

**Tech Stack:** React 19, TypeScript, React Router, Motion, Tailwind CSS, Supabase, Node test runner, Playwright.

## Global Constraints

- Persist `goal`, `target_language`, `started_at`, and `completed_at` with one owner-only row per user.
- Use explicit authenticated grants and RLS ownership policies; never expose a service key.
- Use `vocabularyService.getVocabularyForLanguage()` for task content and never make unsupported AI claims.
- Preserve `/register`, existing onboarding, existing lesson routes, and responsive accessibility.

---

### Task 1: First-win persistence contract

**Files:**
- Create: `src/services/firstWinService.ts`
- Create: `supabase/migrations/<generated>_create_first_win_progress.sql`
- Modify: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Produces `FirstWinGoal`, `FirstWinProgress`, `saveFirstWinStart`, `completeFirstWin`, `getFirstWinProgress`, `writeFirstWinDraft`, and `readFirstWinDraft`.
- Consumes `supabase`, `isSupabaseConfigured`, and `localDb`.

- [ ] **Step 1: Write a failing source contract test**

```ts
test('first-win progress uses an owner-scoped persistence service', async () => {
  const service = await source('src/services/firstWinService.ts');
  assert.match(service, /export type FirstWinGoal = 'habit' \| 'speaking' \| 'ielts'/);
  assert.match(service, /supabase\.auth\.getSession\(\)/);
  assert.match(service, /session\.user\.id !== userId/);
  assert.match(service, /first_win_progress/);
});
```

- [ ] **Step 2: Run the focused test and observe the missing-file failure**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because `src/services/firstWinService.ts` does not exist.

- [ ] **Step 3: Create service and migration**

Implement local fallback plus matching-session remote reads/writes. Create the migration with `supabase migration new create_first_win_progress`, then use `user_id` as the primary key, explicit authenticated grants, revoked anon access, RLS, and owner policies.

- [ ] **Step 4: Run focused test and database query**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Run read-only SQL: select `to_regclass('public.first_win_progress')` and verify `relrowsecurity`.

Expected: PASS and a table with RLS enabled.

### Task 2: Guest handoff and registration preservation

**Files:**
- Create: `src/pages/public/FirstWinStartPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/landing/CinematicHero.tsx`
- Modify: `src/pages/public/LandingPage.tsx`
- Modify: `src/pages/auth/RegisterPage.tsx`
- Modify: `e2e/echBuriExperience.spec.ts`

**Interfaces:**
- Consumes `writeFirstWinDraft({ goal, targetLanguage })` and the URL query values `activation`, `goal`, and `lang`.
- Produces the public `/first-win` route and post-registration `/app/first-win?goal=<goal>` handoff.

- [ ] **Step 1: Write a failing browser test**

```ts
test('first-win CTA opens a goal selector before registration', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: /Bắt đầu 8 phút đầu tiên/i }).first().click();
  await expect(page).toHaveURL(/\/first-win$/);
  await expect(page.getByRole('heading', { name: /Mục tiêu 8 phút đầu tiên/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Tiếp tục tạo tài khoản/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and observe failure**

Run: `npx playwright test e2e/echBuriExperience.spec.ts --grep "goal selector"`

Expected: FAIL because the current CTA goes directly to registration.

- [ ] **Step 3: Implement route and handoff**

Use semantic radio groups for three goals and the existing `languages` data for language selection. Set the landing links to `/first-win` for guests and `/app/first-win` for authenticated users. Parse query values defensively in registration, preselect the valid language, and redirect an activation signup to the authenticated page.

- [ ] **Step 4: Run focused browser test**

Run: `npx playwright test e2e/echBuriExperience.spec.ts --grep "goal selector"`

Expected: PASS.

### Task 3: Authenticated starter lesson and completion

**Files:**
- Create: `src/pages/app/onboarding/FirstWinPage.tsx`
- Modify: `src/App.tsx`
- Modify: `test/ui/missionProgress.test.ts`
- Modify: `e2e/echBuriExperience.spec.ts`

**Interfaces:**
- Consumes `FirstWinProgress`, the draft, `vocabularyService`, and `recordActivityCompletion({ userId, activityType: 'lesson' })`.
- Produces `/app/first-win`, a three-item selection lesson, durable completion, and a next lesson link.

- [ ] **Step 1: Write failing tests**

```ts
test('first-win completion persists once and advances the lesson mission once', async () => {
  const page = await source('src/pages/app/onboarding/FirstWinPage.tsx');
  assert.match(page, /completeFirstWin/);
  assert.match(page, /recordActivityCompletion/);
  assert.match(page, /activityType: 'lesson'/);
});
```

- [ ] **Step 2: Run test and observe missing page failure**

Run: `node --test test/ui/missionProgress.test.ts`

Expected: FAIL because the new page does not exist.

- [ ] **Step 3: Implement the lesson**

Load the first three entries from the selected target-language vocabulary. Render one answer choice per task from the real entry fields; require all three answers before completion. Save the start when the lesson opens, make completion idempotent using `completedAt`, then record the existing lesson mission event once.

- [ ] **Step 4: Run focused unit and browser tests**

Run: `node --test test/ui/missionProgress.test.ts`

Run: `npx playwright test e2e/echBuriExperience.spec.ts`

Expected: PASS for persistence wiring, mascot contracts, CTA, and responsive layouts.

### Task 4: Release verification

**Files:**
- Modify: `docs/superpowers/specs/2026-08-09-first-win-onboarding-design.md`
- Modify: `docs/superpowers/plans/2026-08-09-first-win-onboarding.md`

- [ ] **Step 1: Run full quality gates**

Run: `npm run lint && npm test && npm run build && npm run verify:phase18`

Expected: commands exit successfully; known repository warnings do not become new failures.

- [ ] **Step 2: Deploy and verify production**

Run: `git push origin main`; load `/first-win` and `/` in an isolated browser; confirm the CTA, goal selector, no horizontal overflow, and no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/firstWinService.ts src/pages/public/FirstWinStartPage.tsx src/pages/app/onboarding/FirstWinPage.tsx src/App.tsx src/components/landing/CinematicHero.tsx src/pages/public/LandingPage.tsx src/pages/auth/RegisterPage.tsx test/ui/echBuriAnimated.test.ts test/ui/missionProgress.test.ts e2e/echBuriExperience.spec.ts supabase/migrations docs/superpowers
git commit -m "feat: add first-win onboarding flow"
```
