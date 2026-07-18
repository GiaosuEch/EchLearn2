import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceRequirementStatus,
  LocalModelGovernanceReviewPacketStatus,
} from './localModelGovernanceReviewPacketTypes.ts';

export type LocalModelGovernanceEvidenceClosureStatus =
  | 'unresolved'
  | 'factual-evidence-collected'
  | 'sufficient-for-human-decision'
  | 'no-separate-policy-located'
  | 'conflicting-evidence'
  | 'rejected';

export type LocalModelGovernanceEvidenceClosureRequirementId =
  | 'tokenizer-license-scope'
  | 'acceptable-use-scope'
  | 'derived-artifact-hosting'
  | 'quantization-conversion';

export type LocalModelGovernanceEvidenceClosureTruthValue =
  | 'yes'
  | 'no'
  | 'unknown'
  | 'conflicting';

export type LocalModelGovernanceEvidenceClosureSourceKind =
  | 'official-model-card'
  | 'official-repository-license'
  | 'official-repository-notice'
  | 'official-repository-file-tree'
  | 'official-publisher-documentation'
  | 'official-publisher-policy'
  | 'official-release-announcement'
  | 'official-upstream-tokenizer-source'
  | 'official-apache-license'
  | 'official-apache-license-guidance';

export interface LocalModelGovernanceEvidenceClosureSource {
  readonly sourceId: string;
  readonly sourceKind: LocalModelGovernanceEvidenceClosureSourceKind;
  readonly officialPublisher: boolean;
  readonly title: string;
  readonly repositoryId: string | null;
  readonly revision: string | null;
  readonly reference: string;
  readonly retrievedOn: string;
  readonly supportsRequirements: readonly LocalModelGovernanceEvidenceClosureRequirementId[];
  readonly supportsFields: readonly string[];
  readonly notes: string;
}

export interface LocalModelGovernanceEvidenceClosureRequirementRecord {
  readonly requirementId: LocalModelGovernanceEvidenceClosureRequirementId;
  readonly status: LocalModelGovernanceEvidenceClosureStatus;
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly factualSummary: string;
  readonly sourceIds: readonly string[];
  readonly missingEvidence: readonly string[];
  readonly conflicts: readonly string[];
  readonly humanDecisionRequired: boolean;
  readonly productLegalReviewRequired: boolean;
  readonly factualEvidenceComplete: boolean;
  readonly decisionRecorded: false;
  readonly approved: false;
}

export interface LocalModelGovernanceEvidenceClosureCandidateRecord {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string | null;
  readonly status: LocalModelGovernanceEvidenceClosureStatus;
  readonly tokenizerLicenseScope: LocalModelGovernanceEvidenceClosureTruthValue;
  readonly acceptableUseScope: LocalModelGovernanceEvidenceClosureTruthValue;
  readonly derivedArtifactHosting: LocalModelGovernanceEvidenceClosureTruthValue;
  readonly quantizationConversion: LocalModelGovernanceEvidenceClosureTruthValue;
  readonly requirements: readonly LocalModelGovernanceEvidenceClosureRequirementRecord[];
  readonly resolvedFactualRequirements: readonly LocalModelGovernanceEvidenceClosureRequirementId[];
  readonly unresolvedFactualRequirements: readonly LocalModelGovernanceEvidenceClosureRequirementId[];
  readonly humanDecisionRequirements: readonly LocalModelGovernanceEvidenceClosureRequirementId[];
  readonly conflictingRequirements: readonly LocalModelGovernanceEvidenceClosureRequirementId[];
  readonly sources: readonly LocalModelGovernanceEvidenceClosureSource[];
  readonly warnings: readonly string[];
  readonly conflicts: readonly string[];
  readonly humanGovernanceReviewRequired: true;
  readonly humanDecisionRecorded: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly checksumPinned: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
  readonly evidenceClosureOnly: true;
}

export interface LocalModelGovernanceEvidenceClosureValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelGovernanceEvidenceClosureImpact {
  readonly candidateId: string;
  readonly currentPacketStatus: LocalModelGovernanceReviewPacketStatus;
  readonly projectedRequirementStatuses: Readonly<Record<
    LocalModelGovernanceEvidenceClosureRequirementId,
    LocalModelGovernanceRequirementStatus
  >>;
  readonly historicalPacketMutated: false;
  readonly humanDecisionRecorded: false;
  readonly modelApproved: false;
  readonly artifactApproved: false;
}
