import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  DEFAULT_MODEL_BENCHMARK_PLAN,
  validateModelBenchmarkPlan,
} from '../../src/platform/evaluation/modelBenchmarkPlan.ts';

describe('model benchmark planning contract', () => {
  it('defines a platform-first plan without claiming that a benchmark has run', () => {
    const plan = validateModelBenchmarkPlan(DEFAULT_MODEL_BENCHMARK_PLAN);

    assert.equal(plan.scope, 'platform');
    assert.equal(plan.status, 'planned');
    assert.ok(plan.tasks.includes('conversation'));
    assert.ok(plan.tasks.includes('assess'));
    assert.ok(plan.metrics.includes('quality-score'));
    assert.equal(plan.hasMeasuredResults, false);
  });

  it('rejects an empty task or metric plan', () => {
    assert.throws(() => validateModelBenchmarkPlan({
      ...DEFAULT_MODEL_BENCHMARK_PLAN,
      tasks: [],
    }));
    assert.throws(() => validateModelBenchmarkPlan({
      ...DEFAULT_MODEL_BENCHMARK_PLAN,
      metrics: [],
    }));
  });

  it('keeps exam-track vocabulary out of the platform benchmark module', () => {
    const source = readFileSync(
      new URL('../../src/platform/evaluation/modelBenchmarkPlan.ts', import.meta.url),
      'utf8',
    );

    assert.doesNotMatch(source, /IELTS|Task Response|Speaking Part|Writing Task/i);
  });
});
