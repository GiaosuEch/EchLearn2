import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  createModelCandidatePlaceholder,
  type ModelCandidate,
} from '../../src/platform/evaluation/modelBenchmarkPlan.ts';
import { scoreModelCandidate } from '../../src/platform/evaluation/modelCandidateScoring.ts';

function measurement(value: number, unit: 'bytes' | 'milliseconds' | 'score', evidenceRef: string) {
  return { value, unit, evidenceRef } as const;
}

function completeCandidate(): ModelCandidate {
  return {
    candidateId: 'candidate-light-v1',
    modelVersion: 'revision-2026-07-16',
    runtimeProvider: 'transformers-js',
    requiredTier: 'light-local',
    license: {
      status: 'verified',
      commercialUse: true,
      redistribution: true,
      evidenceRef: 'license-review-1',
    },
    artifact: {
      status: 'available',
      hosting: 'project-controlled',
      checksum: 'a'.repeat(64),
      url: 'https://models.example.test/candidate-light-v1/model.bin',
      downloadAllowed: true,
    },
    benchmark: {
      status: 'passed',
      benchmarkId: 'platform-model-eval',
      benchmarkVersion: 'platform-model-eval@1',
      promotionThreshold: 0.8,
      metrics: {
        artifactSizeBytes: measurement(120_000_000, 'bytes', 'artifact-manifest-1'),
        coldStartMs: measurement(1_200, 'milliseconds', 'benchmark-run-1'),
        peakMemoryBytes: measurement(800_000_000, 'bytes', 'benchmark-run-1'),
        p50LatencyMs: measurement(260, 'milliseconds', 'benchmark-run-1'),
        qualityScore: measurement(0.9, 'score', 'benchmark-run-1'),
      },
      languageCoverage: ['en', 'vi'],
      taskCoverage: ['conversation', 'explain', 'feedback', 'generate-practice', 'summarize', 'classify', 'assess', 'plan-study', 'recommend-next-practice'],
      calibrationStatus: 'internal',
      evidence: [
        { id: 'license-review-1', source: 'license-review' },
        { id: 'artifact-manifest-1', source: 'artifact-manifest' },
        { id: 'benchmark-run-1', source: 'benchmark-run' },
      ],
    },
    privacyReview: 'passed',
    securityReview: 'passed',
    approvalStatus: 'approved',
    productionReady: true,
    limitations: ['Measured on a declared reference device only.'],
    rejectionReasons: [],
  };
}

describe('model candidate scoring and approval policy', () => {
  it('approves only a candidate with verified license, evidence and passed benchmark', () => {
    const decision = scoreModelCandidate(completeCandidate(), 'light-local');

    assert.equal(decision.status, 'approved');
    assert.equal(decision.productionReady, true);
    assert.deepEqual(decision.rejectionReasons, []);
  });

  it('does not approve a candidate before a real benchmark has run', () => {
    const candidate = completeCandidate();
    candidate.benchmark.status = 'not-run';
    candidate.approvalStatus = 'candidate';
    candidate.productionReady = false;

    const decision = scoreModelCandidate(candidate);

    assert.equal(decision.status, 'not-approved');
    assert.equal(decision.productionReady, false);
    assert.ok(decision.rejectionReasons.includes('benchmark-not-run'));
  });

  it('does not approve a license that is not verified for commercial redistribution', () => {
    const candidate = completeCandidate();
    candidate.license.status = 'needs-verification';

    const decision = scoreModelCandidate(candidate);

    assert.equal(decision.status, 'not-approved');
    assert.ok(decision.rejectionReasons.includes('license-not-verified'));
  });

  it('rejects benchmark numbers when their evidence reference is missing', () => {
    const candidate = completeCandidate();
    candidate.benchmark.metrics.qualityScore = measurement(0.95, 'score', 'invented-result');

    const decision = scoreModelCandidate(candidate);

    assert.equal(decision.status, 'not-approved');
    assert.ok(decision.rejectionReasons.includes('benchmark-evidence-missing'));
  });

  it('does not recommend a model above the target device tier', () => {
    const candidate = completeCandidate();
    candidate.requiredTier = 'standard-local';

    const decision = scoreModelCandidate(candidate, 'light-local');

    assert.equal(decision.status, 'not-approved');
    assert.ok(decision.rejectionReasons.includes('tier-incompatible'));
  });

  it('blocks a concrete URL when the final decision is not approved', () => {
    const candidate = completeCandidate();
    candidate.benchmark.status = 'not-run';

    const decision = scoreModelCandidate(candidate);

    assert.equal(decision.status, 'not-approved');
    assert.ok(decision.rejectionReasons.includes('unapproved-artifact-download'));
  });

  it('creates a safe null/unavailable placeholder with no URL or download permission', () => {
    const candidate = createModelCandidatePlaceholder({
      candidateId: 'future-local-candidate',
      modelVersion: 'unconfigured',
      runtimeProvider: 'unavailable',
      requiredTier: 'light-local',
    });

    assert.equal(candidate.approvalStatus, 'not-approved');
    assert.equal(candidate.productionReady, false);
    assert.equal(candidate.artifact.url, undefined);
    assert.equal(candidate.artifact.downloadAllowed, false);
    assert.equal(scoreModelCandidate(candidate).status, 'not-approved');
  });

  it('keeps platform scoring modules free of exam-specific concepts', () => {
    const source = [
      new URL('../../src/platform/evaluation/modelBenchmarkPlan.ts', import.meta.url),
      new URL('../../src/platform/evaluation/modelCandidateScoring.ts', import.meta.url),
    ].map(file => readFileSync(file, 'utf8')).join('\n');

    assert.doesNotMatch(source, /IELTS|Task Response|Speaking Part|Writing Task/i);
  });
});
