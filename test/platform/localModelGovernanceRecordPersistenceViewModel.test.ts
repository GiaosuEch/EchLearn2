import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelGovernanceRecordPersistenceViewModel } from '../../src/platform/ai/localModelGovernanceRecordPersistenceViewModel.ts';

const require = createRequire(import.meta.url);
const { scanAISafetyRegression } = require('../../scripts/verify_ai_safety_regression.cjs') as {
  scanAISafetyRegression(options: { root: string }): { files: string[]; violations: Array<{ path: string; ruleId: string; message: string }> };
};
function read(path: string): string { return readFileSync(new URL(path, import.meta.url), 'utf8'); }

describe('Phase 6.4 persistence view model and readiness integration', () => {
  it('maps three awaiting contracts and all zero-operation aggregates exactly', () => {
    const viewModel = buildLocalModelGovernanceRecordPersistenceViewModel();
    assert.equal(viewModel.aggregate.totalCandidates, 3);
    assert.equal(viewModel.aggregate.awaitingFinalizedRecordCandidates, 3);
    assert.equal(viewModel.aggregate.persistenceRequestsReady, 0);
    assert.equal(viewModel.aggregate.invalidatedRequests, 0);
    assert.equal(viewModel.aggregate.attentionRequiredRequests, 0);
    assert.equal(viewModel.aggregate.finalizedRecordsPresent, 0);
    assert.equal(viewModel.aggregate.identicalDuplicateEnvelopes, 0);
    assert.equal(viewModel.aggregate.conflictingDuplicateEnvelopes, 0);
    assert.equal(viewModel.aggregate.persistenceAttempts, 0);
    assert.equal(viewModel.aggregate.repositoryWrites, 0);
    assert.equal(viewModel.aggregate.persistedRecords, 0);
    assert.equal(viewModel.aggregate.signedRecords, 0);
    assert.equal(viewModel.aggregate.recordsAppliedDownstream, 0);
    assert.equal(viewModel.aggregate.approvedModels, 0);
    assert.equal(viewModel.aggregate.approvedLicenses, 0);
    assert.equal(viewModel.aggregate.selectedArtifacts, 0);
    assert.equal(viewModel.aggregate.approvedArtifacts, 0);
    assert.equal(viewModel.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(viewModel.aggregate.benchmarkPassedCandidates, 0);
    assert.equal(viewModel.aggregate.downloadableArtifacts, 0);
    assert.equal(viewModel.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(viewModel.aggregate.activeModels, 0);
    assert.equal(viewModel.persistenceAttempts, 0);
    assert.equal(viewModel.persistedRecords, 0);
    assert.equal(viewModel.activeModels, 0);
    assert.equal(viewModel.candidateRows.length, 3);
  });

  it('uses honest append-only copy without identity, timestamp, database, or readiness claims', () => {
    const viewModel = buildLocalModelGovernanceRecordPersistenceViewModel();
    const serialized = JSON.stringify(viewModel);
    assert.equal(viewModel.heading, 'Trusted Governance Record Persistence Contract Boundary');
    assert.match(viewModel.canonicalRecordBoundarySummary, /No canonical governance record has been finalized/);
    assert.match(viewModel.persistenceStateSummary, /awaiting finalized records/i);
    assert.match(viewModel.immutableEnvelopeSummary, /append-only/i);
    assert.match(viewModel.immutableEnvelopeSummary, /immutable/i);
    assert.match(viewModel.idempotencySummary, /deterministic idempotency/i);
    assert.match(viewModel.idempotencySummary, /Conflicting records must be rejected/i);
    assert.match(viewModel.repositoryBoundarySummary, /No persistence repository is configured/);
    assert.match(viewModel.persistenceStateSummary, /No persistence attempt has occurred/);
    assert.match(viewModel.persistenceStateSummary, /No governance record has been persisted/);
    assert.match(viewModel.downstreamBoundarySummary, /No record has been signed/);
    assert.match(viewModel.downstreamBoundarySummary, /No record has been applied downstream/);
    assert.match(viewModel.downstreamBoundarySummary, /No model approved/);
    assert.match(viewModel.downstreamBoundarySummary, /No artifact selected/);
    assert.match(viewModel.downstreamBoundarySummary, /No download available/);
    assert.match(viewModel.downstreamBoundarySummary, /No model active/);
    assert.doesNotMatch(serialized, /Record saved|Record stored|Database ready|Audit complete|Governance approved|Model ready|Runtime ready|Recommended model|4B active/i);
    assert.doesNotMatch(serialized, /actorSubjectId|opaque:|reviewedAt|2026-07-18|persistenceKey|idempotencyKey/i);
  });

  it('adds the Phase 6.4 read-only card while preserving all earlier closeout and boundary cards', () => {
    const source = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    assert.match(source, /Phase 6\.4 trusted governance record persistence contract boundary/i);
    assert.match(source, /Trusted Governance Record Persistence Contract Boundary/);
    assert.match(source, /No canonical governance record has been finalized/);
    assert.match(source, /Persistence requests are awaiting finalized records/);
    assert.match(source, /Append-only and immutable persistence is required/);
    assert.match(source, /No persistence repository is configured/);
    assert.match(source, /awaiting finalized record/);
    assert.match(source, /persistence requests ready/);
    assert.match(source, /persistence attempts/);
    assert.match(source, /persisted records/);
    assert.match(source, /active models/);
    assert.match(source, /Phase 6\.3 trusted admin governance review workspace boundary/i);
    assert.match(source, /Phase 6\.2 external trusted actor context adapter boundary/i);
    assert.match(source, /Phase 6\.1 trusted human governance decision record contract/i);
    assert.match(source, /Phase 5\.12 model governance and benchmark planning safety closeout/i);
    assert.match(source, /Phase 4 Local Model Acquisition Safety Closeout/);
    assert.doesNotMatch(source, /handle.*(?:save|persist|retry|delete)|onClick=.*(?:save|persist|retry|delete)/i);
    assert.doesNotMatch(source, /actorSubjectId|reviewedAt|persistenceKey|idempotencyKey|accessToken|rawJwt/i);
  });

  it('registers both Phase 6.4 tests in test and test:platform scripts', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceRecordPersistencePolicy\.test\.ts/);
      assert.match(packageJson.scripts[script], /test\/platform\/localModelGovernanceRecordPersistenceViewModel\.test\.ts/);
    }
  });

  it('documents the immutable persistence contract, privacy, repository, and downstream boundaries', () => {
    const doc = read('../../docs/ai/phase-6-governance-record-persistence-contract.md');
    const headings = [
      'Status','Purpose','Phase 6 scope','Relationship to Phase 5.12','Relationship to Phase 6.1','Relationship to Phase 6.2','Relationship to Phase 6.3','Canonical record authority','Persistence contract boundary','Persistence envelope','Payload allowlist','Data minimization','Actor privacy','Finalized outcomes','Proceed audit records','Rejected audit records','More-evidence audit records','Deterministic persistence key','Deterministic idempotency key','Logical key versus cryptographic proof','Append-only semantics','Immutability','Record revisions','Duplicate handling','Conflicting duplicate handling','Persistence scope','Scope invalidation','Repository boundary','Persistence attempt boundary','Current production state','Supabase boundary','Migration and RLS boundary','Downstream application boundary','Failure handling','Safety invariants','Non-goals','Future phase entry conditions',
    ];
    for (const heading of headings) assert.match(doc, new RegExp(`^## ${heading}$`, 'm'));
    assert.match(doc, /persistence contract only/i);
    assert.match(doc, /finalized governance records.*0/i);
    assert.match(doc, /persistence requests ready.*0/i);
    assert.match(doc, /persistence attempts.*0/i);
    assert.match(doc, /repository writes.*0/i);
    assert.match(doc, /persisted records.*0/i);
    assert.match(doc, /Proceed, rejected and more-evidence records are all valid audit outcomes/i);
    assert.match(doc, /append-only/i);
    assert.match(doc, /Update, delete, replace and upsert are forbidden/i);
    assert.match(doc, /not a signature, hash or checksum/i);
    assert.match(doc, /No Supabase/i);
    assert.match(doc, /Phase 5 closeout remains foundation-complete/i);
    assert.match(doc, /Production remains blocked-safe/i);
  });

  it('keeps AI safety clean and production Phase 6.4 source free of forbidden operations', () => {
    const result = scanAISafetyRegression({ root: new URL('../..', import.meta.url).pathname });
    assert.deepEqual(result.violations, []);
    const source = [
      read('../../src/platform/ai/localModelGovernanceRecordPersistenceTypes.ts'),
      read('../../src/platform/ai/localModelGovernanceRecordPersistencePolicy.ts'),
      read('../../src/platform/ai/localModelGovernanceRecordPersistenceViewModel.ts'),
    ].join('\n');
    const forbidden = [
      /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /\bsupabase\b/i, /\binsert\s*\(/, /\bupdate\s*\(/,
      /\bupsert\s*\(/, /\bdelete\s*\(/, /\bfrom\s*\(/, /\brpc\s*\(/, /createClient/,
      /auth\.getSession/, /accessToken/, /refreshToken/, /rawJwt/, /document\.cookie/, /crypto\./,
      /subtle\./, /createHash/, /Math\.random/, /Date\.now/, /performance\.now/, /setTimeout/,
      /requestAdapter\s*\(/, /requestDevice\s*\(/, /navigator\.gpu/, /AIService/, /\.execute\s*\(/,
      /serviceWorker\.register/,
    ];
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern);
  });
});
