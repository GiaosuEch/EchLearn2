import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Heart, RotateCcw, Volume2, X, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Mascot from '../../components/mascot/Mascot';
import { BlobBackground } from '../../components/ui/BlobBackground';
import SpeakerButton from '../../components/audio/SpeakerButton';
import { LessonCompletionScreen } from '../../components/lessons/LessonCompletionScreen';
import { generateExercisesForModule } from '../../curriculum/exerciseGenerator';
import { useAppStore } from '../../stores/appStore';
import { useLearningStore } from '../../stores/learningStore';
import { soundService } from '../../services/soundService';
import { cleanText } from '../../utils/languageUtils';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { adaptiveLearningEngine } from '../../services/adaptiveLearningEngine';
import { getMascotCheer } from '../../services/mascotMessages';

type Exercise = {
  id: string;
  type: string;
  question: string;
  instruction?: string;
  options?: unknown[];
  correctAnswer: string | string[];
  explanation?: string;
  audioText?: string;
  targetText?: string;
  words?: string[];
  pairs?: { left: string; right: string }[];
};

function exerciseTypeKey(type?: string) {
  return String(type || 'multiple-choice').replace(/-/g, '');
}

function normalizeOption(option: unknown): string {
  if (typeof option === 'string') return cleanText(option);
  if (option && typeof option === 'object') {
    const item = option as Record<string, unknown>;
    return cleanText(item.meaningVietnamese)
      || cleanText(item.meaningEnglish)
      || cleanText(item.meaning)
      || cleanText(item.label)
      || cleanText(item.text)
      || cleanText(item.value);
  }
  return '';
}

function normalizeOptions(options: unknown[] | undefined, correctAnswer: string | string[]) {
  const correctList = Array.isArray(correctAnswer) ? correctAnswer.map(cleanText) : [cleanText(correctAnswer)];
  const all = [...(options || []).map(normalizeOption), ...correctList]
    .map(cleanText)
    .filter(Boolean)
    .filter(value => !/^(missing meaning|n\/a|meaning\s*:)/i.test(value));
  return Array.from(new Set(all));
}

function answerMatches(answer: string, correctAnswer: string | string[]) {
  const normalized = cleanText(answer).toLocaleLowerCase();
  const candidates = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  return candidates.some(item => cleanText(item).toLocaleLowerCase() === normalized);
}

export default function LessonPlayerPage() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('id') || 'en_mod_1';
  const targetLanguage = useAppStore(s => s.currentLanguage);
  const nativeLanguage = useAppStore(s => s.nativeLanguage);
  const interfaceLanguage = useAppStore(s => s.interfaceLanguage);
  const answerLanguage = nativeLanguage || interfaceLanguage || 'vi';
  const { t } = useTranslation();
  const addXP = useLearningStore(s => s.addXP);
  const addCoins = useLearningStore(s => (s as any).addCoins);
  const { speak } = useTextToSpeech();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [cheerText, setCheerText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [finished, setFinished] = useState(false);
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [matchRight, setMatchRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCurrentIndex(0);
    setSelected('');
    setUserInput('');
    setShowResult(false);
    setFinished(false);
    setScore(0);
    generateExercisesForModule(moduleId, targetLanguage, answerLanguage, t).then(data => {
      if (cancelled) return;
      setExercises(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(error => {
      console.error('Lesson generation failed', error);
      if (!cancelled) {
        setExercises([]);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [moduleId, targetLanguage, answerLanguage, t]);

  const exercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;
  const normalizedOptions = useMemo(() => normalizeOptions(exercise?.options, exercise?.correctAnswer || ''), [exercise]);
  const canCheck = exercise?.type === 'match-pairs'
    ? matchedPairs.length > 0 && matchedPairs.length === (exercise.pairs?.length || 0)
    : Boolean(selected || userInput.trim());

  useEffect(() => {
    setSelected('');
    setUserInput('');
    setShowResult(false);
    setIsCorrect(false);
    setMatchLeft(null);
    setMatchRight(null);
    setMatchedPairs([]);
  }, [currentIndex]);

  const checkAnswer = async () => {
    if (!exercise) return;
    let correct = false;
    if (exercise.type === 'match-pairs') {
      correct = matchedPairs.length === (exercise.pairs?.length || 0);
    } else {
      const answer = exercise.type === 'multiple-choice' || exercise.type === 'listen-choose' ? selected : userInput;
      correct = answerMatches(answer, exercise.correctAnswer);
    }
    setIsCorrect(correct);
    setShowResult(true);
    setCheerText(getMascotCheer(correct));
    if (correct) {
      setScore(value => value + 1);
      soundService.playCorrect();
    } else {
      setHearts(value => Math.max(0, value - 1));
      soundService.playWrong();
    }
    try {
      const { useAuthStore } = await import('../../stores/authStore');
      const user = useAuthStore.getState().user;
      if (user) {
        const { lessonAttemptService } = await import('../../services/lessonAttemptService');
        await lessonAttemptService.logAttempt(user.id, moduleId, 'course_default', correct ? 100 : 0);
        const answer = exercise.type === 'multiple-choice' || exercise.type === 'listen-choose' ? selected : userInput;
        const firstCorrect = Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer;
        await adaptiveLearningEngine.recordLearningEvent({
          userId: user.id,
          targetLanguage,
          itemId: moduleId + ':' + exercise.id,
          skillType: exercise.type === 'type-what-you-hear' || exercise.type === 'listen-choose' ? 'listening' : exercise.type === 'translate' ? 'vocabulary' : 'lesson',
          isCorrect: correct,
          answer,
          correctAnswer: firstCorrect,
          hadMistake: !correct,
          typedExact: correct && typeof answer === 'string' && typeof firstCorrect === 'string' && answer.trim().toLowerCase() === firstCorrect.trim().toLowerCase(),
          skipped: false,
          difficulty: currentIndex + 1,
        });
      }
    } catch (error) {
      console.warn('Could not save lesson attempt or adaptive progress', error);
    }
  };

  const nextExercise = () => {
    if (currentIndex + 1 >= exercises.length) {
      setFinished(true);
      const accuracy = exercises.length > 0 ? Math.round(((score + (isCorrect ? 1 : 0)) / exercises.length) * 100) : 0;
      addXP(100, 'lesson_completed');
      addCoins?.(accuracy >= 80 ? 25 : 10);
      return;
    }
    setCurrentIndex(value => value + 1);
  };

  const retryQuestion = () => {
    setSelected('');
    setUserInput('');
    setShowResult(false);
  };

  const chooseMatch = (side: 'left' | 'right', id: string) => {
    if (!exercise?.pairs) return;
    if (side === 'left') {
      if (matchRight) {
        if (matchRight === id) setMatchedPairs(prev => Array.from(new Set([...prev, id])));
        setMatchLeft(null);
        setMatchRight(null);
      } else setMatchLeft(id);
    } else {
      if (matchLeft) {
        if (matchLeft === id) setMatchedPairs(prev => Array.from(new Set([...prev, id])));
        setMatchLeft(null);
        setMatchRight(null);
      } else setMatchRight(id);
    }
  };

  if (finished) {
    const accuracy = exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0;
    return (
      <LessonCompletionScreen
        score={score}
        total={exercises.length}
        xpEarned={100}
        coinsEarned={accuracy >= 80 ? 25 : 10}
        onRetry={() => { setCurrentIndex(0); setScore(0); setFinished(false); setHearts(5); }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col relative overflow-hidden items-center justify-center">
        <BlobBackground colors={['bg-primary-500/10', 'bg-blue-500/10', 'bg-purple-500/10']} />
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mb-4 z-10" />
        <p className="text-primary-400 font-medium z-10">{t('lesson.generating')}</p>
      </div>
    );
  }

  if (!exercise || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col relative overflow-hidden items-center justify-center text-center p-4">
        <BlobBackground colors={['bg-error/10', 'bg-dark-800/10', 'bg-dark-900/10']} />
        <h2 className="text-xl font-bold text-white mb-2 z-10">{t('lesson.missing_data')}</h2>
        <p className="text-dark-400 z-10">{t('lesson.choose_another')}</p>
      </div>
    );
  }

  const exerciseType = exerciseTypeKey(exercise.type);
  const isChoiceExercise = exercise.type === 'multiple-choice' || exercise.type === 'listen-choose';
  const isTextExercise = exercise.type === 'fill-blank' || exercise.type === 'translate' || exercise.type === 'type-what-you-hear';
  const correctDisplay = Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col relative overflow-hidden">
      <BlobBackground colors={['bg-primary-500/10', 'bg-blue-500/10', 'bg-purple-500/10']} />
      <div className="h-16 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md flex items-center gap-4 px-4 sticky top-0 z-20">
        <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary-500 rounded-full" animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1 text-dark-400">
          {Array.from({ length: hearts }).map((_, index) => <Heart key={`filled-${index}`} size={16} className="text-error fill-error" />)}
          {Array.from({ length: 5 - hearts }).map((_, index) => <Heart key={`empty-${index}`} size={16} className="text-dark-700" />)}
        </div>
        <span className="text-sm font-medium text-dark-300">{t('lesson.progress.step', { current: currentIndex + 1, total: exercises.length })}</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={exercise.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card p-6 w-full max-w-2xl my-auto">
            <p className="text-xs text-primary-400 font-medium uppercase tracking-wide mb-2">
              {t(`lesson.types.${exerciseType}`, { defaultValue: exercise.type })}
            </p>
            <p className="text-sm text-dark-400 mb-1">{exercise.instruction || t('lesson.instructions.chooseCorrectMeaning')}</p>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <span>{exercise.question}</span>
              {(exercise.audioText || exercise.targetText) && <SpeakerButton word={exercise.audioText || exercise.targetText || ''} languageId={targetLanguage} size={18} />}
            </h2>

            {isChoiceExercise && normalizedOptions.length > 0 && (
              <div className="space-y-3">
                {normalizedOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => !showResult && setSelected(option)}
                    disabled={showResult}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm font-medium ${showResult
                      ? answerMatches(option, exercise.correctAnswer)
                        ? 'border-success bg-success/10 text-success'
                        : option === selected
                          ? 'border-error bg-error/10 text-error'
                          : 'border-dark-700 text-dark-500'
                      : selected === option
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-dark-700 text-dark-300 hover:border-dark-500 hover:bg-dark-800/50'}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{option}</span>
                      {showResult && answerMatches(option, exercise.correctAnswer) && <Check size={18} className="text-success" />}
                      {showResult && option === selected && !answerMatches(option, exercise.correctAnswer) && <X size={18} className="text-error" />}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {isChoiceExercise && normalizedOptions.length === 0 && (
              <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-error text-sm">
                {t('lesson.missing_options')}
              </div>
            )}

            {isTextExercise && (
              <div>
                {exercise.type === 'type-what-you-hear' && (
                  <div className="flex justify-center mb-6">
                    <button
                      onClick={() => {
                        const text = exercise.audioText || exercise.targetText || correctDisplay;
                        speak(text, targetLanguage as any);
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-colors bg-primary-500 hover:bg-primary-400"
                      aria-label={t('common.listen', { defaultValue: 'Listen' })}
                    >
                      <Volume2 size={32} className="text-white" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={userInput}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && !showResult && userInput && checkAnswer()}
                  disabled={showResult}
                  placeholder={t('lesson.placeholders.typeAnswer')}
                  className={`w-full px-5 py-4 rounded-xl border-2 bg-dark-800 text-white text-sm outline-none transition-all ${showResult
                    ? isCorrect ? 'border-success' : 'border-error'
                    : 'border-dark-700 focus:border-primary-500'}`}
                />
                {showResult && !isCorrect && (
                  <p className="text-sm text-success mt-2">{t('lesson.feedback.correctAnswer')}: <span className="font-semibold">{correctDisplay}</span></p>
                )}
              </div>
            )}

            {exercise.type === 'match-pairs' && exercise.pairs && (
              <div>
                <p className="text-dark-400 mb-6 text-sm">{t('lesson.instructions.selectPair')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {exercise.pairs.map(pair => (
                      <button key={`left-${pair.left}`} disabled={matchedPairs.includes(pair.left) || showResult} onClick={() => chooseMatch('left', pair.left)} className={`w-full p-4 rounded-xl border-2 text-left ${matchedPairs.includes(pair.left) ? 'opacity-50 border-success/30 bg-success/5 text-success' : matchLeft === pair.left ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-700 bg-dark-800 text-white hover:border-dark-500'}`}>{pair.left}</button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {exercise.pairs.map(pair => (
                      <button key={`right-${pair.left}`} disabled={matchedPairs.includes(pair.left) || showResult} onClick={() => chooseMatch('right', pair.left)} className={`w-full p-4 rounded-xl border-2 text-left ${matchedPairs.includes(pair.left) ? 'opacity-50 border-success/30 bg-success/5 text-success' : matchRight === pair.left ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-dark-700 bg-dark-800 text-white hover:border-dark-500'}`}>{pair.right}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-5 rounded-2xl flex gap-4 ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'}`}>
                <div className="hidden sm:block"><Mascot size={64} expression={isCorrect ? 'happy' : 'thinking'} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <Check size={20} className="text-success" /> : <X size={20} className="text-error" />}
                    <span className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>{isCorrect ? t('lesson.feedback.correct') : t('lesson.feedback.incorrect')}</span>
                    <span className={`text-sm font-medium ${isCorrect ? 'text-success/80' : 'text-error/80'}`}>{cheerText}</span>
                  </div>
                  <p className="text-sm text-dark-300 mb-3">{exercise.explanation || t('lesson.explanations.correctMeaning', { meaning: correctDisplay })}</p>
                  {isCorrect ? (
                    <button onClick={nextExercise} className="w-full py-3 bg-success hover:bg-success/80 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                      {currentIndex + 1 >= exercises.length ? t('lesson.buttons.finish') : t('lesson.buttons.continue')} <ArrowRight size={18} />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={retryQuestion} className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><RotateCcw size={18} /> {t('lesson.buttons.tryAgain')}</button>
                      <button onClick={nextExercise} className="flex-1 py-3 bg-error hover:bg-error/80 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">{t('lesson.buttons.skip')} <ArrowRight size={18} /></button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!showResult && (
              <div className="mt-6">
                <button onClick={checkAnswer} disabled={!canCheck || (isChoiceExercise && normalizedOptions.length === 0)} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                  {t('lesson.buttons.check')} <Zap size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
