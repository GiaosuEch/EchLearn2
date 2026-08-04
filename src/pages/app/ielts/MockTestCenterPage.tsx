import { Target, Clock, HelpCircle, ArrowRight, CheckCircle2, RotateCcw, FileText } from 'lucide-react';
import { Link } from 'react-router';
import PageShell from '../../PageShell';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { mockTests } from '../../../data/ieltsData';

function getTestPath(type: string) {
  switch (type) {
    case 'listening': return '/app/ielts/listening';
    case 'reading': return '/app/ielts/reading';
    case 'writing': return '/app/ielts/writing';
    case 'speaking': return '/app/ielts/speaking';
    default: return '/app/ielts/listening';
  }
}

export default function MockTestCenterPage() {
  return (
    <PageShell 
      title="Thư Viện Đề Thi Thử IELTS Academic (Mock Test Center)" 
      description="Luyện tập đề thi thử mô phỏng 100% định dạng đề thi thật trên máy tính của IDP & British Council" 
      icon={<Target size={20} />} 
      backTo="/app/ielts"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Information Banner */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={22} className="text-emerald-500" /> Cambridge & BC Test Benchmarks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Đề thi được biên soạn theo cấu trúc Cambridge 16-19 với đồng hồ bấm giờ chuẩn và hệ thống chấm điểm tự động.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
              <CustomEmoji name="xp-bolt" size={13} /> Chấm Điểm AI 24/7
            </span>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {mockTests.map((test) => {
            const testPath = getTestPath(test.type);
            return (
              <div 
                key={test.id} 
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {test.type === 'full' ? 'Full Test (170m)' : `${test.type.toUpperCase()} Section Test`}
                      </span>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg mt-2">{test.title}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      test.isCompleted 
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}>
                      {test.isCompleted ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1"><Clock size={14} className="text-emerald-500" /> {test.duration} phút</span>
                    <span className="flex items-center gap-1"><HelpCircle size={14} className="text-blue-500" /> {test.totalQuestions} câu hỏi</span>
                    <span className="flex items-center gap-1"><Target size={14} className="text-rose-500" /> Band {test.bandTarget}</span>
                  </div>
                </div>

                {test.isCompleted ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> Đã Hoàn Thành
                      </span>
                      {test.score !== undefined && (
                        <span className="text-xs font-black text-slate-950 bg-emerald-400 px-3 py-1 rounded-xl shadow-xs">
                          Kết quả: Band {test.score}
                        </span>
                      )}
                    </div>
                    <Link
                      to={testPath}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <RotateCcw size={14} /> Làm Lại Đề Thi Này
                    </Link>
                  </div>
                ) : (
                  <Link
                    to={testPath}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:translate-y-0.5 cursor-pointer"
                  >
                    Bắt Đầu Làm Bài Thi <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
