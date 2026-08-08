# Ech Buri Signature Mascot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved simple Ech Buri concept the canonical interactive mascot across EchLearn while retaining user-selected skins as optional costumes.

**Architecture:** `EchBuriAnimated` owns the official SVG anatomy and state motion. `Mascot` and `EchBuriPresence` map existing expressions and moods into those canonical states, so existing pages inherit one character without a new global event store. Explicit `skinId` remains an opt-in costume path.

**Tech Stack:** React 19, TypeScript, Motion (`motion/react`), Tailwind CSS, Zustand, Node test runner, Playwright.

## Global Constraints

- Use the approved green frog, large eyes, rounded silhouette, understated smile, and yellow book; do not use default glasses, tie, costume, gradient, raster asset, Lottie, or a new dependency.
- Animate only `transform` and `opacity`; honor both `mascotAnimation` and `prefers-reduced-motion`.
- Keep text and semantic controls as the source of learning feedback; the mascot is never the sole signal.
- Preserve explicit `skinId` rendering for wardrobes and profiles; skins are costumes, never a replacement mascot.
- Verify 320px, 768px, 1024px, and 1440px layouts without horizontal overflow.

---

### Task 1: Create the canonical Ech Buri state renderer

**Files:**
- Modify: `src/components/mascot/EchBuriAnimated.tsx`
- Modify: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Produces: `type EchBuriAnimationState = 'idle' | 'welcome' | 'thinking' | 'listening' | 'success' | 'incorrect' | 'cheering'`.
- Preserves: `EchBuriAnimated({ size, state, animate, className })`.
- Consumes: the app animation preference and `useReducedMotion()`.

- [ ] **Step 1: Write the failing source contract**

Add these checks to `test/ui/echBuriAnimated.test.ts`:

```ts
test('the canonical Ech Buri exposes the approved interactive states', async () => {
  const component = await source(componentPath);
  assert.match(component, /'idle' \| 'welcome' \| 'thinking' \| 'listening' \| 'success' \| 'incorrect' \| 'cheering'/);
  assert.match(component, /const BOOK_COVER = '#F4B41A'/);
  assert.doesNotMatch(component, /Thick Dark Green Spectacles|Red Necktie/);
});
```

- [ ] **Step 2: Verify the contract fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because the current union and default anatomy still contain legacy elements.

- [ ] **Step 3: Implement the minimal renderer change**

Replace glasses/tie SVG branches with a compact frog face and yellow book. Extend the state union and use this body variant structure:

```ts
const bodyVariants: Variants = {
  idle: { y: [0, -2, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
  welcome: { rotate: [0, -5, 5, 0], transition: { duration: 0.62, ease: 'easeInOut' } },
  thinking: { y: [0, -3, 0], rotate: [0, 5, 3], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } },
  listening: { rotate: [0, -3, -3, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  success: { y: [0, -14, 0], transition: { duration: 0.72, ease: 'easeInOut' } },
  incorrect: { x: [0, -4, 4, 0], transition: { duration: 0.38, ease: 'easeInOut' } },
  cheering: { y: [0, -20, -6, 0], rotate: [0, -6, 6, 0], transition: { duration: 0.8, ease: 'easeInOut' } },
};
```

Render a one-shot raised arm for `welcome`, an attentive lean for `listening`, and flat particles for `success`/`cheering`. Keep `motionEnabled = animate && !reducedMotion && mascotAnimation` unchanged.

- [ ] **Step 4: Verify the component**

Run: `node --test test/ui/echBuriAnimated.test.ts; npm.cmd run build`

Expected: PASS and a clean TypeScript production build.

- [ ] **Step 5: Commit the slice**

Run: `git add src/components/mascot/EchBuriAnimated.tsx test/ui/echBuriAnimated.test.ts; git commit -m "feat: introduce signature Ech Buri states"`

### Task 2: Normalize legacy mascot calls and wardrobe behavior

**Files:**
- Modify: `src/components/mascot/Mascot.tsx`
- Modify: `src/components/atelier/EchBuriPresence.tsx`
- Modify: `src/pages/app/customization/CustomizationPage.tsx`
- Modify: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Produces: `toEchBuriState(expression?: MascotExpression, action?: MascotAction): EchBuriAnimationState` from `Mascot.tsx`.
- Produces: `stateByMood: Record<EchBuriMood, EchBuriAnimationState>` in `EchBuriPresence.tsx`.

- [ ] **Step 1: Write failing mapping contracts**

```ts
test('legacy mascot callers resolve into signature states while skins stay opt-in', async () => {
  const [mascot, presence] = await Promise.all([
    source('src/components/mascot/Mascot.tsx'),
    source('src/components/atelier/EchBuriPresence.tsx'),
  ]);
  assert.match(mascot, /export function toEchBuriState/);
  assert.match(mascot, /action === 'wave' \? 'welcome'/);
  assert.match(mascot, /action === 'listening' \? 'listening'/);
  assert.match(mascot, /Boolean\(_skinId\)/);
  assert.match(presence, /welcome: 'welcome'/);
  assert.match(presence, /celebration: 'cheering'/);
});
```

- [ ] **Step 2: Verify the contracts fail**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because the shared mapper and direct mood-state map do not exist.

- [ ] **Step 3: Implement one mapping path**

Add this function to `Mascot.tsx` and use it in both `VectorFrogMascot` and `Mascot`:

```ts
export function toEchBuriState(expression: MascotExpression = 'happy', action?: MascotAction): EchBuriAnimationState {
  if (action === 'wave') return 'welcome';
  if (action === 'listening' || action === 'speaking') return 'listening';
  if (action === 'celebrating') return 'cheering';
  if (expression === 'thinking') return 'thinking';
  if (expression === 'sad') return 'incorrect';
  if (expression === 'surprised' || expression === 'encouraging') return 'success';
  return 'idle';
}
```

Replace `expressionByMood` with direct `stateByMood` in `EchBuriPresence`. Keep `Boolean(_skinId)` as the only path to `MascotSkinRenderer`, and update customization copy to call the catalogue “trang phục” rather than different mascot identities.

- [ ] **Step 4: Verify adapters and customization**

Run: `node --test test/ui/echBuriAnimated.test.ts; npx.cmd playwright test e2e/appRoutesRuntimeAudit.spec.ts --reporter=line`

Expected: PASS; the wardrobe still renders without errors, duplicate IDs, or mobile overflow.

- [ ] **Step 5: Commit the slice**

Run: `git add src/components/mascot/Mascot.tsx src/components/atelier/EchBuriPresence.tsx src/pages/app/customization/CustomizationPage.tsx test/ui/echBuriAnimated.test.ts; git commit -m "refactor: unify Ech Buri mascot mapping"`

### Task 3: Place stateful Ech Buri in core learning moments

**Files:**
- Modify: `src/components/landing/CinematicHero.tsx`
- Modify: `src/pages/app/DashboardPage.tsx`
- Modify: `src/pages/app/LessonPlayerPage.tsx`
- Modify: `src/components/lessons/LessonCompletionScreen.tsx`
- Modify: `src/pages/app/gamification/StreakCalendarPage.tsx`
- Modify: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Consumes: the Task 1 state union and Task 2 mapping.
- Produces: one visible mascot state derived only from existing page data.

- [ ] **Step 1: Write failing placement contracts**

```ts
test('high-frequency learner moments use the signature mascot states', async () => {
  const [hero, dashboard, lesson, completion, streak] = await Promise.all([
    source('src/components/landing/CinematicHero.tsx'), source('src/pages/app/DashboardPage.tsx'),
    source('src/pages/app/LessonPlayerPage.tsx'), source('src/components/lessons/LessonCompletionScreen.tsx'),
    source('src/pages/app/gamification/StreakCalendarPage.tsx'),
  ]);
  assert.match(hero, /state="welcome"/);
  assert.match(dashboard, /state="welcome"/);
  assert.match(lesson, /state=\{mascotState\}/);
  assert.match(completion, /state=\{accuracy >= 80 \? 'cheering' : 'success'\}/);
  assert.match(streak, /state=\{missingDays\.length > 0 \? 'incorrect' : 'cheering'\}/);
});
```

- [ ] **Step 2: Verify the placement contract fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL until each required surface uses an explicit canonical state.

- [ ] **Step 3: Integrate without a floating global widget**

Use `welcome` in the existing landing and dashboard stages, retain lesson `mascotState` and extend it to `listening` during audio exercises, use `accuracy >= 80 ? 'cheering' : 'success'` in completion, and use `missingDays.length > 0 ? 'incorrect' : 'cheering'` in streak. Preserve existing written feedback, result controls, and responsive layouts.

- [ ] **Step 4: Verify the integrated surfaces**

Run: `node --test test/ui/echBuriAnimated.test.ts; npx.cmd playwright test e2e/appRoutesRuntimeAudit.spec.ts --reporter=line; npm.cmd run build`

Expected: PASS with no console/page error or horizontal overflow.

- [ ] **Step 5: Commit the slice**

Run: `git add src/components/landing/CinematicHero.tsx src/pages/app/DashboardPage.tsx src/pages/app/LessonPlayerPage.tsx src/components/lessons/LessonCompletionScreen.tsx src/pages/app/gamification/StreakCalendarPage.tsx test/ui/echBuriAnimated.test.ts; git commit -m "feat: bring Ech Buri motion into learning moments"`

### Task 4: Protect the experience with browser regression coverage

**Files:**
- Modify: `e2e/appRoutesRuntimeAudit.spec.ts`
- Modify: `test/ui/echBuriAnimated.test.ts`

**Interfaces:**
- Consumes: a mascot `role="img"` root and the persisted `mascotAnimation` preference.
- Produces: coverage for the landing, dashboard, lesson, and streak surfaces.

- [ ] **Step 1: Write a failing responsive browser audit**

Add a serial Playwright case covering `/`, `/app/dashboard`, `/app/lesson?lang=en`, and `/app/calendar` at `320x844`, `768x1024`, `1024x900`, and `1440x900`. Assert a visible mascot `role="img"`, `document.documentElement.scrollWidth <= window.innerWidth`, no `[role="alert"]`, and no page/console error.

- [ ] **Step 2: Verify the browser audit fails before all required placements exist**

Run: `npx.cmd playwright test e2e/appRoutesRuntimeAudit.spec.ts --reporter=line`

Expected: FAIL until all four required routes expose the canonical mascot.

- [ ] **Step 3: Add static rendering coverage**

Seed the test user setting with `mascotAnimation: false`, reload the dashboard, and assert the mascot stays visible with no browser error. Keep the source contract for `motionEnabled = animate && !reducedMotion && mascotAnimation`.

- [ ] **Step 4: Run release verification**

Run: `npm.cmd run lint; npm.cmd test; npx.cmd playwright test --reporter=line; npm.cmd run build`

Expected: all checks pass; do not stage generated test screenshots or `.claude/`.

- [ ] **Step 5: Commit and deploy**

Run: `git add e2e/appRoutesRuntimeAudit.spec.ts test/ui/echBuriAnimated.test.ts; git commit -m "test: protect signature Ech Buri experience"; git push origin main`

Verify: `Invoke-WebRequest https://echlearn.dpdns.org/` returns HTTP 200.

## Self-review

- **Spec coverage:** Tasks 1–2 deliver the visual baseline, motion guards, one official mascot, and optional costumes. Task 3 covers high-frequency learning surfaces. Task 4 covers browser, responsive, reduced-motion, runtime, and deployment verification.
- **Placeholder scan:** No unresolved placeholder or unbounded implementation instruction remains.
- **Type consistency:** `EchBuriAnimationState` is introduced in Task 1 and is the exact type consumed by Tasks 2–4; `toEchBuriState` is defined only in Task 2.
