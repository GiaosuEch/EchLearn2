import { describe, it } from 'node:test';
import assert from 'node:assert';
import { diagnoseLearnerSentence } from '../../src/services/socraticDiagnosticEngine.ts';

describe('SocraticDiagnosticEngine - Deep Morphosyntax & L1 Transfer Analysis', () => {
  it('diagnoseLearnerSentence: should detect "very like" L1 transfer error with Socratic prompt', () => {
    const res = diagnoseLearnerSentence('I very like this coffee');
    assert.ok(res.hasCriticalErrors);
    assert.ok(res.diagnoses.some(d => d.category === 'L1_TRANSFER'));
    assert.ok(res.overallScore < 85);
  });

  it('diagnoseLearnerSentence: should detect "have many people" existence error', () => {
    const res = diagnoseLearnerSentence('In this room have many people.');
    assert.ok(res.hasCriticalErrors);
    const diag = res.diagnoses.find(d => d.detectedPattern.includes('Có nhiều người'));
    assert.ok(diag, 'Should identify "have many people" pattern');
    assert.ok(diag.socraticQuestionVi.length > 10);
  });

  it('diagnoseLearnerSentence: should detect Subject-Auxiliary agreement mismatch', () => {
    const res = diagnoseLearnerSentence('He don\'t know the answer.');
    assert.ok(res.hasCriticalErrors);
    assert.ok(res.diagnoses.some(d => d.category === 'AGREEMENT'));
  });

  it('diagnoseLearnerSentence: should give 100% score for natural, accurate input', () => {
    const res = diagnoseLearnerSentence('I really like learning languages on this platform.');
    assert.strictEqual(res.hasCriticalErrors, false);
    assert.strictEqual(res.diagnoses.length, 0);
    assert.strictEqual(res.overallScore, 100);
  });
});
