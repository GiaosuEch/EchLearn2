import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolvePlanPriceRows } from '../../src/services/pricingService.ts';

describe('published pricing fallback', () => {
  it('keeps every published price visible when the remote price table is unavailable', () => {
    const result = resolvePlanPriceRows([]);

    assert.equal(result.source, 'fallback');
    assert.equal(result.prices.free.price, '0 VNĐ');
    assert.equal(result.prices.go.price, '199.000 VNĐ');
    assert.equal(result.prices.plus.price, '399.000 VNĐ');
    assert.equal(result.prices.pro.price, '799.000 VNĐ');
  });

  it('uses server prices only when the server returns at least one valid price row', () => {
    const result = resolvePlanPriceRows([
      { plan_id: 'plus', price: '349.000 VNĐ', original_price: '599.000 VNĐ', period: '12 tháng', badge: 'Ưu đãi' },
    ]);

    assert.equal(result.source, 'remote');
    assert.equal(result.prices.plus.price, '349.000 VNĐ');
    assert.equal(result.prices.free.price, '0 VNĐ');
  });
});
