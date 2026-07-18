import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type { LocalModelCandidateEvidenceRecord } from './localModelCandidateEvidenceTypes.ts';
import type { LocalModelArtifactEvidenceRecord } from './localModelArtifactEvidenceTypes.ts';
import type { LocalModelArtifactIntegrityCandidateRecord } from './localModelArtifactIntegrityEvidenceTypes.ts';
import type { LocalModelGovernanceReviewPacket } from './localModelGovernanceReviewPacketTypes.ts';
import type { LocalModelGovernanceEvidenceClosureCandidateRecord } from './localModelGovernanceEvidenceClosureTypes.ts';
import type { LocalModelHumanGovernanceDecisionResult } from './localModelHumanGovernanceDecisionTypes.ts';
import type { LocalModelHumanArtifactSelectionResult } from './localModelHumanArtifactSelectionTypes.ts';
import type { LocalModelArtifactApprovalIntegrityResult } from './localModelArtifactApprovalIntegrityTypes.ts';
import type { LocalModelSelectedArtifactBenchmarkPlanResult } from './localModelSelectedArtifactBenchmarkPlanTypes.ts';

export type LocalModelGovernanceBenchmarkCloseoutStatus = 'foundation-complete' | 'attention-required';
export type LocalModelGovernanceBenchmarkCloseoutFindingSeverity = 'info' | 'warning' | 'error';
export type LocalModelGovernanceBenchmarkCloseoutFindingArea =
  | 'candidate-identity' | 'tier-matrix' | 'model-license-evidence' | 'artifact-provenance'
  | 'artifact-integrity' | 'governance-reconciliation' | 'governance-evidence-closure'
  | 'human-governance-decision' | 'human-artifact-selection' | 'artifact-approval'
  | 'integrity-pinning' | 'benchmark-planning' | 'benchmark-execution'
  | 'checksum-verification' | 'download-boundary' | 'runtime-boundary'
  | 'fallback-continuity' | 'feature-parity' | 'protected-state';

export interface LocalModelGovernanceBenchmarkCloseoutFinding {
  readonly findingId: string;
  readonly area: LocalModelGovernanceBenchmarkCloseoutFindingArea;
  readonly severity: LocalModelGovernanceBenchmarkCloseoutFindingSeverity;
  readonly passed: boolean;
  readonly summary: string;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
}

export interface LocalModelGovernanceBenchmarkCandidateCloseout {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string | null;
  readonly observedRevision: string | null;
  readonly findings: readonly LocalModelGovernanceBenchmarkCloseoutFinding[];
  readonly candidateIdentityConsistent: boolean;
  readonly tierMatrixConsistent: boolean;
  readonly evidenceFoundationPresent: boolean;
  readonly governanceReviewPacketPresent: boolean;
  readonly evidenceClosurePresent: boolean;
  readonly governanceDecisionBoundaryPresent: boolean;
  readonly artifactSelectionBoundaryPresent: boolean;
  readonly artifactApprovalBoundaryPresent: boolean;
  readonly benchmarkPlanBoundaryPresent: boolean;
  readonly humanDecisionsRecorded: number;
  readonly governanceDecisionsComplete: boolean;
  readonly artifactSelectionRecorded: boolean;
  readonly artifactSelected: boolean;
  readonly artifactApproved: boolean;
  readonly checksumPinned: boolean;
  readonly checksumVerified: boolean;
  readonly benchmarkPlanApproved: boolean;
  readonly benchmarkExecutionStarted: boolean;
  readonly benchmarkExecutionCompleted: boolean;
  readonly benchmarkMeasurementsRecorded: boolean;
  readonly benchmarkVerified: boolean;
  readonly benchmarkPassed: boolean;
  readonly benchmarkFailed: boolean;
  readonly downloadLocationConfigured: boolean;
  readonly downloadable: boolean;
  readonly cacheable: boolean;
  readonly runtimeReady: boolean;
  readonly modelActive: boolean;
  readonly deterministicFallbackAvailable: boolean;
  readonly featureParityPreserved: boolean;
}

export interface LocalModelGovernanceBenchmarkCloseoutAggregate {
  readonly totalCandidates: number;
  readonly exactCandidateIdentities: number;
  readonly consistentTierMappings: number;
  readonly evidenceRecords: number;
  readonly artifactProvenanceRecords: number;
  readonly artifactIntegrityRecords: number;
  readonly governanceReviewPackets: number;
  readonly evidenceClosureRecords: number;
  readonly evidenceClosureRequirements: number;
  readonly governanceDecisionSessions: number;
  readonly governanceDecisionItemsRequired: number;
  readonly governanceDecisionItemsRecorded: number;
  readonly governanceDecisionsComplete: number;
  readonly artifactSelectionSessions: number;
  readonly artifactSelectionsRecorded: number;
  readonly selectedArtifacts: number;
  readonly artifactApprovalSessions: number;
  readonly artifactApprovalDecisionsRecorded: number;
  readonly integrityPinningDecisionsRecorded: number;
  readonly approvedArtifacts: number;
  readonly approvedPinPlans: number;
  readonly checksumPinnedArtifacts: number;
  readonly checksumVerifiedArtifacts: number;
  readonly benchmarkPlanSessions: number;
  readonly benchmarkPlansApproved: number;
  readonly benchmarkExecutionsStarted: number;
  readonly benchmarkExecutionsCompleted: number;
  readonly benchmarkMeasurementsRecorded: number;
  readonly benchmarkPassedCandidates: number;
  readonly benchmarkFailedCandidates: number;
  readonly downloadLocationsConfigured: number;
  readonly downloadableArtifacts: number;
  readonly cacheableArtifacts: number;
  readonly runtimeReadyArtifacts: number;
  readonly activeModels: number;
  readonly candidatesWithFallback: number;
  readonly candidatesWithFeatureParity: number;
  readonly errorFindings: number;
  readonly warningFindings: number;
}

export interface LocalModelGovernanceBenchmarkCloseoutInput {
  readonly candidateEvidenceRecords: readonly LocalModelCandidateEvidenceRecord[];
  readonly artifactEvidenceRecords: readonly LocalModelArtifactEvidenceRecord[];
  readonly artifactIntegrityRecords: readonly LocalModelArtifactIntegrityCandidateRecord[];
  readonly governancePackets: readonly LocalModelGovernanceReviewPacket[];
  readonly evidenceClosureRecords: readonly LocalModelGovernanceEvidenceClosureCandidateRecord[];
  readonly governanceDecisionResults: readonly LocalModelHumanGovernanceDecisionResult[];
  readonly artifactSelectionResults: readonly LocalModelHumanArtifactSelectionResult[];
  readonly artifactApprovalResults: readonly LocalModelArtifactApprovalIntegrityResult[];
  readonly benchmarkPlanResults: readonly LocalModelSelectedArtifactBenchmarkPlanResult[];
  readonly phase4CloseoutFoundationComplete: boolean;
  readonly productionExecutorAvailable: boolean;
  readonly deterministicFallbackAvailable: boolean;
  readonly featureParityPreserved: boolean;
  readonly claimedDownloadLocationsConfigured: number;
  readonly claimedDownloadableArtifacts: number;
  readonly claimedCacheableArtifacts: number;
  readonly claimedRuntimeReadyArtifacts: number;
  readonly claimedActiveModels: number;
}

export interface LocalModelGovernanceBenchmarkCloseoutValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelGovernanceBenchmarkCloseoutResult {
  readonly status: LocalModelGovernanceBenchmarkCloseoutStatus;
  readonly phase5FoundationComplete: boolean;
  readonly productionBlockedSafe: boolean;
  readonly governanceFoundationComplete: boolean;
  readonly artifactReviewFoundationComplete: boolean;
  readonly benchmarkPlanningFoundationComplete: boolean;
  readonly benchmarkExecutionAvailable: boolean;
  readonly modelReadinessEstablished: boolean;
  readonly runtimeReadinessEstablished: boolean;
  readonly phase4CloseoutFoundationComplete: boolean;
  readonly productionExecutorAvailable: boolean;
  readonly candidates: readonly LocalModelGovernanceBenchmarkCandidateCloseout[];
  readonly findings: readonly LocalModelGovernanceBenchmarkCloseoutFinding[];
  readonly aggregate: LocalModelGovernanceBenchmarkCloseoutAggregate;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly closeoutOnly: true;
  readonly humanDecisionRecorded: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkExecutionStarted: false;
  readonly benchmarkPassed: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
