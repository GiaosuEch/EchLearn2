import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeVocabularyMeaningCandidate } from '../../src/curriculum/vocabularyQuality.ts';

test('unsafe generated definitions are rejected instead of becoming answer options', () => {
  assert.equal(isSafeVocabularyMeaningCandidate('To perform the action of exhale.'), false);
  assert.equal(isSafeVocabularyMeaningCandidate('I like to exhale every day.'), false);
  assert.equal(isSafeVocabularyMeaningCandidate('thở ra'), true);
});
