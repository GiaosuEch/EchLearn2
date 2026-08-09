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

const FROG = '#1BAD5B';
const FROG_DARK = '#087A42';
const INK = '#053C29';
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
        <ellipse cx="120" cy="201" rx="48" ry="6" fill={SHADOW} opacity="0.62" />
        <motion.g variants={bodyVariants} animate={motionEnabled ? state : false}>
          {celebrating && <>
            <path d="M76 147 C50 128 49 98 62 79" fill="none" stroke={FROG} strokeWidth="12" strokeLinecap="round" />
            <path d="M164 147 C190 128 191 98 178 79" fill="none" stroke={FROG} strokeWidth="12" strokeLinecap="round" />
          </>}

          <path d="M54 132 C54 99 79 83 120 83 C161 83 186 99 186 132 L186 153 C186 177 163 191 120 191 C77 191 54 177 54 153 Z" fill={FROG} />
          <circle cx="82" cy="78" r="27" fill={FROG_DARK} />
          <circle cx="158" cy="78" r="27" fill={FROG_DARK} />
          <motion.g variants={blinkVariants} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="82" cy="78" r="19" fill="white" />
            <circle cx="158" cy="78" r="19" fill="white" />
            <circle cx={state === 'thinking' ? 88 : 82} cy={state === 'thinking' ? 73 : 78} r="8" fill={INK} />
            <circle cx={state === 'thinking' ? 164 : 158} cy={state === 'thinking' ? 73 : 78} r="8" fill={INK} />
            <circle cx={state === 'thinking' ? 91 : 79} cy={state === 'thinking' ? 69 : 74} r="3" fill="white" />
            <circle cx={state === 'thinking' ? 167 : 155} cy={state === 'thinking' ? 69 : 74} r="3" fill="white" />
          </motion.g>

          {celebrating ? <path d="M98 131 Q120 153 142 131 Q120 160 98 131Z" fill={INK} /> : state === 'incorrect' ? <path d="M102 145 Q120 129 138 145" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" /> : <path d="M101 136 Q120 149 139 136" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />}

          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            <g transform={celebrating ? 'rotate(-4 120 159)' : 'rotate(5 181 151)'}>
              <rect x={celebrating ? 100 : 161} y={celebrating ? 136 : 128} width="40" height="45" rx="7" fill={BOOK} />
              <text x={celebrating ? 120 : 181} y={celebrating ? 156 : 147} textAnchor="middle" fill={BOOK_TEXT} fontSize="7.5" fontWeight="900" fontFamily="Arial, sans-serif">ECH</text>
              <text x={celebrating ? 120 : 181} y={celebrating ? 167 : 158} textAnchor="middle" fill={BOOK_TEXT} fontSize="7.5" fontWeight="900" fontFamily="Arial, sans-serif">BURI</text>
            </g>
          </motion.g>

          {state === 'incorrect' && <path d="M181 110 C181 103 191 103 191 110 C191 118 181 121 181 110Z" fill="#49B8E8" />}
          {state === 'thinking' && <><circle cx="186" cy="91" r="5" fill={BOOK} /><circle cx="198" cy="75" r="8" fill={BOOK} /></>}
          {motionEnabled && celebrating && <><circle cx="39" cy="77" r="6" fill="#F77B38" /><circle cx="201" cy="102" r="6" fill="#F77B38" /><path d="M38 144l7 7-7 7-7-7z" fill={BOOK} /><path d="202 46l7 7-7 7-7-7z" fill={BOOK} /></>}
        </motion.g>
      </svg>
    </motion.div>
  );
}

export default EchBuriAnimated;
