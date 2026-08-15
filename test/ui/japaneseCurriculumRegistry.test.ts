import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JAPANESE_LESSON_REGISTRY,
  getJapaneseLessonProgressId,
  getJapaneseReviewItemId,
  resolveJapanesePathProgress,
  validateJapaneseLessonRegistry,
} from '../../src/curriculum/japaneseCurriculumRegistry.ts';

const remembered = (ids: readonly string[], n = 1) => Object.fromEntries(ids.map((id) => [id, { n }]));

test('Japanese registry is internally valid and has a deterministic N5 path', () => {
  assert.deepEqual(validateJapaneseLessonRegistry(JAPANESE_LESSON_REGISTRY), []);
  assert.deepEqual(
    JAPANESE_LESSON_REGISTRY.filter((lesson) => lesson.level === 'N5').map((lesson) => lesson.id),
    ['kana-1', 'vocab-1', 'grammar-1', 'reading-1', 'grammar-2', 'reading-2', 'vocab-2', 'grammar-3', 'reading-3', 'grammar-4', 'reading-4', 'grammar-5', 'reading-5', 'grammar-6', 'reading-6', 'grammar-7', 'reading-7', 'vocab-3', 'grammar-8', 'reading-8', 'grammar-9', 'reading-9', 'grammar-10', 'reading-10', 'grammar-11', 'reading-11', 'grammar-12', 'reading-12', 'grammar-13', 'reading-13', 'grammar-14', 'reading-14', 'grammar-15', 'reading-15', 'grammar-16', 'reading-16', 'grammar-17', 'reading-17', 'grammar-18', 'reading-18', 'grammar-19', 'reading-19', 'grammar-20', 'reading-20', 'grammar-21', 'reading-21', 'grammar-22', 'reading-22', 'grammar-23', 'reading-23', 'grammar-24', 'reading-24', 'grammar-25', 'reading-25', 'grammar-26', 'reading-26', 'grammar-27', 'reading-27', 'grammar-28', 'reading-28', 'grammar-29', 'reading-29', 'grammar-30', 'reading-30'],
  );
});

test('only Japanese vocabulary reviews unlock Japanese grammar', () => {
  const path = resolveJapanesePathProgress({
    level: 'N5',
    reviewItems: remembered([...Array.from({ length: 15 }, (_, index) => `ja_v_${index + 1}`), 'en_v_1', 'academic_zh_1']),
    lessonProgress: {
      [getJapaneseLessonProgressId('kana-1')]: { id: getJapaneseLessonProgressId('kana-1'), attempts: 1, lastScore: 8, bestScore: 8, total: 10, percent: 80, completed: true },
    },
  });

  assert.equal(path.find((node) => node.id === 'vocab-1')?.progress, 50);
  assert.equal(path.find((node) => node.id === 'grammar-1')?.status, 'active');
  assert.equal(path.find((node) => node.id === 'reading-1')?.status, 'locked');
});

test('academic Japanese reviews cannot inflate JLPT N5 vocabulary progress', () => {
  const path = resolveJapanesePathProgress({
    level: 'N5',
    reviewItems: remembered(Array.from({ length: 30 }, (_, index) => `academic_ja_${index + 1}`)),
    lessonProgress: {
      [getJapaneseLessonProgressId('kana-1')]: { id: getJapaneseLessonProgressId('kana-1'), attempts: 1, lastScore: 8, bestScore: 8, total: 10, percent: 80, completed: true },
    },
  });

  assert.equal(path.find((node) => node.id === 'vocab-1')?.progress, 0);
  assert.equal(path.find((node) => node.id === 'grammar-1')?.status, 'locked');
});

test('Japanese review namespaces cannot collide with other tracks or levels', () => {
  assert.equal(getJapaneseLessonProgressId('grammar-1'), 'ja:jlpt:n5:grammar-1');
  assert.equal(getJapaneseReviewItemId('grammar-1', 'q1', 'N4'), 'ja:jlpt:n4:grammar-1:q1');
});

test('reading unlocks only when grammar reaches the declared threshold', () => {
  const path = resolveJapanesePathProgress({
    level: 'N5',
    reviewItems: remembered(Array.from({ length: 30 }, (_, index) => `ja_v_${index + 1}`)),
    lessonProgress: {
      [getJapaneseLessonProgressId('kana-1')]: { id: getJapaneseLessonProgressId('kana-1'), attempts: 1, lastScore: 8, bestScore: 8, total: 10, percent: 80, completed: true },
      [getJapaneseLessonProgressId('grammar-1')]: { id: getJapaneseLessonProgressId('grammar-1'), attempts: 1, lastScore: 3, bestScore: 3, total: 3, percent: 100, completed: true },
    },
  });

  assert.equal(path.find((node) => node.id === 'grammar-1')?.status, 'completed');
  assert.equal(path.find((node) => node.id === 'reading-1')?.status, 'active');
});

test('legacy unscoped lesson progress remains readable during migration', () => {
  const path = resolveJapanesePathProgress({
    level: 'N5',
    reviewItems: remembered(Array.from({ length: 30 }, (_, index) => `ja_v_${index + 1}`)),
    lessonProgress: {
      [getJapaneseLessonProgressId('kana-1')]: { id: getJapaneseLessonProgressId('kana-1'), attempts: 1, lastScore: 8, bestScore: 8, total: 10, percent: 80, completed: true },
      'grammar-1': { id: 'grammar-1', attempts: 1, lastScore: 3, bestScore: 3, total: 3, percent: 100, completed: true },
    },
  });

  assert.equal(path.find((node) => node.id === 'reading-1')?.status, 'active');
});

test('failed vocabulary reviews cannot unlock the next lesson', () => {
  const path = resolveJapanesePathProgress({
    level: 'N5',
    reviewItems: remembered(Array.from({ length: 30 }, (_, index) => `ja:jlpt:n5:vocab-1:v${index + 1}`), 0),
    lessonProgress: {
      [getJapaneseLessonProgressId('kana-1')]: { id: getJapaneseLessonProgressId('kana-1'), attempts: 1, lastScore: 8, bestScore: 8, total: 10, percent: 80, completed: true },
    },
  });

  assert.equal(path.find((node) => node.id === 'vocab-1')?.progress, 0);
  assert.equal(path.find((node) => node.id === 'grammar-1')?.status, 'locked');
});
