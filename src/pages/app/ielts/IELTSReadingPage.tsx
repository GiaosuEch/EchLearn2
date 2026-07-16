import { useState, useMemo } from 'react';
import { BookOpen, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import PageShell from '../../PageShell';
import { ieltsReadingPassages } from '../../../data/ieltsData';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';

export default function IELTSReadingPage() {
  const [passageIndex, setPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const addXP = useLearningStore(s => s.addXP);

  const passage = ieltsReadingPassages[passageIndex];

  const handleAnswer = (qId: string, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    passage.questions.forEach(q => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const correctAns = (typeof q.correctAnswer === 'string' ? q.correctAnswer : '').trim().toLowerCase();
      if (userAns === correctAns) correct++;
    });
    return correct;
  }, [submitted, passage, answers]);

  const handleSubmit = () => {
    setSubmitted(true);
    const xp = score * 10;
    if (xp > 0) addXP(xp, `IELTS Reading: ${passage.title}`);
    toast(`Score: ${score}/${passage.questions.length} — +${xp} XP`, score === passage.questions.length ? 'success' : 'warning');
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
    <PageShell title="IELTS Reading" description="Practice Academic Reading Passages" icon={<BookOpen size={20} />} backTo="/app/ielts">
      <div className="space-y-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {ieltsReadingPassages.map((p, idx) => (
            <button key={p.id} onClick={() => switchPassage(idx)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${passageIndex === idx ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'}`}>
              Passage {idx + 1}
            </button>
          ))}
        </div>

        {submitted && (
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${score === passage.questions.length ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {score === passage.questions.length ? <CheckCircle2 size={20} /> : <span className="text-lg font-bold">{score}</span>}
              </div>
              <div>
                <p className="text-white font-semibold">{score}/{passage.questions.length} correct</p>
                <p className="text-xs text-dark-400">+{score * 10} XP earned</p>
              </div>
            </div>
            <button onClick={handleReset} className="px-4 py-2 bg-dark-700 text-dark-300 hover:text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <RotateCcw size={14} /> Retry
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Passage */}
          <div className="glass-card p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-white mb-1">{passage.title}</h3>
            <p className="text-xs text-dark-500 mb-4">{passage.wordCount} words · {passage.keywords?.join(', ')}</p>
            <div className="text-sm text-dark-300 leading-relaxed space-y-4">
              {passage.text.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="glass-card p-6 max-h-[70vh] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Questions 1-{passage.questions.length}</h3>
              <span className="text-xs text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full font-bold">20 Minutes</span>
            </div>

            <div className="space-y-4 flex-1">
              {passage.questions.map((q, i) => {
                const userAns = answers[q.id] || '';
                const correctAns = typeof q.correctAnswer === 'string' ? q.correctAnswer : '';
                const isCorrect = submitted && userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
                const isWrong = submitted && !isCorrect && userAns.trim().length > 0;

                return (
                  <div key={q.id} className={`p-4 rounded-xl border transition-colors ${submitted ? (isCorrect ? 'border-green-500/30 bg-green-500/5' : isWrong ? 'border-red-500/30 bg-red-500/5' : 'border-dark-700 bg-dark-800/30') : 'border-dark-700/50 bg-dark-800/50 hover:border-dark-600'}`}>
                    <p className="text-sm text-white mb-3">
                      <span className="text-primary-400 font-bold mr-2">{i + 1}.</span>
                      {q.type && <span className="text-[10px] uppercase bg-dark-700 px-2 py-0.5 rounded-full text-dark-400 mr-2 font-semibold">{q.type}</span>}
                      {q.question}
                    </p>

                    {q.options ? (
                      <div className="space-y-2">
                        {q.options.map(opt => {
                          const selected = userAns === opt;
                          const optCorrect = submitted && opt === correctAns;
                          const optWrong = submitted && selected && opt !== correctAns;
                          return (
                            <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                              disabled={submitted}
                              className={`w-full text-left px-4 py-3 text-sm rounded-lg border transition-all flex items-center gap-2
                                ${optCorrect ? 'border-green-500 bg-green-500/10 text-green-400' :
                                  optWrong ? 'border-red-500 bg-red-500/10 text-red-400' :
                                  selected ? 'border-primary-500 bg-primary-500/10 text-primary-400' :
                                  'border-dark-800 text-dark-300 hover:text-white hover:bg-dark-700 hover:border-primary-500/50'}`}>
                              {submitted && optCorrect && <CheckCircle2 size={14} className="flex-shrink-0" />}
                              {submitted && optWrong && <XCircle size={14} className="flex-shrink-0" />}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <input type="text" value={userAns} onChange={e => handleAnswer(q.id, e.target.value)}
                          disabled={submitted}
                          placeholder="Write your answer..."
                          className={`w-full px-4 py-3 bg-dark-900 border rounded-lg text-sm text-white outline-none transition-colors placeholder:text-dark-500
                            ${submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-dark-700 focus:border-primary-500'}`} />
                        {submitted && !isCorrect && (
                          <p className="text-xs text-green-400 mt-1">Correct: {correctAns}</p>
                        )}
                      </div>
                    )}

                    {submitted && q.explanation && (
                      <p className="text-xs text-dark-400 mt-2 italic">💡 {q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-dark-700 flex gap-3">
              {!submitted ? (
                <button onClick={handleSubmit}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 active:translate-y-0">
                  Submit Answers
                </button>
              ) : passageIndex + 1 < ieltsReadingPassages.length ? (
                <button onClick={() => switchPassage(passageIndex + 1)}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
                  Next Passage <ChevronRight size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
