import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Headphones, CheckCircle2, XCircle, ChevronRight, Play, Pause, Square, Volume2 } from 'lucide-react';
import PageShell from '../../PageShell';
import { type ListeningTask } from '../../../curriculum/listeningLibrary';
import { useAppStore } from '../../../stores/appStore';
import { t13 } from '../../../i18n/phase13Text';
import { getTargetListeningTasks } from '../../../services/targetLanguageContent';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { recordPracticeAttempt } from '../../../services/practiceLearningIntegration';
import { VirtualLanguageKeyboard } from '../../../components/ui/VirtualLanguageKeyboard';
import { getPhoneticInfo } from '../../../services/phoneticService';
import { Keyboard } from 'lucide-react';

type View = 'roadmap' | 'task';
const TASKS_PER_PAGE = 12;

export default function ListeningPracticePage() {
  const [view, setView] = useState<View>('roadmap');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTask, setActiveTask] = useState<ListeningTask | null>(null);
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [activeKeyboardQId, setActiveKeyboardQId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const addXP = useLearningStore(s => s.addXP);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const runtimeTasks = useMemo(() => getTargetListeningTasks(targetLanguage, interfaceLanguage), [targetLanguage, interfaceLanguage]);
  const { speak, isSpeaking, stop } = useTextToSpeech();

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filtered = useMemo(() => {
    const source = runtimeTasks;
    if (levelFilter === 'all') return source;
    return source.filter(t => t.level === levelFilter);
  }, [levelFilter, runtimeTasks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / TASKS_PER_PAGE));
  const pageIndex = Math.min(currentPage, totalPages - 1);
  const pageStart = pageIndex * TASKS_PER_PAGE;
  const visibleTasks = filtered.slice(pageStart, pageStart + TASKS_PER_PAGE);

  useEffect(() => {
    const isListeningTaskActive = view === 'task' && Boolean(activeTask);
    window.dispatchEvent(new CustomEvent('echlern:listening-task-activity', {
      detail: { active: isListeningTaskActive },
    }));

    return () => {
      if (isListeningTaskActive) {
        window.dispatchEvent(new CustomEvent('echlern:listening-task-activity', {
          detail: { active: false },
        }));
      }
    };
  }, [view, activeTask]);

  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('echlern_listening_completed');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const markComplete = (taskId: string) => {
    const next = new Set(completedTasks);
    next.add(taskId);
    setCompletedTasks(next);
    localStorage.setItem('echlern_listening_completed', JSON.stringify([...next]));
  };

  const startTask = (task: ListeningTask) => {
    stop();
    setActiveTask(task);
    setQuizAnswers({});
    setSubmitted(false);
    setScore(0);
    setView('task');
  };

  const backToRoadmap = () => {
    stop();
    setView('roadmap');
    setActiveTask(null);
  };

  const togglePlayback = () => {
    if (!activeTask) return;
    if (isSpeaking) {
      stop();
    } else {
      // Read the verified task transcript through browser text-to-speech.
      speak(activeTask.transcript || t13(interfaceLanguage, 'tapToPlay'), targetLanguage);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (submitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitAnswers = async () => {
    if (!activeTask) return;
    stop();
    let correct = 0;
    activeTask.questions.forEach(q => {
      if (quizAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    
    const xp = correct * 20;
    if (xp > 0) {
      addXP(xp, `Listening: ${activeTask.title}`);
      toast(`${t13(interfaceLanguage, 'completed')}! ${correct}/${activeTask.questions.length} ${t13(interfaceLanguage, 'correctAnswer')}. +${xp} XP`, 'success');
    } else {
      toast(interfaceLanguage === 'vi' ? 'Hoàn thành! Hãy xem lại bản chép lời và thử lại.' : 'Completed! Review the transcript and try again.', 'warning');
    }
    markComplete(activeTask.id);
    try {
      await recordPracticeAttempt({
        targetLanguage,
        nativeLanguage: useAppStore.getState().nativeLanguage,
        interfaceLanguage,
        skillType: 'listening',
        activityId: activeTask.id,
        activityTitle: activeTask.title,
        score: correct,
        total: activeTask.questions.length,
        answers: activeTask.questions.map((q) => {
          const answer = quizAnswers[q.id] || '';
          return {
            itemId: `${activeTask.id}_${q.id}`,
            questionId: q.id,
            isCorrect: answer.trim().toLowerCase() === String(q.correctAnswer).toLowerCase(),
            answer,
            correctAnswer: q.correctAnswer,
            audioReplay: true,
          };
        }),
        metadata: { source: 'listening_practice', level: activeTask.level },
      });
    } catch (error) {
      console.warn('Adaptive listening save failed', error);
    }
  };

  if (view === 'roadmap') {
    return (
      <PageShell title={t13(interfaceLanguage, 'listeningPractice')} description={t13(interfaceLanguage, 'listeningPracticeDesc')} icon={<Headphones size={20} />}>
        <div className="flex flex-wrap gap-2 mb-6">
          {levels.map(l => (
            <button key={l} onClick={() => { setLevelFilter(l); setCurrentPage(0); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${levelFilter === l ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{l === 'all' ? t13(interfaceLanguage, 'all') : l}</button>
          ))}
          <span className="ml-auto text-xs text-slate-400 self-center font-bold">{filtered.length} {t13(interfaceLanguage, 'tasks')}</span>
        </div>

        <div className="space-y-3">
          {visibleTasks.map((task, i) => {
            const done = completedTasks.has(task.id);
            const levelColor = task.level.startsWith('A') ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : task.level.startsWith('B') ? 'text-blue-600 bg-blue-500/10 dark:text-blue-400' : 'text-purple-600 bg-purple-500/10 dark:text-purple-400';
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500/40 cursor-pointer transition-all duration-300 ${done ? 'border-emerald-500/40 bg-emerald-500/[0.02]' : ''}`}
                onClick={() => startTask(task)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold transition-colors ${done ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {done ? <CheckCircle2 size={22} /> : <Play size={20} className="ml-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{task.title}</h3>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${levelColor}`}>{task.level}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">~{task.durationEstimate}s audio • {task.questions.length} {t13(interfaceLanguage, 'questions')}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Listening task pages">
            <button
              type="button"
              onClick={() => setCurrentPage(page => Math.max(0, page - 1))}
              disabled={pageIndex === 0}
              aria-label="Previous listening tasks"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">Page {pageIndex + 1} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setCurrentPage(page => Math.min(totalPages - 1, page + 1))}
              disabled={pageIndex === totalPages - 1}
              aria-label="Next listening tasks"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        )}
      </PageShell>
    );
  }

  if (view === 'task' && activeTask) {
    return (
      <PageShell title={activeTask.title} description={`Listening Task • ${activeTask.level}`} icon={<Headphones size={20} />}>
        <button onClick={backToRoadmap} className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4 flex items-center gap-1 font-bold transition-colors">&larr; {t13(interfaceLanguage, 'backToTasks')}</button>

        {/* User Instruction / Hướng dẫn làm bài */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-500 text-white font-bold shrink-0 flex items-center justify-center"><Headphones size={18} /></div>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {interfaceLanguage === 'vi' ? 'Hướng dẫn luyện nghe bằng chuyển văn bản thành giọng nói (TTS):' : 'Text-to-speech listening practice'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              {interfaceLanguage === 'vi'
                ? 'Âm thanh trên trang này được tạo bằng chuyển văn bản thành giọng nói (TTS), không phải bản thu của người bản xứ.\n1. Nhấn nút Play bên trái để nghe lời thoại.\n2. Đọc kỹ các câu hỏi và chọn đáp án chính xác ở cột bên phải.\n3. Nhấn "Submit Answers" để nộp bài, xem điểm số và lời thoại (Transcript) chi tiết.'
                : 'This audio is generated from the task transcript using text-to-speech (TTS), not a native-speaker recording.\n1. Click the Play button on the left to hear the transcript.\n2. Read the questions and choose your answers on the right panel.\n3. Click "Submit Answers" to view your score and full transcript.'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AUDIO PLAYER SIDE */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">{t13(interfaceLanguage, 'audioPlayer')}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-bold">{t13(interfaceLanguage, 'textToSpeech')}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isSpeaking ? 'bg-emerald-500/20 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <button 
                    onClick={togglePlayback}
                    aria-label={isSpeaking ? 'Pause text-to-speech audio' : 'Play text-to-speech audio'}
                    title={isSpeaking ? 'Pause text-to-speech audio' : 'Play text-to-speech audio'}
                    className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
                  >
                    {isSpeaking ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
                </div>
                
                {isSpeaking && (
                  <div className="flex gap-1 items-center h-8">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-1.5 bg-emerald-500 rounded-full animate-recording" style={{ animationDelay: `${i * 0.1}s`, height: `${[55, 75, 45, 85, 65][(i - 1) % 5]}%` }} />
                    ))}
                  </div>
                )}
                {!isSpeaking && <p className="text-sm text-slate-400 font-medium">{t13(interfaceLanguage, 'tapToPlay')}</p>}
                
                <div className="flex justify-center mt-6">
                  <button onClick={stop} disabled={!isSpeaking} aria-label="Stop text-to-speech audio" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all">
                    <Square size={14} /> {t13(interfaceLanguage, 'stop')}
                  </button>
                </div>
              </div>
            </div>

            {activeTask.mediaResources && activeTask.mediaResources.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{interfaceLanguage === 'vi' ? 'Video ví dụ từ YouTube' : 'YouTube example videos'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{interfaceLanguage === 'vi' ? 'Không tải video về app; mở tìm kiếm để học bằng nguồn hợp pháp.' : 'Videos are not downloaded into the app; open search links for legal practice examples.'}</p>
                <div className="flex flex-wrap gap-2">
                  {activeTask.mediaResources.map((resource: any, idx: number) => (
                    <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold transition-all">
                      {interfaceLanguage === 'vi' ? 'Mở YouTube' : 'Open YouTube'} #{idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {submitted && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{t13(interfaceLanguage, 'transcript')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  {activeTask.transcript}
                </p>
              </div>
            )}
          </div>

          {/* QUESTIONS SIDE */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t13(interfaceLanguage, 'comprehensionQuestions')}</h3>
                {submitted && (
                  <span className={`text-sm px-3 py-1 rounded-full font-bold ${score === activeTask.questions.length ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {t13(interfaceLanguage, 'score')}: {score}/{activeTask.questions.length}
                  </span>
                )}
              </div>

              <div className="space-y-8">
                {activeTask.questions.map((q, idx) => {
                  const isCorrect = submitted && quizAnswers[q.id]?.trim().toLowerCase() === q.correctAnswer.toLowerCase();

                  return (
                    <div key={q.id} className="space-y-3">
                      <p className="text-sm text-slate-900 dark:text-white font-medium"><span className="text-emerald-600 dark:text-emerald-400 mr-2 font-bold">{idx + 1}.</span> {q.question}</p>
                      
                      {q.type === 'multiple_choice' && q.options ? (
                        <div className="space-y-2">
                          {q.options.map(opt => {
                            let cls = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-500/50 text-slate-700 dark:text-slate-300';
                            if (quizAnswers[q.id] === opt) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                            
                            if (submitted) {
                              if (opt === q.correctAnswer) cls = 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400';
                              else if (quizAnswers[q.id] === opt) cls = 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400';
                              else cls = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-400 opacity-50';
                            }
                            
                            return (
                              <button
                                key={opt}
                                disabled={submitted}
                                onClick={() => handleAnswerChange(q.id, opt)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl border transition-all flex items-center gap-3 ${cls}`}
                              >
                                {submitted && opt === q.correctAnswer && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
                                {submitted && quizAnswers[q.id] === opt && opt !== q.correctAnswer && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              disabled={submitted}
                              value={quizAnswers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              placeholder={`Nhập câu trả lời bằng chữ hoặc gõ bàn phím ảo (${targetLanguage.toUpperCase()})...`}
                              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none pr-10 ${
                                submitted
                                  ? isCorrect ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                              }`}
                            />
                            {!submitted && (
                              <button
                                type="button"
                                onClick={() => setActiveKeyboardQId(activeKeyboardQId === q.id ? null : q.id)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                                title="Bật/Tắt bàn phím ảo ngôn ngữ"
                              >
                                <Keyboard size={18} />
                              </button>
                            )}
                          </div>

                          {activeKeyboardQId === q.id && !submitted && (
                            <VirtualLanguageKeyboard
                              language={targetLanguage}
                              value={quizAnswers[q.id] || ''}
                              onChange={(val) => handleAnswerChange(q.id, val)}
                              onClose={() => setActiveKeyboardQId(null)}
                            />
                          )}
                        </div>
                      )}

                      {submitted && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-slate-600 dark:text-slate-300"><span className="text-slate-900 dark:text-white font-bold">{t13(interfaceLanguage, 'correctAnswer')}:</span> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{q.correctAnswer}</span></p>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                              <Volume2 size={12} /> {getPhoneticInfo(q.correctAnswer, targetLanguage).phonetic}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!submitted ? (
                <button
                  onClick={submitAnswers}
                  disabled={Object.keys(quizAnswers).length < activeTask.questions.length}
                  className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={backToRoadmap}
                  className="mt-8 w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Back to All Tasks
                </button>
              )}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={t13(interfaceLanguage, 'listeningPractice')} description={t13(interfaceLanguage, 'chooseTask')} icon={<Headphones size={20} />}>
      <div className="p-6 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-500 dark:text-slate-400">{interfaceLanguage === 'vi' ? 'Trạng thái luyện nghe chưa sẵn sàng. Hãy quay lại danh sách bài nghe.' : 'Listening state is not ready. Please return to the listening task list.'}</p>
        <button onClick={() => setView('roadmap')} className="mt-4 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">{interfaceLanguage === 'vi' ? 'Quay lại danh sách' : 'Back to tasks'}</button>
      </div>
    </PageShell>
  );
}
