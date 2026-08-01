import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BarChart3, BookOpen, Check, Headphones, Mic, PenLine, Play, Target } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { adaptiveLearningEngine, type TodayPlan } from '../../services/adaptiveLearningEngine';
import { createDashboardMetrics } from '../../viewmodels/dashboardMetrics';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

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

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {!isSupabaseConfigured() && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Tiến trình hiện được lưu trên thiết bị này.</div>}

      <section className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-stretch">
        <Card className="p-6 sm:p-8 border-emerald-200 bg-emerald-50/60 flex flex-col justify-between gap-7">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Kế hoạch hôm nay</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Chào {displayName}</h1>
            <p className="mt-3 max-w-xl text-slate-600 leading-relaxed">Một phiên học ngắn, rõ mục tiêu sẽ giúp bạn duy trì tiến bộ đều đặn.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={lessonPath}><Button size="lg"><Play size={17} /> Bắt đầu học</Button></Link>
            <Link to="/app/roadmap"><Button variant="outline" size="lg">Xem lộ trình</Button></Link>
          </div>
        </Card>
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">Mục tiêu ngày</p><Target size={19} className="text-emerald-600" /></div>
          <div className="mt-5"><div className="flex items-end justify-between"><span className="text-4xl font-bold text-slate-950">{metrics.todayXP}</span><span className="text-sm text-slate-500">/ {metrics.dailyXPGoal} XP</span></div><div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${metrics.dailyProgress}%` }} /></div></div>
          <p className="mt-4 text-sm text-slate-500">Chuỗi học hiện tại: <span className="font-semibold text-slate-800">{metrics.streak} ngày</span></p>
        </Card>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Tổng XP', `${metrics.totalXP}`, 'Điểm tích lũy'],
          ['Cấp độ', `${metrics.level}`, 'Theo tiến trình'],
          ['Bài đã học', `${stats.totalLessonsCompleted || 0}`, 'Hoàn thành'],
          ['Mục tiêu IELTS', `${metrics.targetBand}`, 'Band tham chiếu'],
        ].map(([label, value, note]) => <Card key={label} className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></Card>)}
      </section>

      <section className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-emerald-700">Lộ trình thích ứng</p><h2 className="mt-1 text-xl font-bold text-slate-950">{todayPlan?.recommendedLesson?.title || 'Xây nền tảng giao tiếp'}</h2></div><BarChart3 size={21} className="text-slate-400" /></div>
          <p className="mt-3 text-sm text-slate-600">Ôn lại phần cần nhớ, sau đó luyện một kỹ năng mới trong cùng phiên học.</p>
          <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm"><div className="rounded-lg bg-slate-50 p-3"><span className="block text-xs text-slate-500">Ôn tập</span><span className="font-semibold text-slate-900">{todayPlan?.reviewQueue.length || 0} mục</span></div><div className="rounded-lg bg-slate-50 p-3"><span className="block text-xs text-slate-500">Thời lượng</span><span className="font-semibold text-slate-900">15 phút</span></div><div className="rounded-lg bg-slate-50 p-3"><span className="block text-xs text-slate-500">Mức độ</span><span className="font-semibold text-slate-900">Vừa sức</span></div></div>
          <Link to={lessonPath} className="inline-flex mt-5"><Button><Play size={16} /> Tiếp tục bài học</Button></Link>
        </Card>
        <Card className="p-6"><div className="flex items-center gap-2"><BarChart3 size={19} className="text-emerald-600" /><h2 className="text-lg font-bold text-slate-950">Kỹ năng</h2></div><div className="mt-5 space-y-4">{skills.map(({ label, value, icon: Icon }) => <div key={label}><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 font-semibold text-slate-700"><Icon size={16} className="text-slate-500" />{label}</span><span className="text-slate-500">{value}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${value}%` }} /></div></div>)}</div></Card>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-3 text-sm text-slate-600"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={15} /></span><span>Học đều mỗi ngày. Mình sẽ điều chỉnh bài tiếp theo theo tiến độ của bạn.</span></section>
    </main>
  );
}
