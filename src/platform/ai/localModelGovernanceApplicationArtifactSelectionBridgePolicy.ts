import {
  validateLocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from './localModelGovernanceApplicationRecordPersistencePolicy.ts';
import type {
  LocalModelGovernanceApplicationRecordPersistenceEnvelope,
} from './localModelGovernanceApplicationRecordPersistenceTypes.ts';
import {
  LOCAL_MODEL_GOVERNANCE_APPLICATION_ARTIFACT_SELECTION_BRIDGE_POLICY_REVISION,
} from './localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts';
import type {
  LocalModelGovernanceApplicationArtifactSelectionBridgeDecision,
  LocalModelGovernanceApplicationArtifactSelectionBridgeRequest,
  LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
  LocalModelGovernanceApplicationArtifactSelectionBridgeStatus,
  LocalModelGovernanceApplicationRecordVerificationResult,
} from './localModelGovernanceApplicationArtifactSelectionBridgeTypes.ts';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function blockerForStatus(
  status: LocalModelGovernanceApplicationArtifactSelectionBridgeStatus,
): string | null {
  const mapping: Record<LocalModelGovernanceApplicationArtifactSelectionBridgeStatus, string | null> = {
    'not-requested': 'governance-application-artifact-bridge-explicit-action-required',
    'invalid-expected-envelope': 'governance-application-artifact-bridge-envelope-invalid',
    'verification-not-verified': 'governance-application-artifact-bridge-verification-not-verified',
    'verification-incomplete': 'governance-application-artifact-bridge-verification-incomplete',
    'stale-application-record': 'governance-application-artifact-bridge-stale-application-record',
    'candidate-scope-mismatch': 'governance-application-artifact-bridge-candidate-scope-mismatch',
    'revision-mismatch': 'governance-application-artifact-bridge-revision-mismatch',
    'previous-decision-conflict': 'governance-application-artifact-bridge-previous-decision-conflict',
    'eligible-for-artifact-selection-review': null,
    'failed-safe': 'governance-application-artifact-bridge-failed-safe',
  };
  return mapping[status];
}

export function buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(
  expectedApplicationEnvelope: LocalModelGovernanceApplicationRecordPersistenceEnvelope,
): LocalModelGovernanceApplicationArtifactSelectionBridgeScope {
  return Object.freeze({
    candidateId: expectedApplicationEnvelope.candidateId,
    candidateTier: expectedApplicationEnvelope.candidateTier,
    observedRevision: expectedApplicationEnvelope.observedRevision,
    sourceGovernancePersistenceKey: expectedApplicationEnvelope.sourceGovernancePersistenceKey,
    canonicalRecordKey: expectedApplicationEnvelope.canonicalRecordKey,
    canonicalRecordRevision: expectedApplicationEnvelope.canonicalRecordRevision,
    canonicalOutcome: expectedApplicationEnvelope.canonicalOutcome,
    applicationDecisionKey: expectedApplicationEnvelope.applicationDecisionKey,
    applicationIdempotencyKey: expectedApplicationEnvelope.applicationIdempotencyKey,
    applicationRecordSchemaRevision: expectedApplicationEnvelope.schemaRevision,
    applicationPolicyRevision: expectedApplicationEnvelope.applicationPolicyRevision,
    artifactSelectionBridgePolicyRevision:
      LOCAL_MODEL_GOVERNANCE_APPLICATION_ARTIFACT_SELECTION_BRIDGE_POLICY_REVISION,
  });
}

export function buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey(
  scope: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
): string {
  return [
    'local-model-artifact-selection-review',
    scope.candidateId,
    scope.observedRevision,
    scope.applicationDecisionKey,
    `bridge-policy-revision-${scope.artifactSelectionBridgePolicyRevision}`,
  ].join(':');
}

function verificationInvariantsComplete(
  result: LocalModelGovernanceApplicationRecordVerificationResult,
): boolean {
  return result.status === 'verified'
    && result.explicitVerificationRequested === true
    && result.expectedEnvelopeValid === true
    && result.repositoryAvailable === true
    && result.readAttempted === true
    && result.readInvocationCount === 1
    && result.recordVisible === true
    && result.recordVerified === true
    && result.envelopeMatched === true
    && result.immutableFieldsMatched === true
    && result.actorColumnValid === true
    && result.createdAtValid === true
    && result.rawRowExposed === false
    && result.rawErrorExposed === false
    && result.applicationRecordAppliedDownstream === false
    && result.bridgeDecisionPersisted === false
    && result.artifactSelected === false
    && result.artifactApproved === false
    && result.modelApproved === false
    && result.licenseApproved === false
    && result.checksumVerified === false
    && result.benchmarkVerified === false
    && result.downloadable === false
    && result.runtimeReady === false
    && result.modelActive === false;
}

function verificationMatchesEnvelope(
  result: LocalModelGovernanceApplicationRecordVerificationResult,
  expected: LocalModelGovernanceApplicationRecordPersistenceEnvelope,
): boolean {
  return result.applicationDecisionKey === expected.applicationDecisionKey
    && result.applicationIdempotencyKey === expected.applicationIdempotencyKey
    && result.sourceGovernancePersistenceKey === expected.sourceGovernancePersistenceKey
    && result.canonicalRecordKey === expected.canonicalRecordKey
    && result.canonicalRecordRevision === expected.canonicalRecordRevision
    && result.canonicalOutcome === expected.canonicalOutcome
    && result.candidateId === expected.candidateId
    && result.candidateTier === expected.candidateTier
    && result.observedRevision === expected.observedRevision
    && result.schemaRevision === expected.schemaRevision
    && result.applicationPolicyRevision === expected.applicationPolicyRevision
    && result.applicationStatus === expected.applicationStatus
    && result.artifactSelectionReviewEligible === expected.artifactSelectionReviewEligible;
}

function candidateScopeMatches(
  current: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
  expected: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
): boolean {
  return current.candidateId === expected.candidateId
    && current.candidateTier === expected.candidateTier;
}

function revisionScopeMatches(
  current: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
  expected: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
): boolean {
  return current.observedRevision === expected.observedRevision
    && current.canonicalRecordRevision === expected.canonicalRecordRevision
    && current.applicationRecordSchemaRevision === expected.applicationRecordSchemaRevision
    && current.applicationPolicyRevision === expected.applicationPolicyRevision
    && current.artifactSelectionBridgePolicyRevision === expected.artifactSelectionBridgePolicyRevision;
}

function logicalScopeMatches(
  current: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
  expected: LocalModelGovernanceApplicationArtifactSelectionBridgeScope,
): boolean {
  return current.sourceGovernancePersistenceKey === expected.sourceGovernancePersistenceKey
    && current.canonicalRecordKey === expected.canonicalRecordKey
    && current.canonicalOutcome === expected.canonicalOutcome
    && current.applicationDecisionKey === expected.applicationDecisionKey
    && current.applicationIdempotencyKey === expected.applicationIdempotencyKey;
}

function buildDecision(
  status: LocalModelGovernanceApplicationArtifactSelectionBridgeStatus,
  options: {
    readonly explicitBridgeRequested: boolean;
    readonly expectedEnvelopeValid: boolean;
    readonly verificationAccepted?: boolean;
    readonly verificationCurrent?: boolean;
    readonly candidateScopeVerified?: boolean;
    readonly revisionScopeVerified?: boolean;
    readonly staleApplicationRecordDetected?: boolean;
    readonly previousDecisionPresent?: boolean;
    readonly replayDetected?: boolean;
    readonly scope?: LocalModelGovernanceApplicationArtifactSelectionBridgeScope | null;
    readonly bridgeDecisionKey?: string | null;
    readonly blockers?: readonly string[];
    readonly warnings?: readonly string[];
  },
): LocalModelGovernanceApplicationArtifactSelectionBridgeDecision {
  const eligible = status === 'eligible-for-artifact-selection-review';
  const scope = eligible ? options.scope ?? null : null;
  const defaultBlocker = blockerForStatus(status);
  return {
    status,
    blockers: options.blockers
      ?? (defaultBlocker === null ? Object.freeze([]) : Object.freeze([defaultBlocker])),
    warnings: options.warnings ?? Object.freeze([]),
    explicitBridgeRequested: options.explicitBridgeRequested,
    expectedEnvelopeValid: options.expectedEnvelopeValid,
    verificationAccepted: options.verificationAccepted ?? false,
    verificationCurrent: options.verificationCurrent ?? false,
    bridgeEligible: eligible,
    bridgeDecisionKey: eligible ? options.bridgeDecisionKey ?? null : null,
    previousDecisionPresent: options.previousDecisionPresent ?? false,
    replayDetected: options.replayDetected ?? false,
    staleApplicationRecordDetected: options.staleApplicationRecordDetected ?? false,
    candidateScopeVerified: options.candidateScopeVerified ?? false,
    revisionScopeVerified: options.revisionScopeVerified ?? false,
    candidateId: scope?.candidateId ?? null,
    candidateTier: scope?.candidateTier ?? null,
    observedRevision: scope?.observedRevision ?? null,
    sourceGovernancePersistenceKey: scope?.sourceGovernancePersistenceKey ?? null,
    canonicalRecordKey: scope?.canonicalRecordKey ?? null,
    canonicalRecordRevision: scope?.canonicalRecordRevision ?? null,
    canonicalOutcome: scope?.canonicalOutcome ?? null,
    applicationDecisionKey: scope?.applicationDecisionKey ?? null,
    applicationIdempotencyKey: scope?.applicationIdempotencyKey ?? null,
    applicationRecordSchemaRevision: scope?.applicationRecordSchemaRevision ?? null,
    applicationPolicyRevision: scope?.applicationPolicyRevision ?? null,
    artifactSelectionBridgePolicyRevision:
      LOCAL_MODEL_GOVERNANCE_APPLICATION_ARTIFACT_SELECTION_BRIDGE_POLICY_REVISION,
    applicationRecordVerified: eligible,
    artifactSelectionReviewEligible: eligible,
    bridgeDecisionPersisted: false,
    applicationRecordAppliedDownstream: false,
    artifactSelected: false,
    artifactApproved: false,
    modelApproved: false,
    licenseApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

function previousDecisionMatches(
  previous: LocalModelGovernanceApplicationArtifactSelectionBridgeDecision,
  current: LocalModelGovernanceApplicationArtifactSelectionBridgeDecision,
): boolean {
  return previous.status === 'eligible-for-artifact-selection-review'
    && previous.bridgeDecisionKey === current.bridgeDecisionKey
    && previous.bridgeEligible === true
    && previous.applicationRecordVerified === true
    && previous.artifactSelectionReviewEligible === true
    && previous.candidateId === current.candidateId
    && previous.candidateTier === current.candidateTier
    && previous.observedRevision === current.observedRevision
    && previous.sourceGovernancePersistenceKey === current.sourceGovernancePersistenceKey
    && previous.canonicalRecordKey === current.canonicalRecordKey
    && previous.canonicalRecordRevision === current.canonicalRecordRevision
    && previous.canonicalOutcome === current.canonicalOutcome
    && previous.applicationDecisionKey === current.applicationDecisionKey
    && previous.applicationIdempotencyKey === current.applicationIdempotencyKey
    && previous.applicationRecordSchemaRevision === current.applicationRecordSchemaRevision
    && previous.applicationPolicyRevision === current.applicationPolicyRevision
    && previous.artifactSelectionBridgePolicyRevision === current.artifactSelectionBridgePolicyRevision
    && previous.bridgeDecisionPersisted === false
    && previous.applicationRecordAppliedDownstream === false
    && previous.artifactSelected === false
    && previous.artifactApproved === false
    && previous.modelApproved === false
    && previous.licenseApproved === false
    && previous.checksumVerified === false
    && previous.benchmarkVerified === false
    && previous.downloadable === false
    && previous.runtimeReady === false
    && previous.modelActive === false;
}

export function evaluateLocalModelGovernanceApplicationArtifactSelectionBridge(
  request: LocalModelGovernanceApplicationArtifactSelectionBridgeRequest,
): LocalModelGovernanceApplicationArtifactSelectionBridgeDecision {
  try {
    if (request.explicitBridgeRequested !== true) {
      return buildDecision('not-requested', {
        explicitBridgeRequested: false,
        expectedEnvelopeValid: false,
      });
    }

    const validation = validateLocalModelGovernanceApplicationRecordPersistenceEnvelope(
      request.expectedApplicationEnvelope,
    );
    if (!validation.valid) {
      const blockers: string[] = [];
      appendUnique(blockers, 'governance-application-artifact-bridge-envelope-invalid');
      for (const issue of validation.issues) appendUnique(blockers, issue);
      return buildDecision('invalid-expected-envelope', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: false,
        blockers: Object.freeze(blockers),
      });
    }

    if (!isObject(request.verificationResult)
      || request.verificationResult.status !== 'verified') {
      return buildDecision('verification-not-verified', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
      });
    }
    if (!verificationInvariantsComplete(request.verificationResult)) {
      return buildDecision('verification-incomplete', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
      });
    }
    if (!verificationMatchesEnvelope(
      request.verificationResult,
      request.expectedApplicationEnvelope,
    )) {
      return buildDecision('stale-application-record', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
        verificationAccepted: true,
        staleApplicationRecordDetected: true,
      });
    }

    const expectedScope = buildLocalModelGovernanceApplicationArtifactSelectionBridgeScope(
      request.expectedApplicationEnvelope,
    );
    if (!isObject(request.currentScope)) {
      return buildDecision('failed-safe', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
        verificationAccepted: true,
      });
    }
    if (!candidateScopeMatches(request.currentScope, expectedScope)) {
      return buildDecision('candidate-scope-mismatch', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
        verificationAccepted: true,
      });
    }
    if (!revisionScopeMatches(request.currentScope, expectedScope)) {
      return buildDecision('revision-mismatch', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
        verificationAccepted: true,
        candidateScopeVerified: true,
        staleApplicationRecordDetected: true,
      });
    }
    if (!logicalScopeMatches(request.currentScope, expectedScope)) {
      return buildDecision('stale-application-record', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
        verificationAccepted: true,
        candidateScopeVerified: true,
        revisionScopeVerified: true,
        staleApplicationRecordDetected: true,
      });
    }

    const bridgeDecisionKey =
      buildLocalModelGovernanceApplicationArtifactSelectionBridgeDecisionKey(expectedScope);
    const eligibleDecision = buildDecision('eligible-for-artifact-selection-review', {
      explicitBridgeRequested: true,
      expectedEnvelopeValid: true,
      verificationAccepted: true,
      verificationCurrent: true,
      candidateScopeVerified: true,
      revisionScopeVerified: true,
      scope: expectedScope,
      bridgeDecisionKey,
      previousDecisionPresent: request.previousBridgeDecision !== null,
    });

    if (request.previousBridgeDecision === null) return eligibleDecision;
    if (!isObject(request.previousBridgeDecision)) {
      return buildDecision('previous-decision-conflict', {
        explicitBridgeRequested: true,
        expectedEnvelopeValid: true,
        verificationAccepted: true,
        verificationCurrent: true,
        candidateScopeVerified: true,
        revisionScopeVerified: true,
        previousDecisionPresent: true,
        replayDetected: true,
      });
    }
    if (previousDecisionMatches(request.previousBridgeDecision, eligibleDecision)) {
      return {
        ...eligibleDecision,
        previousDecisionPresent: true,
        replayDetected: true,
        warnings: Object.freeze([
          'governance-application-artifact-bridge-identical-existing-decision',
        ]),
      };
    }
    return buildDecision('previous-decision-conflict', {
      explicitBridgeRequested: true,
      expectedEnvelopeValid: true,
      verificationAccepted: true,
      verificationCurrent: true,
      candidateScopeVerified: true,
      revisionScopeVerified: true,
      previousDecisionPresent: true,
      replayDetected: true,
    });
  } catch {
    return buildDecision('failed-safe', {
      explicitBridgeRequested: false,
      expectedEnvelopeValid: false,
    });
  }
}
