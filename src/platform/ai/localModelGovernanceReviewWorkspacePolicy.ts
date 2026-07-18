import {
  getLocalModelGovernanceEvidenceClosure,
  listLocalModelGovernanceEvidenceClosures,
} from './localModelGovernanceEvidenceClosureRegistry.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
  LocalModelGovernanceEvidenceClosureStatus,
} from './localModelGovernanceEvidenceClosureTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION,
  LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION,
} from './localModelHumanGovernanceDecisionPolicy.ts';
import {
  LOCAL_MODEL_GOVERNANCE_DECISION_RECORD_POLICY_REVISION,
  buildLocalModelGovernanceDecisionRecordScope,
  createEmptyLocalModelGovernanceDecisionRecordInput,
  evaluateLocalModelGovernanceDecisionRecord,
} from './localModelGovernanceDecisionRecordPolicy.ts';
import type {
  LocalModelGovernanceDecisionRecordDraftInput,
  LocalModelGovernanceDecisionRecordDraftItem,
} from './localModelGovernanceDecisionRecordTypes.ts';
import {
  LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION,
  LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE,
  LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  buildCurrentLocalModelTrustedActorContextAdapterResult,
  isSameLocalModelTrustedActorAssertionScope,
} from './localModelTrustedActorContextAdapter.ts';
import type {
  LocalModelTrustedActorAssertionScope,
  LocalModelTrustedActorContextAdapterResult,
} from './localModelTrustedActorContextAdapterTypes.ts';
import type {
  LocalModelGovernanceReviewWorkspaceEvent,
  LocalModelGovernanceReviewWorkspaceInput,
  LocalModelGovernanceReviewWorkspaceRequirementState,
  LocalModelGovernanceReviewWorkspaceResult,
  LocalModelGovernanceReviewWorkspaceScope,
  LocalModelGovernanceReviewWorkspaceValidation,
} from './localModelGovernanceReviewWorkspaceTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_REVIEW_WORKSPACE_POLICY_REVISION = 1;

const REQUIREMENT_IDS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function isKnownRequirementId(value: string): value is LocalModelGovernanceEvidenceClosureRequirementId {
  return REQUIREMENT_IDS.includes(value as LocalModelGovernanceEvidenceClosureRequirementId);
}

function requirementStatus(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord,
  requirementId: LocalModelGovernanceEvidenceClosureRequirementId,
): LocalModelGovernanceEvidenceClosureStatus {
  return record.requirements.find((item) => item.requirementId === requirementId)?.status ?? 'unresolved';
}

function cloneRequirement(
  item: LocalModelGovernanceReviewWorkspaceRequirementState,
): LocalModelGovernanceReviewWorkspaceRequirementState {
  return {
    ...item,
    blockers: [...item.blockers],
    warnings: [...item.warnings],
  };
}

function cloneScope(
  scope: LocalModelGovernanceReviewWorkspaceScope | null,
): LocalModelGovernanceReviewWorkspaceScope | null {
  if (!scope) return null;
  return {
    ...scope,
    actorAssertionScope: {
      ...scope.actorAssertionScope,
      canonicalVerifiedRoleIds: [...scope.actorAssertionScope.canonicalVerifiedRoleIds],
      canonicalVerifiedPermissionIds: [...scope.actorAssertionScope.canonicalVerifiedPermissionIds],
    },
  };
}

function cloneAdapterResult(
  result: LocalModelTrustedActorContextAdapterResult,
): LocalModelTrustedActorContextAdapterResult {
  return {
    ...result,
    mappedTrustedActorContext: result.mappedTrustedActorContext
      ? { ...result.mappedTrustedActorContext }
      : null,
    blockers: [...result.blockers],
    warnings: [...result.warnings],
  };
}

function cloneInput(input: LocalModelGovernanceReviewWorkspaceInput): LocalModelGovernanceReviewWorkspaceInput {
  return {
    ...input,
    adapterResult: cloneAdapterResult(input.adapterResult),
    actorAssertionScope: input.actorAssertionScope
      ? {
        ...input.actorAssertionScope,
        canonicalVerifiedRoleIds: [...input.actorAssertionScope.canonicalVerifiedRoleIds],
        canonicalVerifiedPermissionIds: [...input.actorAssertionScope.canonicalVerifiedPermissionIds],
      }
      : null,
    requirements: input.requirements.map(cloneRequirement),
    currentScope: cloneScope(input.currentScope),
    previousScope: cloneScope(input.previousScope),
    finalizedRecord: input.finalizedRecord
      ? {
        ...input.finalizedRecord,
        scope: { ...input.finalizedRecord.scope },
        decisions: input.finalizedRecord.decisions.map((item) => ({
          ...item,
          blockers: [...item.blockers],
          warnings: [...item.warnings],
        })),
      }
      : null,
  };
}

function emptyRequirements(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord | null,
): readonly LocalModelGovernanceReviewWorkspaceRequirementState[] {
  return REQUIREMENT_IDS.map((requirementId) => ({
    requirementId,
    evidenceClosureStatus: record ? requirementStatus(record, requirementId) : 'unresolved',
    decision: 'not-recorded',
    explicitlyRecorded: false,
    blockers: [],
    warnings: [],
  }));
}

function adapterIsTrusted(result: LocalModelTrustedActorContextAdapterResult): boolean {
  return result.status === 'trusted-context-ready'
    && result.trustedContextReady
    && result.canSupplyActorContextToGovernanceRecord
    && result.canOpenGovernanceDecisionDraft
    && result.mappedTrustedActorContext !== null;
}

function actorScopeCompatibleWithAdapter(
  result: LocalModelTrustedActorContextAdapterResult,
  scope: LocalModelTrustedActorAssertionScope,
): boolean {
  const context = result.mappedTrustedActorContext;
  return adapterIsTrusted(result)
    && context !== null
    && scope.actorSubjectId === context.actorSubjectId
    && scope.authenticationOutcome === 'authenticated'
    && scope.authorizationOutcome === 'granted'
    && scope.authenticationSource === 'external-auth-boundary'
    && scope.assertionRevision === LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION
    && scope.actorContextRevision === context.actorContextRevision
    && scope.adapterPolicyRevision === LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION
    && scope.canonicalVerifiedRoleIds.includes(LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE)
    && scope.canonicalVerifiedPermissionIds.includes(LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION);
}

export function buildLocalModelGovernanceReviewWorkspaceScope(
  candidateId: string,
  adapterResult: LocalModelTrustedActorContextAdapterResult,
  actorAssertionScope: LocalModelTrustedActorAssertionScope | null,
): LocalModelGovernanceReviewWorkspaceScope | null {
  const record = getLocalModelGovernanceEvidenceClosure(candidateId);
  if (!record || !actorAssertionScope || !actorScopeCompatibleWithAdapter(adapterResult, actorAssertionScope)) return null;
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
    governanceDecisionRecordPolicyRevision: LOCAL_MODEL_GOVERNANCE_DECISION_RECORD_POLICY_REVISION,
    externalAuthAssertionRevision: LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION,
    trustedActorContextRevision: actorAssertionScope.actorContextRevision,
    trustedActorAdapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
    workspacePolicyRevision: LOCAL_MODEL_GOVERNANCE_REVIEW_WORKSPACE_POLICY_REVISION,
    actorAssertionScope: {
      ...actorAssertionScope,
      canonicalVerifiedRoleIds: [...actorAssertionScope.canonicalVerifiedRoleIds],
      canonicalVerifiedPermissionIds: [...actorAssertionScope.canonicalVerifiedPermissionIds],
    },
  };
}

export function isSameLocalModelGovernanceReviewWorkspaceScope(
  left: LocalModelGovernanceReviewWorkspaceScope,
  right: LocalModelGovernanceReviewWorkspaceScope,
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
    && left.governanceDecisionPolicyRevision === right.governanceDecisionPolicyRevision
    && left.governanceDecisionRecordPolicyRevision === right.governanceDecisionRecordPolicyRevision
    && left.externalAuthAssertionRevision === right.externalAuthAssertionRevision
    && left.trustedActorContextRevision === right.trustedActorContextRevision
    && left.trustedActorAdapterPolicyRevision === right.trustedActorAdapterPolicyRevision
    && left.workspacePolicyRevision === right.workspacePolicyRevision
    && isSameLocalModelTrustedActorAssertionScope(left.actorAssertionScope, right.actorAssertionScope);
}

export function createLockedLocalModelGovernanceReviewWorkspaceInput(
  candidateId: string,
): LocalModelGovernanceReviewWorkspaceInput {
  const closureRecord = getLocalModelGovernanceEvidenceClosure(candidateId);
  return {
    candidateId,
    candidateTier: closureRecord?.candidateTier ?? 'light',
    closureRecord,
    adapterResult: buildCurrentLocalModelTrustedActorContextAdapterResult(),
    actorAssertionScope: null,
    requirements: emptyRequirements(closureRecord),
    status: 'locked-no-trusted-context',
    reviewStarted: false,
    finalizeRequested: false,
    finalizedRecord: null,
    currentScope: null,
    previousScope: null,
    previouslyInvalidated: false,
    clock: null,
    claimedDraftPersisted: false,
    claimedRecordPersisted: false,
    claimedRecordSigned: false,
    claimedRecordAppliedDownstream: false,
    claimedModelApproved: false,
    claimedLicenseApproved: false,
    claimedArtifactSelected: false,
    claimedArtifactApproved: false,
    claimedChecksumVerified: false,
    claimedBenchmarkVerified: false,
    claimedDownloadable: false,
    claimedRuntimeReady: false,
    claimedModelActive: false,
  };
}

function validateRequirements(input: LocalModelGovernanceReviewWorkspaceInput): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const item of input.requirements) {
    if (!isKnownRequirementId(String(item.requirementId))) {
      appendUnique(issues, 'unknown-governance-requirement');
      continue;
    }
    if (seen.has(item.requirementId)) appendUnique(issues, `duplicate-governance-requirement:${item.requirementId}`);
    seen.add(item.requirementId);
    const expectedStatus = input.closureRecord
      ? requirementStatus(input.closureRecord, item.requirementId)
      : 'unresolved';
    if (item.evidenceClosureStatus !== expectedStatus) {
      appendUnique(issues, `governance-requirement-evidence-mismatch:${item.requirementId}`);
    }
    if (item.decision === 'not-recorded' && item.explicitlyRecorded) {
      appendUnique(issues, `not-recorded-marked-explicit:${item.requirementId}`);
    }
    if (item.decision !== 'not-recorded' && !item.explicitlyRecorded) {
      appendUnique(issues, `decision-not-marked-explicit:${item.requirementId}`);
    }
  }
  for (const requirementId of REQUIREMENT_IDS) {
    if (!seen.has(requirementId)) appendUnique(issues, `missing-governance-requirement:${requirementId}`);
  }
  return issues;
}

function scopeIsInvalid(input: LocalModelGovernanceReviewWorkspaceInput): boolean {
  if (input.previouslyInvalidated) return true;
  if (!input.closureRecord) return true;
  if (input.candidateId !== input.closureRecord.candidateId
    || input.candidateTier !== input.closureRecord.candidateTier) return true;

  const trusted = adapterIsTrusted(input.adapterResult);
  if (!trusted) {
    return input.reviewStarted
      || input.finalizeRequested
      || input.finalizedRecord !== null
      || input.currentScope !== null
      || input.previousScope !== null
      || input.requirements.some((item) => item.explicitlyRecorded);
  }
  if (!input.actorAssertionScope || !input.currentScope) return true;
  const expected = buildLocalModelGovernanceReviewWorkspaceScope(
    input.candidateId,
    input.adapterResult,
    input.actorAssertionScope,
  );
  if (!expected || !isSameLocalModelGovernanceReviewWorkspaceScope(input.currentScope, expected)) return true;
  if (input.previousScope && !isSameLocalModelGovernanceReviewWorkspaceScope(input.previousScope, input.currentScope)) {
    return true;
  }
  return false;
}

export function validateLocalModelGovernanceReviewWorkspaceInput(
  input: LocalModelGovernanceReviewWorkspaceInput,
): LocalModelGovernanceReviewWorkspaceValidation {
  const issues: string[] = [];
  const scopeInvalid = scopeIsInvalid(input);
  if (!input.closureRecord) appendUnique(issues, 'candidate-not-found');
  if (input.previouslyInvalidated) appendUnique(issues, 'workspace-previously-invalidated');
  if (scopeInvalid) appendUnique(issues, 'workspace-scope-mismatch');
  for (const issue of validateRequirements(input)) appendUnique(issues, issue);

  const recordedCount = input.requirements.filter((item) => item.explicitlyRecorded).length;
  if (!input.reviewStarted && recordedCount > 0) appendUnique(issues, 'decisions-recorded-before-review-start');
  if (!input.reviewStarted && input.finalizeRequested) appendUnique(issues, 'finalize-requested-before-review-start');
  if (input.finalizeRequested && input.status !== 'finalize-requested') {
    appendUnique(issues, 'finalize-request-not-explicit');
  }
  if (!input.finalizeRequested && input.status === 'finalize-requested') {
    appendUnique(issues, 'finalize-status-without-request');
  }
  if (input.finalizedRecord !== null) appendUnique(issues, 'workspace-finalized-record-not-authoritative');

  const allExplicit = REQUIREMENT_IDS.every((requirementId) => input.requirements.some((item) => (
    item.requirementId === requirementId
    && item.explicitlyRecorded
    && item.decision !== 'not-recorded'
  )));
  if (input.finalizeRequested && !allExplicit) appendUnique(issues, 'finalize-requested-before-explicit-decisions');
  if (input.finalizeRequested && !input.clock) appendUnique(issues, 'finalize-requested-without-clock');
  if (input.finalizeRequested && !adapterIsTrusted(input.adapterResult)) {
    appendUnique(issues, 'finalize-requested-without-trusted-context');
  }

  const forbiddenClaims: readonly [boolean, string][] = [
    [input.claimedDraftPersisted, 'draft-persistence-claim-not-allowed'],
    [input.claimedRecordPersisted, 'record-persistence-claim-not-allowed'],
    [input.claimedRecordSigned, 'record-signature-claim-not-allowed'],
    [input.claimedRecordAppliedDownstream, 'downstream-application-claim-not-allowed'],
    [input.claimedModelApproved, 'model-approval-claim-not-allowed'],
    [input.claimedLicenseApproved, 'license-approval-claim-not-allowed'],
    [input.claimedArtifactSelected, 'artifact-selection-claim-not-allowed'],
    [input.claimedArtifactApproved, 'artifact-approval-claim-not-allowed'],
    [input.claimedChecksumVerified, 'checksum-verification-claim-not-allowed'],
    [input.claimedBenchmarkVerified, 'benchmark-verification-claim-not-allowed'],
    [input.claimedDownloadable, 'downloadable-claim-not-allowed'],
    [input.claimedRuntimeReady, 'runtime-readiness-claim-not-allowed'],
    [input.claimedModelActive, 'model-active-claim-not-allowed'],
  ];
  for (const [claimed, issue] of forbiddenClaims) if (claimed) appendUnique(issues, issue);

  return { valid: issues.length === 0, issues: unique(issues), scopeInvalid };
}

export function mapWorkspaceDraftToGovernanceDecisionRecordInput(
  input: LocalModelGovernanceReviewWorkspaceInput,
): LocalModelGovernanceDecisionRecordDraftInput {
  const base = createEmptyLocalModelGovernanceDecisionRecordInput(input.candidateId);
  const closureRecord = input.closureRecord;
  const actorContext = input.adapterResult.mappedTrustedActorContext;
  const decisions = input.requirements.map((item): LocalModelGovernanceDecisionRecordDraftItem => ({
    requirementId: item.requirementId,
    evidenceClosureStatus: item.evidenceClosureStatus,
    decision: item.decision,
    explicitlyRecorded: item.explicitlyRecorded,
    blockers: [...item.blockers],
    warnings: [...item.warnings],
  }));
  return {
    ...base,
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    closureRecord,
    actorContext: actorContext ? { ...actorContext } : null,
    decisions,
    currentScope: closureRecord
      ? buildLocalModelGovernanceDecisionRecordScope(closureRecord, base.recordRevision)
      : base.currentScope,
    finalizeRequested: input.finalizeRequested,
    previouslyInvalidated: input.previouslyInvalidated,
    clock: input.clock,
  };
}

export function evaluateLocalModelGovernanceReviewWorkspace(
  input: LocalModelGovernanceReviewWorkspaceInput,
): LocalModelGovernanceReviewWorkspaceResult {
  const validation = validateLocalModelGovernanceReviewWorkspaceInput(input);
  const blockers = [...validation.issues];
  const warnings: string[] = [];
  const trustedContextReady = adapterIsTrusted(input.adapterResult);
  const recordedDecisionCount = input.requirements.filter((item) => item.explicitlyRecorded).length;
  const allDecisionsExplicit = input.requirements.length === REQUIREMENT_IDS.length
    && REQUIREMENT_IDS.every((requirementId) => input.requirements.some((item) => (
      item.requirementId === requirementId
      && item.explicitlyRecorded
      && item.decision !== 'not-recorded'
    )));

  let status: LocalModelGovernanceReviewWorkspaceResult['status'];
  let finalizedRecord = null as LocalModelGovernanceReviewWorkspaceResult['finalizedRecord'];

  if (validation.scopeInvalid) {
    status = 'invalidated';
  } else if (!validation.valid) {
    status = 'attention-required';
  } else if (!trustedContextReady) {
    status = 'locked-no-trusted-context';
    appendUnique(warnings, 'trusted-context-ready-required');
  } else if (!input.reviewStarted) {
    status = 'ready-for-review';
  } else if (!allDecisionsExplicit) {
    status = 'draft-in-progress';
  } else if (!input.finalizeRequested) {
    status = 'ready-to-finalize';
    appendUnique(warnings, 'explicit-finalize-request-required');
  } else {
    const recordResult = evaluateLocalModelGovernanceDecisionRecord(
      mapWorkspaceDraftToGovernanceDecisionRecordInput(input),
    );
    finalizedRecord = recordResult.canonicalRecord;
    if (recordResult.status === 'finalized-proceed') status = 'finalized-proceed';
    else if (recordResult.status === 'finalized-rejected') status = 'finalized-rejected';
    else if (recordResult.status === 'finalized-more-evidence') status = 'finalized-more-evidence';
    else if (recordResult.status === 'invalidated') {
      status = 'invalidated';
      appendUnique(blockers, 'decision-record-scope-invalidated');
    } else {
      status = 'attention-required';
      for (const blocker of recordResult.blockers) appendUnique(blockers, blocker);
    }
  }

  const canonicalRecordFinalized = finalizedRecord !== null;
  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    status,
    requirements: input.requirements.map(cloneRequirement),
    blockers: unique(blockers),
    warnings: unique(warnings),
    trustedContextReady,
    reviewStarted: input.reviewStarted,
    recordedDecisionCount,
    allDecisionsExplicit,
    finalizeRequested: input.finalizeRequested,
    finalizedRecord,
    workspaceValidForCurrentScope: !validation.scopeInvalid,
    canBeginReview: status === 'ready-for-review',
    canEditDraft: status === 'draft-in-progress' || status === 'ready-to-finalize',
    canRequestFinalize: status === 'ready-to-finalize',
    canFinalizeThroughDecisionRecordPolicy: status === 'ready-to-finalize' && input.clock !== null,
    canonicalRecordFinalized,
    canProceedToTrustedPersistenceReview: finalizedRecord?.eligibleForTrustedPersistence ?? false,
    canProceedToArtifactSelectionRecordingReview:
      finalizedRecord?.eligibleForArtifactSelectionRecordingReview ?? false,
    workspaceBoundaryOnly: true,
    draftPersisted: false,
    recordPersisted: false,
    recordSigned: false,
    recordAppliedDownstream: false,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

function stateStatusAfterDecisionChange(
  requirements: readonly LocalModelGovernanceReviewWorkspaceRequirementState[],
): LocalModelGovernanceReviewWorkspaceInput['status'] {
  const allExplicit = REQUIREMENT_IDS.every((requirementId) => requirements.some((item) => (
    item.requirementId === requirementId
    && item.explicitlyRecorded
    && item.decision !== 'not-recorded'
  )));
  return allExplicit ? 'ready-to-finalize' : 'draft-in-progress';
}

export function applyLocalModelGovernanceReviewWorkspaceEvent(
  input: LocalModelGovernanceReviewWorkspaceInput,
  event: LocalModelGovernanceReviewWorkspaceEvent,
): LocalModelGovernanceReviewWorkspaceInput {
  const state = cloneInput(input);
  const current = evaluateLocalModelGovernanceReviewWorkspace(state);

  if (event.type === 'begin-review') {
    if (!current.canBeginReview) throw new Error('workspace-begin-review-not-allowed');
    return { ...state, reviewStarted: true, status: 'draft-in-progress' };
  }

  if (event.type === 'set-decision') {
    if (!state.reviewStarted || !adapterIsTrusted(state.adapterResult)) {
      throw new Error('workspace-draft-edit-not-allowed');
    }
    if (!isKnownRequirementId(String(event.requirementId))) throw new Error('workspace-requirement-unknown');
    if (event.decision === ('not-recorded' as never)) throw new Error('workspace-set-decision-invalid');
    if (!state.requirements.some((item) => item.requirementId === event.requirementId)) {
      throw new Error('workspace-requirement-unknown');
    }
    const requirements = state.requirements.map((item) => item.requirementId === event.requirementId
      ? { ...item, decision: event.decision, explicitlyRecorded: true }
      : cloneRequirement(item));
    return {
      ...state,
      requirements,
      status: stateStatusAfterDecisionChange(requirements),
      finalizeRequested: false,
      finalizedRecord: null,
    };
  }

  if (event.type === 'clear-decision') {
    if (!state.reviewStarted || !adapterIsTrusted(state.adapterResult)) {
      throw new Error('workspace-draft-edit-not-allowed');
    }
    if (!isKnownRequirementId(String(event.requirementId))
      || !state.requirements.some((item) => item.requirementId === event.requirementId)) {
      throw new Error('workspace-requirement-unknown');
    }
    const requirements = state.requirements.map((item) => item.requirementId === event.requirementId
      ? { ...item, decision: 'not-recorded' as const, explicitlyRecorded: false }
      : cloneRequirement(item));
    return {
      ...state,
      requirements,
      status: 'draft-in-progress',
      finalizeRequested: false,
      finalizedRecord: null,
    };
  }

  if (event.type === 'request-finalize') {
    if (!current.canRequestFinalize || state.clock === null) {
      throw new Error('workspace-finalize-request-not-allowed');
    }
    return { ...state, status: 'finalize-requested', finalizeRequested: true, finalizedRecord: null };
  }

  if (event.type === 'cancel-finalize') {
    if (!state.finalizeRequested) throw new Error('workspace-cancel-finalize-not-allowed');
    return { ...state, status: 'ready-to-finalize', finalizeRequested: false, finalizedRecord: null };
  }

  if (event.type === 'reset-draft') {
    if (!state.reviewStarted || !adapterIsTrusted(state.adapterResult)) {
      throw new Error('workspace-reset-draft-not-allowed');
    }
    return {
      ...state,
      requirements: emptyRequirements(state.closureRecord),
      status: 'draft-in-progress',
      finalizeRequested: false,
      finalizedRecord: null,
    };
  }

  const validation = validateLocalModelGovernanceReviewWorkspaceInput(state);
  if (validation.scopeInvalid) {
    return { ...state, status: 'invalidated', previouslyInvalidated: true, finalizeRequested: false, finalizedRecord: null };
  }
  return state;
}

export function buildCurrentLocalModelGovernanceReviewWorkspaceResults(): readonly LocalModelGovernanceReviewWorkspaceResult[] {
  return listLocalModelGovernanceEvidenceClosures().map((record) => (
    evaluateLocalModelGovernanceReviewWorkspace(
      createLockedLocalModelGovernanceReviewWorkspaceInput(record.candidateId),
    )
  ));
}

export function listCurrentLocalModelGovernanceReviewWorkspaceResults(): readonly LocalModelGovernanceReviewWorkspaceResult[] {
  return buildCurrentLocalModelGovernanceReviewWorkspaceResults();
}
