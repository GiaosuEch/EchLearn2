import { test, describe } from 'node:test';
import assert from 'node:assert';
import { resolveAuthoredLesson } from '../../src/curriculum/roadmap/lessonPayloadResolver.ts';

describe('lessonPayloadResolver', () => {
  test('resolveAuthoredLesson - resolves Kana lesson with actual phases content', () => {
    const payload = resolveAuthoredLesson('kana-1');
    assert.ok(payload !== null, 'Should resolve kana lesson');
    assert.strictEqual(payload?.type, 'japanese', 'Type should be japanese');
    
    // Crucial requirement: must include content, not just metadata
    assert.ok(payload?.content.phases !== undefined, 'Content should have phases resolved from jlptN5Kana');
    assert.ok(payload?.content.phases.length > 0, 'Phases should not be empty');
    assert.strictEqual(payload?.content.phases[0].type, 'introduce');
  });

  test('resolveAuthoredLesson - resolves HSK vocabulary lesson with actual cards', () => {
    const payload = resolveAuthoredLesson('zh:hsk:hsk1:vocabulary:foundations-01');
    assert.ok(payload !== null, 'Should resolve HSK vocab lesson');
    assert.strictEqual(payload?.type, 'chinese', 'Type should be chinese');
    
    assert.ok(payload?.content.examples !== undefined, 'Content should have examples mapped from cards');
    assert.ok(payload?.content.examples.length > 0, 'Examples should not be empty');
  });

  test('resolveAuthoredLesson - resolves TOPIK vocabulary lesson with actual cards', () => {
    const payload = resolveAuthoredLesson('ko:topik:topik1:vocabulary:foundations-01');
    assert.ok(payload !== null, 'Should resolve TOPIK vocab lesson');
    assert.strictEqual(payload?.type, 'korean', 'Type should be korean');
    
    assert.ok(payload?.content.examples !== undefined, 'Content should have examples mapped from cards');
    assert.ok(payload?.content.examples.length > 0, 'Examples should not be empty');
  });

  test('resolveAuthoredLesson - returns null for non-existent lesson', () => {
    const payload = resolveAuthoredLesson('non-existent-lesson');
    assert.strictEqual(payload, null);
  });
});
