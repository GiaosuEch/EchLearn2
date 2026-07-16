import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  BookOpen, Headphones, Mic, PenTool, Zap, Target, Users, Trophy,
  ArrowRight, GraduationCap, Brain, TrendingUp, Calendar
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLearningStore } from '../../stores/learningStore';
import { useAppStore } from '../../stores/appStore';
import { dailyMissions } from '../../data/achievements';
import { getCourseForLanguage } from '../../curriculum/courseRegistry';
import { useTranslation } from 'react-i18next';

import Mascot from '../../components/mascot/Mascot';
import { getMascotGreeting } from '../../services/mascotMessages';
import { isSupabaseConfigured } from '../../lib/supabase';
import { MascotCoachCard } from '../../components/mascot/MascotCoachCard';
import { adaptiveLearningEngine, type TodayPlan, getMasteryLabel } from '../../services/adaptiveLearningEngine';

function ProgressRing({ progress, size = 64, stroke = 5, color = '#10B981' }: { progress: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(148,163,184,0.1)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
    </svg>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const currentLanguage = useAppStore((s) => s.currentLanguage);
  const nativeLanguage = useAppStore((s) => s.nativeLanguage);
  const interfaceLanguage = useAppStore((s) => s.interfaceLanguage);
  const { stats, dailyXPGoal, todayXP } = useLearningStore();
  const greeting = getMascotGreeting(user?.displayName?.split(' ')[0] || 'Learner', stats.currentStreak);
  const xpProgress = Math.min((todayXP / dailyXPGoal) * 100, 100);
  const [nextCourse, setNextCourse] = useState<any>(null);
  const hasSupabase = isSupabaseConfigured();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [chestClaimed, setChestClaimed] = useState(false);
  const [missions, setMissions] = useState(dailyMissions);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    import('../../services/progressService').then(({ progressService }) => {
      progressService.hasClaimedDailyChest(user.id).then(claimed => {
        setChestClaimed(claimed);
      });
    });

    // Fetch Next Course Progress
    import('../../services/lessonAttemptService').then(({ lessonAttemptService }) => {
      const languageModules = getCourseForLanguage(currentLanguage) || [];
      const languageCourses = languageModules.map((m, i) => ({
        ...m,
        totalLessons: m.lessons.length,
        isLocked: i > 0
      }));
      
      const checkProgress = async () => {
        for (const course of languageCourses) {
          const completed = await lessonAttemptService.getCourseProgress(user.id, course.id);
          if (completed < course.totalLessons) {
            setNextCourse({ ...course, completedLessons: completed });
            return;
          }
        }
        if (languageCourses.length > 0) {
          const last = languageCourses[languageCourses.length - 1];
          const completed = await lessonAttemptService.getCourseProgress(user.id, last.id);
          setNextCourse({ ...last, completedLessons: completed });
        }
      };
      checkProgress();
    });
    
    // Adaptive learning plan
    setPlanLoading(true);
    adaptiveLearningEngine.getTodayPlan(user.id, currentLanguage, nativeLanguage)
      .then(setTodayPlan)
      .catch((error) => console.warn('Could not load adaptive plan', error))
      .finally(() => setPlanLoading(false));

    // Fetch Leaderboard
    import('../../services/profileService').then(({ profileService }) => {
      profileService.getLeaderboard(5).then(data => {
        setLeaderboard(data.map(u => ({
          ...u,
          displayName: u.name,
          isCurrentUser: u.id === user?.id,
          rank: 0
        })).map((u, i) => ({ ...u, rank: i + 1 })));
      });
    });

    // Fetch User Groups
    import('../../services/communitySupabaseService').then(({ communitySupabaseService }) => {
      communitySupabaseService.getStudyGroups().then(groups => {
        const myGroups = groups.filter(g => g.members.some((m: any) => m.id === user.id));
        setUserGroups(myGroups);
      });
    });
  }, [user, currentLanguage, nativeLanguage]);

  return (
    <div className="space-y-6">
      {/* Supabase Setup Alert */}
      {!hasSupabase && (
        <MascotCoachCard
          type="error"
          title="Supabase Not Connected"
          message="Bạn chưa kết nối Supabase! Tính năng lưu dữ liệu thật, IELTS placement và Community feed đang chạy bằng dữ liệu mẫu. Hãy thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env nhé."
          actionLabel="View Setup Guide"
          onAction={() => window.open('https://supabase.com/docs', '_blank')}
        />
      )}

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Mascot expression="encouraging" size={64} />
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl font-bold text-white leading-tight"
          >
            {greeting}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-dark-400 mt-1">
            {t('dashboard.keep_streak') !== 'dashboard.keep_streak' ? t('dashboard.keep_streak') : "Let's keep your streak alive and learn something new today."}
          </motion.p>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'XP Today', value: `${todayXP}/${dailyXPGoal}`, icon: <Zap className="text-yellow-400" size={20} />, progress: xpProgress, color: '#FBBF24' },
          { label: 'Streak', value: `${stats.currentStreak} days`, icon: <span className="text-xl animate-fire">🔥</span>, progress: (stats.currentStreak / 30) * 100, color: '#EF4444' },
          { label: 'Level', value: `Level ${user?.level}`, icon: <TrendingUp className="text-primary-400" size={20} />, progress: 75, color: '#10B981' },
          { label: 'IELTS Est.', value: stats.ieltsEstimatedBand !== undefined && stats.ieltsEstimatedBand !== null ? `Band ${stats.ieltsEstimatedBand}` : 'Not tested yet', icon: <GraduationCap className="text-purple-400" size={20} />, progress: stats.ieltsEstimatedBand ? (stats.ieltsEstimatedBand / 9) * 100 : 0, color: '#A78BFA' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className="relative">
              <ProgressRing progress={stat.progress} size={48} stroke={4} color={stat.color} />
              <div className="absolute inset-0 flex items-center justify-center">{stat.icon}</div>
            </div>
            <div>
              <p className="text-xs text-dark-400">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Adaptive Daily Plan */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-dark-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 text-primary-300 flex items-center justify-center"><Brain size={24} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-300 font-bold">{interfaceLanguage === 'vi' ? 'Lộ trình thích ứng' : 'Adaptive learning path'}</p>
              <h2 className="text-xl font-bold text-white mt-1">{todayPlan?.title || (interfaceLanguage === 'vi' ? 'Kế hoạch học hôm nay' : 'Today\'s learning plan')}</h2>
              <p className="text-sm text-dark-300 mt-1">{planLoading ? (interfaceLanguage === 'vi' ? 'Đang phân tích tiến trình...' : 'Analyzing your progress...') : todayPlan?.reason || (interfaceLanguage === 'vi' ? 'Làm AI kiểm tra đầu vào để app đề xuất bài học chính xác hơn.' : 'Complete placement so the app can recommend the right next step.')}</p>
            </div>
          </div>
          <Link to={todayPlan?.recommendedLesson?.path || '/app/ai-onboarding'} className="px-5 py-3 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
            {todayPlan ? todayPlan.recommendedLesson.title : (interfaceLanguage === 'vi' ? 'Bắt đầu kiểm tra' : 'Start placement')} <ArrowRight size={16} />
          </Link>
        </div>
        {todayPlan && (
          <div className="grid md:grid-cols-3 gap-3 mt-5">
            <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700">
              <p className="text-xs text-dark-400">{interfaceLanguage === 'vi' ? 'Cần ôn hôm nay' : 'Due reviews'}</p>
              <p className="text-2xl font-bold text-white mt-1">{todayPlan.reviewQueue.length}</p>
              <p className="text-xs text-dark-500 mt-1">{interfaceLanguage === 'vi' ? 'theo spaced repetition' : 'from spaced repetition'}</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700">
              <p className="text-xs text-dark-400">{interfaceLanguage === 'vi' ? 'Kỹ năng yếu' : 'Weak skills'}</p>
              <div className="flex flex-wrap gap-2 mt-2">{todayPlan.weakSkills.slice(0, 3).map((skill) => <span key={skill} className="px-2 py-1 rounded-lg bg-error/10 text-error text-xs">{skill === 'listening' ? 'Nghe' : skill === 'speaking' ? 'Nói' : skill === 'reading' ? 'Đọc' : skill === 'writing' ? 'Viết' : skill === 'vocabulary' ? 'Từ vựng' : skill}</span>)}</div>
            </div>
            <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-700">
              <p className="text-xs text-dark-400">{interfaceLanguage === 'vi' ? 'Thời gian ước tính' : 'Estimated time'}</p>
              <p className="text-2xl font-bold text-white mt-1">{todayPlan.estimatedTime}m</p>
              <p className="text-xs text-dark-500 mt-1">{interfaceLanguage === 'vi' ? 'học tập trung' : 'focused learning'}</p>
            </div>
          </div>
        )}
        {todayPlan?.reviewQueue?.length ? (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {todayPlan.reviewQueue.slice(0, 4).map((item) => (
              <div key={item.itemId} className="p-3 rounded-xl bg-dark-800/60 border border-dark-700">
                <p className="text-xs text-dark-400 truncate">{item.itemId}</p>
                <p className="text-sm font-semibold text-white">{getMasteryLabel(item.masteryScore)}</p>
                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden mt-2"><div className="h-full bg-primary-500" style={{ width: item.masteryScore + '%' }} /></div>
              </div>
            ))}
          </div>
        ) : null}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          {nextCourse && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><BookOpen size={20} /> Continue Learning</h2>
                <Link to="/app/roadmap" className="text-xs text-primary-400 hover:underline">View all</Link>
              </div>
              <div className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <BookOpen size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{nextCourse.title}</p>
                  <p className="text-sm text-dark-400">{nextCourse.description}</p>
                  <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(nextCourse.completedLessons / nextCourse.totalLessons) * 100}%` }} />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{nextCourse.completedLessons}/{nextCourse.totalLessons} lessons</p>
                </div>
                <Link to="/app/lesson" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1">
                  Continue <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Skill Progress */}
          <div className="glass-card p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Target size={20} /> Skill Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { skill: 'Listening', score: stats.listeningScore, icon: <Headphones size={20} />, color: '#38BDF8' },
                { skill: 'Speaking', score: stats.speakingScore, icon: <Mic size={20} />, color: '#22C55E' },
                { skill: 'Reading', score: stats.readingScore, icon: <BookOpen size={20} />, color: '#A78BFA' },
                { skill: 'Writing', score: stats.writingScore, icon: <PenTool size={20} />, color: '#F59E0B' },
              ].map((s) => (
                <div key={s.skill} className="text-center">
                  <div className="relative inline-block">
                    <ProgressRing progress={s.score} size={80} stroke={6} color={s.color} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span style={{ color: s.color }}>{s.icon}</span>
                      <span className="text-xs font-bold text-white mt-0.5">{s.score}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-dark-300 mt-2">{s.skill}</p>
                </div>
              ))}
            </div>
            
            {/* Reward Chest & Gamification Dopamine */}
            <div className={`mt-6 glass-card p-6 border-2 relative overflow-hidden group ${chestClaimed ? 'border-dark-700/50 bg-dark-800' : 'border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-dark-900'}`}>
              {!chestClaimed && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 blur-[50px] rounded-full group-hover:bg-yellow-500/30 transition-all duration-700"></div>}
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="w-20 h-20 shrink-0 relative">
                  {!chestClaimed ? (
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <div className="text-6xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🎁</div>
                    </motion.div>
                  ) : (
                    <div className="text-6xl grayscale opacity-50">📦</div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
                    Daily Reward Chest 
                    {!chestClaimed ? (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] uppercase rounded-md">Available</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-dark-700 text-dark-400 text-[10px] uppercase rounded-md">Claimed</span>
                    )}
                  </h3>
                  <p className="text-sm text-dark-300">
                    {!chestClaimed ? "Complete 3 daily missions to unlock bonus XP and exclusive Buri accessories!" : "You've claimed today's chest. Come back tomorrow!"}
                  </p>
                </div>
                {!chestClaimed && (
                  <button 
                    onClick={async () => {
                      if (user) {
                        const { useLearningStore } = await import('../../stores/learningStore');
                        const { soundService } = await import('../../services/soundService');
                        await useLearningStore.getState().addXP(100, 'Daily Reward Chest');
                        (useLearningStore.getState() as any).addCoins(50);
                        soundService.playChestOpen();
                        setChestClaimed(true);
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-1">
                    Open Chest
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Daily Missions */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Calendar size={20} /> Daily Missions</h2>
              <Link to="/app/missions" className="text-xs text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {missions.slice(0, 3).map((mission) => (
                <div key={mission.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  mission.isCompleted ? 'bg-success/10 border-success/20' : 
                  mission.progress >= mission.maxProgress ? 'bg-primary-500/10 border-primary-500/30' : 
                  'bg-dark-800/30 border-transparent'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mission.isCompleted ? 'bg-success/20 text-success' : 
                    mission.progress >= mission.maxProgress ? 'bg-primary-500 text-white animate-pulse' :
                    'bg-dark-700 text-dark-400'}`}>
                    {mission.isCompleted ? '✅' : mission.progress >= mission.maxProgress ? '🎁' : <Target size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      {mission.title}
                      {mission.rarity === 'epic' && <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] uppercase rounded font-bold">Epic</span>}
                      {mission.rarity === 'rare' && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] uppercase rounded font-bold">Rare</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(mission.progress / mission.maxProgress) * 100}%` }} />
                      </div>
                      <span className="text-xs text-dark-500">{mission.progress}/{mission.maxProgress}</span>
                    </div>
                  </div>
                  
                  {mission.progress >= mission.maxProgress && !mission.isCompleted ? (
                    <button 
                      onClick={async () => {
                        const { useLearningStore } = await import('../../stores/learningStore');
                        const { soundService } = await import('../../services/soundService');
                        useLearningStore.getState().addXP(mission.xpReward, 'Mission Claimed');
                        if (mission.coinsReward) {
                          (useLearningStore.getState() as any).addCoins(mission.coinsReward);
                        }
                        soundService.playLevelUp(); // Sound effect
                        setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, isCompleted: true } : m));
                      }}
                      className="px-3 py-1.5 bg-primary-500 hover:bg-primary-400 text-white text-xs font-bold rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all">
                      Claim
                    </button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-accent-400 font-semibold">+{mission.xpReward} XP</span>
                      {mission.coinsReward && <span className="text-[10px] text-yellow-400 font-semibold">+{mission.coinsReward} Coins</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard Preview */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Trophy size={20} /> Leaderboard</h2>
              <Link to="/app/leaderboard" className="text-xs text-primary-400 hover:underline">Full board</Link>
            </div>
            <div className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 3).map((e) => (
                  <div key={e.rank} className={`flex items-center gap-3 p-2 rounded-lg ${e.isCurrentUser ? 'bg-primary-500/10 border border-primary-500/20' : ''}`}>
                    <span className={`w-6 text-center text-sm font-bold ${e.rank <= 3 ? 'text-accent-400' : 'text-dark-500'}`}>#{e.rank}</span>
                    <div className="w-7 h-7 rounded-full bg-dark-700 flex items-center justify-center text-xs">{e.displayName.charAt(0)}</div>
                    <span className={`flex-1 text-sm ${e.isCurrentUser ? 'text-primary-400 font-semibold' : 'text-dark-300'}`}>{e.displayName}</span>
                    <span className="text-xs text-dark-400">{e.xp.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-dark-400">Complete lessons to appear on the leaderboard.</p>
                </div>
              )}
            </div>
          </div>

          {/* Study Groups */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Users size={20} /> Your Groups</h2>
              <Link to="/app/groups" className="text-xs text-primary-400 hover:underline">All groups</Link>
            </div>
            <div className="space-y-3">
              {userGroups.length > 0 ? (
                userGroups.slice(0, 2).map((group) => (
                  <Link key={group.id} to={`/app/groups/${group.id}`} className="block p-3 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors">
                    <p className="text-sm font-semibold text-white">{group.name}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{group.members.length} members · {group.language}</p>
                  </Link>
                ))
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-dark-400">Join a study group to practice together.</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Challenges */}
          <div className="glass-card p-5 bg-gradient-to-br from-accent-900/30 to-dark-900 border-accent-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 shrink-0">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Social Challenge</h3>
                <p className="text-xs text-dark-400 mt-1 mb-3">No active challenges today. Invite a friend to start a sprint!</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 text-xs rounded-lg transition-colors">Invite Friends</button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tutor */}
          <Link to="/app/ai-speaking" className="block glass-card p-5 hover:border-primary-500/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">AI Speaking Coach</p>
                <p className="text-xs text-dark-400">Practice pronunciation now →</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
