import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Heart, Mic, RotateCcw, Volume2, X, Zap, Headphones, BookOpen, PenTool, Ruler, BookMarked, Lightbulb, AlertTriangle, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EchBuriAnimated, { type EchBuriAnimationState } from '../../components/mascot/EchBuriAnimated';
import { BlobBackground } from '../../components/ui/BlobBackground';
import SpeakerButton from '../../components/audio/SpeakerButton';
import { LessonCompletionScreen } from '../../components/lessons/LessonCompletionScreen';
import { generateExercisesForModule } from '../../curriculum/exerciseGenerator';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useProAccess } from '../../hooks/useProAccess';
import { canUseEntitlementLanguages } from '../../services/entitlementService';
import { useLearningStore } from '../../stores/learningStore';
import { progressService } from '../../services/progressService';
import { recordActivityCompletion } from '../../services/missionProgressService';
import { soundService } from '../../services/soundService';
import { cleanText } from '../../utils/languageUtils';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { adaptiveLearningEngine } from '../../services/adaptiveLearningEngine';
import { getMascotCheer } from '../../services/mascotMessages';
import { toast } from '../../components/ui/Toast';

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
  if (!answer) return false;
  const normalized = cleanText(answer).toLocaleLowerCase();
  const candidates = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer])
    .map(c => cleanText(c).toLocaleLowerCase())
    .filter(Boolean);

  if (candidates.some(cand => cand === normalized || cand.includes(normalized) || normalized.includes(cand))) {
    return true;
  }
  return false;
}

export default function LessonPlayerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentLang = useAppStore(s => s.currentLanguage);
  const moduleId = searchParams.get('id') || `${currentLang}_mod_1`;
  const lesId = searchParams.get('lesId') || '';

  // Detect language from moduleId prefix (e.g. ko_mod_1 -> ko) or currentLanguage
  const moduleLangPrefix = moduleId.split('_')[0];
  const targetLanguage = (moduleLangPrefix && moduleLangPrefix.length <= 3 && moduleLangPrefix !== 'mod')
    ? moduleLangPrefix
    : currentLang;

  const user = useAuthStore(s => s.user);
  // Merged profile + ledger plan: a PRO grant made in the admin panel unlocks
  // this player immediately, on any device, without a re-login.
  const { plan: activePlan, flags: proFlags, isResolving: isResolvingPlan } = useProAccess();
  const selectedLangs = user?.targetLanguages ?? [targetLanguage];

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

  // Entitlement check lives in its own effect: it depends on the asynchronously
  // resolved plan, and folding it into the generation effect below would re-run
  // exercise generation every time the plan settles.
  useEffect(() => {
    if (isResolvingPlan) return;
    const testLanguages = Array.from(new Set([...selectedLangs, targetLanguage]));
    if (proFlags.unlockAllLanguages || canUseEntitlementLanguages(activePlan, testLanguages)) return;

    toast(`🔒 Ngôn ngữ (${targetLanguage.toUpperCase()}) chưa được mở khóa trong gói cước của bạn.`, 'warning');
    navigate('/pricing');
  }, [isResolvingPlan, activePlan, proFlags.unlockAllLanguages, selectedLangs, targetLanguage, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCurrentIndex(0);
    setSelected('');
    setUserInput('');
    setShowResult(false);
    setFinished(false);
    setScore(0);
    generateExercisesForModule(moduleId, targetLanguage, answerLanguage, t, lesId).then(data => {
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
  }, [moduleId, lesId, targetLanguage, answerLanguage, t]);

  const exercise = exercises[currentIndex];
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0;
  const normalizedOptions = useMemo(() => normalizeOptions(exercise?.options, exercise?.correctAnswer || ''), [exercise]);
  const canCheck = exercise?.type === 'match-pairs'
    ? matchedPairs.length > 0 && matchedPairs.length === (exercise.pairs?.length || 0)
    : Boolean(selected || userInput.trim());
  const isAudioExercise = exercise?.type === 'listen-choose' || Boolean(exercise?.audioText);
  const mascotState: EchBuriAnimationState = showResult
    ? (isCorrect ? 'success' : 'incorrect')
    : selected || userInput ? 'thinking' : isAudioExercise ? 'listening' : 'idle';

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
      const answer = (selected || userInput).trim();
      correct = answerMatches(answer, exercise.correctAnswer);
    }
    setIsCorrect(correct);
    setShowResult(true);
    setCheerText(getMascotCheer(correct).text);
    if (correct) {
      setScore(value => value + 1);
      soundService.playCorrect();
    } else {
      // PRO accounts practise without the heart lockout.
      if (!proFlags.unlimitedHearts) setHearts(value => Math.max(0, value - 1));
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
      const user = useAuthStore.getState().user;
      if (user?.id) {
        progressService.markLessonCompleted(user.id, moduleId);
        // The course player does not go through `recordPracticeAttempt`, so the
        // "Complete N lessons" and "Perfect Score" missions are advanced here.
        recordActivityCompletion({
          userId: user.id,
          skillType: 'lesson',
          isPerfect: accuracy === 100,
          source: `lesson:${moduleId}`,
        });
      }
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

  const isChoiceExercise = exercise.type === 'multiple-choice' || exercise.type === 'listen-choose';
  const isTextExercise = exercise.type === 'fill-blank' || exercise.type === 'translate' || exercise.type === 'type-what-you-hear';
  const correctDisplay = Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer[0] : exercise.correctAnswer;

  return (
    <div className="min-h-screen bg-amber-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors">
      <BlobBackground colors={['bg-emerald-500/10', 'bg-amber-400/10', 'bg-orange-400/10']} />
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center gap-4 px-4 sticky top-0 z-20">
        <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          {proFlags.unlimitedHearts ? (
            <span title="PRO: tim không giới hạn" className="flex items-center gap-1 text-rose-500">
              <Heart size={16} className="fill-rose-500" />
              <span className="text-xs font-black">∞</span>
            </span>
          ) : (
            <>
              {Array.from({ length: hearts }).map((_, index) => <Heart key={`filled-${index}`} size={16} className="text-rose-500 fill-rose-500" />)}
              {Array.from({ length: 5 - hearts }).map((_, index) => <Heart key={`empty-${index}`} size={16} className="text-slate-300 dark:text-slate-700" />)}
            </>
          )}
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('lesson.progress.step', { current: currentIndex + 1, total: exercises.length })}</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={exercise.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 sm:p-8 w-full max-w-2xl my-auto bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 shadow-2xl shadow-amber-950/10 dark:shadow-none rounded-3xl transition-colors">
            <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
              <EchBuriAnimated
                size={56}
                state={mascotState}
              />
              <div className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200" aria-live="polite">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {showResult
                    ? isCorrect
                      ? '🎉 CHÍNH XÁC RỒI!'
                      : '😅 THỬ LẠI NHÉ!'
                    : selected || userInput
                      ? '🤔 ĐANG SUY NGHĨ...'
                      : '🌱 ECH BURI ĐỒNG HÀNH'}
                </p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                  {showResult
                    ? isCorrect
                      ? cheerText || 'Xuất sắc lắm! Hãy giữ vững phong độ nhé!'
                      : 'Đừng nản lòng, câu sau bạn sẽ làm tốt hơn!'
                    : selected || userInput
                      ? 'Nhấn "Kiểm tra" để Ech Buri chấm điểm đáp án nhé.'
                      : 'Lắng nghe kỹ và lựa chọn đáp án chính xác nhất.'}
                </p>
              </div>
            </div>

            {/* Exercise Header & Category Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1.5">
                {exercise.id.includes('lis') ? <><Headphones size={14} /> LUYỆN NGHE PHẢN XẠ</> :
                 exercise.id.includes('spk') ? <><Mic size={14} /> LUYỆN PHÁT ÂM & NÓI</> :
                 exercise.id.includes('read') ? <><BookOpen size={14} /> ĐỌC HIỂU ĐOẠN VĂN</> :
                 exercise.id.includes('wrt') || exercise.id.includes('blank') ? <><PenTool size={14} /> LUYỆN VIẾT & GHÉP CÂU</> :
                 exercise.id.includes('gram') ? <><Ruler size={14} /> NGỮ PHÁP & THÌ CÂU</> :
                 <><BookMarked size={14} /> TỪ VỰNG CĂN BẢN</>}
              </span>
              {exercise.targetText && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Mục tiêu: <strong className="text-amber-600 dark:text-amber-400">{exercise.targetText}</strong>
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 font-medium">{exercise.instruction || t('lesson.instructions.chooseCorrectMeaning')}</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 leading-relaxed">
              <span>{exercise.question}</span>
              {(exercise.audioText || exercise.targetText) && (
                <SpeakerButton word={exercise.audioText || exercise.targetText || ''} languageId={targetLanguage} size={22} />
              )}
            </h2>

            {/* SPECIALIZED UI CONTAINER FOR LISTENING EXERCISES */}
            {(exercise.type === 'listen-choose' || exercise.id.includes('lis')) && (
              <div className="p-4 mb-6 rounded-2xl bg-slate-900 border border-sky-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => speak(exercise.audioText || exercise.targetText || '', targetLanguage as any)}
                    className="w-12 h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <Volume2 size={24} />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                      <Volume2 size={14} /> TRÌNH PHÁT ÂM THANH BẢN XỨ
                    </span>
                    <span className="text-[11px] text-slate-400">Nhấn để nghe lại phát âm bản xứ chuẩn HD</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 text-sky-400 text-xs font-bold rounded-lg border border-slate-700">
                  Tốc độ: 1.0x
                </span>
              </div>
            )}

            {/* SPECIALIZED UI CONTAINER FOR SPEAKING EXERCISES */}
            {exercise.id.includes('spk') && (
              <div className="p-4 mb-6 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                    <Mic size={16} /> THÁCH ĐẤU PHÁT ÂM CHUẨN NATIVE
                  </span>
                  <span className="text-[11px] text-slate-400">Yêu cầu: Nhại lại đúng ngữ điệu bản xứ</span>
                </div>
                <button
                  onClick={() => {
                    speak(exercise.audioText || exercise.targetText || '', targetLanguage as any);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs border border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Volume2 size={16} /> Nghe & Nhại Theo Phát Âm Bản Xứ
                </button>
              </div>
            )}

            {isChoiceExercise && normalizedOptions.length > 0 && (
              <div className="space-y-3">
                {normalizedOptions.map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => !showResult && setSelected(option)}
                    disabled={showResult}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 border-b-4 transition-all text-base font-bold flex items-center justify-between gap-3 active:translate-y-0.5 active:border-b-2 cursor-pointer ${showResult
                      ? answerMatches(option, exercise.correctAnswer)
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-b-emerald-600 font-black'
                        : option === selected
                          ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 border-b-rose-600'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border-b-slate-300 dark:border-b-slate-800'
                      : selected === option
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-b-emerald-600 shadow-md shadow-emerald-500/20 font-black'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-b-slate-300 dark:border-b-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
                  >
                    <span className="flex items-center justify-between gap-3 w-full">
                      <span className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{option}</span>
                      </span>
                      {showResult && answerMatches(option, exercise.correctAnswer) && <Check size={20} className="text-emerald-400 font-black" />}
                      {showResult && option === selected && !answerMatches(option, exercise.correctAnswer) && <X size={20} className="text-rose-400 font-black" />}
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
                <div className="hidden sm:block"><EchBuriAnimated size={64} state={mascotState} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? <Check size={20} className="text-success" /> : <X size={20} className="text-error" />}
                    <span className={`text-lg font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>{isCorrect ? t('lesson.feedback.correct') : t('lesson.feedback.incorrect')}</span>
                    <span className={`text-sm font-medium ${isCorrect ? 'text-success/80' : 'text-error/80'}`}>{cheerText}</span>
                  </div>
                  <p className="text-sm text-dark-300 mb-2">{t('lesson.explanations.correctMeaning', { meaning: correctDisplay })}</p>

                  {/* Detailed Pedagogical Breakdown Box */}
                  <div className="my-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-400">
                      <Lightbulb size={16} />
                      <span>Ghi Nhớ Sư Phạm & Phân Tích Ngữ Cảnh:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {exercise.explanation || `Đáp án chính xác là "${correctDisplay}". Ghi nhớ cấu trúc ngữ pháp và từ vựng này để áp dụng chuẩn xác trong giao tiếp thực tế.`}
                    </p>
                    {!isCorrect && selected && (
                      <p className="text-rose-400 font-medium border-t border-slate-800/80 pt-1.5 mt-1.5 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="shrink-0" /> Lỗi sai: Bạn chọn "{selected}" — Tránh nhầm lẫn cách dùng từ theo ngữ cảnh bài học.
                      </p>
                    )}
                  </div>

                  {isCorrect ? (
                    <button
                      onClick={nextExercise}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 cursor-pointer uppercase tracking-wider"
                    >
                      {currentIndex + 1 >= exercises.length ? (
                        <span className="flex items-center gap-2">HOÀN THÀNH BÀI HỌC <Trophy size={18} /></span>
                      ) : (
                        <span>TIẾP TỤC →</span>
                      )} <ArrowRight size={20} />
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={retryQuestion}
                        className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold border-2 border-slate-700 border-b-4 border-b-slate-900 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                      >
                        <RotateCcw size={18} /> Thử Lại
                      </button>
                      <button
                        onClick={nextExercise}
                        className="flex-1 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl font-bold border-2 border-rose-500/40 border-b-4 border-b-rose-700 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                      >
                        Bỏ Qua <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!showResult && (
              <div className="mt-6">
                <button
                  onClick={checkAnswer}
                  disabled={!canCheck || (isChoiceExercise && normalizedOptions.length === 0)}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-0 cursor-pointer uppercase tracking-wider"
                >
                  {t('lesson.buttons.check')} <Zap size={20} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
