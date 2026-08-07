import { motion } from 'motion/react';
import { useAppStore } from '../../stores/appStore';
import MascotSkinRenderer from './MascotSkinRenderer';
import EchBuriAnimated from './EchBuriAnimated';

export type MascotExpression =
  | 'happy'
  | 'thinking'
  | 'encouraging'
  | 'surprised'
  | 'cool'
  | 'savage'
  | 'sad';

export type MascotAction = 'reading' | 'listening' | 'speaking' | 'celebrating' | 'thinking' | 'workout' | 'coffee' | 'sleeping' | 'wave';

interface MascotProps {
  expression?: MascotExpression;
  action?: MascotAction;
  size?: number;
  animate?: boolean;
  message?: string;
  skinId?: string;
}

export function VectorFrogMascot({ expression = 'happy', size = 100 }: { expression?: string; size?: number }) {
  const mappedState = expression === 'thinking' ? 'thinking' : expression === 'sad' ? 'incorrect' : expression === 'surprised' ? 'success' : 'idle';
  return <EchBuriAnimated size={size} state={mappedState} animate={false} />;
}

export default function Mascot({ expression = 'happy', action: _action, size = 100, animate = true, message, skinId: _skinId }: MascotProps) {
  const mascotAnimation = useAppStore((state) => state.mascotAnimation);
  const shouldAnimate = animate && mascotAnimation;

  // When a skinId is explicitly provided, render the dynamic SVG skin
  const useSkinRenderer = Boolean(_skinId);
  const mappedState = expression === 'thinking' ? 'thinking' : expression === 'sad' ? 'incorrect' : expression === 'surprised' ? 'success' : 'idle';

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative cursor-pointer group flex items-center justify-center"
        animate={shouldAnimate ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.1, rotate: [-2, 2, 0] }}
        whileTap={{ scale: 0.94 }}
        style={{ width: size, height: size, willChange: shouldAnimate ? 'transform' : 'auto' }}
        title="Ếch Buri — EchLearn Official Mascot"
      >
        {useSkinRenderer ? (
          <MascotSkinRenderer skinId={_skinId!} size={size} expression={expression} />
        ) : (
          <EchBuriAnimated size={size} state={mappedState} animate={animate} />
        )}
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 text-xs text-slate-900 dark:text-emerald-300 font-extrabold text-center shadow-lg max-w-xs"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 rotate-45 border-l-2 border-t-2 border-emerald-500/40" />
          {message}
        </motion.div>
      )}
    </div>
  );
}
