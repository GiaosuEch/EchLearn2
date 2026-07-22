export type LocalModelGovernanceApplicationArtifactSelectionReviewStatus =
  | 'review-not-requested'
  | 'bridge-ineligible'
  | 'selection-session-unavailable'
  | 'scope-mismatch'
  | 'failed-safe'
  | 'ready-for-human-selection'
  | 'selection-already-recorded';

export interface LocalModelGovernanceApplicationArtifactSelectionReviewRequest {
  readonly bridgeDecision: unknown;
  readonly selectionResult: unknown;
  readonly explicitReviewRequested: boolean;
}

export interface LocalModelGovernanceApplicationArtifactSelectionReviewResult {
  readonly status: LocalModelGovernanceApplicationArtifactSelectionReviewStatus;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly explicitReviewRequested: boolean;
  readonly bridgeDecisionKey: string | null;
  readonly candidateId: string | null;
  readonly candidateTier: string | null;
  readonly observedRevision: string | null;
  readonly selectionSessionStatus: string | null;
  readonly bridgeVerified: boolean;
  readonly selectionScopeVerified: boolean;
  readonly canBeginHumanSelection: boolean;
  readonly reviewPersisted: false;
  readonly artifactSelected: false;
  readonly artifactApproved: false;
  readonly modelApproved: false;
  readonly licenseApproved: false;
  readonly checksumVerified: false;
  readonly benchmarkVerified: false;
  readonly downloadable: false;
  readonly runtimeReady: false;
  readonly modelActive: false;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function flag(value: UnknownRecord, key: string): boolean {
  return value[key] === true;
}

function baseResult(
  status: LocalModelGovernanceApplicationArtifactSelectionReviewStatus,
  options: Partial<LocalModelGovernanceApplicationArtifactSelectionReviewResult> = {},
): LocalModelGovernanceApplicationArtifactSelectionReviewResult {
  return {
    status,
    blockers: options.blockers ?? Object.freeze([]),
    warnings: options.warnings ?? Object.freeze([]),
    explicitReviewRequested: options.explicitReviewRequested ?? false,
    bridgeDecisionKey: options.bridgeDecisionKey ?? null,
    candidateId: options.candidateId ?? null,
    candidateTier: options.candidateTier ?? null,
    observedRevision: options.observedRevision ?? null,
    selectionSessionStatus: options.selectionSessionStatus ?? null,
    bridgeVerified: options.bridgeVerified ?? false,
    selectionScopeVerified: options.selectionScopeVerified ?? false,
    canBeginHumanSelection: options.canBeginHumanSelection ?? false,
    reviewPersisted: false,
    artifactSelected: false,
    artifactApproved: false,
    modelApproved: false,
    licenseApproved: false,
    checksumVerified: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

function bridgeIsEligible(bridge: UnknownRecord): boolean {
  if (
    bridge.status !== 'eligible-for-artifact-selection-review'
    || bridge.bridgeEligible !== true
    || bridge.artifactSelectionReviewEligible !== true
    || text(bridge.bridgeDecisionKey) === null
    || text(bridge.candidateId) === null
    || text(bridge.candidateTier) === null
    || text(bridge.observedRevision) === null
  ) return false;

  return ![
    'artifactSelected', 'artifactApproved', 'modelApproved', 'licenseApproved',
    'checksumVerified', 'benchmarkVerified', 'downloadable', 'runtimeReady', 'modelActive',
  ].some((key) => flag(bridge, key));
}

function selectionMatchesBridge(selection: UnknownRecord, bridge: UnknownRecord): boolean {
  if (
    text(selection.candidateId) !== text(bridge.candidateId)
    || text(selection.candidateTier) !== text(bridge.candidateTier)
  ) return false;

  const options = selection.availableOptions;
  if (!Array.isArray(options) || options.length === 0) return false;
  return options.every((option) => (
    isRecord(option)
    && text(option.candidateId) === text(bridge.candidateId)
    && text(option.observedRevision) === text(bridge.observedRevision)
  ));
}

export function evaluateLocalModelGovernanceApplicationArtifactSelectionReview(
  request: LocalModelGovernanceApplicationArtifactSelectionReviewRequest,
): LocalModelGovernanceApplicationArtifactSelectionReviewResult {
  try {
    if (!isRecord(request) || request.explicitReviewRequested !== true) {
      return baseResult('review-not-requested');
    }
    if (!isRecord(request.bridgeDecision) || !isRecord(request.selectionResult)) {
      return baseResult('failed-safe', { explicitReviewRequested: true, blockers: Object.freeze(['invalid-review-input']) });
    }

    const bridge = request.bridgeDecision;
    const selection = request.selectionResult;
    const context = {
      explicitReviewRequested: true,
      bridgeDecisionKey: text(bridge.bridgeDecisionKey),
      candidateId: text(bridge.candidateId),
      candidateTier: text(bridge.candidateTier),
      observedRevision: text(bridge.observedRevision),
      selectionSessionStatus: text(selection.status),
    };

    if (!bridgeIsEligible(bridge)) {
      return baseResult('bridge-ineligible', { ...context, blockers: Object.freeze(['bridge-decision-not-eligible']) });
    }
    if (selection.status === 'selection-recorded') {
      return baseResult('selection-already-recorded', {
        ...context,
        bridgeVerified: true,
        selectionScopeVerified: selectionMatchesBridge(selection, bridge),
        warnings: Object.freeze(['human-artifact-selection-is-already-recorded']),
      });
    }
    if (selection.status !== 'awaiting-human-selection') {
      return baseResult('selection-session-unavailable', {
        ...context,
        bridgeVerified: true,
        blockers: Object.freeze(['selection-session-is-not-awaiting-human-selection']),
      });
    }
    if (!selectionMatchesBridge(selection, bridge)) {
      return baseResult('scope-mismatch', {
        ...context,
        bridgeVerified: true,
        blockers: Object.freeze(['bridge-and-selection-scope-mismatch']),
      });
    }
    return baseResult('ready-for-human-selection', {
      ...context,
      bridgeVerified: true,
      selectionScopeVerified: true,
      canBeginHumanSelection: true,
      warnings: Object.freeze([
        'Review eligibility does not select, approve, download, benchmark, initialize, or activate an artifact.',
      ]),
    });
  } catch {
    return baseResult('failed-safe', { blockers: Object.freeze(['review-adapter-failed-safe']) });
  }
}
