import test from 'node:test';
import assert from 'node:assert/strict';
import { getCuratedStarterVocabulary } from '../../src/curriculum/curatedStarterVocabulary.ts';

test('the three free starter languages use curated Vietnamese meanings', () => {
  for (const language of ['en', 'zh', 'ja']) {
    const items = getCuratedStarterVocabulary(language);
    assert.ok(items.length >= 8, `${language} needs a usable starter set`);
    assert.ok(items.every((item) => item.meaningVietnamese && !/quality of being|perform the action/i.test(item.meaningVietnamese)));
  }
});

test('unsupported language does not borrow unsafe legacy starter content', () => {
  assert.deepEqual(getCuratedStarterVocabulary('fr'), []);
});
