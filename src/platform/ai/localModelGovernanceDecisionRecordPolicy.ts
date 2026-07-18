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
import type {
  LocalModelGovernanceDecisionRecord,
  LocalModelGovernanceDecisionRecordDraftInput,
  LocalModelGovernanceDecisionRecordDraftItem,
  LocalModelGovernanceDecisionRecordFinalItem,
  LocalModelGovernanceDecisionRecordInputValidation,
  LocalModelGovernanceDecisionRecordOutcome,
  LocalModelGovernanceDecisionRecordResult,
  LocalModelGovernanceDecisionRecordScope,
  LocalModelTrustedGovernanceActorContext,
} from './localModelGovernanceDecisionRecordTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_DECISION_RECORD_POLICY_REVISION = 1;
export const LOCAL_MODEL_TRUSTED_GOVERNANCE_ACTOR_CONTEXT_REVISION = 1;

const REQUIREMENT_IDS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
] as const;

const FALLBACK_TIER = 'light' as const;
const MAX_ACTOR_SUBJECT_LENGTH = 128;
const MIN_ACTOR_SUBJECT_LENGTH = 8;

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

function cloneDecisionItem(
  item: LocalModelGovernanceDecisionRecordDraftItem,
): LocalModelGovernanceDecisionRecordDraftItem {
  return {
    ...item,
    blockers: [...item.blockers],
    warnings: [...item.warnings],
  };
}

function cloneActorContext(
  context: LocalModelTrustedGovernanceActorContext | null,
): LocalModelTrustedGovernanceActorContext | null {
  return context ? { ...context } : null;
}

export function buildLocalModelGovernanceDecisionRecordScope(
  record: LocalModelGovernanceEvidenceClosureCandidateRecord,
  recordRevision = 1,
): LocalModelGovernanceDecisionRecordScope {
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
    recordRevision,
  };
}

export function isSameLocalModelGovernanceDecisionRecordScope(
  left: LocalModelGovernanceDecisionRecordScope,
  right: LocalModelGovernanceDecisionRecordScope,
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
    && left.recordRevision === right.recordRevision;
}

export function buildLocalModelGovernanceDecisionRecordKey(
  scope: LocalModelGovernanceDecisionRecordScope,
  recordRevision: number,
): string {
  const revision = scope.observedRevision ?? 'revision-unavailable';
  return [
    'governance-record',
    scope.candidateId,
    revision,
    `e${scope.evidenceClosureRevision}`,
    `d${scope.governanceDecisionPolicyRevision}`,
    `p${scope.governanceDecisionRecordPolicyRevision}`,
    `r${recordRevision}`,
  ].join(':');
}

function emptyScope(candidateId: string, recordRevision = 1): LocalModelGovernanceDecisionRecordScope {
  return {
    candidateId,
    candidateTier: FALLBACK_TIER,
    modelClass: '',
    exactModelName: '',
    officialRepositoryId: '',
    observedRevision: null,
    tokenizerLicenseClosureStatus: 'unresolved',
    acceptableUseClosureStatus: 'unresolved',
    derivedHostingClosureStatus: 'unresolved',
    quantizationClosureStatus: 'unresolved',
    evidenceClosureRevision: LOCAL_MODEL_GOVERNANCE_EVIDENCE_CLOSURE_REVISION,
    governanceDecisionPolicyRevision: LOCAL_MODEL_HUMAN_GOVERNANCE_DECISION_POLICY_REVISION,
    governanceDecisionRecordPolicyRevision: LOCAL_MODEL_GOVERNANCE_DECISION_RECORD_POLICY_REVISION,
    recordRevision,
  };
}

export function createEmptyLocalModelGovernanceDecisionRecordInput(
  candidateId: string,
): LocalModelGovernanceDecisionRecordDraftInput {
  const closureRecord = getLocalModelGovernanceEvidenceClosure(candidateId);
  const recordRevision = 1;
  const currentScope = closureRecord
    ? buildLocalModelGovernanceDecisionRecordScope(closureRecord, recordRevision)
    : emptyScope(candidateId, recordRevision);
  const decisions = REQUIREMENT_IDS.map((requirementId): LocalModelGovernanceDecisionRecordDraftItem => ({
    requirementId,
    evidenceClosureStatus: closureRecord ? requirementStatus(closureRecord, requirementId) : 'unresolved',
    decision: 'not-recorded',
    explicitlyRecorded: false,
    blockers: [],
    warnings: [],
  }));

  return {
    candidateId,
    candidateTier: closureRecord?.candidateTier ?? FALLBACK_TIER,
    closureRecord,
    actorContext: null,
    decisions,
    currentScope,
    recordRevision,
    finalizeRequested: false,
    previouslyInvalidated: false,
    clock: null,
    claimedPersisted: false,
    claimedSigned: false,
    claimedAppliedToArtifactSelection: false,
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

function validateActorContext(context: LocalModelTrustedGovernanceActorContext | null): readonly string[] {
  const issues: string[] = [];
  if (!context) return issues;
  if (!context.authenticated) appendUnique(issues, 'actor-not-authenticated');
  if (!context.authorizationVerified) appendUnique(issues, 'actor-authorization-not-verified');
  if (context.actorRole !== 'model-governance-reviewer') appendUnique(issues, 'actor-role-invalid');
  if (context.authorizationScope !== 'record-model-governance-decision') appendUnique(issues, 'actor-authorization-scope-invalid');
  if (!['external-auth-boundary', 'synthetic-test-fixture'].includes(context.authenticationSource)) {
    appendUnique(issues, 'actor-authentication-source-invalid');
  }
  if (context.actorContextRevision !== LOCAL_MODEL_TRUSTED_GOVERNANCE_ACTOR_CONTEXT_REVISION) {
    appendUnique(issues, 'actor-context-revision-mismatch');
  }
  const subject = context.actorSubjectId;
  if (subject.length < MIN_ACTOR_SUBJECT_LENGTH || subject.length > MAX_ACTOR_SUBJECT_LENGTH) {
    appendUnique(issues, 'actor-subject-length-invalid');
  }
  if (subject.includes('@')) appendUnique(issues, 'actor-subject-email-like');
  if (!/^[A-Za-z0-9._:-]+$/.test(subject)) appendUnique(issues, 'actor-subject-format-invalid');
  return issues;
}

function validateDecisionItems(
  input: LocalModelGovernanceDecisionRecordDraftInput,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  if (input.decisions.length !== REQUIREMENT_IDS.length) appendUnique(issues, 'decision-item-count-invalid');
  for (const item of input.decisions) {
    if (!isKnownRequirementId(item.requirementId)) {
      appendUnique(issues, 'unknown-governance-requirement');
      continue;
    }
    if (seen.has(item.requirementId)) appendUnique(issues, `duplicate-governance-requirement:${item.requirementId}`);
    seen.add(item.requirementId);
    if (!item.explicitlyRecorded && item.decision !== 'not-recorded') {
      appendUnique(issues, `decision-flag-mismatch:${item.requirementId}`);
    }
    if (item.explicitlyRecorded && item.decision === 'not-recorded') {
      appendUnique(issues, `decision-flag-mismatch:${item.requirementId}`);
    }
    const expectedStatus = input.closureRecord
      ? requirementStatus(input.closureRecord, item.requirementId)
      : null;
    if (expectedStatus !== null && item.evidenceClosureStatus !== expectedStatus) {
      appendUnique(issues, `evidence-closure-status-mismatch:${item.requirementId}`);
    }
  }
  for (const requirementId of REQUIREMENT_IDS) {
    if (!seen.has(requirementId)) appendUnique(issues, `missing-governance-requirement:${requirementId}`);
  }
  return issues;
}

function scopeIsInvalid(input: LocalModelGovernanceDecisionRecordDraftInput): boolean {
  const closure = input.closureRecord;
  if (!closure) return true;
  if (input.candidateId !== closure.candidateId || input.candidateTier !== closure.candidateTier) return true;
  if (input.recordRevision !== input.currentScope.recordRevision) return true;
  return !isSameLocalModelGovernanceDecisionRecordScope(
    input.currentScope,
    buildLocalModelGovernanceDecisionRecordScope(closure, input.recordRevision),
  );
}

export function validateLocalModelGovernanceDecisionRecordInput(
  input: LocalModelGovernanceDecisionRecordDraftInput,
): LocalModelGovernanceDecisionRecordInputValidation {
  const issues: string[] = [];
  const scopeInvalid = input.previouslyInvalidated || scopeIsInvalid(input);
  if (!input.closureRecord) appendUnique(issues, 'candidate-not-found');
  if (input.previouslyInvalidated) appendUnique(issues, 'record-previously-invalidated');
  if (scopeInvalid) appendUnique(issues, 'record-scope-mismatch');
  for (const issue of validateActorContext(input.actorContext)) appendUnique(issues, issue);
  for (const issue of validateDecisionItems(input)) appendUnique(issues, issue);

  const forbiddenClaims: readonly [boolean, string][] = [
    [input.claimedPersisted, 'persistence-claim-not-allowed'],
    [input.claimedSigned, 'signature-claim-not-allowed'],
    [input.claimedAppliedToArtifactSelection, 'downstream-application-claim-not-allowed'],
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

  const allExplicit = input.decisions.length === REQUIREMENT_IDS.length
    && input.decisions.every((item) => item.explicitlyRecorded && item.decision !== 'not-recorded');
  if (input.finalizeRequested && !allExplicit) appendUnique(issues, 'finalize-requested-before-explicit-decisions');
  if (input.finalizeRequested && !input.actorContext) appendUnique(issues, 'finalize-requested-without-actor');
  if (input.finalizeRequested && !input.clock) appendUnique(issues, 'finalize-requested-without-clock');

  return {
    valid: issues.length === 0,
    issues: unique(issues),
    scopeInvalid,
  };
}

function isValidIsoTime(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function outcomeFor(decisions: readonly LocalModelGovernanceDecisionRecordDraftItem[]): LocalModelGovernanceDecisionRecordOutcome {
  if (decisions.some((item) => item.decision === 'reject')) return 'rejected';
  if (decisions.some((item) => item.decision === 'request-more-evidence')) return 'more-evidence';
  return 'proceed';
}

function finalItems(
  decisions: readonly LocalModelGovernanceDecisionRecordDraftItem[],
): readonly LocalModelGovernanceDecisionRecordFinalItem[] {
  return decisions.map((item): LocalModelGovernanceDecisionRecordFinalItem => ({
    requirementId: item.requirementId,
    evidenceClosureStatus: item.evidenceClosureStatus,
    decision: item.decision as Exclude<typeof item.decision, 'not-recorded'>,
    explicitlyRecorded: true,
    blockers: [...item.blockers],
    warnings: [...item.warnings],
  }));
}

function createCanonicalRecord(
  input: LocalModelGovernanceDecisionRecordDraftInput,
  reviewedAt: string,
): LocalModelGovernanceDecisionRecord {
  const outcome = outcomeFor(input.decisions);
  return {
    recordKey: buildLocalModelGovernanceDecisionRecordKey(input.currentScope, input.recordRevision),
    recordRevision: input.recordRevision,
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    scope: { ...input.currentScope },
    decisions: finalItems(input.decisions),
    actorSubjectId: input.actorContext!.actorSubjectId,
    actorRole: input.actorContext!.actorRole,
    reviewedAt,
    outcome,
    allDecisionsExplicit: true,
    recordValidForCurrentScope: true,
    eligibleForTrustedPersistence: true,
    eligibleForArtifactSelectionRecordingReview: outcome === 'proceed',
    decisionRecordOnly: true,
    persisted: false,
    signed: false,
    appliedToArtifactSelection: false,
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

export function evaluateLocalModelGovernanceDecisionRecord(
  input: LocalModelGovernanceDecisionRecordDraftInput,
): LocalModelGovernanceDecisionRecordResult {
  const validation = validateLocalModelGovernanceDecisionRecordInput(input);
  const blockers = [...validation.issues];
  const warnings: string[] = [];
  const recordedDecisionItems = input.decisions.filter((item) => item.explicitlyRecorded).length;
  const allDecisionsExplicit = input.decisions.length === REQUIREMENT_IDS.length
    && REQUIREMENT_IDS.every((requirementId) => input.decisions.some((item) => (
      item.requirementId === requirementId
      && item.explicitlyRecorded
      && item.decision !== 'not-recorded'
    )));
  const actorIssues = validateActorContext(input.actorContext);
  const trustedActorContextValid = Boolean(input.actorContext) && actorIssues.length === 0;

  let status: LocalModelGovernanceDecisionRecordResult['status'];
  let canonicalRecord: LocalModelGovernanceDecisionRecord | null = null;

  if (validation.scopeInvalid) {
    status = 'invalidated';
  } else if (validation.issues.some((issue) => !['finalize-requested-without-actor', 'finalize-requested-without-clock'].includes(issue))) {
    status = 'attention-required';
  } else if (!input.actorContext) {
    status = input.finalizeRequested ? 'attention-required' : 'awaiting-trusted-actor';
  } else if (!trustedActorContextValid) {
    status = 'attention-required';
  } else if (!allDecisionsExplicit) {
    status = input.finalizeRequested ? 'attention-required' : 'awaiting-explicit-decisions';
  } else if (!input.finalizeRequested) {
    status = 'draft-valid';
  } else if (!input.clock) {
    status = 'attention-required';
    appendUnique(blockers, 'finalize-requested-without-clock');
  } else {
    const reviewedAtInput = input.clock();
    if (!isValidIsoTime(reviewedAtInput)) {
      status = 'attention-required';
      appendUnique(blockers, 'review-clock-output-invalid');
    } else {
      const reviewedAt = new Date(Date.parse(reviewedAtInput)).toISOString();
      canonicalRecord = createCanonicalRecord(input, reviewedAt);
      status = canonicalRecord.outcome === 'proceed'
        ? 'finalized-proceed'
        : canonicalRecord.outcome === 'rejected'
          ? 'finalized-rejected'
          : 'finalized-more-evidence';
    }
  }

  if (status === 'awaiting-trusted-actor') appendUnique(warnings, 'trusted-actor-context-required');
  if (status === 'awaiting-explicit-decisions') appendUnique(warnings, 'four-explicit-governance-decisions-required');
  if (status === 'draft-valid') appendUnique(warnings, 'explicit-finalization-required');

  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    status,
    scope: { ...input.currentScope },
    actorContext: cloneActorContext(input.actorContext),
    decisions: input.decisions.map(cloneDecisionItem),
    canonicalRecord,
    blockers: unique(blockers),
    warnings: unique(warnings),
    trustedActorContextValid,
    recordedDecisionItems,
    allDecisionsExplicit,
    finalizeRequested: input.finalizeRequested,
    recordValidForCurrentScope: !validation.scopeInvalid,
    eligibleForTrustedPersistence: canonicalRecord?.eligibleForTrustedPersistence ?? false,
    eligibleForArtifactSelectionRecordingReview: canonicalRecord?.eligibleForArtifactSelectionRecordingReview ?? false,
    decisionRecordContractOnly: true,
    persisted: false,
    signed: false,
    appliedToArtifactSelection: false,
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

export function buildCanonicalLocalModelGovernanceDecisionRecord(
  input: LocalModelGovernanceDecisionRecordDraftInput,
): LocalModelGovernanceDecisionRecord | null {
  return evaluateLocalModelGovernanceDecisionRecord(input).canonicalRecord;
}

export function buildCurrentLocalModelGovernanceDecisionRecordResults(): readonly LocalModelGovernanceDecisionRecordResult[] {
  return listLocalModelGovernanceEvidenceClosures().map((record) => (
    evaluateLocalModelGovernanceDecisionRecord(
      createEmptyLocalModelGovernanceDecisionRecordInput(record.candidateId),
    )
  ));
}

export function listCurrentLocalModelGovernanceDecisionRecordResults(): readonly LocalModelGovernanceDecisionRecordResult[] {
  return buildCurrentLocalModelGovernanceDecisionRecordResults();
}
