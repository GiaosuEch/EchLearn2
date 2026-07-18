import { listCurrentLocalModelGovernanceReviewPackets } from './localModelGovernanceReviewPacket.ts';
import type {
  LocalModelGovernanceReviewPacket,
  LocalModelGovernanceReviewPacketStatus,
} from './localModelGovernanceReviewPacketTypes.ts';

export interface LocalModelGovernanceReviewPacketRow {
  readonly candidateId: string;
  readonly candidateTier: string;
  readonly modelClass: string;
  readonly exactModelName: string;
  readonly officialRepositoryId: string | null;
  readonly status: LocalModelGovernanceReviewPacketStatus;
  readonly statusLabel: string;
  readonly requirementSummary: string;
  readonly unresolvedRequirements: number;
  readonly humanDecisionRequirements: number;
  readonly runtimeBenchmarkRequirements: number;
  readonly modelApproved: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelActive: false;
}

export interface LocalModelGovernanceReviewPacketViewModel {
  readonly heading: 'Model & Artifact Evidence Reconciliation';
  readonly packetSummary: 'Governance review packet only';
  readonly reconciliationSummary: 'Evidence from Phase 5.1, 5.3 and 5.5 has been reconciled';
  readonly governanceSummary: 'Human governance decisions are not recorded · Some evidence remains unresolved';
  readonly runtimeBenchmarkSummary: 'Runtime benchmark evidence remains deferred';
  readonly approvalBoundarySummary: 'No model approved · No artifact selected · No artifact approved · No checksum pinned · No benchmark passed · No download available · No model active · Production execution remains unavailable';
  readonly candidateRows: readonly LocalModelGovernanceReviewPacketRow[];
  readonly aggregate: {
    readonly totalCandidates: number;
    readonly reconciliationIncompleteCandidates: number;
    readonly awaitingHumanGovernanceReviewCandidates: number;
    readonly conflictingCandidates: number;
    readonly attentionRequiredCandidates: number;
    readonly totalRequirements: number;
    readonly satisfiedRequirements: number;
    readonly unresolvedRequirements: number;
    readonly humanDecisionRequirements: number;
    readonly runtimeBenchmarkRequirements: number;
    readonly humanDecisionsRecorded: number;
    readonly selectedArtifacts: number;
    readonly approvedArtifacts: number;
    readonly checksumPinnedArtifacts: number;
    readonly downloadableArtifacts: number;
    readonly runtimeReadyArtifacts: number;
    readonly activeModels: number;
  };
  readonly unresolvedRequirements: readonly string[];
  readonly conflictingRequirements: readonly string[];
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly documentPath: 'docs/ai/phase-5-model-governance-review-packet.md';
  readonly packetOnly: true;
  readonly humanDecisionRecorded: false;
  readonly modelApproved: false;
  readonly modelActive: false;
}

function statusLabel(status: LocalModelGovernanceReviewPacketStatus): string {
  switch (status) {
    case 'awaiting-human-governance-review':
      return 'Factual evidence is reconciled; explicit human governance decisions are still required.';
    case 'conflicting-evidence':
      return 'Conflicting evidence must be resolved before governance review.';
    case 'rejected':
      return 'A source review rejected this candidate scope.';
    case 'attention-required':
      return 'Candidate or artifact source records are inconsistent and require attention.';
    default:
      return 'Some evidence remains unresolved.';
  }
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

export function buildLocalModelGovernanceReviewPacketViewModel(
  packets: readonly LocalModelGovernanceReviewPacket[] = listCurrentLocalModelGovernanceReviewPackets(),
): LocalModelGovernanceReviewPacketViewModel {
  const candidateRows = packets.map((packet): LocalModelGovernanceReviewPacketRow => ({
    candidateId: packet.candidateId,
    candidateTier: packet.candidateTier,
    modelClass: packet.modelClass,
    exactModelName: packet.exactModelName,
    officialRepositoryId: packet.officialRepositoryId,
    status: packet.status,
    statusLabel: statusLabel(packet.status),
    requirementSummary: `${packet.satisfiedRequirements.length} satisfied · ${packet.unresolvedRequirements.length} unresolved · ${packet.humanDecisionRequirements.length} human decisions · ${packet.runtimeBenchmarkRequirements.length} runtime or benchmark deferrals`,
    unresolvedRequirements: packet.unresolvedRequirements.length,
    humanDecisionRequirements: packet.humanDecisionRequirements.length,
    runtimeBenchmarkRequirements: packet.runtimeBenchmarkRequirements.length,
    modelApproved: false,
    artifactSelected: false,
    artifactApproved: false,
    modelActive: false,
  }));

  return {
    heading: 'Model & Artifact Evidence Reconciliation',
    packetSummary: 'Governance review packet only',
    reconciliationSummary: 'Evidence from Phase 5.1, 5.3 and 5.5 has been reconciled',
    governanceSummary: 'Human governance decisions are not recorded · Some evidence remains unresolved',
    runtimeBenchmarkSummary: 'Runtime benchmark evidence remains deferred',
    approvalBoundarySummary: 'No model approved · No artifact selected · No artifact approved · No checksum pinned · No benchmark passed · No download available · No model active · Production execution remains unavailable',
    candidateRows,
    aggregate: {
      totalCandidates: packets.length,
      reconciliationIncompleteCandidates: packets.filter((packet) => packet.status === 'evidence-reconciliation-incomplete').length,
      awaitingHumanGovernanceReviewCandidates: packets.filter((packet) => packet.status === 'awaiting-human-governance-review').length,
      conflictingCandidates: packets.filter((packet) => packet.status === 'conflicting-evidence').length,
      attentionRequiredCandidates: packets.filter((packet) => packet.status === 'attention-required').length,
      totalRequirements: packets.reduce((sum, packet) => sum + packet.requirements.length, 0),
      satisfiedRequirements: packets.reduce((sum, packet) => sum + packet.satisfiedRequirements.length, 0),
      unresolvedRequirements: packets.reduce((sum, packet) => sum + packet.unresolvedRequirements.length, 0),
      humanDecisionRequirements: packets.reduce((sum, packet) => sum + packet.humanDecisionRequirements.length, 0),
      runtimeBenchmarkRequirements: packets.reduce((sum, packet) => sum + packet.runtimeBenchmarkRequirements.length, 0),
      humanDecisionsRecorded: packets.filter((packet) => packet.humanDecisionRecorded).length,
      selectedArtifacts: packets.filter((packet) => packet.artifactSelectionRecorded).length,
      approvedArtifacts: packets.filter((packet) => packet.artifactApproved).length,
      checksumPinnedArtifacts: packets.filter((packet) => packet.checksumPinned).length,
      downloadableArtifacts: packets.filter((packet) => packet.downloadable).length,
      runtimeReadyArtifacts: packets.filter((packet) => packet.runtimeReady).length,
      activeModels: packets.filter((packet) => packet.modelActive).length,
    },
    unresolvedRequirements: unique(packets.flatMap((packet) => packet.unresolvedRequirements)),
    conflictingRequirements: unique(packets.flatMap((packet) => packet.conflictingRequirements)),
    blockers: unique(packets.flatMap((packet) => packet.blockers)),
    warnings: unique(packets.flatMap((packet) => packet.warnings)),
    documentPath: 'docs/ai/phase-5-model-governance-review-packet.md',
    packetOnly: true,
    humanDecisionRecorded: false,
    modelApproved: false,
    modelActive: false,
  };
}
