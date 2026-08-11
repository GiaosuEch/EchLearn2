import type { EnglishSurvivalLesson } from '../curriculum/englishSurvival30.ts';
import type { PracticeAttemptInput, PracticeAttemptSummary } from './practiceLearningIntegration.ts';

export type EnglishSurvivalValidationCode =
  | 'production_required'
  | 'production_copies_model'
  | 'retrieval_incorrect'
  | 'self_review_incomplete';

export type EnglishSurvivalValidationError = {
  ok: false;
  code: EnglishSurvivalValidationCode;
  messageVi: string;
};

export type EnglishSurvivalCompletion = {
  ok: true;
  attempt: PracticeAttemptSummary;
  completedLessonId: EnglishSurvivalLesson['id'];
};

export type EnglishSurvivalCompletionResult = EnglishSurvivalValidationError | EnglishSurvivalCompletion;

export type EnglishSurvivalCompletionInput = {
  lesson: EnglishSurvivalLesson;
  userId?: string;
  nativeLanguage?: string;
  interfaceLanguage?: string;
  productionResponse: string;
  retrievalResponse: string;
  selfReview: Partial<Record<string, boolean>>;
  recordingDurationSec?: number;
};

export type EnglishSurvivalCompletionDependencies = {
  recordPracticeAttempt: (input: PracticeAttemptInput) => Promise<PracticeAttemptSummary>;
  markLessonCompleted: (userId: string, lessonId: string) => Promise<void>;
};

/**
 * Normalizes only the surface differences learners should not be penalized for
 * in retrieval: case, spacing, curly apostrophes, and terminal punctuation.
 */
export function normalizeEnglishSurvivalAnswer(value: string): string {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?\u2026]+$/g, '')
    .trim()
    .toLocaleLowerCase('en');
}

export function hasCompletedEnglishSurvivalSelfReview(
  lesson: EnglishSurvivalLesson,
  selfReview: Partial<Record<string, boolean>>,
): boolean {
  return lesson.selfReview.every((prompt) => selfReview[prompt] === true);
}

export function validateEnglishSurvivalCompletion(
  input: Pick<EnglishSurvivalCompletionInput, 'lesson' | 'productionResponse' | 'retrievalResponse' | 'selfReview'>,
): EnglishSurvivalValidationError | null {
  const production = normalizeEnglishSurvivalAnswer(input.productionResponse);
  if (!production) {
    return { ok: false, code: 'production_required', messageVi: 'Hãy tự viết hoặc nói một câu của riêng bạn trước khi hoàn thành.' };
  }

  if (production === normalizeEnglishSurvivalAnswer(input.lesson.production.exemplar)) {
    return { ok: false, code: 'production_copies_model', messageVi: 'Hãy thay đổi câu mẫu bằng thông tin hoặc tình huống của riêng bạn.' };
  }

  const retrieval = normalizeEnglishSurvivalAnswer(input.retrievalResponse);
  const accepted = input.lesson.retrieval.acceptedAnswers
    .map(normalizeEnglishSurvivalAnswer);
  if (!accepted.includes(retrieval)) {
    return { ok: false, code: 'retrieval_incorrect', messageVi: 'Hãy thử nhớ lại câu trả lời cho phần ôn nhanh.' };
  }

  if (!hasCompletedEnglishSurvivalSelfReview(input.lesson, input.selfReview)) {
    return { ok: false, code: 'self_review_incomplete', messageVi: 'Hãy hoàn thành đủ bốn mục tự rà soát trước khi tiếp tục.' };
  }

  return null;
}

function learnerProvidedDuration(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/**
 * Records a completed survival lesson only after the learner has produced a
 * non-model response, recalled the target phrase, and filled in self-review.
 * This service intentionally records completion evidence, never assessment.
 */
export function createEnglishSurvivalCompletionService(
  dependencies: EnglishSurvivalCompletionDependencies,
) {
  return async function completeEnglishSurvivalLesson(
    input: EnglishSurvivalCompletionInput,
  ): Promise<EnglishSurvivalCompletionResult> {
    const validationError = validateEnglishSurvivalCompletion(input);
    if (validationError) return validationError;

    const recordingDurationSec = learnerProvidedDuration(input.recordingDurationSec);
    const attempt = await dependencies.recordPracticeAttempt({
      userId: input.userId,
      targetLanguage: 'en',
      nativeLanguage: input.nativeLanguage,
      interfaceLanguage: input.interfaceLanguage,
      skillType: 'lesson',
      activityId: input.lesson.id,
      activityTitle: input.lesson.titleEn,
      score: 1,
      total: 1,
      answers: [{
        itemId: input.lesson.id,
        isCorrect: true,
        answer: 'completed',
        correctAnswer: 'completed',
        timeSpentSec: recordingDurationSec,
      }],
      metadata: {
        course: 'english-survival-30',
        completionKind: 'guided-production',
        stagesCompleted: ['production', 'retrieval', 'self-review'],
        ...(recordingDurationSec === undefined ? {} : { recordingDurationSec }),
      },
    });

    await dependencies.markLessonCompleted(attempt.userId, input.lesson.id);
    return { ok: true, attempt, completedLessonId: input.lesson.id };
  };
}

const defaultDependencies: EnglishSurvivalCompletionDependencies = {
  async recordPracticeAttempt(input) {
    const service = await import('./practiceLearningIntegration.ts');
    return service.recordPracticeAttempt(input);
  },
  async markLessonCompleted(userId, lessonId) {
    const { progressService } = await import('./progressService.ts');
    return progressService.markLessonCompleted(userId, lessonId);
  },
};

export const completeEnglishSurvivalLesson = createEnglishSurvivalCompletionService(defaultDependencies);
