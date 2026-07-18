import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalModelCandidateEvidenceRecord } from './localModelCandidateEvidenceTypes.ts';
import type { LocalModelCandidateReviewDecisionResult } from './localModelCandidateReviewDecisionTypes.ts';
import type { LocalModelArtifactEvidenceRecord } from './localModelArtifactEvidenceTypes.ts';
import type { LocalModelArtifactSelectionResult } from './localModelArtifactSelectionTypes.ts';
import type { LocalModelArtifactIntegrityCandidateRecord } from './localModelArtifactIntegrityEvidenceTypes.ts';

export type LocalModelGovernanceRequirementStatus =
  | 'satisfied'
  | 'unresolved'
  | 'conflicting'
  | 'requires-human-decision'
  | 'deferred-to-artifact-selection'
  | 'deferred-to-runtime-benchmark';

export type LocalModelGovernanceReviewPacketStatus =
  | 'evidence-reconciliation-incomplete'
  | 'awaiting-human-governance-review'
  | 'conflicting-evidence'
  | 'rejected'
  | 'attention-required';

export type LocalModelGovernanceEvidenceSourcePhase =
  | 'phase-5.1'
  | 'phase-5.2'
  | 'phase-5.3'
  | 'phase-5.4'
  | 'phase-5.5';

export const LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS = [
  'exact-model-identity',
  'official-publisher',
  'base-license-identifier',
  'official-license-text',
  'commercial-use',
  'redistribution',
  'derivative-works',
  'derived-artifact-hosting',
  'quantization-conversion',
  'attribution-notice',
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'trademark-restrictions',
  'official-repository-identity',
  'immutable-revision',
  'artifact-format',
  'official-base-variant',
  'official-quantized-variant',
  'weight-file-inventory',
  'weight-index-consistency',
  'exact-weight-size',
  'config-provenance',
  'tokenizer-provenance',
  'license-file-provenance',
  'integrity-metadata-availability',
  'integrity-algorithm-classification',
  'checksum-pinning-plan',
  'checksum-verification-plan',
  'runtime-support-file-bundle',
  'approved-download-size',
  'browser-runtime-compatibility',
  'device-benchmark-evidence',
  'tier-performance-budget',
] as const;

export type LocalModelGovernanceRequirementId =
  typeof LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS[number];

export interface LocalModelGovernanceRequirementRecord {
  readonly id: LocalModelGovernanceRequirementId;
  readonly status: LocalModelGovernanceRequirementStatus;
  readonly sourcePhases: readonly LocalModelGovernanceEvidenceSourcePhase[];
  readonly evidenceSummary: string;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly humanDecisionRequired: boolean;
  readonly runtimeBenchmarkRequired: boolean;
}

export interface LocalModelGovernanceReviewPacketInput {
  readonly candidateEvidence: LocalModelCandidateEvidenceRecord | null;
  readonly candidateReviewDecision: LocalModelCandidateReviewDecisionResult | null;
  readonly artifactEvidence: LocalModelArtifactEvidenceRecord | null;
  readonly artifactSelection: LocalModelArtifactSelectionResult | null;
  readonly integrityEvidence: LocalModelArtifactIntegrityCandidateRecord | null;
}

export interface LocalModelGovernanceReviewPacket {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string | null;
  readonly observedRevision: string | null;
  readonly status: LocalModelGovernanceReviewPacketStatus;
  readonly requirements: readonly LocalModelGovernanceRequirementRecord[];
  readonly satisfiedRequirements: readonly LocalModelGovernanceRequirementId[];
  readonly unresolvedRequirements: readonly LocalModelGovernanceRequirementId[];
  readonly conflictingRequirements: readonly LocalModelGovernanceRequirementId[];
  readonly humanDecisionRequirements: readonly LocalModelGovernanceRequirementId[];
  readonly runtimeBenchmarkRequirements: readonly LocalModelGovernanceRequirementId[];
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly humanGovernanceReviewRequired: true;
  readonly humanDecisionRecorded: false;
  readonly artifactSelectionRecorded: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactApproved: false;
  readonly checksumPinned: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
  readonly packetOnly: true;
}

export interface LocalModelGovernanceReviewPacketValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}
