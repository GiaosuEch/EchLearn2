import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';

/**
 * Owns its own store subscriptions so an XP award repaints this 4-line panel
 * instead of the whole shell (sidebar links, topbar and outlet included).
 */
export const SidebarDailyProgress = memo(function SidebarDailyProgress() {
  const { t } = useTranslation();
  const stats = useLearningStore((s) => s.stats);
  const todayXP = useLearningStore((s) => s.todayXP);
  const dailyXPGoal = useAppStore((s) => s.dailyXpGoal);
  const progressPercent = Math.min(100, (todayXP / Math.max(dailyXPGoal, 1)) * 100);

  return (
    <div className="ech-daily-progress px-4 py-3">
      <div className="flex items-center justify-between text-sm mb-1"><span>{t('gamification.daily_xp', { defaultValue: 'Daily XP' })}</span><span className="font-semibold">{todayXP}/{dailyXPGoal}</span></div>
      <div className="ech-progress-track h-2 rounded-full overflow-hidden"><div className="ech-progress-fill h-full w-full origin-left rounded-full transition-transform duration-500" style={{ transform: `scaleX(${progressPercent / 100})` }} /></div>
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400"><span>Chuỗi {stats.currentStreak} ngày</span><span>{stats.totalXP.toLocaleString()} XP</span><span>Cấp {stats.level}</span></div>
    </div>
  );
});

export default SidebarDailyProgress;
