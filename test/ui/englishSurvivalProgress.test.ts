import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, test } from 'node:test';

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
    clear: () => storage.clear(),
  },
});

const { englishSurvival30 } = await import('../../src/curriculum/englishSurvival30.ts');
const {
  createEnglishSurvivalCompletionService,
  normalizeEnglishSurvivalAnswer,
} = await import('../../src/services/englishSurvivalProgressService.ts');

const lesson = englishSurvival30[0];
const learnerId = 'survival-progress-learner';

function validInput() {
  return {
    lesson,
    userId: learnerId,
    nativeLanguage: 'vi',
    interfaceLanguage: 'vi',
    productionResponse: 'Hello, I\'m Minh. Nice to meet you.',
    retrievalResponse: "  HELLO, I'M LAN!  ",
    selfReview: Object.fromEntries(lesson.selfReview.map((prompt) => [prompt, true])),
    recordingDurationSec: 18,
  };
}

beforeEach(() => storage.clear());

test('a valid English Survival completion records its concrete lesson', async () => {
  const recorded: Array<{ activityId: string; score?: number; total?: number }> = [];
  const marked: [string, string][] = [];
  const complete = createEnglishSurvivalCompletionService({
    async recordPracticeAttempt(input) {
      recorded.push(input);
      return {
        id: 'attempt-1', userId: learnerId, targetLanguage: 'en', skillType: 'lesson', activityId: lesson.id,
        score: 1, total: 1, percent: 100, xpEarned: 0, masteryAverage: 0, weakItems: [],
        nextAction: { label: 'Tiếp tục bài học', path: '/app/lesson', reason: 'completed' }, createdAt: '2026-08-11T00:00:00.000Z',
      };
    },
    async markLessonCompleted(userId, lessonId) {
      marked.push([userId, lessonId]);
    },
  });
  const result = await complete(validInput());

  assert.equal(result.ok, true);
  if (!result.ok) assert.fail(result.messageVi);
  assert.equal(result.completedLessonId, lesson.id);
  assert.equal(result.attempt.score, 1);
  assert.equal(result.attempt.total, 1);
  assert.deepEqual(marked, [[learnerId, lesson.id]]);
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0].activityId, lesson.id);
  assert.equal(recorded[0].score, 1);
  assert.equal(recorded[0].total, 1);
});

test('English Survival completion rejects empty production', async () => {
  const result = await completionForValidation({ ...validInput(), productionResponse: '   ' });

  assert.deepEqual(result, {
    ok: false,
    code: 'production_required',
    messageVi: 'Hãy tự viết hoặc nói một câu của riêng bạn trước khi hoàn thành.',
  });
});

test('English Survival completion rejects an exact normalized model copy', async () => {
  const result = await completionForValidation({ ...validInput(), productionResponse: '  hello, i\'m mai. nice to meet you! ' });

  assert.equal(result.ok, false);
  if (result.ok) assert.fail('model copy should not complete a lesson');
  assert.equal(result.code, 'production_copies_model');
});

test('English Survival completion rejects a wrong retrieval response', async () => {
  const result = await completionForValidation({ ...validInput(), retrievalResponse: 'Where is the station?' });

  assert.equal(result.ok, false);
  if (result.ok) assert.fail('wrong retrieval should not complete a lesson');
  assert.equal(result.code, 'retrieval_incorrect');
});

test('English Survival completion requires all four explicit self-review values', async () => {
  const result = await completionForValidation({
    ...validInput(),
    selfReview: { [lesson.selfReview[0]]: true },
  });

  assert.equal(result.ok, false);
  if (result.ok) assert.fail('incomplete self-review should not complete a lesson');
  assert.equal(result.code, 'self_review_incomplete');
});

test('English Survival completion requires every self-review value to be confirmed', async () => {
  const selfReview = Object.fromEntries(lesson.selfReview.map((prompt) => [prompt, true]));
  selfReview[lesson.selfReview[2]] = false;
  const result = await completionForValidation({ ...validInput(), selfReview });

  assert.equal(result.ok, false);
  if (result.ok) assert.fail('an unconfirmed self-review should not complete a lesson');
  assert.equal(result.code, 'self_review_incomplete');
});

async function completionForValidation(input: ReturnType<typeof validInput>) {
  const complete = createEnglishSurvivalCompletionService({
    async recordPracticeAttempt() {
      throw new Error('validation should run before persistence');
    },
    async markLessonCompleted() {
      throw new Error('validation should run before persistence');
    },
  });
  return complete(input);
}

test('answer normalization accepts formatting differences without loosening content', () => {
  assert.equal(normalizeEnglishSurvivalAnswer(' Hello, I\u2019m Lan... '), "hello, i'm lan");
  assert.notEqual(normalizeEnglishSurvivalAnswer('Hello, I\'m Mai'), normalizeEnglishSurvivalAnswer('Hello, I\'m Lan'));
});

test('English Survival persistence source has no automated assessment fields', () => {
  const source = readFileSync(fileURLToPath(new URL('../../src/services/englishSurvivalProgressService.ts', import.meta.url)), 'utf8');
  for (const prohibited of ['aiScore', 'proficiencyScore', 'pronunciationScore', 'bandScore']) {
    assert.equal(source.includes(prohibited), false, `${prohibited} must not be present`);
  }
});
