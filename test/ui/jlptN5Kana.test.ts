import assert from 'node:assert/strict';
import test from 'node:test';

import { HIRAGANA_CHART, KANA_CHECKS, KATAKANA_CHART, validateJLPTN5Kana } from '../../src/curriculum/jlptN5Kana.ts';

test('N5 kana content includes the complete gojūon core and fixed answerable checks', () => {
  assert.equal(HIRAGANA_CHART.length, 46);
  assert.equal(KATAKANA_CHART.length, 46);
  assert.equal(KANA_CHECKS.length, 10);
  assert.deepEqual(validateJLPTN5Kana(), []);
});
