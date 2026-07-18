import { AI_FEATURE_REGISTRY } from './aiFeatureRegistry.ts';
import { listLocalModelCandidateEvidence } from './localModelCandidateEvidenceRegistry.ts';
import { listLocalModelArtifactEvidence } from './localModelArtifactEvidenceRegistry.ts';
import { listLocalModelArtifactIntegrityEvidence } from './localModelArtifactIntegrityEvidenceRegistry.ts';
import { listCurrentLocalModelGovernanceReviewPackets } from './localModelGovernanceReviewPacket.ts';
import { listLocalModelGovernanceEvidenceClosures } from './localModelGovernanceEvidenceClosureRegistry.ts';
import { listCurrentLocalModelHumanGovernanceDecisions } from './localModelHumanGovernanceDecisionPolicy.ts';
import { listCurrentLocalModelHumanArtifactSelections } from './localModelHumanArtifactSelectionPolicy.ts';
import { listCurrentLocalModelArtifactApprovalIntegrityResults } from './localModelArtifactApprovalIntegrityPolicy.ts';
import { listCurrentSelectedArtifactBenchmarkPlanResults } from './localModelSelectedArtifactBenchmarkPlanPolicy.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from './localModelAcquisitionCloseout.ts';
import type {
  LocalModelGovernanceBenchmarkCandidateCloseout,
  LocalModelGovernanceBenchmarkCloseoutFinding,
  LocalModelGovernanceBenchmarkCloseoutFindingArea,
  LocalModelGovernanceBenchmarkCloseoutInput,
  LocalModelGovernanceBenchmarkCloseoutResult,
  LocalModelGovernanceBenchmarkCloseoutValidation,
} from './localModelGovernanceBenchmarkCloseoutTypes.ts';

const EXPECTED = [
  { candidateId: 'qwen3-0-6b-candidate', candidateTier: 'light', modelClass: '0.6B', exactModelName: 'Qwen3-0.6B' },
  { candidateId: 'qwen3-1-7b-candidate', candidateTier: 'standard', modelClass: '1.7B', exactModelName: 'Qwen3-1.7B' },
  { candidateId: 'qwen3-4b-candidate', candidateTier: 'pro', modelClass: '4B', exactModelName: 'Qwen3-4B' },
] as const;
const REQUIRED_FEATURES = ['ai-tutor', 'practice-generator', 'learner-memory', 'writing-coach', 'speaking-coach'] as const;

function unique(values: readonly string[]): readonly string[] { return [...new Set(values)]; }
function countById<T extends { candidateId: string }>(items: readonly T[], id: string): number { return items.filter((item) => item.candidateId === id).length; }
function oneById<T extends { candidateId: string }>(items: readonly T[], id: string): T | null {
  const matches = items.filter((item) => item.candidateId === id);
  return matches.length === 1 ? matches[0]! : null;
}
function finding(
  findingId: string,
  area: LocalModelGovernanceBenchmarkCloseoutFindingArea,
  passed: boolean,
  summary: string,
  blocker: string,
  warning?: string,
): LocalModelGovernanceBenchmarkCloseoutFinding {
  return {
    findingId,
    area,
    severity: passed ? (warning ? 'warning' : 'info') : 'error',
    passed,
    summary,
    blockers: passed ? [] : [blocker],
    warnings: passed && warning ? [warning] : [],
  };
}
function noEvidenceConflict(record: { evidenceStatus?: string; conflicts?: readonly string[] } | null): boolean {
  return Boolean(record && record.evidenceStatus !== 'conflicting-evidence' && (record.conflicts?.length ?? 0) === 0);
}

export function buildCurrentLocalModelGovernanceBenchmarkCloseoutInput(): LocalModelGovernanceBenchmarkCloseoutInput {
  const phase4 = buildCurrentLocalModelAcquisitionCloseout();
  const visible = new Set(AI_FEATURE_REGISTRY.map((feature) => feature.id));
  return {
    candidateEvidenceRecords: listLocalModelCandidateEvidence(),
    artifactEvidenceRecords: listLocalModelArtifactEvidence(),
    artifactIntegrityRecords: listLocalModelArtifactIntegrityEvidence(),
    governancePackets: listCurrentLocalModelGovernanceReviewPackets(),
    evidenceClosureRecords: listLocalModelGovernanceEvidenceClosures(),
    governanceDecisionResults: listCurrentLocalModelHumanGovernanceDecisions(),
    artifactSelectionResults: listCurrentLocalModelHumanArtifactSelections(),
    artifactApprovalResults: listCurrentLocalModelArtifactApprovalIntegrityResults(),
    benchmarkPlanResults: listCurrentSelectedArtifactBenchmarkPlanResults(),
    phase4CloseoutFoundationComplete: phase4.status === 'foundation-complete' && phase4.phaseFoundationComplete,
    productionExecutorAvailable: phase4.productionExecutorAvailable || phase4.productionExecutionAvailable,
    deterministicFallbackAvailable: phase4.deterministicFallbackAvailable,
    featureParityPreserved: REQUIRED_FEATURES.every((id) => visible.has(id)),
    claimedDownloadLocationsConfigured: 0,
    claimedDownloadableArtifacts: 0,
    claimedCacheableArtifacts: 0,
    claimedRuntimeReadyArtifacts: 0,
    claimedActiveModels: 0,
  };
}

function buildCandidate(input: LocalModelGovernanceBenchmarkCloseoutInput, expected: typeof EXPECTED[number]): LocalModelGovernanceBenchmarkCandidateCloseout {
  const candidate = oneById(input.candidateEvidenceRecords, expected.candidateId);
  const artifact = oneById(input.artifactEvidenceRecords, expected.candidateId);
  const integrity = oneById(input.artifactIntegrityRecords, expected.candidateId);
  const packet = oneById(input.governancePackets, expected.candidateId);
  const closure = oneById(input.evidenceClosureRecords, expected.candidateId);
  const governance = oneById(input.governanceDecisionResults, expected.candidateId);
  const selection = oneById(input.artifactSelectionResults, expected.candidateId);
  const approval = oneById(input.artifactApprovalResults, expected.candidateId);
  const benchmark = oneById(input.benchmarkPlanResults, expected.candidateId);

  const identities = [candidate, artifact, integrity, packet, closure, selection, approval, benchmark].filter(Boolean) as Array<{
    candidateId: string; candidateTier: string; modelClass?: string; exactModelName?: string;
  }>;
  const candidateIdentityConsistent = identities.length === 8 && identities.every((item) =>
    item.candidateId === expected.candidateId
    && item.candidateTier === expected.candidateTier
    && (!item.modelClass || item.modelClass === expected.modelClass)
    && (!item.exactModelName || item.exactModelName === expected.exactModelName));
  const repositoryRevisionConsistent = Boolean(artifact && integrity && packet && closure
    && artifact.officialRepositoryId === integrity.officialRepositoryId
    && artifact.officialRepositoryId === packet.officialRepositoryId
    && artifact.officialRepositoryId === closure.officialRepositoryId
    && artifact.observedRevision === integrity.observedRevision
    && artifact.observedRevision === packet.observedRevision
    && artifact.observedRevision === closure.observedRevision);
  const tierMatrixConsistent = Boolean(candidate
    && candidate.candidateTier === expected.candidateTier
    && candidate.modelClass === expected.modelClass
    && candidate.exactModelName === expected.exactModelName);
  const evidenceFoundationPresent = Boolean(candidate && artifact && integrity
    && noEvidenceConflict(candidate) && noEvidenceConflict(artifact) && noEvidenceConflict(integrity));
  const findings = [
    finding(`${expected.candidateId}:identity`, 'candidate-identity', candidateIdentityConsistent && repositoryRevisionConsistent,
      'Candidate identity, repository, and revision remain consistent across Phase 5.', 'candidate-identity-or-revision-mismatch'),
    finding(`${expected.candidateId}:tier`, 'tier-matrix', tierMatrixConsistent,
      'Candidate tier and model class match the fixed tier matrix.', 'candidate-tier-matrix-mismatch'),
    finding(`${expected.candidateId}:evidence`, 'model-license-evidence', evidenceFoundationPresent,
      'Candidate, provenance, and integrity evidence foundations are present.', 'candidate-evidence-foundation-missing-or-conflicting'),
    finding(`${expected.candidateId}:boundaries`, 'protected-state', Boolean(packet && closure && governance && selection && approval && benchmark),
      'Governance, selection, approval, and benchmark-planning boundaries are present.', 'candidate-phase-boundary-missing'),
  ];

  return {
    candidateId: expected.candidateId,
    candidateTier: expected.candidateTier,
    modelClass: candidate?.modelClass ?? expected.modelClass,
    exactModelName: candidate?.exactModelName ?? expected.exactModelName,
    officialRepositoryId: artifact?.officialRepositoryId ?? null,
    observedRevision: artifact?.observedRevision ?? null,
    findings,
    candidateIdentityConsistent: candidateIdentityConsistent && repositoryRevisionConsistent,
    tierMatrixConsistent,
    evidenceFoundationPresent,
    governanceReviewPacketPresent: Boolean(packet),
    evidenceClosurePresent: Boolean(closure && closure.requirements.length === 4),
    governanceDecisionBoundaryPresent: Boolean(governance),
    artifactSelectionBoundaryPresent: Boolean(selection),
    artifactApprovalBoundaryPresent: Boolean(approval),
    benchmarkPlanBoundaryPresent: Boolean(benchmark),
    humanDecisionsRecorded: governance?.recordedDecisionItems ?? 0,
    governanceDecisionsComplete: governance?.status === 'governance-decisions-complete',
    artifactSelectionRecorded: selection?.humanSelectionRecorded ?? false,
    artifactSelected: selection?.artifactSelected ?? false,
    artifactApproved: approval?.artifactApproved ?? false,
    checksumPinned: approval?.checksumPinned ?? false,
    checksumVerified: approval?.checksumVerified ?? false,
    benchmarkPlanApproved: benchmark?.benchmarkPlanApproved ?? false,
    benchmarkExecutionStarted: benchmark?.benchmarkExecutionStarted ?? false,
    benchmarkExecutionCompleted: benchmark?.benchmarkExecutionCompleted ?? false,
    benchmarkMeasurementsRecorded: benchmark?.benchmarkMeasurementsRecorded ?? false,
    benchmarkVerified: benchmark?.benchmarkVerified ?? false,
    benchmarkPassed: benchmark?.benchmarkPassed ?? false,
    benchmarkFailed: benchmark?.benchmarkFailed ?? false,
    downloadLocationConfigured: selection?.downloadLocationConfigured ?? approval?.downloadLocationConfigured ?? false,
    downloadable: benchmark?.downloadable ?? approval?.downloadable ?? selection?.downloadable ?? false,
    cacheable: approval?.cacheable ?? selection?.cacheable ?? false,
    runtimeReady: benchmark?.runtimeReady ?? approval?.runtimeReady ?? selection?.runtimeReady ?? false,
    modelActive: benchmark?.modelActive ?? approval?.modelActive ?? selection?.modelActive ?? false,
    deterministicFallbackAvailable: input.deterministicFallbackAvailable,
    featureParityPreserved: input.featureParityPreserved,
  };
}

export function buildLocalModelGovernanceBenchmarkCandidateCloseouts(
  input: LocalModelGovernanceBenchmarkCloseoutInput = buildCurrentLocalModelGovernanceBenchmarkCloseoutInput(),
): readonly LocalModelGovernanceBenchmarkCandidateCloseout[] {
  return EXPECTED.map((expected) => buildCandidate(input, expected));
}

function globalFindings(input: LocalModelGovernanceBenchmarkCloseoutInput, candidates: readonly LocalModelGovernanceBenchmarkCandidateCloseout[]): readonly LocalModelGovernanceBenchmarkCloseoutFinding[] {
  const exactCounts = EXPECTED.every((expected) =>
    countById(input.candidateEvidenceRecords, expected.candidateId) === 1
    && countById(input.artifactEvidenceRecords, expected.candidateId) === 1
    && countById(input.artifactIntegrityRecords, expected.candidateId) === 1
    && countById(input.governancePackets, expected.candidateId) === 1
    && countById(input.evidenceClosureRecords, expected.candidateId) === 1
    && countById(input.governanceDecisionResults, expected.candidateId) === 1
    && countById(input.artifactSelectionResults, expected.candidateId) === 1
    && countById(input.artifactApprovalResults, expected.candidateId) === 1
    && countById(input.benchmarkPlanResults, expected.candidateId) === 1);
  const exactCollectionSizes = [
    input.candidateEvidenceRecords, input.artifactEvidenceRecords, input.artifactIntegrityRecords,
    input.governancePackets, input.evidenceClosureRecords, input.governanceDecisionResults,
    input.artifactSelectionResults, input.artifactApprovalResults, input.benchmarkPlanResults,
  ].every((items) => items.length === 3);
  const closureCount = input.evidenceClosureRecords.reduce((sum, item) => sum + item.requirements.length, 0);
  const decisionItems = input.governanceDecisionResults.reduce((sum, item) => sum + item.totalDecisionItems, 0);
  const productionLifecycleSafe = input.governanceDecisionResults.every((item) => !item.humanDecisionRecorded && !item.allRequiredDecisionsRecorded && !item.canProceedToArtifactSelectionReview)
    && input.artifactSelectionResults.every((item) => !item.humanSelectionRecorded && !item.canProceedToArtifactApprovalReview)
    && input.artifactApprovalResults.every((item) => !item.humanArtifactApprovalRecorded && !item.humanIntegrityPinningDecisionRecorded && !item.canProceedToBenchmarkPlanning)
    && input.benchmarkPlanResults.every((item) => !item.humanPlanDecisionRecorded && !item.canProceedToFutureBenchmarkExecutionReview)
    && candidates.every((item) =>
    item.humanDecisionsRecorded === 0 && !item.governanceDecisionsComplete
    && !item.artifactSelectionRecorded && !item.artifactSelected && !item.artifactApproved
    && !item.checksumPinned && !item.checksumVerified && !item.benchmarkPlanApproved
    && !item.benchmarkExecutionStarted && !item.benchmarkExecutionCompleted
    && !item.benchmarkMeasurementsRecorded && !item.benchmarkVerified
    && !item.benchmarkPassed && !item.benchmarkFailed && !item.downloadLocationConfigured
    && !item.downloadable && !item.cacheable && !item.runtimeReady && !item.modelActive)
    && input.claimedDownloadLocationsConfigured === 0 && input.claimedDownloadableArtifacts === 0
    && input.claimedCacheableArtifacts === 0 && input.claimedRuntimeReadyArtifacts === 0
    && input.claimedActiveModels === 0 && !input.productionExecutorAvailable;

  return [
    finding('phase5:candidate-collections', 'candidate-identity', exactCounts && exactCollectionSizes,
      'Every Phase 5 boundary contains exactly one record for each production candidate.', 'phase5-candidate-record-count-mismatch'),
    finding('phase5:identity-consistency', 'candidate-identity', candidates.every((item) => item.candidateIdentityConsistent),
      'Candidate identity, repository, and immutable revision are consistent.', 'phase5-candidate-identity-mismatch'),
    finding('phase5:tier-matrix', 'tier-matrix', candidates.every((item) => item.tierMatrixConsistent),
      'Light, Standard, and Pro remain bound to 0.6B, 1.7B, and 4B respectively.', 'phase5-tier-matrix-mismatch'),
    finding('phase5:evidence-foundation', 'model-license-evidence', candidates.every((item) => item.evidenceFoundationPresent),
      'Evidence, provenance, and integrity foundations are present and conflict-free.', 'phase5-evidence-foundation-incomplete'),
    finding('phase5:governance-packets', 'governance-reconciliation', input.governancePackets.length === 3,
      'Three governance review packets are present.', 'phase5-governance-packet-count-mismatch'),
    finding('phase5:evidence-closure', 'governance-evidence-closure', input.evidenceClosureRecords.length === 3 && closureCount === 12,
      'Three evidence-closure records contain twelve requirement closures.', 'phase5-evidence-closure-count-mismatch'),
    finding('phase5:governance-decisions', 'human-governance-decision', input.governanceDecisionResults.length === 3 && decisionItems === 12
      && input.governanceDecisionResults.every((item) => item.recordedDecisionItems === 0 && !item.humanDecisionRecorded && !item.allRequiredDecisionsRecorded && item.status !== 'governance-decisions-complete'),
      'Governance decision boundary is present with zero production decisions recorded.', 'phase5-governance-decision-state-not-blocked-safe',
      'Human governance decisions are intentionally not recorded.'),
    finding('phase5:artifact-selection', 'human-artifact-selection', input.artifactSelectionResults.length === 3
      && input.artifactSelectionResults.every((item) => !item.humanSelectionRecorded && !item.artifactSelected),
      'Artifact-selection boundary is present with zero production selections.', 'phase5-artifact-selection-state-not-blocked-safe',
      'No artifact has been selected.'),
    finding('phase5:artifact-approval', 'artifact-approval', input.artifactApprovalResults.length === 3
      && input.artifactApprovalResults.every((item) => !item.humanArtifactApprovalRecorded && !item.artifactApproved),
      'Artifact-approval boundary is present with zero approvals.', 'phase5-artifact-approval-state-not-blocked-safe',
      'No artifact has been approved.'),
    finding('phase5:integrity-pinning', 'integrity-pinning', input.artifactApprovalResults.every((item) => !item.humanIntegrityPinningDecisionRecorded && !item.checksumPinned),
      'Integrity-pinning boundary is present with zero approved pin plans.', 'phase5-integrity-pinning-state-not-blocked-safe'),
    finding('phase5:checksum-verification', 'checksum-verification', input.artifactApprovalResults.every((item) => !item.checksumVerified),
      'No production checksum has been verified.', 'phase5-checksum-verification-unexpected'),
    finding('phase5:benchmark-planning', 'benchmark-planning', input.benchmarkPlanResults.length === 3
      && input.benchmarkPlanResults.every((item) => !item.benchmarkPlanApproved),
      'Benchmark-planning boundary is present with zero approved plans.', 'phase5-benchmark-plan-state-not-blocked-safe',
      'No benchmark plan has been approved.'),
    finding('phase5:benchmark-execution', 'benchmark-execution', input.benchmarkPlanResults.every((item) =>
      !item.benchmarkExecutionStarted && !item.benchmarkExecutionCompleted && !item.benchmarkMeasurementsRecorded
      && !item.benchmarkVerified && !item.benchmarkPassed && !item.benchmarkFailed),
      'No benchmark execution, measurement, pass, or failure is recorded.', 'phase5-benchmark-execution-state-unexpected'),
    finding('phase5:production-lifecycle', 'runtime-boundary', productionLifecycleSafe,
      'Production remains blocked-safe with no download, cache, runtime, or active model state.', 'phase5-production-lifecycle-not-blocked-safe'),
    finding('phase5:phase4-closeout', 'protected-state', input.phase4CloseoutFoundationComplete && !input.productionExecutorAvailable,
      'Phase 4 closeout remains foundation-complete and the production executor remains unavailable.', 'phase4-closeout-or-executor-boundary-failed'),
    finding('phase5:fallback', 'fallback-continuity', input.deterministicFallbackAvailable,
      'Deterministic fallback remains available.', 'deterministic-fallback-unavailable'),
    finding('phase5:feature-parity', 'feature-parity', input.featureParityPreserved,
      'AI-facing feature parity remains preserved.', 'ai-feature-parity-broken'),
  ];
}

export function evaluateLocalModelGovernanceBenchmarkCloseout(input: LocalModelGovernanceBenchmarkCloseoutInput): LocalModelGovernanceBenchmarkCloseoutResult {
  const candidates = buildLocalModelGovernanceBenchmarkCandidateCloseouts(input);
  const findings = [...candidates.flatMap((item) => item.findings), ...globalFindings(input, candidates)];
  const blockers = unique(findings.flatMap((item) => item.blockers));
  const warnings = unique(findings.flatMap((item) => item.warnings));
  const errorFindings = findings.filter((item) => item.severity === 'error').length;
  const warningFindings = findings.filter((item) => item.severity === 'warning').length;
  const aggregate = {
    totalCandidates: input.candidateEvidenceRecords.length,
    exactCandidateIdentities: candidates.filter((item) => item.candidateIdentityConsistent).length,
    consistentTierMappings: candidates.filter((item) => item.tierMatrixConsistent).length,
    evidenceRecords: input.candidateEvidenceRecords.length,
    artifactProvenanceRecords: input.artifactEvidenceRecords.length,
    artifactIntegrityRecords: input.artifactIntegrityRecords.length,
    governanceReviewPackets: input.governancePackets.length,
    evidenceClosureRecords: input.evidenceClosureRecords.length,
    evidenceClosureRequirements: input.evidenceClosureRecords.reduce((sum, item) => sum + item.requirements.length, 0),
    governanceDecisionSessions: input.governanceDecisionResults.length,
    governanceDecisionItemsRequired: input.governanceDecisionResults.reduce((sum, item) => sum + item.totalDecisionItems, 0),
    governanceDecisionItemsRecorded: input.governanceDecisionResults.reduce((sum, item) => sum + item.recordedDecisionItems, 0),
    governanceDecisionsComplete: input.governanceDecisionResults.filter((item) => item.status === 'governance-decisions-complete').length,
    artifactSelectionSessions: input.artifactSelectionResults.length,
    artifactSelectionsRecorded: input.artifactSelectionResults.filter((item) => item.humanSelectionRecorded).length,
    selectedArtifacts: input.artifactSelectionResults.filter((item) => item.artifactSelected).length,
    artifactApprovalSessions: input.artifactApprovalResults.length,
    artifactApprovalDecisionsRecorded: input.artifactApprovalResults.filter((item) => item.humanArtifactApprovalRecorded).length,
    integrityPinningDecisionsRecorded: input.artifactApprovalResults.filter((item) => item.humanIntegrityPinningDecisionRecorded).length,
    approvedArtifacts: input.artifactApprovalResults.filter((item) => item.artifactApproved).length,
    approvedPinPlans: input.artifactApprovalResults.filter((item) => item.artifactApprovalComplete && item.checksumPinned).length,
    checksumPinnedArtifacts: input.artifactApprovalResults.filter((item) => item.checksumPinned).length,
    checksumVerifiedArtifacts: input.artifactApprovalResults.filter((item) => item.checksumVerified).length,
    benchmarkPlanSessions: input.benchmarkPlanResults.length,
    benchmarkPlansApproved: input.benchmarkPlanResults.filter((item) => item.benchmarkPlanApproved).length,
    benchmarkExecutionsStarted: input.benchmarkPlanResults.filter((item) => item.benchmarkExecutionStarted).length,
    benchmarkExecutionsCompleted: input.benchmarkPlanResults.filter((item) => item.benchmarkExecutionCompleted).length,
    benchmarkMeasurementsRecorded: input.benchmarkPlanResults.filter((item) => item.benchmarkMeasurementsRecorded).length,
    benchmarkPassedCandidates: input.benchmarkPlanResults.filter((item) => item.benchmarkPassed).length,
    benchmarkFailedCandidates: input.benchmarkPlanResults.filter((item) => item.benchmarkFailed).length,
    downloadLocationsConfigured: input.claimedDownloadLocationsConfigured + input.artifactApprovalResults.filter((item) => item.downloadLocationConfigured).length,
    downloadableArtifacts: input.claimedDownloadableArtifacts + input.benchmarkPlanResults.filter((item) => item.downloadable).length,
    cacheableArtifacts: input.claimedCacheableArtifacts + input.artifactApprovalResults.filter((item) => item.cacheable).length,
    runtimeReadyArtifacts: input.claimedRuntimeReadyArtifacts + input.benchmarkPlanResults.filter((item) => item.runtimeReady).length,
    activeModels: input.claimedActiveModels + input.benchmarkPlanResults.filter((item) => item.modelActive).length,
    candidatesWithFallback: candidates.filter((item) => item.deterministicFallbackAvailable).length,
    candidatesWithFeatureParity: candidates.filter((item) => item.featureParityPreserved).length,
    errorFindings,
    warningFindings,
  };
  const productionBlockedSafe = input.governanceDecisionResults.every((item) => !item.humanDecisionRecorded && !item.allRequiredDecisionsRecorded && !item.canProceedToArtifactSelectionReview)
    && input.artifactSelectionResults.every((item) => !item.humanSelectionRecorded && !item.canProceedToArtifactApprovalReview)
    && input.artifactApprovalResults.every((item) => !item.humanArtifactApprovalRecorded && !item.humanIntegrityPinningDecisionRecorded && !item.canProceedToBenchmarkPlanning)
    && input.benchmarkPlanResults.every((item) => !item.humanPlanDecisionRecorded && !item.canProceedToFutureBenchmarkExecutionReview)
    && aggregate.governanceDecisionItemsRecorded === 0 && aggregate.governanceDecisionsComplete === 0
    && aggregate.artifactSelectionsRecorded === 0 && aggregate.selectedArtifacts === 0
    && aggregate.artifactApprovalDecisionsRecorded === 0 && aggregate.integrityPinningDecisionsRecorded === 0
    && aggregate.approvedArtifacts === 0 && aggregate.checksumPinnedArtifacts === 0 && aggregate.checksumVerifiedArtifacts === 0
    && aggregate.benchmarkPlansApproved === 0 && aggregate.benchmarkExecutionsStarted === 0
    && aggregate.benchmarkExecutionsCompleted === 0 && aggregate.benchmarkMeasurementsRecorded === 0
    && aggregate.benchmarkPassedCandidates === 0 && aggregate.benchmarkFailedCandidates === 0
    && aggregate.downloadLocationsConfigured === 0 && aggregate.downloadableArtifacts === 0 && aggregate.cacheableArtifacts === 0
    && aggregate.runtimeReadyArtifacts === 0 && aggregate.activeModels === 0 && !input.productionExecutorAvailable;
  const governanceFoundationComplete = input.governancePackets.length === 3 && input.evidenceClosureRecords.length === 3
    && aggregate.evidenceClosureRequirements === 12 && input.governanceDecisionResults.length === 3;
  const artifactReviewFoundationComplete = input.artifactSelectionResults.length === 3 && input.artifactApprovalResults.length === 3;
  const benchmarkPlanningFoundationComplete = input.benchmarkPlanResults.length === 3;
  const phase5FoundationComplete = errorFindings === 0 && productionBlockedSafe && governanceFoundationComplete
    && artifactReviewFoundationComplete && benchmarkPlanningFoundationComplete;
  return {
    status: phase5FoundationComplete ? 'foundation-complete' : 'attention-required',
    phase5FoundationComplete,
    productionBlockedSafe,
    governanceFoundationComplete,
    artifactReviewFoundationComplete,
    benchmarkPlanningFoundationComplete,
    benchmarkExecutionAvailable: false,
    modelReadinessEstablished: false,
    runtimeReadinessEstablished: false,
    phase4CloseoutFoundationComplete: input.phase4CloseoutFoundationComplete,
    productionExecutorAvailable: input.productionExecutorAvailable,
    candidates,
    findings,
    aggregate,
    blockers,
    warnings,
    closeoutOnly: true,
    humanDecisionRecorded: false,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumVerified: false,
    benchmarkExecutionStarted: false,
    benchmarkPassed: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export function validateLocalModelGovernanceBenchmarkCloseoutInput(input: LocalModelGovernanceBenchmarkCloseoutInput): LocalModelGovernanceBenchmarkCloseoutValidation {
  const result = evaluateLocalModelGovernanceBenchmarkCloseout(input);
  return { valid: result.status === 'foundation-complete', issues: result.blockers };
}
export function buildLocalModelGovernanceBenchmarkCloseout(): LocalModelGovernanceBenchmarkCloseoutResult {
  return evaluateLocalModelGovernanceBenchmarkCloseout(buildCurrentLocalModelGovernanceBenchmarkCloseoutInput());
}
export function listLocalModelGovernanceBenchmarkCloseoutFindings(
  input: LocalModelGovernanceBenchmarkCloseoutInput = buildCurrentLocalModelGovernanceBenchmarkCloseoutInput(),
): readonly LocalModelGovernanceBenchmarkCloseoutFinding[] {
  return evaluateLocalModelGovernanceBenchmarkCloseout(input).findings;
}
