import { Link } from 'react-router';
import { Award, CalendarDays, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import PageShell from '../../PageShell';
import EchBuriAnimated from '../../../components/mascot/EchBuriAnimated';
import { useLearningStore } from '../../../stores/learningStore';
import { getStreakTodayStatus } from '../../../services/streakStatusService';

const utcDay = () => new Date().toISOString().slice(0, 10);

function recentStreakDates(lastActiveDate: string | undefined, currentStreak: number): string[] {
  if (!lastActiveDate || currentStreak <= 0) return [];
  const end = new Date(`${lastActiveDate}T00:00:00.000Z`);
  if (Number.isNaN(end.getTime())) return [];
  return Array.from({ length: Math.min(7, currentStreak) }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (Math.min(7, currentStreak) - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

function shortDay(date: string): string {
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00.000Z`));
}

export default function StreakCalendarPage() {
  const stats = useLearningStore((state) => state.stats);
  const today = utcDay();
  const todayStatus = getStreakTodayStatus({
    currentStreak: stats.currentStreak,
    lastActiveDate: stats.lastActiveDate,
    today,
  });
  const recentDates = recentStreakDates(stats.lastActiveDate, stats.currentStreak);
  const hasStudiedToday = todayStatus.status === 'secured';
  const mascotState = hasStudiedToday ? 'streak' : todayStatus.status === 'needs_study' ? 'thinking' : 'welcome';

  return (
    <PageShell title="Chuỗi học" description="Theo dõi nhịp học được ghi nhận từ những bài bạn đã hoàn thành." icon={<CalendarDays size={20} />}>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <section className="glass-card overflow-hidden p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-500">Nhịp học của bạn</p>
              <h2 className="mt-2 text-3xl font-black text-white">{stats.currentStreak} ngày liên tiếp</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-dark-300">{todayStatus.detail}</p>
            </div>
            <div className="rounded-2xl bg-amber-400/15 p-4 text-amber-300"><Flame size={30} aria-hidden="true" /></div>
          </div>

          <div className="mt-8 grid grid-cols-7 gap-2" aria-label="Bảy ngày gần nhất của chuỗi học">
            {Array.from({ length: 7 }, (_, index) => {
              const date = recentDates[index];
              const studied = Boolean(date);
              return (
                <div key={date ?? `empty-${index}`} className={`min-h-20 rounded-2xl border p-2 text-center ${studied ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-dark-800/50 text-dark-500'}`}>
                  <p className="text-[10px] font-bold uppercase">{date ? shortDay(date) : '—'}</p>
                  <div className="mt-3 flex justify-center">{studied ? <CheckCircle2 size={18} aria-label="Đã học" /> : <span className="h-4 w-4 rounded-full border border-current opacity-40" aria-label="Chưa có dữ liệu" />}</div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-dark-400">Chỉ những ngày có hoạt động hoàn thành mới được tính vào chuỗi. EchLearn không tự thêm ngày hoặc bán quyền sửa chuỗi.</p>
        </section>

        <aside className={`glass-card p-6 text-center ${hasStudiedToday ? 'border-emerald-400/25' : 'border-amber-300/25'}`}>
          <EchBuriAnimated size={150} state={mascotState} className="mx-auto" />
          <h2 className="mt-4 text-xl font-black text-white">{hasStudiedToday ? 'Ech Buri đang ăn mừng!' : 'Ech Buri giữ nhịp cùng bạn'}</h2>
          <p className="mt-2 text-sm leading-relaxed text-dark-300">{hasStudiedToday ? 'Chuỗi hôm nay đã an toàn. Hãy quay lại vào ngày mai để tiếp tục.' : 'Một nhiệm vụ ngắn hôm nay là đủ để tạo hoặc giữ chuỗi học.'}</p>
          <Link to="/app/dashboard" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-400">
            {hasStudiedToday ? <><Sparkles size={17} aria-hidden="true" /> Xem nhiệm vụ hôm nay</> : <><Flame size={17} aria-hidden="true" /> Bắt đầu nhiệm vụ hôm nay</>}
          </Link>
        </aside>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="glass-card flex items-center gap-4 p-5">
          <span className="rounded-2xl bg-amber-400/15 p-3 text-amber-300"><Flame size={22} aria-hidden="true" /></span>
          <div><p className="text-sm text-dark-300">Chuỗi hiện tại</p><strong className="text-2xl text-white">{stats.currentStreak} ngày</strong></div>
        </article>
        <article className="glass-card flex items-center gap-4 p-5">
          <span className="rounded-2xl bg-sky-400/15 p-3 text-sky-300"><Award size={22} aria-hidden="true" /></span>
          <div><p className="text-sm text-dark-300">Kỷ lục cá nhân</p><strong className="text-2xl text-white">{stats.longestStreak} ngày</strong></div>
        </article>
      </section>
    </PageShell>
  );
}
