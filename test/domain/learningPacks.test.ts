import assert from 'node:assert/strict';
import test from 'node:test';

import { learningPackRegistry } from '../../src/packs/learningPacks.ts';
import { HSK1_LESSONS } from '../../src/curriculum/chineseHsk1Content.ts';
import { KOREAN_TOPIK1_LESSONS } from '../../src/curriculum/koreanTopik1Content.ts';
import { JLPT_N5_LESSONS } from '../../src/curriculum/jlptN5Lessons.ts';
import { resolveKoreanTopikPath } from '../../src/curriculum/koreanTopikRegistry.ts';
import { resolveLearningPackAccess } from '../../src/domain/learning/learningPackAccess.ts';

test('all published language-pack routes have one validated owner', () => {
  assert.deepEqual(learningPackRegistry.validate(), []);

  for (const route of ['/app/japanese/grammar', '/app/chinese/reading', '/app/korean/pronunciation']) {
    assert.equal(learningPackRegistry.getPackForRoute(route)?.manifest.publicationState, 'published');
  }
});

test('every authored lesson is represented by the published pack that owns it', () => {
  const japanese = learningPackRegistry.getPackForRoute('/app/japanese/grammar');
  const chinese = learningPackRegistry.getPackForRoute('/app/chinese/grammar');
  const korean = learningPackRegistry.getPackForRoute('/app/korean/grammar');

  assert.ok(japanese);
  assert.ok(chinese);
  assert.ok(korean);
  for (const lesson of Object.values(JLPT_N5_LESSONS)) assert.ok(japanese.lessons.some((entry) => entry.id.endsWith(`:${lesson.id}`)));
  for (const lesson of HSK1_LESSONS) assert.ok(chinese.lessons.some((entry) => entry.id === lesson.id));
  for (const lesson of KOREAN_TOPIK1_LESSONS) assert.ok(korean.lessons.some((entry) => entry.id === lesson.id));
});

test('Korean completion retains an unlocked prerequisite after later SRS lapse', () => {
  const completed = {
    'ko:topik:topik1:hangul:foundations-01': { id: 'ko:topik:topik1:hangul:foundations-01', attempts: 1, lastScore: 4, bestScore: 4, total: 4, percent: 100, completed: true },
  };

  const path = resolveKoreanTopikPath({ reviewItems: {}, lessonProgress: completed });

  assert.equal(path.find((node) => node.id === 'ko:topik:topik1:pronunciation:batchim-01')?.status, 'active');
});

test('route access derives its language from the owning pack, not mutable UI state', () => {
  assert.equal(resolveLearningPackAccess('/app/japanese/grammar', 'free', false).allowed, true);
  assert.equal(resolveLearningPackAccess('/app/chinese/reading', 'free', false).allowed, true);
  assert.equal(resolveLearningPackAccess('/app/korean/grammar', 'free', false).allowed, false);
  assert.equal(resolveLearningPackAccess('/app/korean/grammar', 'pro', false).allowed, true);
});
