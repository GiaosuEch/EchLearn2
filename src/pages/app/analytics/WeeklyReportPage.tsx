import { useLearningStore } from '../../../stores/learningStore';
import { useAuthStore } from '../../../stores/authStore';
import { BarChart3, TrendingUp, Flame, Brain, Headphones, Mic, BookOpen, PenTool, Sparkles } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { CustomEmoji } from '../../../components/common/CustomEmoji';

export default function WeeklyReportPage() {
  const user = useAuthStore((s) => s.user);
  const stats = useLearningStore((s) => s.stats);
  const todayXP = useLearningStore((s) => s.todayXP);

  const weeklyData = [
    { day: 'Thứ 2', xp: 120, lessons: 3, minutes: 25 },
    { day: 'Thứ 3', xp: 180, lessons: 4, minutes: 35 },
    { day: 'Thứ 4', xp: 90, lessons: 2, minutes: 20 },
    { day: 'Thứ 5', xp: 220, lessons: 5, minutes: 45 },
    { day: 'Thứ 6', xp: 150, lessons: 3, minutes: 30 },
    { day: 'Thứ 7', xp: 260, lessons: 6, minutes: 50 },
    { day: 'Chủ Nhật', xp: todayXP || 140, lessons: 3, minutes: 28 },
  ];

  const maxXP = Math.max(...weeklyData.map((d) => d.xp), 1);
  const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const totalWeeklyLessons = weeklyData.reduce((sum, d) => sum + d.lessons, 0);

  return (
    <PageShell title="Báo Cáo Tiến Độ Hằng Tuần" description="Thống kê chi tiết chỉ số học tập, số giờ tích lũy và các kỹ năng cần ưu tiên." icon={<BarChart3 size={20} />}>
      <div className="space-y-6 font-mono">
        {/* Top Summary Header Banner */}
        <div className="glass-card p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 mb-2">
              <Sparkles size={14} />
              <span>[ BÁO CÁO PHÂN TÍCH TUẦN ]</span>
            </div>
            <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-white">
              Xin chào, {user?.displayName || 'Học Viên Ếch'}!
              <CustomEmoji name="ech-buri" size={28} />
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Bạn đã hoàn thành <strong className="text-emerald-400">{totalWeeklyLessons} bài học</strong> với tổng thời gian <strong className="text-amber-400">{totalWeeklyMinutes} phút</strong> học tuần này!
            </p>
          </div>

          <div className="flex gap-4">
            <div className="text-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">CHUỖI STREAK</span>
              <span className="text-2xl font-black text-rose-500 dark:text-rose-400 flex items-center justify-center gap-1">
                <Flame size={18} />
                {stats.currentStreak} Ngày
              </span>
            </div>

            <div className="text-center p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">CẤP ĐỘ KHÓA HỌC</span>
              <span className="text-2xl font-black text-amber-500 dark:text-amber-400">LV.{user?.level || 1}</span>
            </div>
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="glass-card p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span>BIỂU ĐỒ TÍCH LŨY XP THEO NGÀY</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Tổng Tuần: {stats.totalXP} XP</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-slate-800 pb-2">
            {weeklyData.map((item) => {
              const heightPercent = Math.round((item.xp / maxXP) * 100);

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.xp} XP
                  </span>
                  <div className="w-full bg-slate-900 rounded-xl h-36 flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-700 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-lg shadow-emerald-500/20"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Mastery Breakdown */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Brain size={18} className="text-amber-400" />
              <span>ĐÁNH GIÁ KỸ NĂNG THEO TIÊU CHUẨN</span>
            </h3>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><Headphones size={14} className="text-emerald-400" /> Listening (Luyện Nghe)</span>
                  <span className="text-emerald-400 font-bold">88%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{ width: '88%' }} /></div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><Mic size={14} className="text-amber-400" /> Speaking (Phát Âm & Ngữ Điệu)</span>
                  <span className="text-amber-400 font-bold">82%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: '82%' }} /></div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><BookOpen size={14} className="text-cyan-400" /> Reading (Đọc Hiểu Từ Vựng)</span>
                  <span className="text-cyan-400 font-bold">94%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-cyan-400 rounded-full" style={{ width: '94%' }} /></div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5"><PenTool size={14} className="text-purple-400" /> Writing (Viết Câu & Đoạn Văn)</span>
                  <span className="text-purple-400 font-bold">79%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-purple-400 rounded-full" style={{ width: '79%' }} /></div>
              </div>
            </div>
          </div>

          {/* Mascot coaching prompt */}
          <div className="glass-card p-6 border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <Mascot expression="cool" size={85} />
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase">
                  PEPE COACH ADVICE
                </span>
                <h4 className="font-bold text-white text-sm mt-1">LỜI KHUYÊN DÀNH CHO TUẦN TỚI:</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
                  "Tuần này bạn phát huy rất tốt kỹ năng Reading & Listening! Để tiến gần hơn tới mục tiêu, hãy dành thêm 15 phút mỗi ngày cho <strong>Writing Task 2 và luyện nói theo chủ đề</strong>."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
