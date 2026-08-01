# Landing Credibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the public landing page into a clear language-learning introduction while keeping EchLearn's green identity and Ech Buri companion.

**Architecture:** Keep the current route and component boundaries. `CinematicHero` owns navigation and the first impression; `LandingPage` owns the capability overview and closing action. The Playwright smoke test is the public-copy regression seam.

**Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Lucide React, Playwright.

## Global Constraints

- Keep the green EchLearn identity and position Ech Buri as a study companion.
- Do not make unverifiable ranking, learner-count, performance, or AI-capability claims.
- Use clear Vietnamese, semantic headings, native interactive controls, and existing routes.
- Preserve 375px mobile and desktop layouts.

---

### Task 1: Guard credible landing copy

**Files:**

- Modify: `e2e/landing.smoke.spec.ts`

**Interfaces:**

- Consumes: public `/` route and accessible text from `LandingPage`.
- Produces: regression coverage for new copy and retired claims.

- [ ] **Step 1: Write the failing test**

```ts
await expect(page.getByRole('heading', { name: 'Học tiếng Anh theo nhịp của bạn' })).toBeVisible();
await expect(page.getByText('Top 1 thế giới', { exact: false })).toHaveCount(0);
await expect(page.getByText('50,000+', { exact: false })).toHaveCount(0);
```

- [ ] **Step 2: Run the test**

Run `npx playwright test e2e/landing.smoke.spec.ts`. Expect failure because the current hero uses its retired claim-driven heading.

- [ ] **Step 3: Commit**

Run `git add e2e/landing.smoke.spec.ts` then `git commit -m "test: guard credible landing copy"`.

### Task 2: Replace the claim-driven hero

**Files:**

- Modify: `src/components/landing/CinematicHero.tsx`

**Interfaces:**

- Consumes: existing `Mascot`, `EchLearnLogo`, `Button`, `Badge`, `Link`, and routes.
- Produces: credible Vietnamese hero copy and a compact study-companion panel.

- [ ] **Step 1: Keep Task 1 failing before implementation**

Run `npx playwright test e2e/landing.smoke.spec.ts`; the failure must identify the missing new heading.

- [ ] **Step 2: Make the minimal hero copy and presentation change**

```tsx
<Badge variant="default"><Sparkles size={14} aria-hidden="true" /><span>NỀN TẢNG HỌC TIẾNG ANH</span></Badge>
<h1>Học tiếng Anh theo nhịp của bạn</h1>
<p>Lộ trình rõ ràng, bài luyện theo kỹ năng và công cụ đồng hành để bạn học đều mỗi ngày.</p>
```

Remove fabricated streak/goal cards, numeric badge values, decorative emoji, and all superlative or unsubstantiated claims. Keep current call-to-action routes.

- [ ] **Step 3: Run the smoke test**

Run `npx playwright test e2e/landing.smoke.spec.ts`. Expect PASS.

- [ ] **Step 4: Commit**

Run `git add src/components/landing/CinematicHero.tsx` then `git commit -m "feat: make landing hero credible"`.

### Task 3: Align capability and CTA sections

**Files:**

- Modify: `src/pages/public/LandingPage.tsx`

**Interfaces:**

- Consumes: existing cards, buttons, badge, icons, and public routes.
- Produces: route-backed benefit descriptions and a CTA without fabricated social proof.

- [ ] **Step 1: Verify existing smoke coverage remains green**

Run `npx playwright test e2e/landing.smoke.spec.ts`. Expect PASS.

- [ ] **Step 2: Replace marketing copy with route-backed benefits**

```tsx
<CardTitle>Lộ trình học có cấu trúc</CardTitle>
<CardDescription>Theo dõi mục tiêu, quay lại nội dung cần ôn và học theo kế hoạch phù hợp với bạn.</CardDescription>
<h2>Bắt đầu từ mục tiêu của bạn</h2>
<p>Chọn kỹ năng muốn cải thiện và xây dựng thói quen học tập bền vững.</p>
```

Use green/slate accents only, remove `50,000+`, and replace the heavy CTA gradient with a restrained solid surface.

- [ ] **Step 3: Run the smoke test**

Run `npx playwright test e2e/landing.smoke.spec.ts`. Expect PASS.

- [ ] **Step 4: Commit**

Run `git add src/pages/public/LandingPage.tsx` then `git commit -m "feat: align landing benefits with product"`.

### Task 4: Verify public-page quality

**Files:**

- Verify: `src/components/landing/CinematicHero.tsx`
- Verify: `src/pages/public/LandingPage.tsx`
- Verify: `e2e/landing.smoke.spec.ts`

- [ ] **Step 1: Run static checks**

Run `npm.cmd run lint` and `npm.cmd run build`; each must exit 0.

- [ ] **Step 2: Run the landing test**

Run `npx playwright test e2e/landing.smoke.spec.ts`; expect PASS.

- [ ] **Step 3: Verify the browser**

Use the local production preview at 1440px and 375px; capture screenshots, inspect the accessibility tree, and confirm zero console warnings or errors.

- [ ] **Step 4: Commit verified implementation**

Run `git add src/components/landing/CinematicHero.tsx src/pages/public/LandingPage.tsx e2e/landing.smoke.spec.ts` then `git commit -m "feat: refine credible public landing"`.
