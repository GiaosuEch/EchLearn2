import {
  listLocalModelGovernanceEvidenceClosures,
} from './localModelGovernanceEvidenceClosureRegistry.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureStatus,
} from './localModelGovernanceEvidenceClosureTypes.ts';
import type {
  LocalModelHumanGovernanceDecisionInput,
  LocalModelHumanGovernanceDecisionInputValidation,
  LocalModelHumanGovernanceDecisionItem,
  LocalModelHumanGovernanceDecisionResult,
  LocalModelHumanGovernanceDecisionScope,
} from './localModelHumanGovernanceDecisionTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION = 1;
export const LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION = 1;

const REQUIREMENT_IDS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

const EXPECTED_MODEL_CLASS_BY_TIER = {
  light: '0.6B',
  standard: '1.7B',
  pro: '4B',
} as const;

const DECISION_AVAILABLE_STATUSES: readonly LocalModelGovernanceEvidenceClosureStatus[] = [
  'factual-evidence-collected',
  'sufficient-for-human-decision',
  'no-separate-policy-located',
] as const;

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function requirementStatus(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord,
  requirementId: LocalModelGovernanceEvidenceClosureRequirementId,
): LocalModelGovernanceEvidenceClosureStatus {
  return record.requirements.find((item) => item.requirementId === requirementId)?.status ?? 'unresolved';
}

function cloneDecisionItem(
  item: LocalModelHumanGovernanceDecisionItem,
): LocalModelHumanGovernanceDecisionItem {
  return {
    ...item,
    blockers: [...item.blockers],
    warnings: [...item.warnings],
  };
}

export function buildLocalModelHumanGovernanceDecisionScope(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord,
): LocalModelHumanGovernanceDecisionScope {
  return {
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    modelClass: record.modelClass,
    exactModelName: record.exactModelName,
    officialRepositoryId: record.officialRepositoryId,
    observedRevision: record.observedRevision,
    tokenizerLicenseClosureStatus: requirementStatus(record, 'tokenizer-license-scope'),
    acceptableUseClosureStatus: requirementStatus(record, 'acceptable-use-scope'),
    derivedHostingClosureStatus: requirementStatus(record, 'derived-artifact-hosting'),
    quantizationClosureStatus: requirementStatus(record, 'quantization-conversion'),
    evidenceClosureRevision: LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION,
    governanceDecisionPolicyRevision: LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION,
  };
}

export function isSameLocalModelHumanGovernanceDecisionScope(
  left: LocalModelHumanGovernanceDecisionScope,
  right: LocalModelHumanGovernanceDecisionScope,
): boolean {
  return left.candidateId === right.candidateId
    && left.candidateTier === right.candidateTier
    && left.modelClass === right.modelClass
    && left.exactModelName === right.exactModelName
    && left.officialRepositoryId === right.officialRepositoryId
    && left.observedRevision === right.observedRevision
    && left.tokenizerLicenseClosureStatus === right.tokenizerLicenseClosureStatus
    && left.acceptableUseClosureStatus === right.acceptableUseClosureStatus
    && left.derivedHostingClosureStatus === right.derivedHostingClosureStatus
    && left.quantizationClosureStatus === right.quantizationClosureStatus
    && left.evidenceClosureRevision === right.evidenceClosureRevision
    && left.governanceDecisionPolicyRevision === right.governanceDecisionPolicyRevision;
}

export function createUnrecordedLocalModelHumanGovernanceDecisionInput(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord,
): LocalModelHumanGovernanceDecisionInput {
  const decisions = REQUIREMENT_IDS.map((requirementId): LocalModelHumanGovernanceDecisionItem => ({
    requirementId,
    evidenceClosureStatus: requirementStatus(record, requirementId),
    decision: 'not-recorded',
    decisionRecorded: false,
    blockers: [],
    warnings: [],
  }));

  return {
    candidateId: record.candidateId,
    candidateTier: record.candidateTier,
    closureRecord: record,
    scope: buildLocalModelHumanGovernanceDecisionScope(record),
    decisions,
    sessionPreviouslyInvalidated: false,
    claimedModelApproved: false,
    claimedLicenseApproved: false,
    claimedArtifactSelected: false,
    claimedArtifactApproved: false,
    claimedChecksumPinned: false,
    claimedChecksumVerified: false,
    claimedBenchmarkVerified: false,
    claimedDownloadable: false,
    claimedRuntimeReady: false,
    claimedModelActive: false,
  };
}

function isKnownRequirementId(value: string): value is LocalModelGovernanceEvidenceClosureRequirementId {
  return REQUIREMENT_IDS.includes(value as LocalModelGovernanceEvidenceClosureRequirementId);
}

function closureHasConflict(record: LocalModelGovernanceEvidenceClosureCandidateRecord | null): boolean {
  return Boolean(record && (
    record.status === 'conflicting-evidence'
    || record.conflicts.length > 0
    || record.requirements.some((item) => item.status === 'conflicting-evidence' || item.conflicts.length > 0)
  ));
}

function closureHasUnavailableEvidence(record: LocalModelGovernanceEvidenceClosureCandidateRecord | null): boolean {
  if (!record) return true;
  return record.status === 'unresolved'
    || record.status === 'rejected'
    || record.requirements.some((item) => !DECISION_AVAILABLE_STATUSES.includes(item.status));
}

function scopeIssue(issue: string): boolean {
  return issue.includes('scope-mismatch')
    || issue.startsWith('evidence-closure-status-mismatch:')
    || issue === 'candidate-id-mismatch'
    || issue === 'candidate-tier-mismatch'
    || issue === 'model-class-mismatch'
    || issue === 'exact-model-name-mismatch'
    || issue === 'official-repository-id-mismatch'
    || issue === 'observed-revision-mismatch'
    || issue === 'evidence-closure-revision-mismatch'
    || issue === 'governance-decision-policy-revision-mismatch';
}

export function validateLocalModelHumanGovernanceDecisionInput(
  input: LocalModelHumanGovernanceDecisionInput,
): LocalModelHumanGovernanceDecisionInputValidation {
  const issues: string[] = [];
  const record = input.closureRecord;

  if (!record) {
    appendUnique(issues, 'unknown-candidate');
  } else {
    if (input.candidateId !== record.candidateId) appendUnique(issues, 'candidate-id-mismatch');
    if (input.candidateTier !== record.candidateTier) appendUnique(issues, 'candidate-tier-mismatch');
    if (record.modelClass !== EXPECTED_MODEL_CLASS_BY_TIER[record.candidateTier]) {
      appendUnique(issues, 'model-class-mismatch');
    }
    const expectedScope = buildLocalModelHumanGovernanceDecisionScope(record);
    if (!isSameLocalModelHumanGovernanceDecisionScope(input.scope, expectedScope)) {
      appendUnique(issues, 'decision-scope-mismatch');
    }
    if (input.scope.modelClass !== record.modelClass) appendUnique(issues, 'model-class-mismatch');
    if (input.scope.exactModelName !== record.exactModelName) appendUnique(issues, 'exact-model-name-mismatch');
    if (input.scope.officialRepositoryId !== record.officialRepositoryId) {
      appendUnique(issues, 'official-repository-id-mismatch');
    }
    if (input.scope.observedRevision !== record.observedRevision) appendUnique(issues, 'observed-revision-mismatch');
  }

  if (input.scope.evidenceClosureRevision !== LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION) {
    appendUnique(issues, 'evidence-closure-revision-mismatch');
  }
  if (input.scope.governanceDecisionPolicyRevision !== LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION) {
    appendUnique(issues, 'governance-decision-policy-revision-mismatch');
  }

  const decisionIds = input.decisions.map((item) => item.requirementId as string);
  if (input.decisions.length !== REQUIREMENT_IDS.length) appendUnique(issues, 'required-decision-count-mismatch');
  if (new Set(decisionIds).size !== decisionIds.length) appendUnique(issues, 'duplicate-requirement-id');
  for (const requirementId of REQUIREMENT_IDS) {
    if (!decisionIds.includes(requirementId)) appendUnique(issues, `missing-requirement-id:${requirementId}`);
  }
  for (const requirementId of decisionIds) {
    if (!isKnownRequirementId(requirementId)) appendUnique(issues, `unknown-requirement-id:${requirementId}`);
  }

  for (const item of input.decisions) {
    if (!isKnownRequirementId(item.requirementId)) continue;
    if (!item.decisionRecorded && item.decision !== 'not-recorded') {
      appendUnique(issues, `decision-recorded-flag-mismatch:${item.requirementId}`);
    }
    if (item.decisionRecorded && item.decision === 'not-recorded') {
      appendUnique(issues, `recorded-decision-is-not-recorded:${item.requirementId}`);
    }
    if (record) {
      const currentStatus = requirementStatus(record, item.requirementId);
      if (item.evidenceClosureStatus !== currentStatus) {
        appendUnique(issues, `evidence-closure-status-mismatch:${item.requirementId}`);
      }
      if (!DECISION_AVAILABLE_STATUSES.includes(currentStatus) && item.decision === 'proceed') {
        appendUnique(issues, `proceed-with-unavailable-evidence:${item.requirementId}`);
      }
    }
  }

  if (input.claimedModelApproved) appendUnique(issues, 'model-approved-claim-not-allowed');
  if (input.claimedLicenseApproved) appendUnique(issues, 'license-approved-claim-not-allowed');
  if (input.claimedArtifactSelected) appendUnique(issues, 'artifact-selected-claim-not-allowed');
  if (input.claimedArtifactApproved) appendUnique(issues, 'artifact-approved-claim-not-allowed');
  if (input.claimedChecksumPinned) appendUnique(issues, 'checksum-pinned-claim-not-allowed');
  if (input.claimedChecksumVerified) appendUnique(issues, 'checksum-verified-claim-not-allowed');
  if (input.claimedBenchmarkVerified) appendUnique(issues, 'benchmark-verified-claim-not-allowed');
  if (input.claimedDownloadable) appendUnique(issues, 'downloadable-claim-not-allowed');
  if (input.claimedRuntimeReady) appendUnique(issues, 'runtime-ready-claim-not-allowed');
  if (input.claimedModelActive) appendUnique(issues, 'model-active-claim-not-allowed');

  return { valid: issues.length === 0, issues: unique(issues) };
}

export function validateLocalModelHumanGovernanceDecisionInputs(
  inputs: readonly LocalModelHumanGovernanceDecisionInput[],
): LocalModelHumanGovernanceDecisionInputValidation {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    if (seen.has(input.candidateId)) appendUnique(issues, `duplicate-candidate-session:${input.candidateId}`);
    seen.add(input.candidateId);
    for (const issue of validateLocalModelHumanGovernanceDecisionInput(input).issues) {
      appendUnique(issues, `${input.candidateId}:${issue}`);
    }
  }
  return { valid: issues.length === 0, issues: unique(issues) };
}

export function evaluateLocalModelHumanGovernanceDecision(
  input: LocalModelHumanGovernanceDecisionInput,
): LocalModelHumanGovernanceDecisionResult {
  const validation = validateLocalModelHumanGovernanceDecisionInput(input);
  const record = input.closureRecord;
  const currentScope = record ? buildLocalModelHumanGovernanceDecisionScope(record) : null;
  const decisionValidForCurrentScope = Boolean(
    record
    && currentScope
    && !input.sessionPreviouslyInvalidated
    && isSameLocalModelHumanGovernanceDecisionScope(input.scope, currentScope),
  );

  const recordedDecisionItems = input.decisions.filter((item) => item.decisionRecorded).length;
  const proceedDecisionItems = input.decisions.filter((item) => item.decisionRecorded && item.decision === 'proceed').length;
  const rejectedDecisionItems = input.decisions.filter((item) => item.decisionRecorded && item.decision === 'reject').length;
  const moreEvidenceDecisionItems = input.decisions.filter((item) => item.decisionRecorded && item.decision === 'request-more-evidence').length;
  const allRequiredDecisionsRecorded = input.decisions.length === REQUIREMENT_IDS.length
    && new Set(input.decisions.map((item) => item.requirementId)).size === REQUIREMENT_IDS.length
    && REQUIREMENT_IDS.every((requirementId) => input.decisions.some((item) => item.requirementId === requirementId))
    && input.decisions.every((item) => item.decisionRecorded);

  const hasConflict = closureHasConflict(record);
  const hasUnavailableEvidence = closureHasUnavailableEvidence(record);
  const hasScopeIssue = input.sessionPreviouslyInvalidated || validation.issues.some(scopeIssue);
  const nonScopeIssues = validation.issues.filter((issue) => !scopeIssue(issue) && issue !== 'unknown-candidate');

  let status: LocalModelHumanGovernanceDecisionResult['status'];
  if (!record) status = 'unavailable';
  else if (hasConflict) status = 'attention-required';
  else if (hasUnavailableEvidence) status = 'unavailable';
  else if (hasScopeIssue) status = 'invalidated';
  else if (nonScopeIssues.length > 0) status = 'attention-required';
  else if (rejectedDecisionItems > 0) status = 'rejected';
  else if (moreEvidenceDecisionItems > 0) status = 'more-evidence-requested';
  else if (allRequiredDecisionsRecorded && proceedDecisionItems === REQUIREMENT_IDS.length) {
    status = 'governance-decisions-complete';
  } else if (recordedDecisionItems > 0) status = 'partially-recorded';
  else status = 'awaiting-human-decision';

  const blockers: string[] = [...validation.issues];
  if (!record) appendUnique(blockers, 'decision-boundary-unavailable');
  if (hasConflict) appendUnique(blockers, 'governance-evidence-conflicting');
  if (hasUnavailableEvidence && record) appendUnique(blockers, 'governance-evidence-incomplete');
  if (input.sessionPreviouslyInvalidated) appendUnique(blockers, 'decision-session-previously-invalidated');
  if (status === 'awaiting-human-decision') appendUnique(blockers, 'human-governance-decisions-not-recorded');
  if (status === 'partially-recorded') appendUnique(blockers, 'human-governance-decisions-partial');
  if (status === 'more-evidence-requested') appendUnique(blockers, 'human-requested-more-evidence');
  if (status === 'rejected') appendUnique(blockers, 'human-governance-decision-rejected');

  const canProceedToArtifactSelectionReview = status === 'governance-decisions-complete';
  const canRecordDecision = status === 'awaiting-human-decision' || status === 'partially-recorded';

  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    status,
    scope: { ...input.scope },
    decisions: input.decisions.map(cloneDecisionItem),
    blockers: unique(blockers),
    warnings: [
      'This boundary records explicit governance decisions only; proceed does not approve a model, license, artifact, benchmark, download, runtime, or active model.',
    ],
    totalDecisionItems: input.decisions.length,
    recordedDecisionItems,
    proceedDecisionItems,
    rejectedDecisionItems,
    moreEvidenceDecisionItems,
    canRecordDecision,
    allRequiredDecisionsRecorded,
    decisionValidForCurrentScope,
    canProceedToArtifactSelectionReview,
    humanDecisionRecorded: recordedDecisionItems > 0,
    governanceDecisionBoundaryOnly: true,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumPinned: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export function buildCurrentLocalModelHumanGovernanceDecisions(): readonly LocalModelHumanGovernanceDecisionResult[] {
  return listLocalModelGovernanceEvidenceClosures().map((record) => (
    evaluateLocalModelHumanGovernanceDecision(
      createUnrecordedLocalModelHumanGovernanceDecisionInput(record),
    )
  ));
}

export function listCurrentLocalModelHumanGovernanceDecisions(): readonly LocalModelHumanGovernanceDecisionResult[] {
  return buildCurrentLocalModelHumanGovernanceDecisions();
}
