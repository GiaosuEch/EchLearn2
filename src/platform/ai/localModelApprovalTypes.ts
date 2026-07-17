export type LocalModelApprovalTier = 'light' | 'standard' | 'pro';

export type LocalModelCandidateVerificationStatus =
  | 'official-source-reviewed'
  | 'needs-online-review';

export type LocalModelLicenseReviewStatus =
  | 'not-reviewed'
  | 'reviewed-pending-product-approval';

export type LocalModelArtifactReviewStatus = 'not-reviewed';
export type LocalModelTokenizerReviewStatus = 'pending-dedicated-review';
export type LocalModelSafetyReviewStatus = 'not-run';
export type LocalModelBenchmarkStatus = 'not-run';

export type LocalModelApprovalCheckId =
  | 'official-license-source'
  | 'product-use-allowed'
  | 'redistribution-or-hosting'
  | 'tokenizer-license'
  | 'quantization-source'
  | 'artifact-provenance'
  | 'checksum-plan'
  | 'cache-policy'
  | 'user-deletion'
  | 'offline-fallback'
  | 'benchmark-pass'
  | 'safety-gates'
  | 'multilingual-review'
  | 'no-official-scoring-claim';

export interface LocalModelApprovalCheck {
  readonly id: LocalModelApprovalCheckId;
  readonly label: string;
  readonly required: true;
  readonly completed: false;
}

export interface LocalModelApprovalCandidate {
  readonly candidateId: string;
  readonly displayName: string;
  readonly tier: LocalModelApprovalTier;
  readonly providerFamily: string;
  readonly parameterScaleLabel: string;
  readonly intendedUse: string;
  readonly licenseName: string;
  readonly verificationStatus: LocalModelCandidateVerificationStatus;
  readonly licenseReviewStatus: LocalModelLicenseReviewStatus;
  readonly artifactReviewStatus: LocalModelArtifactReviewStatus;
  readonly tokenizerReviewStatus: LocalModelTokenizerReviewStatus;
  readonly safetyReviewStatus: LocalModelSafetyReviewStatus;
  readonly benchmarkStatus: LocalModelBenchmarkStatus;
  readonly approved: false;
  readonly licenseApproved: false;
  readonly artifactApproved: false;
  readonly benchmarkApproved: false;
  readonly runtimeReady: false;
  readonly downloadable: false;
  readonly configuredForRuntime: false;
  readonly approvalBlockers: readonly string[];
  readonly reviewNotes: readonly string[];
  readonly requiredCheckIds: readonly LocalModelApprovalCheckId[];
  readonly sourceReferences: readonly string[];
}
