import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookX, BarChart3, FileText, Send, Sparkles, ChevronRight, History, Trophy, AlertTriangle, Plus } from 'lucide-react';
import PageShell from '../../PageShell';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { WRITING_TASKS_DB, type IELTSWritingTask } from '../../../data/ielts/WritingTasksDB';
import { calculateBandScore, type IELTSFeedback } from '../../../domain/ielts/ScoringEngine';
import { useLearnerMemoryStore } from '../../../stores/learnerMemoryStore';
import { useMistakeNotebookStore } from '../../../stores/mistakeNotebookStore';
import { useAuthStore } from '../../../stores/authStore';

export default function IELTSWritingMasterPage() {
  const addXP = useLearningStore(s => s.addXP);
  const user = useAuthStore((s) => s.user);
  const { writingSubmissions, addSubmission, getAverageBandScore, getRecommendedLessons } = useLearnerMemoryStore();
  const { addMistake } = useMistakeNotebookStore();

  const [activeTab, setActiveTab] = useState<'task1' | 'task2' | 'history'>('task1');
  
  const task1Prompts = useMemo(() => WRITING_TASKS_DB.filter(t => t.type === 'Task 1'), []);
  const task2Prompts = useMemo(() => WRITING_TASKS_DB.filter(t => t.type === 'Task 2'), []);

  const [activePrompt, setActivePrompt] = useState<IELTSWritingTask>(task1Prompts[0]);
  const [userEssay, setUserEssay] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<IELTSFeedback | null>(null);

  // Switch active prompt when changing tabs
  useEffect(() => {
    if (activeTab === 'task1') {
      setActivePrompt(task1Prompts[0]);
    } else if (activeTab === 'task2') {
      setActivePrompt(task2Prompts[0]);
    }
    setUserEssay('');
    setFeedback(null);
  }, [activeTab, task1Prompts, task2Prompts]);

  const handleEvaluateEssay = () => {
    const wordCount = userEssay.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      toast('Please write at least 10 words to receive an evaluation.', 'error');
      return;
    }

    setIsEvaluating(true);
    setFeedback(null);

    // Simulate network delay for UX
    setTimeout(() => {
      setIsEvaluating(false);
      
      const result = calculateBandScore(userEssay, activePrompt.type, activePrompt.expectedWordCount);
      setFeedback(result);
      
      addSubmission(user?.id || 'anonymous', {
        taskId: activePrompt.id,
        text: userEssay,
        metrics: {
          wordCount,
          uniqueWordCount: new Set(userEssay.toLowerCase().match(/\b\w+\b/g)).size,
          averageSentenceLength: 0,
          transitionWordDensity: 0,
          academicVocabularyRatio: 0,
          complexSentenceRatio: 0
        },
        feedback: result
      });

      addXP(100, `IELTS Writing Practice: ${activePrompt.id} (Band ${result.band})`);
      toast(`Bài viết đã được chấm: Band ${result.band}`, 'success');
    }, 1200);
  };

  const handleSaveToNotebook = (title: string, data: { score: number; feedback: string[] }) => {
    if (!user) {
        toast('Vui lòng đăng nhập để sử dụng tính năng Sổ Tay', 'error');
        return;
    }
    addMistake({
      userId: user.id,
      type: 'Writing',
      mistake: `IELTS Writing Error (${title})`,
      correction: 'Follow AI suggestions to improve this specific criteria.',
      notes: data.feedback.join(' | ')
    });
    toast('Đã lưu vào Sổ Tay Lỗi Sai!', 'success');
  };

  const renderFeedbackCriteria = (label: string, data: { score: number, feedback: string[] }) => (
    <div className={`p-4 rounded-xl border ${data.score < 6.5 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'} space-y-2`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label}</h4>
        <span className={`px-2 py-1 rounded-md font-black text-xs border ${data.score < 6.5 ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30'}`}>
          Band {data.score.toFixed(1)}
        </span>
      </div>
      <ul className="space-y-1">
        {data.feedback.map((fb, i) => (
          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
            <ChevronRight size={14} className="shrink-0 text-amber-500 mt-0.5" />
            <span className="leading-relaxed">{fb}</span>
          </li>
        ))}
      </ul>
      {data.score < 6.5 && (
        <button
          onClick={() => handleSaveToNotebook(label, data)}
          className="mt-3 w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Ghi chú điểm yếu này
        </button>
      )}
    </div>
  );

  return (
    <PageShell
      title="Đấu Trường Luyện Viết IELTS Academic (Writing Master Suite)"
      description="Luyện viết Task 1 & Task 2 kèm AI chấm điểm thuật toán chuẩn xác dựa trên Band Descriptors thực tế."
      icon={<BookX size={20} className="text-amber-400" />}
    >
      <div className="max-w-5xl mx-auto space-y-6 font-mono">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {(['task1', 'task2', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'task1' ? <><BarChart3 size={14} /> Writing Task 1</> :
               tab === 'task2' ? <><FileText size={14} /> Writing Task 2</> :
               <><History size={14} /> Lịch Sử & Phân Tích</>}
            </button>
          ))}
        </div>

        {/* Task 1 / Task 2 Workspace */}
        {(activeTab === 'task1' || activeTab === 'task2') && (
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left Column: Prompts List */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh Sách Đề Bài</h3>
              <div className="space-y-3">
                {(activeTab === 'task1' ? task1Prompts : task2Prompts).map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePrompt(p);
                      setFeedback(null);
                      setUserEssay('');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                      activePrompt?.id === p.id
                        ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {p.chartImageUrl && (
                      <img src={p.chartImageUrl} alt={p.titleVi} className="w-16 h-16 rounded-lg object-cover border border-slate-800 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">{p.category}</span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.titleVi}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Editor & Feedback */}
            <div className="lg:col-span-8 space-y-4">
              <div className="glass-card p-6 border-2 border-amber-500/30 bg-white dark:bg-slate-950 rounded-3xl space-y-4 shadow-xl">
                {/* Prompt Details */}
                <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase border border-amber-500/30">
                      {activePrompt.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase border border-purple-500/30">
                      Mục Tiêu: {activePrompt.targetBand}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{activePrompt.titleVi}</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{activePrompt.promptDescriptionEn}"
                  </p>
                </div>

                {/* Editor */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                    <span>Bài Làm Của Bạn:</span>
                    <span className={userEssay.trim().split(/\s+/).filter(Boolean).length >= activePrompt.expectedWordCount ? 'text-emerald-500' : 'text-amber-500'}>
                      {userEssay.trim().split(/\s+/).filter(Boolean).length} / {activePrompt.expectedWordCount} từ tối thiểu
                    </span>
                  </div>
                  <textarea
                    value={userEssay}
                    onChange={e => setUserEssay(e.target.value)}
                    placeholder="Bắt đầu viết tại đây..."
                    className="w-full h-64 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-amber-500 transition-all font-mono leading-relaxed resize-none shadow-inner"
                  />
                </div>

                {/* Action Buttons */}
                <button
                  onClick={handleEvaluateEssay}
                  disabled={isEvaluating}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Send size={18} />
                  <span>{isEvaluating ? 'HỆ THỐNG ĐANG PHÂN TÍCH (AI SCORING)...' : 'CHẤM ĐIỂM BÀI VIẾT'}</span>
                </button>
              </div>

              {/* Feedback Dashboard */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border-2 border-emerald-500/30 bg-white dark:bg-slate-950 rounded-3xl shadow-xl space-y-6"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-800 pb-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/40 border-4 border-slate-950 shrink-0">
                        <span className="text-3xl font-black">{feedback.band.toFixed(1)}</span>
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <h3 className="text-xl font-black text-emerald-400">Đánh Giá Tổng Quan</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {feedback.overallFeedback}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {renderFeedbackCriteria('Task Achievement (TA)', feedback.criteria.ta)}
                      {renderFeedbackCriteria('Coherence & Cohesion (CC)', feedback.criteria.cc)}
                      {renderFeedbackCriteria('Lexical Resource (LR)', feedback.criteria.lr)}
                      {renderFeedbackCriteria('Grammatical Range (GRA)', feedback.criteria.gra)}
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2"><Sparkles size={14}/> Bài Mẫu Tham Khảo (Band 9.0)</h4>
                      <p className="text-sm text-slate-300 italic leading-relaxed">
                        {activePrompt.modelAnswerBand9}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2 shadow-lg">
                <span className="text-slate-400 font-bold text-xs uppercase">Điểm Trung Bình</span>
                <div className="text-4xl font-black text-amber-400">{getAverageBandScore().toFixed(1)}</div>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2 shadow-lg">
                <span className="text-slate-400 font-bold text-xs uppercase">Tổng Bài Đã Nộp</span>
                <div className="text-4xl font-black text-emerald-400">{writingSubmissions.length}</div>
              </div>
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/50 text-center space-y-2 shadow-lg shadow-amber-500/20 text-slate-950">
                <span className="font-bold text-xs uppercase flex justify-center items-center gap-1"><Trophy size={14}/> Mục Tiêu Kế Tiếp</span>
                <div className="text-2xl font-black">Band {(getAverageBandScore() + 0.5).toFixed(1)}</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Khuyến Nghị Học Tập (Data-Driven)
              </h3>
              <p className="text-xs text-slate-500">Dựa trên phân tích các lỗi thường gặp trong 3 bài viết gần nhất của bạn:</p>
              <div className="flex flex-wrap gap-2">
                {getRecommendedLessons().map((rec, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                    {rec}
                  </span>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Lịch Sử Bài Viết</h3>
              {writingSubmissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-bold text-sm bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  Bạn chưa nộp bài viết nào. Hãy luyện tập để hệ thống có dữ liệu phân tích!
                </div>
              ) : (
                <div className="space-y-3">
                  {[...writingSubmissions].reverse().map(sub => (
                    <div key={sub.id} className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold">{new Date(sub.timestamp).toLocaleString('vi-VN')}</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Bài nộp: {WRITING_TASKS_DB.find(t => t.id === sub.taskId)?.titleVi || sub.taskId}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sub.text}</p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/30 flex items-center gap-2 shrink-0">
                        Band {sub.feedback.band.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}
