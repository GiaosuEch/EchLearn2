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

const FROG = '#1CB15A';
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
        <ellipse cx="120" cy="211" rx="53" ry="7" fill={SHADOW} opacity="0.72" />
        <motion.g variants={bodyVariants} animate={motionEnabled ? state : false}>
          {celebrating && <>
            <path d="M75 151 C47 128 47 91 61 69" fill="none" stroke={FROG} strokeWidth="13" strokeLinecap="round" />
            <path d="M165 151 C193 128 193 91 179 69" fill="none" stroke={FROG} strokeWidth="13" strokeLinecap="round" />
          </>}
          {state === 'welcome' && (
            <motion.g animate={motionEnabled ? { rotate: [0, -14, 12, 0] } : undefined} transition={{ duration: 0.66, ease: 'easeInOut' }} style={{ transformBox: 'fill-box', transformOrigin: 'bottom right' }}>
              <path d="M75 151 C52 137 49 107 61 86" fill="none" stroke={FROG} strokeWidth="13" strokeLinecap="round" />
              <circle cx="62" cy="84" r="8" fill={FROG} />
            </motion.g>
          )}

          <path d="M67 143 C62 116 68 89 89 75 C97 68 107 65 120 65 C133 65 143 68 151 75 C172 89 178 116 173 143 L173 164 C173 188 154 202 120 202 C86 202 67 188 67 164 Z" fill={FROG} />
          <ellipse cx="88" cy="76" rx="29" ry="30" fill={FROG_DARK} />
          <ellipse cx="152" cy="76" rx="29" ry="30" fill={FROG_DARK} />
          <motion.g variants={blinkVariants} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="88" cy="76" r="20" fill="white" />
            <circle cx="152" cy="76" r="20" fill="white" />
            <circle cx={state === 'thinking' ? 94 : 88} cy={state === 'thinking' ? 71 : 76} r="8.5" fill={INK} />
            <circle cx={state === 'thinking' ? 158 : 152} cy={state === 'thinking' ? 71 : 76} r="8.5" fill={INK} />
            <circle cx={state === 'thinking' ? 97 : 85} cy={state === 'thinking' ? 67 : 72} r="3.25" fill="white" />
            <circle cx={state === 'thinking' ? 161 : 149} cy={state === 'thinking' ? 67 : 72} r="3.25" fill="white" />
          </motion.g>

          <circle cx="112" cy="111" r="2.15" fill={FROG_DARK} />
          <circle cx="128" cy="111" r="2.15" fill={FROG_DARK} />
          {celebrating ? <path d="M96 132 Q120 156 144 132 Q120 164 96 132Z" fill={INK} /> : state === 'incorrect' ? <path d="M100 148 Q120 129 140 148" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" /> : <path d="M97 136 Q120 151 143 136" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />}

          <ellipse cx="87" cy="194" rx="23" ry="10" fill={FROG} />
          <ellipse cx="153" cy="194" rx="23" ry="10" fill={FROG} />
          {!celebrating && state !== 'welcome' && <path d="M75 153 C61 158 60 174 72 181" fill="none" stroke={FROG} strokeWidth="13" strokeLinecap="round" />}

          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            <g transform={celebrating ? 'rotate(-4 120 162)' : 'rotate(5 166 166)'}>
              <rect x={celebrating ? 96 : 142} y={celebrating ? 134 : 137} width="48" height="56" rx="9" fill={BOOK} stroke={FROG_DARK} strokeWidth="3" />
              <path d={celebrating ? 'M120 138V186' : 'M166 141V189'} stroke="white" strokeWidth="3" opacity="0.88" />
              <path d={celebrating ? 'M132 134h12v12' : 'M178 137h12v12'} fill="none" stroke={FROG_DARK} strokeWidth="3" strokeLinejoin="round" />
              <text x={celebrating ? 120 : 166} y={celebrating ? 158 : 161} textAnchor="middle" fill={BOOK_TEXT} fontSize="8" fontWeight="900" fontFamily="Arial, sans-serif">ECH</text>
              <text x={celebrating ? 120 : 166} y={celebrating ? 170 : 173} textAnchor="middle" fill={BOOK_TEXT} fontSize="8" fontWeight="900" fontFamily="Arial, sans-serif">BURI</text>
            </g>
          </motion.g>

          {state === 'incorrect' && <path d="M181 110 C181 103 191 103 191 110 C191 118 181 121 181 110Z" fill="#49B8E8" />}
          {state === 'thinking' && <><circle cx="188" cy="91" r="5" fill={BOOK} /><circle cx="200" cy="75" r="8" fill={BOOK} /></>}
          {motionEnabled && celebrating && <><circle cx="39" cy="77" r="6" fill="#F77B38" /><circle cx="201" cy="102" r="6" fill="#F77B38" /><path d="M38 144l7 7-7 7-7-7z" fill={BOOK} /><path d="M202 46l7 7-7 7-7-7z" fill={BOOK} /></>}
        </motion.g>
      </svg>
    </motion.div>
  );
}

export default EchBuriAnimated;
