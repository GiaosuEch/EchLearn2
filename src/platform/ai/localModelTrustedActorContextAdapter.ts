import {
  LOCAL_MODEL_TRUSTED_GOVERNANCE_ACTOR_CONTEXT_REVISION,
} from './localModelGovernanceDecisionRecordPolicy.ts';
import type {
  LocalModelTrustedGovernanceActorContext,
} from './localModelGovernanceDecisionRecordTypes.ts';
import type {
  LocalModelExternalTrustedActorAssertion,
  LocalModelExternalTrustedActorAssertionValidation,
  LocalModelMappedTrustedActorContextValidation,
  LocalModelTrustedActorAssertionScope,
  LocalModelTrustedActorContextAdapterInput,
  LocalModelTrustedActorContextAdapterResult,
} from './localModelTrustedActorContextAdapterTypes.ts';

export const LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION = 1;
export const LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION = 1;
export const LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE = 'model-governance-reviewer';
export const LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION = 'record-model-governance-decision';

const MAX_ACTOR_SUBJECT_LENGTH = 128;
const MIN_ACTOR_SUBJECT_LENGTH = 8;
const MAX_ASSERTION_ITEMS = 32;
const MAX_ASSERTION_ITEM_LENGTH = 128;
const ASSERTION_KEYS = [
  'actorSubjectId',
  'authenticationOutcome',
  'authorizationOutcome',
  'verifiedRoleIds',
  'verifiedPermissionIds',
  'authenticationSource',
  'assertionRevision',
  'actorContextRevision',
] as const;
const MAPPED_CONTEXT_KEYS = [
  'actorSubjectId',
  'actorRole',
  'authenticated',
  'authorizationVerified',
  'authorizationScope',
  'authenticationSource',
  'actorContextRevision',
] as const;

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function isSafeOpaqueActorSubject(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= MIN_ACTOR_SUBJECT_LENGTH
    && value.length <= MAX_ACTOR_SUBJECT_LENGTH
    && value === value.trim()
    && !value.includes('@')
    && !/\s/.test(value)
    && /^[A-Za-z0-9._:-]+$/.test(value);
}

function validateStringArray(value: unknown, issuePrefix: string): readonly string[] {
  const issues: string[] = [];
  if (!Array.isArray(value)) return [`${issuePrefix}-array-invalid`];
  if (value.length > MAX_ASSERTION_ITEMS) appendUnique(issues, `${issuePrefix}-array-too-large`);
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') {
      appendUnique(issues, `${issuePrefix}-item-invalid`);
      continue;
    }
    if (
      item.length === 0
      || item.length > MAX_ASSERTION_ITEM_LENGTH
      || item !== item.trim()
      || !/^[A-Za-z0-9._:-]+$/.test(item)
    ) {
      appendUnique(issues, `${issuePrefix}-item-invalid`);
      continue;
    }
    if (seen.has(item)) appendUnique(issues, `${issuePrefix}-duplicate`);
    seen.add(item);
  }
  return issues;
}

function canonicalCopy(values: readonly string[]): readonly string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameStringArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function validateExternalTrustedActorAssertion(
  assertion: unknown,
): LocalModelExternalTrustedActorAssertionValidation {
  const issues: string[] = [];
  if (!isRecord(assertion)) {
    return { valid: false, issues: ['assertion-object-invalid'], actorSubjectValid: false };
  }
  if (!hasOnlyAllowedKeys(assertion, ASSERTION_KEYS)) appendUnique(issues, 'unexpected-assertion-field');

  const actorSubjectValid = isSafeOpaqueActorSubject(assertion.actorSubjectId);
  if (!actorSubjectValid) appendUnique(issues, 'actor-subject-invalid');
  if (!['authenticated', 'unauthenticated'].includes(String(assertion.authenticationOutcome))) {
    appendUnique(issues, 'authentication-outcome-invalid');
  }
  if (!['unchecked', 'denied', 'granted'].includes(String(assertion.authorizationOutcome))) {
    appendUnique(issues, 'authorization-outcome-invalid');
  }
  for (const issue of validateStringArray(assertion.verifiedRoleIds, 'verified-role')) appendUnique(issues, issue);
  for (const issue of validateStringArray(assertion.verifiedPermissionIds, 'verified-permission')) appendUnique(issues, issue);
  if (assertion.authenticationSource !== 'external-auth-boundary') {
    appendUnique(issues, 'authentication-source-invalid');
  }
  if (assertion.assertionRevision !== LOCAL_MODEL_EXTERNAL_AUTH_ASSERTION_REVISION) {
    appendUnique(issues, 'assertion-revision-mismatch');
  }
  if (assertion.actorContextRevision !== LOCAL_MODEL_TRUSTED_GOVERNANCE_ACTOR_CONTEXT_REVISION) {
    appendUnique(issues, 'actor-context-revision-mismatch');
  }
  if (assertion.authenticationOutcome === 'unauthenticated' && assertion.authorizationOutcome === 'granted') {
    appendUnique(issues, 'authentication-authorization-contradiction');
  }
  return { valid: issues.length === 0, issues, actorSubjectValid };
}

export function buildLocalModelTrustedActorAssertionScope(
  assertion: LocalModelExternalTrustedActorAssertion,
  adapterPolicyRevision = LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
): LocalModelTrustedActorAssertionScope {
  return {
    actorSubjectId: assertion.actorSubjectId,
    authenticationOutcome: assertion.authenticationOutcome,
    authorizationOutcome: assertion.authorizationOutcome,
    canonicalVerifiedRoleIds: canonicalCopy(assertion.verifiedRoleIds),
    canonicalVerifiedPermissionIds: canonicalCopy(assertion.verifiedPermissionIds),
    authenticationSource: assertion.authenticationSource,
    assertionRevision: assertion.assertionRevision,
    actorContextRevision: assertion.actorContextRevision,
    adapterPolicyRevision,
  };
}

export function isSameLocalModelTrustedActorAssertionScope(
  left: LocalModelTrustedActorAssertionScope,
  right: LocalModelTrustedActorAssertionScope,
): boolean {
  return left.actorSubjectId === right.actorSubjectId
    && left.authenticationOutcome === right.authenticationOutcome
    && left.authorizationOutcome === right.authorizationOutcome
    && sameStringArray(canonicalCopy(left.canonicalVerifiedRoleIds), canonicalCopy(right.canonicalVerifiedRoleIds))
    && sameStringArray(canonicalCopy(left.canonicalVerifiedPermissionIds), canonicalCopy(right.canonicalVerifiedPermissionIds))
    && left.authenticationSource === right.authenticationSource
    && left.assertionRevision === right.assertionRevision
    && left.actorContextRevision === right.actorContextRevision
    && left.adapterPolicyRevision === right.adapterPolicyRevision;
}

export function validateMappedTrustedActorContextCompatibility(
  context: unknown,
): LocalModelMappedTrustedActorContextValidation {
  const issues: string[] = [];
  if (!isRecord(context)) return { valid: false, issues: ['mapped-context-object-invalid'] };
  if (!hasOnlyAllowedKeys(context, MAPPED_CONTEXT_KEYS)) appendUnique(issues, 'mapped-context-field-invalid');
  if (!isSafeOpaqueActorSubject(context.actorSubjectId)) appendUnique(issues, 'mapped-context-subject-invalid');
  if (context.actorRole !== LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE) appendUnique(issues, 'mapped-context-role-invalid');
  if (context.authenticated !== true) appendUnique(issues, 'mapped-context-authentication-invalid');
  if (context.authorizationVerified !== true) appendUnique(issues, 'mapped-context-authorization-invalid');
  if (context.authorizationScope !== LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION) {
    appendUnique(issues, 'mapped-context-permission-invalid');
  }
  if (context.authenticationSource !== 'external-auth-boundary') appendUnique(issues, 'mapped-context-source-invalid');
  if (context.actorContextRevision !== LOCAL_MODEL_TRUSTED_GOVERNANCE_ACTOR_CONTEXT_REVISION) {
    appendUnique(issues, 'mapped-context-revision-invalid');
  }
  return { valid: issues.length === 0, issues };
}

export function mapExternalAssertionToTrustedActorContext(
  assertion: LocalModelExternalTrustedActorAssertion,
): LocalModelTrustedGovernanceActorContext | null {
  const validation = validateExternalTrustedActorAssertion(assertion);
  if (!validation.valid) return null;
  if (assertion.authenticationOutcome !== 'authenticated' || assertion.authorizationOutcome !== 'granted') return null;
  if (!assertion.verifiedRoleIds.includes(LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE)) return null;
  if (!assertion.verifiedPermissionIds.includes(LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION)) return null;
  return {
    actorSubjectId: assertion.actorSubjectId,
    actorRole: LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE,
    authenticated: true,
    authorizationVerified: true,
    authorizationScope: LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION,
    authenticationSource: 'external-auth-boundary',
    actorContextRevision: LOCAL_MODEL_TRUSTED_GOVERNANCE_ACTOR_CONTEXT_REVISION,
  };
}

function baseResult(
  status: LocalModelTrustedActorContextAdapterResult['status'],
  fields: Partial<LocalModelTrustedActorContextAdapterResult> = {},
): LocalModelTrustedActorContextAdapterResult {
  return {
    status,
    assertionPresent: false,
    authenticationReported: false,
    authorizationReported: false,
    actorSubjectValid: false,
    requiredRolePresent: false,
    requiredPermissionPresent: false,
    assertionValid: false,
    assertionValidForCurrentScope: false,
    mappedTrustedActorContext: null,
    trustedContextReady: false,
    canSupplyActorContextToGovernanceRecord: false,
    canOpenGovernanceDecisionDraft: false,
    blockers: [],
    warnings: ['Authentication and authorization remain owned by an external boundary.'],
    adapterBoundaryOnly: true,
    authenticationPerformedByAdapter: false,
    authorizationPerformedByAdapter: false,
    credentialsRead: false,
    tokensRead: false,
    persisted: false,
    governanceDecisionRecorded: false,
    governanceRecordFinalized: false,
    governanceRecordPersisted: false,
    recordAppliedDownstream: false,
    modelApproved: false,
    licenseApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
    ...fields,
  };
}

export function evaluateLocalModelTrustedActorContextAdapter(
  input: LocalModelTrustedActorContextAdapterInput,
): LocalModelTrustedActorContextAdapterResult {
  if (input.assertion === null) {
    if (input.previouslyInvalidated || input.previousAssertionScope !== null
      || input.adapterPolicyRevision !== LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION) {
      return baseResult('invalidated', { blockers: ['assertion-scope-invalidated'] });
    }
    return baseResult('unavailable', { blockers: ['external-assertion-unavailable'] });
  }

  const validation = validateExternalTrustedActorAssertion(input.assertion);
  const assertion = input.assertion;
  const authenticationReported = assertion.authenticationOutcome === 'authenticated';
  const authorizationReported = assertion.authorizationOutcome === 'granted';
  const requiredRolePresent = Array.isArray(assertion.verifiedRoleIds)
    && assertion.verifiedRoleIds.includes(LOCAL_MODEL_REQUIRED_GOVERNANCE_ROLE);
  const requiredPermissionPresent = Array.isArray(assertion.verifiedPermissionIds)
    && assertion.verifiedPermissionIds.includes(LOCAL_MODEL_REQUIRED_GOVERNANCE_PERMISSION);
  const common = {
    assertionPresent: true,
    authenticationReported,
    authorizationReported,
    actorSubjectValid: validation.actorSubjectValid,
    requiredRolePresent,
    requiredPermissionPresent,
    assertionValid: validation.valid,
  };

  if (!validation.valid) {
    return baseResult('attention-required', { ...common, blockers: [...validation.issues] });
  }

  const currentScope = buildLocalModelTrustedActorAssertionScope(assertion, input.adapterPolicyRevision);
  const scopeInvalid = input.previouslyInvalidated
    || input.adapterPolicyRevision !== LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION
    || (input.previousAssertionScope !== null
      && !isSameLocalModelTrustedActorAssertionScope(input.previousAssertionScope, currentScope));
  if (scopeInvalid) {
    return baseResult('invalidated', {
      ...common,
      assertionValidForCurrentScope: false,
      blockers: ['assertion-scope-invalidated'],
    });
  }

  if (assertion.authenticationOutcome === 'unauthenticated') {
    return baseResult('unauthenticated', {
      ...common,
      assertionValidForCurrentScope: true,
      blockers: ['external-authentication-not-reported'],
    });
  }

  if (assertion.authorizationOutcome !== 'granted' || !requiredRolePresent || !requiredPermissionPresent) {
    const blockers: string[] = ['external-authorization-not-sufficient'];
    if (!requiredRolePresent) appendUnique(blockers, 'required-reviewer-role-missing');
    if (!requiredPermissionPresent) appendUnique(blockers, 'required-governance-permission-missing');
    return baseResult('unauthorized', {
      ...common,
      assertionValidForCurrentScope: true,
      blockers,
    });
  }

  const mappedTrustedActorContext = mapExternalAssertionToTrustedActorContext(assertion);
  const compatibility = validateMappedTrustedActorContextCompatibility(mappedTrustedActorContext);
  if (!mappedTrustedActorContext || !compatibility.valid) {
    return baseResult('attention-required', {
      ...common,
      assertionValidForCurrentScope: true,
      blockers: [...compatibility.issues],
    });
  }

  return baseResult('trusted-context-ready', {
    ...common,
    assertionValidForCurrentScope: true,
    mappedTrustedActorContext,
    trustedContextReady: true,
    canSupplyActorContextToGovernanceRecord: true,
    canOpenGovernanceDecisionDraft: true,
    blockers: [],
  });
}

export function buildCurrentLocalModelTrustedActorContextAdapterResult(): LocalModelTrustedActorContextAdapterResult {
  return evaluateLocalModelTrustedActorContextAdapter({
    assertion: null,
    previousAssertionScope: null,
    previouslyInvalidated: false,
    adapterPolicyRevision: LOCAL_MODEL_TRUSTED_ACTOR_CONTEXT_ADAPTER_POLICY_REVISION,
  });
}
