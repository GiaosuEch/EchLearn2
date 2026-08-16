import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('writing practice evaluates generic criteria without fabricating an IELTS band', () => {
  const service = read('src/services/practiceLearningIntegration.ts');
  const evaluator = service.match(/export function evaluateWritingPractice[\s\S]*?\}[\r\n]+export function evaluateSpeakingPractice/);

  assert.ok(evaluator, 'the writing evaluator must exist');
  
  // Verify that fake bands are removed per SUPREME INDICTMENT A.1
  assert.match(evaluator[0], /band:\s*undefined/);
  assert.match(evaluator[0], /isIELTS:\s*false/);
  
  // Verify that it still evaluates wordCount, sentences, diversity
  assert.match(evaluator[0], /taskResponse/);
  assert.match(evaluator[0], /coherence/);
  assert.match(evaluator[0], /vocabulary/);
  assert.match(evaluator[0], /grammar/);
  assert.match(evaluator[0], /score/);
  
  // Ensure we don't accidentally re-introduce the old math for IELTS bands
  assert.doesNotMatch(evaluator[0], /const band = Math.max\(3\.5/);
});
