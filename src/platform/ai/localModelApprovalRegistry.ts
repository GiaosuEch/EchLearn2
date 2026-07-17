import type {
  LocalModelApprovalCandidate,
  LocalModelApprovalCheck,
  LocalModelApprovalCheckId,
  LocalModelApprovalTier,
} from './localModelApprovalTypes.ts';

export const LOCAL_MODEL_APPROVAL_CHECKS: readonly LocalModelApprovalCheck[] = [
  { id: 'official-license-source', label: 'Verify the license from an official source.', required: true, completed: false },
  { id: 'product-use-allowed', label: 'Confirm product and commercial use is allowed.', required: true, completed: false },
  { id: 'redistribution-or-hosting', label: 'Confirm redistribution terms or define an approved hosting strategy.', required: true, completed: false },
  { id: 'tokenizer-license', label: 'Review tokenizer and auxiliary-file licensing.', required: true, completed: false },
  { id: 'quantization-source', label: 'Review the source and licensing of any quantized derivative.', required: true, completed: false },
  { id: 'artifact-provenance', label: 'Document artifact provenance and immutable version identity.', required: true, completed: false },
  { id: 'checksum-plan', label: 'Approve an integrity checksum plan before artifact use.', required: true, completed: false },
  { id: 'cache-policy', label: 'Define storage quota, cache lifecycle, and recovery policy.', required: true, completed: false },
  { id: 'user-deletion', label: 'Define a user-controlled artifact deletion path.', required: true, completed: false },
  { id: 'offline-fallback', label: 'Preserve unavailable-safe behavior when the artifact cannot run.', required: true, completed: false },
  { id: 'benchmark-pass', label: 'Require Phase 4.3 benchmark evidence before promotion.', required: true, completed: false },
  { id: 'safety-gates', label: 'Require safety and output-quality gates before promotion.', required: true, completed: false },
  { id: 'multilingual-review', label: 'Review quality across all 13 supported languages.', required: true, completed: false },
  { id: 'no-official-scoring-claim', label: 'Prohibit official assessment-scoring claims.', required: true, completed: false },
] as const;

const REQUIRED_CHECK_IDS = LOCAL_MODEL_APPROVAL_CHECKS.map(
  (check) => check.id,
) as readonly LocalModelApprovalCheckId[];

interface CandidateDefinition {
  readonly candidateId: string;
  readonly displayName: string;
  readonly tier: LocalModelApprovalTier;
  readonly parameterScaleLabel: string;
  readonly intendedUse: string;
  readonly sourceReferences: readonly string[];
}

function createCandidate(definition: CandidateDefinition): LocalModelApprovalCandidate {
  return {
    ...definition,
    providerFamily: 'Qwen',
    licenseName: 'Apache-2.0',
    verificationStatus: 'official-source-reviewed',
    licenseReviewStatus: 'reviewed-pending-product-approval',
    artifactReviewStatus: 'not-reviewed',
    tokenizerReviewStatus: 'pending-dedicated-review',
    safetyReviewStatus: 'not-run',
    benchmarkStatus: 'not-run',
    approved: false,
    licenseApproved: false,
    artifactApproved: false,
    benchmarkApproved: false,
    runtimeReady: false,
    downloadable: false,
    configuredForRuntime: false,
    approvalBlockers: [
      'Product license approval is pending.',
      'Tokenizer and quantized-artifact review is pending.',
      'No artifact provenance or integrity record is approved.',
      'Benchmark and safety gates have not run.',
    ],
    reviewNotes: [
      'Official repository metadata reports Apache-2.0 for the source model repository.',
      'Research verification does not approve product use, redistribution, tokenizer files, derivatives, or artifacts.',
    ],
    requiredCheckIds: REQUIRED_CHECK_IDS,
  };
}

export const LOCAL_MODEL_APPROVAL_REGISTRY: readonly LocalModelApprovalCandidate[] = [
  createCandidate({
    candidateId: 'qwen3-0-6b-candidate',
    displayName: 'Qwen3-0.6B',
    tier: 'light',
    parameterScaleLabel: '0.6B',
    intendedUse: 'Small-device feasibility and fallback-quality evaluation.',
    sourceReferences: [
      'Qwen/Qwen3-0.6B official model card',
      'Qwen/Qwen3-0.6B repository license file',
    ],
  }),
  createCandidate({
    candidateId: 'qwen3-1-7b-candidate',
    displayName: 'Qwen3-1.7B',
    tier: 'standard',
    parameterScaleLabel: '1.7B',
    intendedUse: 'Primary quality, latency, and memory benchmark evaluation.',
    sourceReferences: [
      'Qwen/Qwen3-1.7B official model card',
      'Qwen/Qwen3-1.7B repository license file',
    ],
  }),
  createCandidate({
    candidateId: 'qwen3-4b-candidate',
    displayName: 'Qwen3-4B',
    tier: 'pro',
    parameterScaleLabel: '4B',
    intendedUse: 'Stronger-device quality evaluation behind explicit capability gates.',
    sourceReferences: [
      'Qwen/Qwen3-4B official model card',
      'Qwen/Qwen3-4B repository license file',
    ],
  }),
] as const;
