import { motion } from 'motion/react';
import { Award, Lock } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { CustomEmoji, type CustomEmojiName } from '../../../components/common/CustomEmoji';

export default function AchievementsPage() {
  // `icon` is a CustomEmoji name, not an OS emoji character: the yellow system
  // glyphs rendered differently on every platform and clashed with the flat art.
  const achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: CustomEmojiName;
    isUnlocked: boolean;
    date?: string;
    progress?: number;
    total?: number;
  }> = [
    { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: 'skill-target', isUnlocked: true, date: '2026-07-01' },
    { id: '2', title: '7-Day Streak', description: 'Maintain a 7-day learning streak', icon: 'streak-fire', isUnlocked: true, date: '2026-07-08' },
    { id: '3', title: 'Vocabulary Master I', description: 'Learn 100 new words', icon: 'skill-book', isUnlocked: true, date: '2026-07-10' },
    { id: '4', title: 'Social Butterfly', description: 'Join 3 study groups', icon: 'butterfly-social', isUnlocked: false, progress: 1, total: 3 },
    { id: '5', title: 'Perfect Pitch', description: 'Score 90%+ in 5 speaking exercises', icon: 'skill-mic', isUnlocked: false, progress: 2, total: 5 },
    { id: '6', title: 'IELTS Ready', description: 'Complete a full mock test', icon: 'graduation-cap', isUnlocked: false, progress: 0, total: 1 },
    { id: '7', title: 'Grammar Guru', description: 'Complete the advanced grammar module', icon: 'brain-grammar', isUnlocked: false, progress: 45, total: 100 },
    { id: '8', title: 'Night Owl', description: 'Complete 10 lessons after midnight', icon: 'owl-night', isUnlocked: false, progress: 4, total: 10 },
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <PageShell title="Achievements" description="Track your milestones and collect badges." icon={<Award size={20} />}>
      
      {/* Header Stats */}
      <div className="glass-card p-6 md:p-8 mb-8 bg-gradient-to-r from-primary-900/40 to-dark-900 border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-dark-800" />
              <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${(unlockedCount / achievements.length) * 226} 226`} className="text-primary-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-white">
              {unlockedCount}/{achievements.length}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Collection</h2>
            <p className="text-dark-300 mt-1">Unlock them all to reach <span className="text-primary-400 font-bold">Diamond Tier</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10 w-full md:w-auto">
          <Mascot expression="cool" size={100} />
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white bg-dark-800/80 px-4 py-2 rounded-2xl rounded-tl-sm border border-dark-700">
              You're doing great!<br/>Keep collecting badges.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((ach, i) => (
          <motion.div 
            key={ach.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`card-3d p-6 rounded-3xl flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300 border ${
              ach.isUnlocked 
                ? 'border-emerald-500/40 hover:border-emerald-400 bg-white dark:bg-slate-900 shadow-xl hover:shadow-emerald-500/20' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="card-3d-inner w-full flex flex-col items-center">
              {ach.isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}
              
              <div className="relative mb-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-transform duration-300 group-hover:scale-110 ${
                  ach.isUnlocked 
                    ? 'bg-slate-100 dark:bg-slate-900 border-emerald-500 shadow-emerald-500/20' 
                    : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-700'
                }`}>
                  <CustomEmoji name={ach.icon} size={44} label={ach.title} />
                </div>
                {!ach.isUnlocked && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-md">
                    <Lock size={14} />
                  </div>
                )}
              </div>
              
              <h3 className={`font-black text-sm mb-1 ${ach.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{ach.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1 font-medium">{ach.description}</p>
              
              <div className="w-full mt-auto">
                {ach.isUnlocked ? (
                  <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 rounded-xl w-full flex items-center justify-center gap-1">
                    ✨ Đã Mở Khóa • {new Date(ach.date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Tiến độ</span>
                      <span>{ach.progress}/{ach.total}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${((ach.progress || 0) / (ach.total || 1)) * 100}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
