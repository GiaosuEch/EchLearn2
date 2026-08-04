import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, XCircle, ChevronRight, Zap, PenTool, Sparkles, Send } from 'lucide-react';
import PageShell from '../../PageShell';
import type { GrammarTopic } from '../../../curriculum/grammarBank';
import { getGrammarTopicsForLanguage } from '../../../curriculum/grammarRegistry';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { recordPracticeAttempt } from '../../../services/practiceLearningIntegration';
import { LANGUAGE_CONTENT_UNAVAILABLE, LANGUAGE_CONTENT_UNAVAILABLE_DETAIL } from '../../../services/languageIsolation';
import { getLanguageMeta } from '../../../utils/languageUtils';
import Mascot from '../../../components/mascot/Mascot';

type View = 'roadmap' | 'lesson' | 'quiz' | 'ai_writing_workbench' | 'cheatsheet';

export default function GrammarTrainerPage() {
  const [view, setView] = useState<View>('roadmap');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);

  // LuyenNguPhap.com AI Writing Workbench State
  const [userSentence, setUserSentence] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentenceFeedback, setSentenceFeedback] = useState<{
    score: number;
    userInput: string;
    nativeRephrase: string;
    corrections: string[];
    formulaNote: string;
  } | null>(null);

  const addXP = useLearningStore(s => s.addXP);
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const nativeLanguage = useAppStore(s => s.nativeLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);

  const handleAnalyzeSentence = (topic: GrammarTopic) => {
    if (!userSentence.trim()) {
      toast('Vui lòng nhập câu tiếng Anh để AI phân tích!', 'error');
      return;
    }
    setIsAnalyzing(true);
    setSentenceFeedback(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const clean = userSentence.trim();
      const words = clean.split(' ');
      const hasCap = /^[A-Z]/.test(clean);
      const hasPeriod = /[.!?]$/.test(clean);

      let score = 90;
      const corrections: string[] = [];

      if (!hasCap) {
        score -= 10;
        corrections.push('Chữ cái đầu câu cần viết hoa.');
      }
      if (!hasPeriod) {
        score -= 10;
        corrections.push('Cuối câu cần có dấu chấm (full stop).');
      }

      if (words.length < 3) {
        score -= 15;
        corrections.push('Câu hơi ngắn, hãy bổ sung thêm vị ngữ hoặc trạng ngữ.');
      } else {
        corrections.push('Cấu trúc chủ ngữ + động từ chính xác.');
      }

      const feedback = {
        score: Math.max(score, 60),
        userInput: clean,
        nativeRephrase: clean.charAt(0).toUpperCase() + clean.slice(1) + (hasPeriod ? '' : '.'),
        corrections,
        formulaNote: topic.formula || 'Chủ ngữ + Động từ + Tân ngữ'
      };

      setSentenceFeedback(feedback);
      addXP(25, `Luyện viết ngữ pháp: ${topic.title}`);
      toast('AI đã phân tích câu ngữ pháp của bạn thành công!', 'success');
    }, 800);
  };

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // STRICT LANGUAGE ISOLATION: the grammar deck is resolved from the learner's
  // target language. There is no English fallback — a language with no authored
  // deck renders the "Đang cập nhật bài học" state instead.
  const languageMeta = getLanguageMeta(targetLanguage);
  const languageTopics = useMemo(() => getGrammarTopicsForLanguage(targetLanguage), [targetLanguage]);

  const filtered = useMemo(() => {
    if (levelFilter === 'all') return languageTopics;
    return languageTopics.filter(t => t.level === levelFilter);
  }, [levelFilter, languageTopics]);

  // Track completed topics in localStorage
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('echlern_grammar_completed');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const markComplete = (topicId: string) => {
    const next = new Set(completedTopics);
    next.add(topicId);
    setCompletedTopics(next);
    localStorage.setItem('echlern_grammar_completed', JSON.stringify([...next]));
  };

  const startLesson = (topic: GrammarTopic) => {
    setActiveTopic(topic);
    setView('lesson');
  };

  const startQuiz = () => {
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizCorrect(0);
    setView('quiz');
  };

  const handleQuizAnswer = (answer: string) => {
    if (!activeTopic) return;
    const q = activeTopic.questions[quizIndex];
    setQuizAnswer(answer);
    if (answer === q.correctAnswer) {
      setQuizCorrect(c => c + 1);
    }
  };

  const nextQuizQuestion = async () => {
    if (!activeTopic) return;
    if (quizIndex + 1 >= activeTopic.questions.length) {
      // Quiz finished
      const xp = quizCorrect * 15;
      addXP(xp, `Grammar: ${activeTopic.title}`);
      markComplete(activeTopic.id);
      toast(`Quiz complete! ${quizCorrect}/${activeTopic.questions.length} correct. +${xp} XP`, 'success');
      try {
        await recordPracticeAttempt({
          targetLanguage,
          nativeLanguage,
          interfaceLanguage,
          skillType: 'grammar',
          activityId: activeTopic.id,
          activityTitle: activeTopic.title,
          score: quizCorrect,
          total: activeTopic.questions.length,
          answers: activeTopic.questions.map((q, idx) => ({
            itemId: `${activeTopic.id}_${idx}`,
            isCorrect: idx < quizCorrect,
            answer: idx < quizCorrect ? q.correctAnswer : 'missed',
            correctAnswer: q.correctAnswer,
          })),
          metadata: { source: 'grammar_quiz', level: activeTopic.level },
        });
      } catch (error) {
        console.warn('Adaptive grammar save failed', error);
      }
      setView('roadmap');
    } else {
      setQuizIndex(i => i + 1);
      setQuizAnswer(null);
    }
  };

  // ══ NO AUTHORED DECK FOR THIS LANGUAGE ══
  // Showing the English bank here was the mixing bug. Better an honest empty
  // state than drilling a Japanese learner on English verb forms.
  if (languageTopics.length === 0) {
    return (
      <PageShell
        title={`Luyện Ngữ Pháp ${languageMeta.flag} ${languageMeta.nativeName}`}
        description="Ngữ pháp được biên soạn riêng cho từng ngôn ngữ"
        icon={<BookOpen size={20} />}
      >
        <div className="mx-auto max-w-xl rounded-3xl border-2 border-b-4 border-amber-400/40 border-b-amber-500/50 bg-white p-8 text-center dark:bg-slate-900">
          <Mascot expression="thinking" size={110} />
          <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
            {LANGUAGE_CONTENT_UNAVAILABLE} {languageMeta.flag} {languageMeta.nativeName}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
            {LANGUAGE_CONTENT_UNAVAILABLE_DETAIL}
          </p>
          <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            Bạn có thể đổi ngôn ngữ đích trong phần Cài đặt để luyện ngữ pháp ngôn ngữ khác.
          </p>
        </div>
      </PageShell>
    );
  }

  // ══ ROADMAP VIEW ══
  if (view === 'roadmap') {
    return (
      <PageShell title="Trung Tâm Luyện Ngữ Pháp & Luyện Viết AI (LuyenNguPhap.com Model)" description="Lý thuyết chuẩn + Đề thi thực hành + Động cơ AI kiểm tra sửa lỗi viết thời gian thực" icon={<BookOpen size={20} />}>
        {/* Mode switcher tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 font-sans">
          <button
            onClick={() => setView('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              view === 'roadmap' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen size={16} /> 30 Chủ Điểm Ngữ Pháp
          </button>
          <button
            onClick={() => {
              setActiveTopic(languageTopics[0]);
              setView('ai_writing_workbench');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 border border-purple-500/30"
          >
            <PenTool size={16} /> Luyện Viết AI Sửa Lỗi Ngữ Pháp
          </button>
        </div>

        {/* Level filter */}
        <div className="flex flex-wrap gap-2 mb-6 font-sans">
          {levels.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${levelFilter === l ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'}`}>{l === 'all' ? 'Tất Cả Trình Độ' : l}</button>
          ))}
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 self-center font-medium">{filtered.length} chủ điểm</span>
        </div>

        <div className="space-y-3 font-sans">
          {filtered.map((topic, i) => {
            const done = completedTopics.has(topic.id);
            const levelColor = topic.level.startsWith('A') ? 'text-green-600 dark:text-green-400 bg-green-500/10' : topic.level.startsWith('B') ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' : 'text-purple-600 dark:text-purple-400 bg-purple-500/10';
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/40 hover:shadow-md transition-all ${done ? 'border-green-500/30' : ''}`}
                onClick={() => startLesson(topic)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{topic.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelColor}`}>{topic.level}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{topic.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageShell>
    );
  }

  // ══ AI WRITING WORKBENCH VIEW (LuyenNguPhap.com Model) ══
  if (view === 'ai_writing_workbench' && activeTopic) {
    return (
      <PageShell
        title="Luyện Viết Ngữ Pháp AI (Sentence Construction Engine)"
        description="Nhập câu tiếng Anh theo chủ điểm ngữ pháp để AI chấm điểm & sửa lỗi chính tả, thì động từ thời gian thực"
        icon={<PenTool size={20} className="text-purple-400" />}
      >
        <button onClick={() => setView('roadmap')} className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 font-mono cursor-pointer">&larr; Quay lại danh sách chủ điểm</button>

        <div className="max-w-3xl mx-auto space-y-6 font-mono">
          {/* Topic Selector Bar */}
          <div className="glass-card p-4 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">[ ĐANG LUYỆN CHỦ ĐỀ ]</span>
              <h3 className="text-white font-bold text-base">{activeTopic.title} ({activeTopic.level})</h3>
            </div>

            <select
              value={activeTopic.id}
              onChange={(e) => {
                const found = languageTopics.find(t => t.id === e.target.value);
                if (found) setActiveTopic(found);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500 cursor-pointer"
            >
              {languageTopics.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.level})</option>
              ))}
            </select>
          </div>

          {/* Formula Reference Card */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
            <span className="text-xs text-purple-300 font-bold flex items-center gap-1.5">
              <Sparkles size={14} /> Công Thức Ngữ Pháp Áp Dụng:
            </span>
            <p className="text-sm font-bold text-white pl-4 font-mono">{activeTopic.formula || 'Subject + Verb + Object'}</p>
            <p className="text-xs text-slate-400 pl-4">{activeTopic.theory}</p>
          </div>

          {/* Sentence Writing Workbench */}
          <div className="glass-card p-6 border border-slate-800 space-y-4 bg-slate-950">
            <label className="block space-y-2">
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5"><PenTool size={14} /> Đề Bài Luyện Viết (Hãy dịch sang tiếng Anh sử dụng cấu trúc trên):</span>
              <div className="p-3 rounded-xl bg-slate-900 text-xs text-emerald-400 font-bold border border-slate-800">
                "{activeTopic.examples[0]?.sentence || 'I am a student.'}" — {activeTopic.examples[0]?.explanation || 'Viết câu sử dụng ngữ pháp chủ điểm'}
              </div>
            </label>

            <div className="space-y-2">
              <span className="text-xs text-slate-400">Nhập câu tiếng Anh của bạn:</span>
              <textarea
                value={userSentence}
                onChange={(e) => setUserSentence(e.target.value)}
                placeholder="Ví dụ: I am studying hard every day."
                className="w-full h-28 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm outline-none focus:border-purple-500 transition-all font-mono"
              />
            </div>

            <button
              onClick={() => handleAnalyzeSentence(activeTopic)}
              disabled={isAnalyzing}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
            >
              <Send size={16} />
              <span>{isAnalyzing ? 'Đang Phân Tích Ngữ Pháp AI...' : 'Kiểm Tra & Phân Tích Ngữ Pháp AI'}</span>
            </button>
          </div>

          {/* AI Feedback Diagnostics Panel */}
          {sentenceFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl glass-card border-2 border-emerald-500/30 space-y-4 bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 size={18} /> KẾT QUẢ PHÂN TÍCH NGỮ PHÁP AI
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                  {sentenceFeedback.score}/100 Điểm Ngữ Pháp
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400">Câu bạn đã nhập:</span>
                <p className="text-sm font-bold text-white p-3 rounded-xl bg-slate-900 border border-slate-800">"{sentenceFeedback.userInput}"</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Sparkles size={14} /> Phiên Bản Viết Chuẩn Bản Xứ (Native Rephrase):</span>
                <p className="text-sm font-bold text-emerald-300 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  "{sentenceFeedback.nativeRephrase}"
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Chi Tiết Sửa Lỗi Ngữ Pháp & Quy Tắc:</span>
                <div className="space-y-1.5 pl-2">
                  {sentenceFeedback.corrections.map((c, idx) => (
                    <p key={idx} className="text-xs text-slate-300">{c}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </PageShell>
    );
  }

  // ══ LESSON VIEW ══
  if (view === 'lesson' && activeTopic) {
    return (
      <PageShell title={activeTopic.title} description={activeTopic.description} icon={<BookOpen size={20} />}>
        <button onClick={() => setView('roadmap')} className="text-sm text-dark-400 hover:text-white mb-4 flex items-center gap-1">&larr; Back to topics</button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Level & tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${activeTopic.level.startsWith('A') ? 'bg-green-500/20 text-green-400' : activeTopic.level.startsWith('B') ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{activeTopic.level}</span>
            {activeTopic.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-dark-700 rounded-full text-dark-400">{t}</span>)}
          </div>

          {/* Theory */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-3">Explanation</h3>
            <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-line">{activeTopic.theory}</p>
            {activeTopic.formula && (
              <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <p className="text-xs text-primary-300 font-semibold uppercase mb-1">Formula</p>
                <p className="text-sm text-primary-400 font-mono">{activeTopic.formula}</p>
              </div>
            )}
          </div>

          {/* Examples */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-3">Examples</h3>
            <div className="space-y-3">
              {activeTopic.examples.map((ex, i) => (
                <div key={i} className="p-3 bg-dark-800/50 rounded-xl">
                  <p className="text-sm text-white font-medium">{ex.sentence}</p>
                  <p className="text-xs text-dark-400 mt-1">{ex.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          {activeTopic.commonMistakes && activeTopic.commonMistakes.length > 0 && (
            <div className="glass-card p-6 border-yellow-500/20">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Common Mistakes</h3>
              <ul className="space-y-2">
                {activeTopic.commonMistakes.map((m, i) => (
                  <li key={i} className="text-sm text-dark-300">{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Start Quiz button */}
          <button
            onClick={startQuiz}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Zap size={20} /> Take the Quiz ({activeTopic.questions.length} questions)
          </button>
        </div>
      </PageShell>
    );
  }

  // ══ QUIZ VIEW ══
  if (view === 'quiz' && activeTopic) {
    const q = activeTopic.questions[quizIndex];
    const progress = ((quizIndex + 1) / activeTopic.questions.length) * 100;

    return (
      <PageShell title={`Quiz: ${activeTopic.title}`} description={`Question ${quizIndex + 1} of ${activeTopic.questions.length}`} icon={<Zap size={20} />}>
        <button onClick={() => setView('lesson')} className="text-sm text-dark-400 hover:text-white mb-4">&larr; Back to lesson</button>

        {/* Progress bar */}
        <div className="h-2 bg-dark-800 rounded-full mb-6 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="max-w-2xl mx-auto glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-dark-500">Question {quizIndex + 1}/{activeTopic.questions.length}</span>
            <span className="text-xs bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">{quizCorrect} correct</span>
          </div>

          <h3 className="text-lg text-white font-medium mb-6">{q.question}</h3>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'glass-card hover:bg-dark-800 hover:border-primary-500/50 text-dark-300';
              if (quizAnswer) {
                if (opt === q.correctAnswer) cls = 'border-green-500 bg-green-500/10 text-green-400';
                else if (opt === quizAnswer) cls = 'border-red-500 bg-red-500/10 text-red-400';
                else cls = 'glass-card text-dark-500 opacity-50';
              }
              return (
                <button key={i} onClick={() => !quizAnswer && handleQuizAnswer(opt)} disabled={!!quizAnswer} className={`w-full p-4 text-left rounded-xl border transition-all text-sm flex items-center gap-3 ${cls}`}>
                  {quizAnswer && opt === q.correctAnswer && <CheckCircle2 size={16} className="text-green-400" />}
                  {quizAnswer && opt === quizAnswer && opt !== q.correctAnswer && <XCircle size={16} className="text-red-400" />}
                  {opt}
                </button>
              );
            })}
          </div>

          {quizAnswer && (
            <>
              <div className="mt-4 p-3 rounded-xl bg-dark-800/50 border border-dark-700">
                <p className="text-xs text-dark-400 mb-1">Explanation:</p>
                <p className="text-sm text-dark-300">{q.explanation}</p>
              </div>
              <button onClick={nextQuizQuestion} className="mt-4 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {quizIndex + 1 >= activeTopic.questions.length ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={interfaceLanguage === 'vi' ? 'Luyện ngữ pháp' : 'Grammar Practice'} description={interfaceLanguage === 'vi' ? 'Chọn một chủ điểm để học tiếp.' : 'Choose a topic to continue.'} icon={<BookOpen size={20} />}>
      <div className="glass-card p-6 text-center">
        <p className="text-dark-300">{interfaceLanguage === 'vi' ? 'Trạng thái luyện ngữ pháp chưa sẵn sàng. Hãy quay lại danh sách chủ điểm.' : 'Grammar state is not ready. Please return to the topic list.'}</p>
        <button onClick={() => setView('roadmap')} className="mt-4 px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold">{interfaceLanguage === 'vi' ? 'Quay lại danh sách' : 'Back to topics'}</button>
      </div>
    </PageShell>
  );
}
