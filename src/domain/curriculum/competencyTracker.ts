/**
 * Competency Tracker — Evidence-Based Progress Measurement
 *
 * Replaces "percentage completion" (an illusion of progress) with
 * genuine competency measurement based on checkpoint evidence,
 * SRS mastery data, and demonstrated can-do outcomes.
 */

import type {
  CurriculumCourse,
  LinguisticSkill,
  SkillGroup,
} from './curriculumEngine';
import { linguisticSkillToGroup } from './curriculumEngine';

// ─── Checkpoint Result ──────────────────────────────────────────────

/** Result of a single checkpoint attempt with per-skill breakdown. */
export interface CheckpointAttemptResult {
  readonly checkpointId: string;
  readonly unitId: string;
  readonly attemptNumber: number;
  readonly timestamp: number;
  readonly totalScore: number;
  readonly totalQuestions: number;
  readonly percent: number;
  readonly passed: boolean;
  /** Per-skill breakdown. */
  readonly skillScores: readonly SkillScore[];
  /** Outcome IDs that were demonstrated (score ≥ criterion minimum). */
  readonly demonstratedOutcomes: readonly string[];
  /** Outcome IDs that were NOT demonstrated. */
  readonly failedOutcomes: readonly string[];
}

export interface SkillScore {
  readonly skill: LinguisticSkill;
  readonly correct: number;
  readonly total: number;
  readonly percent: number;
}

// ─── Skill Competency ───────────────────────────────────────────────

/** Performance trend direction. */
export type PerformanceTrend = 'improving' | 'stable' | 'declining';

/** Competency snapshot for a single linguistic skill. */
export interface SkillCompetency {
  readonly skill: LinguisticSkill;
  readonly group: SkillGroup;
  /** Can-do outcome IDs proven through checkpoint assessment. */
  readonly demonstratedOutcomes: readonly string[];
  /** Total possible outcomes for this skill in the course. */
  readonly totalOutcomes: number;
  /**
   * Mastery ratio: demonstrated / total outcomes.
   * This is NOT completion percentage — it requires assessment evidence.
   */
  readonly masteryRatio: number;
  /** Performance trend based on recent checkpoint scores. */
  readonly trend: PerformanceTrend;
  /** When this skill was last assessed via checkpoint. */
  readonly lastAssessedAt: number | null;
}

// ─── Weak Area ──────────────────────────────────────────────────────

/** An identified area of weakness with remediation suggestions. */
export interface WeakArea {
  readonly skill: LinguisticSkill;
  readonly group: SkillGroup;
  /** Specific outcomes that failed assessment. */
  readonly failedOutcomes: readonly string[];
  /** Suggested lesson IDs for remediation. */
  readonly remediationLessonIds: readonly string[];
  /** Severity: how far below mastery threshold. */
  readonly severity: 'mild' | 'moderate' | 'severe';
}

// ─── Learner Competency Profile ─────────────────────────────────────

/** The complete competency profile for a learner in a specific course. */
export interface LearnerCompetencyProfile {
  readonly learnerId: string;
  readonly courseId: string;
  /** Per-skill competency snapshots. */
  readonly skills: readonly SkillCompetency[];
  /** Estimated level based on assessment evidence. */
  readonly estimatedLevel: string;
  /** Areas needing targeted remediation. */
  readonly weakAreas: readonly WeakArea[];
  /** Actual effective study time (not time-on-app). */
  readonly effectiveStudyMinutes: number;
  /** Current unit index (0-based). */
  readonly currentUnitIndex: number;
  /** Last updated timestamp. */
  readonly updatedAt: number;
}

// ─── Competency Computation ─────────────────────────────────────────

/**
 * Compute the trend from a series of scores (most recent last).
 * Uses simple linear regression slope sign.
 */
export function computeTrend(scores: readonly number[]): PerformanceTrend {
  if (scores.length < 2) return 'stable';

  const recent = scores.slice(-5); // last 5 data points
  const len = recent.length;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < len; i++) {
    sumX += i;
    sumY += recent[i];
    sumXY += i * recent[i];
    sumX2 += i * i;
  }

  const denominator = len * sumX2 - sumX * sumX;
  if (denominator === 0) return 'stable';

  const slope = (len * sumXY - sumX * sumY) / denominator;

  if (slope > 2) return 'improving';
  if (slope < -2) return 'declining';
  return 'stable';
}

/**
 * Build a competency profile from checkpoint results and course definition.
 *
 * This is a pure function — it derives competency entirely from assessment
 * evidence, never from lesson completion counts or XP.
 */
export function buildCompetencyProfile(input: {
  readonly learnerId: string;
  readonly course: CurriculumCourse;
  readonly checkpointResults: readonly CheckpointAttemptResult[];
  readonly effectiveStudyMinutes: number;
  readonly currentUnitIndex: number;
}): LearnerCompetencyProfile {
  const { learnerId, course, checkpointResults, effectiveStudyMinutes, currentUnitIndex } = input;

  // Collect all outcomes per skill from the course
  const outcomesBySkill = new Map<LinguisticSkill, string[]>();
  for (const unit of course.units) {
    for (const outcome of unit.canDoOutcomes) {
      const existing = outcomesBySkill.get(outcome.skill) ?? [];
      existing.push(outcome.id);
      outcomesBySkill.set(outcome.skill, existing);
    }
  }

  // Collect demonstrated/failed outcomes per skill from checkpoint results
  const demonstratedBySkill = new Map<LinguisticSkill, Set<string>>();
  const failedBySkill = new Map<LinguisticSkill, Set<string>>();
  const scoreHistoryBySkill = new Map<LinguisticSkill, number[]>();
  const lastAssessedBySkill = new Map<LinguisticSkill, number>();

  for (const result of checkpointResults) {
    for (const outcomeId of result.demonstratedOutcomes) {
      const skill = findOutcomeSkill(course, outcomeId);
      if (!skill) continue;
      const set = demonstratedBySkill.get(skill) ?? new Set();
      set.add(outcomeId);
      demonstratedBySkill.set(skill, set);
    }
    for (const outcomeId of result.failedOutcomes) {
      const skill = findOutcomeSkill(course, outcomeId);
      if (!skill) continue;
      const set = failedBySkill.get(skill) ?? new Set();
      set.add(outcomeId);
      failedBySkill.set(skill, set);
    }
    for (const ss of result.skillScores) {
      const history = scoreHistoryBySkill.get(ss.skill) ?? [];
      history.push(ss.percent);
      scoreHistoryBySkill.set(ss.skill, history);
      const prev = lastAssessedBySkill.get(ss.skill) ?? 0;
      if (result.timestamp > prev) {
        lastAssessedBySkill.set(ss.skill, result.timestamp);
      }
    }
  }

  // Build skill competencies
  const skills: SkillCompetency[] = [];
  for (const [skill, outcomeIds] of outcomesBySkill.entries()) {
    const demonstrated = demonstratedBySkill.get(skill) ?? new Set();
    const totalOutcomes = outcomeIds.length;
    const masteryRatio = totalOutcomes > 0 ? demonstrated.size / totalOutcomes : 0;
    const history = scoreHistoryBySkill.get(skill) ?? [];

    skills.push({
      skill,
      group: linguisticSkillToGroup(skill),
      demonstratedOutcomes: Array.from(demonstrated),
      totalOutcomes,
      masteryRatio,
      trend: computeTrend(history),
      lastAssessedAt: lastAssessedBySkill.get(skill) ?? null,
    });
  }

  // Identify weak areas
  const weakAreas: WeakArea[] = [];
  for (const [skill, failedIds] of failedBySkill.entries()) {
    const demonstrated = demonstratedBySkill.get(skill) ?? new Set();
    // Remove outcomes that were later demonstrated
    const stillFailed = Array.from(failedIds).filter((id) => !demonstrated.has(id));
    if (stillFailed.length === 0) continue;

    const total = outcomesBySkill.get(skill)?.length ?? 1;
    const failRatio = stillFailed.length / total;
    const severity: WeakArea['severity'] =
      failRatio > 0.5 ? 'severe' : failRatio > 0.25 ? 'moderate' : 'mild';

    // Find remediation lessons from units
    const remediationLessonIds = findRemediationLessons(course, skill);

    weakAreas.push({
      skill,
      group: linguisticSkillToGroup(skill),
      failedOutcomes: stillFailed,
      remediationLessonIds,
      severity,
    });
  }

  // Estimate level based on passed checkpoints
  const passedCheckpointCount = new Set(
    checkpointResults.filter((r) => r.passed).map((r) => r.checkpointId),
  ).size;
  const totalCheckpoints = course.units.length;
  const estimatedLevel =
    passedCheckpointCount >= totalCheckpoints
      ? course.level
      : `${course.level} (${Math.round((passedCheckpointCount / Math.max(1, totalCheckpoints)) * 100)}%)`;

  return {
    learnerId,
    courseId: course.id,
    skills,
    estimatedLevel,
    weakAreas,
    effectiveStudyMinutes,
    currentUnitIndex,
    updatedAt: Date.now(),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function findOutcomeSkill(course: CurriculumCourse, outcomeId: string): LinguisticSkill | null {
  for (const unit of course.units) {
    for (const outcome of unit.canDoOutcomes) {
      if (outcome.id === outcomeId) return outcome.skill;
    }
  }
  return null;
}

function findRemediationLessons(course: CurriculumCourse, skill: LinguisticSkill): string[] {
  const group = linguisticSkillToGroup(skill);
  const lessonIds: string[] = [];
  for (const unit of course.units) {
    const remediation = unit.remediation.weakSkillLessons[group];
    if (remediation) {
      lessonIds.push(...remediation);
    }
  }
  return lessonIds;
}
