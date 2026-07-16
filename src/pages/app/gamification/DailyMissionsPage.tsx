import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, CheckCircle, Clock } from 'lucide-react';
import PageShell from '../../PageShell';
import { generateDailyMissions } from '../../../curriculum/missionBank';
import { useAuthStore } from '../../../stores/authStore';
import { useLearningStore } from '../../../stores/learningStore';

export default function DailyMissionsPage() {
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [missions, setMissions] = useState<any[]>([]);
  const user = useAuthStore(s => s.user);
  const addXP = useLearningStore(s => s.addXP);

  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      // Generate missions deterministically for the user based on their ID length as a seed
      const generated = generateDailyMissions(today, user.id.length);
      // Start users at 0 progress initially
      setMissions(generated.map(m => ({
        ...m,
        progress: 0
      })));
    }
  }, [user]);

  const handleClaim = (id: string, reward: number) => {
    setClaimedMissions(prev => [...prev, id]);
    addXP(reward, 'mission_claim');
  };

  const weeklyMissions = [
    { id: 'w1', title: 'Perfect Week', description: 'Complete 7 days streak', target: 7, progress: 0, reward: 500, type: 'streak' },
    { id: 'w2', title: 'Top of the Class', description: 'Reach top 3 in leaderboard', target: 1, progress: 0, reward: 1000, type: 'leaderboard' },
  ];

  const displayMissions = activeTab === 'daily' ? missions : weeklyMissions;

  return (
    <PageShell title="Missions & Rewards" description="Complete challenges to earn XP and gems." icon={<Target size={20} />}>
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === 'daily' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'}`}
        >
          Daily Missions
        </button>
        <button 
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === 'weekly' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'}`}
        >
          Weekly Challenges
        </button>
      </div>

      <div className="glass-card p-6 mb-6 bg-gradient-to-br from-primary-900/20 to-dark-900 border-primary-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="text-primary-400" />
            {activeTab === 'daily' ? 'Resets in 14h 22m' : 'Resets in 4d 12h'}
          </h2>
          <p className="text-sm text-dark-300 mt-1">
            Complete all {activeTab} missions to unlock the <span className="text-accent-400 font-bold">Gold Chest</span>!
          </p>
        </div>
        <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 border-accent-500/50 relative overflow-hidden">
          🎁
          <div className="absolute inset-0 bg-accent-500/20 animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayMissions.map((m, i) => {
            const isCompleted = m.progress >= m.target;
            const isClaimed = claimedMissions.includes(m.id);
            
            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${isCompleted && !isClaimed ? 'border-primary-500/50 bg-primary-900/10' : ''} ${isClaimed ? 'opacity-60' : ''}`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${isCompleted ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400'}`}>
                  {m.type === 'lessons' ? '📚' : m.type === 'speaking' ? '🎙️' : m.type === 'streak' ? '🔥' : '🎯'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{m.title}</h3>
                  <p className="text-sm text-dark-300">{m.description}</p>
                  
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-dark-400">Progress</span>
                      <span className={isCompleted ? 'text-primary-400' : 'text-white'}>{m.progress} / {m.target}</span>
                    </div>
                    <div className="h-2.5 bg-dark-800 rounded-full overflow-hidden border border-dark-700">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-primary-500' : 'bg-dark-500'}`} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center justify-between gap-3 mt-4 sm:mt-0 sm:pl-4 sm:border-l border-dark-700/50">
                  <div className="text-center">
                    <span className="text-xs text-dark-400 font-medium block">Reward</span>
                    <span className="text-lg font-bold text-accent-400 flex items-center justify-center gap-1">
                      <Zap size={16} className="fill-accent-400" /> {m.reward}
                    </span>
                  </div>
                  
                  {isClaimed ? (
                    <button disabled className="w-full sm:w-28 py-2 bg-dark-800 text-dark-400 font-bold rounded-xl flex items-center justify-center gap-1">
                      <CheckCircle size={16} /> Claimed
                    </button>
                  ) : isCompleted ? (
                    <button onClick={() => handleClaim(m.id, m.reward)} className="w-full sm:w-28 py-2 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 animate-pulse">
                      Claim
                    </button>
                  ) : (
                    <button disabled className="w-full sm:w-28 py-2 bg-dark-800/50 text-dark-500 font-bold rounded-xl cursor-not-allowed">
                      Incomplete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
