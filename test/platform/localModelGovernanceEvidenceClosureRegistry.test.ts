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
import { listCurrentLocalModelGovernanceReviewPackets } from '../../src/platform/ai/localModelGovernanceReviewPacket.ts';
import {
  evaluateLocalModelGovernanceEvidenceClosure,
  getLocalModelGovernanceEvidenceClosure,
  getLocalModelGovernanceEvidenceClosureImpact,
  getRequirementClosure,
  listLocalModelGovernanceEvidenceClosures,
  validateLocalModelGovernanceEvidenceClosureRegistry,
} from '../../src/platform/ai/localModelGovernanceEvidenceClosureRegistry.ts';
import type {
  LocalModelGovernanceEvidenceClosureCandidateRecord,
  LocalModelGovernanceEvidenceClosureRequirementId,
} from '../../src/platform/ai/localModelGovernanceEvidenceClosureTypes.ts';

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const REQUIRED_IDS: readonly LocalModelGovernanceEvidenceClosureRequirementId[] = [
  'tokenizer-license-scope',
  'acceptable-use-scope',
  'derived-artifact-hosting',
  'quantization-conversion',
];

function cloneFirst(): LocalModelGovernanceEvidenceClosureCandidateRecord {
  return structuredClone(listLocalModelGovernanceEvidenceClosures()[0]!);
}

describe('Phase 5.7 unresolved model governance evidence closure registry', () => {
  it('creates exactly three candidate records and twelve unique requirement closures', () => {
    const records = listLocalModelGovernanceEvidenceClosures();
    assert.equal(records.length, 3);
    assert.deepEqual(records.map((record) => record.candidateId), LOCAL_MODEL_APPROVAL_REGISTRY.map((candidate) => candidate.candidateId));
    assert.equal(records.reduce((sum, record) => sum + record.requirements.length, 0), 12);
    assert.ok(records.every((record) => record.requirements.length === 4));
    assert.ok(records.every((record) => new Set(record.requirements.map((item) => item.requirementId)).size === 4));
    assert.ok(records.every((record) => REQUIRED_IDS.every((id) => record.requirements.some((item) => item.requirementId === id))));
    assert.ok(records.every((record) => String(record.candidateTier) !== 'ultra-low'));
  });

  it('keeps candidate, tier, model, repository and immutable revision aligned with the Phase 5.6 packet', () => {
    const packets = listCurrentLocalModelGovernanceReviewPackets();
    for (const record of listLocalModelGovernanceEvidenceClosures()) {
      const packet = packets.find((item) => item.candidateId === record.candidateId)!;
      assert.equal(record.candidateTier, packet.candidateTier);
      assert.equal(record.modelClass, packet.modelClass);
      assert.equal(record.exactModelName, packet.exactModelName);
      assert.equal(record.officialRepositoryId, packet.officialRepositoryId);
      assert.equal(record.observedRevision, packet.observedRevision);
    }
  });

  it('closes tokenizer factual scope only with official repository files and repository-license evidence', () => {
    for (const record of listLocalModelGovernanceEvidenceClosures()) {
      const requirement = getRequirementClosure(record.candidateId, 'tokenizer-license-scope')!;
      assert.equal(requirement.status, 'factual-evidence-collected');
      assert.equal(requirement.factualEvidenceComplete, true);
      assert.equal(requirement.approved, false);
      assert.ok(requirement.sourceIds.length >= 3);
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-repository-file-tree'));
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-repository-license'));
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-apache-license-guidance'));
      assert.equal(record.tokenizerLicenseScope, 'yes');
    }

    const missingLicense = cloneFirst();
    const requirement = missingLicense.requirements.find((item) => item.requirementId === 'tokenizer-license-scope')!;
    const changed = {
      ...missingLicense,
      sources: missingLicense.sources.filter((source) => source.sourceKind !== 'official-repository-license'),
      requirements: missingLicense.requirements.map((item) => item.requirementId === requirement.requirementId
        ? { ...item, sourceIds: item.sourceIds.filter((id) => !id.endsWith('-repository-license')) }
        : item),
    };
    const evaluated = evaluateLocalModelGovernanceEvidenceClosure(changed);
    assert.equal(getRequirementClosure(evaluated.candidateId, 'tokenizer-license-scope', evaluated)?.status, 'unresolved');
    assert.equal(evaluated.tokenizerLicenseScope, 'unknown');
  });

  it('records the official Qwen Usage Policy as applicable factual evidence without turning it into approval', () => {
    for (const record of listLocalModelGovernanceEvidenceClosures()) {
      const requirement = getRequirementClosure(record.candidateId, 'acceptable-use-scope')!;
      assert.equal(requirement.status, 'factual-evidence-collected');
      assert.equal(requirement.factualEvidenceComplete, true);
      assert.equal(requirement.humanDecisionRequired, true);
      assert.equal(requirement.approved, false);
      assert.equal(record.acceptableUseScope, 'yes');
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-publisher-policy'));
    }

    const ambiguous = cloneFirst();
    const changed = {
      ...ambiguous,
      sources: ambiguous.sources.filter((source) => source.sourceKind !== 'official-publisher-policy'),
      requirements: ambiguous.requirements.map((item) => item.requirementId === 'acceptable-use-scope'
        ? { ...item, sourceIds: [] }
        : item),
    };
    const evaluated = evaluateLocalModelGovernanceEvidenceClosure(changed);
    assert.equal(getRequirementClosure(evaluated.candidateId, 'acceptable-use-scope', evaluated)?.status, 'unresolved');
    assert.equal(evaluated.acceptableUseScope, 'unknown');
  });

  it('collects sufficient facts for derived-artifact hosting while preserving explicit product and legal review', () => {
    for (const record of listLocalModelGovernanceEvidenceClosures()) {
      const requirement = getRequirementClosure(record.candidateId, 'derived-artifact-hosting')!;
      assert.equal(requirement.status, 'sufficient-for-human-decision');
      assert.equal(requirement.factualEvidenceComplete, true);
      assert.equal(requirement.humanDecisionRequired, true);
      assert.equal(requirement.productLegalReviewRequired, true);
      assert.equal(requirement.decisionRecorded, false);
      assert.equal(requirement.approved, false);
      assert.equal(record.derivedArtifactHosting, 'unknown');
      assert.match(requirement.factualSummary, /redistribution|Derivative Works/i);
    }
  });

  it('collects quantization and conversion facts without selecting or approving a quantization', () => {
    for (const record of listLocalModelGovernanceEvidenceClosures()) {
      const requirement = getRequirementClosure(record.candidateId, 'quantization-conversion')!;
      assert.equal(requirement.status, 'sufficient-for-human-decision');
      assert.equal(requirement.humanDecisionRequired, true);
      assert.equal(requirement.approved, false);
      assert.equal(record.quantizationConversion, 'unknown');
      assert.ok(record.sources.some((source) => source.sourceKind === 'official-model-card' && source.repositoryId?.endsWith('-GGUF')));
      assert.equal(record.artifactSelected, false);
      assert.equal(record.artifactApproved, false);
    }
  });

  it('does not treat source conflicts, community sources or unknown truth values as resolved facts', () => {
    const record = cloneFirst();
    const conflicting = evaluateLocalModelGovernanceEvidenceClosure({
      ...record,
      tokenizerLicenseScope: 'conflicting',
      requirements: record.requirements.map((item) => item.requirementId === 'tokenizer-license-scope'
        ? { ...item, conflicts: ['upstream-tokenizer-license-conflict'] }
        : item),
    });
    assert.equal(conflicting.status, 'conflicting-evidence');
    assert.equal(getRequirementClosure(conflicting.candidateId, 'tokenizer-license-scope', conflicting)?.status, 'conflicting-evidence');

    const unknown = evaluateLocalModelGovernanceEvidenceClosure({
      ...record,
      acceptableUseScope: 'unknown',
      requirements: record.requirements.map((item) => item.requirementId === 'acceptable-use-scope'
        ? { ...item, sourceIds: [], missingEvidence: ['official-policy-applicability'] }
        : item),
    });
    assert.equal(unknown.acceptableUseScope, 'unknown');
    assert.equal(getRequirementClosure(unknown.candidateId, 'acceptable-use-scope', unknown)?.status, 'unresolved');
  });

  it('keeps every approval, selection, checksum, benchmark and runtime boundary false', () => {
    for (const record of listLocalModelGovernanceEvidenceClosures()) {
      assert.equal(record.humanGovernanceReviewRequired, true);
      assert.equal(record.humanDecisionRecorded, false);
      assert.equal(record.modelApproved, false);
      assert.equal(record.licenseApproved, false);
      assert.equal(record.artifactSelected, false);
      assert.equal(record.artifactApproved, false);
      assert.equal(record.checksumPinned, false);
      assert.equal(record.benchmarkVerified, false);
      assert.equal(record.downloadable, false);
      assert.equal(record.runtimeReady, false);
      assert.equal(record.modelActive, false);
      assert.equal(record.evidenceClosureOnly, true);
      assert.ok(record.requirements.every((item) => item.decisionRecorded === false && item.approved === false));
    }
  });

  it('describes additive impact without mutating the Phase 5.6 packet', () => {
    const before = structuredClone(listCurrentLocalModelGovernanceReviewPackets());
    const impact = getLocalModelGovernanceEvidenceClosureImpact('qwen3-0-6b-candidate');
    assert.equal(impact.currentPacketStatus, 'evidence-reconciliation-incomplete');
    assert.equal(impact.projectedRequirementStatuses['tokenizer-license-scope'], 'satisfied');
    assert.equal(impact.projectedRequirementStatuses['acceptable-use-scope'], 'satisfied');
    assert.equal(impact.projectedRequirementStatuses['derived-artifact-hosting'], 'requires-human-decision');
    assert.equal(impact.projectedRequirementStatuses['quantization-conversion'], 'requires-human-decision');
    assert.deepEqual(listCurrentLocalModelGovernanceReviewPackets(), before);
  });

  it('validates deterministically without mutating records and rejects unsafe sources', () => {
    const before = structuredClone(listLocalModelGovernanceEvidenceClosures());
    const first = validateLocalModelGovernanceEvidenceClosureRegistry();
    const second = validateLocalModelGovernanceEvidenceClosureRegistry();
    assert.deepEqual(first, second);
    assert.equal(first.valid, true);
    assert.deepEqual(listLocalModelGovernanceEvidenceClosures(), before);
    assert.ok(before.flatMap((record) => record.sources).every((source) => source.officialPublisher));
    assert.ok(before.flatMap((record) => record.sources).every((source) => !/\/resolve\/|[?&](?:token|signature|sig|expires|key)=|\.(?:safetensors|gguf|bin)(?:$|[?#])/i.test(source.reference)));
  });

  it('does not modify historical Phase 5 registries, approval registry, manifest or Phase 4 closeout', () => {
    const snapshots = {
      candidateEvidence: structuredClone(listLocalModelCandidateEvidence()),
      decisions: structuredClone(buildCurrentLocalModelCandidateReviewDecisions()),
      artifactEvidence: structuredClone(listLocalModelArtifactEvidence()),
      selections: structuredClone(buildCurrentLocalModelArtifactSelections()),
      integrity: structuredClone(listLocalModelArtifactIntegrityEvidence()),
      packets: structuredClone(listCurrentLocalModelGovernanceReviewPackets()),
      approvals: structuredClone(LOCAL_MODEL_APPROVAL_REGISTRY),
      manifest: structuredClone(LOCAL_MODEL_ARTIFACT_MANIFEST),
    };
    listLocalModelGovernanceEvidenceClosures();
    assert.deepEqual(listLocalModelCandidateEvidence(), snapshots.candidateEvidence);
    assert.deepEqual(buildCurrentLocalModelCandidateReviewDecisions(), snapshots.decisions);
    assert.deepEqual(listLocalModelArtifactEvidence(), snapshots.artifactEvidence);
    assert.deepEqual(buildCurrentLocalModelArtifactSelections(), snapshots.selections);
    assert.deepEqual(listLocalModelArtifactIntegrityEvidence(), snapshots.integrity);
    assert.deepEqual(listCurrentLocalModelGovernanceReviewPackets(), snapshots.packets);
    assert.deepEqual(LOCAL_MODEL_APPROVAL_REGISTRY, snapshots.approvals);
    assert.deepEqual(LOCAL_MODEL_ARTIFACT_MANIFEST, snapshots.manifest);
    const closeout = buildCurrentLocalModelAcquisitionCloseout();
    assert.equal(closeout.status, 'foundation-complete');
    assert.equal(closeout.phaseFoundationComplete, true);
    assert.equal(closeout.activeModels, 0);
  });

  it('keeps Phase 5.7 runtime source free of network, persistence and execution APIs', () => {
    const sources = [
      read('../../src/platform/ai/localModelGovernanceEvidenceClosureTypes.ts'),
      read('../../src/platform/ai/localModelGovernanceEvidenceClosureRegistry.ts'),
      read('../../src/platform/ai/localModelGovernanceEvidenceClosureViewModel.ts'),
    ].join('\n');
    for (const forbidden of [
      /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /indexedDB/, /CacheStorage/, /caches\.open/,
      /localStorage/, /sessionStorage/, /requestAdapter\s*\(/, /requestDevice\s*\(/,
      /AIService/, /\.execute\s*\(/, /Math\.random/, /Date\.now/, /setTimeout/,
      /\bWorker\s*\(/, /SharedWorker\s*\(/, /serviceWorker\.register/,
    ]) assert.doesNotMatch(sources, forbidden);
  });
});
