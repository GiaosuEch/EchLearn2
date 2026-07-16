import {
  AI_SERVICE_REQUEST_TYPES,
  type AIServiceRequestType,
} from '../ai/aiServiceTypes.ts';
import type { AITier } from '../ai/aiCapabilityDetector.ts';
import { validateModelArtifactIntegrity } from '../ai/modelArtifactIntegrity.ts';
import type {
  BenchmarkMeasurement,
  ModelCandidate,
} from './modelBenchmarkPlan.ts';

export type ModelCandidateRejectionReason =
  | 'benchmark-not-run'
  | 'benchmark-evidence-missing'
  | 'benchmark-failed'
  | 'benchmark-threshold-not-met'
  | 'license-not-verified'
  | 'artifact-integrity-missing'
  | 'artifact-not-available'
  | 'artifact-hosting-unverified'
  | 'unapproved-artifact-download'
  | 'runtime-unavailable'
  | 'tier-incompatible'
  | 'coverage-missing'
  | 'privacy-review-missing'
  | 'security-review-missing'
  | 'limitations-missing';

export type ModelCandidateDecisionStatus =
  | 'not-approved'
  | 'eligible-for-approval'
  | 'approved';

export interface ModelCandidateDecision {
  status: ModelCandidateDecisionStatus;
  productionReady: boolean;
  rejectionReasons: ModelCandidateRejectionReason[];
  limitations: string[];
}

const tierRank: Record<AITier, number> = {
  unavailable: -1,
  basic: 0,
  'light-local': 1,
  'standard-local': 2,
  'pro-local': 3,
};

function addReason(
  reasons: ModelCandidateRejectionReason[],
  reason: ModelCandidateRejectionReason,
): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function hasEvidence(
  candidate: ModelCandidate,
  measurement: BenchmarkMeasurement | undefined,
  source: 'artifact-manifest' | 'benchmark-run',
): boolean {
  return Boolean(
    measurement
    && measurement.evidenceRef.trim()
    && candidate.benchmark.evidence.some(ref => (
      ref.id === measurement.evidenceRef && ref.source === source
    )),
  );
}

function hasMeasurement(
  candidate: ModelCandidate,
  key: 'artifactSizeBytes' | 'coldStartMs' | 'peakMemoryBytes' | 'p50LatencyMs' | 'qualityScore',
  unit: 'bytes' | 'milliseconds' | 'score',
  source: 'artifact-manifest' | 'benchmark-run',
  reasons: ModelCandidateRejectionReason[],
): BenchmarkMeasurement | undefined {
  const measurement = candidate.benchmark.metrics[key];
  if (
    !measurement
    || measurement.unit !== unit
    || !Number.isFinite(measurement.value)
    || measurement.value < 0
    || !hasEvidence(candidate, measurement, source)
  ) {
    addReason(reasons, 'benchmark-evidence-missing');
    return undefined;
  }
  return measurement;
}

function hasGenericTaskCoverage(tasks: AIServiceRequestType[]): boolean {
  const knownTasks = new Set<string>(AI_SERVICE_REQUEST_TYPES);
  return tasks.length > 0 && tasks.every(task => knownTasks.has(task));
}

export function scoreModelCandidate(
  candidate: ModelCandidate,
  targetTier?: AITier,
): ModelCandidateDecision {
  const reasons: ModelCandidateRejectionReason[] = [];

  if (candidate.benchmark.status === 'not-run') addReason(reasons, 'benchmark-not-run');
  if (candidate.benchmark.status === 'needs-evidence') addReason(reasons, 'benchmark-evidence-missing');
  if (candidate.benchmark.status === 'failed') addReason(reasons, 'benchmark-failed');

  if (
    candidate.license.status !== 'verified'
    || !candidate.license.commercialUse
    || !candidate.license.redistribution
    || !candidate.license.evidenceRef
    || !candidate.benchmark.evidence.some(ref => (
      ref.id === candidate.license.evidenceRef && ref.source === 'license-review'
    ))
  ) {
    addReason(reasons, 'license-not-verified');
  }

  if (candidate.runtimeProvider === 'unavailable') {
    addReason(reasons, 'runtime-unavailable');
  }

  if (candidate.approvalStatus !== 'approved' && (
    candidate.artifact.url !== undefined
    || candidate.artifact.downloadAllowed
  )) {
    addReason(reasons, 'unapproved-artifact-download');
  }

  if (candidate.artifact.status !== 'available') {
    addReason(reasons, 'artifact-not-available');
  }

  if (candidate.artifact.hosting !== 'project-controlled') {
    addReason(reasons, 'artifact-hosting-unverified');
  }

  const artifactSize = hasMeasurement(
    candidate,
    'artifactSizeBytes',
    'bytes',
    'artifact-manifest',
    reasons,
  );
  if (artifactSize) {
    const integrity = validateModelArtifactIntegrity({
      algorithm: candidate.artifact.checksumAlgorithm ?? 'sha256',
      checksum: candidate.artifact.checksum,
      byteSize: artifactSize.value,
    });
    if (!integrity.valid) addReason(reasons, 'artifact-integrity-missing');
  }

  if (
    candidate.benchmark.status === 'passed'
    && (!candidate.benchmark.benchmarkId
      || !candidate.benchmark.benchmarkVersion
      || candidate.benchmark.promotionThreshold === undefined
      || candidate.benchmark.promotionThreshold < 0
      || candidate.benchmark.promotionThreshold > 1)
  ) {
    addReason(reasons, 'benchmark-evidence-missing');
  }

  const qualityScore = hasMeasurement(
    candidate,
    'qualityScore',
    'score',
    'benchmark-run',
    reasons,
  );
  hasMeasurement(candidate, 'coldStartMs', 'milliseconds', 'benchmark-run', reasons);
  hasMeasurement(candidate, 'peakMemoryBytes', 'bytes', 'benchmark-run', reasons);
  hasMeasurement(candidate, 'p50LatencyMs', 'milliseconds', 'benchmark-run', reasons);

  if (
    qualityScore
    && candidate.benchmark.promotionThreshold !== undefined
    && (qualityScore.value < 0 || qualityScore.value > 1
      || qualityScore.value < candidate.benchmark.promotionThreshold)
  ) {
    addReason(reasons, 'benchmark-threshold-not-met');
  }

  if (
    candidate.benchmark.languageCoverage.length === 0
    || !hasGenericTaskCoverage(candidate.benchmark.taskCoverage)
  ) {
    addReason(reasons, 'coverage-missing');
  }

  if (candidate.privacyReview !== 'passed') addReason(reasons, 'privacy-review-missing');
  if (candidate.securityReview !== 'passed') addReason(reasons, 'security-review-missing');
  if (candidate.limitations.length === 0) addReason(reasons, 'limitations-missing');

  if (
    targetTier !== undefined
    && tierRank[targetTier] < tierRank[candidate.requiredTier]
  ) {
    addReason(reasons, 'tier-incompatible');
  }

  if (reasons.length > 0 && (
    candidate.artifact.url !== undefined
    || candidate.artifact.downloadAllowed
  )) {
    addReason(reasons, 'unapproved-artifact-download');
  }

  const eligible = reasons.length === 0;
  const status: ModelCandidateDecisionStatus = !eligible
    ? 'not-approved'
    : candidate.approvalStatus === 'approved'
      ? 'approved'
      : 'eligible-for-approval';

  return {
    status,
    productionReady: status === 'approved',
    rejectionReasons: reasons,
    limitations: candidate.limitations,
  };
}
