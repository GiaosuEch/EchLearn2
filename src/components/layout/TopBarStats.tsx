import { memo } from 'react';
import { useLearningStore } from '../../stores/learningStore';

/**
 * The XP/streak chips are the only part of the top bar that reacts to learning
 * progress. Keeping the subscription here means an XP award repaints two spans
 * instead of the search box, the language dropdown and the account button.
 */
export const TopBarStats = memo(function TopBarStats() {
  const totalXP = useLearningStore(s => s.stats.totalXP);
  const currentStreak = useLearningStore(s => s.stats.currentStreak);

  return (
    <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
      <span className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">{totalXP.toLocaleString()} XP</span>
      <span className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">Chuỗi {currentStreak} ngày</span>
    </div>
  );
});

export default TopBarStats;
