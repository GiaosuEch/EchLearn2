# Course business, audio and Local AI retirement implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task.

**Goal:** Turn LingFrog into a lightweight, paid roadmap product: Free 90-day starter access for English, Chinese and Japanese; deterministic GO/PLUS/PRO entitlements; admin-controlled activation; curated learning content; reliable listening; and no Local AI product surface.

**Architecture:** Entitlements are a small policy/store layer, never a payment processor. The curriculum consumes a curated starter vocabulary bank before legacy imports. Listening renders a bounded page of tasks and accurately labels the audio engine. Local AI routes are removed at the router boundary first, then unused UI and service imports are deleted only after route smoke tests pass.

**Tech Stack:** React 19, React Router, Zustand, TypeScript, Tailwind, Node test runner, Playwright.

## Global Constraints

- Free allows one active 90-day roadmap selected from `en`, `zh`, `ja`.
- Only `user.role === 'admin'` may activate a trial or purchased plan; no payment integration is implied.
- GO: 180 days and one additional language; PLUS: 365 days and multiple languages; PRO: all languages and all roadmap durations.
- Never label browser TTS as native recorded audio.
- Never render all 120 listening tasks at once.
- Preserve ordinary progress/streak logic while retiring Local AI surfaces.

### Task 1: Curated first-90-day learning bank

**Files:**
- Create: `src/curriculum/curatedStarterVocabulary.ts`
- Modify: `src/curriculum/exerciseGenerator.ts`
- Test: `test/ui/curatedStarterVocabulary.test.ts`

- [ ] Write a failing test asserting that `getCuratedStarterVocabulary('en')`, `('zh')`, and `('ja')` contain Vietnamese definitions and that unsafe generic definitions are absent.
- [ ] Run `node --test test/ui/curatedStarterVocabulary.test.ts`; expect module-not-found.
- [ ] Implement a 90-day-safe starter bank and make `generateExercisesForModule` prefer it for the first module.
- [ ] Run the test; expect pass.

### Task 2: Entitlements, pricing and admin activation

**Files:**
- Create: `src/stores/entitlementStore.ts`, `src/services/entitlementService.ts`, `src/pages/app/admin/SubscriptionManagementPage.tsx`
- Modify: `src/pages/app/PricingPage.tsx`, `src/App.tsx`, `src/pages/app/LanguageSelectionPage.tsx`
- Test: `test/ui/entitlements.test.ts`

- [ ] Write failing entitlement tests for plan policy, language allowance, duration allowance, and admin-only activation.
- [ ] Run `node --test test/ui/entitlements.test.ts`; expect missing policy/store failures.
- [ ] Implement local deterministic plan activation and language access checks; add Pricing and admin activation routes.
- [ ] Run the test; expect pass.

### Task 3: Product-aligned 90-day roadmap

**Files:**
- Modify: `src/pages/app/CourseRoadmapPage.tsx`, `src/viewmodels/ninetyDayRoadmap.ts`
- Test: `test/ui/ninetyDayRoadmap.test.ts`

- [ ] Write a failing test that one active plan has exactly 90 days and is tied to a permitted language.
- [ ] Run `node --test test/ui/ninetyDayRoadmap.test.ts`; expect failure.
- [ ] Use the entitlement policy to guard roadmap language selection and show upgrade reasons without locking the free starter language.
- [ ] Run the test; expect pass.

### Task 4: Listening reliability and performance

**Files:**
- Modify: `src/pages/app/practice/ListeningPracticePage.tsx`, `src/components/audio/JapaneseLofiPlayer.tsx`
- Test: `test/ui/listening.test.ts`

- [ ] Write failing tests that only a bounded listening page renders, play/pause controls have accessible names, and TTS is disclosed.
- [ ] Run `node --test test/ui/listening.test.ts`; expect failure.
- [ ] Add pagination, audio-engine disclosure and focusable controls; suppress lofi while a listening task is open.
- [ ] Run the test; expect pass.

### Task 5: Retire Local AI and preserve normal learning

**Files:**
- Modify: `src/App.tsx`, `src/pages/index.ts`, `src/components/layout/AppLayout.tsx`, `src/pages/app/AllPages.tsx`
- Delete only after import audit: obsolete AI pages/components/services.
- Test: `e2e/app-smoke.spec.ts`, existing route smoke scripts.

- [ ] Write a failing route test that `/app/ai*` does not expose Local AI UI and core `/app/roadmap`, `/app/listening`, `/app/pricing`, `/app/admin/subscriptions` remain reachable when authorized.
- [ ] Run the test; expect Local AI routes to still exist.
- [ ] Remove Local AI router imports/routes/menu labels and then eliminate orphaned imports, retaining progress and ordinary lesson services.
- [ ] Run route smoke and TypeScript build; expect pass.

### Task 6: Full regression evidence

**Files:**
- Modify: `e2e/landing.smoke.spec.ts`, create `e2e/app-smoke.spec.ts`

- [ ] Add authenticated E2E coverage for Profile, roadmap, price page, admin authorization, listening pagination and audio controls.
- [ ] Run `npm.cmd run test:e2e` and `npm.cmd run build`.
- [ ] Use Playwright at desktop and mobile widths; record clean console and failed-network evidence.
