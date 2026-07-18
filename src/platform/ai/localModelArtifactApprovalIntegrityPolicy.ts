import { listLocalModelArtifactIntegrityEvidence } from './localModelArtifactIntegrityEvidenceRegistry.ts';
import type {
  LocalModelArtifactIntegrityAlgorithmKind,
  LocalModelArtifactIntegrityCandidateRecord,
  LocalModelArtifactIntegrityFileEvidence,
} from './localModelArtifactIntegrityEvidenceTypes.ts';
import { listCurrentLocalModelHumanArtifactSelections } from './localModelHumanArtifactSelectionPolicy.ts';
import type {
  LocalModelHumanArtifactSelectionResult,
  LocalModelHumanArtifactSelectionScope,
} from './localModelHumanArtifactSelectionTypes.ts';
import {
  LOCAL_MODEL_ARTIFACT_APPROVAL_POLICY_REVISION,
  LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION,
} from './localModelArtifactApprovalIntegrityTypes.ts';
import type {
  LocalModelArtifactApprovalIntegrityInput,
  LocalModelArtifactApprovalIntegrityResult,
  LocalModelArtifactApprovalIntegrityValidation,
  LocalModelArtifactApprovalScope,
  LocalModelArtifactIntegrityPinItem,
  LocalModelArtifactIntegrityPinPlan,
} from './localModelArtifactApprovalIntegrityTypes.ts';

export {
  LOCAL_MODEL_ARTIFACT_APPROVAL_POLICY_REVISION,
  LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION,
};

const EXPECTED_MODEL_CLASS_BY_TIER = {
  light: '0.6B',
  standard: '1.7B',
  pro: '4B',
} as const;

const SUPPORTED_PIN_ALGORITHMS = new Set<LocalModelArtifactIntegrityAlgorithmKind>([
  'sha256',
  'lfs-sha256',
]);

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function canonicalStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function canonicalAlgorithms(
  values: readonly LocalModelArtifactIntegrityAlgorithmKind[],
): readonly LocalModelArtifactIntegrityAlgorithmKind[] {
  return [...new Set(values)].sort();
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  const a = canonicalStrings(left);
  const b = canonicalStrings(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function sameAlgorithms(
  left: readonly LocalModelArtifactIntegrityAlgorithmKind[],
  right: readonly LocalModelArtifactIntegrityAlgorithmKind[],
): boolean {
  const a = canonicalAlgorithms(left);
  const b = canonicalAlgorithms(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function canonicalPinItems(
  items: readonly LocalModelArtifactIntegrityPinItem[],
): readonly LocalModelArtifactIntegrityPinItem[] {
  return [...items].sort((left, right) => left.fileName.localeCompare(right.fileName));
}

function samePinItems(
  left: readonly LocalModelArtifactIntegrityPinItem[],
  right: readonly LocalModelArtifactIntegrityPinItem[],
): boolean {
  const a = canonicalPinItems(left);
  const b = canonicalPinItems(right);
  return a.length === b.length && a.every((item, index) => {
    const other = b[index];
    return item.fileName === other.fileName
      && item.fileRole === other.fileRole
      && item.exactSizeBytes === other.exactSizeBytes
      && item.algorithm === other.algorithm
      && item.expectedDigest === other.expectedDigest
      && item.sourceRevision === other.sourceRevision
      && item.sourceEvidenceId === other.sourceEvidenceId
      && item.pinnedForSelectedScope === other.pinnedForSelectedScope
      && item.verified === other.verified;
  });
}

function clonePinItem(item: LocalModelArtifactIntegrityPinItem): LocalModelArtifactIntegrityPinItem {
  return { ...item };
}

function clonePinPlan(plan: LocalModelArtifactIntegrityPinPlan): LocalModelArtifactIntegrityPinPlan {
  return {
    ...plan,
    requiredFiles: [...plan.requiredFiles],
    pinItems: plan.pinItems.map(clonePinItem),
  };
}

function cloneApprovalScope(scope: LocalModelArtifactApprovalScope): LocalModelArtifactApprovalScope {
  return {
    ...scope,
    integrityAlgorithmsObserved: [...scope.integrityAlgorithmsObserved],
    requiredFiles: [...scope.requiredFiles],
    pinItems: scope.pinItems.map(clonePinItem),
  };
}

function selectionRecorded(result: LocalModelHumanArtifactSelectionResult | null): result is LocalModelHumanArtifactSelectionResult {
  return Boolean(result
    && result.status === 'selection-recorded'
    && result.artifactSelected
    && result.canProceedToArtifactApprovalReview
    && result.selectedOptionId
    && result.selectedScope);
}

function integrityConflict(record: LocalModelArtifactIntegrityCandidateRecord | null): boolean {
  return Boolean(record && (
    record.evidenceStatus === 'conflicting-evidence'
    || record.conflicts.length > 0
    || record.immutableRevisionConfirmed === 'conflicting'
    || record.fileInventoryStatus === 'conflicting'
    || record.shardInventoryStatus === 'conflicting'
  ));
}

function finiteNonNegativeInteger(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function validDigest(algorithm: LocalModelArtifactIntegrityAlgorithmKind, digest: string): boolean {
  return SUPPORTED_PIN_ALGORITHMS.has(algorithm) && /^[a-f0-9]{64}$/.test(digest);
}

function requiredWeightFileMap(
  record: LocalModelArtifactIntegrityCandidateRecord,
): ReadonlyMap<string, LocalModelArtifactIntegrityFileEvidence> {
  return new Map(record.requiredWeightFiles.map((file) => [file.fileName, file]));
}

function selectionMatchesIntegrity(
  selection: LocalModelHumanArtifactSelectionResult | null,
  integrity: LocalModelArtifactIntegrityCandidateRecord | null,
): boolean {
  if (!selectionRecorded(selection) || !integrity || !selection.selectedScope) return false;
  const scope = selection.selectedScope;
  return selection.candidateId === integrity.candidateId
    && selection.candidateTier === integrity.candidateTier
    && scope.modelClass === integrity.modelClass
    && scope.exactModelName === integrity.exactModelName
    && scope.officialRepositoryId === integrity.officialRepositoryId
    && scope.observedRevision === integrity.observedRevision
    && scope.weightShardCount === integrity.weightShardCount
    && scope.exactWeightBytes === integrity.exactWeightBytes
    && sameAlgorithms(scope.integrityAlgorithmsObserved, integrity.integrityAlgorithmsObserved);
}

export function validateLocalModelArtifactIntegrityPinPlan(
  plan: LocalModelArtifactIntegrityPinPlan,
  selectedScope: LocalModelArtifactApprovalScope,
  integrityEvidence: LocalModelArtifactIntegrityCandidateRecord,
): LocalModelArtifactApprovalIntegrityValidation {
  const issues: string[] = [];
  if (plan.candidateId !== selectedScope.candidateId || plan.candidateId !== integrityEvidence.candidateId) {
    appendUnique(issues, 'pin-plan-candidate-mismatch');
  }
  if (plan.candidateTier !== selectedScope.candidateTier || plan.candidateTier !== integrityEvidence.candidateTier) {
    appendUnique(issues, 'pin-plan-tier-mismatch');
  }
  if (plan.selectedOptionId !== selectedScope.selectedOptionId) appendUnique(issues, 'pin-plan-option-id-mismatch');
  if (plan.officialRepositoryId !== selectedScope.officialRepositoryId
    || plan.officialRepositoryId !== integrityEvidence.officialRepositoryId) {
    appendUnique(issues, 'pin-plan-repository-mismatch');
  }
  if (plan.observedRevision !== selectedScope.observedRevision
    || plan.observedRevision !== integrityEvidence.observedRevision) {
    appendUnique(issues, 'pin-plan-revision-mismatch');
  }
  if (plan.artifactFormat !== selectedScope.artifactFormat) appendUnique(issues, 'pin-plan-format-mismatch');
  if (plan.variantKind !== selectedScope.variantKind) appendUnique(issues, 'pin-plan-variant-mismatch');
  if (plan.quantizationLabel !== selectedScope.quantizationLabel) appendUnique(issues, 'pin-plan-quantization-mismatch');
  if (plan.artifactSelectionRevision !== selectedScope.artifactSelectionRevision) {
    appendUnique(issues, 'pin-plan-selection-revision-mismatch');
  }
  if (plan.integrityEvidenceRevision !== selectedScope.integrityEvidenceRevision) {
    appendUnique(issues, 'pin-plan-integrity-revision-mismatch');
  }
  if (plan.pinPlanRevision !== LOCAL_MODEL_ARTIFACT_INTEGRITY_PIN_PLAN_REVISION
    || plan.pinPlanRevision !== selectedScope.pinPlanRevision) {
    appendUnique(issues, 'pin-plan-policy-revision-mismatch');
  }

  if (new Set(plan.requiredFiles).size !== plan.requiredFiles.length) appendUnique(issues, 'duplicate-required-file');
  const pinNames = plan.pinItems.map((item) => item.fileName);
  if (new Set(pinNames).size !== pinNames.length) appendUnique(issues, 'duplicate-pin-item');

  const evidenceFiles = requiredWeightFileMap(integrityEvidence);
  const evidenceNames = [...evidenceFiles.keys()];
  if (!sameStrings(plan.requiredFiles, evidenceNames)) appendUnique(issues, 'required-file-set-mismatch');
  for (const requiredFile of plan.requiredFiles) {
    if (!pinNames.includes(requiredFile)) appendUnique(issues, `missing-pin:${requiredFile}`);
  }
  for (const pinName of pinNames) {
    if (!plan.requiredFiles.includes(pinName)) appendUnique(issues, `extra-pin:${pinName}`);
  }

  for (const item of plan.pinItems) {
    const evidenceFile = evidenceFiles.get(item.fileName);
    if (!evidenceFile) {
      appendUnique(issues, `unknown-pin-file:${item.fileName}`);
      continue;
    }
    if (item.fileRole !== evidenceFile.fileRole) appendUnique(issues, `pin-file-role-mismatch:${item.fileName}`);
    if (!finiteNonNegativeInteger(item.exactSizeBytes)) appendUnique(issues, `pin-file-size-invalid:${item.fileName}`);
    if (item.exactSizeBytes !== evidenceFile.exactSizeBytes) appendUnique(issues, `pin-file-size-mismatch:${item.fileName}`);
    if (!SUPPORTED_PIN_ALGORITHMS.has(item.algorithm)) appendUnique(issues, `pin-algorithm-unsupported:${item.fileName}`);
    if (!validDigest(item.algorithm, item.expectedDigest)) appendUnique(issues, `pin-digest-invalid:${item.fileName}`);
    if (item.sourceRevision !== selectedScope.observedRevision
      || item.sourceRevision !== integrityEvidence.observedRevision) {
      appendUnique(issues, `pin-source-revision-mismatch:${item.fileName}`);
    }
    if (!item.sourceEvidenceId || !evidenceFile.sourceIds.includes(item.sourceEvidenceId)) {
      appendUnique(issues, `pin-source-evidence-mismatch:${item.fileName}`);
    }
    if (!item.pinnedForSelectedScope) appendUnique(issues, `pin-not-bound-to-selected-scope:${item.fileName}`);
    if (item.verified) appendUnique(issues, `pin-cannot-be-preverified:${item.fileName}`);
  }

  return { valid: issues.length === 0, issues: unique(issues) };
}

export function buildLocalModelArtifactApprovalScope(
  selection: LocalModelHumanArtifactSelectionResult,
  pinPlan: LocalModelArtifactIntegrityPinPlan,
): LocalModelArtifactApprovalScope {
  if (!selection.selectedScope || !selection.selectedOptionId) {
    throw new Error('A recorded artifact selection scope is required to build an approval scope.');
  }
  const scope: LocalModelHumanArtifactSelectionScope = selection.selectedScope;
  return {
    candidateId: scope.candidateId,
    candidateTier: scope.candidateTier,
    modelClass: scope.modelClass,
    exactModelName: scope.exactModelName,
    selectedOptionId: selection.selectedOptionId,
    officialRepositoryId: scope.officialRepositoryId,
    observedRevision: scope.observedRevision,
    artifactFormat: scope.artifactFormat,
    variantKind: scope.variantKind,
    quantizationLabel: scope.quantizationLabel,
    weightShardCount: scope.weightShardCount,
    exactWeightBytes: scope.exactWeightBytes,
    tokenizerProvenanceStatus: scope.tokenizerProvenanceStatus,
    configProvenanceStatus: scope.configProvenanceStatus,
    integrityEvidenceStatus: scope.integrityEvidenceStatus,
    integrityAlgorithmsObserved: canonicalAlgorithms(scope.integrityAlgorithmsObserved),
    governanceDecisionRevision: scope.governanceDecisionPolicyRevision,
    artifactSelectionRevision: scope.artifactSelectionPolicyRevision,
    artifactEvidenceRevision: scope.artifactEvidenceRevision,
    integrityEvidenceRevision: scope.integrityEvidenceRevision,
    pinPlanRevision: pinPlan.pinPlanRevision,
    artifactApprovalPolicyRevision: LOCAL_MODEL_ARTIFACT_APPROVAL_POLICY_REVISION,
    requiredFiles: canonicalStrings(pinPlan.requiredFiles),
    pinItems: canonicalPinItems(pinPlan.pinItems).map(clonePinItem),
  };
}

export function isSameLocalModelArtifactApprovalScope(
  left: LocalModelArtifactApprovalScope | null,
  right: LocalModelArtifactApprovalScope | null,
): boolean {
  if (!left || !right) return left === right;
  return left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.modelClass === right.modelClass
    && left.exactModelName === right.exactModelName
    && left.selectedOptionId === right.selectedOptionId
    && left.officialRepositoryId === right.officialRepositoryId
    && left.observedRevision === right.observedRevision
    && left.artifactFormat === right.artifactFormat
    && left.variantKind === right.variantKind
    && left.quantizationLabel === right.quantizationLabel
    && left.weightShardCount === right.weightShardCount
    && left.exactWeightBytes === right.exactWeightBytes
    && left.tokenizerProvenanceStatus === right.tokenizerProvenanceStatus
    && left.configProvenanceStatus === right.configProvenanceStatus
    && left.integrityEvidenceStatus === right.integrityEvidenceStatus
    && sameAlgorithms(left.integrityAlgorithmsObserved, right.integrityAlgorithmsObserved)
    && left.governanceDecisionRevision === right.governanceDecisionRevision
    && left.artifactSelectionRevision === right.artifactSelectionRevision
    && left.artifactEvidenceRevision === right.artifactEvidenceRevision
    && left.integrityEvidenceRevision === right.integrityEvidenceRevision
    && left.pinPlanRevision === right.pinPlanRevision
    && left.artifactApprovalPolicyRevision === right.artifactApprovalPolicyRevision
    && sameStrings(left.requiredFiles, right.requiredFiles)
    && samePinItems(left.pinItems, right.pinItems);
}

export function createUnrecordedLocalModelArtifactApprovalInput(
  candidateId: string,
): LocalModelArtifactApprovalIntegrityInput {
  const selection = listCurrentLocalModelHumanArtifactSelections().find((item) => item.candidateId === candidateId) ?? null;
  const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId) ?? null;
  return {
    candidateId,
    candidateTier: selection?.candidateTier ?? integrity?.candidateTier ?? 'light',
    selectionResult: selection,
    integrityEvidenceRecord: integrity,
    artifactApprovalDecision: 'not-recorded',
    artifactApprovalDecisionRecorded: false,
    integrityPinningDecision: 'not-recorded',
    integrityPinningDecisionRecorded: false,
    selectedArtifactScope: null,
    integrityPinPlan: null,
    sessionPreviouslyInvalidated: false,
    claimedModelApproved: false,
    claimedLicenseApproved: false,
    claimedChecksumVerified: false,
    claimedDownloadLocationConfigured: false,
    claimedBenchmarkVerified: false,
    claimedDownloadable: false,
    claimedCacheable: false,
    claimedRuntimeReady: false,
    claimedModelActive: false,
  };
}

function scopeIssue(issue: string): boolean {
  return [
    'candidate-id-mismatch',
    'candidate-tier-mismatch',
    'model-class-mismatch',
    'exact-model-name-mismatch',
    'selected-option-id-mismatch',
    'official-repository-id-mismatch',
    'observed-revision-mismatch',
    'artifact-format-mismatch',
    'variant-kind-mismatch',
    'quantization-label-mismatch',
    'weight-shard-count-mismatch',
    'exact-weight-size-mismatch',
    'integrity-algorithms-mismatch',
    'approval-scope-mismatch',
    'approval-session-previously-invalidated',
  ].includes(issue);
}

export function validateLocalModelArtifactApprovalIntegrityInput(
  input: LocalModelArtifactApprovalIntegrityInput,
): LocalModelArtifactApprovalIntegrityValidation {
  const issues: string[] = [];
  const selection = input.selectionResult;
  const integrity = input.integrityEvidenceRecord;
  if (!selection || !integrity) appendUnique(issues, 'unknown-candidate');

  if (selection && integrity) {
    if (selection.candidateId !== input.candidateId || integrity.candidateId !== input.candidateId) appendUnique(issues, 'candidate-id-mismatch');
    if (selection.candidateTier !== input.candidateTier || integrity.candidateTier !== input.candidateTier) appendUnique(issues, 'candidate-tier-mismatch');
    if (selection.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[selection.candidateTier]
      || integrity.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[integrity.candidateTier]
      || selection.modelClass !== integrity.modelClass) appendUnique(issues, 'model-class-mismatch');
    if (selection.exactModelName !== integrity.exactModelName) appendUnique(issues, 'exact-model-name-mismatch');
    if (selection.selectedScope) {
      if (selection.selectedScope.officialRepositoryId !== integrity.officialRepositoryId) appendUnique(issues, 'official-repository-id-mismatch');
      if (selection.selectedScope.observedRevision !== integrity.observedRevision) appendUnique(issues, 'observed-revision-mismatch');
      if (selection.selectedScope.weightShardCount !== integrity.weightShardCount) appendUnique(issues, 'weight-shard-count-mismatch');
      if (selection.selectedScope.exactWeightBytes !== integrity.exactWeightBytes) appendUnique(issues, 'exact-weight-size-mismatch');
      if (!sameAlgorithms(selection.selectedScope.integrityAlgorithmsObserved, integrity.integrityAlgorithmsObserved)) {
        appendUnique(issues, 'integrity-algorithms-mismatch');
      }
    }
  }

  if (!input.artifactApprovalDecisionRecorded && input.artifactApprovalDecision !== 'not-recorded') {
    appendUnique(issues, 'artifact-approval-recorded-flag-mismatch');
  }
  if (input.artifactApprovalDecisionRecorded && input.artifactApprovalDecision === 'not-recorded') {
    appendUnique(issues, 'recorded-artifact-approval-is-not-recorded');
  }
  if (!input.integrityPinningDecisionRecorded && input.integrityPinningDecision !== 'not-recorded') {
    appendUnique(issues, 'integrity-pinning-recorded-flag-mismatch');
  }
  if (input.integrityPinningDecisionRecorded && input.integrityPinningDecision === 'not-recorded') {
    appendUnique(issues, 'recorded-integrity-pinning-is-not-recorded');
  }
  if (input.sessionPreviouslyInvalidated) appendUnique(issues, 'approval-session-previously-invalidated');

  const selectionIsRecorded = selectionRecorded(selection);
  if (!selectionIsRecorded && (input.artifactApprovalDecision === 'approve-for-benchmark-planning'
    || input.integrityPinningDecision === 'approve-pin-plan')) {
    appendUnique(issues, 'approval-attempt-before-artifact-selection');
  }
  if (input.integrityPinningDecision === 'approve-pin-plan' && !input.integrityPinPlan) {
    appendUnique(issues, 'pin-plan-missing-for-approval');
  }
  if (selectionIsRecorded && input.integrityPinPlan && input.selectedArtifactScope && integrity) {
    const expectedScope = buildLocalModelArtifactApprovalScope(selection, input.integrityPinPlan);
    if (!isSameLocalModelArtifactApprovalScope(input.selectedArtifactScope, expectedScope)) {
      appendUnique(issues, 'approval-scope-mismatch');
    }
    for (const issue of validateLocalModelArtifactIntegrityPinPlan(
      input.integrityPinPlan,
      expectedScope,
      integrity,
    ).issues) appendUnique(issues, `pin-plan:${issue}`);
  } else if (input.selectedArtifactScope && (!selectionIsRecorded || !input.integrityPinPlan)) {
    appendUnique(issues, 'unexpected-approval-scope');
  }

  if (selectionIsRecorded && input.integrityPinPlan && !input.selectedArtifactScope) {
    appendUnique(issues, 'approval-scope-missing');
  }
  if (integrityConflict(integrity)) appendUnique(issues, 'integrity-evidence-conflicting');
  if (selectionIsRecorded && !selectionMatchesIntegrity(selection, integrity)) appendUnique(issues, 'selected-artifact-integrity-mismatch');

  if (input.claimedModelApproved) appendUnique(issues, 'model-approved-claim-not-allowed');
  if (input.claimedLicenseApproved) appendUnique(issues, 'license-approved-claim-not-allowed');
  if (input.claimedChecksumVerified) appendUnique(issues, 'checksum-verified-claim-not-allowed');
  if (input.claimedDownloadLocationConfigured) appendUnique(issues, 'download-location-claim-not-allowed');
  if (input.claimedBenchmarkVerified) appendUnique(issues, 'benchmark-verified-claim-not-allowed');
  if (input.claimedDownloadable) appendUnique(issues, 'downloadable-claim-not-allowed');
  if (input.claimedCacheable) appendUnique(issues, 'cacheable-claim-not-allowed');
  if (input.claimedRuntimeReady) appendUnique(issues, 'runtime-ready-claim-not-allowed');
  if (input.claimedModelActive) appendUnique(issues, 'model-active-claim-not-allowed');

  return { valid: issues.length === 0, issues: unique(issues) };
}

export function validateLocalModelArtifactApprovalIntegrityInputs(
  inputs: readonly LocalModelArtifactApprovalIntegrityInput[],
): LocalModelArtifactApprovalIntegrityValidation {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    if (seen.has(input.candidateId)) appendUnique(issues, `duplicate-candidate-approval-session:${input.candidateId}`);
    seen.add(input.candidateId);
    for (const issue of validateLocalModelArtifactApprovalIntegrityInput(input).issues) {
      appendUnique(issues, `${input.candidateId}:${issue}`);
    }
  }
  return { valid: issues.length === 0, issues: unique(issues) };
}

export function evaluateLocalModelArtifactApprovalIntegrity(
  input: LocalModelArtifactApprovalIntegrityInput,
): LocalModelArtifactApprovalIntegrityResult {
  const validation = validateLocalModelArtifactApprovalIntegrityInput(input);
  const selection = input.selectionResult;
  const integrity = input.integrityEvidenceRecord;
  const artifactSelectionRecorded = selectionRecorded(selection);
  const planValidation = artifactSelectionRecorded && input.integrityPinPlan && input.selectedArtifactScope && integrity
    ? validateLocalModelArtifactIntegrityPinPlan(input.integrityPinPlan, input.selectedArtifactScope, integrity)
    : { valid: false, issues: [] as readonly string[] };
  const integrityPinPlanComplete = Boolean(input.integrityPinPlan && input.selectedArtifactScope && planValidation.valid);
  const scopeIssues = validation.issues.filter(scopeIssue);
  const nonScopeIssues = validation.issues.filter((issue) => !scopeIssue(issue) && issue !== 'unknown-candidate');
  const anyDecisionRecorded = input.artifactApprovalDecisionRecorded || input.integrityPinningDecisionRecorded;

  let status: LocalModelArtifactApprovalIntegrityResult['status'];
  if (!selection || !integrity) status = 'unavailable';
  else if (integrityConflict(integrity)) status = 'attention-required';
  else if (scopeIssues.length > 0) status = 'invalidated';
  else if (nonScopeIssues.length > 0) status = 'attention-required';
  else if (!artifactSelectionRecorded || !integrityPinPlanComplete) status = 'unavailable';
  else if (input.artifactApprovalDecision === 'reject' || input.integrityPinningDecision === 'reject') status = 'rejected';
  else if (input.artifactApprovalDecision === 'request-more-evidence'
    || input.integrityPinningDecision === 'request-more-evidence') status = 'more-evidence-requested';
  else if (input.artifactApprovalDecisionRecorded !== input.integrityPinningDecisionRecorded) status = 'partially-recorded';
  else if (input.artifactApprovalDecisionRecorded
    && input.integrityPinningDecisionRecorded
    && input.artifactApprovalDecision === 'approve-for-benchmark-planning'
    && input.integrityPinningDecision === 'approve-pin-plan') status = 'artifact-approval-complete';
  else if (anyDecisionRecorded) status = 'partially-recorded';
  else status = 'awaiting-human-approval';

  const artifactApprovalComplete = status === 'artifact-approval-complete';
  const approvalValidForCurrentScope = artifactSelectionRecorded
    && integrityPinPlanComplete
    && scopeIssues.length === 0
    && !integrityConflict(integrity);
  const blockers = [...validation.issues];
  if (!artifactSelectionRecorded) appendUnique(blockers, 'artifact-selection-not-recorded');
  if (!input.integrityPinPlan) appendUnique(blockers, 'integrity-pin-plan-not-provided');
  else if (!integrityPinPlanComplete) appendUnique(blockers, 'integrity-pin-plan-invalid');
  if (status === 'awaiting-human-approval') appendUnique(blockers, 'human-artifact-and-pinning-approvals-not-recorded');
  if (status === 'partially-recorded') appendUnique(blockers, 'human-approval-session-partially-recorded');
  if (status === 'more-evidence-requested') appendUnique(blockers, 'human-requested-more-approval-evidence');
  if (status === 'rejected') appendUnique(blockers, 'human-artifact-or-pinning-approval-rejected');

  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    modelClass: selection?.modelClass ?? integrity?.modelClass ?? '',
    exactModelName: selection?.exactModelName ?? integrity?.exactModelName ?? '',
    status,
    artifactApprovalDecision: input.artifactApprovalDecision,
    integrityPinningDecision: input.integrityPinningDecision,
    selectedArtifactScope: input.selectedArtifactScope ? cloneApprovalScope(input.selectedArtifactScope) : null,
    integrityPinPlan: input.integrityPinPlan ? clonePinPlan(input.integrityPinPlan) : null,
    blockers: unique(blockers),
    warnings: [
      'This boundary records artifact and integrity-pin approvals for benchmark planning only; it does not approve a model or license, verify a checksum, publish a manifest, authorize a download, pass a benchmark, initialize a runtime, or activate a model.',
    ],
    canRecordApproval: status === 'awaiting-human-approval' || status === 'partially-recorded',
    artifactSelectionRecorded,
    integrityPinPlanComplete,
    approvalValidForCurrentScope,
    humanArtifactApprovalRecorded: input.artifactApprovalDecisionRecorded,
    humanIntegrityPinningDecisionRecorded: input.integrityPinningDecisionRecorded,
    artifactApprovalComplete,
    canProceedToBenchmarkPlanning: artifactApprovalComplete,
    artifactApprovalBoundaryOnly: true,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: artifactSelectionRecorded,
    artifactApproved: artifactApprovalComplete,
    checksumPinned: artifactApprovalComplete,
    checksumVerified: false,
    downloadLocationConfigured: false,
    benchmarkVerified: false,
    downloadable: false,
    cacheable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export function buildCurrentLocalModelArtifactApprovalIntegrityResults(): readonly LocalModelArtifactApprovalIntegrityResult[] {
  return listCurrentLocalModelHumanArtifactSelections().map((selection) => (
    evaluateLocalModelArtifactApprovalIntegrity(createUnrecordedLocalModelArtifactApprovalInput(selection.candidateId))
  ));
}

export function listCurrentLocalModelArtifactApprovalIntegrityResults(): readonly LocalModelArtifactApprovalIntegrityResult[] {
  return buildCurrentLocalModelArtifactApprovalIntegrityResults().map((result) => ({
    ...result,
    selectedArtifactScope: result.selectedArtifactScope ? cloneApprovalScope(result.selectedArtifactScope) : null,
    integrityPinPlan: result.integrityPinPlan ? clonePinPlan(result.integrityPinPlan) : null,
    blockers: [...result.blockers],
    warnings: [...result.warnings],
  }));
}
