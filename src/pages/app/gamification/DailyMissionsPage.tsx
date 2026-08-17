import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, CheckCircle, Clock, Info } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../../PageShell';
import { CustomEmoji, type CustomEmojiName } from '../../../components/common/CustomEmoji';
import { generateDailyMissions, type MissionTemplate } from '../../../curriculum/missionBank';
import { useAuthStore } from '../../../stores/authStore';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
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

function timeUntilNextDay(now: Date): string {
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 0, 0);
  const remainingMinutes = Math.max(0, Math.ceil((nextDay.getTime() - now.getTime()) / 60_000));
  return `${Math.floor(remainingMinutes / 60)} giờ ${remainingMinutes % 60} phút`;
}

function actionForMission(type: DisplayMission['type'], language: string): { to: string; label: string } {
  const byType: Partial<Record<DisplayMission['type'], { to: string; label: string }>> = {
    listening: { to: '/app/listening', label: 'Luyện nghe' },
    speaking: { to: '/app/speaking', label: 'Luyện nói' },
    reading: { to: '/app/reading', label: 'Luyện đọc' },
    writing: { to: '/app/writing', label: 'Luyện viết' },
    vocabulary: { to: '/app/vocabulary', label: 'Ôn từ vựng' },
    grammar: { to: '/app/grammar', label: 'Luyện ngữ pháp' },
  };
  return byType[type] ?? { to: `/app/lesson?lang=${encodeURIComponent(language)}`, label: 'Vào bài học' };
}

export default function DailyMissionsPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const user = useAuthStore(s => s.user);
  const addXP = useLearningStore(s => s.addXP);
  const stats = useLearningStore(s => s.stats);
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const [now, setNow] = useState(() => new Date());

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

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

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

  if (!userId) {
    return (
      <PageShell title="Nhiệm vụ hôm nay" description="Nhiệm vụ cần một hồ sơ để lưu tiến độ thật." icon={<Target size={20} />}>
        <div role="status" className="mx-auto max-w-2xl rounded-2xl border border-blue-500/30 bg-blue-500/10 p-7 text-center">
          <Info className="mx-auto text-blue-300" size={34} />
          <h1 className="mt-4 text-xl font-black text-white">Chưa có hồ sơ để tạo nhiệm vụ</h1>
          <p className="mt-2 text-sm leading-6 text-dark-200">Đăng nhập hoặc tạo tài khoản để nhiệm vụ, tiến độ và phần thưởng được gắn với đúng người học. App không tạo số liệu tạm rồi giả vờ đã lưu.</p>
          <Link to="/login?redirectTo=%2Fapp%2Fmissions" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-500 px-5 py-3 font-bold text-white">Đăng nhập để tiếp tục</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Nhiệm vụ hôm nay" description="Hoàn thành các bước nhỏ để giữ nhịp học và nhận XP." icon={<Target size={20} />}>
      <div className="flex gap-3 mb-6" role="tablist" aria-label="Nhiệm vụ">
        <button 
          onClick={() => setActiveTab('daily')}
          aria-selected={activeTab === 'daily'}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === 'daily' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
        >
          Hôm nay
        </button>
        <button 
          onClick={() => setActiveTab('weekly')}
          aria-selected={activeTab === 'weekly'}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === 'weekly' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
        >
          Theo tuần
        </button>
      </div>

      <div className="mb-6 flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:flex-row">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950 dark:text-white">
            <Clock className="text-slate-500 dark:text-slate-400" />
            {activeTab === 'daily' ? `Làm mới sau ${timeUntilNextDay(now)}` : 'Thử thách tuần'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Hoàn thành các nhiệm vụ để nhận <span className="font-bold text-amber-600">XP thưởng</span> và giữ nhịp học đều.
          </p>
        </div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
          <CustomEmoji name="gift-chest" size={40} label="Rương thưởng" />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayMissions.map((m, i) => {
            const isCompleted = m.progress >= m.target;
            const isClaimed = m.claimed;
            const nextAction = activeTab === 'weekly'
              ? m.type === 'streak'
                ? { to: '/app/calendar', label: 'Xem chuỗi' }
                : { to: '/app/leaderboard', label: 'Xem BXH' }
              : actionForMission(m.type, currentLanguage);

            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                className={`flex flex-col items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center ${isCompleted && !isClaimed ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''} ${isClaimed ? 'opacity-50 grayscale-[50%]' : ''}`}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors ${isCompleted ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <CustomEmoji name={MISSION_GLYPH[m.type] ?? 'skill-target'} size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{m.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{m.description}</p>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                      <span className="text-slate-400">Tiến độ</span>
                      <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>{m.progress} / {m.target}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (m.progress / m.target) * 100)}%` }}
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex w-full flex-row items-center justify-between gap-3 sm:mt-0 sm:w-auto sm:flex-col sm:border-l sm:border-slate-100 sm:pl-5 dark:sm:border-slate-800">
                  <div className="text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Thưởng</span>
                    <span className="flex items-center justify-center gap-1 text-base font-bold text-slate-800 dark:text-slate-200">
                      <Zap size={14} className="fill-amber-400 text-amber-500" /> {m.reward}
                    </span>
                  </div>
                  
                  {isClaimed ? (
                    <button disabled className="flex w-full items-center justify-center gap-1 rounded-lg bg-transparent py-2 text-sm font-semibold text-slate-400 sm:w-28">
                      <CheckCircle size={14} /> Đã nhận
                    </button>
                  ) : isCompleted ? (
                    <button onClick={() => handleClaim(m.id, m.reward)} className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 active:scale-95 sm:w-28">
                      Nhận XP
                    </button>
                  ) : (
                    <Link to={nextAction.to} className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-28">
                      {nextAction.label}
                    </Link>
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
