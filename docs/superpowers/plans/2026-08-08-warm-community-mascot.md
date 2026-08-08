# Warm Community Mascot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Ech Buri a responsive, accessible lesson companion and enable the selected warm community direction without changing learning logic.

**Architecture:** The existing `EchBuriAnimated` SVG remains the only renderer. `LessonPlayerPage` maps already-owned answer state to its public animation states, while the persisted app store supplies the default preference. No server state or additional animation library is introduced.

**Tech Stack:** React 19, TypeScript, Motion, Zustand, Tailwind CSS, Node test runner.

## Global Constraints

- Preserve the learner's persisted animation choice; enable only the new-install default.
- Respect `prefers-reduced-motion` in every state.
- Animate only `transform` and `opacity`.
- Keep visible Vietnamese feedback text for every animation state.
- Do not introduce visual assets or choreography copied from competitors.

---

### Task 1: Protect the mascot preference and state contract

**Files:**
- Modify: `test/ui/echBuriAnimated.test.ts`
- Modify: `src/stores/appStore.ts`
- Modify: `src/components/mascot/EchBuriAnimated.tsx`

**Interfaces:**
- Consumes: `EchBuriAnimationState`, persisted `mascotAnimation` setting.
- Produces: an enabled default for new installations while a saved `false` continues to prevent motion.

- [ ] **Step 1: Write the failing test**

```ts
test('new installs enable the companion while reduced motion remains a hard stop', async () => {
  const [store, component] = await Promise.all([
    source('src/stores/appStore.ts'),
    source(componentPath),
  ]);
  assert.match(store, /mascotAnimation: true/);
  assert.match(component, /motionEnabled = animate && !reducedMotion && mascotAnimation/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because the app-store default is currently `false`.

- [ ] **Step 3: Write minimal implementation**

```ts
mascotAnimation: true,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: PASS.

### Task 2: Make lesson feedback consume the shared emotional states

**Files:**
- Modify: `test/ui/echBuriAnimated.test.ts`
- Modify: `src/pages/app/LessonPlayerPage.tsx`

**Interfaces:**
- Consumes: `selected`, `userInput`, `showResult`, `isCorrect` from the lesson player.
- Produces: `idle`, `thinking`, `success`, and `incorrect` states at the lesson feedback header and result panel.

- [ ] **Step 1: Write the failing test**

```ts
test('the lesson player maps answer progress and outcomes to the shared mascot states', async () => {
  const lesson = await source('src/pages/app/LessonPlayerPage.tsx');
  assert.match(lesson, /showResult[\s\S]*isCorrect[\s\S]*'success'[\s\S]*'incorrect'/);
  assert.match(lesson, /selected \|\| userInput[\s\S]*'thinking'/);
  assert.match(lesson, /state=\{mascotState\}/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: FAIL because the page duplicates state mapping inline and the result panel renders a separate mascot expression.

- [ ] **Step 3: Write minimal implementation**

```ts
const mascotState = showResult
  ? (isCorrect ? 'success' : 'incorrect')
  : selected || userInput ? 'thinking' : 'idle';
```

Pass `mascotState` to both lesson mascots, mapping success/incorrect back to the presentation component's existing expressions only when required.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: PASS.

### Task 3: Validate the learning flow and responsive visual states

**Files:**
- Verify: `src/pages/app/LessonPlayerPage.tsx`
- Verify: `src/components/mascot/EchBuriAnimated.tsx`

- [ ] **Step 1: Run focused automated tests**

Run: `node --test test/ui/echBuriAnimated.test.ts`

Expected: PASS with no failed subtests.

- [ ] **Step 2: Build the application**

Run: `npm.cmd run build`

Expected: exit code 0.

- [ ] **Step 3: Inspect visual evidence**

Open the lesson player at 375px and 1440px. Verify idle, answer-composed, correct, incorrect, and reduced-motion states; verify that the feedback copy remains visible and no horizontal scrollbar is introduced.

- [ ] **Step 4: Commit**

Run: `git add docs/superpowers/specs/2026-08-08-warm-community-mascot-design.md docs/superpowers/plans/2026-08-08-warm-community-mascot.md test/ui/echBuriAnimated.test.ts src/stores/appStore.ts src/pages/app/LessonPlayerPage.tsx` then `git commit -m "feat: animate Ech Buri lesson feedback"`.
