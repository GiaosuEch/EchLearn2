import {
  validateAIOutcome,
  type UnavailableAIOutcome,
} from '../platform/quality/aiHonestyPolicy.ts';

const UNAVAILABLE_REASON = 'APPROVED_LOCAL_MODEL_UNAVAILABLE';

export type WritingAnalysisResult = UnavailableAIOutcome;

export async function analyzeWriting(
  _text: string,
  _taskType: string,
): Promise<WritingAnalysisResult> {
  const outcome = validateAIOutcome({
    status: 'unavailable',
    mode: 'local-model',
    reason: UNAVAILABLE_REASON,
  });

  if (outcome.status !== 'unavailable') {
    throw new Error('Writing assessment must remain unavailable without an approved local model.');
  }
  return outcome;
}

/** Deterministic legacy pack helper. It does not call an AI runtime. */
export async function getStudyPlan(
  targetBand: number,
  currentBand: number,
  weeksAvailable: number,
) {

  const bandGap = targetBand - currentBand;
  const weeklyHours = bandGap > 2 ? 15 : bandGap > 1 ? 10 : 7;

  return {
    method: 'deterministic-rule' as const,
    isAiGenerated: false as const,
    targetBand,
    currentBand,
    estimatedWeeks: Math.ceil(bandGap * 6),
    weeklyHours,
    dailyPlan: {
      listening: Math.round((weeklyHours * 0.25) / 7 * 60),
      reading: Math.round((weeklyHours * 0.25) / 7 * 60),
      writing: Math.round((weeklyHours * 0.3) / 7 * 60),
      speaking: Math.round((weeklyHours * 0.2) / 7 * 60),
    },
    weeklyGoals: [
      `Complete ${Math.ceil(weeksAvailable / 2)} mock tests`,
      `Write ${Math.ceil(weeklyHours / 3)} essays per week`,
      `Practice speaking ${Math.ceil(weeklyHours / 5)} times per week`,
      `Learn ${Math.ceil(weeklyHours * 3)} new vocabulary words per week`,
    ],
    focusAreas:
      bandGap > 1.5
        ? [
            'Vocabulary building',
            'Grammar fundamentals',
            'Basic writing structure',
            'Listening comprehension',
          ]
        : ['Advanced vocabulary', 'Complex grammar', 'Essay coherence', 'Fluency improvement'],
  };
}
