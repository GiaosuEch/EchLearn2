import { test, describe } from 'node:test';
import * as assert from 'node:assert/strict';
import { analyzeTextMetrics, calculateBandScore } from '../../src/domain/ielts/ScoringEngine.ts';

describe('ScoringEngine - analyzeTextMetrics', () => {
  test('returns 0 for empty string', () => {
    const metrics = analyzeTextMetrics('');
    assert.equal(metrics.wordCount, 0);
    assert.equal(metrics.uniqueWordCount, 0);
    assert.equal(metrics.averageSentenceLength, 0);
  });

  test('correctly counts words and sentences', () => {
    const text = 'This is a test. It has two sentences and some complex words like analyze and evaluate.';
    const metrics = analyzeTextMetrics(text);
    assert.equal(metrics.wordCount, 16);
    assert.equal(metrics.averageSentenceLength, 8); // 16 words / 2 sentences
  });

  test('detects academic vocabulary and transition words', () => {
    const text = 'However, we must analyze the data. Therefore, the approach is significant.';
    const metrics = analyzeTextMetrics(text);
    assert.equal(metrics.wordCount, 11);
    // Academic words: analyze, data, approach, significant = 4
    // 4 / 11 = 0.363
    assert.ok(metrics.academicVocabularyRatio > 0.3);
    // Transition words: However, Therefore = 2
    // 2 / 11 = 0.181
    assert.ok(metrics.transitionWordDensity > 0.1);
  });
});

describe('ScoringEngine - calculateBandScore', () => {
  test('penalizes for low word count on Task 1', () => {
    const text = 'This is a very short essay. It does not meet the word count.';
    const feedback = calculateBandScore(text, 'Task 1', 150);
    assert.equal(feedback.criteria.ta.score, 4.0); // 5.0 - 1.0
  });

  test('awards high score for strong academic essay', () => {
    const text = 'However, we must analyze the data carefully. Furthermore, the approach is significant because it provides a new perspective on the issue. In conclusion, the evidence strongly supports the initial hypothesis and we can assume the results are valid.';
    const feedback = calculateBandScore(text, 'Task 2', 20); // Low word count expectation just to pass TA
    assert.ok(feedback.criteria.ta.score >= 7.0);
    assert.ok(feedback.criteria.cc.score >= 7.0);
    assert.ok(feedback.criteria.lr.score >= 7.0); // analyze, data, approach, significant, evidence, assume, hypothesis, valid
    assert.ok(feedback.criteria.gra.score >= 6.5);
    assert.ok(feedback.band >= 7.0);
  });
});
