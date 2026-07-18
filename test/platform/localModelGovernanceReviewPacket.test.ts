import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { LOCAL_MODEL_APPROVAL_REGISTRY } from '../../src/platform/ai/localModelApprovalRegistry.ts';
import { LOCAL_MODEL_ARTIFACT_MANIFEST } from '../../src/platform/ai/localModelArtifactManifest.ts';
import { buildCurrentLocalModelAcquisitionCloseout } from '../../src/platform/ai/localModelAcquisitionCloseout.ts';
import { listLocalModelCandidateEvidence } from '../../src/platform/ai/localModelCandidateEvidenceRegistry.ts';
import { buildCurrentLocalModelCandidateReviewDecisions } from '../../src/platform/ai/localModelCandidateReviewDecisionPolicy.ts';
import { listLocalModelArtifactEvidence } from '../../src/platform/ai/localModelArtifactEvidenceRegistry.ts';
import { buildCurrentLocalModelArtifactSelections } from '../../src/platform/ai/localModelArtifactSelectionPolicy.ts';
import { listLocalModelArtifactIntegrityEvidence } from '../../src/platform/ai/localModelArtifactIntegrityEvidenceRegistry.ts';
import {
  LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS,
  buildCurrentLocalModelGovernanceReviewPackets,
  buildLocalModelGovernanceReviewPacket,
  listCurrentLocalModelGovernanceReviewPackets,
  validateLocalModelGovernanceReviewPackets,
} from '../../src/platform/ai/localModelGovernanceReviewPacket.ts';
import type {
  LocalModelGovernanceReviewPacketInput,
  LocalModelGovernanceRequirementId,
} from '../../src/platform/ai/localModelGovernanceReviewPacketTypes.ts';

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function currentInput(candidateId = 'qwen3-0-6b-candidate'): LocalModelGovernanceReviewPacketInput {
  return {
    candidateEvidence: structuredClone(listLocalModelCandidateEvidence().find((item) => item.candidateId === candidateId) ?? null),
    candidateReviewDecision: structuredClone(buildCurrentLocalModelCandidateReviewDecisions().find((item) => item.candidateId === candidateId) ?? null),
    artifactEvidence: structuredClone(listLocalModelArtifactEvidence().find((item) => item.candidateId === candidateId) ?? null),
    artifactSelection: structuredClone(buildCurrentLocalModelArtifactSelections().find((item) => item.candidateId === candidateId) ?? null),
    integrityEvidence: structuredClone(listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === candidateId) ?? null),
  };
}

function requirementStatus(input: LocalModelGovernanceReviewPacketInput, id: LocalModelGovernanceRequirementId): string {
  return buildLocalModelGovernanceReviewPacket(input).requirements.find((item) => item.id === id)!.status;
}

function completeFactualInput(): LocalModelGovernanceReviewPacketInput {
  const input = currentInput();
  const candidateEvidence = input.candidateEvidence!;
  return {
    ...input,
    candidateEvidence: {
      ...candidateEvidence,
      evidenceStatus: 'evidence-collected',
      licenseFacts: {
        ...candidateEvidence.licenseFacts,
        hostingDerivedArtifacts: 'yes',
        quantizationAllowed: 'yes',
        separateTokenizerTerms: 'no',
        acceptableUsePolicyApplies: 'no',
      },
      tokenizerEvidenceStatus: 'separate-terms-located',
      missingEvidence: [],
    },
    artifactEvidence: {
      ...input.artifactEvidence!,
      evidenceStatus: 'evidence-collected',
      missingEvidence: [],
    },
    integrityEvidence: {
      ...input.integrityEvidence!,
      evidenceStatus: 'evidence-collected',
      exactSupportFilesBytes: 1,
      exactSupportFilesMiB: 1 / (1024 * 1024),
      missingEvidence: [],
    },
  };
}

describe('Phase 5.6 model governance review packet', () => {
  it('builds exactly one packet per production candidate with consistent identity across every Phase 5 source', () => {
    const packets = listCurrentLocalModelGovernanceReviewPackets();
    assert.equal(packets.length, 3);
    assert.deepEqual(packets.map((packet) => packet.candidateId), LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId));
    assert.equal(new Set(packets.map((packet) => packet.candidateId)).size, 3);
    assert.ok(packets.every((packet) => String(packet.candidateTier) !== 'ultra-low'));
    for (const packet of packets) {
      const evidence = listLocalModelCandidateEvidence().find((item) => item.candidateId === packet.candidateId)!;
      const artifact = listLocalModelArtifactEvidence().find((item) => item.candidateId === packet.candidateId)!;
      const integrity = listLocalModelArtifactIntegrityEvidence().find((item) => item.candidateId === packet.candidateId)!;
      assert.equal(packet.candidateTier, evidence.candidateTier);
      assert.equal(packet.modelClass, evidence.modelClass);
      assert.equal(packet.exactModelName, evidence.exactModelName);
      assert.equal(packet.officialRepositoryId, artifact.officialRepositoryId);
      assert.equal(packet.observedRevision, artifact.observedRevision);
      assert.equal(packet.observedRevision, integrity.observedRevision);
    }
  });

  it('reconciles factual evidence without rewriting historical source statuses', () => {
    const before = structuredClone(listLocalModelCandidateEvidence());
    const packet = buildLocalModelGovernanceReviewPacket(currentInput());
    for (const id of [
      'exact-model-identity', 'official-publisher', 'base-license-identifier', 'official-license-text',
      'commercial-use', 'redistribution', 'derivative-works', 'attribution-notice', 'trademark-restrictions',
      'official-repository-identity', 'immutable-revision', 'artifact-format', 'official-base-variant',
      'official-quantized-variant', 'weight-file-inventory', 'weight-index-consistency', 'exact-weight-size',
      'config-provenance', 'tokenizer-provenance', 'license-file-provenance',
      'integrity-metadata-availability', 'integrity-algorithm-classification',
    ] as const) assert.equal(packet.requirements.find((item) => item.id === id)!.status, 'satisfied', id);
    assert.deepEqual(listLocalModelCandidateEvidence(), before);
    assert.equal(listLocalModelCandidateEvidence()[0].evidenceStatus, 'evidence-incomplete');
  });

  it('keeps legal and product governance requirements conservative', () => {
    const input = currentInput();
    assert.equal(requirementStatus(input, 'derived-artifact-hosting'), 'requires-human-decision');
    assert.equal(requirementStatus(input, 'quantization-conversion'), 'requires-human-decision');
    assert.equal(requirementStatus(input, 'tokenizer-license-scope'), 'unresolved');
    assert.equal(requirementStatus(input, 'acceptable-use-scope'), 'unresolved');
    assert.equal(requirementStatus(input, 'checksum-pinning-plan'), 'deferred-to-artifact-selection');
    assert.equal(requirementStatus(input, 'checksum-verification-plan'), 'deferred-to-artifact-selection');
    assert.equal(requirementStatus(input, 'runtime-support-file-bundle'), 'deferred-to-artifact-selection');
    assert.equal(requirementStatus(input, 'approved-download-size'), 'deferred-to-artifact-selection');
  });

  it('defers runtime compatibility and benchmark requirements instead of inferring them from formats or sizes', () => {
    const packet = buildLocalModelGovernanceReviewPacket(currentInput());
    for (const id of ['browser-runtime-compatibility', 'device-benchmark-evidence', 'tier-performance-budget'] as const) {
      const requirement = packet.requirements.find((item) => item.id === id)!;
      assert.equal(requirement.status, 'deferred-to-runtime-benchmark');
      assert.equal(requirement.runtimeBenchmarkRequired, true);
    }
    assert.equal(packet.benchmarkVerified, false);
    assert.equal(packet.runtimeReady, false);
  });

  it('distinguishes integrity evidence from checksum pinning and verification', () => {
    const packet = buildLocalModelGovernanceReviewPacket(currentInput());
    assert.equal(requirementStatus(currentInput(), 'integrity-metadata-availability'), 'satisfied');
    assert.equal(requirementStatus(currentInput(), 'integrity-algorithm-classification'), 'satisfied');
    assert.equal(packet.checksumPinned, false);
    assert.equal(packet.checksumVerified, false);
    assert.equal(packet.downloadable, false);
  });

  it('keeps all current packets reconciliation-incomplete and every approval/runtime boundary false', () => {
    for (const packet of buildCurrentLocalModelGovernanceReviewPackets()) {
      assert.equal(packet.status, 'evidence-reconciliation-incomplete');
      assert.ok(packet.unresolvedRequirements.length > 0);
      assert.equal(packet.humanGovernanceReviewRequired, true);
      assert.equal(packet.humanDecisionRecorded, false);
      assert.equal(packet.artifactSelectionRecorded, false);
      assert.equal(packet.modelApproved, false);
      assert.equal(packet.licenseApproved, false);
      assert.equal(packet.artifactApproved, false);
      assert.equal(packet.checksumPinned, false);
      assert.equal(packet.checksumVerified, false);
      assert.equal(packet.benchmarkVerified, false);
      assert.equal(packet.downloadable, false);
      assert.equal(packet.runtimeReady, false);
      assert.equal(packet.modelActive, false);
    }
  });

  it('moves to awaiting human governance review only when factual requirements are complete', () => {
    const packet = buildLocalModelGovernanceReviewPacket(completeFactualInput());
    assert.equal(packet.status, 'awaiting-human-governance-review');
    assert.equal(packet.unresolvedRequirements.length, 0);
    assert.ok(packet.humanDecisionRequirements.length > 0);
    assert.ok(packet.runtimeBenchmarkRequirements.length > 0);
    assert.equal(packet.modelApproved, false);
    assert.equal(packet.artifactApproved, false);
    assert.equal(packet.runtimeReady, false);
  });

  it('detects repository and revision mismatches without silently choosing a source', () => {
    const repositoryBase = currentInput();
    const repositoryMismatch: LocalModelGovernanceReviewPacketInput = {
      ...repositoryBase,
      integrityEvidence: { ...repositoryBase.integrityEvidence!, officialRepositoryId: 'Qwen/Other' },
    };
    assert.equal(buildLocalModelGovernanceReviewPacket(repositoryMismatch).status, 'conflicting-evidence');

    const revisionBase = currentInput();
    const revisionMismatch: LocalModelGovernanceReviewPacketInput = {
      ...revisionBase,
      integrityEvidence: { ...revisionBase.integrityEvidence!, observedRevision: '0000000000000000000000000000000000000000' },
    };
    const packet = buildLocalModelGovernanceReviewPacket(revisionMismatch);
    assert.equal(packet.status, 'conflicting-evidence');
    assert.equal(packet.requirements.find((item) => item.id === 'immutable-revision')!.status, 'conflicting');
  });

  it('detects weight inventory and exact file-byte inconsistencies while tolerating tensor-payload metadata semantics', () => {
    const current = buildLocalModelGovernanceReviewPacket(currentInput('qwen3-1-7b-candidate'));
    assert.notEqual(listLocalModelArtifactEvidence()[1].aggregateWeightSizeBytes, listLocalModelArtifactIntegrityEvidence()[1].exactWeightBytes);
    assert.equal(current.requirements.find((item) => item.id === 'exact-weight-size')!.status, 'satisfied');

    const inventoryBase = currentInput('qwen3-1-7b-candidate');
    const inventoryMismatch: LocalModelGovernanceReviewPacketInput = {
      ...inventoryBase,
      integrityEvidence: {
        ...inventoryBase.integrityEvidence!,
        requiredWeightFiles: inventoryBase.integrityEvidence!.requiredWeightFiles.slice(0, 1),
        weightShardCount: 1,
      },
    };
    assert.equal(buildLocalModelGovernanceReviewPacket(inventoryMismatch).status, 'conflicting-evidence');

    const sizeBase = currentInput('qwen3-1-7b-candidate');
    const sizeMismatch: LocalModelGovernanceReviewPacketInput = {
      ...sizeBase,
      integrityEvidence: { ...sizeBase.integrityEvidence!, exactWeightBytes: 1 },
    };
    assert.equal(buildLocalModelGovernanceReviewPacket(sizeMismatch).status, 'conflicting-evidence');
  });

  it('marks source conflicts as conflicting and rejected sources as rejected', () => {
    const conflictingBase = currentInput();
    const conflicting: LocalModelGovernanceReviewPacketInput = {
      ...conflictingBase,
      candidateEvidence: { ...conflictingBase.candidateEvidence!, evidenceStatus: 'conflicting-evidence', conflicts: ['official-source-conflict'] },
    };
    assert.equal(buildLocalModelGovernanceReviewPacket(conflicting).status, 'conflicting-evidence');

    const rejectedBase = currentInput();
    const rejected: LocalModelGovernanceReviewPacketInput = {
      ...rejectedBase,
      candidateEvidence: { ...rejectedBase.candidateEvidence!, evidenceStatus: 'rejected' },
    };
    assert.equal(buildLocalModelGovernanceReviewPacket(rejected).status, 'rejected');
  });

  it('keeps requirement IDs unique, output deterministic, and inputs immutable', () => {
    const input = currentInput();
    const before = structuredClone(input);
    const first = buildLocalModelGovernanceReviewPacket(input);
    const second = buildLocalModelGovernanceReviewPacket(input);
    assert.equal(LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS.length, new Set(LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS).size);
    assert.equal(first.requirements.length, LOCAL_MODEL_GOVERNANCE_REQUIREMENT_IDS.length);
    assert.equal(first.requirements.length, new Set(first.requirements.map((item) => item.id)).size);
    assert.deepEqual(first, second);
    assert.equal(first.blockers.length, new Set(first.blockers).size);
    assert.deepEqual(input, before);
  });

  it('validates duplicate and inconsistent packet collections safely', () => {
    const packets = buildCurrentLocalModelGovernanceReviewPackets();
    assert.equal(validateLocalModelGovernanceReviewPackets(packets).valid, true);
    const duplicate = [...packets, packets[0]];
    const validation = validateLocalModelGovernanceReviewPackets(duplicate);
    assert.equal(validation.valid, false);
    assert.ok(validation.issues.some((issue) => issue.includes('duplicate-candidate')));
  });

  it('does not change earlier gates, registries, manifest, closeout, or active-model state', () => {
    assert.equal(buildCurrentLocalModelCandidateReviewDecisions().filter((item) => item.canProceedToArtifactReview).length, 0);
    assert.equal(buildCurrentLocalModelArtifactSelections().filter((item) => item.artifactSelected).length, 0);
    assert.equal(LOCAL_MODEL_APPROVAL_REGISTRY.filter((item) => item.modelApproved || item.licenseApproved).length, 0);
    assert.equal(LOCAL_MODEL_ARTIFACT_MANIFEST.filter((item) => item.artifactApproved || item.downloadable || item.runtimeReady).length, 0);
    const closeout = buildCurrentLocalModelAcquisitionCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.activeModels, 0);
  });

  it('contains no runtime side effects, automatic approval, credentials, or direct download locations', () => {
    const sources = [
      read('../../src/platform/ai/localModelGovernanceReviewPacketTypes.ts'),
      read('../../src/platform/ai/localModelGovernanceReviewPacket.ts'),
      read('../../src/platform/ai/localModelGovernanceReviewPacketViewModel.ts'),
      read('../../src/components/ai/LocalAIReadinessShell.tsx'),
    ].join('\n');
    for (const pattern of [
      /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/, /AIService/,
      /\.execute\s*\(/, /Math\.random/, /Date\.now/, /setTimeout/, /\bWorker\s*\(/,
      /SharedWorker\s*\(/, /serviceWorker\.register/, /modelApproved:\s*true/,
      /artifactApproved:\s*true/, /checksumPinned:\s*true/, /benchmarkVerified:\s*true/,
      /downloadable:\s*true/, /runtimeReady:\s*true/, /modelActive:\s*true/,
      /https?:\/\/[^\s'\"]+\.(?:safetensors|bin|gguf)(?:$|[?#])/i,
    ]) assert.equal(pattern.test(sources), false, `forbidden pattern ${pattern}`);
  });
});
