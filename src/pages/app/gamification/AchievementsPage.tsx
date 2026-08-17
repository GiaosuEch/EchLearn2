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
      <div className="p-8 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-100 dark:text-slate-800" />
              <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={`${(unlockedCount / achievements.length) * 226} 226`} className="text-emerald-600 dark:text-emerald-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-slate-900 dark:text-white">
              {unlockedCount}/{achievements.length}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Collection</h2>
            <p className="text-slate-500 mt-1">Unlock them all to reach <span className="text-emerald-600 font-bold">Diamond Tier</span></p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Mascot expression="cool" size={80} />
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
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
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            className={`p-6 rounded-2xl flex flex-col items-center text-center transition-shadow duration-200 border ${
              ach.isUnlocked 
                ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]' 
                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
            }`}
          >
            <div className="w-full flex flex-col items-center">
              <div className="relative mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  ach.isUnlocked 
                    ? 'bg-slate-50 dark:bg-slate-800' 
                    : 'bg-transparent grayscale opacity-50'
                }`}>
                  <CustomEmoji name={ach.icon} size={32} label={ach.title} />
                </div>
                {!ach.isUnlocked && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Lock size={12} />
                  </div>
                )}
              </div>
              
              <h3 className={`font-semibold text-sm mb-1 ${ach.isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{ach.title}</h3>
              <p className="text-xs text-slate-500 mb-6 flex-1">{ach.description}</p>
              
              <div className="w-full mt-auto">
                {ach.isUnlocked ? (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Unlocked {ach.date}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Progress</span>
                      <span>{ach.progress}/{ach.total}</span>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-300 dark:bg-slate-600 rounded-full"
                        style={{ width: `${(ach.progress! / ach.total!) * 100}%` }}
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
