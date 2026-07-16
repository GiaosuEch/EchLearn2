import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import Mascot from './Mascot';
import { useEffect, useState } from 'react';

interface MascotReactionProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  autoHideMs?: number;
}

export function MascotReaction({ type, message, autoHideMs }: MascotReactionProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHideMs) {
      const timer = setTimeout(() => setVisible(false), autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [autoHideMs]);

  useEffect(() => {
    if (type === 'success') {
      confetti({
        particleCount: 30,
        spread: 55,
        startVelocity: 25,
        gravity: 1.1,
        scalar: 0.7,
        origin: { x: 0.15, y: 0.7 },
        disableForReducedMotion: true,
      });
    }
  }, [type]);

  if (!visible) return null;

  const getExpression = () => {
    switch (type) {
      case 'success': return 'happy';
      case 'error': return 'savage';
      case 'warning': return 'thinking';
      default: return 'cool';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-success/20 border-success/50';
      case 'error': return 'bg-error/20 border-error/50';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/50';
      default: return 'bg-primary-500/20 border-primary-500/50';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ type: 'spring', bounce: type === 'success' ? 0.6 : 0.35, duration: 0.5 }}
        className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-md ${getBgColor()}`}
      >
        <div className="shrink-0">
          <Mascot expression={getExpression()} size={40} />
        </div>
        {message && (
          <p className="text-sm font-medium text-white">{message}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
