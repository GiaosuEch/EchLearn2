import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { buildLocalModelArtifactIntegrityEvidenceViewModel } from '../../src/platform/ai/localModelArtifactIntegrityEvidenceViewModel.ts';
function read(relativePath: string): string { return readFileSync(new URL(relativePath, import.meta.url), 'utf8'); }

describe('Phase 5.5 artifact integrity evidence view model and readiness integration', () => {
  it('reports exact-size evidence while preserving every production selection, checksum, and runtime zero', () => {
    const vm = buildLocalModelArtifactIntegrityEvidenceViewModel();
    assert.equal(vm.aggregate.totalCandidates, 3);
    assert.equal(vm.aggregate.incompleteCandidates, 3);
    assert.equal(vm.aggregate.exactWeightSizeConfirmedCandidates, 3);
    assert.equal(vm.aggregate.integrityMetadataAvailableCandidates, 3);
    assert.equal(vm.aggregate.selectedArtifacts, 0);
    assert.equal(vm.aggregate.approvedArtifacts, 0);
    assert.equal(vm.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(vm.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(vm.aggregate.downloadableArtifacts, 0);
    assert.equal(vm.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(vm.aggregate.activeModels, 0);
    assert.equal(vm.evidenceOnly, true);
  });

  it('uses honest copy and does not claim approval, verification, readiness, or recommendation', () => {
    const vm = buildLocalModelArtifactIntegrityEvidenceViewModel();
    const copy = [vm.heading, vm.integrityEvidenceSummary, vm.exactSizeSummary, vm.checksumBoundarySummary, vm.selectionSummary, vm.approvalSummary, vm.executionSummary, ...vm.warnings].join(' ');
    for (const phrase of ['Official Artifact Integrity, Exact Size & Checksum Evidence Review', 'Integrity evidence only', 'Exact weight size is not approved download size', 'No artifact selected', 'No artifact approved', 'No checksum pinned', 'No checksum verified', 'No download location configured', 'No benchmark passed', 'No download available', 'No model active', 'Production execution remains unavailable']) assert.match(copy, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    for (const forbidden of ['Integrity passed', 'Ready to download', 'Runtime ready', 'Model ready', 'Best artifact', 'Recommended quantization', '4B active']) assert.doesNotMatch(copy, new RegExp(forbidden, 'i'));
  });

  it('renders one candidate row per production candidate with exact weight bytes separated from bundle size', () => {
    const vm = buildLocalModelArtifactIntegrityEvidenceViewModel();
    assert.equal(vm.candidateRows.length, 3);
    assert.deepEqual(vm.candidateRows.map((row) => row.exactWeightBytes), [1_503_300_328, 4_063_515_592, 8_044_982_000]);
    assert.ok(vm.candidateRows.every((row) => row.futureDownloadSizeLabel === 'Approved download size unavailable'));
    assert.ok(vm.candidateRows.every((row) => row.checksumSummary === 'Observed metadata only; not pinned or verified'));
  });

  it('integrates the Phase 5.5 card without changing prior cards or adding actions and persistence', () => {
    const shell = read('../../src/components/ai/LocalAIReadinessShell.tsx');
    for (const phrase of ['Phase 4.11 local model acquisition safety closeout', 'Phase 5.1 exact model and license evidence review', 'Phase 5.2 human model and license review decision gate', 'Phase 5.3 official artifact variant and provenance evidence', 'Phase 5.4 human artifact variant selection decision gate', 'Phase 5.5 official artifact integrity and exact size evidence', 'Official Artifact Integrity, Exact Size & Checksum Evidence Review', 'Integrity evidence only', 'Exact weight size is not approved download size', 'No checksum pinned', 'No checksum verified', 'No model active']) assert.match(shell, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    for (const pattern of [/onClick=.*(?:select|approve|pin|verify|download|activate)/i, /fetch\s*\(/, /localStorage/, /sessionStorage/, /indexedDB/, /AIService/, /setTimeout/]) assert.equal(pattern.test(shell), false);
  });

  it('registers both Phase 5.5 tests and documents all required boundaries', () => {
    const packageJson = JSON.parse(read('../../package.json')) as { scripts: Record<string, string> };
    for (const script of ['test', 'test:platform']) {
      assert.match(packageJson.scripts[script], /localModelArtifactIntegrityEvidenceRegistry\.test\.ts/);
      assert.match(packageJson.scripts[script], /localModelArtifactIntegrityEvidenceViewModel\.test\.ts/);
    }
    const docs = read('../../docs/ai/phase-5-model-artifact-integrity-evidence.md');
    for (const heading of ['Status', 'Purpose', 'Relationship to Phase 5.3', 'Relationship to Phase 5.4', 'Integrity evidence versus checksum pinning', 'Checksum pinning versus checksum verification', 'Source quality rules', 'Immutable revision scope', 'Weight file inventory', 'Weight index consistency', 'Exact weight-size evidence', 'Support-file size evidence', 'Final download-size boundary', 'Integrity metadata availability', 'Integrity algorithm distinctions', 'LFS metadata', 'Xet metadata', 'Git object identifiers', 'Light candidate integrity evidence', 'Standard candidate integrity evidence', 'Pro candidate integrity evidence', 'Missing integrity evidence', 'Conflicting evidence', 'Human integrity review requirements', 'Current production state', 'Tier-matrix compatibility', 'Privacy and runtime boundaries', 'Safety invariants', 'Non-goals']) assert.match(docs, new RegExp(`^## ${heading}$`, 'm'));
  });
});
