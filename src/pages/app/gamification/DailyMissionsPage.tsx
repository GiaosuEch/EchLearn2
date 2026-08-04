import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, CheckCircle, Clock } from 'lucide-react';
import PageShell from '../../PageShell';
import { CustomEmoji, type CustomEmojiName } from '../../../components/common/CustomEmoji';
import { generateDailyMissions, type MissionTemplate } from '../../../curriculum/missionBank';
import { useAuthStore } from '../../../stores/authStore';
import { useLearningStore } from '../../../stores/learningStore';
import {
  applyProgressToMissions,
  claimMissionReward,
  readMissionState,
  subscribeToMissionProgress,
  syncMissionStateFromRemote,
  todayKey,
  type DailyMissionState,
  type MissionWithProgress,
} from '../../../services/missionProgressService';

/** One flat glyph per mission type — no OS emoji font in the mission list. */
const MISSION_GLYPH: Record<string, CustomEmojiName> = {
  xp: 'xp-bolt',
  lessons: 'skill-book',
  perfect_lessons: 'verified-check',
  speaking: 'skill-mic',
  listening: 'skill-headphones',
  reading: 'skill-book',
  writing: 'skill-pencil',
  vocabulary: 'sparkles-badge',
  grammar: 'brain-grammar',
  streak: 'streak-fire',
  leaderboard: 'league-crown',
};

interface DisplayMission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  type: string;
  claimed: boolean;
}

export default function DailyMissionsPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const user = useAuthStore(s => s.user);
  const addXP = useLearningStore(s => s.addXP);
  const stats = useLearningStore(s => s.stats);

  const userId = user?.id ?? '';

  // Deterministic per user per day — the same learner sees the same three cards
  // all day, which is what makes stored progress meaningful.
  const templates = useMemo<MissionTemplate[]>(
    () => (userId ? generateDailyMissions(todayKey(), userId.length) : []),
    [userId],
  );

  // Progress comes from the counters that lesson/quiz/XP completions write, not
  // from a hard-coded 0 — a learner who finished ten lessons used to still see 0/10.
  const [missionState, setMissionState] = useState<DailyMissionState>(() => readMissionState(userId));

  useEffect(() => {
    if (!userId) return;

    setMissionState(readMissionState(userId));
    void syncMissionStateFromRemote(userId);

    return subscribeToMissionProgress((state, eventUserId) => {
      if (eventUserId === userId) setMissionState(state);
    });
  }, [userId]);

  const missions = useMemo<MissionWithProgress[]>(
    () => applyProgressToMissions(templates, missionState),
    [templates, missionState],
  );

  const handleClaim = (id: string, reward: number) => {
    if (!userId) return;
    // Persist the claim before awarding, so a reload cannot pay the reward twice.
    const next = claimMissionReward(userId, id);
    if (next.claimed.includes(id) && !missionState.claimed.includes(id)) {
      addXP(reward, 'mission_claim');
    }
    setMissionState(next);
  };

  const weeklyMissions = useMemo<DisplayMission[]>(() => [
    {
      id: 'w1',
      title: 'Perfect Week',
      description: 'Complete 7 days streak',
      target: 7,
      progress: Math.min(7, stats?.currentStreak ?? 0),
      reward: 500,
      type: 'streak',
      claimed: missionState.claimed.includes('w1'),
    },
    {
      id: 'w2',
      title: 'Top of the Class',
      description: 'Reach top 3 in leaderboard',
      target: 1,
      progress: (stats?.rank ?? 0) > 0 && (stats?.rank ?? 99) <= 3 ? 1 : 0,
      reward: 1000,
      type: 'leaderboard',
      claimed: missionState.claimed.includes('w2'),
    },
  ], [stats?.currentStreak, stats?.rank, missionState.claimed]);

  const displayMissions: DisplayMission[] = activeTab === 'daily'
    ? missions.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        target: m.target,
        progress: m.progress,
        reward: m.reward,
        type: m.type,
        claimed: m.claimed,
      }))
    : weeklyMissions;

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
        <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center shadow-xl border-2 border-accent-500/50 relative overflow-hidden">
          <CustomEmoji name="gift-chest" size={40} label="Rương thưởng vàng" />
          <div className="absolute inset-0 bg-accent-500/20 animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayMissions.map((m, i) => {
            const isCompleted = m.progress >= m.target;
            const isClaimed = m.claimed;

            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${isCompleted && !isClaimed ? 'border-primary-500/50 bg-primary-900/10' : ''} ${isClaimed ? 'opacity-60' : ''}`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${isCompleted ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400'}`}>
                  <CustomEmoji name={MISSION_GLYPH[m.type] ?? 'skill-target'} size={28} />
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
