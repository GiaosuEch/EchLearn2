import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RotateCcw, Sparkles, Brain, Clock, ShieldAlert } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { useLearningStore } from '../../../stores/learningStore';
import { useAuthStore } from '../../../stores/authStore';
import { useAppStore } from '../../../stores/appStore';
import { useMistakeNotebookStore } from '../../../stores/mistakeNotebookStore';
import { soundService } from '../../../services/soundService';
import { vocabularyService } from '../../../services/vocabularyService';
import { displayLearningWord, getLanguageMeta, getMeaningForNativeLanguage } from '../../../utils/languageUtils';
import {
  LANGUAGE_CONTENT_UNAVAILABLE,
  LANGUAGE_CONTENT_UNAVAILABLE_DETAIL,
  filterByLanguage,
  shuffleFairly,
} from '../../../services/languageIsolation';
import { CustomEmoji } from '../../../components/common/CustomEmoji';

interface Question {
  id: number;
  word: string;
  answer: string;
  example: string;
}

export default function SpeedQuizPage() {
  const [searchParams] = useSearchParams();
  const urlLang = searchParams?.get('lang') || searchParams?.get('targetLang');
  const appLanguage = useAppStore((s) => s.currentLanguage);
  const currentLanguage = urlLang || appLanguage || 'en';
  const nativeLanguage = useAppStore((s) => s.nativeLanguage) || 'vi';

  const user = useAuthStore((s) => s.user);
  const addXP = useLearningStore((s) => s.addXP);
  const addCoins = useLearningStore((s) => s.addCoins);
  const addMistake = useMistakeNotebookStore((s) => s.addMistake);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New States for Cognitive Time Attack
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'revealed' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  // Reaction Timing
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [lastReactionTime, setLastReactionTime] = useState(0);

  const langMeta = getLanguageMeta(currentLanguage);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    vocabularyService.getVocabularyForLanguage(currentLanguage).then((items) => {
      if (!isMounted) return;

      const languageItems = filterByLanguage(items || [], currentLanguage)
        .filter((item) => Boolean(displayLearningWord(item)));

      const sampledItems = shuffleFairly(languageItems).slice(0, 150);
      const generatedQuestions: Question[] = [];

      sampledItems.forEach((item, idx) => {
        const word = displayLearningWord(item);
        const meaning = item.meaningVietnamese || getMeaningForNativeLanguage(item, nativeLanguage, word);
        if (!word || !meaning) return;

        generatedQuestions.push({
          id: idx + 1,
          word: word,
          answer: meaning,
          example: item.example || '',
        });
      });

      setQuestions(generatedQuestions);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load quiz items for language:', currentLanguage, err);
      if (isMounted) {
        setQuestions([]);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentLanguage, langMeta.flag, langMeta.nativeName, nativeLanguage]);

  // Main Game Timer
  useEffect(() => {
    let timer: any;
    if ((gameState === 'playing' || gameState === 'revealed') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(60);
    setCurrentIndex(0);
    setUserScore(0);
    setCombo(0);
    setQuestionStartTime(Date.now());
  };

  const handleIHaveTheAnswer = () => {
    if (gameState !== 'playing') return;
    const rt = (Date.now() - questionStartTime) / 1000;
    setLastReactionTime(rt);
    setGameState('revealed');
  };

  const handleSelfAssessment = (isCorrect: boolean) => {
    if (gameState !== 'revealed') return;

    if (isCorrect) {
      soundService.playCorrect();
      
      let basePoints = 5;
      if (lastReactionTime < 1.5) basePoints = 50; // Master
      else if (lastReactionTime < 4.0) basePoints = 20; // Good
      
      const multiplier = 1 + (combo * 0.1); // Small combo bonus
      const totalGained = Math.round(basePoints * multiplier);
      
      setUserScore((prev) => prev + totalGained);
      setCombo((prev) => prev + 1);
    } else {
      soundService.playTone(150, 'sawtooth', 0.4); // Harsh penalty sound
      // PENALTY
      setTimeLeft((prev) => Math.max(0, prev - 10)); // Time Penalty -10s
      setCombo(0);

      // Sổ Tay Báo Thù: Ghi nhận lỗi
      if (user?.id && currentQ) {
        addMistake({
          userId: user.id,
          type: 'Vocabulary',
          mistake: `Phản xạ chậm/sai nghĩa cho từ: ${currentQ.word}`,
          correction: currentQ.answer,
          notes: `Speed Quiz (Cognitive Time Attack). Phạt -10s. Cần tập phản xạ dưới 1.5s.`,
          languageId: currentLanguage
        }).catch(err => console.error('Failed to save mistake', err));
      }
    }

    // Move to next question
    if (currentIndex + 1 < questions.length && timeLeft > 0) {
      setCurrentIndex((prev) => prev + 1);
      setGameState('playing');
      setQuestionStartTime(Date.now());
    } else {
      setGameState('gameover');
    }
  };

  const handleFinish = useCallback(async () => {
    if (userScore > 500) { // Arbitrary "victory" threshold
      await addXP(150, 'speed_quiz_victory');
      addCoins?.(30);
    } else {
      await addXP(50, 'speed_quiz_completed');
    }
  }, [userScore, addXP, addCoins]);

  useEffect(() => {
    if (gameState === 'gameover') {
      handleFinish();
    }
  }, [gameState, handleFinish]);

  if (loading) {
    return (
      <PageShell title={`Cognitive Time Attack (${langMeta.nativeName})`} description="Hardcore Brain Gym" icon={<Brain size={20} />}>
        <div className="max-w-3xl mx-auto py-20 text-center text-slate-400 font-mono">
          <Sparkles className="animate-spin text-amber-500 mx-auto mb-3" size={28} />
          <p>Đang chuẩn bị Đấu trường 60s cho {langMeta.flag} {langMeta.nativeName}...</p>
        </div>
      </PageShell>
    );
  }

  if (questions.length === 0) {
    return (
      <PageShell title={`Cognitive Time Attack (${langMeta.nativeName})`} description="Hardcore Brain Gym" icon={<Brain size={20} />}>
        <div className="mx-auto max-w-xl rounded-3xl border-2 border-b-4 border-amber-400/40 border-b-amber-500/50 bg-white p-8 text-center dark:bg-slate-900">
          <Mascot expression="thinking" size={110} />
          <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
            {LANGUAGE_CONTENT_UNAVAILABLE} {langMeta.flag} {langMeta.nativeName}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
            {LANGUAGE_CONTENT_UNAVAILABLE_DETAIL}
          </p>
        </div>
      </PageShell>
    );
  }

  const currentQ = questions[currentIndex % questions.length];

  return (
    <PageShell title={`Cognitive Time Attack (${langMeta.nativeName})`} description="Đấu trường nhận thức tàn nhẫn" icon={<Brain size={20} />}>
      <div className="max-w-3xl mx-auto space-y-6 font-mono">
        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 sm:p-12 text-center border border-rose-500/30">
            <Mascot expression="savage" size={130} message={`Dẹp bỏ trắc nghiệm! Hãy chứng minh khả năng PHẢN XẠ THỰC SỰ của bạn! 🐸🔥`} />
            <h2 className="text-3xl font-black text-rose-500 dark:text-rose-400 mt-6 uppercase tracking-wider">COGNITIVE TIME ATTACK</h2>
            <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
              Đây không phải là game đoán mò (MCQ). Từ vựng sẽ hiện ra, não bạn phải lập tức tìm ra nghĩa tiếng Việt. 
              Tốc độ phản xạ quyết định điểm số (<span className="text-emerald-400 font-bold">Dưới 1.5s = Điểm Tối Đa</span>). 
              Nhưng nếu bạn dối trá bấm "Đã Nhớ" mà kết quả lại sai, bạn sẽ bị phạt <span className="text-rose-400 font-bold text-base">TRỪ 10 GIÂY</span>!
            </p>

            <button
              onClick={startGame}
              className="mt-8 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-base uppercase tracking-widest transition-all shadow-xl shadow-rose-500/25 flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              <Brain size={22} className="animate-pulse" />
              <span>Chấp Nhận Thử Thách 60s</span>
            </button>
          </motion.div>
        )}

        {(gameState === 'playing' || gameState === 'revealed') && currentQ && (
          <div className="space-y-6">
            {/* Realtime Score Board */}
            <div className="grid grid-cols-3 items-center glass-card p-5 border border-slate-700 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-emerald-500/5" />
              <div className="relative z-10">
                <span className="text-xs text-slate-400 font-bold block">TỔNG ĐIỂM</span>
                <span className="text-3xl font-black text-emerald-400">{userScore}</span>
              </div>

              <div className="flex flex-col items-center relative z-10">
                <div className={`w-16 h-16 rounded-full border-4 ${timeLeft <= 10 ? 'border-rose-500 animate-pulse text-rose-500' : 'border-amber-400 text-amber-500'} bg-white dark:bg-slate-950 flex items-center justify-center font-black text-2xl shadow-lg`}>
                  {timeLeft}
                </div>
                {combo > 1 && (
                  <span className="mt-2 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase animate-bounce">
                    COMBO x{combo}!
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <span className="text-xs text-slate-400 font-bold block">CÂU SỐ</span>
                <span className="text-3xl font-black text-slate-200">{currentIndex + 1}</span>
              </div>
            </div>

            {/* Cognitive Card */}
            <AnimatePresence mode="wait">
              <motion.div key={currentQ.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-8 sm:p-12 border-2 border-slate-700 min-h-[300px] flex flex-col items-center justify-center text-center relative">
                
                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 font-sans tracking-tight">
                  {currentQ.word}
                </h3>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 mb-8">
                  {langMeta.nativeName}
                </span>

                {gameState === 'playing' ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={handleIHaveTheAnswer}
                    className="w-full max-w-md py-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xl uppercase transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex flex-col items-center gap-1 border-b-4 border-amber-600 cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><Brain size={24} /> TÔI ĐÃ NHỚ RA NGHĨA!</span>
                    <span className="text-xs font-semibold opacity-75">Bấm nhanh để được điểm Master</span>
                  </motion.button>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">ĐÁP ÁN ĐÚNG</p>
                      <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans">{currentQ.answer}</h4>
                      {currentQ.example && (
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-950 p-3 rounded-xl">"{currentQ.example}"</p>
                      )}
                      
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                        <Clock size={14} /> Phản xạ: {lastReactionTime.toFixed(2)}s
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <button
                        onClick={() => handleSelfAssessment(true)}
                        className="py-4 px-6 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check size={20} /> CHÍNH XÁC NHƯ TÔI NGHĨ
                      </button>
                      
                      <button
                        onClick={() => handleSelfAssessment(false)}
                        className="py-4 px-6 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2"><X size={20} /> TÔI ĐÃ NGHĨ SAI</div>
                        <span className="text-[10px] text-rose-500/70 group-hover:text-rose-400 flex items-center gap-1"><ShieldAlert size={10} /> PHẠT TRỪ 10 GIÂY</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center border border-emerald-500/40">
            <Mascot expression="happy" size={120} />
            
            <h2 className="flex items-center justify-center gap-2 text-3xl font-black text-white mt-4 uppercase">
              <CustomEmoji name="party-popper" size={30} />
              CUỘC ĐUA KẾT THÚC!
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Bạn đã đối mặt với áp lực thời gian cực kỳ tốt!
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">ĐIỂM NHẬN THỨC</span>
                <span className="text-2xl font-black text-emerald-400">{userScore} PTS</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">TỪ VỰNG HOÀN THÀNH</span>
                <span className="text-2xl font-black text-amber-400">{currentIndex}</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Thử Thách Lại</span>
            </button>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
