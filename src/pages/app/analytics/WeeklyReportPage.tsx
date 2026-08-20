import { useEffect, useState, useMemo } from 'react';
import { useLearningStore } from '../../../stores/learningStore';
import { useAuthStore } from '../../../stores/authStore';
import { BarChart3, TrendingUp, Flame, Brain, Headphones, Mic, BookOpen, PenTool, Sparkles, Loader2 } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { learningAdviceService } from '../../../services/aiCoachingService';

export default function WeeklyReportPage() {
  const user = useAuthStore((s) => s.user);
  const stats = useLearningStore((s) => s.stats);
  const weeklyTrend = useLearningStore((s) => s.weeklyTrend);
  const fetchStats = useLearningStore((s) => s.fetchStats);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchStats();
      setIsLoading(false);
    }
    loadData();
  }, [fetchStats]);

  const advice = useMemo(
    () => learningAdviceService.generateAdvice(stats, weeklyTrend || []),
    [stats, weeklyTrend],
  );

  // Use real data, if empty provide a 7-day placeholder for UI
  const displayTrend = useMemo(() => {
    if (weeklyTrend && weeklyTrend.length > 0) return weeklyTrend;
    return [
      { day: 'Thứ 2', xp: 0, lessons: 0, minutes: 0 },
      { day: 'Thứ 3', xp: 0, lessons: 0, minutes: 0 },
      { day: 'Thứ 4', xp: 0, lessons: 0, minutes: 0 },
      { day: 'Thứ 5', xp: 0, lessons: 0, minutes: 0 },
      { day: 'Thứ 6', xp: 0, lessons: 0, minutes: 0 },
      { day: 'Thứ 7', xp: 0, lessons: 0, minutes: 0 },
      { day: 'Chủ Nhật', xp: 0, lessons: 0, minutes: 0 },
    ];
  }, [weeklyTrend]);

  const maxXP = Math.max(...displayTrend.map((d) => d.xp), 100);
  const totalWeeklyXP = displayTrend.reduce((sum, d) => sum + d.xp, 0);
  const totalWeeklyMinutes = displayTrend.reduce((sum, d) => sum + d.minutes, 0);
  const totalWeeklyLessons = displayTrend.reduce((sum, d) => sum + d.lessons, 0);

  // Normalize scores for UI (0-100 scale)
  const safeScore = (score: number | undefined) => Math.min(Math.max(score || 0, 0), 100);
  const readingScore = safeScore(stats.readingScore);
  const listeningScore = safeScore(stats.listeningScore);
  const speakingScore = safeScore(stats.speakingScore);
  const writingScore = safeScore(stats.writingScore);

  return (
    <PageShell title="Báo Cáo Tiến Độ Hằng Tuần" description="Thống kê chi tiết chỉ số học tập, số giờ tích lũy và các kỹ năng cần ưu tiên." icon={<BarChart3 size={20} />}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="font-mono text-sm">ĐANG TỔNG HỢP BIỂU ĐỒ NHẬN THỨC...</p>
        </div>
      ) : (
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
                <span className="text-2xl font-black text-amber-500 dark:text-amber-400">LV.{stats.level || 1}</span>
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
              <span className="text-xs text-slate-400 font-mono">Tổng Tuần: {totalWeeklyXP} XP</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-slate-800 pb-2">
              {displayTrend.map((item) => {
                const heightPercent = Math.round((item.xp / maxXP) * 100);

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.xp} XP
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl h-36 flex items-end p-1 border border-slate-200 dark:border-slate-800">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-700 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-md shadow-emerald-500/20"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold text-center leading-tight min-h-[24px] flex items-center justify-center">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Mastery Breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900/60 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Brain size={18} className="text-amber-500 dark:text-amber-400" />
                <span>ĐÁNH GIÁ KỸ NĂNG THỰC TẾ</span>
              </h3>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Headphones size={14} className="text-emerald-600 dark:text-emerald-400" /> Listening (Luyện Nghe)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{listeningScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${listeningScore}%` }} /></div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Mic size={14} className="text-amber-600 dark:text-amber-400" /> Speaking (Phát Âm & Ngữ Điệu)</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{speakingScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${speakingScore}%` }} /></div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><BookOpen size={14} className="text-cyan-600 dark:text-cyan-400" /> Reading (Đọc Hiểu Từ Vựng)</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{readingScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden"><div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${readingScore}%` }} /></div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><PenTool size={14} className="text-purple-600 dark:text-purple-400" /> Writing (Viết Câu & Đoạn Văn)</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{writingScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden"><div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${writingScore}%` }} /></div>
                </div>
              </div>
            </div>

            {/* Transparent rules-based weekly guidance */}
            <div className={`glass-card p-6 border flex flex-col justify-between transition-colors duration-500 bg-white dark:bg-slate-900/60 rounded-3xl shadow-sm ${advice ? (advice.tone === 'strict' ? 'border-rose-500/30' : 'border-emerald-500/30') : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-start gap-4">
                <Mascot expression={advice ? (advice.tone === 'strict' ? 'thinking' : 'cool') : 'thinking'} size={85} />
                <div className="flex-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${advice?.tone === 'strict' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'}`}>
                    GỢI Ý TỪ DỮ LIỆU TUẦN
                  </span>
                  
                  {!advice ? (
                    <div className="mt-4 space-y-2">
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full"></div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6"></div>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2 mb-1">PHÂN TÍCH NHẬN THỨC:</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                        "{advice.message}"
                      </p>
                      
                      {advice.focusAreas.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {advice.focusAreas.map(area => (
                            <span key={area} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-[10px] text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                              #{area}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
