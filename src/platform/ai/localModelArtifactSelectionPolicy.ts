import {
  listCurrentLocalModelCandidateReviewDecisions,
} from './localModelCandidateReviewDecisionPolicy.ts';
import {
  listLocalModelArtifactEvidence,
} from './localModelArtifactEvidenceRegistry.ts';
import type { LocalModelArtifactEvidenceRecord } from './localModelArtifactEvidenceTypes.ts';
import {
  LOCAL_MODEL_ARTIFACT_EVIDENCE_SCOPE_REVISION,
  LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION,
} from './localModelArtifactSelectionTypes.ts';
import type {
  LocalModelArtifactSelectionInput,
  LocalModelArtifactSelectionInputValidation,
  LocalModelArtifactSelectionResult,
  LocalModelArtifactSelectionScope,
  LocalModelArtifactSelectionVariantKind,
} from './localModelArtifactSelectionTypes.ts';
import type { LocalModelCandidateReviewDecisionResult } from './localModelCandidateReviewDecisionTypes.ts';

export { LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION };

const EXPECTED_MODEL_CLASS_BY_TIER = {
  light: '0.6B',
  standard: '1.7B',
  pro: '4B',
} as const;

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  const result: string[] = [];
  for (const value of values) appendUnique(result, value);
  return result;
}

function hasFiniteNonNegativeNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 0;
}

export function isLocalModelArtifactEvidenceCompleteForSelection(
  evidence: LocalModelArtifactEvidenceRecord | null,
): boolean {
  if (!evidence) return false;
  return evidence.evidenceStatus === 'evidence-collected'
    && evidence.missingEvidence.length === 0
    && evidence.conflicts.length === 0
    && evidence.officialRepositoryConfirmed === 'confirmed'
    && evidence.immutableRevisionAvailable === 'confirmed'
    && Boolean(evidence.observedRevision)
    && evidence.artifactFormat !== 'unknown'
    && evidence.officialBaseVariantConfirmed === 'confirmed'
    && evidence.weightFilesPresent === 'confirmed'
    && Number.isInteger(evidence.weightShardCount)
    && (evidence.weightShardCount ?? -1) >= 0
    && evidence.aggregateSizeEvidenceStatus === 'confirmed'
    && hasFiniteNonNegativeNumber(evidence.aggregateWeightSizeBytes)
    && hasFiniteNonNegativeNumber(evidence.aggregateWeightSizeMb)
    && evidence.configPresent === 'confirmed'
    && evidence.tokenizerFilesPresent === 'confirmed'
    && evidence.tokenizerConfigPresent === 'confirmed'
    && evidence.licenseFilePresent === 'confirmed'
    && evidence.modelCardPresent === 'confirmed';
}

export function buildLocalModelArtifactSelectionScope(
  evidence: LocalModelArtifactEvidenceRecord,
  variantKind: LocalModelArtifactSelectionVariantKind,
): LocalModelArtifactSelectionScope | null {
  if (!evidence.observedRevision
    || evidence.artifactFormat === 'unknown'
    || !Number.isInteger(evidence.weightShardCount)
    || (evidence.weightShardCount ?? -1) < 0
    || !hasFiniteNonNegativeNumber(evidence.aggregateWeightSizeBytes)
    || !hasFiniteNonNegativeNumber(evidence.aggregateWeightSizeMb)) {
    return null;
  }

  const quantized = variantKind === 'official-quantized';
  if (variantKind === 'unknown') return null;
  if (quantized && (
    evidence.officialQuantizedVariantAvailable !== 'confirmed'
    || !evidence.officialQuantizedRepositoryId
    || !evidence.quantizationLabel
  )) return null;

  return {
    candidateId: evidence.candidateId,
    candidateTier: evidence.candidateTier,
    modelClass: evidence.modelClass,
    exactModelName: evidence.exactModelName,
    officialRepositoryId: quantized
      ? evidence.officialQuantizedRepositoryId!
      : evidence.officialRepositoryId,
    observedRevision: evidence.observedRevision,
    artifactFormat: evidence.artifactFormat,
    variantKind,
    quantizationLabel: quantized ? evidence.quantizationLabel : null,
    weightShardCount: evidence.weightShardCount!,
    aggregateWeightSizeBytes: evidence.aggregateWeightSizeBytes,
    aggregateWeightSizeMb: evidence.aggregateWeightSizeMb,
    tokenizerEvidenceStatus: evidence.tokenizerFilesPresent,
    configEvidenceStatus: evidence.configPresent,
    artifactEvidenceRevision: LOCAL_MODEL_ARTIFACT_EVIDENCE_SCOPE_REVISION,
    selectionPolicyRevision: LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION,
  };
}

export function isSameLocalModelArtifactSelectionScope(
  left: LocalModelArtifactSelectionScope | null,
  right: LocalModelArtifactSelectionScope | null,
): boolean {
  if (!left || !right) return left === right;
  return left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.modelClass === right.modelClass
    && left.exactModelName === right.exactModelName
    && left.officialRepositoryId === right.officialRepositoryId
    && left.observedRevision === right.observedRevision
    && left.artifactFormat === right.artifactFormat
    && left.variantKind === right.variantKind
    && left.quantizationLabel === right.quantizationLabel
    && left.weightShardCount === right.weightShardCount
    && left.aggregateWeightSizeBytes === right.aggregateWeightSizeBytes
    && left.aggregateWeightSizeMb === right.aggregateWeightSizeMb
    && left.tokenizerEvidenceStatus === right.tokenizerEvidenceStatus
    && left.configEvidenceStatus === right.configEvidenceStatus
    && left.artifactEvidenceRevision === right.artifactEvidenceRevision
    && left.selectionPolicyRevision === right.selectionPolicyRevision;
}

export function createUnselectedLocalModelArtifactInput(
  evidenceRecord: LocalModelArtifactEvidenceRecord,
  reviewDecision: LocalModelCandidateReviewDecisionResult,
): LocalModelArtifactSelectionInput {
  return {
    candidateId: evidenceRecord.candidateId,
    candidateTier: evidenceRecord.candidateTier,
    modelLicenseReviewResult: reviewDecision,
    artifactEvidenceRecord: evidenceRecord,
    decision: 'not-selected',
    decisionRecorded: false,
    selectedScope: null,
    rejectionReasonCode: null,
    decisionRevision: LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION,
    claimedArtifactApproved: false,
    claimedChecksumPinned: false,
    claimedDownloadable: false,
    claimedRuntimeReady: false,
    claimedModelActive: false,
  };
}

function selectionWasAttempted(input: LocalModelArtifactSelectionInput): boolean {
  return input.decision === 'selected' || input.selectedScope !== null;
}

export function validateLocalModelArtifactSelectionInput(
  input: LocalModelArtifactSelectionInput,
): LocalModelArtifactSelectionInputValidation {
  const issues: string[] = [];
  const evidence = input.artifactEvidenceRecord;
  const review = input.modelLicenseReviewResult;

  if (input.decisionRevision !== LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION) {
    appendUnique(issues, 'selection-decision-revision-mismatch');
  }
  if (!evidence) appendUnique(issues, 'artifact-evidence-unavailable');
  if (!review) appendUnique(issues, 'model-license-review-unavailable');

  if (evidence) {
    if (input.candidateId !== evidence.candidateId) appendUnique(issues, 'candidate-id-mismatch');
    if (input.candidateTier !== evidence.candidateTier) appendUnique(issues, 'candidate-tier-mismatch');
    if (evidence.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[evidence.candidateTier]) {
      appendUnique(issues, 'model-class-mismatch');
    }
  }
  if (review) {
    if (input.candidateId !== review.candidateId) appendUnique(issues, 'review-candidate-id-mismatch');
    if (input.candidateTier !== review.candidateTier) appendUnique(issues, 'review-candidate-tier-mismatch');
  }

  if (!input.decisionRecorded && input.decision !== 'not-selected') {
    appendUnique(issues, 'decision-recorded-flag-mismatch');
  }
  if (input.decisionRecorded && input.decision === 'not-selected') {
    appendUnique(issues, 'recorded-decision-is-not-selected');
  }
  if (input.decision === 'selected' && input.selectedScope === null) {
    appendUnique(issues, 'selected-scope-missing');
  }
  if (input.decision !== 'selected' && input.selectedScope !== null) {
    appendUnique(issues, 'unexpected-selected-scope');
  }
  if (input.decision === 'rejected' && !input.rejectionReasonCode) {
    appendUnique(issues, 'rejection-reason-code-missing');
  }
  if (input.decision !== 'rejected' && input.rejectionReasonCode !== null) {
    appendUnique(issues, 'unexpected-rejection-reason-code');
  }

  const reviewPassed = review?.status === 'approved-for-artifact-review'
    && review.canProceedToArtifactReview;
  const evidenceComplete = isLocalModelArtifactEvidenceCompleteForSelection(evidence);
  const conflictFree = Boolean(evidence && evidence.conflicts.length === 0
    && evidence.evidenceStatus !== 'conflicting-evidence');

  if (!reviewPassed && selectionWasAttempted(input)) {
    appendUnique(issues, 'selection-attempt-before-model-license-review-pass');
  }
  if (!evidenceComplete && selectionWasAttempted(input)) {
    appendUnique(issues, 'selection-attempt-with-incomplete-artifact-evidence');
  }
  if (!conflictFree && selectionWasAttempted(input)) {
    appendUnique(issues, 'selection-attempt-with-conflicting-artifact-evidence');
  }

  if (input.selectedScope && evidence) {
    const expectedScope = buildLocalModelArtifactSelectionScope(
      evidence,
      input.selectedScope.variantKind,
    );
    if (!expectedScope) {
      appendUnique(issues, 'unsupported-selection-scope');
    } else if (!isSameLocalModelArtifactSelectionScope(input.selectedScope, expectedScope)) {
      appendUnique(issues, 'selection-scope-mismatch');
    }
  }

  if (input.claimedArtifactApproved) appendUnique(issues, 'artifact-approval-claim-not-allowed');
  if (input.claimedChecksumPinned) appendUnique(issues, 'checksum-pinned-claim-not-allowed');
  if (input.claimedDownloadable) appendUnique(issues, 'downloadable-claim-not-allowed');
  if (input.claimedRuntimeReady) appendUnique(issues, 'runtime-ready-claim-not-allowed');
  if (input.claimedModelActive) appendUnique(issues, 'model-active-claim-not-allowed');

  return { valid: issues.length === 0, issues: unique(issues) };
}

export function validateLocalModelArtifactSelectionInputs(
  inputs: readonly LocalModelArtifactSelectionInput[],
): LocalModelArtifactSelectionInputValidation {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    if (seen.has(input.candidateId)) {
      appendUnique(issues, `duplicate-candidate-selection:${input.candidateId}`);
    }
    seen.add(input.candidateId);
    for (const issue of validateLocalModelArtifactSelectionInput(input).issues) {
      appendUnique(issues, `${input.candidateId}:${issue}`);
    }
  }
  return { valid: issues.length === 0, issues: unique(issues) };
}

export function evaluateLocalModelArtifactSelection(
  input: LocalModelArtifactSelectionInput,
): LocalModelArtifactSelectionResult {
  const validation = validateLocalModelArtifactSelectionInput(input);
  const evidence = input.artifactEvidenceRecord;
  const review = input.modelLicenseReviewResult;
  const modelLicenseReviewPassed = Boolean(
    review?.status === 'approved-for-artifact-review'
    && review.canProceedToArtifactReview,
  );
  const artifactEvidenceComplete = isLocalModelArtifactEvidenceCompleteForSelection(evidence);
  const artifactEvidenceConflictFree = Boolean(
    evidence
    && evidence.evidenceStatus !== 'conflicting-evidence'
    && evidence.conflicts.length === 0,
  );
  const expectedScope = input.selectedScope && evidence
    ? buildLocalModelArtifactSelectionScope(evidence, input.selectedScope.variantKind)
    : null;
  const selectionValidForCurrentEvidence = Boolean(
    input.decision === 'selected'
    && input.decisionRecorded
    && input.selectedScope
    && expectedScope
    && isSameLocalModelArtifactSelectionScope(input.selectedScope, expectedScope),
  );

  let status: LocalModelArtifactSelectionResult['status'];
  if (!validation.valid) {
    status = 'attention-required';
  } else if (!modelLicenseReviewPassed) {
    status = 'blocked-by-model-license-review';
  } else if (!artifactEvidenceConflictFree) {
    status = 'attention-required';
  } else if (!artifactEvidenceComplete) {
    status = 'needs-more-artifact-evidence';
  } else if (input.decision === 'rejected') {
    status = 'rejected';
  } else if (input.decision === 'selected' && selectionValidForCurrentEvidence) {
    status = 'selected-for-artifact-approval-review';
  } else {
    status = 'awaiting-human-selection';
  }

  const blockers: string[] = [...validation.issues];
  if (!modelLicenseReviewPassed) appendUnique(blockers, 'model-license-review-not-passed');
  if (!artifactEvidenceComplete) {
    appendUnique(blockers, 'artifact-evidence-incomplete');
    for (const missing of evidence?.missingEvidence ?? []) {
      appendUnique(blockers, `missing-artifact-evidence:${missing}`);
    }
  }
  if (!artifactEvidenceConflictFree) {
    appendUnique(blockers, 'artifact-evidence-conflict');
    for (const conflict of evidence?.conflicts ?? []) appendUnique(blockers, `conflict:${conflict}`);
  }
  if (status === 'awaiting-human-selection') appendUnique(blockers, 'human-artifact-selection-not-recorded');
  if (status === 'rejected') appendUnique(blockers, `selection-rejected:${input.rejectionReasonCode}`);

  const artifactSelected = status === 'selected-for-artifact-approval-review';
  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    status,
    decision: input.decision,
    selectedScope: artifactSelected ? input.selectedScope : null,
    blockers: unique(blockers),
    warnings: [
      'Artifact selection is a human decision gate only and does not approve, pin, download, benchmark, initialize, or activate an artifact.',
    ],
    canSelectArtifact: status === 'awaiting-human-selection',
    canProceedToArtifactApprovalReview: artifactSelected,
    humanSelectionRecorded: input.decisionRecorded,
    modelLicenseReviewPassed,
    artifactEvidenceComplete,
    artifactEvidenceConflictFree,
    selectionValidForCurrentEvidence,
    selectionGateOnly: true,
    artifactSelected,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    checksumPinned: false,
    checksumVerified: false,
    downloadLocationConfigured: false,
    benchmarkVerified: false,
    downloadable: false,
    cacheable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export function buildCurrentLocalModelArtifactSelections(): readonly LocalModelArtifactSelectionResult[] {
  const reviewByCandidateId = new Map(
    listCurrentLocalModelCandidateReviewDecisions().map((result) => [result.candidateId, result]),
  );
  return listLocalModelArtifactEvidence().map((evidence) => {
    const review = reviewByCandidateId.get(evidence.candidateId);
    if (!review) {
      return evaluateLocalModelArtifactSelection({
        candidateId: evidence.candidateId,
        candidateTier: evidence.candidateTier,
        modelLicenseReviewResult: null,
        artifactEvidenceRecord: evidence,
        decision: 'not-selected',
        decisionRecorded: false,
        selectedScope: null,
        rejectionReasonCode: null,
        decisionRevision: LOCAL_MODEL_ARTIFACT_SELECTION_POLICY_REVISION,
        claimedArtifactApproved: false,
        claimedChecksumPinned: false,
        claimedDownloadable: false,
        claimedRuntimeReady: false,
        claimedModelActive: false,
      });
    }
    return evaluateLocalModelArtifactSelection(
      createUnselectedLocalModelArtifactInput(evidence, review),
    );
  });
}

export function listCurrentLocalModelArtifactSelections(): readonly LocalModelArtifactSelectionResult[] {
  return buildCurrentLocalModelArtifactSelections();
}
