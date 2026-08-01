import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDashboardMetrics } from '../../src/viewmodels/dashboardMetrics.ts';

describe('dashboard metric view model', () => {
  it('uses the same authoritative learning values in every dashboard surface', () => {
    const metrics = createDashboardMetrics(
      { totalXP: 0, currentStreak: 0, level: 1, ieltsEstimatedBand: 0 },
      0,
      50,
      7,
    );

    assert.deepEqual(metrics, {
      totalXP: 0,
      todayXP: 0,
      dailyXPGoal: 50,
      dailyProgress: 0,
      streak: 0,
      level: 1,
      estimatedBand: null,
      targetBand: 7,
    });
  });
});
