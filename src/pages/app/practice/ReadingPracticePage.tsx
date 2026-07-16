// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, XCircle, ChevronRight, Zap } from 'lucide-react';
import PageShell from '../../PageShell';
import { readingLibrary, type ReadingPassage } from '../../../curriculum/readingLibrary';
import { useAppStore } from '../../../stores/appStore';
import { t13 } from '../../../i18n/phase13Text';
import { getTargetReadingPassages } from '../../../services/targetLanguageContent';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { recordPracticeAttempt } from '../../../services/practiceLearningIntegration';

type View = 'roadmap' | 'reading';
type Mode = 'normal' | 'skimming';

export default function ReadingPracticePage() {
  const [view, setView] = useState<View>('roadmap');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [activePassage, setActivePassage] = useState<ReadingPassage | null>(null);
  
  const [mode, setMode] = useState<Mode>('normal');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const addXP = useLearningStore(s => s.addXP);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const runtimePassages = useMemo(() => getTargetReadingPassages(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filtered = useMemo(() => {
    const source = runtimePassages;
    if (levelFilter === 'all') return source;
    return source.filter(p => p.level === levelFilter);
  }, [levelFilter, targetLanguage, runtimePassages]);

  const [completedPassages, setCompletedPassages] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('echlern_reading_completed');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const markComplete = (id: string) => {
    const next = new Set(completedPassages);
    next.add(id);
    setCompletedPassages(next);
    localStorage.setItem('echlern_reading_completed', JSON.stringify([...next]));
  };

  useEffect(() => {
    let timer: number;
    if (isTimerRunning && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      toast(t13(interfaceLanguage, 'timeUp'), 'warning');
      setMode('normal');
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startPassage = (passage: ReadingPassage) => {
    setActivePassage(passage);
    setQuizAnswers({});
    setSubmitted(false);
    setScore(0);
    setMode('normal');
    setIsTimerRunning(false);
    setView('reading');
  };

  const startSkimming = () => {
    if (!activePassage) return;
    setMode('skimming');
    // Give them roughly 1 second per 5 words for skimming
    setTimeLeft(Math.max(30, Math.floor(activePassage.wordCount / 5)));
    setIsTimerRunning(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (submitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitAnswers = async () => {
    if (!activePassage) return;
    setIsTimerRunning(false);
    
    let correct = 0;
    activePassage.questions.forEach(q => {
      if (quizAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    
    const xp = correct * 15;
    if (xp > 0) {
      addXP(xp, `Reading: ${activePassage.title}`);
      toast(`${t13(interfaceLanguage, 'completed')}! ${correct}/${activePassage.questions.length}. +${xp} XP`, 'success');
    } else {
      toast(interfaceLanguage === 'vi' ? 'Hoàn thành! Hãy đọc kỹ và thử lại.' : 'Completed! Try again carefully.', 'error');
    }
    markComplete(activePassage.id);
    try {
      await recordPracticeAttempt({
        targetLanguage,
        nativeLanguage: useAppStore.getState().nativeLanguage,
        interfaceLanguage,
        skillType: 'reading',
        activityId: activePassage.id,
        activityTitle: activePassage.title,
        score: correct,
        total: activePassage.questions.length,
        timeSpentSec: mode === 'skimming' ? Math.max(0, Math.floor(activePassage.wordCount / 5) - timeLeft) : 0,
        answers: activePassage.questions.map((q) => {
          const answer = quizAnswers[q.id] || '';
          return {
            itemId: `${activePassage.id}_${q.id}`,
            questionId: q.id,
            isCorrect: answer.trim().toLowerCase() === String(q.correctAnswer).toLowerCase(),
            answer,
            correctAnswer: q.correctAnswer,
          };
        }),
        metadata: { source: 'reading_practice', level: activePassage.level, topic: activePassage.topic },
      });
    } catch (error) {
      console.warn('Adaptive reading save failed', error);
    }
  };

  if (view === 'roadmap') {
    return (
      <PageShell title={t13(interfaceLanguage, 'readingPractice')} description={t13(interfaceLanguage, 'readingPracticeDesc')} icon={<BookOpen size={20} />}>
        <div className="flex flex-wrap gap-2 mb-6">
          {levels.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${levelFilter === l ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>{l === 'all' ? t13(interfaceLanguage, 'all') : l}</button>
          ))}
          <span className="ml-auto text-xs text-dark-500 self-center">{filtered.length} {t13(interfaceLanguage, 'passages')}</span>
        </div>

        <div className="space-y-3">
          {filtered.map((passage, i) => {
            const done = completedPassages.has(passage.id);
            const levelColor = passage.level.startsWith('A') ? 'text-green-400 bg-green-500/10' : passage.level.startsWith('B') ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10';
            return (
              <motion.div
                key={passage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card p-4 cursor-pointer hover:border-primary-500/30 transition-all ${done ? 'border-green-500/20' : ''}`}
                onClick={() => startPassage(passage)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-400'}`}>
                    {done ? <CheckCircle2 size={20} /> : <BookOpen size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{passage.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelColor}`}>{passage.level}</span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5 truncate">{passage.topic} • {passage.wordCount} {t13(interfaceLanguage, 'words')} • {passage.questions.length} {t13(interfaceLanguage, 'questions')}</p>
                  </div>
                  <ChevronRight size={16} className="text-dark-500 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageShell>
    );
  }

  if (view === 'reading' && activePassage) {
    return (
      <PageShell title={activePassage.title} description={`${activePassage.level} • ${activePassage.wordCount} words`} icon={<BookOpen size={20} />}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView('roadmap')} className="text-sm text-dark-400 hover:text-white flex items-center gap-1">&larr; {t13(interfaceLanguage, 'back')}</button>
          
          <div className="flex items-center gap-2">
            {mode === 'normal' && !isTimerRunning && !submitted && (
              <button onClick={startSkimming} className="text-xs bg-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-white transition-colors px-3 py-1.5 rounded-full flex items-center gap-1 font-bold">
                <Zap size={14} /> {t13(interfaceLanguage, 'startSkimming')}
              </button>
            )}
            {mode === 'skimming' && (
              <div className="flex items-center gap-2 text-xs bg-dark-800 px-3 py-1.5 rounded-full font-bold">
                <span className="text-dark-400">{t13(interfaceLanguage, 'skimmingTime')}:</span>
                <span className={`${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-primary-400'}`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* TEXT SIDE */}
          <div className="glass-card p-6 lg:sticky lg:top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-white">{activePassage.title}</h3>
            </div>
            
            <div className="text-sm text-dark-300 leading-loose">
              {activePassage.content.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4">
                  {mode === 'skimming' ? (
                    <>
                      {/* Show only the first sentence clearly, blur the rest */}
                      <span className="bg-primary-500/10 text-white rounded px-1">{para.split('. ')[0] + (para.includes('. ') ? '.' : '')}</span>{' '}
                      <span className="text-dark-600 blur-[2px] transition-all">{para.split('. ').slice(1).join('. ')}</span>
                    </>
                  ) : (
                    para
                  )}
                </p>
              ))}
            </div>


            {activePassage.mediaResources && activePassage.mediaResources.length > 0 && mode === 'normal' && (
              <div className="mt-8 pt-6 border-t border-dark-700">
                <p className="text-xs text-dark-400 font-bold uppercase mb-3">{interfaceLanguage === 'vi' ? 'Video ví dụ' : 'Example videos'}</p>
                <div className="flex flex-wrap gap-2">
                  {activePassage.mediaResources.map((resource: any, idx: number) => (
                    <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs bg-dark-800 hover:bg-dark-700 text-primary-300 px-3 py-2 rounded-lg border border-dark-700">
                      {interfaceLanguage === 'vi' ? 'Mở tìm kiếm YouTube' : 'Open YouTube search'} #{idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}


            {activePassage.vocabularyHighlights && activePassage.vocabularyHighlights.length > 0 && mode === 'normal' && (
              <div className="mt-8 pt-6 border-t border-dark-700">
                <p className="text-xs text-dark-400 font-bold uppercase mb-3">{t13(interfaceLanguage, 'keyVocabulary')}</p>
                <div className="flex flex-wrap gap-2">
                  {activePassage.vocabularyHighlights.map(word => (
                    <span key={word} className="text-xs bg-dark-800 text-dark-300 px-2 py-1 rounded-md border border-dark-700">{word}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QUESTIONS SIDE */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{t13(interfaceLanguage, 'questions')}</h3>
                {submitted && (
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${score === activePassage.questions.length ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {t13(interfaceLanguage, 'score')}: {score}/{activePassage.questions.length}
                  </span>
                )}
              </div>

              <div className="space-y-8">
                {activePassage.questions.map((q, idx) => {
                  return (
                    <div key={q.id} className="space-y-3">
                      <p className="text-sm text-white font-medium"><span className="text-primary-400 mr-2">{idx + 1}.</span> {q.question}</p>
                      
                      {q.type === 'multiple_choice' || q.type === 'true_false' ? (
                        <div className="space-y-2">
                          {q.options?.map(opt => {
                            let cls = 'border-dark-700 bg-dark-800/50 hover:border-primary-500/50 text-dark-300';
                            if (quizAnswers[q.id] === opt) cls = 'border-primary-500 bg-primary-500/10 text-primary-400';
                            
                            if (submitted) {
                              if (opt === q.correctAnswer) cls = 'border-green-500 bg-green-500/10 text-green-400';
                              else if (quizAnswers[q.id] === opt) cls = 'border-red-500 bg-red-500/10 text-red-400';
                              else cls = 'border-dark-700 bg-dark-900/50 text-dark-500 opacity-50';
                            }
                            
                            return (
                              <button
                                key={opt}
                                disabled={submitted}
                                onClick={() => handleAnswerChange(q.id, opt)}
                                className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-all flex items-center gap-3 ${cls}`}
                              >
                                {submitted && opt === q.correctAnswer && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
                                {submitted && quizAnswers[q.id] === opt && opt !== q.correctAnswer && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {submitted && (
                        <div className="p-3 bg-dark-800/50 rounded-lg border border-dark-700 text-sm mt-2">
                          <p className="text-dark-300"><span className="text-white font-semibold">{t13(interfaceLanguage, 'correctAnswer')}:</span> {q.correctAnswer}</p>
                          <p className="text-dark-400 mt-1">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!submitted ? (
                <button
                  onClick={submitAnswers}
                  disabled={Object.keys(quizAnswers).length < activePassage.questions.length}
                  className="mt-8 w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                >
                  {t13(interfaceLanguage, 'submitAnswers')}
                </button>
              ) : (
                <button
                  onClick={() => setView('roadmap')}
                  className="mt-8 w-full py-4 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  <BookOpen size={16} /> Continue to Next Passage
                </button>
              )}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={t13(interfaceLanguage, 'readingPractice')} description={t13(interfaceLanguage, 'chooseTask')} icon={<BookOpen size={20} />}>
      <div className="glass-card p-6 text-center">
        <p className="text-dark-300">{interfaceLanguage === 'vi' ? 'Trạng thái luyện đọc chưa sẵn sàng. Hãy quay lại danh sách bài đọc.' : 'Reading state is not ready. Please return to the reading passage list.'}</p>
        <button onClick={() => setView('roadmap')} className="mt-4 px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold">{interfaceLanguage === 'vi' ? 'Quay lại danh sách' : 'Back to passages'}</button>
      </div>
    </PageShell>
  );
}
