import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { generateExercisesForModule } from '../../src/curriculum/exerciseGenerator.ts';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const dummyT = (key: string, options?: Record<string, unknown>) => {
  return options?.defaultValue ? String(options.defaultValue) : key;
};

describe('direct chat honesty', () => {
  it('contains no simulated partner replies or fake AI translation wrappers', () => {
    const modal = read('src/components/community/DirectChatModal.tsx');

    assert.doesNotMatch(modal, /Simulated friendly AI partner/i, 'the fake delayed partner reply must stay deleted');
    assert.doesNotMatch(modal, /Math\.random/, 'random canned replies are forbidden');
    assert.doesNotMatch(modal, /Bản dịch AI/, 'a translation label may not wrap untranslated text');
    assert.match(modal, /chưa có phản hồi tự động/, 'an explicit offline state must replace fake replies');
    assert.match(modal, /Dịch tự động chưa khả dụng/, 'translation must surface an explicit unavailable state');
  });
});

describe('situational exercise honesty', () => {
  it('builds situational clozes only from real authored example sentences', async () => {
    const exercises = await generateExercisesForModule('en_mod_4', 'en', 'vi', dummyT, 'en_les_1');
    assert.ok(exercises.length > 0, 'the situational branch must still produce exercises');

    for (const exercise of exercises) {
      assert.match(exercise.question, /_____/, 'the question must contain a blank over a real sentence');
      const original = exercise.explanation.match(/Câu gốc: "(.+?)" \(/);
      assert.ok(original, `explanation must cite the original sentence for ${exercise.id}`);
      // The correct answer must literally occur in the cited original sentence.
      assert.ok(
        original[1].toLowerCase().includes(String(exercise.correctAnswer).toLowerCase()),
        `correct answer must come from the real sentence for ${exercise.id}`,
      );
      // No fabricated template English may remain.
      assert.doesNotMatch(exercise.question, /We must prioritize and/i);
      assert.doesNotMatch(exercise.question, /politically and semantically optimal/i);
    }
  });

  it('is deterministic for the same lesson inputs, including the situational branch', async () => {
    const first = await generateExercisesForModule('en_mod_4', 'en', 'vi', dummyT, 'en_les_1');
    const second = await generateExercisesForModule('en_mod_4', 'en', 'vi', dummyT, 'en_les_1');
    assert.deepEqual(second, first, 'reloading the same lesson must not reshuffle or change exercises');
  });
});
