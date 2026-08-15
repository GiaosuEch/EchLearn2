import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type MascotEmotion = 'idle' | 'happy' | 'sad' | 'thinking' | 'celebrate';

interface MascotFeedbackProps {
  emotion: MascotEmotion;
  message?: string;
}

const emotionImages: Record<MascotEmotion, string> = {
  idle: '/mascots/ech_buri_official_mascot.png',
  happy: '/mascots/pepe_mascot_avatar.png',
  sad: '/mascots/pepe_mascot_sad.png',
  thinking: '/mascots/pepe_mascot_thinking.png',
  celebrate: '/mascots/pepe_mascot_celebrate.png',
};

export function MascotFeedback({ emotion, message }: MascotFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (emotion !== 'idle') {
      setIsVisible(true);
      if (emotion === 'celebrate' || emotion === 'happy') {
        import('canvas-confetti').then((module) => {
          const confetti = module.default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#fcd34d'],
          });
        });
      }
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [emotion]);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end">
      <AnimatePresence>
        {isVisible && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-2xl p-4 shadow-xl max-w-[250px]"
          >
            <p className="text-sm font-bold text-slate-800 dark:text-white text-center">
              {message}
            </p>
            {/* Speech bubble arrow */}
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white dark:bg-slate-800 border-b-2 border-r-2 border-emerald-500 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            key={emotion}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-32 h-32 md:w-40 md:h-40"
          >
            <img 
              src={emotionImages[emotion]} 
              alt={`Ech Buri ${emotion}`} 
              className="w-full h-full object-contain drop-shadow-md filter brightness-105"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
