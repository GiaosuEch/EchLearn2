import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ENTITLEMENT_PLANS,
  LOCAL_ENTITLEMENT_STORAGE_KEY,
  canUseEntitlementLanguages,
  createLocalEntitlementService,
  getEntitlementPolicy,
  isEntitlementActive,
} from '../../src/services/entitlementService.ts';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class UnavailableStorage {
  getItem(): null {
    return null;
  }

  setItem(): void {
    throw new Error('storage unavailable');
  }
}

describe('local entitlement policy', () => {
  it('defines the published Free, GO, PLUS, and PRO limits deterministically', () => {
    assert.deepEqual(
      ENTITLEMENT_PLANS.map((plan) => ({
        id: plan.id,
        durationDays: plan.durationDays,
        languageAccess: plan.languageAccess,
        activeLanguageLimit: plan.activeLanguageLimit,
        starterLanguages: plan.starterLanguages,
      })),
      [
        { id: 'free', durationDays: 90, languageAccess: 'starter', activeLanguageLimit: 3, starterLanguages: ['en', 'zh', 'ja'] },
        { id: 'go', durationDays: 180, languageAccess: 'starter-plus-one', activeLanguageLimit: 4, starterLanguages: ['en', 'zh', 'ja'] },
        { id: 'plus', durationDays: 365, languageAccess: 'multiple', activeLanguageLimit: null, starterLanguages: [] },
        { id: 'pro', durationDays: null, languageAccess: 'all', activeLanguageLimit: null, starterLanguages: [] },
      ],
    );
  });

  it('allows only a real administrator to record a local trial or purchased activation', () => {
    const storage = new MemoryStorage();
    const service = createLocalEntitlementService(storage, () => new Date('2026-07-30T12:00:00.000Z'));

    const denied = service.activate({
      actor: { id: 'learner-1', role: 'user', email: 'learner@example.com' },
      userId: 'learner-1',
      plan: 'go',
      source: 'purchased',
    });
    assert.deepEqual(denied, { ok: false, reason: 'admin-required' });
    assert.equal(storage.getItem(LOCAL_ENTITLEMENT_STORAGE_KEY), null);

    const impersonated = service.activate({
      actor: { id: 'admin-1', role: 'admin', email: 'not-giaosuech@example.com' },
      userId: 'learner-1',
      plan: 'go',
      source: 'purchased',
    });
    assert.deepEqual(impersonated, { ok: false, reason: 'admin-required' });

    const activated = service.activate({
      actor: { id: 'admin-1', role: 'admin', email: 'khounguyennguyen2012@gmail.com' },
      userId: 'learner-1',
      plan: 'go',
      source: 'purchased',
    });
    assert.deepEqual(activated, {
      ok: true,
      entitlement: {
        userId: 'learner-1',
        plan: 'go',
        source: 'purchased',
        activatedBy: 'admin-1',
        activatedAt: '2026-07-30T12:00:00.000Z',
        expiresAt: '2027-01-26T12:00:00.000Z',
      },
    });
  });

  it('enforces the active-language boundary for starter and GO entitlements', () => {
    assert.equal(canUseEntitlementLanguages('free', ['en']), true);
    assert.equal(canUseEntitlementLanguages('free', ['fr']), false);
    assert.equal(canUseEntitlementLanguages('free', ['en', 'zh', 'ja']), true);
    assert.equal(canUseEntitlementLanguages('free', ['en', 'zh', 'ja', 'fr']), false);
    assert.equal(canUseEntitlementLanguages('go', ['en', 'zh', 'ja', 'fr']), true);
    assert.equal(canUseEntitlementLanguages('go', ['en', 'fr', 'de']), false);
    assert.equal(canUseEntitlementLanguages('plus', ['en', 'fr', 'ja', 'ko']), true);
    assert.equal(canUseEntitlementLanguages('pro', ['en', 'fr', 'ja', 'ko']), true);
  });

  it('treats expired grants as inactive and records an ongoing PRO grant without an expiry', () => {
    const storage = new MemoryStorage();
    const service = createLocalEntitlementService(storage, () => new Date('2026-07-30T12:00:00.000Z'));

    const freeActivation = service.activate({
      actor: { id: 'admin-1', role: 'admin', email: 'khounguyennguyen2012@gmail.com' },
      userId: 'learner-1',
      plan: 'free',
      source: 'trial',
    });
    assert.equal(freeActivation.ok, true);
    if (freeActivation.ok) {
      assert.equal(isEntitlementActive(freeActivation.entitlement, new Date('2026-10-28T11:59:59.000Z')), true);
      assert.equal(isEntitlementActive(freeActivation.entitlement, new Date('2026-10-28T12:00:00.000Z')), false);
    }

    const proActivation = service.activate({
      actor: { id: 'admin-1', role: 'admin', email: 'khounguyennguyen2012@gmail.com' },
      userId: 'learner-1',
      plan: 'pro',
      source: 'purchased',
    });
    assert.equal(proActivation.ok, true);
    if (proActivation.ok) {
      assert.equal(proActivation.entitlement.expiresAt, null);
      assert.equal(isEntitlementActive(proActivation.entitlement, new Date('2040-01-01T00:00:00.000Z')), true);
    }
  });

  it('fails closed to an empty local state when stored data is malformed', () => {
    const storage = new MemoryStorage();
    storage.setItem(LOCAL_ENTITLEMENT_STORAGE_KEY, '{not-json');
    const service = createLocalEntitlementService(storage, () => new Date('2026-07-30T12:00:00.000Z'));

    assert.deepEqual(service.list(), []);
    assert.equal(service.getActiveForUser('learner-1'), null);
  });

  it('does not report an activation when local storage cannot persist it', () => {
    const service = createLocalEntitlementService(new UnavailableStorage(), () => new Date('2026-07-30T12:00:00.000Z'));

    assert.deepEqual(
      service.activate({
        actor: { id: 'admin-1', role: 'admin', email: 'khounguyennguyen2012@gmail.com' },
        userId: 'learner-1',
        plan: 'plus',
        source: 'trial',
      }),
      { ok: false, reason: 'local-storage-unavailable' },
    );
  });

  it('exposes a stable policy lookup for pricing and admin views', () => {
    assert.deepEqual(getEntitlementPolicy('free').starterLanguages, ['en', 'zh', 'ja']);
    assert.equal(getEntitlementPolicy('pro').durationDays, null);
  });
});
