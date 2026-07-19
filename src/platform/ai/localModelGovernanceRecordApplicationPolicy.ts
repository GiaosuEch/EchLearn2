import {
  validateLocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistenceTypes.ts';
import type {
  LocalModelGovernancePersistedRecordVerificationResult,
} from './localModelGovernancePersistedRecordVerificationTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION,
} from './localModelGovernanceRecordApplicationTypes.ts';
export { LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION } from './localModelGovernanceRecordApplicationTypes.ts';
import type {
  LocalModelGovernanceRecordApplicationDecision,
  LocalModelGovernanceRecordApplicationRequest,
  LocalModelGovernanceRecordApplicationScope,
  LocalModelGovernanceRecordApplicationStatus,
} from './localModelGovernanceRecordApplicationTypes.ts';

const SAFE_FLAGS = Object.freeze({
  applicationRecordPersisted: false as const,
  recordAppliedDownstream: false as const,
  modelApproved: false as const,
  licenseApproved: false as const,
  artifactSelected: false as const,
  artifactApproved: false as const,
  checksumVerified: false as const,
  benchmarkVerified: false as const,
  downloadable: false as const,
  runtimeReady: false as const,
  modelActive: false as const,
});

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

interface DecisionOverrides {
  readonly blockers?: readonly string[];
  readonly warnings?: readonly string[];
  readonly explicitApplicationRequested?: boolean;
  readonly expectedEnvelopeValid?: boolean;
  readonly verificationAccepted?: boolean;
  readonly verificationCurrent?: boolean;
  readonly applicationEligible?: boolean;
  readonly applicationDecisionKey?: string | null;
  readonly candidateId?: LocalModelGovernanceRecordApplicationDecision['candidateId'];
  readonly candidateTier?: LocalModelGovernanceRecordApplicationDecision['candidateTier'];
  readonly persistenceKey?: string | null;
  readonly canonicalRecordKey?: string | null;
  readonly canonicalOutcome?: LocalModelGovernanceRecordApplicationDecision['canonicalOutcome'];
  readonly canonicalRecordRevision?: number | null;
  readonly previousDecisionPresent?: boolean;
  readonly replayDetected?: boolean;
  readonly staleVerificationDetected?: boolean;
  readonly candidateScopeVerified?: boolean;
  readonly modelIdentityVerified?: boolean;
  readonly revisionScopeVerified?: boolean;
  readonly outcomeEligible?: boolean;
  readonly artifactSelectionReviewEligible?: boolean;
}

function decision(
  status: LocalModelGovernanceRecordApplicationStatus,
  overrides: DecisionOverrides = {},
): LocalModelGovernanceRecordApplicationDecision {
  return {
    status,
    blockers: unique(overrides.blockers ?? []),
    warnings: unique(overrides.warnings ?? []),
    explicitApplicationRequested: overrides.explicitApplicationRequested ?? false,
    expectedEnvelopeValid: overrides.expectedEnvelopeValid ?? false,
    verificationAccepted: overrides.verificationAccepted ?? false,
    verificationCurrent: overrides.verificationCurrent ?? false,
    applicationEligible: overrides.applicationEligible ?? false,
    applicationDecisionKey: overrides.applicationDecisionKey ?? null,
    candidateId: overrides.candidateId ?? null,
    candidateTier: overrides.candidateTier ?? null,
    persistenceKey: overrides.persistenceKey ?? null,
    canonicalRecordKey: overrides.canonicalRecordKey ?? null,
    canonicalOutcome: overrides.canonicalOutcome ?? null,
    canonicalRecordRevision: overrides.canonicalRecordRevision ?? null,
    applicationPolicyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION,
    previousDecisionPresent: overrides.previousDecisionPresent ?? false,
    replayDetected: overrides.replayDetected ?? false,
    staleVerificationDetected: overrides.staleVerificationDetected ?? false,
    candidateScopeVerified: overrides.candidateScopeVerified ?? false,
    modelIdentityVerified: overrides.modelIdentityVerified ?? false,
    revisionScopeVerified: overrides.revisionScopeVerified ?? false,
    outcomeEligible: overrides.outcomeEligible ?? false,
    ...SAFE_FLAGS,
    artifactSelectionReviewEligible: overrides.artifactSelectionReviewEligible ?? false,
  };
}

export function buildLocalModelGovernanceRecordApplicationScope(
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
): LocalModelGovernanceRecordApplicationScope {
  return {
    candidateId: envelope.candidateId,
    candidateTier: envelope.candidateTier,
    modelClass: envelope.canonicalRecord.scope.modelClass,
    exactModelName: envelope.canonicalRecord.scope.exactModelName,
    officialRepositoryId: envelope.canonicalRecord.scope.officialRepositoryId,
    observedRevision: envelope.canonicalRecord.scope.observedRevision,
    evidenceClosureRevision: envelope.canonicalRecord.scope.evidenceClosureRevision,
    governanceDecisionPolicyRevision: envelope.canonicalRecord.scope.governanceDecisionPolicyRevision,
    governanceDecisionRecordPolicyRevision: envelope.canonicalRecord.scope.governanceDecisionRecordPolicyRevision,
    governanceApplicationPolicyRevision: LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION,
    canonicalRecordRevision: envelope.canonicalRecordRevision,
    persistenceKey: envelope.persistenceKey,
    canonicalRecordKey: envelope.canonicalRecordKey,
    canonicalOutcome: envelope.canonicalOutcome,
  };
}

export function buildLocalModelGovernanceApplicationDecisionKey(
  scope: LocalModelGovernanceRecordApplicationScope,
): string {
  return [
    'local-model-governance-application',
    scope.candidateId,
    scope.observedRevision ?? 'revision-unavailable',
    scope.canonicalRecordKey,
    scope.canonicalOutcome,
    `application-policy-revision-${scope.governanceApplicationPolicyRevision}`,
  ].join(':');
}

function verificationComplete(
  result: LocalModelGovernancePersistedRecordVerificationResult,
): boolean {
  return result.explicitActionRequested === true
    && result.expectedEnvelopeValid === true
    && result.repositoryAvailable === true
    && result.readAttempted === true
    && result.readInvocationCount === 1
    && result.recordVisible === true
    && result.recordVerified === true
    && result.envelopeMatched === true
    && result.candidateScopeVerified === true
    && result.modelIdentityVerified === true
    && result.actorBindingVerified === true
    && result.reviewedAtVerified === true
    && result.rawRowExposed === false
    && result.rawErrorExposed === false
    && result.recordAppliedDownstream === false
    && result.modelApproved === false
    && result.licenseApproved === false
    && result.artifactSelected === false
    && result.artifactApproved === false
    && result.checksumVerified === false
    && result.benchmarkVerified === false
    && result.downloadable === false
    && result.runtimeReady === false
    && result.modelActive === false;
}

function verificationBoundToEnvelope(
  result: LocalModelGovernancePersistedRecordVerificationResult,
  envelope: LocalModelGovernanceRecordPersistenceEnvelope,
): boolean {
  return result.persistenceKey === envelope.persistenceKey
    && result.canonicalRecordKey === envelope.canonicalRecordKey
    && result.canonicalOutcome === envelope.canonicalOutcome
    && result.schemaRevision === envelope.schemaRevision
    && result.policyRevision === envelope.policyRevision;
}

function immutableDecisionMatches(
  previous: LocalModelGovernanceRecordApplicationDecision,
  current: LocalModelGovernanceRecordApplicationDecision,
): boolean {
  return previous.status === current.status
    && previous.applicationDecisionKey === current.applicationDecisionKey
    && previous.candidateId === current.candidateId
    && previous.candidateTier === current.candidateTier
    && previous.persistenceKey === current.persistenceKey
    && previous.canonicalRecordKey === current.canonicalRecordKey
    && previous.canonicalOutcome === current.canonicalOutcome
    && previous.canonicalRecordRevision === current.canonicalRecordRevision
    && previous.applicationPolicyRevision === current.applicationPolicyRevision
    && previous.expectedEnvelopeValid === current.expectedEnvelopeValid
    && previous.verificationAccepted === current.verificationAccepted
    && previous.verificationCurrent === current.verificationCurrent
    && previous.applicationEligible === current.applicationEligible
    && previous.candidateScopeVerified === current.candidateScopeVerified
    && previous.modelIdentityVerified === current.modelIdentityVerified
    && previous.revisionScopeVerified === current.revisionScopeVerified
    && previous.outcomeEligible === current.outcomeEligible
    && previous.artifactSelectionReviewEligible === current.artifactSelectionReviewEligible
    && previous.applicationRecordPersisted === false
    && previous.recordAppliedDownstream === false
    && previous.modelApproved === false
    && previous.licenseApproved === false
    && previous.artifactSelected === false
    && previous.artifactApproved === false
    && previous.checksumVerified === false
    && previous.benchmarkVerified === false
    && previous.downloadable === false
    && previous.runtimeReady === false
    && previous.modelActive === false;
}

function scopeBase(
  expected: LocalModelGovernanceRecordApplicationScope,
  explicitApplicationRequested: boolean,
): DecisionOverrides {
  return {
    explicitApplicationRequested,
    expectedEnvelopeValid: true,
    applicationDecisionKey: buildLocalModelGovernanceApplicationDecisionKey(expected),
    candidateId: expected.candidateId,
    candidateTier: expected.candidateTier,
    persistenceKey: expected.persistenceKey,
    canonicalRecordKey: expected.canonicalRecordKey,
    canonicalOutcome: expected.canonicalOutcome,
    canonicalRecordRevision: expected.canonicalRecordRevision,
  };
}

export function evaluateLocalModelGovernanceRecordApplication(
  request: LocalModelGovernanceRecordApplicationRequest,
): LocalModelGovernanceRecordApplicationDecision {
  try {
    if (request.explicitApplicationRequested !== true) {
      return decision('not-requested', {
        blockers: ['governance-application-explicit-action-required'],
      });
    }

    const requestedOutcome = request.expectedEnvelope.canonicalOutcome;
    if (requestedOutcome !== 'finalized-proceed'
      && requestedOutcome !== 'finalized-rejected'
      && requestedOutcome !== 'finalized-more-evidence') {
      return decision('failed-safe', {
        explicitApplicationRequested: true,
        blockers: ['governance-application-failed-safe'],
      });
    }

    const validation = validateLocalModelGovernanceRecordPersistenceEnvelope(request.expectedEnvelope);
    if (!validation.valid) {
      return decision('invalid-expected-envelope', {
        explicitApplicationRequested: true,
        blockers: validation.issues.length > 0
          ? validation.issues
          : ['governance-application-expected-envelope-invalid'],
      });
    }

    const expectedScope = buildLocalModelGovernanceRecordApplicationScope(request.expectedEnvelope);
    const base = scopeBase(expectedScope, true);
    const verification = request.verificationResult;

    if (verification.status !== 'verified') {
      return decision('verification-not-verified', {
        ...base,
        blockers: ['governance-application-verification-not-verified'],
      });
    }

    if (!verificationComplete(verification)) {
      return decision('verification-incomplete', {
        ...base,
        blockers: ['governance-application-verification-incomplete'],
      });
    }

    if (!verificationBoundToEnvelope(verification, request.expectedEnvelope)) {
      return decision('verification-envelope-mismatch', {
        ...base,
        blockers: ['governance-application-verification-envelope-mismatch'],
      });
    }

    const accepted = { ...base, verificationAccepted: true };
    const current = request.currentScope;

    if (current.candidateId !== expectedScope.candidateId
      || current.candidateTier !== expectedScope.candidateTier) {
      return decision('candidate-scope-mismatch', {
        ...accepted,
        blockers: ['governance-application-candidate-scope-mismatch'],
      });
    }

    if (current.modelClass !== expectedScope.modelClass
      || current.exactModelName !== expectedScope.exactModelName
      || current.officialRepositoryId !== expectedScope.officialRepositoryId
      || current.observedRevision !== expectedScope.observedRevision) {
      return decision('model-identity-mismatch', {
        ...accepted,
        blockers: ['governance-application-model-identity-mismatch'],
        candidateScopeVerified: true,
        staleVerificationDetected: current.observedRevision !== expectedScope.observedRevision,
      });
    }

    if (current.evidenceClosureRevision !== expectedScope.evidenceClosureRevision
      || current.governanceDecisionPolicyRevision !== expectedScope.governanceDecisionPolicyRevision
      || current.governanceDecisionRecordPolicyRevision !== expectedScope.governanceDecisionRecordPolicyRevision
      || current.governanceApplicationPolicyRevision !== expectedScope.governanceApplicationPolicyRevision
      || current.canonicalRecordRevision !== expectedScope.canonicalRecordRevision) {
      return decision('revision-mismatch', {
        ...accepted,
        blockers: ['governance-application-revision-mismatch'],
        candidateScopeVerified: true,
        modelIdentityVerified: true,
        staleVerificationDetected: true,
      });
    }

    if (current.persistenceKey !== expectedScope.persistenceKey
      || current.canonicalRecordKey !== expectedScope.canonicalRecordKey
      || current.canonicalOutcome !== expectedScope.canonicalOutcome) {
      return decision('stale-verification', {
        ...accepted,
        blockers: ['governance-application-stale-verification'],
        candidateScopeVerified: true,
        modelIdentityVerified: true,
        revisionScopeVerified: true,
        staleVerificationDetected: true,
      });
    }

    const currentBase: DecisionOverrides = {
      ...accepted,
      verificationCurrent: true,
      candidateScopeVerified: true,
      modelIdentityVerified: true,
      revisionScopeVerified: true,
    };

    if (expectedScope.canonicalOutcome === 'finalized-rejected') {
      return decision('outcome-rejected', {
        ...currentBase,
        blockers: ['governance-application-outcome-rejected'],
      });
    }

    if (expectedScope.canonicalOutcome === 'finalized-more-evidence') {
      return decision('more-evidence-required', {
        ...currentBase,
        blockers: ['governance-application-more-evidence-required'],
      });
    }

    if (expectedScope.canonicalOutcome !== 'finalized-proceed') {
      return decision('failed-safe', {
        ...currentBase,
        blockers: ['governance-application-failed-safe'],
      });
    }

    const eligible = decision('eligible-for-downstream-review', {
      ...currentBase,
      verificationAccepted: true,
      verificationCurrent: true,
      applicationEligible: true,
      candidateScopeVerified: true,
      modelIdentityVerified: true,
      revisionScopeVerified: true,
      outcomeEligible: true,
      artifactSelectionReviewEligible: true,
      previousDecisionPresent: request.previousApplicationDecision !== null,
    });

    const previous = request.previousApplicationDecision;
    if (previous === null) return eligible;

    if (previous.applicationDecisionKey === eligible.applicationDecisionKey
      && immutableDecisionMatches(previous, eligible)) {
      return decision('eligible-for-downstream-review', {
        ...currentBase,
        verificationAccepted: true,
        verificationCurrent: true,
        applicationEligible: true,
        candidateScopeVerified: true,
        modelIdentityVerified: true,
        revisionScopeVerified: true,
        outcomeEligible: true,
        artifactSelectionReviewEligible: true,
        previousDecisionPresent: true,
        replayDetected: true,
        warnings: ['governance-application-identical-existing-decision'],
      });
    }

    return decision('previous-decision-conflict', {
      ...currentBase,
      blockers: ['governance-application-previous-decision-conflict'],
      previousDecisionPresent: true,
      replayDetected: true,
    });
  } catch {
    return decision('failed-safe', {
      blockers: ['governance-application-failed-safe'],
    });
  }
}
