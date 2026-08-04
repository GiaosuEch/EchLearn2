import { useState, useMemo } from 'react';
import { BookOpen, CheckCircle2, XCircle, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';
import PageShell from '../../PageShell';
import { CustomEmoji } from '../../../components/common/CustomEmoji';
import { ieltsReadingPassages } from '../../../data/ieltsData';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';

export default function IELTSReadingPage() {
  const [passageIndex, setPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const addXP = useLearningStore((s) => s.addXP);

  const passage = ieltsReadingPassages[passageIndex];

  const handleAnswer = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    passage.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = (typeof q.correctAnswer === 'string' ? q.correctAnswer : '').trim().toLowerCase();
      if (userAns === correctAns) correct++;
    });
    return correct;
  }, [submitted, passage, answers]);

  const bandScore = useMemo(() => {
    if (!submitted) return '0.0';
    const total = passage.questions.length;
    const ratio = score / total;
    if (ratio === 1) return '9.0';
    if (ratio >= 0.83) return '8.5';
    if (ratio >= 0.66) return '7.5';
    if (ratio >= 0.5) return '6.5';
    if (ratio >= 0.33) return '5.5';
    return '4.5';
  }, [submitted, score, passage.questions.length]);

  const handleSubmit = () => {
    setSubmitted(true);
    const xp = score * 15;
    if (xp > 0) addXP(xp, `IELTS Reading: ${passage.title}`);
    toast(`Nộp bài thành công! Score: ${score}/${passage.questions.length} — Band ${bandScore}`, score === passage.questions.length ? 'success' : 'info');
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const switchPassage = (idx: number) => {
    setPassageIndex(idx);
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <PageShell
      title="IELTS Reading Practice Suite"
      description="Luyện tập đề thi IELTS Academic Reading thực tế chuẩn cấu trúc Cambridge 500+ từ"
      icon={<BookOpen size={20} />}
      backTo="/app/ielts"
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans">
        
        {/* Banner */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Cambridge Academic Suite
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Ngân Hàng Bài Đọc IELTS Academic Reading 500+ Từ
              </h2>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            Passage {passageIndex + 1} / {ieltsReadingPassages.length}
          </span>
        </div>

        {/* Passage Switcher Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ieltsReadingPassages.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => switchPassage(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer border ${
                passageIndex === idx
                  ? 'bg-emerald-500 text-slate-950 border-emerald-600 shadow-sm scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              {p.title} ({p.wordCount} words)
            </button>
          ))}
        </div>

        {/* Submitted Result Banner with Official Band Score */}
        {submitted && (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-slate-900 dark:text-white space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex flex-col items-center justify-center font-black shadow-sm">
                  <span className="text-xs uppercase tracking-tight">Band</span>
                  <span className="text-xl leading-none">{bandScore}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" /> Kết Quả Đã Được Chấm Điểm!
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                    Đúng <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{score} / {passage.questions.length}</span> câu · Thưởng <span className="font-bold text-amber-500">+{score * 15} XP</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs font-black border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw size={14} /> Làm Lại Bài Thi Này
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Split Layout */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Reading Passage Text */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Reading Passage Text
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {passage.title}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {passage.wordCount} words · Keywords: {passage.keywords?.join(', ')}
              </p>
            </div>

            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {passage.text.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-justify leading-7">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column: Questions & Answer Sheet */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col max-h-[75vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Câu hỏi 1 - {passage.questions.length}
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full font-black border border-emerald-500/20">
                20 Phút
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {passage.questions.map((q, i) => {
                const userAns = answers[q.id] || '';
                const correctAns = typeof q.correctAnswer === 'string' ? q.correctAnswer : '';
                const isCorrect = submitted && userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
                const isWrong = submitted && !isCorrect && userAns.trim().length > 0;

                const optionsList = q.options || (q.type === 'true-false-not-given' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : null);

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      submitted
                        ? isCorrect
                          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : isWrong
                          ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black mr-1.5">{i + 1}.</span>
                      {q.type && (
                        <span className="text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 mr-2">
                          {q.type}
                        </span>
                      )}
                      {q.question}
                    </p>

                    {optionsList ? (
                      <div className="space-y-2">
                        {optionsList.map((opt) => {
                          const selected = userAns === opt;
                          const optCorrect = submitted && opt.toLowerCase() === correctAns.toLowerCase();
                          const optWrong = submitted && selected && opt.toLowerCase() !== correctAns.toLowerCase();

                          return (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(q.id, opt)}
                              disabled={submitted}
                              className={`w-full text-left px-3.5 py-2.5 text-xs rounded-xl border font-bold transition-all flex items-center justify-between cursor-pointer ${
                                optCorrect
                                  ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-xs'
                                  : optWrong
                                  ? 'border-red-500 bg-red-500/20 text-red-600 dark:text-red-300'
                                  : selected
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
                              }`}
                            >
                              <span>{opt}</span>
                              {submitted && optCorrect && <CheckCircle2 size={14} className="text-slate-950" />}
                              {submitted && optWrong && <XCircle size={14} className="text-red-500" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={userAns}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          disabled={submitted}
                          placeholder="Nhập từ cần điền..."
                          className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 ${
                            submitted
                              ? isCorrect
                                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                                : 'border-red-500 ring-2 ring-red-500/20'
                              : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                        {submitted && !isCorrect && (
                          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            Đáp án đúng: {correctAns}
                          </p>
                        )}
                      </div>
                    )}

                    {submitted && q.explanation && (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5 italic bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                        <CustomEmoji name="lightbulb-tip" size={13} className="mt-0.5" />
                        <span>Giải thích: {q.explanation}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-md cursor-pointer hover:scale-[1.01]"
                >
                  Nộp Bài Thi IELTS Reading
                </button>
              ) : passageIndex + 1 < ieltsReadingPassages.length ? (
                <button
                  onClick={() => switchPassage(passageIndex + 1)}
                  className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Chuyển Sang Bài Đọc Tiếp Theo <ChevronRight size={16} />
                </button>
              ) : null}
            </div>
          </div>

        </div>

      </div>
    </PageShell>
  );
}
