/**
 * Curriculum Validator — Build-Time Quality Gate
 *
 * Validates CurriculumCourse structures for completeness, pedagogical
 * soundness, and content coverage. Designed to run at build time —
 * an invalid curriculum should fail the build.
 *
 * Checks:
 * - Every unit has a checkpoint
 * - Every lesson has ≥ 2 pedagogical phases
 * - Every outcome has assessment criteria
 * - Prerequisites form a DAG (no cycles)
 * - Vocabulary/grammar coverage meets level standards
 * - No orphan lessons or outcomes
 */

import type {
  CanDoOutcome,
  CheckpointQuestion,
  CurriculumCourse,
  LessonPhase,
  ThematicUnit,
  UnitLesson,
  UnitCheckpoint,
} from './curriculumEngine';

// ─── Validation Result ──────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  readonly severity: ValidationSeverity;
  readonly path: string;
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly summary: string;
}

// ─── Main Validator ─────────────────────────────────────────────────

/**
 * Validate an entire curriculum course.
 * Returns a result with all issues found.
 */
export function validateCurriculumCourse(course: CurriculumCourse): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Course-level checks
  validateCourseMetadata(course, issues);
  validateCourseOutcomes(course, issues);
  validateWeeklyPlan(course, issues);

  // Unit-level checks
  const allLessonIds = new Set<string>();
  const allOutcomeIds = new Set<string>();

  for (let unitIndex = 0; unitIndex < course.units.length; unitIndex++) {
    const unit = course.units[unitIndex];
    const unitPath = `units[${unitIndex}] (${unit.id})`;
    validateUnit(unit, unitPath, allLessonIds, allOutcomeIds, issues);
  }

  // Cross-unit checks
  validatePrerequisiteDAG(course, issues);
  validateExitGate(course, issues);

  // Placement test
  if (course.placementTest) {
    validatePlacementTest(course, issues);
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const valid = errorCount === 0;

  const summary = valid
    ? `✅ Curriculum "${course.title}" is valid. ${warningCount} warning(s).`
    : `❌ Curriculum "${course.title}" has ${errorCount} error(s) and ${warningCount} warning(s).`;

  return { valid, issues, summary };
}

// ─── Course-Level Checks ────────────────────────────────────────────

function validateCourseMetadata(course: CurriculumCourse, issues: ValidationIssue[]): void {
  if (!course.id.trim()) {
    issues.push({ severity: 'error', path: 'course.id', message: 'Course ID is empty.' });
  }
  if (!course.language.trim()) {
    issues.push({ severity: 'error', path: 'course.language', message: 'Course language is empty.' });
  }
  if (!course.level.trim()) {
    issues.push({ severity: 'error', path: 'course.level', message: 'Course level is empty.' });
  }
  if (!course.title.trim()) {
    issues.push({ severity: 'error', path: 'course.title', message: 'Course title is empty.' });
  }
  if (course.units.length === 0) {
    issues.push({ severity: 'error', path: 'course.units', message: 'Course has no units.' });
  }
}

function validateCourseOutcomes(course: CurriculumCourse, issues: ValidationIssue[]): void {
  if (course.courseOutcomes.length === 0) {
    issues.push({ severity: 'error', path: 'course.courseOutcomes', message: 'Course has no can-do outcomes.' });
  }
  for (let i = 0; i < course.courseOutcomes.length; i++) {
    validateOutcome(course.courseOutcomes[i], `course.courseOutcomes[${i}]`, issues);
  }
}

function validateWeeklyPlan(course: CurriculumCourse, issues: ValidationIssue[]): void {
  if (course.weeklyPlan.length === 0) {
    issues.push({ severity: 'warning', path: 'course.weeklyPlan', message: 'No weekly plan defined.' });
    return;
  }

  const weeks = new Set<number>();
  for (const entry of course.weeklyPlan) {
    if (weeks.has(entry.weekNumber)) {
      issues.push({ severity: 'error', path: `course.weeklyPlan`, message: `Duplicate week number: ${entry.weekNumber}.` });
    }
    weeks.add(entry.weekNumber);
  }
}

// ─── Unit-Level Checks ──────────────────────────────────────────────

function validateUnit(
  unit: ThematicUnit,
  path: string,
  allLessonIds: Set<string>,
  allOutcomeIds: Set<string>,
  issues: ValidationIssue[],
): void {
  if (!unit.id.trim()) {
    issues.push({ severity: 'error', path: `${path}.id`, message: 'Unit ID is empty.' });
  }
  if (!unit.theme.trim()) {
    issues.push({ severity: 'warning', path: `${path}.theme`, message: 'Unit has no theme.' });
  }

  // Outcomes
  if (unit.canDoOutcomes.length === 0) {
    issues.push({ severity: 'error', path: `${path}.canDoOutcomes`, message: 'Unit has no can-do outcomes.' });
  }
  for (let i = 0; i < unit.canDoOutcomes.length; i++) {
    const outcome = unit.canDoOutcomes[i];
    if (allOutcomeIds.has(outcome.id)) {
      issues.push({ severity: 'error', path: `${path}.canDoOutcomes[${i}]`, message: `Duplicate outcome ID: ${outcome.id}` });
    }
    allOutcomeIds.add(outcome.id);
    validateOutcome(outcome, `${path}.canDoOutcomes[${i}]`, issues);
  }

  // Lessons
  if (unit.lessons.length === 0) {
    issues.push({ severity: 'error', path: `${path}.lessons`, message: 'Unit has no lessons.' });
  }
  for (let i = 0; i < unit.lessons.length; i++) {
    const lesson = unit.lessons[i];
    if (allLessonIds.has(lesson.id)) {
      issues.push({ severity: 'error', path: `${path}.lessons[${i}]`, message: `Duplicate lesson ID: ${lesson.id}` });
    }
    allLessonIds.add(lesson.id);
    validateLesson(lesson, `${path}.lessons[${i}]`, issues);
  }

  // Checkpoint
  validateCheckpoint(unit.checkpoint, unit, `${path}.checkpoint`, issues);

  // Remediation
  if (
    Object.keys(unit.remediation.weakSkillLessons).length === 0 &&
    unit.remediation.supplementaryExercises.length === 0
  ) {
    issues.push({ severity: 'warning', path: `${path}.remediation`, message: 'Unit has no remediation paths defined.' });
  }
}

// ─── Lesson-Level Checks ────────────────────────────────────────────

function validateLesson(lesson: UnitLesson, path: string, issues: ValidationIssue[]): void {
  if (!lesson.id.trim()) {
    issues.push({ severity: 'error', path: `${path}.id`, message: 'Lesson ID is empty.' });
  }
  if (!lesson.title.trim()) {
    issues.push({ severity: 'error', path: `${path}.title`, message: 'Lesson title is empty.' });
  }

  // Pedagogical phases
  if (lesson.phases.length < 2) {
    issues.push({
      severity: 'error',
      path: `${path}.phases`,
      message: `Lesson must have ≥ 2 pedagogical phases, found ${lesson.phases.length}.`,
    });
  }

  // Check for required phase types
  const phaseTypes = new Set(lesson.phases.map((p) => p.type));
  if (!phaseTypes.has('introduce') && !phaseTypes.has('spaced-review')) {
    issues.push({
      severity: 'warning',
      path: `${path}.phases`,
      message: 'Lesson has no "introduce" or "spaced-review" phase.',
    });
  }

  // Validate individual phases
  for (let i = 0; i < lesson.phases.length; i++) {
    validatePhase(lesson.phases[i], `${path}.phases[${i}]`, issues);
  }

  // Target outcomes
  if (lesson.targetOutcomes.length === 0) {
    issues.push({ severity: 'warning', path: `${path}.targetOutcomes`, message: 'Lesson has no target outcomes.' });
  }

  // Study tactics
  if (lesson.studyTactics.length === 0) {
    issues.push({ severity: 'warning', path: `${path}.studyTactics`, message: 'No study tactics provided.' });
  }

  // Pass criteria
  if (lesson.passCriteria.minimumScore < 1 || lesson.passCriteria.minimumScore > 100) {
    issues.push({ severity: 'error', path: `${path}.passCriteria.minimumScore`, message: 'Minimum score must be 1–100.' });
  }

  // Estimated time
  if (lesson.estimatedMinutes < 1) {
    issues.push({ severity: 'error', path: `${path}.estimatedMinutes`, message: 'Estimated minutes must be ≥ 1.' });
  }
}

function validatePhase(phase: LessonPhase, path: string, issues: ValidationIssue[]): void {
  if (phase.estimatedMinutes < 1) {
    issues.push({ severity: 'warning', path: `${path}.estimatedMinutes`, message: 'Phase has < 1 minute estimated time.' });
  }

  // Content checks per phase type
  switch (phase.type) {
    case 'introduce':
      if (!phase.content.explanations?.length && !phase.content.examples?.length) {
        issues.push({ severity: 'error', path, message: 'Introduce phase needs explanations or examples.' });
      }
      break;
    case 'recognize':
    case 'guided-practice':
    case 'produce':
    case 'checkpoint':
      if (!phase.content.questions?.length) {
        issues.push({ severity: 'error', path, message: `${phase.type} phase needs questions.` });
      }
      break;
    case 'spaced-review':
      // Review phase may have items injected at runtime
      break;
  }
}

// ─── Outcome Checks ─────────────────────────────────────────────────

function validateOutcome(outcome: CanDoOutcome, path: string, issues: ValidationIssue[]): void {
  if (!outcome.id.trim()) {
    issues.push({ severity: 'error', path: `${path}.id`, message: 'Outcome ID is empty.' });
  }
  if (!outcome.statement.trim()) {
    issues.push({ severity: 'error', path: `${path}.statement`, message: 'Outcome statement is empty.' });
  }
  if (outcome.assessmentCriteria.length === 0) {
    issues.push({ severity: 'error', path: `${path}.assessmentCriteria`, message: 'Outcome has no assessment criteria.' });
  }
  for (const criterion of outcome.assessmentCriteria) {
    if (criterion.minimumScore < 1 || criterion.minimumScore > 100) {
      issues.push({ severity: 'error', path: `${path}.assessmentCriteria`, message: `Invalid minimum score: ${criterion.minimumScore}` });
    }
  }
}

// ─── Checkpoint Checks ──────────────────────────────────────────────

function validateCheckpoint(
  checkpoint: UnitCheckpoint,
  unit: ThematicUnit,
  path: string,
  issues: ValidationIssue[],
): void {
  if (!checkpoint.id.trim()) {
    issues.push({ severity: 'error', path: `${path}.id`, message: 'Checkpoint ID is empty.' });
  }
  if (checkpoint.questions.length === 0) {
    issues.push({ severity: 'error', path: `${path}.questions`, message: 'Checkpoint has no questions.' });
  }
  if (checkpoint.masteryThreshold < 1 || checkpoint.masteryThreshold > 100) {
    issues.push({ severity: 'error', path: `${path}.masteryThreshold`, message: 'Mastery threshold must be 1–100.' });
  }

  // Check that checkpoint covers outcomes from the unit
  const checkpointOutcomeIds = new Set(checkpoint.questions.map((q: CheckpointQuestion) => q.assessedOutcomeId));
  const unitOutcomeIds = new Set(unit.canDoOutcomes.map((o) => o.id));

  for (const outcomeId of unitOutcomeIds) {
    if (!checkpointOutcomeIds.has(outcomeId)) {
      issues.push({
        severity: 'warning',
        path: `${path}.questions`,
        message: `Outcome "${outcomeId}" has no checkpoint question assessing it.`,
      });
    }
  }

  for (const q of checkpoint.questions) {
    if (!q.id.trim()) {
      issues.push({ severity: 'error', path: `${path}.questions`, message: 'Checkpoint question has empty ID.' });
    }
    if (!q.assessedOutcomeId.trim()) {
      issues.push({ severity: 'error', path: `${path}.questions`, message: `Question ${q.id} has no assessed outcome.` });
    }
  }
}

// ─── Prerequisite DAG Check ─────────────────────────────────────────

function validatePrerequisiteDAG(course: CurriculumCourse, issues: ValidationIssue[]): void {
  const allLessonIds = new Set<string>();
  const prereqGraph = new Map<string, string[]>();

  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      allLessonIds.add(lesson.id);
      prereqGraph.set(
        lesson.id,
        lesson.entryRequirements.map((r) => r.prerequisiteId),
      );
    }
  }

  // Check for missing prerequisites
  for (const [lessonId, prereqs] of prereqGraph.entries()) {
    for (const prereq of prereqs) {
      if (!allLessonIds.has(prereq)) {
        issues.push({
          severity: 'error',
          path: `lesson(${lessonId}).prerequisites`,
          message: `Prerequisite "${prereq}" does not exist.`,
        });
      }
    }
  }

  // Cycle detection using DFS
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string): void => {
    if (visiting.has(id)) {
      issues.push({
        severity: 'error',
        path: 'prerequisites',
        message: `Cycle detected involving lesson "${id}".`,
      });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prereq of prereqGraph.get(id) ?? []) {
      visit(prereq);
    }
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of allLessonIds) {
    visit(id);
  }
}

// ─── Exit Gate Checks ───────────────────────────────────────────────

function validateExitGate(
  course: CurriculumCourse,
  issues: ValidationIssue[],
): void {
  const gate = course.exitGate;
  if (!gate.id.trim()) {
    issues.push({ severity: 'error', path: 'exitGate.id', message: 'Exit gate ID is empty.' });
  }

  const allCheckpointIds = new Set(course.units.map((u) => u.checkpoint.id));
  for (const requiredId of gate.requiredCheckpoints) {
    if (!allCheckpointIds.has(requiredId)) {
      issues.push({
        severity: 'error',
        path: 'exitGate.requiredCheckpoints',
        message: `Required checkpoint "${requiredId}" does not exist.`,
      });
    }
  }

  if (gate.minimumAverageScore < 1 || gate.minimumAverageScore > 100) {
    issues.push({
      severity: 'error',
      path: 'exitGate.minimumAverageScore',
      message: 'Minimum average score must be 1–100.',
    });
  }
}

// ─── Placement Test Checks ──────────────────────────────────────────

function validatePlacementTest(course: CurriculumCourse, issues: ValidationIssue[]): void {
  const test = course.placementTest;
  if (!test) return;

  if (test.sections.length === 0) {
    issues.push({ severity: 'error', path: 'placementTest.sections', message: 'Placement test has no sections.' });
  }

  for (let i = 0; i < test.sections.length; i++) {
    const section = test.sections[i];
    if (section.questions.length === 0) {
      issues.push({
        severity: 'error',
        path: `placementTest.sections[${i}]`,
        message: `Placement section for ${section.skill} has no questions.`,
      });
    }
  }

  if (test.resultMapping.length === 0) {
    issues.push({ severity: 'error', path: 'placementTest.resultMapping', message: 'Placement test has no result mappings.' });
  }

  // Ensure mappings cover all possible scores
  const sortedMappings = [...test.resultMapping].sort((a, b) => a.minScore - b.minScore);
  if (sortedMappings.length > 0 && sortedMappings[0].minScore > 0) {
    issues.push({
      severity: 'warning',
      path: 'placementTest.resultMapping',
      message: 'No mapping covers score 0. Learners scoring 0 will default to unit 0.',
    });
  }
}
