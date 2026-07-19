import {
  listLocalModelArtifactEvidence,
} from './localModelArtifactEvidenceRegistry.ts';
import type {
  LocalModelArtifactEvidenceRecord,
} from './localModelArtifactEvidenceTypes.ts';
import {
  listLocalModelArtifactIntegrityEvidence,
} from './localModelArtifactIntegrityEvidenceRegistry.ts';
import type {
  LocalModelArtifactIntegrityAlgorithmKind,
  LocalModelArtifactIntegrityCandidateRecord,
} from './localModelArtifactIntegrityEvidenceTypes.ts';
import {
  LOCAL_MODEL_ARTIFACT_EVIDENCE_SCOPE_REVISION,
} from './localModelArtifactSelectionTypes.ts';
import {
  listCurrentLocalModelHumanGovernanceDecisions,
} from './localModelHumanGovernanceDecisionPolicy.ts';
import type {
  LocalModelHumanGovernanceDecisionResult,
} from './localModelHumanGovernanceDecisionTypes.ts';
import {
  LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REVISION,
  LOCAL_MODEL_HUMAN_ARTIFACT_SELECTION_POLICY_REVISION,
} from './localModelHumanArtifactSelectionTypes.ts';
import type {
  LocalModelHumanArtifactSelectionInput,
  LocalModelHumanArtifactSelectionInputValidation,
  LocalModelHumanArtifactSelectionResult,
  LocalModelHumanArtifactSelectionScope,
  LocalModelSelectableArtifactOption,
} from './localModelHumanArtifactSelectionTypes.ts';

export { LOCAL_MODEL_HUMAN_ARTIFACT_SELECTION_POLICY_REVISION };

const EXPECTED_MODEL_CLASS_BY_TIER = {
  light: '0.6B',
  standard: '1.7B',
  pro: '4B',
} as const;

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function finitePositive(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

function canonicalAlgorithms(
  values: readonly LocalModelArtifactIntegrityAlgorithmKind[],
): readonly LocalModelArtifactIntegrityAlgorithmKind[] {
  return [...new Set(values)].sort();
}

function sameAlgorithms(
  left: readonly LocalModelArtifactIntegrityAlgorithmKind[],
  right: readonly LocalModelArtifactIntegrityAlgorithmKind[],
): boolean {
  const a = canonicalAlgorithms(left);
  const b = canonicalAlgorithms(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function artifactEvidenceConflict(record: LocalModelArtifactEvidenceRecord | null): boolean {
  return Boolean(record && (
    record.evidenceStatus === 'conflicting-evidence'
    || record.conflicts.length > 0
    || record.officialRepositoryConfirmed === 'conflicting'
    || record.immutableRevisionAvailable === 'conflicting'
  ));
}

function integrityEvidenceConflict(record: LocalModelArtifactIntegrityCandidateRecord | null): boolean {
  return Boolean(record && (
    record.evidenceStatus === 'conflicting-evidence'
    || record.conflicts.length > 0
    || record.immutableRevisionConfirmed === 'conflicting'
    || record.fileInventoryStatus === 'conflicting'
    || record.shardInventoryStatus === 'conflicting'
  ));
}

function artifactEvidenceSufficient(record: LocalModelArtifactEvidenceRecord | null): boolean {
  if (!record || artifactEvidenceConflict(record)) return false;
  return record.officialRepositoryConfirmed === 'confirmed'
    && record.immutableRevisionAvailable === 'confirmed'
    && Boolean(record.observedRevision)
    && record.artifactFormat !== 'unknown'
    && record.officialBaseVariantConfirmed === 'confirmed'
    && record.weightFilesPresent === 'confirmed'
    && Number.isInteger(record.weightShardCount)
    && (record.weightShardCount ?? 0) > 0
    && record.configPresent === 'confirmed'
    && record.tokenizerFilesPresent === 'confirmed'
    && record.tokenizerConfigPresent === 'confirmed';
}

function integrityEvidenceSufficient(record: LocalModelArtifactIntegrityCandidateRecord | null): boolean {
  if (!record || integrityEvidenceConflict(record)) return false;
  return record.immutableRevisionConfirmed === 'confirmed'
    && record.fileInventoryStatus === 'confirmed'
    && record.shardInventoryStatus === 'confirmed'
    && Number.isInteger(record.weightShardCount)
    && record.weightShardCount > 0
    && record.requiredWeightFiles.length === record.weightShardCount
    && record.requiredWeightFiles.every((file) => (
      file.exactSizeStatus === 'confirmed'
      && finitePositive(file.exactSizeBytes)
      && file.integrityMetadataStatus === 'confirmed'
      && file.integrityValueAvailable
    ))
    && finitePositive(record.exactWeightBytes)
    && finitePositive(record.exactWeightMiB)
    && record.integrityAlgorithmsObserved.length > 0;
}

function recordsShareArtifactIdentity(
  artifact: LocalModelArtifactEvidenceRecord | null,
  integrity: LocalModelArtifactIntegrityCandidateRecord | null,
): boolean {
  return Boolean(artifact && integrity
    && artifact.candidateId === integrity.candidateId
    && artifact.candidateTier === integrity.candidateTier
    && artifact.modelClass === integrity.modelClass
    && artifact.exactModelName === integrity.exactModelName
    && artifact.officialRepositoryId === integrity.officialRepositoryId
    && artifact.observedRevision === integrity.observedRevision
    && artifact.weightShardCount === integrity.weightShardCount);
}

function optionId(
  candidateId: string,
  artifactFormat: string,
  observedRevision: string,
): string {
  return `${candidateId}:official-base:${artifactFormat}:${observedRevision}:artifact-r${LOCAL_MODEL_ARTIFACT_EVIDENCE_SCOPE_REVISION}:integrity-r${LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REVISION}`;
}

function buildOptionsFromRecords(
  artifact: LocalModelArtifactEvidenceRecord | null,
  integrity: LocalModelArtifactIntegrityCandidateRecord | null,
): readonly LocalModelSelectableArtifactOption[] {
  if (!artifactEvidenceSufficient(artifact)
    || !integrityEvidenceSufficient(integrity)
    || !recordsShareArtifactIdentity(artifact, integrity)
    || !artifact
    || !integrity
    || !artifact.observedRevision
    || artifact.artifactFormat === 'unknown'
    || artifact.weightShardCount === null
    || integrity.exactWeightBytes === null
    || integrity.exactWeightMiB === null) {
    return [];
  }

  return [{
    optionId: optionId(artifact.candidateId, artifact.artifactFormat, artifact.observedRevision),
    candidateId: artifact.candidateId,
    candidateTier: artifact.candidateTier,
    modelClass: artifact.modelClass,
    exactModelName: artifact.exactModelName,
    officialRepositoryId: artifact.officialRepositoryId,
    observedRevision: artifact.observedRevision,
    artifactFormat: artifact.artifactFormat,
    variantKind: 'official-base',
    quantizationLabel: null,
    weightShardCount: artifact.weightShardCount,
    exactWeightBytes: integrity.exactWeightBytes,
    exactWeightMiB: integrity.exactWeightMiB,
    tokenizerProvenanceStatus: artifact.tokenizerFilesPresent,
    configProvenanceStatus: artifact.configPresent,
    integrityEvidenceStatus: integrity.evidenceStatus,
    integrityAlgorithmsObserved: canonicalAlgorithms(integrity.integrityAlgorithmsObserved),
    artifactEvidenceRevision: LOCAL_MODEL_ARTIFACT_EVIDENCE_SCOPE_REVISION,
    integrityEvidenceRevision: LOCAL_MODEL_ARTIFACT_INTEGRITY_EVIDENCE_REVISION,
  }];
}

export function buildSelectableLocalModelArtifactOptions(
  candidateId: string,
): readonly LocalModelSelectableArtifactOption[] {
  const artifact = listLocalModelArtifactEvidence().find((item) => item.candidateId === candidateId) ?? null;
  const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId) ?? null;
  return buildOptionsFromRecords(artifact, integrity).map((option) => ({
    ...option,
    integrityAlgorithmsObserved: [...option.integrityAlgorithmsObserved],
  }));
}

export function buildLocalModelHumanArtifactSelectionScope(
  governance: LocalModelHumanGovernanceDecisionResult,
  option: LocalModelSelectableArtifactOption,
): LocalModelHumanArtifactSelectionScope {
  return {
    candidateId: option.candidateId,
    candidateTier: option.candidateTier,
    modelClass: option.modelClass,
    exactModelName: option.exactModelName,
    officialRepositoryId: option.officialRepositoryId,
    observedRevision: option.observedRevision,
    artifactFormat: option.artifactFormat,
    variantKind: option.variantKind,
    quantizationLabel: option.quantizationLabel,
    weightShardCount: option.weightShardCount,
    exactWeightBytes: option.exactWeightBytes,
    tokenizerProvenanceStatus: option.tokenizerProvenanceStatus,
    configProvenanceStatus: option.configProvenanceStatus,
    integrityEvidenceStatus: option.integrityEvidenceStatus,
    integrityAlgorithmsObserved: canonicalAlgorithms(option.integrityAlgorithmsObserved),
    governanceDecisionScopeRevision: governance.scope.evidenceClosureRevision,
    governanceDecisionPolicyRevision: governance.scope.governanceDecisionPolicyRevision,
    artifactEvidenceRevision: option.artifactEvidenceRevision,
    integrityEvidenceRevision: option.integrityEvidenceRevision,
    artifactSelectionPolicyRevision: LOCAL_MODEL_HUMAN_ARTIFACT_SELECTION_POLICY_REVISION,
  };
}

export function isSameLocalModelHumanArtifactSelectionScope(
  left: LocalModelHumanArtifactSelectionScope | null,
  right: LocalModelHumanArtifactSelectionScope | null,
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
    && left.exactWeightBytes === right.exactWeightBytes
    && left.tokenizerProvenanceStatus === right.tokenizerProvenanceStatus
    && left.configProvenanceStatus === right.configProvenanceStatus
    && left.integrityEvidenceStatus === right.integrityEvidenceStatus
    && sameAlgorithms(left.integrityAlgorithmsObserved, right.integrityAlgorithmsObserved)
    && left.governanceDecisionScopeRevision === right.governanceDecisionScopeRevision
    && left.governanceDecisionPolicyRevision === right.governanceDecisionPolicyRevision
    && left.artifactEvidenceRevision === right.artifactEvidenceRevision
    && left.integrityEvidenceRevision === right.integrityEvidenceRevision
    && left.artifactSelectionPolicyRevision === right.artifactSelectionPolicyRevision;
}

export function createUnrecordedLocalModelHumanArtifactSelectionInput(
  candidateId: string,
): LocalModelHumanArtifactSelectionInput {
  const governance = listCurrentLocalModelHumanGovernanceDecisions().find((item) => item.candidateId === candidateId) ?? null;
  const artifact = listLocalModelArtifactEvidence().find((item) => item.candidateId === candidateId) ?? null;
  const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId) ?? null;
  return {
    candidateId,
    candidateTier: governance?.candidateTier ?? artifact?.candidateTier ?? integrity?.candidateTier ?? 'light',
    governanceDecisionResult: governance,
    artifactEvidenceRecord: artifact,
    integrityEvidenceRecord: integrity,
    decision: 'not-recorded',
    decisionRecorded: false,
    selectedOptionId: null,
    selectedScope: null,
    sessionPreviouslyInvalidated: false,
    claimedModelApproved: false,
    claimedLicenseApproved: false,
    claimedArtifactSelected: false,
    claimedArtifactApproved: false,
    claimedChecksumPinned: false,
    claimedChecksumVerified: false,
    claimedDownloadLocationConfigured: false,
    claimedBenchmarkVerified: false,
    claimedDownloadable: false,
    claimedCacheable: false,
    claimedRuntimeReady: false,
    claimedModelActive: false,
  };
}

function identityIssues(input: LocalModelHumanArtifactSelectionInput): readonly string[] {
  const issues: string[] = [];
  const governance = input.governanceDecisionResult;
  const artifact = input.artifactEvidenceRecord;
  const integrity = input.integrityEvidenceRecord;
  if (!governance || !artifact || !integrity) return issues;

  const records = [governance, artifact, integrity];
  if (records.some((item) => item.candidateId !== input.candidateId)) appendUnique(issues, 'candidate-id-mismatch');
  if (records.some((item) => item.candidateTier !== input.candidateTier)) appendUnique(issues, 'candidate-tier-mismatch');
  if (artifact.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[artifact.candidateTier]
    || integrity.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[integrity.candidateTier]
    || governance.scope.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[governance.candidateTier]) {
    appendUnique(issues, 'model-class-mismatch');
  }
  if (governance.scope.modelClass !== artifact.modelClass || artifact.modelClass !== integrity.modelClass) {
    appendUnique(issues, 'model-class-mismatch');
  }
  if (governance.scope.exactModelName !== artifact.exactModelName || artifact.exactModelName !== integrity.exactModelName) {
    appendUnique(issues, 'exact-model-name-mismatch');
  }
  if (governance.scope.officialRepositoryId !== artifact.officialRepositoryId
    || artifact.officialRepositoryId !== integrity.officialRepositoryId) {
    appendUnique(issues, 'official-repository-id-mismatch');
  }
  if (governance.scope.observedRevision !== artifact.observedRevision
    || artifact.observedRevision !== integrity.observedRevision) {
    appendUnique(issues, 'observed-revision-mismatch');
  }
  return issues;
}

function selectionAttempted(input: LocalModelHumanArtifactSelectionInput): boolean {
  return input.decision === 'select' || input.selectedOptionId !== null || input.selectedScope !== null;
}

function scopeIssue(issue: string): boolean {
  return [
    'candidate-id-mismatch',
    'candidate-tier-mismatch',
    'model-class-mismatch',
    'exact-model-name-mismatch',
    'official-repository-id-mismatch',
    'observed-revision-mismatch',
    'selected-scope-invalid-for-option',
    'selection-session-previously-invalidated',
  ].includes(issue);
}

export function validateLocalModelHumanArtifactSelectionInput(
  input: LocalModelHumanArtifactSelectionInput,
): LocalModelHumanArtifactSelectionInputValidation {
  const issues: string[] = [];
  const governance = input.governanceDecisionResult;
  const artifact = input.artifactEvidenceRecord;
  const integrity = input.integrityEvidenceRecord;

  if (!governance || !artifact || !integrity) appendUnique(issues, 'unknown-candidate');
  for (const issue of identityIssues(input)) appendUnique(issues, issue);

  if (!input.decisionRecorded && input.decision !== 'not-recorded') appendUnique(issues, 'decision-recorded-flag-mismatch');
  if (input.decisionRecorded && input.decision === 'not-recorded') appendUnique(issues, 'recorded-decision-is-not-recorded');
  if (input.decision === 'select' && input.selectedOptionId === null) appendUnique(issues, 'selected-option-id-missing');
  if (input.decision === 'select' && input.selectedScope === null) appendUnique(issues, 'selected-scope-missing');
  if (input.decision !== 'select' && input.selectedOptionId !== null) appendUnique(issues, 'unexpected-selected-option-id');
  if (input.decision !== 'select' && input.selectedScope !== null) appendUnique(issues, 'unexpected-selected-scope');
  if (input.sessionPreviouslyInvalidated) appendUnique(issues, 'selection-session-previously-invalidated');

  const governanceComplete = Boolean(governance
    && governance.status === 'governance-decisions-complete'
    && governance.canProceedToArtifactSelectionReview);
  const artifactSufficient = artifactEvidenceSufficient(artifact);
  const integritySufficient = integrityEvidenceSufficient(integrity);
  const conflict = artifactEvidenceConflict(artifact) || integrityEvidenceConflict(integrity);

  if (!governanceComplete && selectionAttempted(input)) appendUnique(issues, 'selection-attempt-before-governance-complete');
  if ((!artifactSufficient || !integritySufficient) && input.decision === 'select') {
    appendUnique(issues, 'selection-attempt-with-insufficient-evidence');
  }
  if (conflict && selectionAttempted(input)) appendUnique(issues, 'selection-attempt-with-conflicting-evidence');

  const options = buildOptionsFromRecords(artifact, integrity);
  const optionIds = options.map((option) => option.optionId);
  if (new Set(optionIds).size !== optionIds.length) appendUnique(issues, 'duplicate-option-id');
  if (input.selectedOptionId !== null && !optionIds.includes(input.selectedOptionId)) {
    appendUnique(issues, 'unknown-selected-option-id');
  }
  if (input.selectedOptionId && input.selectedScope && governance) {
    const option = options.find((item) => item.optionId === input.selectedOptionId);
    if (option) {
      const expectedScope = buildLocalModelHumanArtifactSelectionScope(governance, option);
      if (!isSameLocalModelHumanArtifactSelectionScope(input.selectedScope, expectedScope)) {
        appendUnique(issues, 'selected-scope-invalid-for-option');
      }
    }
  }

  if (input.claimedModelApproved) appendUnique(issues, 'model-approved-claim-not-allowed');
  if (input.claimedLicenseApproved) appendUnique(issues, 'license-approved-claim-not-allowed');
  if (input.claimedArtifactSelected) appendUnique(issues, 'artifact-selected-claim-not-allowed');
  if (input.claimedArtifactApproved) appendUnique(issues, 'artifact-approved-claim-not-allowed');
  if (input.claimedChecksumPinned) appendUnique(issues, 'checksum-pinned-claim-not-allowed');
  if (input.claimedChecksumVerified) appendUnique(issues, 'checksum-verified-claim-not-allowed');
  if (input.claimedDownloadLocationConfigured) appendUnique(issues, 'download-location-claim-not-allowed');
  if (input.claimedBenchmarkVerified) appendUnique(issues, 'benchmark-verified-claim-not-allowed');
  if (input.claimedDownloadable) appendUnique(issues, 'downloadable-claim-not-allowed');
  if (input.claimedCacheable) appendUnique(issues, 'cacheable-claim-not-allowed');
  if (input.claimedRuntimeReady) appendUnique(issues, 'runtime-ready-claim-not-allowed');
  if (input.claimedModelActive) appendUnique(issues, 'model-active-claim-not-allowed');

  return { valid: issues.length === 0, issues: unique(issues) };
}

export function validateLocalModelHumanArtifactSelectionInputs(
  inputs: readonly LocalModelHumanArtifactSelectionInput[],
): LocalModelHumanArtifactSelectionInputValidation {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    if (seen.has(input.candidateId)) appendUnique(issues, `duplicate-candidate-selection-session:${input.candidateId}`);
    seen.add(input.candidateId);
    for (const issue of validateLocalModelHumanArtifactSelectionInput(input).issues) {
      appendUnique(issues, `${input.candidateId}:${issue}`);
    }
  }
  return { valid: issues.length === 0, issues: unique(issues) };
}

export function evaluateLocalModelHumanArtifactSelection(
  input: LocalModelHumanArtifactSelectionInput,
): LocalModelHumanArtifactSelectionResult {
  const validation = validateLocalModelHumanArtifactSelectionInput(input);
  const governance = input.governanceDecisionResult;
  const artifact = input.artifactEvidenceRecord;
  const integrity = input.integrityEvidenceRecord;
  const governanceDecisionsComplete = Boolean(governance
    && governance.status === 'governance-decisions-complete'
    && governance.canProceedToArtifactSelectionReview);
  const artifactSufficient = artifactEvidenceSufficient(artifact);
  const integritySufficient = integrityEvidenceSufficient(integrity);
  const conflict = artifactEvidenceConflict(artifact) || integrityEvidenceConflict(integrity);
  const allOptions = buildOptionsFromRecords(artifact, integrity);
  const scopeIssues = validation.issues.filter(scopeIssue);
  const nonScopeIssues = validation.issues.filter((issue) => !scopeIssue(issue) && issue !== 'unknown-candidate');

  let status: LocalModelHumanArtifactSelectionResult['status'];
  if (!governance || !artifact || !integrity) status = 'unavailable';
  else if (conflict) status = 'attention-required';
  else if (scopeIssues.length > 0) status = 'invalidated';
  else if (nonScopeIssues.length > 0) status = 'attention-required';
  else if (!governanceDecisionsComplete || !artifactEvidenceSufficient || !integrityEvidenceSufficient || allOptions.length === 0) {
    status = 'unavailable';
  } else if (input.decisionRecorded && input.decision === 'request-more-evidence') {
    status = 'more-evidence-requested';
  } else if (input.decisionRecorded && input.decision === 'reject') {
    status = 'rejected';
  } else if (input.decisionRecorded && input.decision === 'select') {
    status = 'selection-recorded';
  } else {
    status = 'awaiting-human-selection';
  }

  const effectiveOptions = governanceDecisionsComplete
    && artifactSufficient
    && integritySufficient
    && !conflict
    ? allOptions
    : [];
  const artifactSelected = status === 'selection-recorded';
  const selectedScope = artifactSelected && input.selectedScope
    ? { ...input.selectedScope, integrityAlgorithmsObserved: [...input.selectedScope.integrityAlgorithmsObserved] }
    : null;
  const blockers = [...validation.issues];
  if (!governanceDecisionsComplete) appendUnique(blockers, 'governance-decisions-not-complete');
  if (!artifactSufficient) appendUnique(blockers, 'artifact-evidence-insufficient-for-selection');
  if (!integritySufficient) appendUnique(blockers, 'integrity-evidence-insufficient-for-selection');
  if (conflict) appendUnique(blockers, 'artifact-evidence-conflicting');
  if (status === 'awaiting-human-selection') appendUnique(blockers, 'human-artifact-selection-not-recorded');
  if (status === 'more-evidence-requested') appendUnique(blockers, 'human-requested-more-artifact-evidence');
  if (status === 'rejected') appendUnique(blockers, 'human-artifact-selection-rejected');

  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    modelClass: artifact?.modelClass ?? governance?.scope.modelClass ?? '',
    exactModelName: artifact?.exactModelName ?? governance?.scope.exactModelName ?? '',
    status,
    decision: input.decision,
    availableOptions: effectiveOptions.map((option) => ({
      ...option,
      integrityAlgorithmsObserved: [...option.integrityAlgorithmsObserved],
    })),
    selectedOptionId: artifactSelected ? input.selectedOptionId : null,
    selectedScope,
    blockers: unique(blockers),
    warnings: [
      'This boundary records an explicit artifact scope only; selection does not approve an artifact, pin or verify a checksum, authorize a download, pass a benchmark, initialize a runtime, or activate a model.',
    ],
    canRecordSelection: status === 'awaiting-human-selection',
    governanceDecisionsComplete,
    artifactEvidenceSufficient: artifactSufficient,
    integrityEvidenceSufficient: integritySufficient,
    selectionValidForCurrentScope: artifactSelected,
    humanSelectionRecorded: input.decisionRecorded,
    canProceedToArtifactApprovalReview: artifactSelected,
    artifactSelectionBoundaryOnly: true,
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

export function buildCurrentLocalModelHumanArtifactSelections(): readonly LocalModelHumanArtifactSelectionResult[] {
  return listCurrentLocalModelHumanGovernanceDecisions().map((governance) => {
    const input = createUnrecordedLocalModelHumanArtifactSelectionInput(governance.candidateId);
    return evaluateLocalModelHumanArtifactSelection(input);
  });
}

export function listCurrentLocalModelHumanArtifactSelections(): readonly LocalModelHumanArtifactSelectionResult[] {
  return buildCurrentLocalModelHumanArtifactSelections();
}
