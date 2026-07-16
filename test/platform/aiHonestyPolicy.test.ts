import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  AIHonestyPolicyError,
  validateAIOutcome,
} from '../../src/platform/quality/aiHonestyPolicy.ts';

describe('AI honesty outcome policy', () => {
  it('marks deterministic learning output as not AI-generated', () => {
    const outcome = validateAIOutcome({
      status: 'completed',
      mode: 'deterministic',
      output: { feedback: 'Review the example and try again.' },
      provenance: { policyVersion: 'ai-honesty@1' },
    });

    assert.equal(outcome.status, 'completed');
    assert.equal(outcome.mode, 'deterministic');
    assert.equal(outcome.isAiGenerated, false);
  });

  it('requires approved artifact provenance for local-model output', () => {
    assert.throws(
      () =>
        validateAIOutcome({
          status: 'completed',
          mode: 'local-model',
          output: { feedback: 'Generated feedback.' },
          provenance: { benchmarkVersion: 'platform-quality@1' },
        }),
      (error) =>
        error instanceof AIHonestyPolicyError &&
        error.code === 'APPROVED_ARTIFACT_REQUIRED',
    );
  });

  it('keeps unavailable capabilities free of fabricated output', () => {
    assert.throws(
      () =>
        validateAIOutcome({
          status: 'unavailable',
          mode: 'local-model',
          reason: 'MODEL_NOT_APPROVED',
          output: { feedback: 'Pretend generated feedback.' },
        }),
      (error) =>
        error instanceof AIHonestyPolicyError && error.code === 'UNAVAILABLE_WITH_OUTPUT',
    );
  });

  it('rejects mock, random, hardcoded, and canned simulation modes', () => {
    for (const mode of ['mock', 'random', 'hardcoded', 'canned']) {
      assert.throws(
        () =>
          validateAIOutcome({
            status: 'completed',
            mode,
            output: { feedback: 'Simulated personalized output.' },
          }),
        (error) =>
          error instanceof AIHonestyPolicyError &&
          error.code === 'FORBIDDEN_SIMULATION_MODE',
      );
    }
  });

  it('accepts an explicit unavailable state without inventing a result', () => {
    const outcome = validateAIOutcome({
      status: 'unavailable',
      mode: 'local-model',
      reason: 'WEBGPU_UNAVAILABLE',
    });

    assert.deepEqual(outcome, {
      status: 'unavailable',
      mode: 'local-model',
      reason: 'WEBGPU_UNAVAILABLE',
      isAiGenerated: false,
    });
  });
});
