import {
  LOCAL_MODEL_GOVERNANCE_DECISION_PERMISSION_ID,
  LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE,
  LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH,
  LOCAL_MODEL_GOVERNANCE_REVIEWER_ROLE_ID,
  type LocalModelGovernanceRbacFoundationStatus,
} from './localModelGovernanceRbacFoundationTypes.ts';

export interface LocalModelGovernanceRbacFoundationViewModel {
  readonly heading: string;
  readonly phaseSummary: string;
  readonly migrationSummary: string;
  readonly roleCatalogSummary: string;
  readonly permissionCatalogSummary: string;
  readonly assignmentBoundarySummary: string;
  readonly authorizationHelperSummary: string;
  readonly rlsSummary: string;
  readonly grantSummary: string;
  readonly databaseVerificationSummary: string;
  readonly phase65EntrySummary: string;
  readonly documentPath: string;
  readonly migrationPath: string;
  readonly status: LocalModelGovernanceRbacFoundationStatus;
  readonly aggregate: {
    readonly availableGovernanceRoles: number;
    readonly availableGovernancePermissions: number;
    readonly rolePermissionMappings: number;
    readonly roleAssignmentsSeeded: number;
    readonly authorizedReviewers: number;
    readonly governanceRecordsPersisted: number;
    readonly activeModels: number;
  };
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly rbacFoundationOnly: true;
  readonly migrationApplied: false;
  readonly localDatabaseVerified: false;
  readonly assignmentApiConfigured: false;
  readonly authorizedReviewers: 0;
  readonly governanceRecordsPersisted: 0;
  readonly activeModels: 0;
}

export function buildLocalModelGovernanceRbacFoundationViewModel(): LocalModelGovernanceRbacFoundationViewModel {
  const state = LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE;
  return {
    heading: 'Server-Authoritative Governance RBAC Foundation',
    phaseSummary: 'Database-backed governance authorization is defined as a source boundary only.',
    migrationSummary: 'Governance RBAC migration is authored but not applied by the app.',
    roleCatalogSummary: `Exact reviewer role catalog is defined: ${LOCAL_MODEL_GOVERNANCE_REVIEWER_ROLE_ID}.`,
    permissionCatalogSummary: `Exact governance permission catalog is defined: ${LOCAL_MODEL_GOVERNANCE_DECISION_PERMISSION_ID}.`,
    assignmentBoundarySummary: 'No user has been assigned the reviewer role. Ordinary users cannot self-assign governance access.',
    authorizationHelperSummary: 'Authorization is evaluated server-side with auth.uid() and the exact role-permission mapping.',
    rlsSummary: 'Private RBAC tables use forced row-level security with no client policies.',
    grantSummary: 'Client table privileges are revoked and no role-assignment API is configured.',
    databaseVerificationSummary: 'Local database verification has not run.',
    phase65EntrySummary: 'Phase 6.5 governance persistence remains blocked until RBAC is verified.',
    documentPath: 'docs/ai/phase-6-governance-rbac-foundation.md',
    migrationPath: LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH,
    status: state.status,
    aggregate: {
      availableGovernanceRoles: state.availableGovernanceRoles,
      availableGovernancePermissions: state.availableGovernancePermissions,
      rolePermissionMappings: state.rolePermissionMappings,
      roleAssignmentsSeeded: state.roleAssignmentsSeeded,
      authorizedReviewers: state.authorizedReviewers,
      governanceRecordsPersisted: state.governanceRecordsPersisted,
      activeModels: state.activeModels,
    },
    blockers: Object.freeze(['rbac-migration-not-applied','local-database-not-verified','phase-6-5-remains-blocked']),
    warnings: Object.freeze(['no-production-reviewer-assignment','no-assignment-management-api']),
    rbacFoundationOnly: true,
    migrationApplied: false,
    localDatabaseVerified: false,
    assignmentApiConfigured: false,
    authorizedReviewers: 0,
    governanceRecordsPersisted: 0,
    activeModels: 0,
  };
}
