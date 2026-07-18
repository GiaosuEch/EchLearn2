import type { LocalModelTrustedGovernanceActorContext } from './localModelGovernanceDecisionRecordTypes.ts';

export type LocalModelExternalAuthenticationOutcome =
  | 'authenticated'
  | 'unauthenticated';

export type LocalModelExternalAuthorizationOutcome =
  | 'unchecked'
  | 'denied'
  | 'granted';

export type LocalModelExternalAuthenticationSource = 'external-auth-boundary';

export interface LocalModelExternalTrustedActorAssertion {
  readonly actorSubjectId: string;
  readonly authenticationOutcome: LocalModelExternalAuthenticationOutcome;
  readonly authorizationOutcome: LocalModelExternalAuthorizationOutcome;
  readonly verifiedRoleIds: readonly string[];
  readonly verifiedPermissionIds: readonly string[];
  readonly authenticationSource: LocalModelExternalAuthenticationSource;
  readonly assertionRevision: number;
  readonly actorContextRevision: number;
}

export type LocalModelTrustedActorContextAdapterStatus =
  | 'unavailable'
  | 'unauthenticated'
  | 'unauthorized'
  | 'trusted-context-ready'
  | 'invalidated'
  | 'attention-required';

export interface LocalModelTrustedActorAssertionScope {
  readonly actorSubjectId: string;
  readonly authenticationOutcome: LocalModelExternalAuthenticationOutcome;
  readonly authorizationOutcome: LocalModelExternalAuthorizationOutcome;
  readonly canonicalVerifiedRoleIds: readonly string[];
  readonly canonicalVerifiedPermissionIds: readonly string[];
  readonly authenticationSource: LocalModelExternalAuthenticationSource;
  readonly assertionRevision: number;
  readonly actorContextRevision: number;
  readonly adapterPolicyRevision: number;
}

export interface LocalModelTrustedActorContextAdapterInput {
  readonly assertion: LocalModelExternalTrustedActorAssertion | null;
  readonly previousAssertionScope: LocalModelTrustedActorAssertionScope | null;
  readonly previouslyInvalidated: boolean;
  readonly adapterPolicyRevision: number;
}

export interface LocalModelExternalTrustedActorAssertionValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
  readonly actorSubjectValid: boolean;
}

export interface LocalModelMappedTrustedActorContextValidation {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface LocalModelTrustedActorContextAdapterResult {
  readonly status: LocalModelTrustedActorContextAdapterStatus;
  readonly assertionPresent: boolean;
  readonly authenticationReported: boolean;
  readonly authorizationReported: boolean;
  readonly actorSubjectValid: boolean;
  readonly requiredRolePresent: boolean;
  readonly requiredPermissionPresent: boolean;
  readonly assertionValid: boolean;
  readonly assertionValidForCurrentScope: boolean;
  readonly mappedTrustedActorContext: LocalModelTrustedGovernanceActorContext | null;
  readonly trustedContextReady: boolean;
  readonly canSupplyActorContextToGovernanceRecord: boolean;
  readonly canOpenGovernanceDecisionDraft: boolean;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly adapterBoundaryOnly: true;
  readonly authenticationPerformedByAdapter: false;
  readonly authorizationPerformedByAdapter: false;
  readonly credentialsRead: false;
  readonly tokensRead: false;
  readonly persisted: false;
  readonly governanceDecisionRecorded: false;
  readonly governanceRecordFinalized: false;
  readonly governanceRecordPersisted: false;
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
