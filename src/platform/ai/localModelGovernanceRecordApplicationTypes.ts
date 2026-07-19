import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceRecordPersistenceCanonicalOutcome,
  LocalModelGovernanceRecordPersistenceEnvelope,
} from './localModelGovernanceRecordPersistenceTypes.ts';
import type {
  LocalModelGovernancePersistedRecordVerificationResult,
} from './localModelGovernancePersistedRecordVerificationTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_RECORD_APPLICATION_POLICY_REVISION = 1;

export type LocalModelGovernanceRecordApplicationStatus =
  | 'not-requested'
  | 'invalid-expected-envelope'
  | 'verification-not-verified'
  | 'verification-incomplete'
  | 'verification-envelope-mismatch'
  | 'stale-verification'
  | 'candidate-scope-mismatch'
  | 'model-identity-mismatch'
  | 'revision-mismatch'
  | 'outcome-rejected'
  | 'more-evidence-required'
  | 'previous-decision-conflict'
  | 'eligible-for-downstream-review'
  | 'failed-safe';

export interface LocalModelGovernanceRecordApplicationScope {
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string;
  readonly observedRevision: string | null;
  readonly evidenceClosureRevision: number;
  readonly governanceDecisionPolicyRevision: number;
  readonly governanceDecisionRecordPolicyRevision: number;
  readonly governanceApplicationPolicyRevision: number;
  readonly canonicalRecordRevision: number;
  readonly persistenceKey: string;
  readonly canonicalRecordKey: string;
  readonly canonicalOutcome: LocalModelGovernanceRecordPersistenceCanonicalOutcome;
}

export interface LocalModelGovernanceRecordApplicationRequest {
  readonly expectedEnvelope: LocalModelGovernanceRecordPersistenceEnvelope;
  readonly verificationResult: LocalModelGovernancePersistedRecordVerificationResult;
  readonly currentScope: LocalModelGovernanceRecordApplicationScope;
  readonly explicitApplicationRequested: boolean;
  readonly previousApplicationDecision: LocalModelGovernanceRecordApplicationDecision | null;
}

export interface LocalModelGovernanceRecordApplicationDecision {
  readonly status: LocalModelGovernanceRecordApplicationStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitApplicationRequested: boolean;
  readonly expectedEnvelopeValid: boolean;
  readonly verificationAccepted: boolean;
  readonly verificationCurrent: boolean;
  readonly applicationEligible: boolean;
  readonly applicationDecisionKey: string | null;
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelApprovalTier | null;
  readonly persistenceKey: string | null;
  readonly canonicalRecordKey: string | null;
  readonly canonicalOutcome: LocalModelGovernanceRecordPersistenceCanonicalOutcome | null;
  readonly canonicalRecordRevision: number | null;
  readonly applicationPolicyRevision: number;
  readonly previousDecisionPresent: boolean;
  readonly replayDetected: boolean;
  readonly staleVerificationDetected: boolean;
  readonly candidateScopeVerified: boolean;
  readonly modelIdentityVerified: boolean;
  readonly revisionScopeVerified: boolean;
  readonly outcomeEligible: boolean;
  readonly applicationRecordPersisted: false;
  readonly recordAppliedDownstream: false;
  readonly artifactSelectionReviewEligible: boolean;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}
