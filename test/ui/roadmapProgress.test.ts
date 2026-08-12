import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveNextLesson } from '../../src/viewmodels/roadmapProgress.ts';

const course = [
  { id: 'en_mod_1', lessons: [{ id: 'en_les_1' }, { id: 'en_les_2' }] },
  { id: 'en_mod_2', lessons: [{ id: 'en_les_37' }, { id: 'en_les_38' }] },
];

test('roadmap resolves the first incomplete lesson instead of the module index', () => {
  const firstModuleLessonIds = course[0].lessons.map((lesson) => lesson.id);
  const next = resolveNextLesson(course, firstModuleLessonIds);

  assert.equal(next?.moduleId, 'en_mod_2');
  assert.equal(next?.lessonId, 'en_les_37');
  assert.equal(next?.path, '/app/lesson?id=en_mod_2&lesId=en_les_37');
});

test('roadmap returns the first incomplete lesson within the active module', () => {
  const completed = ['en_les_1'];
  const next = resolveNextLesson(course, completed);

  assert.equal(next?.lessonId, 'en_les_2');
});

test('roadmap returns null when every lesson is complete', () => {
  const completed = course.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  assert.equal(resolveNextLesson(course, completed), null);
});
