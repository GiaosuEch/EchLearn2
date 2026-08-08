# EchLearn Community Design Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved community-first sample the coherent visual language of EchLearn while retaining working learning and account flows.

**Architecture:** Put shared colors, surfaces, buttons and card elevation in global semantic tokens; rebuild the public composition around a dedicated hero and official mascot; then apply the same primitives to the authenticated shell, dashboard and lesson feedback.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Motion, Playwright, Node test runner.

## Global Constraints

- Keep existing routes, learner data and entitlement logic unchanged.
- Official Buri uses vector SVG only and respects learner/system reduced motion.
- Verify at 320px, 768px, 1024px and 1440px with no horizontal overflow.
- Commit each green slice separately; do not stage `.claude/` or generated audit screenshots.

---

### Task 1: Establish Community Tokens

**Files:**
- Modify: `src/index.css`
- Test: `e2e/echBuriExperience.spec.ts`

- [ ] Add the warm cream, ink, green and coral semantic token values.
- [ ] Add reusable `ech-community-*` surface, button and card styles with reduced-motion handling.
- [ ] Add a viewport regression assertion for the public landing.
- [ ] Run `npx playwright test e2e/echBuriExperience.spec.ts` and commit `feat: add community visual tokens`.

### Task 2: Replace the Official Buri Artwork

**Files:**
- Modify: `src/components/mascot/EchBuriAnimated.tsx`
- Test: `test/ui/echBuriAnimated.test.ts`, `e2e/echBuriExperience.spec.ts`

- [ ] Extend the mascot test to require its simple silhouette and retain all interaction states.
- [ ] Replace the old outlined torso artwork with the approved rounded frog, yellow book and optional presentation backdrop.
- [ ] Verify the test fails before implementation, then passes after implementation.
- [ ] Run targeted browser coverage and commit `feat: redesign official Ech Buri`.

### Task 3: Rebuild the Public Landing Composition

**Files:**
- Modify: `src/components/landing/CinematicHero.tsx`
- Modify: `src/pages/public/LandingPage.tsx`
- Modify: `src/components/layout/PublicLayout.tsx`
- Test: `e2e/echBuriExperience.spec.ts`

- [ ] Add the direction strip, compact nav, editorial hero and community challenge card.
- [ ] Restyle public sections using shared community surfaces instead of generic glass/bento surfaces.
- [ ] Assert the visible hero and welcome mascot on mobile and desktop.
- [ ] Run targeted browser coverage and commit `feat: rebuild community landing experience`.

### Task 4: Apply the System to Learner Surfaces

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`
- Modify: `src/components/layout/SidebarNav.tsx`
- Modify: `src/components/layout/TopBar.tsx`
- Modify: `src/pages/app/DashboardPage.tsx`
- Modify: `src/pages/app/LessonPlayerPage.tsx`
- Test: `e2e/appRoutesRuntimeAudit.spec.ts`, `e2e/echBuriExperience.spec.ts`

- [ ] Use community canvas/tokens in the app shell without reducing navigation clarity.
- [ ] Recompose dashboard as a daily action and community progress surface.
- [ ] Use the shared mascot and feedback palette in the lesson flow.
- [ ] Run targeted browser tests and commit `feat: unify learner surfaces`.

### Task 5: Final Regression and Release

**Files:**
- Verify only; no product files unless a regression is found.

- [ ] Run `npm run lint`, `npm test`, `npm run build` and `npx playwright test`.
- [ ] Restore generated audit proof artifacts and `.last-run.json`.
- [ ] Inspect the staged diff and push the verified commits to `origin/main`.
