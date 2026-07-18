import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelTrustedActorContextAdapterViewModel } from '../../src/platform/ai/localModelTrustedActorContextAdapterViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): { files: string[]; violations: Array<{ path: string; ruleId: string; message: string }> };
};
function read(path: string): string { return readFileSync(new URL(path, import.meta.url), 'utf8'); }

describe('Phase 6.2 adapter view model and readiness integration', () => {
  it('maps the current provider-neutral unavailable state exactly', () => {
    const viewModel = buildLocalModelTrustedActorContextAdapterViewModel();
    assert.equal(viewModel.aggregate.externalAssertionsPresent, 0);
    assert.equal(viewModel.aggregate.authenticatedAssertions, 0);
    assert.equal(viewModel.aggregate.authorizedAssertions, 0);
    assert.equal(viewModel.aggregate.trustedActorContextsReady, 0);
    assert.equal(viewModel.aggregate.governanceRecordContractsAvailable, 3);
    assert.equal(viewModel.aggregate.candidatesEligibleForDecisionDraft, 0);
    assert.equal(viewModel.aggregate.governanceDecisionItemsRecorded, 0);
    assert.equal(viewModel.aggregate.governanceRecordsFinalized, 0);
    assert.equal(viewModel.aggregate.governanceRecordsPersisted, 0);
    assert.equal(viewModel.aggregate.recordsAppliedDownstream, 0);
    assert.equal(viewModel.aggregate.approvedModels, 0);
    assert.equal(viewModel.aggregate.approvedLicenses, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.trustedActorContextsMapped, 0);
    assert.equal(viewModel.modelActive, false);
  });

  it('uses honest adapter-only copy without authentication, admin, decision, persistence, or readiness claims', () => {
    const viewModel = buildLocalModelTrustedActorContextAdapterViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'External Trusted Actor Context Adapter Boundary');
    assert.match(viewModel.phaseSummary, /No external authentication assertion is present/);
    assert.match(viewModel.externalAuthBoundarySummary, /future external Auth boundary/);
    assert.match(viewModel.authenticationSummary, /No trusted actor context has been mapped/);
    assert.match(viewModel.authorizationSummary, /exact reviewer role and permission/i);
    assert.match(viewModel.roleMappingSummary, /Generic admin or owner claims are not accepted/);
    assert.match(viewModel.governanceRecordBoundarySummary, /No governance decision draft has been opened/);
    assert.match(viewModel.governanceRecordBoundarySummary, /No governance record has been finalized/);
    assert.match(viewModel.persistenceBoundarySummary, /No governance record has been persisted/);
    assert.match(viewModel.persistenceBoundarySummary, /No model approved/);
    assert.match(viewModel.persistenceBoundarySummary, /No artifact selected/);
    assert.match(viewModel.persistenceBoundarySummary, /No download available/);
    assert.match(viewModel.persistenceBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /Admin verified|User logged in|Authentication complete|Governance approved|Record finalized|Record persisted|Model ready|Runtime ready|Recommended model|4B active/i);
    assert.doesNotMatch(serialized, /opaque:|actor-subject|@example\.com/i);
  });

  it('adds the Phase 6.2 readiness card while preserving Phase 6.1, Phase 5.12, and earlier cards', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(source, /Phase 6\.2 external trusted actor context adapter boundary/i);
    assert.match(source, /External Trusted Actor Context Adapter Boundary/);
    assert.match(source, /No external authentication assertion is present/);
    assert.match(source, /No trusted actor context has been mapped/);
    assert.match(source, /future external boundary/i);
    assert.match(source, /exact reviewer role and permission/i);
    assert.match(source, /external assertions/);
    assert.match(source, /trusted contexts mapped/);
    assert.match(source, /governance records finalized/);
    assert.match(source, /records persisted/);
    assert.match(source, /active models/);
    assert.match(source, /Phase 6\.1 trusted human governance decision record contract/i);
    assert.match(source, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(source, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(source, /handle.*(?:login|logout|role|permission|decision|finalize)|onClick=.*(?:login|logout|role|permission|decision|finalize)/i);
    assert.doesNotMatch(source, /actorSubjectId|verifiedRoleIds|verifiedPermissionIds|accessToken|refreshToken|rawJwt/i);
  });

  it('registers both Phase 6.2 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelTrustedActorContextAdapter\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelTrustedActorContextAdapterViewModel\.test\.ts/);
    }
  });

  it('documents the external assertion, strict mapping, privacy, and future-operation boundaries', () => {
    const doc = read('../../docs/ai/phase-6-external-trusted-actor-context-adapter.md');
    const headings = [
      'Status','Purpose','Phase 6 scope','Relationship to Phase 5.12','Relationship to Phase 6.1','External Auth boundary','Adapter boundary','Authentication versus assertion mapping','Authorization versus role mapping','Sanitized external assertion','Strict assertion allowlist','Credential exclusion','Actor subject privacy','Exact reviewer role','Exact authorization permission','Generic admin claims','Trusted actor context mapping','Adapter statuses','Assertion scope','Scope invalidation','Revision handling','Phase 6.1 compatibility','Current production state','Persistence boundary','Admin workspace boundary','Provider neutrality','Failure handling','Safety invariants','Non-goals','Future phase entry conditions',
    ];
    for (const heading of headings) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /external trusted actor context adapter only/i);
    assert.match(doc, /external assertions.*0/i);
    assert.match(doc, /trusted actor contexts mapped.*0/i);
    assert.match(doc, /does not authenticate users/i);
    assert.match(doc, /does not validate JWTs or sessions/i);
    assert.match(doc, /model-governance-reviewer/);
    assert.match(doc, /record-model-governance-decision/);
    assert.match(doc, /Generic `admin`, `owner`/i);
    assert.match(doc, /No Supabase/i);
    assert.match(doc, /No Auth call/i);
    assert.match(doc, /Phase 5 closeout remains foundation-complete/i);
    assert.match(doc, /Production remains blocked-safe/i);
  });

  it('keeps the existing AI safety verifier clean and Phase 6.2 production source free of forbidden operations', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
    const source = [
      read('../../src/platform/ai/localModelTrustedActorContextAdapterTypes.ts'),
      read('../../src/platform/ai/localModelTrustedActorContextAdapter.ts'),
      read('../../src/platform/ai/localModelTrustedActorContextAdapterViewModel.ts'),
    ].join('\n');
    const forbidden = [
      /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /auth\.getSession/, /\bgetSession\s*\(/, /\bgetUser\s*\(/,
      /\bsignIn\b/, /\bsignOut\b/, /\batob\s*\(/, /document\.cookie/, /request\.headers/,
      /requestAdapter\s*\(/, /requestDevice\s*\(/, /navigator\.gpu/, /AIService/, /\.execute\s*\(/,
      /Math\.random/, /Date\.now/, /performance\.now/, /setTimeout/, /serviceWorker\.register/,
    ];
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
  });
});
