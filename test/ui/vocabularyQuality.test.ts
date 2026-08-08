import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isSafeVocabularyMeaningCandidate } from '../../src/curriculum/vocabularyQuality.ts';

test('unsafe generated definitions are rejected instead of becoming answer options', () => {
  assert.equal(isSafeVocabularyMeaningCandidate('To perform the action of exhale.'), false);
  assert.equal(isSafeVocabularyMeaningCandidate('I like to exhale every day.'), false);
  assert.equal(isSafeVocabularyMeaningCandidate('thở ra'), true);
});

test('vocabulary loading skips browser-only relative asset requests in Node quality checks', async () => {
  const source = await readFile(new URL('../../src/services/vocabularyService.ts', import.meta.url), 'utf8');

  assert.match(source, /if \(typeof window !== 'undefined'\)/);
  assert.match(source, /Relative public assets only resolve in a browser/);
});
