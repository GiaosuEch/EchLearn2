import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BarChart3, BookOpen, Headphones, Mic, PenLine, Play, ArrowRight, Flame } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { adaptiveLearningEngine, type TodayPlan } from '../../services/adaptiveLearningEngine';
import { createDashboardMetrics } from '../../viewmodels/dashboardMetrics';
import EchBuriAnimated from '../../components/mascot/EchBuriAnimated';

const skills = [
  { label: 'Listening', value: 78, icon: Headphones, color: 'bg-emerald-500' },
  { label: 'Speaking', value: 60, icon: Mic, color: 'bg-amber-500' },
  { label: 'Reading', value: 88, icon: BookOpen, color: 'bg-emerald-500' },
  { label: 'Writing', value: 52, icon: PenLine, color: 'bg-amber-500' },
];

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const currentLanguage = useAppStore(s => s.currentLanguage);
  const nativeLanguage = useAppStore(s => s.nativeLanguage);
  const dailyXPGoal = useAppStore(s => s.dailyXpGoal);
  const ieltsTargetBand = useAppStore(s => s.ieltsTargetBand);
  const stats = useLearningStore(s => s.stats);
  const todayXP = useLearningStore(s => s.todayXP);
  const metrics = createDashboardMetrics(stats, todayXP, dailyXPGoal, ieltsTargetBand);
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    adaptiveLearningEngine.getTodayPlan(userId, currentLanguage, nativeLanguage).then(setTodayPlan).catch(() => setTodayPlan(null));
  }, [userId, currentLanguage, nativeLanguage]);

  const lessonPath = todayPlan?.recommendedLesson?.path || `/app/lesson?id=${currentLanguage}_mod_1&lesId=${currentLanguage}_les_1`;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'bạn';

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {!isSupabaseConfigured() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
          Tiến trình hiện được lưu trên thiết bị này.
        </div>
      )}

      {/* ── Greeting + Daily goal ── */}
      <section className="grid lg:grid-cols-[1.5fr_1fr] gap-4 items-stretch">
        {/* Welcome card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] flex flex-col justify-between gap-6 relative overflow-hidden shadow-[var(--ech-shadow-sm)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">Kế hoạch hôm nay</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Chào {displayName}</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--ech-text-muted)]">
              Một phiên học ngắn sẽ giúp bạn duy trì thói quen học mỗi ngày.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={lessonPath}>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:-translate-y-px active:translate-y-0 shadow-sm text-sm flex items-center gap-2 cursor-pointer">
                <Play size={16} />
                <span>Bắt đầu học ngay</span>
              </button>
            </Link>
            <Link to="/app/roadmap">
              <button className="text-[var(--ech-text-muted)] hover:text-[var(--ech-text)] font-medium py-3 px-5 rounded-xl transition-colors text-sm flex items-center gap-1.5 cursor-pointer">
                <span>Xem lộ trình</span>
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          {/* Small mascot accent */}
          <div className="absolute -right-2 -bottom-2 opacity-20 pointer-events-none">
            <EchBuriAnimated size={120} />
          </div>
        </div>

        {/* Daily XP goal */}
        <div className="p-6 rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] flex flex-col justify-between shadow-[var(--ech-shadow-sm)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Mục tiêu ngày</p>
            <div className="flex items-center gap-1 text-amber-500">
              <Flame size={16} />
              <span className="text-xs font-bold">{metrics.streak} ngày</span>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold tracking-tight">{metrics.todayXP}</span>
              <span className="text-sm font-medium text-[var(--ech-text-muted)]">/ {metrics.dailyXPGoal} XP</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-[var(--ech-surface-2)] overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(metrics.dailyProgress, 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats row ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng XP', value: `${metrics.totalXP}` },
          { label: 'Cấp độ', value: `${metrics.level}` },
          { label: 'Bài đã học', value: `${stats.totalLessonsCompleted || 0}` },
          { label: 'IELTS mục tiêu', value: `${metrics.targetBand}` },
        ].map(({ label, value }) => (
          <div key={label} className="p-5 rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] shadow-[var(--ech-shadow-xs)]">
            <p className="text-xs font-medium text-[var(--ech-text-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </section>

      {/* ── Lesson + Skills ── */}
      <section className="grid lg:grid-cols-[1.35fr_1fr] gap-4">
        {/* Adaptive roadmap */}
        <div className="p-6 rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] shadow-[var(--ech-shadow-sm)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">Lộ trình thích ứng</p>
                <h2 className="text-lg font-bold">{todayPlan?.recommendedLesson?.title || 'Xây nền tảng giao tiếp'}</h2>
              </div>
              <EchBuriAnimated size={56} />
            </div>
            <p className="mt-3 text-sm text-[var(--ech-text-muted)]">Ôn lại phần cần nhớ, sau đó luyện một kỹ năng mới trong cùng phiên học.</p>
            <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--ech-surface-2)] p-3.5">
                <span className="block text-[10px] font-medium text-[var(--ech-text-muted)] uppercase tracking-wider">Ôn tập</span>
                <span className="font-semibold">{todayPlan?.reviewQueue.length || 0} mục</span>
              </div>
              <div className="rounded-xl bg-[var(--ech-surface-2)] p-3.5">
                <span className="block text-[10px] font-medium text-[var(--ech-text-muted)] uppercase tracking-wider">Thời lượng</span>
                <span className="font-semibold">15 phút</span>
              </div>
              <div className="rounded-xl bg-[var(--ech-surface-2)] p-3.5">
                <span className="block text-[10px] font-medium text-[var(--ech-text-muted)] uppercase tracking-wider">Mức độ</span>
                <span className="font-semibold">Vừa sức</span>
              </div>
            </div>
          </div>
          <Link to={lessonPath} className="inline-flex mt-6">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:-translate-y-px active:translate-y-0 shadow-sm text-sm flex items-center gap-2 cursor-pointer">
              <Play size={15} />
              <span>Tiếp tục bài học</span>
            </button>
          </Link>
        </div>

        {/* Skills proficiency */}
        <div className="p-6 rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] shadow-[var(--ech-shadow-sm)]">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <h2 className="text-base font-bold">Kỹ năng</h2>
          </div>
          <div className="mt-5 space-y-4">
            {skills.map(({ label, value, icon: Icon, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-[var(--ech-text)]">
                    <Icon size={15} className="text-[var(--ech-text-muted)]" />{label}
                  </span>
                  <span className={`font-bold ${value >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[var(--ech-surface-2)]">
                  <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mascot encouragement ── */}
      <section className="rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] p-5 flex items-center gap-4 text-sm font-medium shadow-[var(--ech-shadow-xs)]">
        <EchBuriAnimated size={40} className="shrink-0" />
        <span className="text-[var(--ech-text-muted)]">Học đều mỗi ngày. Ech Buri sẽ đồng hành và điều chỉnh bài tiếp theo theo tiến độ của bạn.</span>
      </section>
    </main>
  );
}
