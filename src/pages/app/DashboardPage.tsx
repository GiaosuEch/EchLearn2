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
import { getMasteryLabel } from '../../services/fsrsCalculator';


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



  const [activeMascotState, setActiveMascotState] = useState<any>(dailyFocus.mascotState);
  const [speechBubble, setSpeechBubble] = useState<string>('Bấm vào tớ để xem các điệu nhảy & tương tác nhé! 🐸');

  const mascotQuotes = [
    { state: 'cheering', text: 'Quá đỉnh! Cố gắng luyện thêm 1 bài nữa nào! 🎉' },
    { state: 'welcome', text: 'Chào mừng bạn quay lại học cùng Ếch Buri! 🐸' },
    { state: 'streak', text: 'Streak đang bốc lửa! Quyết tâm không đứt chuỗi nha! 🔥' },
    { state: 'thinking', text: 'Đang suy ngẫm mẹo ghi nhớ từ vựng cho bạn nè... 💡' },
    { state: 'success', text: 'Tuyệt vời! Bạn học tập rất xuất sắc hôm nay! ⭐' },
    { state: 'listening', text: 'Tớ đang chú ý lắng nghe phát âm chuẩn của bạn nè! 🎧' }
  ];

  const handleMascotInteract = () => {
    const nextReaction = mascotQuotes[Math.floor(Math.random() * mascotQuotes.length)];
    setActiveMascotState(nextReaction.state);
    setSpeechBubble(nextReaction.text);
    setTimeout(() => {
      setActiveMascotState(dailyFocus.mascotState);
    }, 3000);
  };

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
        <motion.section variants={itemVariants} className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-emerald-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between min-h-[320px] shadow-sm">
          {/* Friendly Mascot Companion on the Right with Interactive Speech Bubble */}
          <div 
            onClick={handleMascotInteract}
            className="absolute top-4 right-4 sm:right-8 opacity-95 sm:opacity-100 pointer-events-auto transition-transform hover:scale-105 cursor-pointer flex flex-col items-center group"
            title="Bấm vào để tương tác cùng Ếch Buri!"
          >
            {/* Speech Bubble */}
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              key={speechBubble}
              className="mb-1 max-w-[160px] sm:max-w-[200px] text-center px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-[11px] font-bold shadow-lg border border-emerald-200 dark:border-slate-700 relative select-none"
            >
              {speechBubble}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-emerald-200 dark:border-slate-700 rotate-45" />
            </motion.div>

            <EchBuriAnimated size={170} state={activeMascotState} />
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              ✨ Bấm để đổi hành động
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-start h-full max-w-md sm:max-w-lg">
            <span className="px-3.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800/40 mb-4">
              Kế hoạch học hôm nay
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {dailyFocus.status === 'complete' ? dailyFocus.title : `Chào ${displayName}, ${dailyFocus.title.toLocaleLowerCase()}`}
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {dailyFocus.detail}
            </p>
            
            <div className="mt-auto pt-6 flex flex-wrap gap-3 w-full">
              <Link to={primaryActionPath} className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-900/10 transition-all active:scale-[0.98]">
                <Play size={18} className="fill-current" /> {primaryActionLabel}
              </Link>
              {showEnglishSurvival && nextSurvivalLesson && (
                <Link to="/app/roadmap" className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-[0.98]">
                  <BookOpen size={18} /> Xem lộ trình học
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

        {/* Adaptive Plan: weak skills + due reviews */}
        <motion.section variants={itemVariants} className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-full">Lộ trình thích ứng</span>
              <BarChart3 size={24} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kỹ năng cần ưu tiên</h2>
            {todayPlan && todayPlan.weakSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {todayPlan.weakSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có dữ liệu — hãy hoàn thành bài học đầu tiên.</p>
            )}
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-widest rounded-full">Ôn tập đến hạn</span>
              <Flame size={24} className="text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {todayPlan && todayPlan.reviewQueue.length > 0
                ? `${todayPlan.reviewQueue.length} mục cần ôn theo spaced repetition`
                : 'Hôm nay chưa có mục nào đến hạn'}
            </h2>
            {todayPlan && todayPlan.reviewQueue.length > 0 && (
              <ul className="space-y-2 mt-4">
                {todayPlan.reviewQueue.slice(0, 4).map((item) => (
                  <li key={item.itemId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.itemId}</span>
                    <span className={`shrink-0 font-bold ${item.masteryScore >= 75 ? 'text-emerald-600' : item.masteryScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {getMasteryLabel(item.masteryScore)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.section>
      </motion.div>
    </main>
  );
}
