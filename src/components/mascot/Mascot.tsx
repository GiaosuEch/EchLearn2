import { motion } from 'motion/react';
import MascotSkinRenderer from './MascotSkinRenderer';
import EchBuriAnimated, { type EchBuriAnimationState } from './EchBuriAnimated';

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

export function toEchBuriState(
  expression: MascotExpression = 'happy',
  action?: MascotAction,
): EchBuriAnimationState {
  if (action === 'wave') return 'welcome';
  if (action === 'listening' || action === 'speaking') return 'listening';
  if (action === 'celebrating') return 'cheering';
  if (action === 'thinking' || expression === 'thinking') return 'thinking';
  if (expression === 'sad') return 'incorrect';
  if (expression === 'surprised' || expression === 'encouraging') return 'success';
  return 'idle';
}

export function VectorFrogMascot({ expression = 'happy', size = 100 }: { expression?: MascotExpression; size?: number }) {
  return <EchBuriAnimated size={size} state={toEchBuriState(expression)} animate={false} />;
}

export default function Mascot({ expression = 'happy', action, size = 100, animate = true, message, skinId: _skinId }: MascotProps) {
  // When a skinId is explicitly provided, render the dynamic SVG skin
  const useSkinRenderer = Boolean(_skinId);
  const mappedState = toEchBuriState(expression, action);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative cursor-pointer group flex items-center justify-center"
        style={{ width: size, height: size }}
        title="Ếch Buri — EchLearn Official Mascot"
      >
        {useSkinRenderer ? (
          <MascotSkinRenderer skinId={_skinId!} size={size} expression={expression} />
        ) : (
          <EchBuriAnimated size={size} state={mappedState} animate={animate} />
        )}
      </div>

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
