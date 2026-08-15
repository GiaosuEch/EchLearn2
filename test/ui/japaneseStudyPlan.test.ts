import assert from 'node:assert/strict';
import test from 'node:test';

import { createJapaneseStudyPlan } from '../../src/curriculum/japaneseStudyPlan.ts';

test('Japanese dashboard prioritizes due SRS reviews before the next active lesson', () => {
  const plan = createJapaneseStudyPlan({
    dueReviewItemIds: [
      'ja:jlpt:n5:grammar-1:q1',
      'ja:jlpt:n5:vocab-1:vocab-1-card-1',
    ],
    nodes: [
      { id: 'kana-1', level: 'N5', title: 'Kana', type: 'kana', status: 'completed', progress: 100, unmetPrerequisites: [] },
      { id: 'vocab-1', level: 'N5', title: 'Vocabulary', type: 'vocabulary', status: 'active', progress: 50, unmetPrerequisites: [] },
      { id: 'grammar-1', level: 'N5', title: 'Grammar', type: 'grammar', status: 'completed', progress: 100, unmetPrerequisites: [] },
    ],
  });

  assert.deepEqual(plan, {
    dueReviewCount: 2,
    dueReviewHref: '/app/japanese/grammar?level=N5&lesson=grammar-1&review=ja%3Ajlpt%3An5%3Agrammar-1%3Aq1',
    nextLesson: { id: 'vocab-1', title: 'Vocabulary', href: '/app/japanese/vocabulary?level=N5&lesson=vocab-1', progress: 50 },
  });
});

test('Japanese dashboard preserves a usable route for legacy N5 vocabulary reviews', () => {
  const plan = createJapaneseStudyPlan({
    dueReviewItemIds: ['ja_v_11'],
    nodes: [
      { id: 'kana-1', level: 'N5', title: 'Kana', type: 'kana', status: 'completed', progress: 100, unmetPrerequisites: [] },
      { id: 'vocab-1', level: 'N5', title: 'Vocabulary', type: 'vocabulary', status: 'active', progress: 50, unmetPrerequisites: [] },
    ],
  });

  assert.equal(plan.dueReviewHref, '/app/japanese/vocabulary?level=N5&lesson=vocab-1&review=ja_v_11');
});

test('Japanese dashboard has no fabricated next lesson when every node is locked or complete', () => {
  const plan = createJapaneseStudyPlan({ dueReviewItemIds: [], nodes: [{ id: 'kana-1', level: 'N5', title: 'Kana', type: 'kana', status: 'completed', progress: 100, unmetPrerequisites: [] }] });
  assert.equal(plan.nextLesson, null);
});
