import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BarChart3, BookOpen, Headphones, Mic, PenLine, Play } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { adaptiveLearningEngine, type TodayPlan } from '../../services/adaptiveLearningEngine';
import { createDashboardMetrics } from '../../viewmodels/dashboardMetrics';
import { ExpressiveBadge } from '../../components/ui/ExpressiveBadge';
import { CustomEmote, type EmoteType } from '../../components/common/CustomEmote';
import EchBuriAnimated from '../../components/mascot/EchBuriAnimated';

const skills = [
  { label: 'Nghe', value: 78, icon: Headphones },
  { label: 'Nói', value: 60, icon: Mic },
  { label: 'Đọc', value: 88, icon: BookOpen },
  { label: 'Viết', value: 52, icon: PenLine },
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

  useEffect(() => {
    if (!user) return;
    adaptiveLearningEngine.getTodayPlan(user.id, currentLanguage, nativeLanguage).then(setTodayPlan).catch(() => setTodayPlan(null));
  }, [user, currentLanguage, nativeLanguage]);

  const lessonPath = todayPlan?.recommendedLesson?.path || '/app/lesson?id=en_mod_1&lesId=en_les_1';
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'bạn';

  const statCards: Array<[string, string, string, EmoteType, 'amber' | 'emerald' | 'purple' | 'sky']> = [
    ['Tổng XP', `${metrics.totalXP}`, 'Điểm tích lũy', 'xp-star', 'amber'],
    ['Cấp độ', `${metrics.level}`, 'Theo tiến trình', 'mascot-avatar', 'emerald'],
    ['Bài đã học', `${stats.totalLessonsCompleted || 0}`, 'Hoàn thành', 'sparkles-badge', 'sky'],
    ['Mục tiêu IELTS', `${metrics.targetBand}`, 'Band tham chiếu', 'ielts-target', 'purple'],
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {!isSupabaseConfigured() && <div className="rounded-2xl border-2 border-amber-200 border-b-4 border-b-amber-300 bg-amber-50 px-5 py-3.5 text-sm font-extrabold text-amber-900">Tiến trình hiện được lưu trên thiết bị này.</div>}

      {/* Hero Action Cards */}
      <section className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-stretch">
        <div className="p-6 sm:p-8 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white flex flex-col justify-between gap-7 relative overflow-hidden shadow-sm">
          <div>
            <ExpressiveBadge emote="mascot-tutor" variant="emerald" size="sm" className="mb-3">
              KẾ HOẠCH HÔM NAY
            </ExpressiveBadge>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Chào {displayName}</h1>
            <p className="mt-3 max-w-xl text-slate-600 font-semibold leading-relaxed text-base">Một phiên học ngắn, vui nhộn sẽ giúp bạn duy trì thói quen học mỗi ngày cùng Ech Buri.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={lessonPath}>
              <button className="bg-[#58cc02] hover:bg-[#61e002] text-white font-black uppercase tracking-wider py-3.5 px-7 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer">
                <Play size={18} />
                <span>BẮT ĐẦU HỌC NGAY</span>
              </button>
            </Link>
            <Link to="/app/roadmap">
              <button className="bg-white hover:bg-slate-50 text-[#1cb0f6] font-black uppercase tracking-wider py-3.5 px-6 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 active:border-b-2 active:translate-y-0.5 transition-all text-sm flex items-center gap-2 cursor-pointer">
                <span>XEM LỘ TRÌNH</span>
              </button>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <ExpressiveBadge emote="xp-star" variant="amber" size="sm">
              MỤC TIÊU NGÀY
            </ExpressiveBadge>
          </div>
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900">{metrics.todayXP}</span>
              <span className="text-sm font-extrabold text-slate-500">/ {metrics.dailyXPGoal} XP</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div className="h-full rounded-full bg-[#58cc02]" style={{ width: `${metrics.dailyProgress}%` }} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <ExpressiveBadge emote="streak-fire" variant="amber" size="sm">
              STREAK: {metrics.streak} NÀY
            </ExpressiveBadge>
          </div>
        </div>
      </section>

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(([label, value, note, emote]) => (
          <div key={label} className="p-5 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white flex flex-col justify-between space-y-3 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
              <CustomEmote type={emote} size={28} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="mt-1 text-xs font-extrabold text-slate-500">{note}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Roadmap & Skills Section */}
      <section className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        <div className="p-6 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <ExpressiveBadge emote="sparkles-badge" variant="sky" size="sm" className="mb-2">
                  LỘ TRÌNH THÍCH ỨNG
                </ExpressiveBadge>
                <h2 className="mt-1 text-xl font-black text-slate-900">{todayPlan?.recommendedLesson?.title || 'Xây nền tảng giao tiếp'}</h2>
              </div>
              <EchBuriAnimated size={64} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-600">Ôn lại phần cần nhớ, sau đó luyện một kỹ năng mới trong cùng phiên học.</p>
            <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm font-semibold">
              <div className="rounded-xl bg-slate-50 p-3.5 border-2 border-slate-200 border-b-4"><span className="block text-xs text-slate-500 font-black uppercase">Ôn tập</span><span className="font-black text-slate-900">{todayPlan?.reviewQueue.length || 0} mục</span></div>
              <div className="rounded-xl bg-slate-50 p-3.5 border-2 border-slate-200 border-b-4"><span className="block text-xs text-slate-500 font-black uppercase">Thời lượng</span><span className="font-black text-slate-900">15 phút</span></div>
              <div className="rounded-xl bg-slate-50 p-3.5 border-2 border-slate-200 border-b-4"><span className="block text-xs text-slate-500 font-black uppercase">Mức độ</span><span className="font-black text-slate-900">Vừa sức</span></div>
            </div>
          </div>
          <Link to={lessonPath} className="inline-flex mt-6">
            <button className="bg-[#58cc02] hover:bg-[#61e002] text-white font-black uppercase tracking-wider py-3.5 px-6 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer">
              <Play size={16} />
              <span>TIẾP TỤC BÀI HỌC</span>
            </button>
          </Link>
        </div>

        <div className="p-6 rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-[#58cc02]" />
            <h2 className="text-lg font-black text-slate-900">Độ Thành Thạo Kỹ Năng</h2>
          </div>
          <div className="mt-5 space-y-4">
            {skills.map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-extrabold text-slate-700">
                    <Icon size={16} className="text-slate-500" />{label}
                  </span>
                  <span className="font-black text-[#58cc02]">{value}%</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate-100 border border-slate-200">
                  <div className="h-full rounded-full bg-[#58cc02]" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mascot Encouragement Banner */}
      <section className="rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 bg-white p-5 flex items-center gap-4 text-sm font-extrabold text-slate-800 shadow-sm">
        <EchBuriAnimated size={44} className="shrink-0" />
        <span>Học đều mỗi ngày. Ech Buri sẽ đồng hành và điều chỉnh bài tiếp theo theo tiến độ phản xạ của bạn.</span>
      </section>
    </main>
  );
}
