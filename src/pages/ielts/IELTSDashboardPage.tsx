import { Link } from 'react-router';
import { 
  GraduationCap, 
  Headphones, 
  Mic, 
  BookOpen, 
  PenTool, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  ArrowRight, 
  Brain, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { IELTS_BAND_RANGES } from '../../types/ielts';
import { useLearningStore } from '../../stores/learningStore';
import { useAuthStore } from '../../stores/authStore';
import { mockTests } from '../../data/ieltsData';

export default function IELTSDashboardPage() {
  const stats = useLearningStore((s) => s.stats);
  const user = useAuthStore((s) => s.user);

  const skills = [
    { 
      name: 'IELTS Listening', 
      icon: <Headphones size={26} />, 
      score: stats.listeningScore || 75, 
      band: 6.5, 
      timeLimit: '30 - 40 phút',
      taskTypes: 'Form Completion, Multiple Choice, Matching',
      path: '/app/ielts/listening', 
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      btnColor: 'bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-800'
    },
    { 
      name: 'IELTS Reading', 
      icon: <BookOpen size={26} />, 
      score: stats.readingScore || 80, 
      band: 7.0, 
      timeLimit: '60 phút',
      taskTypes: 'True/False/Not Given, Headings, Gap Fill',
      path: '/app/ielts/reading', 
      color: 'from-purple-500 to-violet-500',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      btnColor: 'bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800'
    },
    { 
      name: 'IELTS Writing', 
      icon: <PenTool size={26} />, 
      score: stats.writingScore || 65, 
      band: 6.0, 
      timeLimit: '60 phút',
      taskTypes: 'Task 1 (Chart 150w) & Task 2 (Essay 250w)',
      path: '/app/ielts/writing', 
      color: 'from-amber-500 to-orange-500',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      btnColor: 'bg-amber-600 hover:bg-amber-700 border-b-4 border-amber-800'
    },
    { 
      name: 'IELTS Speaking', 
      icon: <Mic size={26} />, 
      score: stats.speakingScore || 70, 
      band: 6.5, 
      timeLimit: '11 - 14 phút',
      taskTypes: 'Part 1 Interview, Part 2 Cue Card, Part 3 Deep Discussion',
      path: '/app/ielts/speaking', 
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800'
    },
  ];

  const weakSkill = skills.reduce((prev, current) => (prev.band < current.band) ? prev : current);

  const mockChartData = [
    { date: 'Tuần 1', band: 5.5 },
    { date: 'Tuần 2', band: 6.0 },
    { date: 'Tuần 3', band: 6.0 },
    { date: 'Tuần 4', band: 6.5 },
  ];

  const currentBand = stats.ieltsEstimatedBand || 6.5;
  const targetBand = user?.ieltsTargetBand || 7.5;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Header Banner - Cambridge / BC Commercial Style */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap size={14} /> HỘI TRƯỜNG LUYỆN THI IELTS ACADEMIC SUITE
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Standard Cambridge & BC Benchmark
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Lộ Trình Chinh Phục IELTS Academic 7.5+
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
              Hệ thống mô phỏng đề thi thật chuẩn Cambridge 16-19, chấm Band tự động bằng AI 24/7 cho 4 kỹ năng Nghe, Nói, Đọc, Viết.
            </p>
          </div>

          {/* Band Score Targets Box */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center min-w-[120px]">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Band Ước Tính</p>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{currentBand}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-full">
                {IELTS_BAND_RANGES.find(r => currentBand >= r.minBand && currentBand < r.maxBand)?.name || 'Competent User'}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center min-w-[120px]">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Mục Tiêu</p>
              <p className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400 mt-1">{targetBand}</p>
              <span className="inline-block mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Khoảng cách: <strong className="text-slate-900 dark:text-white">+{(targetBand - currentBand).toFixed(1)} Band</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* IELTS Academic Vocabulary Direct Link Banner */}
      <Link 
        to="/app/ielts/vocabulary" 
        className="flex items-center justify-between gap-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 sm:p-6 transition-all hover:border-emerald-500/60 hover:shadow-lg group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-md group-hover:scale-105 transition-transform">
            <Brain size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Kho Từ Vựng IELTS Academic Band 7.0 - 8.5+ <Sparkles size={16} className="text-emerald-500" />
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 font-medium">
              Chuyên đề Collocations, Phrasal Verbs, Topic Vocabulary & Thuật ngữ Academic theo phương pháp Lặp lại ngắt quãng.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-black text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
          Khám Phá Ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Band Progress Scale Gauge */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-500" /> Thước Đo 9 Band Điểm IELTS (Standard Scale)
          </h2>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">Current: Band {currentBand}</span>
        </div>

        <div className="flex gap-1.5 h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5">
          {IELTS_BAND_RANGES.map((range) => {
            const isActive = currentBand >= range.minBand && currentBand < range.maxBand;
            const isPassed = currentBand >= range.maxBand;
            return (
              <div 
                key={range.id} 
                className={`flex-1 h-full rounded-full transition-all cursor-pointer ${
                  isPassed 
                    ? 'bg-emerald-500' 
                    : isActive 
                    ? 'bg-emerald-400 ring-2 ring-emerald-500/50 scale-105' 
                    : 'bg-slate-200 dark:bg-slate-700/60'
                }`}
                title={`${range.name}: Band ${range.minBand} - ${range.maxBand}`} 
              />
            );
          })}
        </div>

        <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 font-mono pt-1">
          <span>1.0 (Non User)</span>
          <span>4.0 (Limited)</span>
          <span>5.5 (Modest)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">6.5 (Competent)</span>
          <span className="text-amber-500 font-black">7.5 (Good)</span>
          <span className="text-rose-500 font-black">9.0 (Expert)</span>
        </div>
      </div>

      {/* 4 Core Skills Suite Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Target size={22} className="text-rose-500" /> 4 Phân Vùng Thi Kỹ Năng IELTS Academic
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <div 
              key={skill.name}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    {skill.icon}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${skill.badgeColor}`}>
                      Band {skill.band}
                    </span>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-end gap-1">
                      <Clock size={12} /> {skill.timeLimit}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {skill.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Dạng bài: {skill.taskTypes}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Mức độ thành thạo</span>
                    <span className="font-mono">{skill.score}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/50">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-500`}
                      style={{ width: `${skill.score}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-500" /> AI Feedback 24/7
                </span>

                <Link
                  to={skill.path}
                  className={`px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md active:translate-y-0.5 ${skill.btnColor}`}
                >
                  Vào Thi {skill.name.split(' ')[1]} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & Diagnostic Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Band History Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> Biểu Đồ Tăng Trưởng Band Điểm
            </h2>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              +1.0 Band / 30 ngày
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 font-bold text-xs" />
                <YAxis domain={[0, 9]} ticks={[0, 3, 4, 5, 6, 7, 8, 9]} stroke="currentColor" className="text-slate-400 font-bold text-xs" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--ech-surface-1, #0f172a)', border: '1px solid #334155', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="band" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weakest Skill Diagnostic Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-500" /> Kỹ Năng Cần Cải Thiện
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-black">
                Cần Tập Trung
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                {weakSkill.icon}
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white text-base">{weakSkill.name}</p>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Hiện tại: Band {weakSkill.band}</p>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              Điểm kỹ năng <strong>{weakSkill.name}</strong> đang thấp hơn các kỹ năng khác. Hãy tập trung luyện tập theo khuyến nghị của AI.
            </p>

            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Hoàn thành 1 bài luyện {weakSkill.name} mỗi ngày.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Xem lại phân tích lỗi sai trong Sổ Tay Lỗi Sai.</p>
              </div>
            </div>
          </div>

          <Link 
            to={weakSkill.path} 
            className="mt-6 w-full py-3.5 bg-rose-600 hover:bg-rose-700 border-b-4 border-rose-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-0.5"
          >
            Tập Trung Luyện {weakSkill.name.split(' ')[1]} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Cambridge Mock Exam Center */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={22} className="text-emerald-500" /> Thư Viện Đề Thi Thử IELTS Academic (Cambridge Full Mocks)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Đề thi mô phỏng định dạng thi thật trên máy tính của IDP & British Council.
            </p>
          </div>
          <Link to="/app/mock-tests" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-black flex items-center gap-1">
            Xem Tất Cả Đề Thi <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {mockTests.map((test) => (
            <div key={test.id} className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {test.type === 'full' ? 'Full Test 170m' : `${test.type.toUpperCase()} Test`}
                  </span>
                  <h4 className="font-black text-slate-900 dark:text-white text-base mt-2 line-clamp-1">{test.title}</h4>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${test.isCompleted ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {test.isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : <FileText size={18} className="text-slate-400" />}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/40 pt-3">
                <span>⏱️ {test.duration} phút</span>
                <span>Target: {test.bandTarget}</span>
              </div>

              {test.isCompleted && test.score !== undefined ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  Band Đạt Được: {test.score}
                </div>
              ) : (
                <Link 
                  to="/app/mock-tests" 
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all active:translate-y-0.5"
                >
                  Bắt Đầu Làm Bài <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
