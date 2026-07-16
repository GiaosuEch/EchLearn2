import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ModelPromotionError,
  promoteModelCandidate,
  type ModelCandidate,
} from '../../src/platform/ai/modelRegistry.ts';

const artifactOrigins = ['https://models.example.test'];

function completeCandidate(): ModelCandidate {
  return {
    candidateId: 'candidate-a',
    tier: 'light',
    modelVersion: 'revision-2026-07-16',
    runtimeVersion: 'runtime-1.0.0',
    tokenizerVersion: 'tokenizer-revision-1',
    artifact: {
      url: 'https://models.example.test/light/revision-2026-07-16/model.bin',
      byteSize: 480_000_000,
      sha256: 'a'.repeat(64),
      projectHosted: true,
    },
    license: {
      status: 'approved',
      commercialUse: true,
      redistribution: true,
      evidenceUrl: 'https://models.example.test/license',
      noticePath: 'THIRD_PARTY_LICENSES.md',
    },
    benchmark: {
      status: 'passed',
      suiteVersion: 'platform-eval@1',
      rubricVersion: 'quality-rubric@1',
      caseCount: 30,
      qualityScore: 0.84,
      promotionThreshold: 0.8,
      targetHardware: ['webgpu-reference@1'],
    },
  };
}

describe('model registry promotion policy', () => {
  it('promotes only a complete, benchmarked, commercially approved artifact', () => {
    const approved = promoteModelCandidate(completeCandidate(), {
      allowedArtifactOrigins: artifactOrigins,
    });

    assert.equal(approved.approvalStatus, 'approved');
    assert.equal(approved.tier, 'light');
    assert.equal(approved.artifact.projectHosted, true);
  });

  it('blocks a candidate without commercial redistribution approval', () => {
    const candidate = completeCandidate();
    candidate.license.status = 'needs-verification';

    assert.throws(
      () => promoteModelCandidate(candidate, { allowedArtifactOrigins: artifactOrigins }),
      (error) =>
        error instanceof ModelPromotionError && error.code === 'LICENSE_NOT_APPROVED',
    );
  });

  it('blocks a candidate below its declared benchmark threshold', () => {
    const candidate = completeCandidate();
    candidate.benchmark.qualityScore = 0.79;

    assert.throws(
      () => promoteModelCandidate(candidate, { allowedArtifactOrigins: artifactOrigins }),
      (error) =>
        error instanceof ModelPromotionError && error.code === 'BENCHMARK_NOT_PASSED',
    );
  });

  it('blocks artifacts outside project storage or without a real digest', () => {
    const candidate = completeCandidate();
    candidate.artifact.url = 'https://huggingface.co/org/model/resolve/main/model.bin';

    assert.throws(
      () => promoteModelCandidate(candidate, { allowedArtifactOrigins: artifactOrigins }),
      (error) =>
        error instanceof ModelPromotionError && error.code === 'ARTIFACT_ORIGIN_NOT_ALLOWED',
    );

    candidate.artifact.url = completeCandidate().artifact.url;
    candidate.artifact.sha256 = 'latest';

    assert.throws(
      () => promoteModelCandidate(candidate, { allowedArtifactOrigins: artifactOrigins }),
      (error) =>
        error instanceof ModelPromotionError && error.code === 'INVALID_ARTIFACT_INTEGRITY',
    );
  });
});
