import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getJapaneseAuthoredLesson,
  getJapaneseAuthoredLessons,
  getJapaneseContentLessonId,
} from '../../src/curriculum/japaneseLessonContentResolver.ts';

test('resolves authored Japanese content only from the requested JLPT level', () => {
  const lesson = getJapaneseAuthoredLesson('N5', 'grammar-1');

  assert.equal(lesson?.id, 'grammar-1');
  assert.equal(lesson?.level, 'N5');
  assert.equal(getJapaneseAuthoredLesson('N4', 'grammar-1'), undefined);
  assert.equal(getJapaneseAuthoredLessons('N5').length, 60);
  assert.deepEqual(getJapaneseAuthoredLessons('N4'), []);
});

test('rejects progress IDs that belong to another JLPT level', () => {
  assert.equal(
    getJapaneseContentLessonId('ja:jlpt:n5:grammar-1', 'N5'),
    'grammar-1',
  );
  assert.equal(
    getJapaneseContentLessonId('ja:jlpt:n5:grammar-1', 'N4'),
    undefined,
  );
  assert.equal(getJapaneseContentLessonId('grammar-1', 'N5'), undefined);
});
