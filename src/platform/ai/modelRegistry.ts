export type ModelTier = 'light' | 'standard' | 'pro-local';
export type LicenseStatus = 'approved' | 'needs-verification' | 'rejected';
export type BenchmarkStatus = 'passed' | 'pending' | 'failed';

export type ModelCandidate = {
  candidateId: string;
  tier: ModelTier;
  modelVersion: string;
  runtimeVersion: string;
  tokenizerVersion: string;
  artifact: {
    url: string;
    byteSize: number;
    sha256: string;
    projectHosted: boolean;
  };
  license: {
    status: LicenseStatus;
    commercialUse: boolean;
    redistribution: boolean;
    evidenceUrl: string;
    noticePath: string;
  };
  benchmark: {
    status: BenchmarkStatus;
    suiteVersion: string;
    rubricVersion: string;
    caseCount: number;
    qualityScore: number;
    promotionThreshold: number;
    targetHardware: string[];
  };
};

export type ApprovedModelArtifact = ModelCandidate & { approvalStatus: 'approved' };

export type ModelPromotionErrorCode =
  | 'INVALID_CANDIDATE'
  | 'LICENSE_NOT_APPROVED'
  | 'BENCHMARK_NOT_PASSED'
  | 'ARTIFACT_ORIGIN_NOT_ALLOWED'
  | 'INVALID_ARTIFACT_INTEGRITY';

export class ModelPromotionError extends Error {
  readonly code: ModelPromotionErrorCode;

  constructor(code: ModelPromotionErrorCode, message: string) {
    super(message);
    this.name = 'ModelPromotionError';
    this.code = code;
  }
}

function invalid(message: string): never {
  throw new ModelPromotionError('INVALID_CANDIDATE', message);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function promoteModelCandidate(
  candidate: ModelCandidate,
  options: { allowedArtifactOrigins: string[] },
): ApprovedModelArtifact {
  if (
    !nonEmpty(candidate.candidateId) ||
    !['light', 'standard', 'pro-local'].includes(candidate.tier) ||
    !nonEmpty(candidate.modelVersion) ||
    !nonEmpty(candidate.runtimeVersion) ||
    !nonEmpty(candidate.tokenizerVersion)
  ) {
    invalid('Candidate identity and tier must be versioned.');
  }

  if (
    candidate.license.status !== 'approved' ||
    !candidate.license.commercialUse ||
    !candidate.license.redistribution ||
    !nonEmpty(candidate.license.evidenceUrl) ||
    !nonEmpty(candidate.license.noticePath)
  ) {
    throw new ModelPromotionError(
      'LICENSE_NOT_APPROVED',
      'Commercial use, redistribution, evidence, and notices are required.',
    );
  }

  if (
    candidate.benchmark.status !== 'passed' ||
    candidate.benchmark.caseCount <= 0 ||
    !Number.isFinite(candidate.benchmark.qualityScore) ||
    !Number.isFinite(candidate.benchmark.promotionThreshold) ||
    candidate.benchmark.qualityScore < candidate.benchmark.promotionThreshold ||
    !nonEmpty(candidate.benchmark.suiteVersion) ||
    !nonEmpty(candidate.benchmark.rubricVersion) ||
    candidate.benchmark.targetHardware.length === 0
  ) {
    throw new ModelPromotionError(
      'BENCHMARK_NOT_PASSED',
      'A passed benchmark with a declared threshold and target hardware is required.',
    );
  }

  let artifactUrl: URL;
  try {
    artifactUrl = new URL(candidate.artifact.url);
  } catch {
    throw new ModelPromotionError('ARTIFACT_ORIGIN_NOT_ALLOWED', 'Artifact URL is invalid.');
  }

  if (
    artifactUrl.protocol !== 'https:' ||
    !candidate.artifact.projectHosted ||
    artifactUrl.pathname.toLowerCase().includes('/latest') ||
    !options.allowedArtifactOrigins.includes(artifactUrl.origin)
  ) {
    throw new ModelPromotionError(
      'ARTIFACT_ORIGIN_NOT_ALLOWED',
      'Artifacts must use an immutable project-controlled HTTPS origin.',
    );
  }

  if (
    !Number.isSafeInteger(candidate.artifact.byteSize) ||
    candidate.artifact.byteSize <= 0 ||
    !/^[a-f0-9]{64}$/i.test(candidate.artifact.sha256)
  ) {
    throw new ModelPromotionError(
      'INVALID_ARTIFACT_INTEGRITY',
      'Artifact size and SHA-256 integrity metadata are required.',
    );
  }

  return { ...candidate, approvalStatus: 'approved' };
}
