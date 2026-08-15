import assert from 'node:assert/strict';
import test from 'node:test';
import { CHINESE_HSK_REGISTRY, resolveChineseHskPath, validateChineseHskRegistry, type ChineseLessonDescriptor } from '../../src/curriculum/chineseHskRegistry.ts';
import { HSK1_LESSONS, HSK1_VOCABULARY, HSK1_VOCABULARY_DECKS, validateChineseHskContent } from '../../src/curriculum/chineseHsk1Content.ts';

test('HSK registry and authored HSK 1 content are valid', () => {
  assert.deepEqual(validateChineseHskRegistry(CHINESE_HSK_REGISTRY), []);
  assert.deepEqual(validateChineseHskContent(HSK1_VOCABULARY, HSK1_LESSONS), []);
  assert.equal(HSK1_VOCABULARY.length, 40);
  assert.deepEqual(HSK1_VOCABULARY_DECKS.map((deck) => deck.cards.length), [20, 20]);
  for (const deck of HSK1_VOCABULARY_DECKS) {
    assert.ok(CHINESE_HSK_REGISTRY.some((lesson) => lesson.id === deck.id));
  }
  for (const lesson of HSK1_LESSONS) {
    assert.ok(CHINESE_HSK_REGISTRY.some((descriptor) => descriptor.id === lesson.id));
  }
});

test('HSK progress only counts recalled, namespaced Chinese review IDs', () => {
  const reviewItems = Object.fromEntries([
    ...HSK1_VOCABULARY.slice(0, 10).map((item) => [item.id, { n: 1 }]),
    ['ja_v_1', { n: 10 }],
    ['jlpt:n5:grammar-1:q1', { n: 10 }],
  ]);
  const path = resolveChineseHskPath({ level: 'HSK1', reviewItems, lessonProgress: {} });
  assert.equal(path.find((node) => node.type === 'vocabulary')?.progress, 50);
  assert.equal(path.find((node) => node.type === 'grammar')?.status, 'active');
  assert.equal(path.find((node) => node.type === 'reading')?.status, 'locked');
  assert.match(path.find((node) => node.type === 'reading')?.unlockReason ?? '', /zh:hsk:hsk1:grammar/);
});

test('a failed Chinese review cannot unlock the grammar lesson', () => {
  const reviewItems = Object.fromEntries(HSK1_VOCABULARY.map((item) => [item.id, { n: 0 }]));
  const path = resolveChineseHskPath({ level: 'HSK1', reviewItems, lessonProgress: {} });
  assert.equal(path.find((node) => node.type === 'vocabulary')?.progress, 0);
  assert.equal(path.find((node) => node.type === 'grammar')?.status, 'locked');
});

test('validator rejects duplicate IDs and prerequisite cycles', () => {
  const first = CHINESE_HSK_REGISTRY[0]; const second = CHINESE_HSK_REGISTRY[1];
  const cycle: ChineseLessonDescriptor[] = [
    { ...first, prerequisites: [{ lessonId: second.id, minimumPercent: 80 }] },
    { ...second, prerequisites: [{ lessonId: first.id, minimumPercent: 80 }] },
    first,
  ];
  const issues = validateChineseHskRegistry(cycle).join('\n');
  assert.match(issues, /duplicate lesson id/); assert.match(issues, /prerequisite cycle/);
});

test('content validator rejects missing tones, missing answers, duplicate distractors, wrong levels, and empty analysis', () => {
  const item = { ...HSK1_VOCABULARY[0], id: 'zh:hsk:hsk1:vocab:999' as const, pinyin: 'ni' };
  const lesson = { ...HSK1_LESSONS[0], id: 'zh:hsk:hsk2:pronunciation:bad', level: 'HSK2' as never, questions: [{ ...HSK1_LESSONS[0].questions[0], correctChoiceId: 'missing', analysis: '', choices: [HSK1_LESSONS[0].questions[0].choices[0], HSK1_LESSONS[0].questions[0].choices[0]] }] };
  const issues = validateChineseHskContent([item], [lesson]).join('\n');
  assert.match(issues, /pinyin missing tone/); assert.match(issues, /missing answer/); assert.match(issues, /duplicate distractor/); assert.match(issues, /wrong-level content/); assert.match(issues, /empty lesson analysis/);
});
