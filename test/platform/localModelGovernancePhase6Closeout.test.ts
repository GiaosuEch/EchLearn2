import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS,
  LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION,
} from '../../src/platform/ai/localModelGovernancePhase6CloseoutTypes.ts';
import type {
  LocalModelGovernancePhase6BoundaryInventoryItem,
  LocalModelGovernancePhase6CloseoutInput,
} from '../../src/platform/ai/localModelGovernancePhase6CloseoutTypes.ts';
import {
  buildLocalModelGovernancePhase6BoundaryInventory,
  buildLocalModelGovernancePhase6CloseoutInput,
  evaluateLocalModelGovernancePhase6Closeout,
} from '../../src/platform/ai/localModelGovernancePhase6CloseoutPolicy.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

function cloneInput(): LocalModelGovernancePhase6CloseoutInput {
  return structuredClone(buildLocalModelGovernancePhase6CloseoutInput());
}

function replaceBoundary(
  input: LocalModelGovernancePhase6CloseoutInput,
  phaseId: LocalModelGovernancePhase6BoundaryInventoryItem['phaseId'],
  overrides: Partial<LocalModelGovernancePhase6BoundaryInventoryItem>,
): LocalModelGovernancePhase6CloseoutInput {
  return {
    ...input,
    boundaries: input.boundaries.map((item) => item.phaseId === phaseId ? { ...item, ...overrides } : item),
  };
}

const GLOBAL_COUNTERS = [
  'automaticWrites',
  'automaticReads',
  'automaticApplications',
  'productionPersistenceAttempts',
  'productionVerificationAttempts',
  'productionApplicationAttempts',
  'appClaimedPersistedRecords',
  'appClaimedVerifiedRecords',
  'persistedApplicationDecisions',
  'recordsAppliedDownstream',
  'artifactSelectionReviewsEligible',
  'selectedArtifacts',
  'approvedArtifacts',
  'approvedModels',
  'approvedLicenses',
  'checksumsVerified',
  'benchmarksPassed',
  'downloadableArtifacts',
  'runtimeReadyArtifacts',
  'activeModels',
] as const;

describe('Phase 6.9 governance persistence and application safety closeout', () => {
  it('builds an exact deterministic nine-boundary inventory and closes the current static source snapshot', () => {
    const inventory = buildLocalModelGovernancePhase6BoundaryInventory();
    assert.equal(inventory.length, 9);
    assert.deepEqual(inventory.map((item) => item.phaseId), [...LOCAL_MODEL_GOVERNANCE_PHASE_6_BOUNDARY_IDS]);
    assert.equal(new Set(inventory.map((item) => item.phaseId)).size, 9);
    for (const item of inventory) {
      assert.equal(item.boundaryAuthored, true);
      assert.equal(item.sourceContractPresent, true);
      assert.equal(item.testsRegistered, true);
      assert.equal(item.automaticActions, 0);
      assert.equal(item.productionAttempts, 0);
      assert.equal(item.downstreamMutations, 0);
      assert.equal(item.approvals, 0);
      assert.equal(item.activeModels, 0);
    }

    const result = evaluateLocalModelGovernancePhase6Closeout(buildLocalModelGovernancePhase6CloseoutInput());
    assert.equal(result.status, 'governance-phase-6-closed');
    assert.equal(result.closeoutPolicyRevision, LOCAL_MODEL_GOVERNANCE_PHASE_6_CLOSEOUT_POLICY_REVISION);
    assert.equal(result.boundaryCount, 9);
    assert.equal(result.completedBoundaryCount, 9);
    assert.equal(result.allBoundariesAuthored, true);
    assert.equal(result.allSourceContractsPresent, true);
    assert.equal(result.allTestsRegistered, true);
    assert.equal(result.serverAuthorityVerifiedByContract, true);
    assert.equal(result.automationClosed, true);
    assert.equal(result.productionClaimsClosed, true);
    assert.equal(result.downstreamStateClosed, true);
    assert.equal(result.phase6Closed, true);
    assert.equal(result.phase7DesignEntryEligible, true);
    assert.equal(result.productionGovernanceFlowExecuted, false);
    assert.equal(result.productionRecordPersisted, false);
    assert.equal(result.productionRecordVerified, false);
    assert.equal(result.productionApplicationDecisionPersisted, false);
    assert.equal(result.productionRecordAppliedDownstream, false);
    assert.equal(result.artifactSelected, false);
    assert.equal(result.artifactApproved, false);
    assert.equal(result.modelApproved, false);
    assert.equal(result.licenseApproved, false);
    assert.equal(result.checksumVerified, false);
    assert.equal(result.benchmarkVerified, false);
    assert.equal(result.downloadable, false);
    assert.equal(result.runtimeReady, false);
    assert.equal(result.modelActive, false);
    assert.deepEqual(result.warnings, [
      'phase-7-requires-separate-authoritative-application-persistence',
      'phase-7-requires-separate-explicit-artifact-selection',
      'no-production-governance-flow-executed',
      'no-model-active',
    ]);
  });

  it('is order-independent, deterministic, and does not mutate input', () => {
    const input = cloneInput();
    const snapshot = structuredClone(input);
    const reversed = { ...input, boundaries: [...input.boundaries].reverse() };
    const first = evaluateLocalModelGovernancePhase6Closeout(input);
    const second = evaluateLocalModelGovernancePhase6Closeout(reversed);
    assert.deepEqual(first, second);
    assert.deepEqual(input, snapshot);
    assert.deepEqual(
      evaluateLocalModelGovernancePhase6Closeout(input),
      evaluateLocalModelGovernancePhase6Closeout(input),
    );
    assert.equal(JSON.stringify(first).includes(JSON.stringify(input)), false);
  });

  it('rejects missing, unknown, duplicate, extra, malformed, or incomplete boundary contracts', () => {
    const base = cloneInput();
    const cases: LocalModelGovernancePhase6CloseoutInput[] = [
      { ...base, boundaries: base.boundaries.slice(1) },
      { ...base, boundaries: [...base.boundaries.slice(0, -1), { ...base.boundaries[0]!, phaseId: 'phase-6.99-unknown' as never }] },
      { ...base, boundaries: [...base.boundaries.slice(0, -1), { ...base.boundaries[0]! }] },
      { ...base, boundaries: [...base.boundaries, { ...base.boundaries[0]! }] },
      replaceBoundary(base, base.boundaries[0]!.phaseId, { boundaryAuthored: false }),
      replaceBoundary(base, base.boundaries[1]!.phaseId, { sourceContractPresent: false }),
      replaceBoundary(base, base.boundaries[2]!.phaseId, { testsRegistered: false }),
    ];
    for (const input of cases) {
      const result = evaluateLocalModelGovernancePhase6Closeout(input);
      assert.equal(result.status, 'phase-contract-incomplete');
      assert.equal(result.phase6Closed, false);
      assert.equal(result.phase7DesignEntryEligible, false);
    }
  });

  it('fails closed when server-authoritative governance controls are incomplete or bypassed', () => {
    const base = cloneInput();
    const cases: Array<[keyof LocalModelGovernancePhase6CloseoutInput, unknown, string]> = [
      ['serverAuthoritativeRbac', false, 'phase-6-closeout-server-authority-incomplete'],
      ['forcedRls', false, 'phase-6-closeout-server-authority-incomplete'],
      ['appendOnlyPersistence', false, 'phase-6-closeout-server-authority-incomplete'],
      ['exactPersistenceEnvelopeRequired', false, 'phase-6-closeout-server-authority-incomplete'],
      ['clientRoleTrusted', true, 'phase-6-closeout-client-role-trust-detected'],
      ['genericAdminBypassAllowed', true, 'phase-6-closeout-generic-admin-bypass-detected'],
      ['serviceCredentialPresent', true, 'phase-6-closeout-service-credential-detected'],
    ];
    for (const [field, value, blocker] of cases) {
      const result = evaluateLocalModelGovernancePhase6Closeout({ ...base, [field]: value });
      assert.equal(result.status, 'server-authority-incomplete');
      assert.equal(result.serverAuthorityVerifiedByContract, false);
      assert.equal(result.phase6Closed, false);
      assert.ok(result.blockers.includes(blocker));
    }
  });

  it('detects every automatic action counter including boundary-level automation', () => {
    const base = cloneInput();
    for (const field of ['automaticWrites', 'automaticReads', 'automaticApplications'] as const) {
      const result = evaluateLocalModelGovernancePhase6Closeout({ ...base, [field]: 1 });
      assert.equal(result.status, 'unsafe-automation-detected');
      assert.equal(result.automationClosed, false);
      assert.equal(result.phase6Closed, false);
    }
    const boundaryResult = evaluateLocalModelGovernancePhase6Closeout(
      replaceBoundary(base, base.boundaries[0]!.phaseId, { automaticActions: 1 }),
    );
    assert.equal(boundaryResult.status, 'unsafe-automation-detected');
    assert.equal(boundaryResult.automationClosed, false);
  });

  it('detects every production attempt or claim without treating synthetic tests as production activity', () => {
    const base = cloneInput();
    for (const field of [
      'productionPersistenceAttempts',
      'productionVerificationAttempts',
      'productionApplicationAttempts',
      'appClaimedPersistedRecords',
      'appClaimedVerifiedRecords',
      'persistedApplicationDecisions',
    ] as const) {
      const result = evaluateLocalModelGovernancePhase6Closeout({ ...base, [field]: 1 });
      assert.equal(result.status, 'unsafe-production-claim-detected');
      assert.equal(result.productionClaimsClosed, false);
      assert.equal(result.phase6Closed, false);
    }
    const boundaryResult = evaluateLocalModelGovernancePhase6Closeout(
      replaceBoundary(base, base.boundaries[3]!.phaseId, { productionAttempts: 1 }),
    );
    assert.equal(boundaryResult.status, 'unsafe-production-claim-detected');
  });

  it('detects every downstream, approval, artifact, checksum, benchmark, download, runtime, or active-model state', () => {
    const base = cloneInput();
    for (const field of [
      'recordsAppliedDownstream',
      'artifactSelectionReviewsEligible',
      'selectedArtifacts',
      'approvedArtifacts',
      'approvedModels',
      'approvedLicenses',
      'checksumsVerified',
      'benchmarksPassed',
      'downloadableArtifacts',
      'runtimeReadyArtifacts',
      'activeModels',
    ] as const) {
      const result = evaluateLocalModelGovernancePhase6Closeout({ ...base, [field]: 1 });
      assert.equal(result.status, 'downstream-state-not-closed');
      assert.equal(result.downstreamStateClosed, false);
      assert.equal(result.phase6Closed, false);
    }
    for (const overrides of [{ downstreamMutations: 1 }, { approvals: 1 }, { activeModels: 1 }]) {
      const result = evaluateLocalModelGovernancePhase6Closeout(
        replaceBoundary(base, base.boundaries[8]!.phaseId, overrides),
      );
      assert.equal(result.status, 'downstream-state-not-closed');
    }
  });

  it('rejects invalid policy revisions and non-safe counters before category evaluation', () => {
    const base = cloneInput();
    const invalidInputs: unknown[] = [
      { ...base, closeoutPolicyRevision: 2 },
      ...GLOBAL_COUNTERS.flatMap((field) => [
        { ...base, [field]: -1 },
        { ...base, [field]: 0.5 },
        { ...base, [field]: '1' },
        { ...base, [field]: Number.NaN },
        { ...base, [field]: Number.POSITIVE_INFINITY },
      ]),
      replaceBoundary(base, base.boundaries[0]!.phaseId, { automaticActions: -1 }),
      replaceBoundary(base, base.boundaries[0]!.phaseId, { productionAttempts: 0.5 }),
      replaceBoundary(base, base.boundaries[0]!.phaseId, { approvals: '1' as never }),
    ];
    for (const input of invalidInputs) {
      const result = evaluateLocalModelGovernancePhase6Closeout(input as never);
      assert.equal(result.status, 'invalid-input');
      assert.equal(result.phase6Closed, false);
    }
  });

  it('fails safely for hostile runtime objects and preserves deterministic blocker order', () => {
    const hostile = new Proxy({}, {
      get() {
        throw new Error('secret-hostile-value');
      },
    });
    const result = evaluateLocalModelGovernancePhase6Closeout(hostile as never);
    assert.equal(result.status, 'failed-safe');
    assert.deepEqual(result.blockers, ['phase-6-closeout-failed-safe']);
    assert.doesNotMatch(JSON.stringify(result), /secret-hostile-value/);

    const base = cloneInput();
    const multi = evaluateLocalModelGovernancePhase6Closeout({
      ...base,
      serverAuthoritativeRbac: false,
      clientRoleTrusted: true,
      genericAdminBypassAllowed: true,
      serviceCredentialPresent: true,
    });
    assert.deepEqual(multi.blockers, [
      'phase-6-closeout-server-authority-incomplete',
      'phase-6-closeout-client-role-trust-detected',
      'phase-6-closeout-generic-admin-bypass-detected',
      'phase-6-closeout-service-credential-detected',
    ]);
  });

  it('keeps Phase 6.9 production TypeScript pure and free of I/O, credentials, automation, artifact execution, and runtime activation', () => {
    const source = [
      read('src/platform/ai/localModelGovernancePhase6CloseoutTypes.ts'),
      read('src/platform/ai/localModelGovernancePhase6CloseoutPolicy.ts'),
      read('src/platform/ai/localModelGovernancePhase6CloseoutViewModel.ts'),
    ].join('\n');
    for (const forbidden of [
      /service[_-]?role/i,
      /https?:\/\//i,
      /access[_-]?token|refresh[_-]?token|jwt[_-]?secret|database[_-]?url|password/i,
      /document\.cookie|fetch\s*\(|axios|createClient|\.from\s*\(|\.rpc\s*\(/i,
      /\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i,
      /auth\.getSession|auth\.getUser|localStorage|sessionStorage|indexedDB|CacheStorage/i,
      /setTimeout|setInterval|Date\.now|new Date\s*\(|Math\.random|crypto\.randomUUID/i,
      /console\.log|AIService|download executor|benchmark executor|runtime initialization|inference|model activation/i,
    ]) assert.doesNotMatch(source, forbidden);
  });

  it('regression-checks Phase 6.1-6.8 source contracts, package registrations, and migration safety markers', () => {
    const requiredFiles = [
      'docs/ai/phase-6-trusted-governance-decision-record.md',
      'src/platform/ai/localModelGovernanceDecisionRecordTypes.ts',
      'src/platform/ai/localModelGovernanceDecisionRecordPolicy.ts',
      'src/platform/ai/localModelGovernanceDecisionRecordViewModel.ts',
      'docs/ai/phase-6-external-trusted-actor-context-adapter.md',
      'src/platform/ai/localModelTrustedActorContextAdapterTypes.ts',
      'src/platform/ai/localModelTrustedActorContextAdapter.ts',
      'src/platform/ai/localModelTrustedActorContextAdapterViewModel.ts',
      'docs/ai/phase-6-trusted-governance-review-workspace.md',
      'src/platform/ai/localModelGovernanceReviewWorkspaceTypes.ts',
      'src/platform/ai/localModelGovernanceReviewWorkspacePolicy.ts',
      'src/platform/ai/localModelGovernanceReviewWorkspaceViewModel.ts',
      'docs/ai/phase-6-governance-record-persistence-contract.md',
      'src/platform/ai/localModelGovernanceRecordPersistenceTypes.ts',
      'src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts',
      'src/platform/ai/localModelGovernanceRecordPersistenceViewModel.ts',
      'docs/ai/phase-6-governance-rbac-foundation.md',
      'src/platform/ai/localModelGovernanceRbacFoundationTypes.ts',
      'src/platform/ai/localModelGovernanceRbacFoundationViewModel.ts',
      'docs/ai/phase-6-governance-persistence-schema-rls.md',
      'src/platform/ai/localModelGovernancePersistenceSchemaTypes.ts',
      'src/platform/ai/localModelGovernancePersistenceSchemaViewModel.ts',
      'docs/ai/phase-6-governance-persistence-repository-client-boundary.md',
      'src/platform/ai/localModelGovernancePersistenceRepositoryTypes.ts',
      'src/platform/ai/localModelGovernancePersistenceRepository.ts',
      'src/platform/ai/localModelGovernancePersistenceRepositoryViewModel.ts',
      'docs/ai/phase-6-persisted-governance-record-verification-boundary.md',
      'src/platform/ai/localModelGovernancePersistedRecordVerificationTypes.ts',
      'src/platform/ai/localModelGovernancePersistedRecordVerificationRepository.ts',
      'src/platform/ai/localModelGovernancePersistedRecordVerificationViewModel.ts',
      'docs/ai/phase-6-governance-record-application-boundary.md',
      'src/platform/ai/localModelGovernanceRecordApplicationTypes.ts',
      'src/platform/ai/localModelGovernanceRecordApplicationPolicy.ts',
      'src/platform/ai/localModelGovernanceRecordApplicationViewModel.ts',
    ];
    for (const file of requiredFiles) assert.equal(existsSync(join(root, file)), true, file);

    const packageJson = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    const registrations = [
      'localModelGovernanceDecisionRecordPolicy.test.ts',
      'localModelGovernanceDecisionRecordViewModel.test.ts',
      'localModelTrustedActorContextAdapter.test.ts',
      'localModelTrustedActorContextAdapterViewModel.test.ts',
      'localModelGovernanceReviewWorkspacePolicy.test.ts',
      'localModelGovernanceReviewWorkspaceViewModel.test.ts',
      'localModelGovernanceRecordPersistencePolicy.test.ts',
      'localModelGovernanceRecordPersistenceViewModel.test.ts',
      'localModelGovernanceRbacSchema.test.ts',
      'localModelGovernanceRbacSecurity.test.ts',
      'localModelGovernancePersistenceSchema.test.ts',
      'localModelGovernancePersistenceRls.test.ts',
      'localModelGovernancePersistenceRepository.test.ts',
      'localModelGovernancePersistenceRepositoryViewModel.test.ts',
      'localModelGovernancePersistedRecordVerificationRepository.test.ts',
      'localModelGovernancePersistedRecordVerificationViewModel.test.ts',
      'localModelGovernanceRecordApplicationPolicy.test.ts',
      'localModelGovernanceRecordApplicationViewModel.test.ts',
      'localModelGovernancePhase6Closeout.test.ts',
      'localModelGovernancePhase6CloseoutViewModel.test.ts',
    ];
    for (const scriptName of ['test', 'test:platform']) {
      const script = packageJson.scripts[scriptName]!;
      for (const registration of registrations) assert.match(script, new RegExp(registration.replace('.', '\\.')));
    }

    const rbac = read('supabase/migrations/20260713_create_local_model_governance_rbac.sql');
    assert.match(rbac, /model-governance-reviewer/);
    assert.match(rbac, /record-model-governance-decision/);
    assert.match(rbac, /force row level security/i);
    assert.doesNotMatch(rbac, /insert\s+into\s+private\.local_model_governance_user_roles/i);

    const records = read('supabase/migrations/20260714_create_local_model_governance_records.sql');
    assert.match(records, /force row level security/i);
    assert.match(records, /append_local_model_governance_record/);
    assert.match(records, /reject_local_model_governance_record_mutation/);
    assert.equal((records.match(/insert\s+into\s+public\.local_model_governance_records/gi) ?? []).length, 1);
  });
});
