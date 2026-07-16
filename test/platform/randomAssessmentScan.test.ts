import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findAssessmentRandomness } from '../../src/platform/quality/randomAssessmentScan.ts';

describe('random assessment scanner', () => {
  it('finds random scoring/content decisions in assessment scope', () => {
    const violations = findAssessmentRandomness(
      [
        'const estimate = Math.random() * 9;',
        'const nextItems = shuffle(items);',
        '// Math.random in a comment is ignored',
      ].join('\n'),
      'assessment',
    );

    assert.equal(violations.length, 2);
    assert.deepEqual(
      violations.map((violation) => violation.line),
      [1, 2],
    );
    assert.equal(violations[0].kind, 'random-assessment-decision');
  });

  it('does not flag explicitly cosmetic or content-variation randomness', () => {
    const violations = findAssessmentRandomness(
      [
        '// @random-allowed cosmetic',
        'const height = Math.random() * 10;',
        '// @random-allowed content-variation',
        'const nextItems = shuffle(items);',
      ].join('\n'),
      'assessment',
    );

    assert.deepEqual(violations, []);
    assert.deepEqual(findAssessmentRandomness('const height = Math.random() * 10;', 'cosmetic'), []);
  });

  it('reports randomInt and randomFloat while ignoring comments and strings', () => {
    const violations = findAssessmentRandomness(
      [
        '  ',
        'const confidence = randomInt(0, 1);',
        'const note = "Math.random() and randomFloat() are text";',
        '/* randomFloat() */',
        'const estimate = randomFloat(0, 1);',
      ].join('\n'),
      'assessment',
    );

    assert.equal(violations.length, 2);
    assert.deepEqual(
      violations.map((violation) => [violation.pattern, violation.line]),
      [
        ['randomInt', 2],
        ['randomFloat', 5],
      ],
    );
  });

  it('finds random decisions inside template expressions', () => {
    const violations = findAssessmentRandomness(
      'const height = `${Math.random() * 100}%`;',
      'assessment',
    );

    assert.equal(violations.length, 1);
    assert.equal(violations[0].pattern, 'Math.random');
  });

  it('reports a canned outcome presented as AI-generated', () => {
    const violations = findAssessmentRandomness(
      [
        'const result = {',
        '  isAiGenerated: true,',
        '  score: 7,',
        '  feedback: "Excellent work"',
        '};',
      ].join('\n'),
      'assessment',
    );

    assert.equal(violations.length, 1);
    assert.equal(violations[0].kind, 'canned-assessment-outcome');
    assert.equal(violations[0].line, 2);
  });

  it('reports forbidden simulation modes across generic risk scopes', () => {
    const source = 'const outcome = { mode: "hardcoded", feedback: "Personalized feedback" };';

    for (const scope of ['assessment', 'evaluation', 'scoring', 'feedback'] as const) {
      const violations = findAssessmentRandomness(source, scope);
      assert.equal(violations.length, 1);
      assert.equal(violations[0].kind, 'canned-assessment-outcome');
    }
  });
});
