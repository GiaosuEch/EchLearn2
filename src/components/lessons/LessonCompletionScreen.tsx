import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowRight, Zap, Target, Flame, Coins } from 'lucide-react';
import { useNavigate } from 'react-router';
import Mascot from '../mascot/Mascot';
import { BlobBackground } from '../ui/BlobBackground';
import { soundService } from '../../services/soundService';
import confetti from 'canvas-confetti';

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
    accuracy === 100 ? (t('lesson.completion.perfect') || "PERFECT! You're on fire today! 🔥") :
    accuracy >= 80 ? (t('lesson.completion.great') || "Great job! You're getting stronger! 💪") :
    accuracy >= 50 ? (t('lesson.completion.good') || "Not bad! A little more practice and you'll nail it. 🐸") :
    (t('lesson.completion.poor') || "Oops! Looks like we need to review this one. Don't give up! 🌱");

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
            Continue <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={onRetry}
            className="w-full py-4 bg-dark-800 hover:bg-dark-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors border border-dark-700"
          >
            <RotateCcw size={20} /> Review Lesson
          </button>
        </motion.div>
      </div>
    </div>
  );
}
