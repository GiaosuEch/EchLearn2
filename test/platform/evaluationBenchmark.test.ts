import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  EvaluationBenchmarkError,
  validateEvaluationBenchmark,
} from '../../src/platform/evaluation/evaluationBenchmark.ts';

const baseBenchmark = {
  benchmarkId: 'platform-quality',
  version: 'platform-quality@1',
  scope: 'platform' as const,
  rubricVersion: 'quality-rubric@1',
  promotionThreshold: 0.8,
  calibrationStatus: 'internal' as const,
  cases: [
    { caseId: 'case-1', inputRef: 'fixture://case-1', expectedBehaviors: ['bounded-output'] },
    { caseId: 'case-2', inputRef: 'fixture://case-2', expectedBehaviors: ['abstention'] },
  ],
};

describe('evaluation benchmark contract', () => {
  it('accepts a versioned internal benchmark with unique cases', () => {
    const benchmark = validateEvaluationBenchmark(baseBenchmark);

    assert.equal(benchmark.scope, 'platform');
    assert.equal(benchmark.cases.length, 2);
    assert.equal(benchmark.calibrationStatus, 'internal');
  });

  it('rejects empty benchmarks and duplicate case identifiers', () => {
    assert.throws(
      () => validateEvaluationBenchmark({ ...baseBenchmark, cases: [] }),
      (error) =>
        error instanceof EvaluationBenchmarkError && error.code === 'CASES_REQUIRED',
    );
    assert.throws(
      () =>
        validateEvaluationBenchmark({
          ...baseBenchmark,
          cases: [baseBenchmark.cases[0], baseBenchmark.cases[0]],
        }),
      (error) =>
        error instanceof EvaluationBenchmarkError && error.code === 'DUPLICATE_CASE',
    );
  });

  it('rejects thresholds outside zero-to-one', () => {
    assert.throws(
      () => validateEvaluationBenchmark({ ...baseBenchmark, promotionThreshold: 1.2 }),
      (error) =>
        error instanceof EvaluationBenchmarkError && error.code === 'INVALID_THRESHOLD',
    );
  });

  it('does not accept an official calibration claim without a calibration record', () => {
    assert.throws(
      () =>
        validateEvaluationBenchmark({
          ...baseBenchmark,
          calibrationStatus: 'official',
        }),
      (error) =>
        error instanceof EvaluationBenchmarkError && error.code === 'INVALID_CALIBRATION_STATUS',
    );
  });
});
