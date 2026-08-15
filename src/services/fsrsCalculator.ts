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
  let delta = 0;
  const grade = params.isCorrect ? (params.hadMistake ? 3 : (params.typedExact ? 5 : 4)) : (params.repeatedWrong ? 1 : 2);
  
  if (params.skipped) delta -= 10;
  
  if (grade >= 4) delta += 15;
  else if (grade === 3) delta += 7;
  else if (grade === 2) delta -= 5;
  else if (grade === 1) delta -= 12;

  if (params.audioReplay) delta -= 1;

  const diffScale = params.difficulty ? (params.difficulty / 5) : 1;
  delta = params.isCorrect ? delta * diffScale : delta / diffScale;

  return clamp(params.currentScore + delta);
}

export function calculateNewDifficulty(currentDifficulty: number, isCorrect: boolean) {
  const grade = isCorrect ? 4 : 2;
  const newDiff = currentDifficulty + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  return Math.max(1.3, Math.min(5.0, newDiff));
}

export function scheduleNextReview(masteryScore: number, wasWrong = false, currentDifficulty = 2.5, consecutiveCorrect = 0, fromDate = new Date()) {
  const next = new Date(fromDate);
  let intervalDays = 1;
  
  if (wasWrong || masteryScore < 25) {
    next.setMinutes(next.getMinutes() + 10);
    return next.toISOString();
  }
  
  if (consecutiveCorrect === 1) intervalDays = 1;
  else if (consecutiveCorrect === 2) intervalDays = 6;
  else if (consecutiveCorrect > 2) {
    intervalDays = Math.round(6 * Math.pow(currentDifficulty, consecutiveCorrect - 2));
  }
  
  intervalDays = Math.min(365, intervalDays);
  next.setDate(next.getDate() + intervalDays);
  
  return next.toISOString();
}
