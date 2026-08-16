import type { RealworldSurvivalLesson } from '../curriculum/realworldSurvivalData.ts';
import type { PracticeAttemptInput, PracticeAttemptSummary } from './practiceLearningIntegration.ts';

export type RealworldSurvivalValidationCode =
  | 'generative_required'
  | 'generative_failed_slots'
  | 'semantic_incorrect'
  | 'self_review_incomplete';

export type RealworldSurvivalValidationError = {
  ok: false;
  code: RealworldSurvivalValidationCode;
  messageVi: string;
};

export type RealworldSurvivalCompletion = {
  ok: true;
  attempt: PracticeAttemptSummary;
  completedLessonId: RealworldSurvivalLesson['id'];
};

export type RealworldSurvivalCompletionResult = RealworldSurvivalValidationError | RealworldSurvivalCompletion;

export type PragmaticScore = {
  isValid: boolean;
  score: number; // 0.0 to 1.0
  feedbackVi: string;
  missingSlots: string[];
};

export type RealworldSurvivalCompletionInput = {
  lesson: RealworldSurvivalLesson;
  userId?: string;
  nativeLanguage?: string;
  interfaceLanguage?: string;
  semanticResponse: string;
  generativeResponse: string;
  selfReview: Partial<Record<string, boolean>>;
  recordingDurationSec?: number;
};

export type RealworldSurvivalCompletionDependencies = {
  recordPracticeAttempt: (input: PracticeAttemptInput) => Promise<PracticeAttemptSummary>;
  markLessonCompleted: (userId: string, lessonId: string) => Promise<void>;
  evaluateGenerativeResponse: (response: string, lesson: RealworldSurvivalLesson) => Promise<PragmaticScore>;
};

// Temporary deterministic mock for Pragmatic Evaluator until backend is connected
export async function mockEvaluateGenerativeResponse(response: string, lesson: RealworldSurvivalLesson): Promise<PragmaticScore> {
  const normalizedResponse = response.toLowerCase().trim();
  const missingSlots = lesson.generativeSimulation.semanticSlots.filter(slot => !normalizedResponse.includes(slot.toLowerCase().trim()));
  
  if (!response) {
    return { isValid: false, score: 0, feedbackVi: 'Vui lòng nhập câu trả lời.', missingSlots: lesson.generativeSimulation.semanticSlots };
  }
  
  if (missingSlots.length > 0) {
    return { isValid: false, score: 0.5, feedbackVi: 'Câu của bạn chưa truyền đạt đủ ý chính.', missingSlots };
  }
  
  return { isValid: true, score: 1.0, feedbackVi: 'Rất tốt! Bạn đã truyền đạt thành công ý chính.', missingSlots: [] };
}

export function hasCompletedRealworldSurvivalSelfReview(
  lesson: RealworldSurvivalLesson,
  selfReview: Partial<Record<string, boolean>>,
): boolean {
  return lesson.selfReview.every((prompt) => selfReview[prompt] === true);
}

export async function validateRealworldSurvivalCompletion(
  input: Pick<RealworldSurvivalCompletionInput, 'lesson' | 'semanticResponse' | 'generativeResponse' | 'selfReview'>,
  evaluator: (response: string, lesson: RealworldSurvivalLesson) => Promise<PragmaticScore>
): Promise<RealworldSurvivalValidationError | null> {
  
  // 1. Validate Semantic Discrimination
  if (input.semanticResponse !== input.lesson.semanticDiscrimination.correctPragmaticAction) {
    return {
      ok: false,
      code: 'semantic_incorrect',
      messageVi: 'Bạn chưa chọn đúng hành động giao tiếp phù hợp. Hãy thử lại.'
    };
  }

  // 2. Validate Generative Simulation
  if (!input.generativeResponse || input.generativeResponse.trim() === '') {
    return { ok: false, code: 'generative_required', messageVi: 'Hãy tự viết hoặc nói một câu của riêng bạn trước khi hoàn thành.' };
  }

  const pragmaticResult = await evaluator(input.generativeResponse, input.lesson);
  if (!pragmaticResult.isValid) {
    return {
      ok: false,
      code: 'generative_failed_slots',
      messageVi: pragmaticResult.feedbackVi + (pragmaticResult.missingSlots.length > 0 ? ' Các ý còn thiếu: ' + pragmaticResult.missingSlots.join(', ') : '')
    };
  }

  // 3. Validate Self Review
  if (!hasCompletedRealworldSurvivalSelfReview(input.lesson, input.selfReview)) {
    return { ok: false, code: 'self_review_incomplete', messageVi: 'Hãy hoàn thành đủ các mục tự rà soát trước khi tiếp tục.' };
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
export function createRealworldSurvivalCompletionService(
  dependencies: RealworldSurvivalCompletionDependencies,
) {
  return async function completeRealworldSurvivalLesson(
    input: RealworldSurvivalCompletionInput,
  ): Promise<RealworldSurvivalCompletionResult> {
    const validationError = await validateRealworldSurvivalCompletion(input, dependencies.evaluateGenerativeResponse);
    if (validationError) return validationError;

    const recordingDurationSec = learnerProvidedDuration(input.recordingDurationSec);
    const attempt = await dependencies.recordPracticeAttempt({
      userId: input.userId,
      targetLanguage: input.lesson.language,
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
        course: 'realworld-survival',
        completionKind: 'pragmatic-generative',
        stagesCompleted: ['semantic-discrimination', 'generative-simulation', 'self-review'],
        ...(recordingDurationSec === undefined ? {} : { recordingDurationSec }),
      },
    });

    await dependencies.markLessonCompleted(attempt.userId, input.lesson.id);
    return { ok: true, attempt, completedLessonId: input.lesson.id };
  };
}

const defaultDependencies: RealworldSurvivalCompletionDependencies = {
  async recordPracticeAttempt(input) {
    const service = await import('./practiceLearningIntegration.ts');
    return service.recordPracticeAttempt(input);
  },
  async markLessonCompleted(userId, lessonId) {
    const { progressService } = await import('./progressService.ts');
    return progressService.markLessonCompleted(userId, lessonId);
  },
  evaluateGenerativeResponse: mockEvaluateGenerativeResponse,
};

export const completeRealworldSurvivalLesson = createRealworldSurvivalCompletionService(defaultDependencies);
