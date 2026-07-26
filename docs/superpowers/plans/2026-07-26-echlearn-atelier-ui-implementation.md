# Echlearn Atelier UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a coherent Echlearn Atelier system, a truthful cinematic landing page, and a focused study workspace without changing learning, authentication, localisation, or AI-runtime behaviour.

**Architecture:** One semantic token layer in src/index.css powers small presentational components. Those components are composed by the public shell, landing, app shell, and dashboard while existing stores, services, effects, callbacks, and routes remain owners of behaviour.

**Tech Stack:** React 19, TypeScript 6, React Router 8, Tailwind CSS 4, motion/react, Lucide React, Zustand, i18next, Node source-contract scripts.

## Global Constraints

- Preserve multilingual curriculum, public data, audio, migrations, consent, routes, auth/guest-user behaviour, stores, and service calls.
- The dirty working tree is user-owned: inspect the target diff before each edit; make narrow patches; never reset, checkout, mass-format, or overwrite unrelated work.
- Use original Ech Buri assets only; do not add or recreate Pepe the Frog imagery, name, facial construction, or trade dress without a verified licence.
- Keep AI and automated assessment explicitly unavailable-safe. Do not add a provider, SDK, endpoint, key, fake output, unsupported marketing claim, or “Local AI Qwen3” copy.
- Use deep ink, emerald, and restrained warm-gold tokens. Do not add neon, liquid glass, aurora, 3D tilt, shimmer, or perpetual decoration.
- Retain the 1024 px sidebar breakpoint in both Tailwind and JavaScript. Support 320/375, 768, 1024, and 1440 px.
- Use native controls, visible focus, semantic landmarks, clear labels, 44 px targets where practical, and non-colour state cues.
- Decorative media and mascot art must use empty alt text and aria-hidden; informative media gets concise alternative text.
- Landing must stay useful with no remote video/image dependency. Motion is finite, state-driven, and disabled by prefers-reduced-motion.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| src/index.css | Atelier semantic tokens, typography, focus, motion, and surfaces. |
| src/components/atelier/AtelierSurface.tsx | Semantic elevation wrapper. |
| src/components/atelier/SectionEyebrow.tsx | Consistent editorial label. |
| src/components/atelier/EchBuriPresence.tsx | Decorative, state-aware approved mascot wrapper. |
| src/components/landing/AtelierHero.tsx | Static-first hero, primary navigation, and CTA. |
| src/components/landing/LandingChapter.tsx | Five-story-chapter frame. |
| src/components/dashboard/LearningFocusCard.tsx | Presentational TodayPlan focus card. |
| src/components/dashboard/ProgressEvidence.tsx | Verified learner-stat display. |
| src/components/dashboard/NextStepList.tsx | Existing next-route links. |
| src/components/layout/PublicLayout.tsx | Accessible public shell/footer. |
| src/components/layout/AppLayout.tsx | Existing app orchestration plus shell semantics. |
| src/components/layout/TopBar.tsx | Accessible utility controls. |
| src/pages/public/LandingPage.tsx | Landing composition only. |
| src/pages/app/DashboardPage.tsx | Existing data/effects plus new presentation composition. |
| scripts/verify_atelier_ui_contract.cjs | No-dependency source contract for the redesign. |
| package.json | Adds verify:atelier-ui. |

## Task 1: Create the Atelier contract gate

**Files:**
- Create: scripts/verify_atelier_ui_contract.cjs
- Modify: package.json
- Test: scripts/verify_atelier_ui_contract.cjs

**Interfaces:**
- Consumes: existing source paths and verifier conventions.
- Produces: npm.cmd run verify:atelier-ui for every later task.

- [ ] **Step 1: Record the pre-edit boundary**

Run:

~~~powershell
git status --short
git diff --stat
git diff -- src/index.css src/pages/public/LandingPage.tsx src/components/layout/PublicLayout.tsx src/components/layout/AppLayout.tsx src/components/layout/TopBar.tsx src/pages/app/DashboardPage.tsx
~~~

Expected: user-owned changes are recorded before any Atelier edit.

- [ ] **Step 2: Write the failing contract**

Create Node helpers and initial assertions:

~~~js
const required = (source, token, file) => {
  if (!source.includes(token)) fail(file + ' missing ' + token);
};

required(read('src/index.css'), '--ech-canvas', 'src/index.css');
required(read('src/index.css'), '@media (prefers-reduced-motion: reduce)', 'src/index.css');
required(read('src/pages/public/LandingPage.tsx'), '<h1', 'LandingPage.tsx');
if (/Local AI Qwen3|chạy trực tiếp trên browser/i.test(read('src/pages/public/LandingPage.tsx'))) {
  fail('unsupported local-AI landing claim');
}
~~~

Also require a public skip link/main target; labelled public navigation and mobile menu; AppLayout main target; labelled TopBar controls; no cloudfront.net, figma.site, fetch(vid.url), or video dependency in the landing.

- [ ] **Step 3: Run RED**

Run: node scripts/verify_atelier_ui_contract.cjs

Expected: FAIL because current tokens, semantics, and landing do not satisfy the new contract.

- [ ] **Step 4: Add the focused script**

Add exactly:

~~~json
"verify:atelier-ui": "node scripts/verify_atelier_ui_contract.cjs"
~~~

Do not change verify:all yet.

- [ ] **Step 5: Commit**

~~~powershell
git add -- scripts/verify_atelier_ui_contract.cjs package.json
git commit -m "test: add Atelier UI contract gate"
~~~

## Task 2: Build semantic tokens and shared components

**Files:**
- Modify: src/index.css
- Create: src/components/atelier/AtelierSurface.tsx
- Create: src/components/atelier/SectionEyebrow.tsx
- Create: src/components/atelier/EchBuriPresence.tsx
- Test: scripts/verify_atelier_ui_contract.cjs

**Interfaces:**
- Consumes: current customisation CSS variables, project-owned mascot assets, and existing Mascot API.
- Produces: AtelierSurface({ tone, children, className }), SectionEyebrow({ children }), and EchBuriPresence({ mood, size, className }).

- [ ] **Step 1: Extend RED assertions**

Require the three components plus --ech-canvas, --ech-surface-1, --ech-surface-2, --ech-text, --ech-text-muted, --ech-action, --ech-achievement, and a focus-visible rule.

- [ ] **Step 2: Run RED**

Run: npm.cmd run verify:atelier-ui

Expected: FAIL on missing tokens/components.

- [ ] **Step 3: Implement the Atelier token layer**

Add one semantic block, mapping existing runtime settings instead of deleting them:

~~~css
:root {
  --ech-canvas: #07110c;
  --ech-surface-1: #0c1912;
  --ech-surface-2: #12241a;
  --ech-text: #f4faf5;
  --ech-text-muted: #a9bcae;
  --ech-action: #49c878;
  --ech-achievement: #d8b36a;
  --ech-ease: cubic-bezier(0.16, 1, 0.3, 1);
}
:where(a, button, input, select, textarea):focus-visible {
  outline: 2px solid var(--ech-action);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; scroll-behavior: auto !important; }
}
~~~

Remove only legacy effect definitions not referenced by changed pages. Preserve CSS used by untouched routes and map saved surface preferences to Atelier surfaces.

- [ ] **Step 4: Implement thin components**

~~~tsx
export function AtelierSurface({ tone = 'default', children, className = '' }: Props) {
  return <section className={'atelier-surface atelier-surface--' + tone + ' ' + className}>{children}</section>;
}
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="atelier-eyebrow">{children}</p>;
}
~~~

EchBuriPresence is decorative by default; parent UI renders encouragement as text, not image alternative text.

- [ ] **Step 5: Run GREEN and commit**

~~~powershell
npm.cmd run verify:atelier-ui
npm.cmd run lint
git add -- src/index.css src/components/atelier scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: establish Atelier design foundations"
~~~

## Task 3: Upgrade the public shell

**Files:**
- Modify: src/components/layout/PublicLayout.tsx
- Test: scripts/verify_atelier_ui_contract.cjs, scripts/verify_route_smoke.cjs, scripts/verify_no_fake_ai_claims.cjs

**Interfaces:**
- Consumes: React Router Outlet, all current public paths, Atelier components.
- Produces: main-content, a skip link, labelled nav, and exact honest-AI footer disclosures.

- [ ] **Step 1: Add RED checks**

Require href="#main-content", id="main-content", native mobile button with aria-expanded, and both exact limitation sentences already required by verify_no_fake_ai_claims.cjs.

- [ ] **Step 2: Run RED**

Run: npm.cmd run verify:atelier-ui

Expected: FAIL for current shell semantics.

- [ ] **Step 3: Implement public shell**

Keep every public route. Replace structural glass/neon presentation with Atelier classes. Offset content for a fixed nav. Give the mobile menu aria-controls, explicit close text, and route-change close behaviour. Preserve exact required AI limitation copy in the footer.

- [ ] **Step 4: Verify and commit**

~~~powershell
npm.cmd run verify:atelier-ui
node scripts/verify_route_smoke.cjs
node scripts/verify_no_fake_ai_claims.cjs
git add -- src/components/layout/PublicLayout.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: refine the Atelier public shell"
~~~

## Task 4: Build the five-chapter landing

**Files:**
- Create: src/components/landing/AtelierHero.tsx
- Create: src/components/landing/LandingChapter.tsx
- Modify: src/pages/public/LandingPage.tsx
- Test: scripts/verify_atelier_ui_contract.cjs and existing route/no-fake-claim scripts

**Interfaces:**
- Consumes: Link, Lucide, Atelier components, routes /register, /login, /languages, /ielts-program, and /community-preview.
- Produces: one h1, chapter anchors start/practice/evidence/remember/progress, and a static-first landing.

- [ ] **Step 1: Add RED landing checks**

Require one h1, aria-label="Primary navigation", all five anchors, and prohibit Local AI Qwen3, cloudfront.net, figma.site, fetch(vid.url), raw emoji navigation, and video.

- [ ] **Step 2: Run RED**

Run: npm.cmd run verify:atelier-ui

Expected: FAIL because the landing preloads remote videos and contains unsupported AI claims.

- [ ] **Step 3: Implement reusable landing structures**

Use this exact chapter interface:

~~~ts
type LandingChapterProps = {
  id: 'start' | 'practice' | 'evidence' | 'remember' | 'progress';
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: { label: string; to: string };
  index: number;
};
~~~

AtelierHero contains primary nav, concise learner promise, true CTA links, one static workspace composition, and EchBuriPresence. LandingChapter uses finite in-view opacity/translate reveal only.

- [ ] **Step 4: Compose product truth**

Rewrite LandingPage as the five chapters: Start, Practice, Evidence, Remember, Progress. Use only demonstrable capabilities: structured practice, language tracks, progress tracking, review cadence, and real community routes. Delete remote-video preloading, decorative clock, remote overlays/videos/images, unsupported statistics, and local-AI Qwen3 claims.

- [ ] **Step 5: Verify and commit**

~~~powershell
npm.cmd run verify:atelier-ui
node scripts/verify_route_smoke.cjs
node scripts/verify_no_blank_pages.cjs
node scripts/verify_no_empty_error_boxes.cjs
node scripts/verify_no_fake_ai_claims.cjs
npm.cmd run build
git add -- src/pages/public/LandingPage.tsx src/components/landing scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: create the Echlearn Atelier landing"
~~~

## Task 5: Upgrade the app shell and utility header

**Files:**
- Modify: src/components/layout/AppLayout.tsx
- Modify: src/components/layout/TopBar.tsx
- Test: scripts/verify_atelier_ui_contract.cjs, scripts/verify_dashboard_reactivity.cjs, scripts/verify_customization_system.cjs

**Interfaces:**
- Consumes: existing useAppStore, useAuthStore, useLearningStore, applyCosmeticSettings, nav items, and paths.
- Produces: semantic main-content, accessible mobile sidebar, and labelled top-bar menus without touching orchestration.

- [ ] **Step 1: Add RED assertions**

Require main id="main-content", sidebar aria-expanded/aria-controls, sidebar aria-label, and explicit labels/expanded state for TopBar menu, language, and notifications. Assert existing i18n.changeLanguage, applyCosmeticSettings, fetchStats, window.innerWidth < 1024, and JapaneseLofiPlayer remain in AppLayout.

- [ ] **Step 2: Run RED**

Run: npm.cmd run verify:atelier-ui

Expected: semantic assertions fail while existing orchestration assertions pass.

- [ ] **Step 3: Implement without changing data ownership**

Keep all effects/nav arrays. Add Escape close and focus restoration for the mobile sidebar; keep the 1024 px boundary. Use Atelier surfaces in sidebar/topbar/main. In TopBar, preserve language, notification, profile, and connection state; add aria-controls and readable popover headings; do not claim the inert search is functional.

- [ ] **Step 4: Verify and commit**

~~~powershell
npm.cmd run verify:atelier-ui
node scripts/verify_dashboard_reactivity.cjs
node scripts/verify_customization_system.cjs
npm.cmd run build
git add -- src/components/layout/AppLayout.tsx src/components/layout/TopBar.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: refine the Atelier study workspace shell"
~~~

## Task 6: Compose the dashboard around focus, evidence, and next step

**Files:**
- Create: src/components/dashboard/LearningFocusCard.tsx
- Create: src/components/dashboard/ProgressEvidence.tsx
- Create: src/components/dashboard/NextStepList.tsx
- Modify: src/pages/app/DashboardPage.tsx
- Test: dashboard plan/reactivity/learning-engine verifiers

**Interfaces:**
- Consumes: TodayPlan, getMasteryLabel, existing user/stats/current-course data, existing route/callback behaviour.
- Produces: presentational components; DashboardPage remains owner of its effects and mutations.

- [ ] **Step 1: Add RED checks**

Require all three component imports and retain getTodayPlan, reviewQueue, weakSkills, and recommendedLesson in DashboardPage. Prohibit AI-ready copy.

- [ ] **Step 2: Run RED**

~~~powershell
npm.cmd run verify:atelier-ui
node scripts/verify_dashboard_reactivity.cjs
~~~

Expected: Atelier check fails only for missing components.

- [ ] **Step 3: Implement data-only components**

~~~ts
type LearningFocusCardProps = { plan: TodayPlan | null; isLoading: boolean; language: string };
type ProgressEvidenceProps = { todayXP: number; dailyXPGoal: number; streak: number; level?: number; estimatedBand?: number | null };
type NextStepListProps = { course: { title: string; description: string; completedLessons: number; totalLessons: number } | null; reviewCount: number };
~~~

LearningFocusCard has an explicit non-AI fallback. ProgressEvidence labels any band as an estimate. NextStepList uses only existing lesson, roadmap, or recommended-plan routes.

- [ ] **Step 4: Compose without altering flow**

Keep TodayPlan fetch, reward/missions, leaderboard/groups, and all existing service calls in DashboardPage. Arrange focus first, evidence second, and next steps third. Use semantic headings, Lucide status icons, and EchBuriPresence only in greeting/focus.

- [ ] **Step 5: Verify and commit**

~~~powershell
npm.cmd run verify:atelier-ui
node scripts/verify_dashboard_reactivity.cjs
node scripts/verify_dashboard_plan.cjs
node scripts/verify_learning_engine.cjs
node scripts/verify_no_fake_ai_claims.cjs
npm.cmd run build
git add -- src/pages/app/DashboardPage.tsx src/components/dashboard scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: focus the Atelier learner dashboard"
~~~

## Task 7: Migrate shared high-traffic touchpoints safely

**Files:**
- Modify when safe: src/pages/auth/LoginPage.tsx, src/pages/auth/RegisterPage.tsx, src/pages/app/customization/CustomizationPage.tsx, src/pages/app/gamification/LeaderboardPage.tsx
- Test: auth, customisation, community, Atelier contract verifiers

**Interfaces:**
- Consumes: Atelier tokens/primitives and existing page behaviour.
- Produces: coherent entry/settings/progress surfaces without a risky sixty-page rewrite.

- [ ] **Step 1: Inspect each target diff**

~~~powershell
git diff -- src/pages/auth/LoginPage.tsx src/pages/auth/RegisterPage.tsx src/pages/app/customization/CustomizationPage.tsx src/pages/app/gamification/LeaderboardPage.tsx
~~~

Expected: user-owned modifications are identified. Skip a file only when concurrent changes cannot be safely accommodated; record it in closeout rather than overwrite it.

- [ ] **Step 2: Add migration checks**

Require every migrated target to use an Atelier class/token and not introduce liquid-glass, text-neon, bg-neon, structural emoji navigation, or an external media URL.

- [ ] **Step 3: Change visual layers only**

For each safe page, change wrappers, spacing, heading hierarchy, buttons, focus, and responsive layout. Do not alter form handlers, translations, stores, services, profile/customisation state, or routes.

- [ ] **Step 4: Verify and commit each safe slice**

~~~powershell
node scripts/verify_auth_routes.cjs
node scripts/verify_customization_system.cjs
node scripts/verify_phase20_discord_community.cjs
npm.cmd run lint
~~~

Commit only verified files, for example:

~~~powershell
git add -- src/pages/auth/LoginPage.tsx src/pages/auth/RegisterPage.tsx scripts/verify_atelier_ui_contract.cjs
git commit -m "feat: align auth screens with Atelier"
~~~

## Task 8: Integrate the quality gate and close out

**Files:**
- Modify: package.json
- Modify: scripts/verify_atelier_ui_contract.cjs
- Test: all commands below

**Interfaces:**
- Consumes: the completed Atelier source files.
- Produces: stable verify:atelier-ui inside the existing verify:all chain.

- [ ] **Step 1: Finalise source contract**

Require one landing h1; labelled nav/menu; skip/main; reduced motion; no unsupported AI marketing; no external landing media; planned shared components; and exact limitation disclosure. Avoid brittle pixel-value or formatting checks.

- [ ] **Step 2: Run focused suite**

~~~powershell
npm.cmd run verify:atelier-ui
node scripts/verify_route_smoke.cjs
node scripts/verify_no_blank_pages.cjs
node scripts/verify_dashboard_reactivity.cjs
node scripts/verify_dashboard_plan.cjs
node scripts/verify_i18n_runtime_pages.cjs
node scripts/verify_customization_system.cjs
node scripts/verify_no_fake_ai_claims.cjs
~~~

Expected: all pass.

- [ ] **Step 3: Add stable gate to verify:all**

Insert npm run verify:atelier-ui once after existing route/UI smoke checks. Preserve all existing checks and their order otherwise.

- [ ] **Step 4: Run production gates**

~~~powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run verify:all
git diff --check
~~~

Expected: all exit 0; distinguish any pre-existing warning from a new failure.

- [ ] **Step 5: Browser QA**

Use the browser-testing skill on npm.cmd run preview. Verify landing/dashboard at 375/768/1024/1440 px, CTA routes, no horizontal overflow, keyboard/focus, Escape sidebar close, language/notification controls, reduced motion, long Vietnamese strings, and empty/failed media state.

- [ ] **Step 6: Commit closeout**

~~~powershell
git add -- package.json scripts/verify_atelier_ui_contract.cjs
git commit -m "test: enforce Atelier UI quality gates"
~~~

## Plan Self-Review

### Spec coverage

- Semantic visual system: Task 2.
- Original five-chapter cinematic landing: Task 4.
- Ech Buri as a central but restrained guide: Tasks 2, 4, and 6.
- Dashboard Focus → Evidence → Next step: Task 6.
- Public/app navigation, responsive design, motion, and accessibility: Tasks 3, 5, and 8.
- AI truthfulness and no remote visual dependency: Tasks 1, 3, 4, 6, and 8.
- Existing data, routes, i18n, auth, customisation, and learning engine: global constraints plus Tasks 1, 5, 6, and 7.
- Shared styling for the whole product without an unsafe sixty-page rewrite: Tasks 2, 5, and 7.

### Placeholder scan

The plan contains no unresolved markers. Every task gives exact files, interfaces, red/green commands, and scoped commit criteria.

### Type consistency

Landing and dashboard prop interfaces are specified before their consuming tasks. Dashboard presentation consumes existing TodayPlan values and introduces no service interface.
