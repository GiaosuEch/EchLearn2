export type StreakTodayStatus = 'new' | 'needs_study' | 'secured';

export interface StreakTodayResult {
  status: StreakTodayStatus;
  detail: string;
}

function dayValue(value: string | null | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getStreakTodayStatus(input: { currentStreak: number; lastActiveDate?: string | null; today: string }): StreakTodayResult {
  if (!Number.isFinite(input.currentStreak) || input.currentStreak <= 0) {
    return { status: 'new', detail: 'Hoàn thành bài học đầu tiên để bắt đầu chuỗi của bạn.' };
  }

  const lastActive = dayValue(input.lastActiveDate);
  const today = dayValue(input.today);
  if (lastActive !== null && today !== null && lastActive >= today) {
    return { status: 'secured', detail: 'Bạn đã giữ nhịp học hôm nay.' };
  }
  return { status: 'needs_study', detail: 'Hoàn thành một bài học để giữ nhịp hôm nay.' };
}
