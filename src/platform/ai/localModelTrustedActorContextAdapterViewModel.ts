import {
  buildLocalModelGovernanceDecisionRecordViewModel,
} from './localModelGovernanceDecisionRecordViewModel.ts';
import {
  buildCurrentLocalModelTrustedActorContextAdapterResult,
} from './localModelTrustedActorContextAdapter.ts';
import type {
  LocalModelTrustedActorContextAdapterResult,
  LocalModelTrustedActorContextAdapterStatus,
} from './localModelTrustedActorContextAdapterTypes.ts';

export interface LocalModelTrustedActorContextAdapterViewModel {
  readonly heading: string;
  readonly status: LocalModelTrustedActorContextAdapterStatus;
  readonly phaseSummary: string;
  readonly externalAuthBoundarySummary: string;
  readonly authenticationSummary: string;
  readonly authorizationSummary: string;
  readonly roleMappingSummary: string;
  readonly privacySummary: string;
  readonly governanceRecordBoundarySummary: string;
  readonly persistenceBoundarySummary: string;
  readonly aggregate: {
    readonly externalAssertionsPresent: number;
    readonly authenticatedAssertions: number;
    readonly authorizedAssertions: number;
    readonly trustedActorContextsReady: number;
    readonly governanceRecordContractsAvailable: number;
    readonly candidatesEligibleForDecisionDraft: number;
    readonly governanceDecisionItemsRecorded: number;
    readonly governanceRecordsFinalized: number;
    readonly governanceRecordsPersisted: number;
    readonly recordsAppliedDownstream: number;
    readonly approvedModels: number;
    readonly approvedLicenses: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: string;
  readonly adapterBoundaryOnly: true;
  readonly trustedActorContextsMapped: 0;
  readonly modelActive: false;
}

export function buildLocalModelTrustedActorContextAdapterViewModel(
  result: LocalModelTrustedActorContextAdapterResult = buildCurrentLocalModelTrustedActorContextAdapterResult(),
): LocalModelTrustedActorContextAdapterViewModel {
  const records = buildLocalModelGovernanceDecisionRecordViewModel();
  return {
    heading: 'External Trusted Actor Context Adapter Boundary',
    status: result.status,
    phaseSummary: 'No external authentication assertion is present',
    externalAuthBoundarySummary: 'Authentication must be performed by a future external Auth boundary',
    authenticationSummary: 'No trusted actor context has been mapped',
    authorizationSummary: 'Authorization must include the exact reviewer role and permission',
    roleMappingSummary: 'Generic admin or owner claims are not accepted',
    privacySummary: 'Sanitized assertions exclude credentials and reviewer identity fields',
    governanceRecordBoundarySummary: 'No governance decision draft has been opened · No governance record has been finalized',
    persistenceBoundarySummary: 'No governance record has been persisted · No model approved · No artifact selected · No download available · No model active · Production execution remains unavailable',
    aggregate: {
      externalAssertionsPresent: result.assertionPresent ? 1 : 0,
      authenticatedAssertions: result.authenticationReported ? 1 : 0,
      authorizedAssertions: result.authorizationReported ? 1 : 0,
      trustedActorContextsReady: result.trustedContextReady ? 1 : 0,
      governanceRecordContractsAvailable: records.aggregate.recordContractsAvailable,
      candidatesEligibleForDecisionDraft: result.canOpenGovernanceDecisionDraft ? records.aggregate.recordContractsAvailable : 0,
      governanceDecisionItemsRecorded: records.aggregate.explicitDecisionItemsRecorded,
      governanceRecordsFinalized: records.aggregate.finalizedRecords,
      governanceRecordsPersisted: records.recordsPersisted,
      recordsAppliedDownstream: records.aggregate.recordsAppliedToArtifactSelection,
      approvedModels: records.aggregate.approvedModels,
      approvedLicenses: records.aggregate.approvedLicenses,
      selectedArtifacts: records.aggregate.selectedArtifacts,
      approvedArtifacts: records.aggregate.approvedArtifacts,
      downloadableArtifacts: records.aggregate.downloadableArtifacts,
      runtimeReadyArtifacts: records.aggregate.runtimeReadyArtifacts,
      activeModels: records.aggregate.activeModels,
    },
    blockers: [...result.blockers],
    warnings: [...result.warnings],
    documentPath: 'docs/ai/phase-6-external-trusted-actor-context-adapter.md',
    adapterBoundaryOnly: true,
    trustedActorContextsMapped: 0,
    modelActive: false,
  };
}
