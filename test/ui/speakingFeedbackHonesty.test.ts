import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('speaking practice records completion without fabricating a proficiency score', () => {
  const service = read('src/services/practiceLearningIntegration.ts');
  const page = read('src/pages/app/practice/SpeakingPracticePage.tsx');
  const evaluator = service.match(/export function evaluateSpeakingPractice[\s\S]*?\n}\n\nexport async function saveWritingFeedback/);

  assert.ok(evaluator, 'the speaking evaluator must exist');
  assert.match(evaluator[0], /Hệ thống chưa chấm phát âm/);
  assert.match(evaluator[0], /completionAwarded/);
  assert.doesNotMatch(evaluator[0], /const pronunciation\s*=/);
  assert.doesNotMatch(evaluator[0], /const fluency\s*=/);
  assert.doesNotMatch(evaluator[0], /const band\s*=/);
  assert.doesNotMatch(page, /AI nhận diện phát âm|instant AI scoring|feedback\.(score|categories|band)/);
  assert.match(page, /Lưu bài luyện/);
});
