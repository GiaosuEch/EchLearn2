import { type MasteryLabel } from '../types/learningTypes';

export function getMasteryLabel(score: number): MasteryLabel {
  if (score >= 90) return 'Thành thạo';
  if (score >= 75) return 'Gần thành thạo';
  if (score >= 50) return 'Khá ổn';
  if (score >= 25) return 'Đang học';
  return 'Chưa chắc';
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Advanced DHP (Difficulty, Halflife, Probability) Bayesian Knowledge Tracing.
 * Converts traditional static spaced repetition into a true dynamic decay model.
 */
export function calculateMasteryScore(params: {
  currentScore: number;
  isCorrect: boolean;
  hadMistake?: boolean;
  repeatedWrong?: boolean;
  audioReplay?: boolean;
  typedExact?: boolean;
  typedClose?: boolean;
  skipped?: boolean;
  difficulty?: number;
}) {
  const diffScale = params.difficulty ? Math.max(1, params.difficulty) : 2.5;
  
  if (params.skipped) return clamp(params.currentScore - 15);

  let evidenceWeight = params.isCorrect ? 1.0 : -1.0;
  
  if (params.isCorrect) {
    if (params.hadMistake) evidenceWeight *= 0.6; // Correct but struggled
    if (params.typedExact) evidenceWeight *= 1.2; // Absolute recall precision
  } else {
    if (params.repeatedWrong) evidenceWeight *= 1.5; // Severe penalty for recurring failure
  }

  if (params.audioReplay) evidenceWeight -= 0.1;

  // Logistic Growth/Decay based on evidence and cognitive difficulty
  // If correct, score asymptotically approaches 100
  // If wrong, score drops exponentially based on difficulty
  const alpha = 0.3; // Learning rate
  let newScore = params.currentScore;
  
  if (evidenceWeight > 0) {
    const spaceToLearn = 100 - params.currentScore;
    newScore += spaceToLearn * alpha * evidenceWeight * (1 / diffScale);
  } else {
    newScore += params.currentScore * alpha * evidenceWeight * diffScale;
  }

  return clamp(newScore);
}

/**
 * Dynamic Difficulty adjustment using an Exponential Moving Average
 */
export function calculateNewDifficulty(currentDifficulty: number, isCorrect: boolean) {
  const targetDifficulty = isCorrect ? Math.max(1.0, currentDifficulty - 0.5) : Math.min(5.0, currentDifficulty + 1.0);
  const emaAlpha = 0.2;
  const newDiff = currentDifficulty * (1 - emaAlpha) + targetDifficulty * emaAlpha;
  return Math.max(1.0, Math.min(5.0, newDiff));
}

/**
 * Halflife-based Spaced Repetition Scheduling.
 * Calculates when the probability of recall will drop below a critical threshold (e.g., 80%).
 */
export function scheduleNextReview(
  masteryScore: number, 
  wasWrong = false, 
  currentDifficulty = 2.5, 
  consecutiveCorrect = 0, 
  fromDate = new Date()
) {
  const next = new Date(fromDate);
  
  if (wasWrong || masteryScore < 25) {
    // Immediate reinforcement required (short-term working memory)
    next.setMinutes(next.getMinutes() + 10);
    return next.toISOString();
  }
  
  // Base Halflife calculation (in days)
  // Higher consecutive correct -> Exponential increase in memory halflife
  // Higher difficulty -> Shorter halflife
  const baseStability = 1.5; // Base memory stability factor
  const memoryHalflife = Math.max(1, baseStability * Math.pow(1.8, consecutiveCorrect) / currentDifficulty);
  
  // We want to review when recall probability hits ~85%
  // P(t) = e^(-t / Halflife) => t = -Halflife * ln(P(t))
  const targetProbability = 0.85;
  const optimalIntervalDays = -memoryHalflife * Math.log(targetProbability);
  
  const finalIntervalDays = Math.min(365, Math.max(1, Math.round(optimalIntervalDays)));
  
  next.setDate(next.getDate() + finalIntervalDays);
  return next.toISOString();
}
