import assert from 'node:assert/strict';
import test from 'node:test';

import { getJapaneseReviewTargetIndex } from '../../src/curriculum/japaneseReviewTarget.ts';

test('resolves an exact namespaced Japanese review item to its authored position', () => {
  assert.equal(getJapaneseReviewTargetIndex({
    reviewItemId: 'ja:jlpt:n5:grammar-1:q2',
    reviewItemIds: ['ja:jlpt:n5:grammar-1:q1', 'ja:jlpt:n5:grammar-1:q2'],
  }), 1);
});

test('accepts only the declared legacy vocabulary numbering and fails safely for unknown review ids', () => {
  assert.equal(getJapaneseReviewTargetIndex({ reviewItemId: 'ja_v_11', reviewItemIds: Array.from({ length: 30 }, (_, index) => `v${index + 1}`), legacyNumericPrefix: 'ja_v_' }), 10);
  assert.equal(getJapaneseReviewTargetIndex({ reviewItemId: 'ja:jlpt:n5:reading-1:q1', reviewItemIds: ['ja:jlpt:n5:grammar-1:q1'] }), 0);
});
