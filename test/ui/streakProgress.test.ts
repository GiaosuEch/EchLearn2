import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateStudyStreak } from '../../src/services/streakProgressService.ts';

describe('study streak progress', () => {
  it('counts only the first completed activity on the same UTC day', () => {
    const next = calculateStudyStreak({ currentStreak: 4, longestStreak: 7, lastActiveDate: '2026-08-09', studyDate: '2026-08-09' });

    assert.deepEqual(next, { currentStreak: 4, longestStreak: 7, lastActiveDate: '2026-08-09', didAdvance: false });
  });

  it('extends a streak when the learner returns on the next UTC day', () => {
    const next = calculateStudyStreak({ currentStreak: 4, longestStreak: 4, lastActiveDate: '2026-08-08', studyDate: '2026-08-09' });

    assert.deepEqual(next, { currentStreak: 5, longestStreak: 5, lastActiveDate: '2026-08-09', didAdvance: true });
  });

  it('starts a new streak after a missed UTC day', () => {
    const next = calculateStudyStreak({ currentStreak: 9, longestStreak: 12, lastActiveDate: '2026-08-06', studyDate: '2026-08-09' });

    assert.deepEqual(next, { currentStreak: 1, longestStreak: 12, lastActiveDate: '2026-08-09', didAdvance: true });
  });
});
