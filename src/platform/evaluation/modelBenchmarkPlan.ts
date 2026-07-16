import {
  AI_SERVICE_REQUEST_TYPES,
  type AIServiceRequestType,
} from '../ai/aiServiceTypes.ts';
import type { LocalModelTier } from '../ai/aiReadiness.ts';
import type {
  ModelArtifactApprovalStatus,
  ModelArtifactStatus,
} from '../ai/modelArtifactManifest.ts';
import type { EvaluationBenchmark } from './evaluationBenchmark.ts';

export type ModelBenchmarkMetric =
  | 'artifact-size-bytes'
  | 'cold-start-ms'
  | 'peak-memory-bytes'
  | 'p50-latency-ms'
  | 'quality-score';

export type ModelBenchmarkPlanStatus = 'planned' | 'running' | 'complete';
export type ModelBenchmarkScope = EvaluationBenchmark['scope'];
export type ModelBenchmarkCalibrationStatus = EvaluationBenchmark['calibrationStatus'];

export interface ModelBenchmarkPlan {
  planId: string;
  version: string;
  scope: 'platform';
  status: ModelBenchmarkPlanStatus;
  tasks: AIServiceRequestType[];
  metrics: ModelBenchmarkMetric[];
  requiredDeviceTiers: LocalModelTier[];
  calibrationStatus: ModelBenchmarkCalibrationStatus;
  promotionThreshold: number;
  hasMeasuredResults: boolean;
}

export type RuntimeProviderId =
  | 'webllm'
  | 'transformers-js'
  | 'wasm-only'
  | 'cloud-boost'
  | 'unavailable';

export type CandidateLicenseStatus = 'verified' | 'needs-verification' | 'rejected';
export type CandidateReviewStatus = 'not-reviewed' | 'passed' | 'failed';
export type ModelCandidateBenchmarkStatus = 'not-run' | 'needs-evidence' | 'passed' | 'failed';
export type ModelCandidateArtifactStatus = Extract<ModelArtifactStatus, 'candidate' | 'available' | 'unavailable'>;
export type ModelCandidateApprovalStatus = Extract<
  ModelArtifactApprovalStatus,
  'candidate' | 'approved' | 'not-approved'
>;

export type BenchmarkMetricUnit = 'bytes' | 'milliseconds' | 'score';

export interface BenchmarkMeasurement {
  value: number;
  unit: BenchmarkMetricUnit;
  evidenceRef: string;
}

export type BenchmarkEvidenceSource =
  | 'artifact-manifest'
  | 'benchmark-run'
  | 'license-review'
  | 'privacy-review'
  | 'security-review';

export interface BenchmarkEvidenceRef {
  id: string;
  source: BenchmarkEvidenceSource;
  uri?: string;
}

export interface ModelCandidateBenchmark {
  status: ModelCandidateBenchmarkStatus;
  benchmarkId?: string;
  benchmarkVersion?: string;
  promotionThreshold?: number;
  metrics: Partial<Record<
    'artifactSizeBytes' | 'coldStartMs' | 'peakMemoryBytes' | 'p50LatencyMs' | 'qualityScore',
    BenchmarkMeasurement
  >>;
  languageCoverage: string[];
  taskCoverage: AIServiceRequestType[];
  calibrationStatus: ModelBenchmarkCalibrationStatus;
  evidence: BenchmarkEvidenceRef[];
}

export interface ModelCandidate {
  candidateId: string;
  modelVersion: string;
  runtimeProvider: RuntimeProviderId;
  requiredTier: LocalModelTier;
  license: {
    status: CandidateLicenseStatus;
    commercialUse: boolean;
    redistribution: boolean;
    evidenceRef?: string;
  };
  artifact: {
    status: ModelCandidateArtifactStatus;
    hosting: 'project-controlled' | 'vendor-controlled' | 'user-managed' | 'none';
    checksum?: string;
    checksumAlgorithm?: 'sha256';
    url?: string;
    downloadAllowed: boolean;
  };
  benchmark: ModelCandidateBenchmark;
  privacyReview: CandidateReviewStatus;
  securityReview: CandidateReviewStatus;
  approvalStatus: ModelCandidateApprovalStatus;
  productionReady: boolean;
  limitations: string[];
  rejectionReasons: string[];
}

export interface ModelCandidateRegistry {
  schemaVersion: 1;
  candidates: ModelCandidate[];
}

export const EMPTY_MODEL_CANDIDATE_REGISTRY: ModelCandidateRegistry = {
  schemaVersion: 1,
  candidates: [],
};

export const DEFAULT_MODEL_BENCHMARK_PLAN: ModelBenchmarkPlan = {
  planId: 'platform-local-model-evaluation',
  version: 'platform-local-model-evaluation@1',
  scope: 'platform',
  status: 'planned',
  tasks: [...AI_SERVICE_REQUEST_TYPES],
  metrics: [
    'artifact-size-bytes',
    'cold-start-ms',
    'peak-memory-bytes',
    'p50-latency-ms',
    'quality-score',
  ],
  requiredDeviceTiers: ['light-local', 'standard-local', 'pro-local'],
  calibrationStatus: 'internal',
  promotionThreshold: 0.8,
  hasMeasuredResults: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateModelBenchmarkPlan(value: unknown): ModelBenchmarkPlan {
  if (!isRecord(value)) throw new TypeError('Model benchmark plan must be an object.');

  const tasks = value.tasks;
  const metrics = value.metrics;
  const tiers = value.requiredDeviceTiers;
  const taskSet = new Set<string>(AI_SERVICE_REQUEST_TYPES);
  const metricSet = new Set<string>([
    'artifact-size-bytes',
    'cold-start-ms',
    'peak-memory-bytes',
    'p50-latency-ms',
    'quality-score',
  ]);

  if (
    !isNonEmptyString(value.planId)
    || !isNonEmptyString(value.version)
    || value.scope !== 'platform'
    || !['planned', 'running', 'complete'].includes(String(value.status))
    || !Array.isArray(tasks)
    || tasks.length === 0
    || tasks.some(task => typeof task !== 'string' || !taskSet.has(task))
    || !Array.isArray(metrics)
    || metrics.length === 0
    || metrics.some(metric => typeof metric !== 'string' || !metricSet.has(metric))
    || !Array.isArray(tiers)
    || tiers.length === 0
    || tiers.some(tier => !['light-local', 'standard-local', 'pro-local'].includes(String(tier)))
    || !['not-applicable', 'internal', 'calibrated'].includes(String(value.calibrationStatus))
    || typeof value.promotionThreshold !== 'number'
    || !Number.isFinite(value.promotionThreshold)
    || value.promotionThreshold < 0
    || value.promotionThreshold > 1
    || typeof value.hasMeasuredResults !== 'boolean'
  ) {
    throw new TypeError('Model benchmark plan is invalid.');
  }

  return {
    planId: value.planId,
    version: value.version,
    scope: 'platform',
    status: value.status as ModelBenchmarkPlanStatus,
    tasks: [...tasks] as AIServiceRequestType[],
    metrics: [...metrics] as ModelBenchmarkMetric[],
    requiredDeviceTiers: [...tiers] as LocalModelTier[],
    calibrationStatus: value.calibrationStatus as ModelBenchmarkCalibrationStatus,
    promotionThreshold: value.promotionThreshold,
    hasMeasuredResults: value.hasMeasuredResults,
  };
}

export function createModelCandidatePlaceholder(input: {
  candidateId: string;
  modelVersion: string;
  runtimeProvider: RuntimeProviderId;
  requiredTier: LocalModelTier;
}): ModelCandidate {
  return {
    candidateId: input.candidateId,
    modelVersion: input.modelVersion,
    runtimeProvider: input.runtimeProvider,
    requiredTier: input.requiredTier,
    license: {
      status: 'needs-verification',
      commercialUse: false,
      redistribution: false,
    },
    artifact: {
      status: 'candidate',
      hosting: 'none',
      downloadAllowed: false,
    },
    benchmark: {
      status: 'not-run',
      metrics: {},
      languageCoverage: [],
      taskCoverage: [],
      calibrationStatus: 'not-applicable',
      evidence: [],
    },
    privacyReview: 'not-reviewed',
    securityReview: 'not-reviewed',
    approvalStatus: 'not-approved',
    productionReady: false,
    limitations: [
      'Candidate only: no benchmark evidence has been collected.',
      'Candidate only: license and redistribution terms require verification.',
    ],
    rejectionReasons: ['benchmark-not-run', 'license-not-verified', 'runtime-unavailable'],
  };
}
