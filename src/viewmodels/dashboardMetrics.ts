type LearningMetricSource = {
  totalXP: number;
  currentStreak: number;
  level: number;
  ieltsEstimatedBand: number;
};

export function createDashboardMetrics(stats: LearningMetricSource, todayXP: number, dailyXPGoal: number, targetBand: number) {
  return {
    totalXP: stats.totalXP,
    todayXP,
    dailyXPGoal,
    dailyProgress: Math.min(100, Math.round((todayXP / Math.max(dailyXPGoal, 1)) * 100)),
    streak: stats.currentStreak,
    level: stats.level,
    estimatedBand: stats.ieltsEstimatedBand > 0 ? stats.ieltsEstimatedBand : null,
    targetBand,
  };
}
