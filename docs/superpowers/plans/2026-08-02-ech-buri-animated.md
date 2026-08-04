# Ech Buri Animated SVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight, original Ech Buri SVG mascot with accessible Motion interactions to the landing hero and dashboard.

**Architecture:** `EchBuriAnimated.tsx` owns the flat SVG anatomy and animation variants. Page components own placement only, while the existing app preference controls whether animation can run.

**Tech Stack:** React 19, TypeScript, `motion/react`, Tailwind CSS 4, Node test runner.

## Global Constraints

- Use solid SVG fills and strokes only; no raster assets, gradients, filters, GIFs, or new dependencies.
- Preserve `prefers-reduced-motion` and the existing `mascotAnimation` setting.
- Animate only transform and opacity; use `will-change: transform` when motion runs.
- Keep changes scoped to the component, landing hero, dashboard, and its test.

---

### Task 1: Specify the animated SVG contract

**Files:**
- Create: `test/ui/echBuriAnimated.test.ts`
- Create: `src/components/mascot/EchBuriAnimated.tsx`

**Interfaces:**
- Produces: `EchBuriAnimated`, `EchBuriAnimationState`, and `EchBuriAnimatedProps`.

- [x] **Step 1: Write the failing test**

```ts
test('EchBuriAnimated exposes idle and success vector states with motion safeguards', () => {
  const source = readFileSync(componentPath, 'utf8');
  assert.match(source, /'idle' \| 'success'/);
  assert.match(source, /useReducedMotion/);
  assert.match(source, /willChange/);
  assert.doesNotMatch(source, /linearGradient|radialGradient|<img/);
});
```

- [x] **Step 2: Run the test to verify it fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

- [x] **Step 3: Write the minimal implementation**

```tsx
export type EchBuriAnimationState = 'idle' | 'success';

export function EchBuriAnimated({ size = 120, state = 'idle', animate = true, className }: EchBuriAnimatedProps) {
  const reducedMotion = useReducedMotion();
  const motionEnabled = animate && !reducedMotion && useAppStore.getState().mascotAnimation;
  return <motion.div style={{ width: size, height: size, willChange: motionEnabled ? 'transform' : 'auto' }} />;
}
```

Replace the placeholder `motion.div` with the specified flat SVG body, eyes, book, arm, and `state === 'success'` confetti before running the test.

- [x] **Step 4: Run the test to verify it passes**

Run: `node --test test/ui/echBuriAnimated.test.ts`

### Task 2: Place the mascot on the two requested pages

**Files:**
- Modify: `src/components/landing/CinematicHero.tsx`
- Modify: `src/pages/app/DashboardPage.tsx`

**Interfaces:**
- Consumes: `EchBuriAnimated` from Task 1.

- [x] **Step 1: Write the failing integration assertions**

```ts
assert.match(heroSource, /EchBuriAnimated/);
assert.match(dashboardSource, /EchBuriAnimated/);
assert.doesNotMatch(heroSource, /<Mascot expression="happy"/);
```

- [x] **Step 2: Run the test to verify it fails**

Run: `node --test test/ui/echBuriAnimated.test.ts`

- [x] **Step 3: Write the minimal integration**

```tsx
// CinematicHero.tsx
import { EchBuriAnimated } from '../mascot/EchBuriAnimated';
// replace the current happy Mascot call
<EchBuriAnimated size={240} />

// DashboardPage.tsx
import { EchBuriAnimated } from '../../components/mascot/EchBuriAnimated';
// study plan card and encouragement banner
<EchBuriAnimated size={64} />
<EchBuriAnimated size={44} />
```

Keep all controls, text, links, and layout grids unchanged.

- [x] **Step 4: Run the test to verify it passes**

Run: `node --test test/ui/echBuriAnimated.test.ts`

### Task 3: Verify the delivered UI

**Files:**
- Verify: `src/components/mascot/EchBuriAnimated.tsx`
- Verify: `src/components/landing/CinematicHero.tsx`
- Verify: `src/pages/app/DashboardPage.tsx`

- [x] **Step 1: Run type safety**

Run: `npx.cmd tsc --noEmit`

- [x] **Step 2: Run unit tests**

Run: `npm.cmd run test`

- [x] **Step 3: Run production build**

Run: `npm.cmd run build`
