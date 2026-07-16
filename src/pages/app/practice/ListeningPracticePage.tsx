// @ts-nocheck
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Headphones, CheckCircle2, XCircle, ChevronRight, Play, Pause, Square } from 'lucide-react';
import PageShell from '../../PageShell';
import { listeningLibrary, type ListeningTask } from '../../../curriculum/listeningLibrary';
import { useAppStore } from '../../../stores/appStore';
import { t13 } from '../../../i18n/phase13Text';
import { getTargetListeningTasks } from '../../../services/targetLanguageContent';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { recordPracticeAttempt } from '../../../services/practiceLearningIntegration';

type View = 'roadmap' | 'task';

export default function ListeningPracticePage() {
  const [view, setView] = useState<View>('roadmap');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [activeTask, setActiveTask] = useState<ListeningTask | null>(null);
  
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
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
  }, [levelFilter, targetLanguage, runtimeTasks]);

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
      // Simulate real playback by speaking transcript
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
            <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${levelFilter === l ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>{l === 'all' ? t13(interfaceLanguage, 'all') : l}</button>
          ))}
          <span className="ml-auto text-xs text-dark-500 self-center">{filtered.length} {t13(interfaceLanguage, 'tasks')}</span>
        </div>

        <div className="space-y-3">
          {filtered.map((task, i) => {
            const done = completedTasks.has(task.id);
            const levelColor = task.level.startsWith('A') ? 'text-green-400 bg-green-500/10' : task.level.startsWith('B') ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10';
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card p-4 cursor-pointer hover:border-primary-500/30 transition-all ${done ? 'border-green-500/20' : ''}`}
                onClick={() => startTask(task)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-400'}`}>
                    {done ? <CheckCircle2 size={20} /> : <Play size={18} className="ml-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{task.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelColor}`}>{task.level}</span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5 truncate">~{task.durationEstimate}s audio • {task.questions.length} {t13(interfaceLanguage, 'questions')}</p>
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

  if (view === 'task' && activeTask) {
    return (
      <PageShell title={activeTask.title} description={`Listening Task • ${activeTask.level}`} icon={<Headphones size={20} />}>
        <button onClick={backToRoadmap} className="text-sm text-dark-400 hover:text-white mb-6 flex items-center gap-1">&larr; {t13(interfaceLanguage, 'backToTasks')}</button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AUDIO PLAYER SIDE */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-primary-500/20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-primary-400 font-semibold uppercase">{t13(interfaceLanguage, 'audioPlayer')}</span>
                <span className="text-xs text-dark-400 bg-dark-800 px-2 py-1 rounded">{t13(interfaceLanguage, 'textToSpeech')}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isSpeaking ? 'bg-primary-500/20 animate-pulse' : 'bg-dark-800'}`}>
                  <button 
                    onClick={togglePlayback}
                    className="w-16 h-16 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    {isSpeaking ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </button>
                </div>
                
                {isSpeaking && (
                  <div className="flex gap-1 items-center h-8">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-1.5 bg-primary-500 rounded-full animate-recording" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 60 + 40}%` }} />
                    ))}
                  </div>
                )}
                {!isSpeaking && <p className="text-sm text-dark-500">{t13(interfaceLanguage, 'tapToPlay')}</p>}
                
                <div className="flex justify-center mt-6">
                  <button onClick={stop} disabled={!isSpeaking} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 disabled:opacity-50 rounded-lg text-sm flex items-center gap-2">
                    <Square size={14} /> {t13(interfaceLanguage, 'stop')}
                  </button>
                </div>
              </div>
            </div>

            {activeTask.mediaResources && activeTask.mediaResources.length > 0 && (
              <div className="glass-card p-5 border-blue-500/20">
                <h3 className="text-sm font-bold text-white mb-2">{interfaceLanguage === 'vi' ? 'Video ví dụ từ YouTube' : 'YouTube example videos'}</h3>
                <p className="text-xs text-dark-400 mb-3">{interfaceLanguage === 'vi' ? 'Không tải video về app; mở tìm kiếm để học bằng nguồn hợp pháp.' : 'Videos are not downloaded into the app; open search links for legal practice examples.'}</p>
                <div className="flex flex-wrap gap-2">
                  {activeTask.mediaResources.map((resource: any, idx: number) => (
                    <a key={idx} href={resource.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-primary-300 border border-dark-700">
                      {interfaceLanguage === 'vi' ? 'Mở YouTube' : 'Open YouTube'} #{idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {submitted && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-3">{t13(interfaceLanguage, 'transcript')}</h3>
                <p className="text-sm text-dark-300 leading-relaxed whitespace-pre-line bg-dark-800/50 p-4 rounded-xl border border-dark-700">
                  {activeTask.transcript}
                </p>
              </div>
            )}
          </div>

          {/* QUESTIONS SIDE */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{t13(interfaceLanguage, 'comprehensionQuestions')}</h3>
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
                      <p className="text-sm text-white font-medium"><span className="text-primary-400 mr-2">{idx + 1}.</span> {q.question}</p>
                      
                      {q.type === 'multiple_choice' && q.options ? (
                        <div className="space-y-2">
                          {q.options.map(opt => {
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
                      ) : (
                        <input
                          type="text"
                          disabled={submitted}
                          value={quizAnswers[q.id] || ''}
                          onChange={e => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Type your answer..."
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                            submitted
                              ? isCorrect ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'
                              : 'border-dark-700 bg-dark-800 text-white focus:border-primary-500'
                          }`}
                        />
                      )}

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
                  disabled={Object.keys(quizAnswers).length < activeTask.questions.length}
                  className="mt-8 w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={backToRoadmap}
                  className="mt-8 w-full py-4 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-xl transition-colors"
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
      <div className="glass-card p-6 text-center">
        <p className="text-dark-300">{interfaceLanguage === 'vi' ? 'Trạng thái luyện nghe chưa sẵn sàng. Hãy quay lại danh sách bài nghe.' : 'Listening state is not ready. Please return to the listening task list.'}</p>
        <button onClick={() => setView('roadmap')} className="mt-4 px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold">{interfaceLanguage === 'vi' ? 'Quay lại danh sách' : 'Back to tasks'}</button>
      </div>
    </PageShell>
  );
}
