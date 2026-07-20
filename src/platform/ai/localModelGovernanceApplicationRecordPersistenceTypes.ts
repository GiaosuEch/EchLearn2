import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelGovernanceRecordApplicationDecision,
} from './localModelGovernanceRecordApplicationTypes.ts';

export const LOCAL_MODEL_GOVERNANCE_APPLICATION_RECORD_SCHEMA_REVISION = 1;
export const LOCAL_MODEL_GOVERNANCE_APPLICATION_PERMISSION_ID =
  'record-model-governance-application';
export const LOCAL_MODEL_GOVERNANCE_APPLICATION_ROLE_ID =
  'model-governance-reviewer';
export const LOCAL_MODEL_GOVERNANCE_APPLICATION_APPEND_RPC_NAME =
  'append_local_model_governance_application_record';

export type LocalModelGovernanceApplicationRecordPersistenceOperation = 'append';

export interface LocalModelGovernanceApplicationRecordPersistenceEnvelope {
  readonly applicationDecisionKey: string;
  readonly applicationIdempotencyKey: string;
  readonly schemaRevision: 1;
  readonly applicationPolicyRevision: number;
  readonly operation: LocalModelGovernanceApplicationRecordPersistenceOperation;
  readonly sourceGovernancePersistenceKey: string;
  readonly canonicalRecordKey: string;
  readonly canonicalRecordRevision: number;
  readonly canonicalOutcome: 'finalized-proceed';
  readonly candidateId: string;
  readonly candidateTier: LocalModelApprovalTier;
  readonly observedRevision: string;
  readonly applicationStatus: 'eligible-for-downstream-review';
  readonly artifactSelectionReviewEligible: true;
  readonly immutable: true;
  readonly appendOnly: true;
  readonly applicationRecordPersisted: false;
  readonly recordAppliedDownstream: false;
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

export interface LocalModelGovernanceApplicationRecordPersistenceValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelGovernanceApplicationRecordPersistenceBuildResult
  extends LocalModelGovernanceApplicationRecordPersistenceValidation {
  readonly envelope: LocalModelGovernanceApplicationRecordPersistenceEnvelope | null;
}

export type LocalModelGovernanceApplicationRecordPersistenceSourceDecision =
  LocalModelGovernanceRecordApplicationDecision;
