import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  buildCurrentLocalModelGovernanceBenchmarkCloseoutInput,
  buildLocalModelGovernanceBenchmarkCandidateCloseouts,
  buildLocalModelGovernanceBenchmarkCloseout,
  evaluateLocalModelGovernanceBenchmarkCloseout,
  listLocalModelGovernanceBenchmarkCloseoutFindings,
  validateLocalModelGovernanceBenchmarkCloseoutInput,
} from '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts';
import type { LocalModelGovernanceBenchmarkCloseoutInput } from '../../src/platform/ai/localModelGovernanceBenchmarkCloseoutTypes.ts';

function cloneInput(): LocalModelGovernanceBenchmarkCloseoutInput {
  return structuredClone(buildCurrentLocalModelGovernanceBenchmarkCloseoutInput());
}

function mutateCandidate<T extends { candidateId: string }>(items: readonly T[], candidateId: string, patch: Partial<T>): readonly T[] {
  return items.map((item) => item.candidateId === candidateId ? { ...item, ...patch } : item);
}

describe('Phase 5.12 model governance and benchmark planning closeout', () => {
  it('closes the production foundation with exact candidate identity and tier matrix', () => {
    const result = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(result.status, 'foundation-complete');
    assert.equal(result.phase5FoundationComplete, true);
    assert.equal(result.productionBlockedSafe, true);
    assert.equal(result.governanceFoundationComplete, true);
    assert.equal(result.artifactReviewFoundationComplete, true);
    assert.equal(result.benchmarkPlanningFoundationComplete, true);
    assert.equal(result.benchmarkExecutionAvailable, false);
    assert.equal(result.modelReadinessEstablished, false);
    assert.equal(result.runtimeReadinessEstablished, false);
    assert.equal(result.candidates.length, 3);
    assert.deepEqual(result.candidates.map((item) => [item.candidateTier, item.exactModelName, item.modelClass]), [
      ['light', 'Qwen3-0.6B', '0.6B'],
      ['standard', 'Qwen3-1.7B', '1.7B'],
      ['pro', 'Qwen3-4B', '4B'],
    ]);
    assert.equal(new Set(result.candidates.map((item) => item.candidateId)).size, 3);
    assert.equal(result.candidates.some((item) => item.candidateTier === 'ultra-low'), false);
    assert.equal(result.aggregate.exactCandidateIdentities, 3);
    assert.equal(result.aggregate.consistentTierMappings, 3);
  });

  it('aggregates all Phase 5.1-5.11 boundaries without creating a happy path', () => {
    const result = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(result.aggregate.evidenceRecords, 3);
    assert.equal(result.aggregate.artifactProvenanceRecords, 3);
    assert.equal(result.aggregate.artifactIntegrityRecords, 3);
    assert.equal(result.aggregate.governanceReviewPackets, 3);
    assert.equal(result.aggregate.evidenceClosureRecords, 3);
    assert.equal(result.aggregate.evidenceClosureRequirements, 12);
    assert.equal(result.aggregate.governanceDecisionSessions, 3);
    assert.equal(result.aggregate.governanceDecisionItemsRequired, 12);
    assert.equal(result.aggregate.governanceDecisionItemsRecorded, 0);
    assert.equal(result.aggregate.governanceDecisionsComplete, 0);
    assert.equal(result.aggregate.artifactSelectionSessions, 3);
    assert.equal(result.aggregate.artifactSelectionsRecorded, 0);
    assert.equal(result.aggregate.selectedArtifacts, 0);
    assert.equal(result.aggregate.artifactApprovalSessions, 3);
    assert.equal(result.aggregate.artifactApprovalDecisionsRecorded, 0);
    assert.equal(result.aggregate.integrityPinningDecisionsRecorded, 0);
    assert.equal(result.aggregate.approvedArtifacts, 0);
    assert.equal(result.aggregate.approvedPinPlans, 0);
    assert.equal(result.aggregate.checksumPinnedArtifacts, 0);
    assert.equal(result.aggregate.checksumVerifiedArtifacts, 0);
    assert.equal(result.aggregate.benchmarkPlanSessions, 3);
    assert.equal(result.aggregate.benchmarkPlansApproved, 0);
    assert.equal(result.aggregate.benchmarkExecutionsStarted, 0);
    assert.equal(result.aggregate.benchmarkExecutionsCompleted, 0);
    assert.equal(result.aggregate.benchmarkMeasurementsRecorded, 0);
    assert.equal(result.aggregate.benchmarkPassedCandidates, 0);
    assert.equal(result.aggregate.benchmarkFailedCandidates, 0);
    assert.equal(result.aggregate.downloadLocationsConfigured, 0);
    assert.equal(result.aggregate.downloadableArtifacts, 0);
    assert.equal(result.aggregate.cacheableArtifacts, 0);
    assert.equal(result.aggregate.runtimeReadyArtifacts, 0);
    assert.equal(result.aggregate.activeModels, 0);
  });

  it('keeps Phase 4 closeout, fallback continuity, and AI feature parity intact', () => {
    const result = buildLocalModelGovernanceBenchmarkCloseout();
    assert.equal(result.phase4CloseoutFoundationComplete, true);
    assert.equal(result.productionExecutorAvailable, false);
    assert.equal(result.aggregate.candidatesWithFallback, 3);
    assert.equal(result.aggregate.candidatesWithFeatureParity, 3);
    for (const candidate of result.candidates) {
      assert.equal(candidate.deterministicFallbackAvailable, true);
      assert.equal(candidate.featureParityPreserved, true);
      assert.equal(candidate.modelActive, false);
    }
  });

  it('keeps every lifecycle boundary fail closed', () => {
    const result = buildLocalModelGovernanceBenchmarkCloseout();
    for (const candidate of result.candidates) {
      assert.equal(candidate.humanDecisionsRecorded, 0);
      assert.equal(candidate.governanceDecisionsComplete, false);
      assert.equal(candidate.artifactSelectionRecorded, false);
      assert.equal(candidate.artifactSelected, false);
      assert.equal(candidate.artifactApproved, false);
      assert.equal(candidate.checksumPinned, false);
      assert.equal(candidate.checksumVerified, false);
      assert.equal(candidate.benchmarkPlanApproved, false);
      assert.equal(candidate.benchmarkExecutionStarted, false);
      assert.equal(candidate.benchmarkExecutionCompleted, false);
      assert.equal(candidate.benchmarkMeasurementsRecorded, false);
      assert.equal(candidate.benchmarkVerified, false);
      assert.equal(candidate.benchmarkPassed, false);
      assert.equal(candidate.benchmarkFailed, false);
      assert.equal(candidate.downloadLocationConfigured, false);
      assert.equal(candidate.downloadable, false);
      assert.equal(candidate.cacheable, false);
      assert.equal(candidate.runtimeReady, false);
      assert.equal(candidate.modelActive, false);
    }
  });

  it('returns attention-required for missing, duplicate, or inconsistent candidate identity', () => {
    const cases: LocalModelGovernanceBenchmarkCloseoutInput[] = [];
    const missing = cloneInput();
    cases.push({ ...missing, candidateEvidenceRecords: missing.candidateEvidenceRecords.slice(1) });
    const duplicate = cloneInput();
    cases.push({ ...duplicate, candidateEvidenceRecords: [...duplicate.candidateEvidenceRecords, duplicate.candidateEvidenceRecords[0]!] });
    const tierMismatch = cloneInput();
    cases.push({ ...tierMismatch, artifactEvidenceRecords: mutateCandidate(tierMismatch.artifactEvidenceRecords, 'qwen3-0-6b-candidate', { candidateTier: 'pro' }) });
    const modelMismatch = cloneInput();
    cases.push({ ...modelMismatch, artifactIntegrityRecords: mutateCandidate(modelMismatch.artifactIntegrityRecords, 'qwen3-1-7b-candidate', { modelClass: '4B' }) });
    const repositoryMismatch = cloneInput();
    cases.push({ ...repositoryMismatch, governancePackets: mutateCandidate(repositoryMismatch.governancePackets, 'qwen3-4b-candidate', { officialRepositoryId: 'Qwen/Other' }) });
    const revisionMismatch = cloneInput();
    cases.push({ ...revisionMismatch, evidenceClosureRecords: mutateCandidate(revisionMismatch.evidenceClosureRecords, 'qwen3-4b-candidate', { observedRevision: 'different-revision' }) });

    for (const input of cases) {
      const result = evaluateLocalModelGovernanceBenchmarkCloseout(input);
      assert.equal(result.status, 'attention-required');
      assert.equal(result.phase5FoundationComplete, false);
      assert.ok(result.aggregate.errorFindings > 0);
    }
  });

  it('returns attention-required for missing foundation records or wrong requirement count', () => {
    const missingEvidence = cloneInput();
    const missingPacket = cloneInput();
    const wrongClosures = cloneInput();
    const firstClosure = wrongClosures.evidenceClosureRecords[0]!;
    const inputs: LocalModelGovernanceBenchmarkCloseoutInput[] = [
      { ...missingEvidence, artifactIntegrityRecords: missingEvidence.artifactIntegrityRecords.slice(1) },
      { ...missingPacket, governancePackets: missingPacket.governancePackets.slice(1) },
      { ...wrongClosures, evidenceClosureRecords: [{ ...firstClosure, requirements: firstClosure.requirements.slice(1) }, ...wrongClosures.evidenceClosureRecords.slice(1)] },
    ];
    for (const input of inputs) assert.equal(evaluateLocalModelGovernanceBenchmarkCloseout(input).status, 'attention-required');
  });

  it('returns attention-required whenever production lifecycle state appears automatically', () => {
    const mutators: Array<(input: LocalModelGovernanceBenchmarkCloseoutInput) => LocalModelGovernanceBenchmarkCloseoutInput> = [
      (input) => ({ ...input, governanceDecisionResults: mutateCandidate(input.governanceDecisionResults, 'qwen3-0-6b-candidate', { humanDecisionRecorded: true }) }),
      (input) => ({ ...input, governanceDecisionResults: mutateCandidate(input.governanceDecisionResults, 'qwen3-0-6b-candidate', { status: 'governance-decisions-complete', allRequiredDecisionsRecorded: true, canProceedToArtifactSelectionReview: true }) }),
      (input) => ({ ...input, artifactSelectionResults: mutateCandidate(input.artifactSelectionResults, 'qwen3-0-6b-candidate', { artifactSelected: true, humanSelectionRecorded: true }) }),
      (input) => ({ ...input, artifactApprovalResults: mutateCandidate(input.artifactApprovalResults, 'qwen3-0-6b-candidate', { artifactApproved: true, artifactApprovalComplete: true }) }),
      (input) => ({ ...input, artifactApprovalResults: mutateCandidate(input.artifactApprovalResults, 'qwen3-0-6b-candidate', { checksumPinned: true }) }),
      (input) => ({ ...input, benchmarkPlanResults: mutateCandidate(input.benchmarkPlanResults, 'qwen3-0-6b-candidate', { benchmarkPlanApproved: true }) }),
      (input) => ({ ...input, benchmarkPlanResults: mutateCandidate(input.benchmarkPlanResults, 'qwen3-0-6b-candidate', { benchmarkExecutionStarted: true }) }),
      (input) => ({ ...input, benchmarkPlanResults: mutateCandidate(input.benchmarkPlanResults, 'qwen3-0-6b-candidate', { benchmarkMeasurementsRecorded: true }) }),
      (input) => ({ ...input, benchmarkPlanResults: mutateCandidate(input.benchmarkPlanResults, 'qwen3-0-6b-candidate', { benchmarkPassed: true }) }),
      (input) => ({ ...input, benchmarkPlanResults: mutateCandidate(input.benchmarkPlanResults, 'qwen3-0-6b-candidate', { benchmarkFailed: true }) }),
      (input) => ({ ...input, claimedDownloadLocationsConfigured: 1 }),
      (input) => ({ ...input, claimedDownloadableArtifacts: 1 }),
      (input) => ({ ...input, claimedRuntimeReadyArtifacts: 1 }),
      (input) => ({ ...input, claimedActiveModels: 1 }),
    ];
    for (const mutate of mutators) {
      const result = evaluateLocalModelGovernanceBenchmarkCloseout(mutate(cloneInput()));
      assert.equal(result.status, 'attention-required');
      assert.equal(result.productionBlockedSafe, false);
    }
  });

  it('returns attention-required when fallback, feature parity, or Phase 4 closeout breaks', () => {
    for (const patch of [
      { deterministicFallbackAvailable: false },
      { featureParityPreserved: false },
      { phase4CloseoutFoundationComplete: false },
    ]) {
      const result = evaluateLocalModelGovernanceBenchmarkCloseout({ ...cloneInput(), ...patch });
      assert.equal(result.status, 'attention-required');
      assert.ok(result.aggregate.errorFindings > 0);
    }
  });

  it('is deterministic, validates without mutation, and emits unique findings/blockers', () => {
    const input = cloneInput();
    const before = JSON.stringify(input);
    const first = evaluateLocalModelGovernanceBenchmarkCloseout(input);
    const second = evaluateLocalModelGovernanceBenchmarkCloseout(input);
    assert.equal(JSON.stringify(input), before);
    assert.deepEqual(first, second);
    assert.equal(validateLocalModelGovernanceBenchmarkCloseoutInput(input).valid, true);
    assert.deepEqual(buildLocalModelGovernanceBenchmarkCandidateCloseouts(input), first.candidates);
    assert.deepEqual(listLocalModelGovernanceBenchmarkCloseoutFindings(input), first.findings);
    assert.equal(new Set(first.findings.map((item) => item.findingId)).size, first.findings.length);
    assert.equal(new Set(first.blockers).size, first.blockers.length);
    assert.doesNotMatch(JSON.stringify(first.findings), /[a-f0-9]{64}/i);
  });

  it('contains no runtime, benchmark, persistence, network, or random side effects', () => {
    const files = [
      '../../src/platform/ai/localModelGovernanceBenchmarkCloseoutTypes.ts',
      '../../src/platform/ai/localModelGovernanceBenchmarkCloseout.ts',
      '../../src/platform/ai/localModelGovernanceBenchmarkCloseoutViewModel.ts',
      '../../src/components/ai/LocalAIReadinessShell.tsx',
    ];
    const forbidden = [
      /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/, /navigator\.gpu/,
      /AIService/, /\.execute\s*\(/, /Math\.random/, /Date\.now/, /performance\.now/, /setTimeout/,
      /\bWorker\s*\(/, /SharedWorker\s*\(/, /serviceWorker\.register/,
    ];
    for (const file of files) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `${file} matched ${pattern}`);
    }
  });
});
