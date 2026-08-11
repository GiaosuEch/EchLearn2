import test from 'node:test';
import assert from 'node:assert/strict';
import { getCourseForLanguage } from '../../src/curriculum/courseRegistry.ts';

test('English routes to the curated thirty-lesson survival course', () => {
  const course = getCourseForLanguage('en');
  const lessons = course?.flatMap((unit) => unit.lessons) ?? [];

  assert.equal(lessons.length, 30);
  assert.equal(lessons[0]?.id, 'en-survival-1');
  assert.equal(course?.some((unit) => unit.id === 'en_mod_1'), false);
});

test('US English also routes to the curated survival course', () => {
  const course = getCourseForLanguage('en-US');

  assert.equal(course?.flatMap((unit) => unit.lessons).length, 30);
  assert.equal(course?.[0]?.lessons[0]?.id, 'en-survival-1');
});

test('each curated English Survival module contains five lessons', () => {
  const course = getCourseForLanguage('en');

  assert.equal(course?.length, 6);
  assert.ok(course?.every((unit) => unit.lessons.length === 5));
});

test('non-English languages continue to use generated courses', () => {
  assert.equal(getCourseForLanguage('ja')?.[0]?.id, 'ja_mod_1');
});

test('unregistered language IDs use the generated English fallback', () => {
  assert.equal(getCourseForLanguage('en-GB')?.[0]?.id, 'en_mod_1');
});
