import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, CheckCircle2, Flag, Play, Target } from 'lucide-react';
import { getCourseForLanguage } from '../../curriculum/courseRegistry';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useProAccess } from '../../hooks/useProAccess';
import { canUseEntitlementLanguages } from '../../services/entitlementService';
import { progressService } from '../../services/progressService';
import Mascot from '../../components/mascot/Mascot';
import { getRoadmapPhase, ninetyDayRoadmap } from '../../viewmodels/ninetyDayRoadmap';
import { toast } from '../../components/ui/Toast';

export default function CourseRoadmapPage() {
  const [searchParams] = useSearchParams();
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const setCurrentLanguage = useAppStore((state) => state.setCurrentLanguage);
  const user = useAuthStore((state) => state.user);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const modules = getCourseForLanguage(currentLanguage) || [];
  const completedLessons = modules.flatMap((module) => module.lessons).filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const currentDay = Math.min(90, Math.max(1, completedLessons + 1));
  const activePhase = getRoadmapPhase(currentDay);
  const nextModule = useMemo(() => modules.find((module) => !module.lessons.every((lesson) => completedLessonIds.includes(lesson.id))) ?? modules[0], [completedLessonIds, modules]);

  const navigate = useNavigate();
  // Plan resolved from `profiles.role` / `profiles.is_pro` merged with the local
  // ledger, so an admin-granted PRO account is not redirected to /pricing.
  const { plan: activePlan, flags: proFlags, isResolving: isResolvingPlan } = useProAccess();
  const selectedLangs = user?.targetLanguages ?? [currentLanguage];

  useEffect(() => {
    const requestedLanguage = searchParams.get('lang') || currentLanguage;
    const testLanguages = Array.from(new Set([...selectedLangs, requestedLanguage]));
    const canUse = proFlags.unlockAllLanguages || canUseEntitlementLanguages(activePlan, testLanguages);
    // Wait for the authoritative plan before bouncing anyone.
    if (!canUse && !isResolvingPlan) {
      toast(`🔒 Ngôn ngữ (${requestedLanguage.toUpperCase()}) cần mở khóa gói cước GO, PLUS hoặc PRO. Đang tới Bảng giá...`, 'warning');
      navigate('/app/pricing');
      return;
    }
    if (requestedLanguage && requestedLanguage !== currentLanguage) {
      setCurrentLanguage(requestedLanguage);
    }
  }, [currentLanguage, searchParams, setCurrentLanguage, activePlan, proFlags.unlockAllLanguages, isResolvingPlan, selectedLangs, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    progressService.getCompletedLessons(user.id).then(setCompletedLessonIds).catch(() => setCompletedLessonIds([]));
  }, [user?.id]);

  const nextLessonUrl = nextModule ? `/app/lesson?id=${nextModule.id}&lesId=${currentLanguage}_les_${modules.indexOf(nextModule) + 1}` : '/app/practice';

  return (
    <section className="mx-auto max-w-5xl space-y-6 pb-24">
      <header className="grid gap-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-900/50 dark:bg-slate-900 md:grid-cols-[1fr_180px] md:p-8">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Target size={14} /> LỘ TRÌNH KẾT QUẢ 90 NGÀY</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Không học cho đủ bài. Học để làm được việc.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Mỗi 30 ngày phải có một minh chứng đầu ra. Từ vựng và ngữ pháp chỉ xuất hiện khi chúng giúp bạn hoàn thành đúng tình huống thực tế.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to={nextLessonUrl} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"><Play size={16} fill="currentColor" /> Học bài tiếp theo</Link>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Ngày {currentDay}/90 · {completedLessons} bài đã hoàn thành</span>
          </div>
        </div>
        <div className="flex items-end justify-center"><Mascot size={156} expression={activePhase.id === 'performance' ? 'encouraging' : 'happy'} message="Mỗi ngày một bằng chứng nhỏ." /></div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950" aria-label="Tiến độ lộ trình 90 ngày">
        <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200"><span>Tiến độ hiện tại</span><span>{Math.round((currentDay / 90) * 100)}%</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuemin={0} aria-valuemax={90} aria-valuenow={currentDay} aria-label={`Ngày ${currentDay} trên 90`}><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(currentDay / 90) * 100}%` }} /></div>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {ninetyDayRoadmap.map((phase) => {
          const isActive = phase.id === activePhase.id;
          const isDone = currentDay > phase.endDay;
          return <li key={phase.id} className={`rounded-2xl border p-5 ${isActive ? 'border-emerald-500 bg-emerald-50 shadow-sm dark:bg-emerald-500/10' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
            <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{phase.label}</p>{isDone ? <CheckCircle2 className="text-emerald-600" size={20} /> : <Flag className={isActive ? 'text-emerald-600' : 'text-slate-400'} size={20} />}</div>
            <h2 className="mt-3 text-xl font-black text-slate-950 dark:text-white">Ngày {phase.startDay}–{phase.endDay}: {phase.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{phase.outcome}</p>
            <div className="mt-4 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">Kiểm tra: {phase.checkpoint}</div>
          </li>;
        })}
      </ol>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-black text-slate-950 dark:text-white">Mốc hiện tại: {activePhase.title}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Bạn không bị khóa vì chưa học đủ một năm. Hãy làm bài tiếp theo, nhận phản hồi, rồi mở mốc kế.</p></div>
        <Link to={nextLessonUrl} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-600 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10">Tiếp tục <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}
