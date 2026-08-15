/**
 * Checkpoint Engine — Assess Real Competency at Unit Boundaries
 *
 * Runs end-of-unit checkpoints, scores per-skill, determines which
 * can-do outcomes were demonstrated, and generates remediation plans
 * for failed skills. This replaces the hollow "80% threshold" with
 * multi-dimensional assessment.
 */

import type {
  CheckpointQuestion,
  LinguisticSkill,
  SkillGroup,
  ThematicUnit,
  UnitCheckpoint,
} from './curriculumEngine';
import { linguisticSkillToGroup } from './curriculumEngine';
import type {
  CheckpointAttemptResult,
  SkillScore,
} from './competencyTracker';

// ─── Answer Input ───────────────────────────────────────────────────

/** A single answer submitted by the learner. */
export interface CheckpointAnswer {
  readonly questionId: string;
  readonly answer: string;
}

// ─── Scoring ────────────────────────────────────────────────────────

/**
 * Score a checkpoint attempt.
 *
 * Pure function: takes questions + answers, returns a complete result
 * with per-skill breakdown and outcome assessment.
 */
export function scoreCheckpoint(input: {
  readonly checkpoint: UnitCheckpoint;
  readonly unit: ThematicUnit;
  readonly answers: readonly CheckpointAnswer[];
  readonly attemptNumber: number;
}): CheckpointAttemptResult {
  const { checkpoint, unit, answers, attemptNumber } = input;
  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

  // Score each question
  const questionResults: QuestionResult[] = checkpoint.questions.map((q) => {
    const givenAnswer = answerMap.get(q.id);
    const isCorrect = givenAnswer !== undefined && matchAnswer(givenAnswer, q.correctAnswer);
    return { question: q, givenAnswer: givenAnswer ?? '', isCorrect };
  });

  // Overall score
  const totalQuestions = questionResults.length;
  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = percent >= checkpoint.masteryThreshold;

  // Per-skill breakdown
  const skillMap = new Map<LinguisticSkill, { correct: number; total: number }>();
  for (const result of questionResults) {
    const skill = result.question.assessedSkill;
    const entry = skillMap.get(skill) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (result.isCorrect) entry.correct += 1;
    skillMap.set(skill, entry);
  }

  const skillScores: SkillScore[] = Array.from(skillMap.entries()).map(([skill, data]) => ({
    skill,
    correct: data.correct,
    total: data.total,
    percent: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  // Determine demonstrated outcomes
  const demonstratedOutcomes: string[] = [];
  const failedOutcomes: string[] = [];

  for (const outcome of unit.canDoOutcomes) {
    // An outcome is demonstrated if the learner scores ≥ minimum on ALL
    // assessment criteria for that outcome's skill
    const relevantSkillScore = skillScores.find((s) => s.skill === outcome.skill);
    if (!relevantSkillScore) {
      failedOutcomes.push(outcome.id);
      continue;
    }

    const minRequired = Math.min(
      ...outcome.assessmentCriteria.map((c) => c.minimumScore),
    );
    if (relevantSkillScore.percent >= minRequired) {
      demonstratedOutcomes.push(outcome.id);
    } else {
      failedOutcomes.push(outcome.id);
    }
  }

  return {
    checkpointId: checkpoint.id,
    unitId: unit.id,
    attemptNumber,
    timestamp: Date.now(),
    totalScore: correctCount,
    totalQuestions,
    percent,
    passed,
    skillScores,
    demonstratedOutcomes,
    failedOutcomes,
  };
}

// ─── Remediation Plan ───────────────────────────────────────────────

/** Generate a targeted remediation plan from a failed checkpoint. */
export function generateRemediationPlan(input: {
  readonly result: CheckpointAttemptResult;
  readonly unit: ThematicUnit;
}): RemediationSuggestion {
  const { result, unit } = input;

  if (result.passed) {
    return { needed: false, weakSkills: [], suggestedLessonIds: [], message: 'Checkpoint passed!' };
  }

  // Identify weak skills (below 70%)
  const weakSkills = result.skillScores
    .filter((s) => s.percent < 70)
    .map((s) => ({
      skill: s.skill,
      group: linguisticSkillToGroup(s.skill),
      percent: s.percent,
    }));

  // Collect remediation lessons from unit definition
  const suggestedLessonIds: string[] = [];
  for (const weak of weakSkills) {
    const lessons = unit.remediation.weakSkillLessons[weak.group];
    if (lessons) {
      suggestedLessonIds.push(...lessons);
    }
  }

  // Add supplementary exercises
  suggestedLessonIds.push(...unit.remediation.supplementaryExercises);

  // Deduplicate
  const uniqueLessonIds = Array.from(new Set(suggestedLessonIds));

  const weakSkillNames = weakSkills.map((w) => w.group).join(', ');
  const message = weakSkills.length > 0
    ? `Cần ôn lại: ${weakSkillNames}. Hoàn thành ${uniqueLessonIds.length} bài ôn trước khi thử lại checkpoint.`
    : 'Điểm số chưa đạt ngưỡng. Hãy ôn lại toàn bộ unit và thử lại.';

  return {
    needed: true,
    weakSkills,
    suggestedLessonIds: uniqueLessonIds,
    message,
  };
}

// ─── Types ──────────────────────────────────────────────────────────

interface QuestionResult {
  readonly question: CheckpointQuestion;
  readonly givenAnswer: string;
  readonly isCorrect: boolean;
}

export interface RemediationSuggestion {
  readonly needed: boolean;
  readonly weakSkills: readonly { skill: LinguisticSkill; group: SkillGroup; percent: number }[];
  readonly suggestedLessonIds: readonly string[];
  readonly message: string;
}

// ─── Answer Matching ────────────────────────────────────────────────

/** Case-insensitive, whitespace-normalized answer matching. */
function matchAnswer(given: string, correct: string | readonly string[]): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const normalizedGiven = normalize(given);

  if (Array.isArray(correct)) {
    return correct.some((c) => normalize(c) === normalizedGiven);
  }
  return normalize(correct as string) === normalizedGiven;
}
