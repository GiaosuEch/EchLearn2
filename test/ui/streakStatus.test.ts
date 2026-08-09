import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getStreakTodayStatus } from '../../src/services/streakStatusService.ts';

test('a streak is secured only after study has been recorded for today', () => {
  assert.deepEqual(
    getStreakTodayStatus({ currentStreak: 4, lastActiveDate: '2026-08-09', today: '2026-08-09' }),
    { status: 'secured', detail: 'Bạn đã giữ nhịp học hôm nay.' },
  );
  assert.deepEqual(
    getStreakTodayStatus({ currentStreak: 4, lastActiveDate: '2026-08-08', today: '2026-08-09' }),
    { status: 'needs_study', detail: 'Hoàn thành một bài học để giữ nhịp hôm nay.' },
  );
  assert.deepEqual(
    getStreakTodayStatus({ currentStreak: 0, lastActiveDate: null, today: '2026-08-09' }),
    { status: 'new', detail: 'Hoàn thành bài học đầu tiên để bắt đầu chuỗi của bạn.' },
  );
});
