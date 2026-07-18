import {
  listLocalModelCandidateEvidence,
} from './localModelCandidateEvidenceRegistry.ts';
import type {
  LocalModelCandidateEvidenceRecord,
  LocalModelEvidenceTruthValue,
} from './localModelCandidateEvidenceTypes.ts';
import {
  LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES,
  LOCAL_MODEL_CANDIDATE_REVIEW_DECISION_REVISION,
} from './localModelCandidateReviewDecisionTypes.ts';
import type {
  LocalModelCandidateReviewCategory,
  LocalModelCandidateReviewDecisionInput,
  LocalModelCandidateReviewDecisionInputValidation,
  LocalModelCandidateReviewDecisionResult,
  LocalModelCandidateReviewDecisions,
} from './localModelCandidateReviewDecisionTypes.ts';

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function unique(values: readonly string[]): readonly string[] {
  const result: string[] = [];
  for (const value of values) appendUnique(result, value);
  return result;
}

function createDecisions(
  value: LocalModelCandidateReviewDecisions[LocalModelCandidateReviewCategory],
): LocalModelCandidateReviewDecisions {
  return Object.fromEntries(
    LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES.map((category) => [category, value]),
  ) as unknown as LocalModelCandidateReviewDecisions;
}

function isKnownTruthValue(value: LocalModelEvidenceTruthValue): boolean {
  return value !== 'unknown';
}

export function isLocalModelCandidateEvidenceCompleteForReview(
  evidence: LocalModelCandidateEvidenceRecord | null,
): boolean {
  if (!evidence) return false;
  const facts = evidence.licenseFacts;
  return evidence.evidenceStatus === 'evidence-collected'
    && evidence.missingEvidence.length === 0
    && evidence.conflicts.length === 0
    && evidence.officialIdentityConfirmed
    && evidence.exactModelName.trim().length > 0
    && evidence.publisher.trim().length > 0
    && evidence.licenseIdentifier !== null
    && evidence.licenseTextLocated
    && isKnownTruthValue(facts.commercialUse)
    && isKnownTruthValue(facts.redistribution)
    && isKnownTruthValue(facts.hostingDerivedArtifacts)
    && isKnownTruthValue(facts.derivativeWorks)
    && isKnownTruthValue(facts.quantizationAllowed)
    && isKnownTruthValue(facts.attributionRequired)
    && isKnownTruthValue(facts.noticeRequired)
    && isKnownTruthValue(facts.separateTokenizerTerms)
    && isKnownTruthValue(facts.acceptableUsePolicyApplies);
}

function isSupportedNotApplicable(
  category: LocalModelCandidateReviewCategory,
  evidence: LocalModelCandidateEvidenceRecord | null,
): boolean {
  if (!evidence) return false;
  if (category === 'tokenizerTerms') {
    return evidence.licenseFacts.separateTokenizerTerms === 'no';
  }
  if (category === 'acceptableUseScope') {
    return evidence.licenseFacts.acceptableUsePolicyApplies === 'no';
  }
  return false;
}

function hasExplicitDecision(input: LocalModelCandidateReviewDecisionInput): boolean {
  return LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES.some((category) => {
    const decision = input.decisions[category];
    return decision === 'approved' || decision === 'rejected' || decision === 'not-applicable';
  });
}

export function createUnreviewedLocalModelCandidateReviewInput(
  evidenceRecord: LocalModelCandidateEvidenceRecord,
): LocalModelCandidateReviewDecisionInput {
  const needsEvidence = !isLocalModelCandidateEvidenceCompleteForReview(evidenceRecord);
  return {
    candidateId: evidenceRecord.candidateId,
    candidateTier: evidenceRecord.candidateTier,
    evidenceRecord,
    decisions: createDecisions(needsEvidence ? 'needs-more-evidence' : 'not-reviewed'),
    decisionRecorded: false,
    decisionRevision: LOCAL_MODEL_CANDIDATE_REVIEW_DECISION_REVISION,
  };
}

export function validateLocalModelCandidateReviewDecisionInput(
  input: LocalModelCandidateReviewDecisionInput,
): LocalModelCandidateReviewDecisionInputValidation {
  const issues: string[] = [];
  const evidence = input.evidenceRecord;

  if (input.decisionRevision !== LOCAL_MODEL_CANDIDATE_REVIEW_DECISION_REVISION) {
    appendUnique(issues, 'decision-revision-mismatch');
  }
  if (!evidence) {
    appendUnique(issues, 'unknown-candidate');
  } else {
    if (input.candidateId !== evidence.candidateId) appendUnique(issues, 'candidate-id-mismatch');
    if (input.candidateTier !== evidence.candidateTier) appendUnique(issues, 'candidate-tier-mismatch');
    const expectedModelClassByTier = { light: '0.6B', standard: '1.7B', pro: '4B' } as const;
    if (evidence.modelClass !== expectedModelClassByTier[evidence.candidateTier]) {
      appendUnique(issues, 'model-class-mismatch');
    }
  }

  for (const category of LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES) {
    const decision = input.decisions[category];
    if (!decision) appendUnique(issues, `missing-review-decision:${category}`);
    if (decision === 'not-applicable' && !isSupportedNotApplicable(category, evidence)) {
      appendUnique(issues, `invalid-not-applicable:${category}`);
    }
  }

  if (!input.decisionRecorded && hasExplicitDecision(input)) {
    appendUnique(issues, 'decision-recorded-flag-mismatch');
  }

  const evidenceComplete = isLocalModelCandidateEvidenceCompleteForReview(evidence);
  const hasApprovedOrNotApplicable = LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES.some(
    (category) => input.decisions[category] === 'approved'
      || input.decisions[category] === 'not-applicable',
  );
  if (!evidenceComplete && hasApprovedOrNotApplicable) {
    appendUnique(issues, 'approved-decision-with-incomplete-evidence');
  }
  if (evidence?.conflicts.length && hasApprovedOrNotApplicable) {
    appendUnique(issues, 'approved-decision-with-conflicting-evidence');
  }

  return { valid: issues.length === 0, issues };
}

export function validateLocalModelCandidateReviewDecisionInputs(
  inputs: readonly LocalModelCandidateReviewDecisionInput[],
): LocalModelCandidateReviewDecisionInputValidation {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    if (seen.has(input.candidateId)) {
      appendUnique(issues, `duplicate-candidate-decision:${input.candidateId}`);
    }
    seen.add(input.candidateId);
    for (const issue of validateLocalModelCandidateReviewDecisionInput(input).issues) {
      appendUnique(issues, `${input.candidateId}:${issue}`);
    }
  }
  return { valid: issues.length === 0, issues };
}

export function evaluateLocalModelCandidateReviewDecision(
  input: LocalModelCandidateReviewDecisionInput,
): LocalModelCandidateReviewDecisionResult {
  const validation = validateLocalModelCandidateReviewDecisionInput(input);
  const evidence = input.evidenceRecord;
  const evidenceComplete = isLocalModelCandidateEvidenceCompleteForReview(evidence);
  const evidenceConflictFree = Boolean(
    evidence
    && evidence.evidenceStatus !== 'conflicting-evidence'
    && evidence.conflicts.length === 0,
  );
  const rejectedReviewItems = LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES.filter(
    (category) => input.decisions[category] === 'rejected',
  );
  const unresolvedReviewItems = LOCAL_MODEL_CANDIDATE_REQUIRED_REVIEW_CATEGORIES.filter(
    (category) => input.decisions[category] !== 'approved'
      && !(input.decisions[category] === 'not-applicable'
        && isSupportedNotApplicable(category, evidence)),
  );

  let status: LocalModelCandidateReviewDecisionResult['status'];
  if (!validation.valid) {
    status = 'attention-required';
  } else if (evidence?.evidenceStatus === 'rejected') {
    status = 'rejected';
  } else if (!evidenceConflictFree) {
    status = 'attention-required';
  } else if (!evidenceComplete) {
    status = 'needs-more-evidence';
  } else if (!input.decisionRecorded) {
    status = 'awaiting-human-decision';
  } else if (rejectedReviewItems.length > 0) {
    status = 'rejected';
  } else if (unresolvedReviewItems.length === 0) {
    status = 'approved-for-artifact-review';
  } else {
    status = 'awaiting-human-decision';
  }

  const blockers: string[] = [...validation.issues];
  if (!evidence) appendUnique(blockers, 'candidate-evidence-unavailable');
  if (evidence?.evidenceStatus === 'rejected') appendUnique(blockers, 'evidence-rejected');
  if (!evidenceConflictFree) {
    appendUnique(blockers, 'evidence-conflict');
    for (const conflict of evidence?.conflicts ?? []) appendUnique(blockers, `conflict:${conflict}`);
  }
  if (!evidenceComplete && evidence) {
    appendUnique(blockers, 'evidence-incomplete');
    for (const missing of evidence.missingEvidence) appendUnique(blockers, `missing-evidence:${missing}`);
  }
  if (status === 'awaiting-human-decision' && !input.decisionRecorded) {
    appendUnique(blockers, 'human-decision-not-recorded');
  }
  if (status === 'awaiting-human-decision' || status === 'needs-more-evidence') {
    for (const category of unresolvedReviewItems) {
      appendUnique(blockers, `review-item-unresolved:${category}`);
    }
  }
  for (const category of rejectedReviewItems) {
    appendUnique(blockers, `review-item-rejected:${category}`);
  }

  const canProceedToArtifactReview = status === 'approved-for-artifact-review';
  return {
    candidateId: input.candidateId,
    candidateTier: input.candidateTier,
    status,
    decisions: { ...input.decisions },
    blockers: unique(blockers),
    warnings: [
      'This decision gate does not update model, license, artifact, benchmark, runtime, or download approval.',
    ],
    missingEvidence: unique(evidence?.missingEvidence ?? []),
    unresolvedReviewItems,
    canProceedToArtifactReview,
    humanDecisionRecorded: input.decisionRecorded,
    evidenceComplete,
    evidenceConflictFree,
    humanReviewStillRequired: !canProceedToArtifactReview && status !== 'rejected',
    evidenceOnly: false,
    decisionGateOnly: true,
    modelApproved: false,
    licenseApproved: false,
    artifactApproved: false,
    benchmarkVerified: false,
    downloadable: false,
    runtimeReady: false,
    modelActive: false,
  };
}

export function buildCurrentLocalModelCandidateReviewDecisions(): readonly LocalModelCandidateReviewDecisionResult[] {
  return listLocalModelCandidateEvidence().map((record) =>
    evaluateLocalModelCandidateReviewDecision(
      createUnreviewedLocalModelCandidateReviewInput(record),
    ));
}

export function listCurrentLocalModelCandidateReviewDecisions(): readonly LocalModelCandidateReviewDecisionResult[] {
  return buildCurrentLocalModelCandidateReviewDecisions();
}
