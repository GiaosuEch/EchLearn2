export interface StudyStreakInput {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  studyDate: string;
}

export interface StudyStreakResult {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  didAdvance: boolean;
}

function toUtcDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function wholeNumber(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

/** Calculates a once-per-UTC-day study streak without any storage side effects. */
export function calculateStudyStreak(input: StudyStreakInput): StudyStreakResult {
  const studyDay = toUtcDay(input.studyDate);
  const currentStreak = wholeNumber(input.currentStreak);
  const longestStreak = wholeNumber(input.longestStreak);
  const lastDay = input.lastActiveDate ? toUtcDay(input.lastActiveDate) : null;

  if (studyDay === null) {
    return { currentStreak, longestStreak, lastActiveDate: input.lastActiveDate ?? '', didAdvance: false };
  }
  if (lastDay !== null && studyDay <= lastDay) {
    return { currentStreak, longestStreak, lastActiveDate: input.lastActiveDate!, didAdvance: false };
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const nextCurrent = lastDay !== null && studyDay - lastDay === oneDay ? currentStreak + 1 : 1;
  return {
    currentStreak: nextCurrent,
    longestStreak: Math.max(longestStreak, nextCurrent),
    lastActiveDate: input.studyDate,
    didAdvance: true,
  };
}
