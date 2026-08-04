import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { describe } from 'node:test';

import { highestPlan, planUnlocksPro, resolveProAccess } from '../../src/services/proAccessService.ts';
import { isProAccount, resolveProFeatureFlags } from '../../src/services/proFeatureFlags.ts';

/**
 * The bug these tests lock down: an admin PRO grant wrote only the local
 * entitlement ledger, so `profiles.role` / `profiles.is_pro` stayed at their
 * signup values and every gate that read the profile still saw a free user.
 */

describe('plan → PRO mapping', () => {
  test('PLUS and PRO unlock the full feature set, GO and FREE do not', () => {
    assert.equal(planUnlocksPro('pro'), true);
    assert.equal(planUnlocksPro('plus'), true);
    assert.equal(planUnlocksPro('go'), false);
    assert.equal(planUnlocksPro('free'), false);
    assert.equal(planUnlocksPro(null), false);
    assert.equal(planUnlocksPro(undefined), false);
  });

  test('an activation records the profile role alongside the flag', () => {
    assert.deepEqual(resolveProAccess('pro', 'user'), { plan: 'pro', isPro: true, role: 'pro' });
    assert.deepEqual(resolveProAccess('free', 'user'), { plan: 'free', isPro: false, role: 'user' });
  });

  test('an administrator is never downgraded by a plan change', () => {
    assert.equal(resolveProAccess('free', 'admin').role, 'admin');
    assert.equal(isProAccount({ role: 'admin', plan: 'free' }), true);
  });
});

describe('reconciling two disagreeing sources', () => {
  test('takes the more generous plan so neither stale source locks a learner out', () => {
    // Grant made on another device: the profile knows, this browser's ledger does not.
    assert.equal(highestPlan('pro', 'free'), 'pro');
    // Offline activation: the ledger knows, the profile has not synced yet.
    assert.equal(highestPlan('free', 'pro'), 'pro');
    assert.equal(highestPlan('go', 'plus'), 'plus');
    assert.equal(highestPlan(null, undefined), 'free');
  });

  test('an unknown plan value degrades to free rather than throwing', () => {
    assert.equal(highestPlan('legacy_vip' as never, 'go'), 'go');
    assert.equal(highestPlan('legacy_vip' as never, null), 'free');
  });
});

describe('feature flags', () => {
  test('the profile flag alone is enough to unlock everything', () => {
    const flags = resolveProFeatureFlags({ role: 'user', isPro: true, plan: 'free' });
    assert.equal(flags.unlockAllLanguages, true);
    assert.equal(flags.unlockAllLessons, true);
    assert.equal(flags.unlimitedHearts, true);
    assert.equal(flags.showProBadge, true);
  });

  test('a free account gets no flag by accident', () => {
    const flags = resolveProFeatureFlags({ role: 'user', isPro: false, plan: 'free' });
    assert.equal(Object.values(flags).some(Boolean), false);
  });

  test('a GO plan is paid but not PRO', () => {
    const flags = resolveProFeatureFlags({ role: 'user', isPro: false, plan: 'go' });
    assert.equal(flags.unlockAllLanguages, false);
    assert.equal(flags.showProBadge, false);
  });
});

describe('gate wiring', () => {
  const read = (relativePath: string) =>
    readFileSync(fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)), 'utf8');

  const GATES = [
    'src/components/auth/LanguageEntitlementGuard.tsx',
    'src/components/layout/TopBar.tsx',
    'src/pages/app/LanguageSelectionPage.tsx',
    'src/pages/app/CourseRoadmapPage.tsx',
    'src/pages/app/LessonPlayerPage.tsx',
  ];

  for (const gate of GATES) {
    test(`${gate} resolves the plan from the profile, not the ledger alone`, () => {
      const source = read(gate);
      assert.match(source, /useProAccess/);
      // `findActiveEntitlement` on the raw ledger is what ignored an admin grant.
      assert.doesNotMatch(source, /findActiveEntitlement/);
    });
  }

  test('redirecting gates wait for the plan to resolve before bouncing anyone', () => {
    for (const gate of GATES.filter((path) => /Guard|RoadmapPage|LessonPlayerPage/.test(path))) {
      assert.match(read(gate), /isResolving/, `${gate} must not redirect on an unresolved plan`);
    }
  });

  test('an entitlement activation also writes the profile PRO flags', () => {
    assert.match(read('src/stores/entitlementStore.ts'), /applyProAccess/);
  });
});
