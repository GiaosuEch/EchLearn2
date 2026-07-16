import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, XCircle, ChevronRight, Zap } from 'lucide-react';
import PageShell from '../../PageShell';
import { grammarBank, type GrammarTopic } from '../../../curriculum/grammarBank';
import { toast } from '../../../components/ui/Toast';
import { useLearningStore } from '../../../stores/learningStore';
import { useAppStore } from '../../../stores/appStore';
import { recordPracticeAttempt } from '../../../services/practiceLearningIntegration';

type View = 'roadmap' | 'lesson' | 'quiz';

export default function GrammarTrainerPage() {
  const [view, setView] = useState<View>('roadmap');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const addXP = useLearningStore(s => s.addXP);
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const nativeLanguage = useAppStore(s => s.nativeLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);

  const levels = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const filtered = useMemo(() => {
    if (levelFilter === 'all') return grammarBank;
    return grammarBank.filter(t => t.level === levelFilter);
  }, [levelFilter]);

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

  // ══ ROADMAP VIEW ══
  if (view === 'roadmap') {
    return (
      <PageShell title="Grammar Course" description="30 real grammar topics from A1 to C2" icon={<BookOpen size={20} />}>
        {/* Level filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {levels.map(l => (
            <button key={l} onClick={() => setLevelFilter(l)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${levelFilter === l ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>{l === 'all' ? 'All' : l}</button>
          ))}
          <span className="ml-auto text-xs text-dark-500 self-center">{filtered.length} topics</span>
        </div>

        <div className="space-y-3">
          {filtered.map((topic, i) => {
            const done = completedTopics.has(topic.id);
            const levelColor = topic.level.startsWith('A') ? 'text-green-400 bg-green-500/10' : topic.level.startsWith('B') ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10';
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card p-4 cursor-pointer hover:border-primary-500/30 transition-all ${done ? 'border-green-500/20' : ''}`}
                onClick={() => startLesson(topic)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-400'}`}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{topic.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${levelColor}`}>{topic.level}</span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5 truncate">{topic.description}</p>
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
            <h3 className="text-lg font-bold text-white mb-3">📖 Explanation</h3>
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
            <h3 className="text-lg font-bold text-white mb-3">💡 Examples</h3>
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
              <h3 className="text-lg font-bold text-yellow-400 mb-3">⚠️ Common Mistakes</h3>
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
