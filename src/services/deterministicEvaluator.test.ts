import { describe, it, expect } from 'vitest';
import { deterministicEvaluator, levenshtein } from './deterministicEvaluator';

describe('Deterministic Evaluator', () => {
  describe('levenshtein', () => {
    it('should calculate distance correctly', () => {
      expect(levenshtein('kitten', 'sitting')).toBe(3);
      expect(levenshtein('flitten', 'flitten')).toBe(0);
      expect(levenshtein('', 'abc')).toBe(3);
      expect(levenshtein('abc', '')).toBe(3);
    });
  });

  describe('evaluateText', () => {
    it('should return exact match', () => {
      const res = deterministicEvaluator.evaluateText('Hello World', 'hello world!');
      expect(res.isCorrect).toBe(true);
      expect(res.isClose).toBe(true);
      expect(res.score).toBe(1.0);
    });

    it('should return close match for 1 typo', () => {
      const res = deterministicEvaluator.evaluateText('wonderfl', 'wonderful');
      expect(res.isCorrect).toBe(true);
      expect(res.isClose).toBe(true);
      // Max length = 9, distance = 1. Score = 8/9 = 0.888...
      expect(res.score).toBeGreaterThan(0.8);
    });

    it('should fail for completely wrong words', () => {
      const res = deterministicEvaluator.evaluateText('apple', 'banana');
      expect(res.isCorrect).toBe(false);
      expect(res.isClose).toBe(false);
      expect(res.score).toBeLessThan(0.8);
    });
  });
});
