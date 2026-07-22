export const LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_SCHEMA_REVISION = 1 as const;
export const LOCAL_MODEL_ARTIFACT_SELECTION_PERSISTENCE_POLICY_REVISION = 1 as const;

export interface LocalModelArtifactSelectionPersistenceEnvelope {
  readonly selectionDecisionKey: string;
  readonly selectionIdempotencyKey: string;
  readonly schemaRevision: 1;
  readonly selectionPolicyRevision: 1;
  readonly operation: 'append';
  readonly bridgeDecisionKey: string;
  readonly sourceApplicationDecisionKey: string;
  readonly sourceGovernancePersistenceKey: string;
  readonly canonicalRecordKey: string;
  readonly canonicalRecordRevision: number;
  readonly canonicalOutcome: 'finalized-proceed';
  readonly candidateId: string;
  readonly candidateTier: 'light' | 'standard' | 'pro';
  readonly observedRevision: string;
  readonly selectedOptionId: string;
  readonly selectionDecision: 'select';
  readonly selectionStatus: 'selection-recorded';
  readonly humanSelectionRecorded: true;
  readonly selectionScope: Readonly<Record<string, unknown>>;
  readonly immutable: true;
  readonly appendOnly: true;
  readonly decisionPersisted: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}

export interface LocalModelArtifactSelectionPersistenceBuildInput {
  readonly trustedDecision: unknown;
  readonly bridgeDecision: unknown;
  readonly selectionResult: unknown;
}

export interface LocalModelArtifactSelectionPersistenceValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}
