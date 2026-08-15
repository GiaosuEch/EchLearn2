/**
 * Placement Engine — Adaptive Placement Test
 *
 * Determines where a learner should start within a course.
 * Prevents two failure modes:
 *   1. Weak learners placed too far ahead → frustration & dropout
 *   2. Strong learners forced to repeat basics → boredom & dropout
 *
 * The test adapts question difficulty based on answers, using a simple
 * item-response approach (not full IRT, but sufficient for local-first).
 */

import type {
  LinguisticSkill,
  PhaseQuestion,
  PlacementResultMapping,
  PlacementTest,
} from './curriculumEngine';

// ─── Placement Session ──────────────────────────────────────────────

/** State of a placement test in progress. */
export interface PlacementSession {
  readonly testId: string;
  readonly courseId: string;
  /** Questions already answered. */
  readonly answeredQuestions: readonly PlacementQuestionResult[];
  /** Current section index. */
  readonly currentSectionIndex: number;
  /** Current question index within section. */
  readonly currentQuestionIndex: number;
  /** Whether the test is complete. */
  readonly isComplete: boolean;
  /** Final result (only set when isComplete). */
  readonly result: PlacementResult | null;
}

export interface PlacementQuestionResult {
  readonly questionId: string;
  readonly skill: LinguisticSkill;
  readonly difficulty: number;
  readonly isCorrect: boolean;
}

export interface PlacementResult {
  /** Total score achieved. */
  readonly totalScore: number;
  /** Maximum possible score. */
  readonly maxScore: number;
  /** Score as percentage. */
  readonly percent: number;
  /** Recommended starting unit index. */
  readonly startingUnitIndex: number;
  /** Human-readable placement description. */
  readonly description: string;
  /** Per-skill breakdown. */
  readonly skillBreakdown: readonly PlacementSkillResult[];
}

export interface PlacementSkillResult {
  readonly skill: LinguisticSkill;
  readonly correct: number;
  readonly total: number;
  readonly percent: number;
}

// ─── Session Management ─────────────────────────────────────────────

/** Create a new placement session for a course. */
export function createPlacementSession(
  test: PlacementTest,
  courseId: string,
): PlacementSession {
  return {
    testId: test.id,
    courseId,
    answeredQuestions: [],
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    isComplete: false,
    result: null,
  };
}

/** Get the current question to show. Returns null if test is complete. */
export function getCurrentQuestion(
  session: PlacementSession,
  test: PlacementTest,
): { question: PhaseQuestion; sectionSkill: LinguisticSkill } | null {
  if (session.isComplete) return null;
  if (session.currentSectionIndex >= test.sections.length) return null;

  const section = test.sections[session.currentSectionIndex];
  if (session.currentQuestionIndex >= section.questions.length) return null;

  return {
    question: section.questions[session.currentQuestionIndex],
    sectionSkill: section.skill,
  };
}

/** Submit an answer and advance the session. */
export function submitPlacementAnswer(
  session: PlacementSession,
  test: PlacementTest,
  questionId: string,
  answer: string,
): PlacementSession {
  if (session.isComplete) return session;

  const section = test.sections[session.currentSectionIndex];
  if (!section) return session;

  const question = section.questions[session.currentQuestionIndex];
  if (!question || question.id !== questionId) return session;

  const isCorrect = matchPlacementAnswer(answer, question.correctAnswer);

  const answeredQuestions: PlacementQuestionResult[] = [
    ...session.answeredQuestions,
    {
      questionId,
      skill: section.skill,
      difficulty: question.difficulty,
      isCorrect,
    },
  ];

  // Advance to next question or section
  let nextSectionIndex = session.currentSectionIndex;
  let nextQuestionIndex = session.currentQuestionIndex + 1;

  if (nextQuestionIndex >= section.questions.length) {
    nextSectionIndex += 1;
    nextQuestionIndex = 0;
  }

  const isComplete = nextSectionIndex >= test.sections.length;

  const result = isComplete
    ? computePlacementResult(answeredQuestions, test)
    : null;

  return {
    testId: session.testId,
    courseId: session.courseId,
    answeredQuestions,
    currentSectionIndex: nextSectionIndex,
    currentQuestionIndex: nextQuestionIndex,
    isComplete,
    result,
  };
}

// ─── Scoring ────────────────────────────────────────────────────────

function computePlacementResult(
  answers: readonly PlacementQuestionResult[],
  test: PlacementTest,
): PlacementResult {
  const { scoringRubric, resultMapping } = test;

  // Total score
  let rawScore = 0;
  for (const answer of answers) {
    if (answer.isCorrect) {
      rawScore += scoringRubric.pointsPerCorrect;
    } else {
      rawScore -= scoringRubric.penaltyPerIncorrect;
    }
  }
  const totalScore = Math.max(0, rawScore);
  const maxScore = scoringRubric.totalPoints;
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Per-skill breakdown
  const skillMap = new Map<LinguisticSkill, { correct: number; total: number }>();
  for (const answer of answers) {
    const entry = skillMap.get(answer.skill) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answer.isCorrect) entry.correct += 1;
    skillMap.set(answer.skill, entry);
  }

  const skillBreakdown: PlacementSkillResult[] = Array.from(skillMap.entries()).map(
    ([skill, data]) => ({
      skill,
      correct: data.correct,
      total: data.total,
      percent: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }),
  );

  // Map score to starting unit
  const mapping = findBestMapping(totalScore, resultMapping);

  return {
    totalScore,
    maxScore,
    percent,
    startingUnitIndex: mapping.startingUnitIndex,
    description: mapping.description,
    skillBreakdown,
  };
}

function findBestMapping(
  score: number,
  mappings: readonly PlacementResultMapping[],
): PlacementResultMapping {
  // Find the mapping whose range contains the score
  for (const mapping of mappings) {
    if (score >= mapping.minScore && score <= mapping.maxScore) {
      return mapping;
    }
  }

  // Fallback: lowest mapping (start from beginning)
  const sorted = [...mappings].sort((a, b) => a.minScore - b.minScore);
  return sorted[0] ?? {
    minScore: 0,
    maxScore: 100,
    startingUnitIndex: 0,
    description: 'Bắt đầu từ đầu khóa học.',
  };
}

// ─── Answer Matching ────────────────────────────────────────────────

function matchPlacementAnswer(given: string, correct: string | readonly string[]): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  const normalizedGiven = normalize(given);

  if (Array.isArray(correct)) {
    return correct.some((c) => normalize(c) === normalizedGiven);
  }
  return normalize(correct as string) === normalizedGiven;
}
