import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BarChart3, BookOpen, Flame, MessageCircle, Play } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { learningCoordinator } from '../../services/learningCoordinator';
import { type TodayPlan } from '../../types/learningTypes';
import { createDashboardMetrics } from '../../viewmodels/dashboardMetrics';
import EchBuriAnimated from '../../components/mascot/EchBuriAnimated';
import { generateDailyMissions, type MissionTemplate } from '../../curriculum/missionBank';
import {
  applyProgressToMissions,
  readMissionState,
  subscribeToMissionProgress,
  syncMissionStateFromRemote,
  todayKey,
  type DailyMissionState,
} from '../../services/missionProgressService';
import { createDailyFocus } from '../../services/dailyFocusService';
import { getAllRealworldLessonsForLanguage } from '../../curriculum/realworldSurvivalData';
import { progressService } from '../../services/progressService';


import { motion } from 'motion/react';

export default function DashboardPage() {
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  
  const user = useAuthStore((state) => state.user);
  const nativeLanguage = useAppStore((state) => state.nativeLanguage);
  const dailyXPGoal = useAppStore((state) => state.dailyXpGoal);
  const ieltsTargetBand = useAppStore((state) => state.ieltsTargetBand);
  const stats = useLearningStore((state) => state.stats);
  const todayXP = useLearningStore((state) => state.todayXP);
  const metrics = createDashboardMetrics(stats, todayXP, dailyXPGoal, ieltsTargetBand);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [completedSurvivalLessonIds, setCompletedSurvivalLessonIds] = useState<string[]>([]);

  const userId = user?.id;
  const templates = useMemo<MissionTemplate[]>(
    () => (userId ? generateDailyMissions(todayKey(), userId.length) : []),
    [userId],
  );
  const [missionState, setMissionState] = useState<DailyMissionState>(() => readMissionState(userId ?? ''));

  useEffect(() => {
    if (!userId) {
      setTodayPlan(null);
      setCompletedSurvivalLessonIds([]);
      return;
    }

    // Top 0.1% Architecture: Parallel Execution & Auto-batching
    // We fire all network/disk requests simultaneously and let React 19 batch the state updates.
    const isEn = currentLanguage === 'en' || currentLanguage === 'en-US';
    
    // 1. Sync Mission State
    setMissionState(readMissionState(userId));
    void syncMissionStateFromRemote(userId).then(setMissionState);
    const unsub = subscribeToMissionProgress((state, eventUserId) => {
      if (eventUserId === userId) setMissionState(state);
    });

    // 2. Fetch Plan & Survival Progress concurrently
    Promise.allSettled([
      learningCoordinator.getTodayPlan(userId, currentLanguage, nativeLanguage),
      isEn ? progressService.getCompletedLessons(userId) : Promise.resolve([])
    ]).then(([planResult, survivalResult]) => {
      if (planResult.status === 'fulfilled') setTodayPlan(planResult.value);
      if (survivalResult.status === 'fulfilled') setCompletedSurvivalLessonIds(survivalResult.value);
    });

    return unsub;
  }, [userId, currentLanguage, nativeLanguage]);

  const lessonPath = todayPlan?.recommendedLesson?.path || `/app/lesson?id=${currentLanguage}_mod_1&lesId=${currentLanguage}_les_1`;
  const missions = useMemo(() => applyProgressToMissions(templates, missionState), [missionState, templates]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'bạn';
  const dailyFocus = createDailyFocus({
    missions,
    currentLanguage,
    recommendedLessonPath: lessonPath,
    streak: metrics.streak,
  });
  const allSurvivalLessons = getAllRealworldLessonsForLanguage(currentLanguage);
  const nextSurvivalLesson = allSurvivalLessons.find((lesson) => !completedSurvivalLessonIds.includes(lesson.id));
  const showEnglishSurvival = currentLanguage === 'en' || currentLanguage === 'en-US';
  const survivalLessonPath = nextSurvivalLesson ? `/app/survival?lesson=${nextSurvivalLesson.id}` : '/app/roadmap';
  const primaryActionPath = showEnglishSurvival ? survivalLessonPath : dailyFocus.actionPath;
  const primaryActionLabel = showEnglishSurvival
    ? (nextSurvivalLesson ? `Bắt đầu Realworld Mastery · Bài ${nextSurvivalLesson.order}/30` : 'Khám phá lộ trình học')
    : dailyFocus.actionLabel;



  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      {!isSupabaseConfigured() && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
          <Flame size={18} />
          Tiến trình hiện được lưu an toàn trên thiết bị này.
        </motion.div>
      )}

      <motion.div 
        initial="hidden" 
        animate="show" 
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Hero Section (Spans 2 columns) */}
        <motion.section variants={itemVariants} className="md:col-span-2 relative overflow-hidden rounded-2xl bg-slate-900 p-8 flex flex-col justify-between min-h-[320px]">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-30 pointer-events-none mix-blend-screen blur-[2px]">
            <EchBuriAnimated size={300} state={dailyFocus.mascotState} />
          </div>
          <div className="relative z-10 flex flex-col items-start h-full">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-full border border-emerald-500/20 mb-4">
              Kế hoạch học hôm nay
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              {dailyFocus.status === 'complete' ? dailyFocus.title : `Chào ${displayName}, ${dailyFocus.title.toLocaleLowerCase()}`}
            </h1>
            <p className="mt-4 text-slate-400 max-w-md text-lg leading-relaxed">
              {dailyFocus.detail}
            </p>
            
            <div className="mt-auto pt-8 flex flex-wrap gap-4 w-full">
              <Link to={primaryActionPath} className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors active:scale-[0.98]">
                <Play size={20} className="fill-current" /> {primaryActionLabel}
              </Link>
              {showEnglishSurvival && nextSurvivalLesson && (
                <Link to="/app/roadmap" className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors active:scale-[0.98]">
                  <BookOpen size={20} /> Xem lộ trình học
                </Link>
              )}
            </div>
          </div>
        </motion.section>

        {/* Stats Section (Vertical Stack) */}
        <motion.section variants={itemVariants} className="flex flex-col gap-6">
          <div className="flex-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-2">
              <Flame size={24} className="text-emerald-600" />
              <span className="font-bold uppercase tracking-wider text-xs">Chuỗi học</span>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{metrics.streak} <span className="text-xl text-slate-500 font-medium tracking-normal">ngày</span></p>
          </div>
          
          <div className="flex-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-2">
              <BarChart3 size={24} className="text-amber-500" />
              <span className="font-bold uppercase tracking-wider text-xs">Mục tiêu XP</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{metrics.todayXP}</p>
              <p className="text-xl text-slate-500 font-medium tracking-normal">/ {metrics.dailyXPGoal}</p>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics.dailyProgress, 100)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-amber-500" 
              />
            </div>
          </div>
        </motion.section>

        {/* Recommendations */}
        <motion.section variants={itemVariants} className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to={lessonPath} className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest rounded-full">Đề xuất</span>
                <EchBuriAnimated size={40} state="thinking" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {todayPlan?.recommendedLesson?.title || 'Xây nền phản xạ giao tiếp'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ôn lại phần cần nhớ, sau đó chinh phục kỹ năng mới.</p>
            </div>
            <div className="mt-6 flex items-center justify-between text-emerald-600 font-bold text-sm uppercase tracking-wider">
              <span>Bắt đầu bài học</span>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={18} /></motion.div>
            </div>
          </Link>

          <Link to="/app/practice" className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest rounded-full">Luyện tập sâu</span>
                <MessageCircle size={32} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Chọn đúng kỹ năng cần luyện
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Mỗi bài luyện đều yêu cầu hành động thật và phản hồi AI chi tiết.</p>
            </div>
            <div className="mt-6 flex items-center justify-between text-blue-600 font-bold text-sm uppercase tracking-wider">
              <span>Mở trung tâm luyện tập</span>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.75 }}><ArrowRight size={18} /></motion.div>
            </div>
          </Link>
        </motion.section>
      </motion.div>
    </main>
  );
}
