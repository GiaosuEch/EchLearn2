import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JLPT_N5_LESSONS,
  calculateLessonXp,
  getLessonCompletion,
  validateJLPTN5Lessons,
} from '../../src/curriculum/jlptN5Lessons.ts';
import { JAPANESE_LESSON_REGISTRY } from '../../src/curriculum/japaneseCurriculumRegistry.ts';

test('JLPT N5 grammar and reading lessons are fully authored local content', () => {
  const grammar = JLPT_N5_LESSONS['grammar-1'];
  const reading = JLPT_N5_LESSONS['reading-1'];

  assert.equal(grammar.skill, 'grammar');
  assert.ok(grammar.explanation.length > 0);
  assert.ok(grammar.examples.length >= 2);
  assert.ok(grammar.questions.length >= 3);
  assert.ok(grammar.examples.every((example) => example.japanese.some((segment) => Boolean(segment.ruby))));

  assert.equal(reading.skill, 'reading');
  assert.ok(reading.passage.length >= 6);
  assert.ok(reading.questions.length >= 3);
  assert.ok(reading.questions.every((question) => question.analysis.length > 0));
});

test('lesson completion is deterministic and only completes at the 80 percent threshold', () => {
  assert.deepEqual(getLessonCompletion(2, 3), { percent: 67, completed: false });
  assert.deepEqual(getLessonCompletion(3, 3), { percent: 100, completed: true });
  assert.equal(calculateLessonXp(3, 3), 50);
  assert.equal(calculateLessonXp(1, 3), 10);
});

test('every N5 lesson has answerable questions, analyses, and annotated Japanese', () => {
  assert.deepEqual(validateJLPTN5Lessons(), []);
  for (const lesson of Object.values(JLPT_N5_LESSONS)) {
    assert.ok(lesson.questions.length >= 3);
    assert.ok(lesson.questions.every((question) => question.choices.length >= 3 && question.analysis.length > 0));
  }
});

test('every authored N5 grammar or reading path node resolves to exactly one lesson', () => {
  const routeLessonIds = JAPANESE_LESSON_REGISTRY
    .filter((lesson) => lesson.level === 'N5' && (lesson.skill === 'grammar' || lesson.skill === 'reading'))
    .map((lesson) => lesson.id)
    .sort();

  assert.deepEqual(Object.keys(JLPT_N5_LESSONS).sort(), routeLessonIds);
});
