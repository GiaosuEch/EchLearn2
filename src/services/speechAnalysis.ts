import {
  validateAIOutcome,
  type UnavailableAIOutcome,
} from '../platform/quality/aiHonestyPolicy.ts';

const UNAVAILABLE_REASON = 'APPROVED_LOCAL_MODEL_UNAVAILABLE';

export type SpeechAnalysisResult = UnavailableAIOutcome;

export async function analyzeSpeech(
  _audioBlob: Blob,
  _targetText: string,
): Promise<SpeechAnalysisResult> {
  const outcome = validateAIOutcome({
    status: 'unavailable',
    mode: 'local-model',
    reason: UNAVAILABLE_REASON,
  });

  if (outcome.status !== 'unavailable') {
    throw new Error('Speech assessment must remain unavailable without an approved local model.');
  }
  return outcome;
}
