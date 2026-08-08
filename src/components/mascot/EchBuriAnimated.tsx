import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useAppStore } from '../../stores/appStore';

export type EchBuriAnimationState = 'idle' | 'welcome' | 'success' | 'incorrect' | 'thinking' | 'cheering' | 'listening';

export interface EchBuriAnimatedProps {
  size?: number;
  state?: EchBuriAnimationState;
  animate?: boolean;
  className?: string;
}

const bodyVariants: Variants = {
  idle: { y: [0, -2, 0], rotate: 0, transition: { duration: 3.2, ease: 'easeInOut', repeat: Infinity } },
  welcome: { rotate: [0, -5, 5, 0], transition: { duration: 0.62, ease: 'easeInOut' } },
  success: { y: [0, -14, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.72, ease: 'easeInOut' } },
  incorrect: { x: [0, -4, 4, 0], transition: { duration: 0.38, ease: 'easeInOut' } },
  thinking: { y: [0, -3, 0], rotate: [0, 6, 4], transition: { duration: 2.2, ease: 'easeInOut', repeat: Infinity } },
  cheering: { y: [0, -20, -4, -14, 0], rotate: [0, -6, 6, -3, 0], transition: { duration: 0.8, ease: 'easeInOut' } },
  listening: { y: [0, -2, 0], rotate: [0, -4, -4, 0], transition: { duration: 2.4, ease: 'easeInOut', repeat: Infinity } },
};

const blinkVariants: Variants = {
  idle: { scaleY: [1, 1, 0.12, 1], transition: { duration: 5.4, times: [0, 0.92, 0.96, 1], ease: 'easeInOut', repeat: Infinity } },
  welcome: { scaleY: [1, 0.12, 1], transition: { duration: 0.34, delay: 0.42, ease: 'easeInOut' } },
  success: { scaleY: 1, transition: { duration: 0.2 } },
  incorrect: { scaleY: 0.6, transition: { duration: 0.2 } },
  thinking: { scaleY: 0.92, transition: { duration: 0.2 } },
  cheering: { scaleY: 1.08, transition: { duration: 0.2 } },
  listening: { scaleY: 0.9, transition: { duration: 0.2 } },
};

const bookVariants: Variants = {
  idle: { y: 0, rotate: 0, transition: { duration: 0.4 } },
  welcome: { y: 0, rotate: 0, transition: { duration: 0.4 } },
  success: { y: [0, -22, -14], rotate: [0, -12, 12, 0], transition: { duration: 0.72, ease: 'easeInOut' } },
  incorrect: { y: 10, rotate: -5, transition: { duration: 0.3 } },
  thinking: { y: -2, rotate: 4, transition: { duration: 0.4 } },
  cheering: { y: [0, -24, -16], rotate: [0, -12, 12, 0], transition: { duration: 0.8 } },
  listening: { y: 0, rotate: 0, transition: { duration: 0.4 } },
};

const FROG = '#19A957';
const FROG_DARK = '#08723B';
const INK = '#10231D';
const BOOK = '#FFD54F';
const BOOK_TEXT = '#17482C';
const SHADOW = '#D9E2DD';
const eyeOrigin = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

/** The canonical, intentionally simple Ech Buri companion. */
export function EchBuriAnimated({ size = 120, state = 'idle', animate = true, className = '' }: EchBuriAnimatedProps) {
  const reducedMotion = useReducedMotion();
  const mascotAnimation = useAppStore((store) => store.mascotAnimation);
  const motionEnabled = animate && !reducedMotion && mascotAnimation;
  const celebrating = state === 'success' || state === 'cheering';

  return (
    <motion.div
      className={className}
      role="img"
      aria-label="Linh vật Ech Buri"
      data-mascot-state={state}
      style={{ width: size, height: size, willChange: motionEnabled ? 'transform' : 'auto' }}
      initial={false}
      animate={motionEnabled ? state : undefined}
      whileHover={motionEnabled ? { y: -6, rotate: 1.5, scale: 1.04 } : undefined}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true" focusable="false">
        <ellipse cx="120" cy="214" rx="58" ry="8" fill={SHADOW} opacity="0.72" />
        <motion.g variants={bodyVariants} animate={motionEnabled ? state : false}>
          {celebrating && <><path d="M76 137 Q45 96 60 66" fill="none" stroke={FROG} strokeWidth="17" strokeLinecap="round" /><path d="M164 137 Q195 96 180 66" fill="none" stroke={FROG} strokeWidth="17" strokeLinecap="round" /></>}
          {state === 'welcome' && <motion.path d="M76 140 Q48 116 54 82" fill="none" stroke={FROG} strokeWidth="17" strokeLinecap="round" animate={motionEnabled ? { rotate: [0, -18, 14, 0] } : undefined} transition={{ duration: 0.62, ease: 'easeInOut' }} style={{ transformBox: 'fill-box', transformOrigin: 'bottom right' }} />}
          <path d="M55 122 C55 86 76 57 120 57 C164 57 185 86 185 122 L185 166 C185 196 157 208 120 208 C83 208 55 196 55 166 Z" fill={FROG} />
          <circle cx="88" cy="70" r="30" fill={FROG_DARK} />
          <circle cx="152" cy="70" r="30" fill={FROG_DARK} />
          <motion.g variants={blinkVariants} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="88" cy="70" r="21" fill="white" />
            <circle cx="152" cy="70" r="21" fill="white" />
            <circle cx={state === 'thinking' ? 94 : 88} cy={state === 'thinking' ? 65 : 70} r="9" fill={INK} />
            <circle cx={state === 'thinking' ? 158 : 152} cy={state === 'thinking' ? 65 : 70} r="9" fill={INK} />
            <circle cx={state === 'thinking' ? 97 : 85} cy={state === 'thinking' ? 61 : 66} r="3.5" fill="white" />
            <circle cx={state === 'thinking' ? 161 : 149} cy={state === 'thinking' ? 61 : 66} r="3.5" fill="white" />
          </motion.g>
          {celebrating ? <path d="M96 115 Q120 142 144 115 Q120 154 96 115Z" fill={INK} /> : state === 'incorrect' ? <path d="M100 140 Q120 121 140 140" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" /> : <path d="M99 124 Q120 139 141 124" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />}
          <circle cx="112" cy="104" r="2.2" fill={FROG_DARK} /><circle cx="128" cy="104" r="2.2" fill={FROG_DARK} />
          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            <rect x={celebrating ? 96 : 142} y={celebrating ? 130 : 139} width="48" height="56" rx="8" fill={BOOK} transform={celebrating ? 'rotate(-4 120 158)' : 'rotate(4 166 167)'} />
            <path d={celebrating ? 'M120 134V178' : 'M166 143V188'} stroke="white" strokeWidth="3" opacity="0.85" />
            <text x={celebrating ? 120 : 166} y={celebrating ? 155 : 164} textAnchor="middle" fill={BOOK_TEXT} fontSize="8" fontWeight="900" fontFamily="sans-serif">ECH</text>
            <text x={celebrating ? 120 : 166} y={celebrating ? 166 : 175} textAnchor="middle" fill={BOOK_TEXT} fontSize="8" fontWeight="900" fontFamily="sans-serif">BURI</text>
          </motion.g>
          {!celebrating && state !== 'welcome' && <path d="M69 145 Q57 159 69 174" fill="none" stroke={FROG} strokeWidth="17" strokeLinecap="round" />}
          {state === 'incorrect' && <path d="M184 102 C184 95 195 95 195 102 C195 110 184 113 184 102Z" fill="#49B8E8" />}
          {state === 'thinking' && <><circle cx="192" cy="83" r="5" fill={BOOK} /><circle cx="204" cy="67" r="8" fill={BOOK} /></>}
          {motionEnabled && celebrating && <><circle cx="38" cy="76" r="6" fill="#F77B38" /><circle cx="204" cy="101" r="6" fill="#F77B38" /><path d="M38 143l7 7-7 7-7-7z" fill={BOOK} /><path d="M204 45l7 7-7 7-7-7z" fill={BOOK} /></>}
        </motion.g>
      </svg>
    </motion.div>
  );
}

export default EchBuriAnimated;
