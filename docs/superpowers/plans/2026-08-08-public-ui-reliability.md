# Public UI Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a reliable, Vietnamese-first, mobile-friendly public EchLearn UI without blank pricing states or misleading automated-assessment claims.

**Architecture:** `pricingService` remains the single price-normalization boundary and will report whether it used remote or fallback data. Public pages keep their current routes and layout, while shared content/copy changes consolidate their visual and language conventions.

**Tech Stack:** React 19, TypeScript, React Router, Zustand, Tailwind CSS, Node test runner.

## Global Constraints

- Keep Ech Buri and the green identity; use restrained, readable education UI.
- Vietnamese is the default public language and `EchLearn` is the only product spelling.
- Never present unavailable local-AI assessment as a completed or real-time result.
- Preserve existing curriculum, public data, migrations, entitlement policy, and public routes.
- Price fallback must remain deterministic and visible when Supabase is unavailable.

---

### Task 1: Make pricing fallback state explicit

**Files:**
- Modify: `src/services/pricingService.ts`
- Modify: `src/stores/pricingStore.ts`
- Create: `test/ui/pricingService.test.ts`

**Interfaces:**
- Produces `fetchPlanPrices(): Promise<{ prices: PlanPriceMap; source: 'remote' | 'fallback' }>`.
- `PricingState` exposes `priceSource: 'remote' | 'fallback'` for public views.

- [ ] **Step 1: Write the failing test**

```ts
it('keeps all published plan prices when the remote response is empty', async () => {
  const result = await resolvePlanPricesForRows([]);
  assert.equal(result.source, 'fallback');
  assert.equal(result.prices.plus.price, '399.000 VNĐ');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- test/ui/pricingService.test.ts`

Expected: FAIL because `resolvePlanPricesForRows` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function resolvePlanPricesForRows(rows: readonly PlanPriceRow[]) {
  return rows.length
    ? { prices: fromPriceRows(rows), source: 'remote' as const }
    : { prices: readStoredPrices(), source: 'fallback' as const };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- test/ui/pricingService.test.ts`

Expected: PASS.

### Task 2: Surface resilient pricing honestly

**Files:**
- Modify: `src/pages/app/PricingPage.tsx`
- Test: `test/ui/pricingService.test.ts`

**Interfaces:**
- Consumes `priceSource` from `usePricingStore`.
- Produces a visible informational notice only for fallback prices.

- [ ] **Step 1: Write the failing test**

```ts
it('labels fallback pricing as standard published prices', () => {
  assert.equal(priceStatusMessage('fallback'), 'Đang hiển thị bảng giá tiêu chuẩn của EchLearn.');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- test/ui/pricingService.test.ts`

Expected: FAIL because `priceStatusMessage` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function priceStatusMessage(source: 'remote' | 'fallback') {
  return source === 'fallback' ? 'Đang hiển thị bảng giá tiêu chuẩn của EchLearn.' : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- test/ui/pricingService.test.ts`

Expected: PASS.

### Task 3: Unify public Vietnamese copy and capability claims

**Files:**
- Modify: `src/components/layout/PublicLayout.tsx`
- Modify: `src/components/landing/CinematicHero.tsx`
- Modify: `src/pages/app/AllPages.tsx`
- Create: `test/ui/publicCopy.test.ts`

**Interfaces:**
- Produces Vietnamese-first public headings and a capability-safe hero proposition.

- [ ] **Step 1: Write the failing test**

```ts
it('describes guided practice without claiming unavailable automated scoring', () => {
  assert.equal(heroSupportCopy.includes('chấm điểm thời gian thực'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- test/ui/publicCopy.test.ts`

Expected: FAIL because `heroSupportCopy` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export const heroSupportCopy = 'Lộ trình cá nhân hóa 365 ngày, rèn phản xạ bốn kỹ năng và theo dõi tiến độ học mỗi ngày cùng Ech Buri.';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- test/ui/publicCopy.test.ts`

Expected: PASS.

### Task 4: Compact the mobile language discovery and accessible registration controls

**Files:**
- Modify: `src/pages/app/AllPages.tsx`
- Modify: registration page component located by the `Tạo tài khoản của bạn` heading
- Create: `test/ui/publicUiContracts.test.ts`

**Interfaces:**
- Produces an expand/collapse control with `aria-expanded` for language discovery.
- Produces explicitly named registration fields and password visibility control.

- [ ] **Step 1: Write the failing test**

```ts
it('shows six language options before the visitor expands the full catalogue', () => {
  assert.equal(initialLanguageCardCount, 6);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- test/ui/publicUiContracts.test.ts`

Expected: FAIL because `initialLanguageCardCount` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export const initialLanguageCardCount = 6;
const displayedLanguages = expanded ? languages : languages.slice(0, initialLanguageCardCount);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -- test/ui/publicUiContracts.test.ts`

Expected: PASS.

### Task 5: Verify the public experience

**Files:**
- Verify: `src/services/pricingService.ts`, `src/stores/pricingStore.ts`, public page and registration components

- [ ] **Step 1: Run targeted unit tests**

Run: `npm.cmd test -- test/ui/pricingService.test.ts test/ui/publicCopy.test.ts test/ui/publicUiContracts.test.ts`

Expected: PASS.

- [ ] **Step 2: Run static verification**

Run: `npm.cmd run lint && npm.cmd run build`

Expected: exit 0.

- [ ] **Step 3: Verify in a browser**

Open the public homepage, pricing, languages, IELTS, about, and registration pages at desktop and 375px. Confirm fallback prices are visible, the mobile catalogue is compact before expansion, and registration fields have accessible names.
