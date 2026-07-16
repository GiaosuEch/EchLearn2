// @ts-nocheck

import { motion } from 'motion/react';
import { Award, Star, Trophy, Shield, Zap, Lock } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';

export default function AchievementsPage() {
  const achievements = [
    { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', isUnlocked: true, date: '2026-07-01' },
    { id: '2', title: '7-Day Streak', description: 'Maintain a 7-day learning streak', icon: '🔥', isUnlocked: true, date: '2026-07-08' },
    { id: '3', title: 'Vocabulary Master I', description: 'Learn 100 new words', icon: '📚', isUnlocked: true, date: '2026-07-10' },
    { id: '4', title: 'Social Butterfly', description: 'Join 3 study groups', icon: '🦋', isUnlocked: false, progress: 1, total: 3 },
    { id: '5', title: 'Perfect Pitch', description: 'Score 90%+ in 5 speaking exercises', icon: '🎤', isUnlocked: false, progress: 2, total: 5 },
    { id: '6', title: 'IELTS Ready', description: 'Complete a full mock test', icon: '🎓', isUnlocked: false, progress: 0, total: 1 },
    { id: '7', title: 'Grammar Guru', description: 'Complete the advanced grammar module', icon: '🧠', isUnlocked: false, progress: 45, total: 100 },
    { id: '8', title: 'Night Owl', description: 'Complete 10 lessons after midnight', icon: '🦉', isUnlocked: false, progress: 4, total: 10 },
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
            className={`glass-card p-6 flex flex-col items-center text-center relative overflow-hidden group transition-all ${ach.isUnlocked ? 'border-primary-500/30 hover:border-primary-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] bg-gradient-to-b from-primary-900/10 to-dark-900' : 'opacity-70 grayscale hover:grayscale-0 transition-all'}`}
          >
            {ach.isUnlocked && (
              <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            
            <div className="relative mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl border-4 ${ach.isUnlocked ? 'bg-dark-800 border-primary-500' : 'bg-dark-900 border-dark-700'}`}>
                {ach.icon}
              </div>
              {!ach.isUnlocked && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dark-900 flex items-center justify-center border-2 border-dark-700 text-dark-400">
                  <Lock size={14} />
                </div>
              )}
            </div>
            
            <h3 className={`font-bold mb-1 ${ach.isUnlocked ? 'text-white' : 'text-dark-300'}`}>{ach.title}</h3>
            <p className="text-xs text-dark-400 mb-4 flex-1">{ach.description}</p>
            
            <div className="w-full mt-auto">
              {ach.isUnlocked ? (
                <div className="text-xs font-medium text-primary-400 bg-primary-500/10 py-1.5 rounded-lg w-full">
                  Unlocked on {new Date(ach.date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-medium text-dark-500">
                    <span>Progress</span>
                    <span>{ach.progress} / {ach.total}</span>
                  </div>
                  <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-dark-600 rounded-full" style={{ width: `${(ach.progress! / ach.total!) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
