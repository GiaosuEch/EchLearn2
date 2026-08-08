import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergePlanPrices, DEFAULT_PLAN_PRICES } from '../../src/services/pricingService';
import { getEntitlementPolicy, findActiveEntitlement } from '../../src/services/entitlementService';
import { profileService } from '../../src/services/profileService';

describe('cross-device sync & admin panel resilience', () => {
  it('mergePlanPrices preserves default prices when payload is empty or partial', () => {
    const merged = mergePlanPrices({});
    assert.equal(merged.free.price, DEFAULT_PLAN_PRICES.free.price);
    assert.equal(merged.pro.price, DEFAULT_PLAN_PRICES.pro.price);

    const updated = mergePlanPrices({
      pro: { price: '999.000 VNĐ', period: 'Trọn đời' }
    });
    assert.equal(updated.pro.price, '999.000 VNĐ');
    assert.equal(updated.free.price, DEFAULT_PLAN_PRICES.free.price);
  });

  it('entitlement policy accurately provides PRO and FREE boundaries', () => {
    const proPolicy = getEntitlementPolicy('pro');
    assert.equal(proPolicy.languageAccess, 'all');
    assert.equal(proPolicy.durationDays, null);

    const freePolicy = getEntitlementPolicy('free');
    assert.equal(freePolicy.languageAccess, 'starter');
    assert.equal(freePolicy.activeLanguageLimit, 3);
  });

  it('findActiveEntitlement selects the highest tier active entitlement', () => {
    const active = findActiveEntitlement(
      [
        {
          userId: 'user_123',
          plan: 'go',
          source: 'trial',
          activatedBy: 'admin',
          activatedAt: new Date().toISOString(),
          expiresAt: null,
        },
        {
          userId: 'user_123',
          plan: 'pro',
          source: 'purchased',
          activatedBy: 'admin',
          activatedAt: new Date().toISOString(),
          expiresAt: null,
        },
      ],
      'user_123'
    );
    assert.equal(active?.plan, 'pro');
  });

  it('profileService.getLeaderboard never returns an empty array', async () => {
    const leaderboard = await profileService.getLeaderboard(10);
    assert.ok(Array.isArray(leaderboard));
    assert.ok(leaderboard.length > 0, 'Leaderboard must always contain accounts for admin & community');
  });
});
