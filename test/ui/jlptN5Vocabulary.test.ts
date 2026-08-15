import assert from 'node:assert/strict';
import test from 'node:test';

import { JLPT_N5_VOCABULARY, JLPT_N5_VOCABULARY_LESSONS, validateJLPTN5Vocabulary } from '../../src/curriculum/jlptN5Vocabulary.ts';
import { JAPANESE_LESSON_REGISTRY } from '../../src/curriculum/japaneseCurriculumRegistry.ts';

test('JLPT N5 vocabulary deck is authored, unique, and furigana-ready', () => {
  assert.equal(JLPT_N5_VOCABULARY.length, 30);
  assert.equal(JLPT_N5_VOCABULARY_LESSONS['vocab-2'].cards.length, 30);
  assert.equal(JLPT_N5_VOCABULARY_LESSONS['vocab-3'].cards.length, 30);
  assert.deepEqual(validateJLPTN5Vocabulary(), []);
  assert.ok(JLPT_N5_VOCABULARY.every((card) => card.word.some((segment) => Boolean(segment.ruby))));
});

test('every N5 vocabulary path node has a complete local deck with a matching review count', () => {
  const vocabularyNodes = JAPANESE_LESSON_REGISTRY.filter((lesson) => lesson.level === 'N5' && lesson.skill === 'vocabulary');
  assert.deepEqual(vocabularyNodes.map((lesson) => lesson.id), Object.keys(JLPT_N5_VOCABULARY_LESSONS));
  for (const node of vocabularyNodes) {
    assert.equal(node.reviewItemCount, JLPT_N5_VOCABULARY_LESSONS[node.id as keyof typeof JLPT_N5_VOCABULARY_LESSONS].cards.length);
  }
});
