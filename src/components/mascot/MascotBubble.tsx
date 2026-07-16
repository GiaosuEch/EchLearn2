import { motion } from 'motion/react';
import Mascot from './Mascot';
import { SplitText } from '../ui/SplitText';

interface MascotBubbleProps {
  message: string;
  expression?: 'happy' | 'thinking' | 'encouraging' | 'surprised' | 'cool' | 'savage';
  size?: number;
  direction?: 'left' | 'right';
  className?: string;
  animateText?: boolean;
}

export function MascotBubble({ 
  message, 
  expression = 'happy', 
  size = 80, 
  direction = 'left',
  className = '',
  animateText = true
}: MascotBubbleProps) {
  return (
    <div className={`flex items-end gap-4 ${direction === 'right' ? 'flex-row-reverse' : ''} ${className}`}>
      <Mascot expression={expression} size={size} animate={true} />
      <motion.div
        initial={{ opacity: 0, x: direction === 'left' ? -20 : 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className={`relative glass-card px-5 py-4 max-w-md bg-dark-800/80 border-primary-500/30
          ${direction === 'left' ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm' : 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm'}`}
      >
        <div className={`absolute bottom-4 ${direction === 'left' ? '-left-2 border-r-primary-500/30' : '-right-2 border-l-primary-500/30'} 
          w-4 h-4 bg-dark-800/80 rotate-45 border-b border-dark-700/50`} 
        />
        <div className="relative z-10 text-white font-medium">
          {animateText ? <SplitText text={message} duration={0.2} delay={0.1} /> : message}
        </div>
      </motion.div>
    </div>
  );
}
