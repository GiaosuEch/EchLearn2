import {
  LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION,
} from './localModelGovernanceRecordApplicationTypes.ts';
import type {
  LocalModelGovernanceRecordApplicationDecision,
} from './localModelGovernanceRecordApplicationTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION,
} from './localModelGovernanceApplicationRecordPersistenceTypes.ts';
import type {
  LocalModelGovernanceApplicationRecordPersistenceBuildResult,
  LocalModelGovernanceApplicationRecordPersistenceEnvelope,
  LocalModelGovernanceApplicationRecordPersistenceValidation,
} from './localModelGovernanceApplicationRecordPersistenceTypes.ts';

const ENVELOPE_KEYS = Object.freeze([
  'applicationDecisionKey',
  'applicationIdempotencyKey',
  'schemaRevision',
  'applicationPolicyRevision',
  'operation',
  'sourceGovernancePersistenceKey',
  'canonicalRecordKey',
  'canonicalRecordRevision',
  'canonicalOutcome',
  'candidateId',
  'candidateTier',
  'observedRevision',
  'applicationStatus',
  'artifactSelectionReviewEligible',
  'immutable',
  'appendOnly',
  'applicationRecordPersisted',
  'recordAppliedDownstream',
  'modelApproved',
  'licenseApproved',
  'artifactSelected',
  'artifactApproved',
  'checksumVerified',
  'benchmarkVerified',
  'downloadable',
  'runtimeReady',
  'modelActive',
] as const);

const SUPPORTED_TIERS = Object.freeze(['light', 'standard', 'pro'] as const);
const CANDIDATE_IDENTITIES = Object.freeze({
  'qwen3-0-6b-candidate': Object.freeze({
    tier: 'light',
    observedRevision: 'c1899de289a04d12100db370d81485cdf75e47ca',
  }),
  'qwen3-1-7b-candidate': Object.freeze({
    tier: 'standard',
    observedRevision: '70d244cc86ccca08cf5af4e1e306ecf908b1ad5e',
  }),
  'qwen3-4b-candidate': Object.freeze({
    tier: 'pro',
    observedRevision: '1cfa9a7208912126459214e8b04321603b3df60c',
  }),
} as const);

function appendIssue(issues: string[], issue: string): void {
  if (!issues.includes(issue)) issues.push(issue);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isNonEmptyTrimmedString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value === value.trim();
}

function hasExactKeys(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  return keys.length === ENVELOPE_KEYS.length
    && ENVELOPE_KEYS.every((key) => Object.prototype.hasOwnProperty.call(value, key))
    && keys.every((key) => (ENVELOPE_KEYS as readonly string[]).includes(key));
}

function extractObservedRevision(
  sourcePersistenceKey: string,
  candidateId: string,
  canonicalRecordKey: string,
  canonicalRecordRevision: number,
): string | null {
  const prefix = `local-model-governance-record:${candidateId}:`;
  const suffix = `:${canonicalRecordKey}:record-revision-${canonicalRecordRevision}:schema-1`;
  if (!sourcePersistenceKey.startsWith(prefix) || !sourcePersistenceKey.endsWith(suffix)) {
    return null;
  }
  const observedRevision = sourcePersistenceKey.slice(prefix.length, sourcePersistenceKey.length - suffix.length);
  return /^[A-Za-z0-9._-]+$/.test(observedRevision) ? observedRevision : null;
}

function buildExpectedApplicationDecisionKey(
  candidateId: string,
  observedRevision: string,
  canonicalRecordKey: string,
  applicationPolicyRevision: number,
): string {
  return [
    'local-model-governance-application',
    candidateId,
    observedRevision,
    canonicalRecordKey,
    'finalized-proceed',
    `application-policy-revision-${applicationPolicyRevision}`,
  ].join(':');
}

export function buildLocalModelGovernanceApplicationRecordIdempotencyKey(
  applicationDecisionKey: string,
): string {
  return `${applicationDecisionKey}:idempotency:schema-${LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION}`;
}

function validateSourceDecision(
  decision: LocalModelGovernanceRecordApplicationDecision,
): readonly string[] {
  const issues: string[] = [];

  if (decision.status !== 'eligible-for-downstream-review' || decision.blockers.length !== 0) {
    appendIssue(issues, 'governance-application-record-decision-not-eligible');
  }
  if (decision.explicitApplicationRequested !== true) {
    appendIssue(issues, 'governance-application-record-explicit-action-required');
  }
  if (decision.expectedEnvelopeValid !== true
    || decision.verificationAccepted !== true
    || decision.verificationCurrent !== true
    || decision.applicationEligible !== true
    || decision.staleVerificationDetected !== false
    || decision.candidateScopeVerified !== true
    || decision.modelIdentityVerified !== true
    || decision.revisionScopeVerified !== true
    || decision.outcomeEligible !== true
    || decision.artifactSelectionReviewEligible !== true) {
    appendIssue(issues, 'governance-application-record-decision-invariants-invalid');
  }
  if (decision.applicationRecordPersisted !== false
    || decision.recordAppliedDownstream !== false
    || decision.modelApproved !== false
    || decision.licenseApproved !== false
    || decision.artifactSelected !== false
    || decision.artifactApproved !== false
    || decision.checksumVerified !== false
    || decision.benchmarkVerified !== false
    || decision.downloadable !== false
    || decision.runtimeReady !== false
    || decision.modelActive !== false) {
    appendIssue(issues, 'governance-application-record-safety-flags-invalid');
  }
  if (!isNonEmptyTrimmedString(decision.applicationDecisionKey)) {
    appendIssue(issues, 'governance-application-record-decision-key-invalid');
  }
  if (!isNonEmptyTrimmedString(decision.candidateId)
    || decision.candidateTier === null
    || !SUPPORTED_TIERS.includes(decision.candidateTier)) {
    appendIssue(issues, 'governance-application-record-candidate-invalid');
  }
  if (!isNonEmptyTrimmedString(decision.persistenceKey)
    || !isNonEmptyTrimmedString(decision.canonicalRecordKey)
    || !isPositiveInteger(decision.canonicalRecordRevision)
    || decision.applicationPolicyRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION) {
    appendIssue(issues, 'governance-application-record-source-scope-invalid');
  }
  if (decision.canonicalOutcome !== 'finalized-proceed') {
    appendIssue(issues, 'governance-application-record-outcome-invalid');
  }

  return Object.freeze(issues);
}

export function buildLocalModelGovernanceApplicationRecordPersistenceEnvelope(
  decision: LocalModelGovernanceRecordApplicationDecision,
): LocalModelGovernanceApplicationRecordPersistenceBuildResult {
  try {
    const issues = [...validateSourceDecision(decision)];
    if (issues.length > 0) {
      return { valid: false, issues: Object.freeze(issues), envelope: null };
    }

    const applicationDecisionKey = decision.applicationDecisionKey;
    const sourceGovernancePersistenceKey = decision.persistenceKey;
    const canonicalRecordKey = decision.canonicalRecordKey;
    const canonicalRecordRevision = decision.canonicalRecordRevision;
    const candidateId = decision.candidateId;
    const candidateTier = decision.candidateTier;
    if (applicationDecisionKey === null
      || sourceGovernancePersistenceKey === null
      || canonicalRecordKey === null
      || canonicalRecordRevision === null
      || candidateId === null
      || candidateTier === null) {
      return {
        valid: false,
        issues: Object.freeze(['governance-application-record-source-scope-invalid']),
        envelope: null,
      };
    }

    const observedRevision = extractObservedRevision(
      sourceGovernancePersistenceKey,
      candidateId,
      canonicalRecordKey,
      canonicalRecordRevision,
    );
    const candidateIdentity = CANDIDATE_IDENTITIES[
      candidateId as keyof typeof CANDIDATE_IDENTITIES
    ];
    if (observedRevision === null
      || candidateIdentity === undefined
      || candidateTier !== candidateIdentity.tier
      || observedRevision !== candidateIdentity.observedRevision) {
      return {
        valid: false,
        issues: Object.freeze(['governance-application-record-source-key-invalid']),
        envelope: null,
      };
    }

    const expectedDecisionKey = buildExpectedApplicationDecisionKey(
      candidateId,
      observedRevision,
      canonicalRecordKey,
      decision.applicationPolicyRevision,
    );
    if (applicationDecisionKey !== expectedDecisionKey) {
      return {
        valid: false,
        issues: Object.freeze(['governance-application-record-decision-key-invalid']),
        envelope: null,
      };
    }

    const envelope: LocalModelGovernanceApplicationRecordPersistenceEnvelope = Object.freeze({
      applicationDecisionKey,
      applicationIdempotencyKey: buildLocalModelGovernanceApplicationRecordIdempotencyKey(applicationDecisionKey),
      schemaRevision: LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION,
      applicationPolicyRevision: decision.applicationPolicyRevision,
      operation: 'append',
      sourceGovernancePersistenceKey,
      canonicalRecordKey,
      canonicalRecordRevision,
      canonicalOutcome: 'finalized-proceed',
      candidateId,
      candidateTier,
      observedRevision,
      applicationStatus: 'eligible-for-downstream-review',
      artifactSelectionReviewEligible: true,
      immutable: true,
      appendOnly: true,
      applicationRecordPersisted: false,
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
    });

    const validation = validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(envelope);
    return validation.valid
      ? { valid: true, issues: validation.issues, envelope }
      : { valid: false, issues: validation.issues, envelope: null };
  } catch {
    return {
      valid: false,
      issues: Object.freeze(['governance-application-record-failed-safe']),
      envelope: null,
    };
  }
}

export function validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(
  value: unknown,
): LocalModelGovernanceApplicationRecordPersistenceValidation {
  try {
    const issues: string[] = [];
    if (!isRecord(value) || !hasExactKeys(value)) {
      return {
        valid: false,
        issues: Object.freeze(['governance-application-record-envelope-fields-invalid']),
      };
    }

    const applicationDecisionKey = value.applicationDecisionKey;
    const sourceGovernancePersistenceKey = value.sourceGovernancePersistenceKey;
    const canonicalRecordKey = value.canonicalRecordKey;
    const canonicalRecordRevision = value.canonicalRecordRevision;
    const applicationPolicyRevision = value.applicationPolicyRevision;
    const candidateId = value.candidateId;
    const candidateTier = value.candidateTier;

    if (!isNonEmptyTrimmedString(applicationDecisionKey)) {
      appendIssue(issues, 'governance-application-record-decision-key-invalid');
    }
    if (!isNonEmptyTrimmedString(sourceGovernancePersistenceKey)
      || !isNonEmptyTrimmedString(canonicalRecordKey)
      || !isPositiveInteger(canonicalRecordRevision)) {
      appendIssue(issues, 'governance-application-record-source-scope-invalid');
    }
    if (!isNonEmptyTrimmedString(candidateId)
      || typeof candidateTier !== 'string'
      || !SUPPORTED_TIERS.includes(candidateTier as (typeof SUPPORTED_TIERS)[number])) {
      appendIssue(issues, 'governance-application-record-candidate-invalid');
    }
    if (value.schemaRevision !== LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION) {
      appendIssue(issues, 'governance-application-record-schema-revision-invalid');
    }
    if (applicationPolicyRevision !== LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION) {
      appendIssue(issues, 'governance-application-record-policy-revision-invalid');
    }
    if (value.operation !== 'append') {
      appendIssue(issues, 'governance-application-record-operation-invalid');
    }
    if (value.canonicalOutcome !== 'finalized-proceed') {
      appendIssue(issues, 'governance-application-record-outcome-invalid');
    }
    if (value.applicationStatus !== 'eligible-for-downstream-review') {
      appendIssue(issues, 'governance-application-record-status-invalid');
    }
    if (value.artifactSelectionReviewEligible !== true
      || value.immutable !== true
      || value.appendOnly !== true) {
      appendIssue(issues, 'governance-application-record-immutable-flags-invalid');
    }
    if (value.applicationRecordPersisted !== false
      || value.recordAppliedDownstream !== false
      || value.modelApproved !== false
      || value.licenseApproved !== false
      || value.artifactSelected !== false
      || value.artifactApproved !== false
      || value.checksumVerified !== false
      || value.benchmarkVerified !== false
      || value.downloadable !== false
      || value.runtimeReady !== false
      || value.modelActive !== false) {
      appendIssue(issues, 'governance-application-record-safety-flags-invalid');
    }

    if (isNonEmptyTrimmedString(applicationDecisionKey)) {
      if (value.applicationIdempotencyKey !== buildLocalModelGovernanceApplicationRecordIdempotencyKey(applicationDecisionKey)) {
        appendIssue(issues, 'governance-application-record-idempotency-key-invalid');
      }
    } else {
      appendIssue(issues, 'governance-application-record-idempotency-key-invalid');
    }

    if (isNonEmptyTrimmedString(sourceGovernancePersistenceKey)
      && isNonEmptyTrimmedString(candidateId)
      && isNonEmptyTrimmedString(canonicalRecordKey)
      && isPositiveInteger(canonicalRecordRevision)
      && isPositiveInteger(applicationPolicyRevision)) {
      const observedRevision = extractObservedRevision(
        sourceGovernancePersistenceKey,
        candidateId,
        canonicalRecordKey,
        canonicalRecordRevision,
      );
      const candidateIdentity = CANDIDATE_IDENTITIES[
        candidateId as keyof typeof CANDIDATE_IDENTITIES
      ];
      if (observedRevision === null
        || candidateIdentity === undefined
        || candidateTier !== candidateIdentity.tier
        || observedRevision !== candidateIdentity.observedRevision
        || value.observedRevision !== observedRevision) {
        appendIssue(issues, 'governance-application-record-observed-revision-invalid');
      } else if (isNonEmptyTrimmedString(applicationDecisionKey)) {
        const expectedDecisionKey = buildExpectedApplicationDecisionKey(
          candidateId,
          observedRevision,
          canonicalRecordKey,
          applicationPolicyRevision,
        );
        if (applicationDecisionKey !== expectedDecisionKey) {
          appendIssue(issues, 'governance-application-record-decision-key-invalid');
        }
      }
    } else {
      appendIssue(issues, 'governance-application-record-observed-revision-invalid');
    }

    return {
      valid: issues.length === 0,
      issues: Object.freeze(issues),
    };
  } catch {
    return {
      valid: false,
      issues: Object.freeze(['governance-application-record-failed-safe']),
    };
  }
}
