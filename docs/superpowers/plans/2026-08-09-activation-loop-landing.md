# Activation-loop landing implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public landing page communicate an eight-minute first win and the daily return loop without changing the learning backend.

**Architecture:** `CinematicHero` owns the focused public promise, calls to action, and the Buri-led first lesson card. `LandingPage` owns the activation strip inserted ahead of broad feature marketing. Tests lock the public language and routes so the old design-selection message cannot return.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Motion, Node test runner, Playwright.

## Global Constraints

- Preserve `/register`, `/app`, `/app/study-groups`, accessible navigation, and reduced-motion support.
- Do not invent learner counts, testimonials, completion rates, prices, or automatic AI assessment claims.
- Use existing EchLearn cream, ink, emerald, and orange visual tokens; use `EchBuriAnimated` with its public prop API.
- Keep the landing free of horizontal overflow at 320px, 768px, 1024px, and 1440px.

---

### Task 1: Lock the product message with regression tests

**Files:**
- Modify: `test/ui/echBuriAnimated.test.ts`
- Test: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Consumes: source text from `src/components/landing/CinematicHero.tsx` and `src/pages/public/LandingPage.tsx`.
- Produces: a source-level contract for first-win CTA language and activation-loop content.

- [ ] **Step 1: Write the failing test**

```ts
test('landing presents a concrete eight-minute first win instead of a design direction', async () => {
  const [hero, landing] = await Promise.all([
    source('src/components/landing/CinematicHero.tsx'),
    source('src/pages/public/LandingPage.tsx'),
  ]);

  assert.match(hero, /Mỗi ngày 8 phút, tiếng Anh tiến một bước/);
  assert.match(hero, /Bắt đầu 8 phút đầu tiên/);
  assert.doesNotMatch(hero, /Năng lượng cộng đồng|Chọn hướng này/);
  assert.match(landing, /Chọn mục tiêu/);
  assert.match(landing, /Hoàn thành 8 phút/);
  assert.match(landing, /Nhận bước tiếp theo cho ngày mai/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because the current hero exposes the design-direction copy and has no activation strip.

- [ ] **Step 3: Implement the minimal landing copy and structure**

Replace the hero direction bar with a compact truthful product signal. Update the primary and secondary CTAs, hero challenge card, and add a semantic three-step ordered list after the statistics section in `LandingPage.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: PASS with no source-contract regression.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/CinematicHero.tsx src/pages/public/LandingPage.tsx test/ui/echBuriAnimated.test.ts
git commit -m "feat: focus landing on the daily activation loop"
```

### Task 2: Verify browser behavior and responsive accessibility

**Files:**
- Modify: `e2e/echBuriExperience.spec.ts`
- Test: `e2e/echBuriExperience.spec.ts`

**Interfaces:**
- Consumes: hero copy and the activation strip rendered by `CinematicHero` and `LandingPage`.
- Produces: browser coverage for the landing promise, primary CTA destination, Buri state, and responsive layout.

- [ ] **Step 1: Write the failing browser test**

```ts
test('landing makes the eight-minute first win the primary public action', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Mỗi ngày 8 phút/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Bắt đầu 8 phút đầu tiên/i }).first()).toHaveAttribute('href', '/register');
  await expect(page.getByRole('list', { name: /Lộ trình ngày đầu tiên/i })).toBeVisible();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test e2e/echBuriExperience.spec.ts --grep "eight-minute first win"`

Expected: FAIL because the current page lacks the required heading, CTA label, and named list.

- [ ] **Step 3: Add semantic labels required by the browser contract**

Use a visible `h2` in the activation strip and `aria-label="Lộ trình ngày đầu tiên"` on its ordered list. Keep all interactions as native links.

- [ ] **Step 4: Run focused browser verification**

Run: `npx playwright test e2e/echBuriExperience.spec.ts`

Expected: PASS for the existing Buri states plus the new activation action at all audited viewports.

- [ ] **Step 5: Commit**

```bash
git add e2e/echBuriExperience.spec.ts
git commit -m "test: cover landing activation loop"
```

### Task 3: Release verification

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: final landing implementation, public routes, and production deployment.
- Produces: validated build and browser result.

- [ ] **Step 1: Run quality gates**

Run: `npm run lint && node --test test/ui/echBuriAnimated.test.ts && npm run build`

Expected: commands exit successfully; existing repository-wide non-blocking lint warnings are recorded separately from failures.

- [ ] **Step 2: Run route and public landing smoke checks**

Run: `npm run verify:phase18 && npx playwright test e2e/echBuriExperience.spec.ts`

Expected: registration, route, Buri, and responsive contracts pass.

- [ ] **Step 3: Push and verify production**

Run: `git push origin main`, then load `https://echlearn.dpdns.org/` at desktop and mobile widths, checking for console errors, overflow, the first-win CTA, and the Buri welcome pose.

- [ ] **Step 4: Commit remaining docs**

```bash
git add docs/superpowers/specs/2026-08-09-activation-loop-design.md docs/superpowers/plans/2026-08-09-activation-loop-landing.md
git commit -m "docs: define EchLearn activation-loop landing"
```
