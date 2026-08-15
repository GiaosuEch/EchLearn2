import assert from 'node:assert/strict';
import test from 'node:test';
import {
  KOREAN_TOPIK1_REGISTRY,
  resolveKoreanTopikPath,
  validateKoreanTopikRegistry,
} from '../../src/curriculum/koreanTopikRegistry.ts';
import {
  KOREAN_TOPIK1_LESSONS,
  KOREAN_TOPIK1_VOCABULARY_DECKS,
  validateKoreanTopikContent,
} from '../../src/curriculum/koreanTopik1Content.ts';

test('Korean TOPIK starter content is locally authored and bidirectionally registered', () => {
  assert.deepEqual(validateKoreanTopikRegistry(KOREAN_TOPIK1_REGISTRY), []);
  assert.deepEqual(validateKoreanTopikContent(KOREAN_TOPIK1_VOCABULARY_DECKS, KOREAN_TOPIK1_LESSONS, KOREAN_TOPIK1_REGISTRY), []);
  assert.deepEqual(KOREAN_TOPIK1_VOCABULARY_DECKS.map((deck) => deck.cards.length), [20, 20]);
});

test('a failed vocabulary review does not unlock Korean grammar', () => {
  const reviewItems = Object.fromEntries(KOREAN_TOPIK1_VOCABULARY_DECKS[0].cards.map((card) => [card.id, { n: 0 }]));
  const path = resolveKoreanTopikPath({ reviewItems, lessonProgress: {} });
  assert.equal(path.find((node) => node.id === 'ko:topik:topik1:vocabulary:foundations-01')?.progress, 0);
  assert.equal(path.find((node) => node.id === 'ko:topik:topik1:grammar:ieyo-yeyo-01')?.status, 'locked');
});

test('unlock policy retains historical completion and is not authorization', () => {
  assert.equal(KOREAN_TOPIK1_REGISTRY[0].unlockPolicy, 'historical-completion');
  assert.match(KOREAN_TOPIK1_REGISTRY[0].unlockDisclosure, /UX.*không phải.*authorization/i);
});
