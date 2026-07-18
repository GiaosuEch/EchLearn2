import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelGovernanceReviewWorkspaceViewModel } from '../../src/platform/ai/localModelGovernanceReviewWorkspaceViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): { files: string[]; violations: Array<{ path: string; ruleId: string; message: string }> };
};
function read(path: string): string { return readFileSync(new URL(path, import.meta.url), 'utf8'); }

describe('Phase 6.3 workspace view model and readiness integration', () => {
  it('maps the current three locked workspaces and zero-operation aggregates exactly', () => {
    const viewModel = buildLocalModelGovernanceReviewWorkspaceViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.lockedWorkspaces, 3);
    assert.equal(viewModel.aggregate.readyForReviewWorkspaces, 0);
    assert.equal(viewModel.aggregate.draftInProgressWorkspaces, 0);
    assert.equal(viewModel.aggregate.readyToFinalizeWorkspaces, 0);
    assert.equal(viewModel.aggregate.finalizeRequestedWorkspaces, 0);
    assert.equal(viewModel.aggregate.finalizedProceedWorkspaces, 0);
    assert.equal(viewModel.aggregate.finalizedRejectedWorkspaces, 0);
    assert.equal(viewModel.aggregate.finalizedMoreEvidenceWorkspaces, 0);
    assert.equal(viewModel.aggregate.invalidatedWorkspaces, 0);
    assert.equal(viewModel.aggregate.attentionRequiredWorkspaces, 0);
    assert.equal(viewModel.aggregate.trustedActorContexts, 0);
    assert.equal(viewModel.aggregate.decisionItemsRecorded, 0);
    assert.equal(viewModel.aggregate.canonicalRecordsFinalized, 0);
    assert.equal(viewModel.aggregate.recordsEligibleForTrustedPersistenceReview, 0);
    assert.equal(viewModel.aggregate.recordsEligibleForArtifactSelectionReview, 0);
    assert.equal(viewModel.aggregate.recordsPersisted, 0);
    assert.equal(viewModel.aggregate.recordsAppliedDownstream, 0);
    assert.equal(viewModel.aggregate.approvedModels, 0);
    assert.equal(viewModel.aggregate.approvedLicenses, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.recordsPersisted, 0);
    assert.equal(viewModel.activeModels, 0);
    assert.equal(viewModel.candidateRows.length, 3);
  });

  it('uses honest locked workspace copy without actor identity or approval/readiness claims', () => {
    const viewModel = buildLocalModelGovernanceReviewWorkspaceViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Trusted Admin Governance Review Workspace Boundary');
    assert.match(viewModel.trustedActorBoundarySummary, /No trusted actor context is available/);
    assert.match(viewModel.workspaceAccessSummary, /workspaces are locked/i);
    assert.match(viewModel.decisionDraftSummary, /No governance decision draft has been started/);
    assert.match(viewModel.decisionDraftSummary, /No governance decisions have been recorded/);
    assert.match(viewModel.finalizationSummary, /No finalize request has been made/);
    assert.match(viewModel.finalizationSummary, /No canonical governance record has been finalized/);
    assert.match(viewModel.persistenceBoundarySummary, /No record has been persisted/);
    assert.match(viewModel.downstreamBoundarySummary, /No record has been applied downstream/);
    assert.match(viewModel.downstreamBoundarySummary, /No model approved/);
    assert.match(viewModel.downstreamBoundarySummary, /No license approved/);
    assert.match(viewModel.downstreamBoundarySummary, /No artifact selected/);
    assert.match(viewModel.downstreamBoundarySummary, /No download available/);
    assert.match(viewModel.downstreamBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /Admin logged in|Admin verified|Reviewer authenticated|Governance approved|Record persisted|Model ready|Runtime ready|Recommended model|4B active/i);
    assert.doesNotMatch(serialized, /opaque:|actorSubjectId|verifiedRoleIds|verifiedPermissionIds|@example\.com/i);
  });

  it('adds the Phase 6.3 locked summary card while preserving Phase 6.1, Phase 6.2, Phase 5.12, and earlier cards', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(source, /Phase 6\.3 trusted admin governance review workspace boundary/i);
    assert.match(source, /Trusted Admin Governance Review Workspace Boundary/);
    assert.match(source, /No trusted actor context is available/);
    assert.match(source, /Governance review workspaces are locked/);
    assert.match(source, /No governance decision draft has been started/);
    assert.match(source, /locked workspaces/);
    assert.match(source, /decision items recorded/);
    assert.match(source, /canonical records finalized/);
    assert.match(source, /records persisted/);
    assert.match(source, /active models/);
    assert.match(source, /Phase 6\.2 external trusted actor context adapter boundary/i);
    assert.match(source, /Phase 6\.1 trusted human governance decision record contract/i);
    assert.match(source, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(source, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(source, /handle.*(?:login|logout|decision|finalize|review)|onClick=.*(?:login|logout|decision|finalize|review)/i);
    assert.doesNotMatch(source, /actorSubjectId|verifiedRoleIds|verifiedPermissionIds|accessToken|refreshToken|rawJwt/i);
  });

  it('registers both Phase 6.3 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceReviewWorkspacePolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceReviewWorkspaceViewModel\.test\.ts/);
    }
  });

  it('documents the trusted workspace, explicit event, privacy, and downstream boundaries', () => {
    const doc = read('../../docs/ai/phase-6-trusted-governance-review-workspace.md');
    const headings = [
      'Status','Purpose','Phase 6 scope','Relationship to Phase 5.7','Relationship to Phase 5.12','Relationship to Phase 6.1','Relationship to Phase 6.2','Trusted actor prerequisite','Workspace boundary','Workspace access states','Governance requirements','Draft decisions','Explicit review start','Explicit decision events','Explicit finalization request','Canonical record integration','Finalized proceed outcome','Rejected outcome','More-evidence outcome','Workspace scope','Scope invalidation','Actor privacy','In-memory draft boundary','Persistence boundary','Signature boundary','Downstream application boundary','Current production state','Tier-matrix compatibility','Failure handling','Safety invariants','Non-goals','Future phase entry conditions',
    ];
    for (const heading of headings) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /governance review workspace boundary only/i);
    assert.match(doc, /trusted actor contexts.*0/i);
    assert.match(doc, /locked workspaces.*3/i);
    assert.match(doc, /decisions recorded.*0/i);
    assert.match(doc, /finalized records.*0/i);
    assert.match(doc, /does not default.*proceed/i);
    assert.match(doc, /does not auto-finalize/i);
    assert.match(doc, /Phase 6\.1 remains the canonical record authority/i);
    assert.match(doc, /No Supabase/i);
    assert.match(doc, /Phase 5 closeout remains foundation-complete/i);
    assert.match(doc, /Production remains blocked-safe/i);
  });

  it('keeps the AI safety verifier clean and production workspace source free of forbidden operations', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
    const source = [
      read('../../src/platform/ai/localModelGovernanceReviewWorkspaceTypes.ts'),
      read('../../src/platform/ai/localModelGovernanceReviewWorkspacePolicy.ts'),
      read('../../src/platform/ai/localModelGovernanceReviewWorkspaceViewModel.ts'),
    ].join('\n');
    const forbidden = [
      /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /auth\.getSession/, /\bgetSession\s*\(/, /\bgetUser\s*\(/,
      /\bsignIn\b/, /\bsignOut\b/, /\batob\s*\(/, /document\.cookie/, /requestAdapter\s*\(/,
      /requestDevice\s*\(/, /navigator\.gpu/, /AIService/, /\.execute\s*\(/, /Math\.random/,
      /Date\.now/, /performance\.now/, /setTimeout/, /serviceWorker\.register/,
    ];
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
  });
});
