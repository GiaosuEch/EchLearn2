/**
 * Curriculum Engine — Core Domain Types
 *
 * Language-agnostic types that model a pedagogically sound curriculum.
 * Every language/exam track reuses these contracts. No track-specific
 * content, scoring labels, or route knowledge belongs here.
 *
 * Design principles:
 * - Can-do outcomes replace vague objectives
 * - Thematic units replace flat lesson lists
 * - Pedagogical phases enforce introduce → recognize → practice → produce → review → checkpoint
 * - Mastery gates prevent hollow progression
 * - Extended SRS covers vocabulary, sentence patterns, grammar errors, and reading comprehension
 */

// ─── Linguistic Skills ──────────────────────────────────────────────

/** Fine-grained linguistic skill taxonomy. */
export type LinguisticSkill =
  | 'receptive-reading'
  | 'receptive-listening'
  | 'productive-writing'
  | 'productive-speaking'
  | 'vocabulary-recognition'
  | 'vocabulary-production'
  | 'grammar-recognition'
  | 'grammar-production'
  | 'script-recognition'
  | 'script-production';

/** Broad skill group for UI display (maps multiple LinguisticSkills). */
export type SkillGroup =
  | 'reading'
  | 'listening'
  | 'grammar'
  | 'vocabulary'
  | 'production'
  | 'script';

export function linguisticSkillToGroup(skill: LinguisticSkill): SkillGroup {
  switch (skill) {
    case 'receptive-reading':
      return 'reading';
    case 'receptive-listening':
      return 'listening';
    case 'productive-writing':
    case 'productive-speaking':
      return 'production';
    case 'vocabulary-recognition':
    case 'vocabulary-production':
      return 'vocabulary';
    case 'grammar-recognition':
    case 'grammar-production':
      return 'grammar';
    case 'script-recognition':
    case 'script-production':
      return 'script';
  }
}

// ─── Can-Do Outcomes ────────────────────────────────────────────────

/** How a can-do outcome is assessed. */
export interface AssessmentCriterion {
  /** What kind of evidence is required. */
  readonly evidenceType: 'multiple-choice' | 'fill-in' | 'sentence-construction' | 'free-response' | 'matching';
  /** Minimum score (0–100) to consider this criterion met. */
  readonly minimumScore: number;
  /** Description of what is being measured. */
  readonly description: string;
}

/**
 * A measurable learning outcome.
 * Replaces vague "objective" strings with something a checkpoint can verify.
 */
export interface CanDoOutcome {
  readonly id: string;
  /** Human-readable statement: "Tôi có thể đọc tin nhắn ngắn bằng hiragana..." */
  readonly statement: string;
  /** Which linguistic skill this outcome targets. */
  readonly skill: LinguisticSkill;
  /** Reference framework level (e.g. "JLPT-N5", "CEFR-J-A1", "TOPIK-1"). */
  readonly referenceLevel: string;
  /** How this outcome is verified. */
  readonly assessmentCriteria: readonly AssessmentCriterion[];
}

// ─── Pedagogical Phases ─────────────────────────────────────────────

/** The six-phase pedagogical sequence every lesson follows. */
export type PedagogicalPhaseType =
  | 'introduce'
  | 'recognize'
  | 'guided-practice'
  | 'produce'
  | 'spaced-review'
  | 'checkpoint';

/** Completion condition for a phase. */
export interface CompletionCriterion {
  readonly type: 'score-threshold' | 'all-correct' | 'time-spent' | 'items-reviewed';
  /** For score-threshold: minimum percent. For items-reviewed: minimum count. */
  readonly value: number;
}

/** Content payload for a specific phase. Intentionally polymorphic. */
export interface PhaseContent {
  /** Explanation text shown during introduce phase. */
  readonly explanations?: readonly string[];
  /** Formula or pattern representation. */
  readonly formula?: string;
  /** Example sentences with translations. */
  readonly examples?: readonly PhaseExample[];
  /** Questions for recognize, guided-practice, produce, or checkpoint phases. */
  readonly questions?: readonly PhaseQuestion[];
  /** SRS item IDs to review during spaced-review phase. */
  readonly reviewItemIds?: readonly string[];
  /** Hints available during guided-practice phase. */
  readonly hints?: readonly string[];
}

export interface PhaseExample {
  readonly text: string;
  readonly translation: string;
  readonly note?: string;
}

export interface PhaseQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly questionType: 'multiple-choice' | 'fill-in' | 'matching' | 'sentence-order' | 'free-response';
  readonly choices?: readonly PhaseChoice[];
  readonly correctAnswer: string | readonly string[];
  readonly explanation: string;
  readonly skill: LinguisticSkill;
  /** Difficulty tier within the lesson (1 = easiest). */
  readonly difficulty: 1 | 2 | 3;
}

export interface PhaseChoice {
  readonly id: string;
  readonly text: string;
  readonly meaning?: string;
}

/** A single pedagogical phase within a lesson. */
export interface LessonPhase {
  readonly type: PedagogicalPhaseType;
  readonly content: PhaseContent;
  readonly estimatedMinutes: number;
  readonly completionCriteria: CompletionCriterion;
}

// ─── Lesson Guide ───────────────────────────────────────────────────

/** Common mistake pattern that learners frequently make. */
export interface CommonMistake {
  /** The incorrect pattern. */
  readonly wrong: string;
  /** The correct form. */
  readonly correct: string;
  /** Why learners make this mistake. */
  readonly reason: string;
}

/** Entry requirement to start a lesson. */
export interface EntryRequirement {
  /** Which lesson/checkpoint must be passed first. */
  readonly prerequisiteId: string;
  /** Minimum score required. */
  readonly minimumScore: number;
}

/** Criteria to pass a lesson. */
export interface PassCriteria {
  /** Minimum overall score (0-100). */
  readonly minimumScore: number;
  /** Minimum score per skill area, if applicable. */
  readonly perSkillMinimum?: Readonly<Record<string, number>>;
  /** Whether all phases must be completed (not just the final quiz). */
  readonly requireAllPhases: boolean;
}

/** How to review after completing the lesson. */
export interface ReviewStrategy {
  /** When to first review (hours after completion). */
  readonly firstReviewAfterHours: number;
  /** SRS item kinds to create from this lesson. */
  readonly srsItemKinds: readonly SRSItemKind[];
  /** Suggested next lesson ID. */
  readonly nextLessonId?: string;
}

/**
 * A complete lesson within a thematic unit.
 * Contains the full lesson guide: objectives, prerequisites, study tactics,
 * common mistakes, pass criteria, review strategy, and pedagogical phases.
 */
export interface UnitLesson {
  readonly id: string;
  readonly title: string;
  /** Can-do outcome IDs this lesson contributes to. */
  readonly targetOutcomes: readonly string[];
  readonly entryRequirements: readonly EntryRequirement[];
  readonly estimatedMinutes: number;
  /** Suggested study tactics for the learner. */
  readonly studyTactics: readonly string[];
  readonly commonMistakes: readonly CommonMistake[];
  readonly passCriteria: PassCriteria;
  readonly nextReviewStrategy: ReviewStrategy;
  /** The pedagogical sequence. Must have ≥ 2 phases. */
  readonly phases: readonly LessonPhase[];
}

// ─── Checkpoint & Remediation ───────────────────────────────────────

/** A single checkpoint question that assesses multiple skills. */
export interface CheckpointQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly questionType: PhaseQuestion['questionType'];
  readonly choices?: readonly PhaseChoice[];
  readonly correctAnswer: string | readonly string[];
  readonly explanation: string;
  /** Which skill and outcome this question assesses. */
  readonly assessedSkill: LinguisticSkill;
  readonly assessedOutcomeId: string;
}

/** Remediation path for learners who fail a checkpoint. */
export interface RemediationPath {
  /** Map from skill group to lesson IDs that re-teach those skills. */
  readonly weakSkillLessons: Readonly<Partial<Record<SkillGroup, readonly string[]>>>;
  /** Additional exercise IDs for targeted practice. */
  readonly supplementaryExercises: readonly string[];
}

/** End-of-unit checkpoint. */
export interface UnitCheckpoint {
  readonly id: string;
  readonly unitId: string;
  /** Questions drawn from all lessons in the unit. */
  readonly questions: readonly CheckpointQuestion[];
  /** Minimum percent to pass. */
  readonly masteryThreshold: number;
  /** What happens on failure. */
  readonly failureAction: 'remediate' | 'retry';
  readonly maxRetries: number;
}

// ─── Thematic Unit ──────────────────────────────────────────────────

/**
 * A thematic unit groups related lessons around a real-world theme.
 * Every unit ends with a mandatory checkpoint.
 */
export interface ThematicUnit {
  readonly id: string;
  readonly title: string;
  /** The real-world theme (e.g. "自己紹介 — Giới thiệu bản thân"). */
  readonly theme: string;
  /** What the learner can do after completing this unit. */
  readonly canDoOutcomes: readonly CanDoOutcome[];
  /** Ordered lessons within this unit. */
  readonly lessons: readonly UnitLesson[];
  /** Mandatory end-of-unit assessment. */
  readonly checkpoint: UnitCheckpoint;
  /** If checkpoint fails, what to do. */
  readonly remediation: RemediationPath;
}

// ─── Extended SRS ───────────────────────────────────────────────────

/** SRS item kinds — vocabulary is just one of five. */
export type SRSItemKind =
  | 'vocabulary'
  | 'sentence-pattern'
  | 'grammar-error'
  | 'reading-comprehension'
  | 'production-prompt';

/** An SRS item with kind metadata and source tracing. */
export interface ExtendedSRSItemData {
  readonly kind: SRSItemKind;
  /** The prompt/stimulus shown to the learner. */
  readonly stimulus: string;
  /** The expected response or correct answer. */
  readonly response: string;
  /** Which lesson generated this item. */
  readonly sourceLesson: string;
  /** Which unit the source lesson belongs to. */
  readonly sourceUnit: string;
}

// ─── Mastery Gate ───────────────────────────────────────────────────

/** SRS mastery requirement for a gate. */
export interface SRSMasteryRequirement {
  readonly kind: SRSItemKind;
  /** Minimum number of items that must be at mastery level. */
  readonly minimumMasteredCount: number;
  /** Minimum repetition count (n) to consider an item "mastered". */
  readonly minimumRepetitions: number;
}

/**
 * A gate that prevents progression unless competency is demonstrated.
 * Placed between course levels (N5 → N4) or between unit groups.
 */
export interface MasteryGate {
  readonly id: string;
  /** Checkpoint IDs that must all be passed. */
  readonly requiredCheckpoints: readonly string[];
  /** Minimum average score across all required checkpoints. */
  readonly minimumAverageScore: number;
  /** SRS mastery requirements by item kind. */
  readonly requiredSRSMastery: readonly SRSMasteryRequirement[];
}

// ─── Placement Test ─────────────────────────────────────────────────

/** A section of the placement test targeting a specific skill. */
export interface PlacementSection {
  readonly skill: LinguisticSkill;
  readonly questions: readonly PhaseQuestion[];
}

/** Maps a placement score range to a starting position. */
export interface PlacementResultMapping {
  /** Minimum total score to receive this placement. */
  readonly minScore: number;
  /** Maximum total score for this placement. */
  readonly maxScore: number;
  /** Recommended starting unit index. */
  readonly startingUnitIndex: number;
  /** Human-readable description. */
  readonly description: string;
}

/** Scoring rubric for placement test. */
export interface ScoringRubric {
  /** Points per correct answer. */
  readonly pointsPerCorrect: number;
  /** Optional penalty per incorrect answer (0 = no penalty). */
  readonly penaltyPerIncorrect: number;
  /** Total possible points. */
  readonly totalPoints: number;
}

/** Placement test definition. */
export interface PlacementTest {
  readonly id: string;
  readonly targetLevel: string;
  readonly sections: readonly PlacementSection[];
  readonly scoringRubric: ScoringRubric;
  readonly resultMapping: readonly PlacementResultMapping[];
}

// ─── Weekly Plan ────────────────────────────────────────────────────

/** A single entry in the weekly study plan. */
export interface WeeklyPlanEntry {
  readonly weekNumber: number;
  /** Which unit and lessons to focus on. */
  readonly unitId: string;
  readonly lessonIds: readonly string[];
  /** Estimated study hours for the week. */
  readonly estimatedHours: number;
  /** Milestone: what the learner should achieve by end of week. */
  readonly milestone: string;
}

// ─── Course ─────────────────────────────────────────────────────────

/**
 * Top-level course definition.
 * Replaces the flat lesson registry with a structured, validated curriculum.
 */
export interface CurriculumCourse {
  readonly id: string;
  readonly language: string;
  readonly level: string;
  readonly title: string;
  readonly description: string;
  /** Course-level can-do outcomes (what the learner achieves by completion). */
  readonly courseOutcomes: readonly CanDoOutcome[];
  /** Suggested weekly study plan. */
  readonly weeklyPlan: readonly WeeklyPlanEntry[];
  /** Ordered thematic units. */
  readonly units: readonly ThematicUnit[];
  /** Gate that must be passed to progress to the next level. */
  readonly exitGate: MasteryGate;
  /** Optional placement test for the course. */
  readonly placementTest?: PlacementTest;
}
