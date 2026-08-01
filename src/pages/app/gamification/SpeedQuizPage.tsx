import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import PageShell from '../../PageShell';
import Mascot from '../../../components/mascot/Mascot';
import { useLearningStore } from '../../../stores/learningStore';
import { useAuthStore } from '../../../stores/authStore';
import { useAppStore } from '../../../stores/appStore';
import { soundService } from '../../../services/soundService';
import { vocabularyService } from '../../../services/vocabularyService';
import { displayLearningWord, getLanguageMeta, getMeaningForNativeLanguage, shuffle } from '../../../utils/languageUtils';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [pepeScore, setPepeScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const langMeta = getLanguageMeta(currentLanguage);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    vocabularyService.getVocabularyForLanguage(currentLanguage).then((items) => {
      if (!isMounted) return;
      
      const generatedQuestions: Question[] = [];
      const validItems = (items || []).filter((it) => Boolean(displayLearningWord(it)));

      // Fast O(N) sampling: take 150 items max to prevent CPU thread lock
      const sampledItems = shuffle(validItems).slice(0, 150);

      // Collect distractor pool once in O(N)
      const allMeanings = Array.from(new Set(
        sampledItems
          .map((it) => it.meaningVietnamese || getMeaningForNativeLanguage(it, nativeLanguage, displayLearningWord(it)))
          .filter(Boolean)
      ));

      sampledItems.forEach((item, idx) => {
        const word = displayLearningWord(item);
        const meaning = item.meaningVietnamese || getMeaningForNativeLanguage(item, nativeLanguage, word);
        if (!word || !meaning) return;

        const otherMeanings = allMeanings.filter((m) => m !== meaning);
        const distractors = shuffle(otherMeanings).slice(0, 3);
        
        const fallbackDistractorPool = ['con bạch tuộc', 'con cá voi', 'con ong', 'con sư tử', 'nỗ lực', 'quyết định', 'giờ nghỉ giải lao', 'sự tự tin'];
        let fbIdx = 0;
        while (distractors.length < 3) {
          const fb = fallbackDistractorPool[fbIdx % fallbackDistractorPool.length];
          if (fb !== meaning && !distractors.includes(fb)) {
            distractors.push(fb);
          }
          fbIdx++;
        }

        const options = shuffle(Array.from(new Set([meaning, ...distractors])));

        generatedQuestions.push({
          id: idx + 1,
          question: `Từ "${word}" (${langMeta.flag} ${langMeta.nativeName}) có nghĩa là gì?`,
          options,
          answer: meaning,
          explanation: `"${word}" có nghĩa là "${meaning}". ${item.example ? `Ví dụ: ${item.example}` : ''}`
        });
      });

      setQuestions(generatedQuestions.length > 0 ? generatedQuestions : [
        {
          id: 1,
          question: `Từ "Cat" có nghĩa là gì?`,
          options: ['Con mèo', 'Con chó', 'Con voi', 'Con hổ'],
          answer: 'Con mèo',
          explanation: '"Cat" có nghĩa là "Con mèo".'
        }
      ]);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load quiz items for language:', currentLanguage, err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentLanguage]);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('gameover');
            return 0;
          }
          if (prev % 3 === 0) {
            setPepeScore((score) => score + 10);
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
    setPepeScore(0);
    setCombo(0);
    setSelectedOption(null);
  };

  const handleSelect = (option: string) => {
    if (selectedOption || gameState !== 'playing') return;
    setSelectedOption(option);
    const q = questions[currentIndex % questions.length];

    if (option === q.answer) {
      soundService.playCorrect();
      const points = 10 * (combo + 1);
      setUserScore((prev) => prev + points);
      setCombo((prev) => prev + 1);
    } else {
      soundService.playTone(220, 'sawtooth', 0.2);
      setCombo(0);
    }

    setTimeout(() => {
      setSelectedOption(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setGameState('gameover');
      }
    }, 900);
  };

  const handleFinish = async () => {
    if (userScore > pepeScore) {
      await addXP(150, 'speed_quiz_victory');
      addCoins?.(30);
    } else {
      await addXP(50, 'speed_quiz_completed');
    }
  };

  useEffect(() => {
    if (gameState === 'gameover') {
      handleFinish();
    }
  }, [gameState]);

  if (loading) {
    return (
      <PageShell title="Mode Thách Đấu AI Trực Tiếp Với Pepe (Speed Quiz 60s)" description="Thi đấu trả lời nhanh 60s cùng Linh Vật Pepe Coach" icon={<Zap size={20} />}>
        <div className="max-w-3xl mx-auto py-20 text-center text-slate-400 font-mono">
          <Sparkles className="animate-spin text-amber-500 mx-auto mb-3" size={28} />
          <p>Đang chuẩn bị Đấu trường 60s cho {langMeta.flag} {langMeta.nativeName}...</p>
        </div>
      </PageShell>
    );
  }

  const currentQ = questions[currentIndex % questions.length];

  return (
    <PageShell title={`Mode Thách Đấu AI 60s (${langMeta.flag} ${langMeta.nativeName})`} description={`Thi đấu trả lời nhanh 60s cùng Linh Vật Pepe Coach cho ${langMeta.nativeName}`} icon={<Zap size={20} />}>
      <div className="max-w-3xl mx-auto space-y-6 font-mono">
        {gameState === 'idle' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 sm:p-12 text-center border border-amber-500/30">
            <Mascot expression="cool" size={130} message={`Thách đấu 60s ${langMeta.flag} ${langMeta.nativeName} xem ai nhanh trí hơn nhé! 🐸⚡`} />
            <h2 className="text-3xl font-black text-white mt-6 uppercase tracking-wider">ĐẤU TRƯỜNG TỐC ĐỘ 60 GIÂY ({langMeta.nativeName.toUpperCase()})</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              Trả lời đúng nhiều câu từ vựng {langMeta.flag} trong 60s để vượt qua Pepe AI Opponent. Tích lũy Combo để nhân điểm thưởng XP & Coins!
            </p>

            <button
              onClick={startGame}
              className="mt-8 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base uppercase tracking-widest transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 mx-auto cursor-pointer"
            >
              <Zap size={22} className="animate-bounce" />
              <span>Bắt Đầu Thách Đấu</span>
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && currentQ && (
          <div className="space-y-6">
            {/* Realtime Score Board */}
            <div className="grid grid-cols-3 items-center glass-card p-5 border border-amber-500/30 text-center">
              <div>
                <span className="text-xs text-slate-400 font-bold block">BẠN ({user?.displayName || 'Learner'})</span>
                <span className="text-3xl font-black text-amber-400">{userScore} PTS</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-slate-950 flex items-center justify-center font-bold text-lg text-amber-400 shadow-lg">
                  {timeLeft}s
                </div>
                {combo > 1 && (
                  <span className="mt-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] uppercase animate-pulse">
                    COMBO x{combo}!
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400 font-bold block">PEPE AI OPPONENT</span>
                <span className="text-3xl font-black text-emerald-400">{pepeScore} PTS</span>
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div key={currentQ.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="glass-card p-6 sm:p-8 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4 border-b border-slate-800 pb-3">
                  <span>CÂU HỎI {currentIndex + 1} / {questions.length}</span>
                  <span className="text-amber-400 font-bold">THỜI GIAN CÒN LẠI: {timeLeft}S</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 font-sans leading-relaxed">
                  {currentQ.question}
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === currentQ.answer;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        disabled={Boolean(selectedOption)}
                        className={`w-full p-4 rounded-xl border text-left font-bold text-sm transition-all cursor-pointer ${
                          selectedOption
                            ? isCorrect
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : isSelected
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            : 'bg-slate-900 border-slate-800 hover:border-amber-400 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {selectedOption && isCorrect && <Check size={18} className="text-emerald-400" />}
                          {selectedOption && isSelected && !isCorrect && <X size={18} className="text-rose-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center border border-amber-500/40">
            <Mascot expression={userScore > pepeScore ? 'happy' : 'thinking'} size={120} />
            
            <h2 className="text-3xl font-black text-white mt-4 uppercase">
              {userScore > pepeScore ? '🎉 CHIẾN THẮNG RỰC RỠ!' : '🤝 HÒA SỨC CÙNG PEPE AI!'}
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              {userScore > pepeScore ? 'Bạn đã xuất sắc vượt qua Pepe AI Opponent!' : 'Nỗ lực rất tốt! Hãy tiếp tục luyện tập nhé!'}
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">ĐIỂM CỦA BẠN</span>
                <span className="text-2xl font-black text-amber-400">{userScore} PTS</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">THƯỞNG XP & COINS</span>
                <span className="text-2xl font-black text-emerald-400">+{userScore > pepeScore ? 150 : 50} XP</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Chơi Thách Đấu Lại</span>
            </button>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
