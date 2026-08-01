# EchLearn Product Overhaul & Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor EchLearn UI to top 0.1% EdTech standards with unified Light Theme, Duolingo 3D Tactile Buttons, Apple Elevation Cards, streamlined Sidebar navigation, and strict 1 Email = 1 Account Auth policy.

**Architecture:** Tailwind CSS v4 design tokens in `index.css` / `echlearn.css`, Shadcn UI primitives (`Card`, `Button`, `Badge`, `Dialog`, `Tabs`), Radix UI, Motion, and Supabase Auth.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Playwright, Supabase.

## Global Constraints

- Never use random, hardcoded, delayed canned, or fabricated output.
- 100% Light Theme default canvas (`bg-[#f8fafc]`), white surface cards (`bg-[#ffffff]`), Slate 900 (`#0f172a`) headings, Slate 700 (`#334155`) body text.
- Strict 1 Email = 1 Account MAX (`MAX_LOCAL_ACCOUNTS_PER_EMAIL = 1`).
- `npx tsc -b` must pass with 0 errors after every task.
- `npm run build` must succeed before final handoff.

---

### Task 1: Design Tokens & Base Theme Setup

**Files:**
- Modify: `src/index.css:1-100`
- Modify: `src/styles/echlearn.css:140-185`

**Interfaces:**
- Consumes: Tailwind v4 theme variables
- Produces: Base Light Theme tokens and high-contrast typography rules

- [ ] **Step 1: Verify current index.css theme mapping**

Run: `npx tsc -b`

- [ ] **Step 2: Ensure high contrast text rules in echlearn.css**

Verify `.ech-hero` and `.ech-public` have explicit `#0f172a` heading and `#334155` body text colors.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc -b`
Expected: PASS with 0 errors.

---

### Task 2: TopBar Navigation & Streamlined Controls

**Files:**
- Modify: `src/components/layout/TopBar.tsx:68-120`

**Interfaces:**
- Consumes: `createDashboardMetrics`, `useAppStore`, `useAuthStore`
- Produces: Clean, accessible TopBar header with high contrast search and stats pills

- [ ] **Step 1: Inspect TopBar.tsx header markup**

Verify `bg-white/95 backdrop-blur-xl border-b border-slate-100` styling and high contrast text.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc -b`
Expected: PASS with 0 errors.

---

### Task 3: Sidebar Navigation & App Layout Refactoring

**Files:**
- Modify: `src/components/layout/AppLayout.tsx:37-70`

**Interfaces:**
- Consumes: `navSections` grouping
- Produces: Collapsible 4-category sidebar navigation with active indicator lighting

- [ ] **Step 1: Check AppLayout navigation grouping**

Verify `chinh`, `ky_nang`, `luyen_thi`, `giai_tri`, `cong_dong` sections are clearly labeled and collapsible.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc -b`
Expected: PASS with 0 errors.

---

### Task 4: Auth & Register 1-Email Policy Strict Verification

**Files:**
- Modify: `src/services/accountIdentityPolicy.ts:1-20`
- Modify: `src/services/authService.ts:60-77`
- Modify: `src/pages/auth/RegisterPage.tsx:104-185`

**Interfaces:**
- Consumes: `userService.countLocalUsersByEmail`, `emailService.sendOtpEmail`
- Produces: 1 Email = 1 Account max policy enforcement with duplicate email error banner

- [ ] **Step 1: Check accountIdentityPolicy.ts limit**

Verify `MAX_LOCAL_ACCOUNTS_PER_EMAIL = 1` and `canCreateLocalAccount` enforces `existingAccountCount === 0`.

- [ ] **Step 2: Verify duplicate email block Playwright script**

Run: `node scripts/capture_email_limit_proof.js`
Expected: PASS with screenshot output `audit_proof/06_register_email_blocked.png`.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc -b`
Expected: PASS with 0 errors.

---

### Task 5: Final Production Build & Visual Verification

**Files:**
- Modify: `audit_proof/` (all verification artifacts)

**Interfaces:**
- Consumes: Built assets
- Produces: Verified production bundle and clean Playwright visual evidence

- [ ] **Step 1: Run production build**

Run: `npm.cmd run build`
Expected: `✓ built in XXs`

- [ ] **Step 2: Run full Playwright verification sweep**

Run: `node scripts/capture_designer_redesign_proof.js`
Expected: PASS with screenshot output `audit_proof/00_landing_designer_redesign.png`.
