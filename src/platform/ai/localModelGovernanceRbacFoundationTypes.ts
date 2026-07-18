export type LocalModelGovernanceRbacFoundationStatus =
  | 'migration-authored-not-applied'
  | 'local-database-verified'
  | 'attention-required';

export const LOCAL_MODEL_GOVERNANCE_REVIEWER_ROLE_ID = 'model-governance-reviewer' as const;
export const LOCAL_MODEL_GOVERNANCE_DECISION_PERMISSION_ID = 'record-model-governance-decision' as const;
export const LOCAL_MODEL_GOVERNANCE_RBAC_MIGRATION_PATH =
  'supabase/migrations/20260713_create_local_model_governance_rbac.sql' as const;
export const LOCAL_MODEL_GOVERNANCE_RBAC_EXPECTED_INITIAL_ASSIGNMENTS = 0 as const;

export interface LocalModelGovernanceRbacFoundationState {
  readonly status: LocalModelGovernanceRbacFoundationStatus;
  readonly migrationAuthored: boolean;
  readonly migrationApplied: boolean;
  readonly localDatabaseVerified: boolean;
  readonly remoteDatabaseApplied: boolean;
  readonly privateSchemaAuthored: boolean;
  readonly roleCatalogAuthored: boolean;
  readonly permissionCatalogAuthored: boolean;
  readonly rolePermissionMappingAuthored: boolean;
  readonly userRoleAssignmentTableAuthored: boolean;
  readonly exactAuthorizationHelperAuthored: boolean;
  readonly rlsAuthored: boolean;
  readonly grantsRestricted: boolean;
  readonly assignmentApiConfigured: boolean;
  readonly availableGovernanceRoles: number;
  readonly availableGovernancePermissions: number;
  readonly rolePermissionMappings: number;
  readonly roleAssignmentsSeeded: number;
  readonly authorizedReviewers: number;
  readonly governanceRecordsPersisted: number;
  readonly activeModels: number;
}

export const LOCAL_MODEL_GOVERNANCE_RBAC_FOUNDATION_STATE: LocalModelGovernanceRbacFoundationState = Object.freeze({
  status: 'migration-authored-not-applied',
  migrationAuthored: true,
  migrationApplied: false,
  localDatabaseVerified: false,
  remoteDatabaseApplied: false,
  privateSchemaAuthored: true,
  roleCatalogAuthored: true,
  permissionCatalogAuthored: true,
  rolePermissionMappingAuthored: true,
  userRoleAssignmentTableAuthored: true,
  exactAuthorizationHelperAuthored: true,
  rlsAuthored: true,
  grantsRestricted: true,
  assignmentApiConfigured: false,
  availableGovernanceRoles: 1,
  availableGovernancePermissions: 1,
  rolePermissionMappings: 1,
  roleAssignmentsSeeded: LOCAL_MODEL_GOVERNANCE_RBAC_EXPECTED_INITIAL_ASSIGNMENTS,
  authorizedReviewers: 0,
  governanceRecordsPersisted: 0,
  activeModels: 0,
});
