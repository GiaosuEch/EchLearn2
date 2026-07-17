import type { LocalModelApprovalTier } from './localModelApprovalTypes.ts';
import type {
  LocalModelAcquisitionConfirmationStatus,
  LocalModelAcquisitionPreflightInput,
  LocalModelAcquisitionPreflightResult,
  LocalModelAcquisitionPreflightStatus,
} from './localModelAcquisitionTypes.ts';

export type LocalModelAcquisitionConsentState =
  | 'unavailable'
  | 'awaiting-user-decision'
  | 'confirmed'
  | 'declined'
  | 'invalidated';

export type LocalModelAcquisitionDisclosureFieldId =
  | 'candidate-id'
  | 'candidate-tier'
  | 'artifact-candidate-id'
  | 'model-class-label'
  | 'estimated-download-size'
  | 'expected-storage-impact'
  | 'connection-requirement'
  | 'battery-requirement'
  | 'local-processing-statement'
  | 'cloud-processing-statement'
  | 'cache-removal-statement'
  | 'confirmation-meaning'
  | 'disclosure-revision';

export interface LocalModelAcquisitionConsentScope {
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelApprovalTier | null;
  readonly artifactCandidateId: string | null;
  readonly estimatedDownloadSizeMb: number | null;
  readonly expectedStorageImpactMb: number | null;
  readonly disclosureRevision: number;
}

export interface BuildLocalModelAcquisitionDisclosureInput {
  readonly candidateId: string | null;
  readonly candidateTier: LocalModelApprovalTier | null;
  readonly artifactCandidateId: string | null;
  readonly modelClassLabel: string | null;
  readonly estimatedDownloadSizeMb: number | null;
  readonly expectedStorageImpactMb: number | null;
  readonly connectionRequirement: string;
  readonly batteryRequirement: string;
  readonly localProcessingStatement: string;
  readonly cloudProcessingStatement: string;
  readonly cacheRemovalStatement: string;
  readonly confirmationMeaning: string;
  readonly disclosureRevision?: number;
}

export interface LocalModelAcquisitionDisclosure
  extends LocalModelAcquisitionConsentScope {
  readonly modelClassLabel: string | null;
  readonly connectionRequirement: string;
  readonly batteryRequirement: string;
  readonly localProcessingStatement: string;
  readonly cloudProcessingStatement: string;
  readonly cacheRemovalStatement: string;
  readonly confirmationMeaning: string;
  readonly disclosureComplete: boolean;
  readonly missingDisclosureFields: readonly LocalModelAcquisitionDisclosureFieldId[];
  readonly policyOnly: true;
  readonly downloadStarted: false;
  readonly modelActive: false;
}

export interface LocalModelAcquisitionConsentPreflightSnapshot {
  readonly status: LocalModelAcquisitionPreflightStatus;
  readonly blockers: LocalModelAcquisitionPreflightResult['blockers'];
  readonly canOfferUserConfirmation: boolean;
}

export interface LocalModelAcquisitionConsentPolicyInput {
  readonly preflight: LocalModelAcquisitionConsentPreflightSnapshot;
  readonly disclosure: LocalModelAcquisitionDisclosure;
}

export type LocalModelAcquisitionConsentEvent =
  | { readonly type: 'confirm' }
  | { readonly type: 'decline' }
  | { readonly type: 'reset' }
  | {
      readonly type: 'scope-changed';
      readonly scope: LocalModelAcquisitionConsentScope;
    };

export interface LocalModelAcquisitionConsentSession {
  readonly state: LocalModelAcquisitionConsentState;
  readonly scope: LocalModelAcquisitionConsentScope;
  readonly disclosure: LocalModelAcquisitionDisclosure;
  readonly confirmationStatusForPreflight: LocalModelAcquisitionConfirmationStatus;
  readonly canConfirm: boolean;
  readonly canDecline: boolean;
  readonly canReset: boolean;
  readonly consentRecorded: boolean;
  readonly consentValidForCurrentScope: boolean;
  readonly reasons: readonly string[];
  readonly warnings: readonly string[];
  readonly policyOnly: true;
  readonly downloadAuthorizedForExecution: false;
  readonly downloadStarted: false;
  readonly cacheWritten: false;
  readonly runtimeInitialized: false;
  readonly modelReady: false;
  readonly modelActive: false;
}

export interface BuildLocalModelAcquisitionConsentDecisionViewModelInput {
  readonly preflightInput: LocalModelAcquisitionPreflightInput;
  readonly disclosure: LocalModelAcquisitionDisclosure;
  readonly event?: LocalModelAcquisitionConsentEvent;
}
