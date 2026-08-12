import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BarChart3, BookOpen, Flame, MessageCircle, Play, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { adaptiveLearningEngine, type TodayPlan } from '../../services/adaptiveLearningEngine';
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
import { englishSurvival30 } from '../../curriculum/englishSurvival30';
import { progressService } from '../../services/progressService';


export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const currentLanguage = useAppStore((state) => state.currentLanguage);
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
    if (!userId) return;
    adaptiveLearningEngine.getTodayPlan(userId, currentLanguage, nativeLanguage).then(setTodayPlan).catch(() => setTodayPlan(null));
  }, [userId, currentLanguage, nativeLanguage]);

  useEffect(() => {
    if (!userId) return;

    setMissionState(readMissionState(userId));
    void syncMissionStateFromRemote(userId).then(setMissionState);
    return subscribeToMissionProgress((state, eventUserId) => {
      if (eventUserId === userId) setMissionState(state);
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || (currentLanguage !== 'en' && currentLanguage !== 'en-US')) {
      setCompletedSurvivalLessonIds([]);
      return;
    }
    progressService.getCompletedLessons(userId)
      .then((lessonIds) => setCompletedSurvivalLessonIds(lessonIds))
      .catch(() => setCompletedSurvivalLessonIds([]));
  }, [userId, currentLanguage]);

  const lessonPath = todayPlan?.recommendedLesson?.path || `/app/lesson?id=${currentLanguage}_mod_1&lesId=${currentLanguage}_les_1`;
  const missions = useMemo(() => applyProgressToMissions(templates, missionState), [missionState, templates]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'bạn';
  const dailyFocus = createDailyFocus({
    missions,
    currentLanguage,
    recommendedLessonPath: lessonPath,
    streak: metrics.streak,
  });
  const nextSurvivalLesson = englishSurvival30.find((lesson) => !completedSurvivalLessonIds.includes(lesson.id));
  const showEnglishSurvival = currentLanguage === 'en' || currentLanguage === 'en-US';
  const survivalLessonPath = nextSurvivalLesson ? `/app/english-survival?lesson=${nextSurvivalLesson.id}` : '/app/roadmap';
  const primaryActionPath = showEnglishSurvival ? survivalLessonPath : dailyFocus.actionPath;
  const primaryActionLabel = showEnglishSurvival
    ? (nextSurvivalLesson ? `Bắt đầu English Survival · Bài ${nextSurvivalLesson.order}/30` : 'Xem hành trình English Survival')
    : dailyFocus.actionLabel;

  return (
    <main className="community-dashboard space-y-5">
      {!isSupabaseConfigured() && <div className="community-local-note">Tiến trình hiện được lưu an toàn trên thiết bị này.</div>}

      <section className="community-dashboard-hero" aria-label="Việc học quan trọng hôm nay">
        <div className="relative z-10 max-w-2xl">
          <p className="community-kicker"><span /> Kế hoạch học hôm nay</p>
          <h1 className="mt-4 text-3xl font-black tracking-[-.055em] sm:text-5xl">{dailyFocus.status === 'complete' ? dailyFocus.title : `Chào ${displayName}, ${dailyFocus.title.toLocaleLowerCase()}`}</h1>
          <p className="mt-3 max-w-xl text-[var(--ech-ink-soft)]">{dailyFocus.detail}</p>
          <p className="mt-4 inline-flex rounded-full bg-white/70 px-3 py-1.5 text-sm font-extrabold text-[var(--ech-community-green)]" role="status" aria-live="polite">{dailyFocus.status === 'complete' ? 'Nhịp học hôm nay đã hoàn tất' : `Tiến độ: ${dailyFocus.progressLabel}`}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={primaryActionPath} className="community-button community-button--orange"><Play size={16} fill="currentColor" /> {primaryActionLabel}</Link>
            {showEnglishSurvival && <Link to={survivalLessonPath} className="community-button community-button--outline"><BookOpen size={16} /> {nextSurvivalLesson ? `English Survival · Bài ${nextSurvivalLesson.order}/30` : 'Xem hành trình English Survival'}</Link>}
          </div>
        </div>
        <div className="community-dashboard-buri"><div /><EchBuriAnimated size={174} state={dailyFocus.mascotState} /></div>
      </section>
      <Link to="/app/groups" className="community-button community-button--outline w-fit"><Users size={17} /> Vào nhóm học</Link>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <article className="community-panel community-panel--green">
          <div className="flex items-start justify-between gap-4"><div><p className="community-panel-label">Vòng học đề xuất</p><h2>{todayPlan?.recommendedLesson?.title || 'Xây nền phản xạ giao tiếp'}</h2></div><EchBuriAnimated size={54} state="thinking" /></div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ech-ink-soft)]">Ôn lại phần cần nhớ, sau đó chinh phục một kỹ năng mới trong cùng phiên học.</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div><strong>{todayPlan?.reviewQueue.length || 0}</strong><span>mục ôn</span></div><div><strong>15</strong><span>phút</span></div><div><strong>Vừa</strong><span>độ khó</span></div></div>
          <Link to={lessonPath} className="community-text-link mt-5">Tiếp tục bài học <ArrowRight size={16} /></Link>
          {showEnglishSurvival && <Link to={survivalLessonPath} className="community-text-link mt-3">{nextSurvivalLesson ? `Vào English Survival: ${nextSurvivalLesson.titleVi}` : 'English Survival đã hoàn thành'} <ArrowRight size={16} /></Link>}
        </article>

        <article className="community-panel community-panel--orange">
          <p className="community-panel-label">{hasEnglishSurvival ? 'Giao tiếp thực tế' : 'Luyện tập có hướng dẫn'}</p>
          <h2>{hasEnglishSurvival ? <>English Survival:<br />gọi món</> : <>Chọn đúng kỹ năng<br />cần luyện</>}</h2>
          <MessageCircle className="mt-5 text-[var(--ech-orange)]" size={32} />
          <p className="mt-3 text-sm text-[var(--ech-ink-soft)]">{hasEnglishSurvival ? '6 bước · Tạo câu của riêng bạn · Có tự rà soát' : 'Mỗi bài nêu rõ mục tiêu, hành động và bước tiếp theo.'}</p>
          <Link to={hasEnglishSurvival ? '/app/english-survival' : '/app/practice'} className="community-text-link mt-5">{hasEnglishSurvival ? 'Bắt đầu bài sinh tồn' : 'Mở trung tâm luyện tập'} <ArrowRight size={16} /></Link>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        {[{ label: 'Chuỗi học đã ghi nhận', value: `${metrics.streak} ngày`, icon: Flame }, { label: 'XP đã ghi nhận', value: `${metrics.totalXP}`, icon: BarChart3 }, { label: 'Bài đã hoàn thành', value: `${stats.totalLessonsCompleted || 0} bài`, icon: BookOpen }, { label: 'XP hôm nay', value: `${metrics.todayXP}`, icon: Play }].map(({ label, value, icon: Icon }) => <article key={label} className="community-metric"><Icon size={18} /><span>{label}</span><strong>{value}</strong></article>)}
      </section>

      <section className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <article className="community-panel community-goal-card"><div className="flex items-center justify-between"><div><p className="community-panel-label">Mục tiêu hôm nay</p><h2>{metrics.todayXP} / {metrics.dailyXPGoal} XP</h2></div><Flame className="text-[var(--ech-orange)]" /></div><div className="community-progress mt-5"><span style={{ width: `${Math.min(metrics.dailyProgress, 100)}%` }} /></div><p className="mt-3 text-sm text-[var(--ech-ink-muted)]">Chỉ tiến độ được ghi nhận trên thiết bị hoặc tài khoản này mới xuất hiện ở đây.</p></article>
        <article className="community-panel"><div className="flex items-center gap-2"><BookOpen size={18} className="text-[var(--ech-community-green)]" /><div><p className="community-panel-label">Bước tiếp theo</p><h2>Học, nhận phản hồi, rồi ôn lại</h2></div></div><p className="mt-4 text-sm leading-6 text-[var(--ech-ink-soft)]">Mở lộ trình để tiếp tục đúng bài chưa hoàn thành. Nếu muốn luyện theo kỹ năng, vào Trung tâm luyện tập và chọn một mục tiêu duy nhất.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/app/roadmap" className="community-button community-button--orange">Mở lộ trình</Link><Link to="/app/practice" className="community-button community-button--outline">Chọn kỹ năng</Link></div></article>
      </section>
    </main>
  );
}
