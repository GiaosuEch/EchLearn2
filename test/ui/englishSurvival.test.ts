import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSurvivalProduction,
  evaluateSurvivalRetrieval,
  survivalSelfReviewPrompts,
} from '../../src/viewmodels/englishSurvival.ts';

test('production accepts a meaningful personalized order without exemplar names', () => {
  const result = evaluateSurvivalProduction('I would like vegetable noodles, please.');
  assert.equal(result.kind, 'success');
  assert.match(result.message, /rõ món|clear order/i);
});

test('production gives an actionable hint for an incomplete response', () => {
  const result = evaluateSurvivalProduction('Noodles');
  assert.equal(result.kind, 'retry');
  assert.match(result.message, /I would like|Can I have/);
});

test('retrieval explains when a reasonable sentence misses the target phrase', () => {
  const result = evaluateSurvivalRetrieval('I would like vegetable noodles, please.');
  assert.equal(result.kind, 'partial');
  assert.match(result.message, /gọi món tốt/i);
  assert.match(result.message, /less spicy/i);
});

test('retrieval accepts the core polite adjustment phrase', () => {
  const result = evaluateSurvivalRetrieval('Could you make my noodles less spicy, please?');
  assert.equal(result.kind, 'success');
});

test('self-review uses four concrete checks', () => {
  assert.equal(survivalSelfReviewPrompts.length, 4);
  assert.equal(survivalSelfReviewPrompts.every((prompt) => prompt.length >= 20), true);
});
