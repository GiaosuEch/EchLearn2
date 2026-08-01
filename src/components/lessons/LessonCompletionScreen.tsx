import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowRight, Zap, Target, Flame, Coins } from 'lucide-react';
import { useNavigate } from 'react-router';
import Mascot from '../mascot/Mascot';
import { BlobBackground } from '../ui/BlobBackground';
import { soundService } from '../../services/soundService';
import confetti from 'canvas-confetti';
import { CustomEmote } from '../common/CustomEmote';

interface LessonCompletionProps {
  score: number;
  total: number;
  xpEarned: number;
  coinsEarned: number;
  onRetry: () => void;
  nextLessonPath?: string;
}

export function LessonCompletionScreen({ score, total, xpEarned, coinsEarned, onRetry, nextLessonPath = '/app' }: LessonCompletionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const accuracy = Math.round((score / total) * 100);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    soundService.playLessonComplete();
    
    if (accuracy >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899']
      });
    }

    const timer = setTimeout(() => setShowStats(true), 1500);
    return () => clearTimeout(timer);
  }, [accuracy]);

  const buriMessage = 
    accuracy === 100 ? (t('lesson.completion.perfect') || "XUẤT SẮC! Phản xạ chuẩn xác tuyệt đối!") :
    accuracy >= 80 ? (t('lesson.completion.great') || "BÀI HỌC THÀNH CÔNG! Bạn đang làm rất tốt!") :
    accuracy >= 50 ? (t('lesson.completion.good') || "KẾT QUẢ TỐT! Cố gắng thêm một chút nữa nhé.") :
    (t('lesson.completion.poor') || "Hãy ôn lại các từ khó và thử lại bài này.");

  const completionEmote = 
    accuracy >= 80 ? 'blob-cheer' : 
    accuracy >= 50 ? 'peepo-happy' : 
    'ech-buri-think';

  const buriExpression = 
    accuracy >= 80 ? 'encouraging' : 
    accuracy >= 50 ? 'happy' : 
    'thinking';

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center relative overflow-hidden p-4">
      <BlobBackground colors={['bg-success/20', 'bg-primary-500/20', 'bg-emerald-500/20']} />
      
      <div className="max-w-lg w-full relative z-10 flex flex-col items-center">
        {/* Mascot & Title */}
        <motion.div 
          initial={{ scale: 0, y: 50 }} 
          animate={{ scale: 1, y: 0 }} 
          transition={{ type: 'spring', bounce: 0.5 }}
          className="mb-8 relative"
        >
          <Mascot expression={buriExpression} size={120} message={buriMessage} />
          <div className="absolute -bottom-2 -right-2">
            <CustomEmote type={completionEmote} size={36} />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="text-4xl font-extrabold text-white mb-8 text-center"
        >
          Lesson Complete!
        </motion.h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: showStats ? 1 : 0, x: showStats ? 0 : -20 }} 
            transition={{ delay: 0 }}
            className="glass-card p-5 flex flex-col items-center justify-center border-t-4 border-t-primary-500"
          >
            <Zap className="text-primary-400 mb-2" size={28} />
            <p className="text-3xl font-black text-white">+{xpEarned}</p>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mt-1">Total XP</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: showStats ? 1 : 0, x: showStats ? 0 : 20 }} 
            transition={{ delay: 0.1 }}
            className="glass-card p-5 flex flex-col items-center justify-center border-t-4 border-t-yellow-500"
          >
            <Coins className="text-yellow-400 mb-2" size={28} />
            <p className="text-3xl font-black text-white">+{coinsEarned}</p>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mt-1">Coins Earned</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: showStats ? 1 : 0, x: showStats ? 0 : -20 }} 
            transition={{ delay: 0.2 }}
            className="glass-card p-5 flex flex-col items-center justify-center border-t-4 border-t-success"
          >
            <Target className="text-success mb-2" size={28} />
            <p className="text-3xl font-black text-white">{accuracy}%</p>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mt-1">{t('lesson.completion.accuracy') || 'Accuracy'}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: showStats ? 1 : 0, x: showStats ? 0 : 20 }} 
            transition={{ delay: 0.3 }}
            className="glass-card p-5 flex flex-col items-center justify-center border-t-4 border-t-accent-500"
          >
            <Flame className="text-accent-400 mb-2" size={28} />
            <p className="text-3xl font-black text-white">{score}/{total}</p>
            <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mt-1">Correct</p>
          </motion.div>
        </div>

        {/* POST-LESSON BILINGUAL SUMMARY & COMBINED SENTENCES PANEL */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-8 space-y-4"
          >
            {/* 1. Combined Sentences Builder */}
            <div className="glass-card p-5 border border-sky-500/30 bg-slate-950/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-sky-400 font-bold uppercase tracking-wide flex items-center gap-2">
                  🧩 KẾT HỢP TỪ VỰNG THÀNH CÂU BẢN XỨ HOÀN CHỈNH
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Ứng dụng thực tế</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-emerald-400 font-bold">"C’est un sentiment vraiment magnifique de réussir ensemble."</p>
                  <p className="text-slate-400 text-[11px] mt-1">→ Đó là một cảm giác thật sự tuyệt vời khi chúng ta cùng nhau thành công.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-sky-400 font-bold">"Je dis toujours la vérité avec mes amis à Paris."</p>
                  <p className="text-slate-400 text-[11px] mt-1">→ Tôi luôn nói sự thật với bạn bè của tôi ở Paris.</p>
                </div>
              </div>
            </div>

            {/* 2. Bilingual Mistake Notebook Analytics */}
            <div className="glass-card p-5 border border-amber-500/30 bg-slate-950/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wide flex items-center gap-2">
                  ⚠️ THỐNG KÊ & PHÂN TÍCH LỖI SAI SONG NGỮ
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {total - score > 0 ? `${total - score} Lỗi cần ôn lại` : '0 Lỗi - Xuất sắc!'}
                </span>
              </div>
              {total - score > 0 ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1 font-mono">
                  <p className="font-bold">💡 Ghi chú phân tích AI:</p>
                  <p className="text-[11px] text-slate-300">
                    Bạn đã nhầm lẫn đáp án ở một số câu trắc nghiệm. Hãy chú ý đối chiếu giữa từ bản xứ tiếng Pháp/Anh và nghĩa tiếng Việt tương ứng khi ôn tập!
                  </p>
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-bold text-center py-2">
                  🎉 Bạn không mắc lỗi sai nào! Bạn đã làm chủ 100% nội dung bài học hôm nay!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: showStats ? 1 : 0, y: showStats ? 0 : 20 }} 
          transition={{ delay: 0.6 }}
          className="w-full space-y-3"
        >
          <button 
            onClick={() => navigate(nextLessonPath)}
            className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary-500/20 hover:-translate-y-1"
          >
            Tiếp Tục Bài Học <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={onRetry}
            className="w-full py-4 bg-dark-800 hover:bg-dark-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border border-dark-700 text-slate-300"
          >
            <RotateCcw size={20} /> Ôn Lại Bài Học
          </button>
        </motion.div>
      </div>
    </div>
  );
}
