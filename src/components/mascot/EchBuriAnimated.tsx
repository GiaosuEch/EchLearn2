import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useAppStore } from '../../stores/appStore';

export type EchBuriAnimationState = 'idle' | 'success';

export interface EchBuriAnimatedProps {
  size?: number;
  state?: EchBuriAnimationState;
  animate?: boolean;
  className?: string;
}

const bodyVariants: Variants = {
  idle: { y: [0, -3, 0], rotate: 0, transition: { duration: 3.2, ease: 'easeInOut', repeat: Infinity } },
  success: { y: [0, -12, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.68, ease: 'easeInOut' } },
};

/** Eyes close briefly once per cycle; `custom` staggers the second eye. */
const blinkVariants: Variants = {
  idle: (delay: number) => ({
    scaleY: [1, 1, 0.12, 1],
    transition: { duration: 5.4, times: [0, 0.92, 0.96, 1], ease: 'easeInOut', repeat: Infinity, delay },
  }),
  success: { scaleY: 1, transition: { duration: 0.2 } },
};

/** The raised arm and book pose that reads as celebration. */
const bookVariants: Variants = {
  idle: { y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  success: { y: [0, -16, -11], transition: { duration: 0.68, ease: 'easeInOut' } },
};

const eyeOrigin = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

/** Original flat SVG mascot for the public hero and dashboard highlights. */
export function EchBuriAnimated({ size = 120, state = 'idle', animate = true, className = '' }: EchBuriAnimatedProps) {
  const reducedMotion = useReducedMotion();
  const mascotAnimation = useAppStore((store) => store.mascotAnimation);
  const motionEnabled = animate && !reducedMotion && mascotAnimation;

  return (
    <motion.div
      className={className}
      role="img"
      aria-label="Linh vật Ech Buri"
      style={{ width: size, height: size, willChange: motionEnabled ? 'transform' : 'auto' }}
      initial={false}
      animate={motionEnabled ? state : undefined}
      whileHover={motionEnabled ? { y: -8, rotate: 2, scale: 1.03 } : undefined}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true" focusable="false">
        <motion.g variants={bodyVariants} animate={motionEnabled ? state : false}>
          <path d="M54 102c0-42 30-72 66-72s66 30 66 72v57c0 29-25 50-66 50s-66-21-66-50z" fill="#9be15d" stroke="#172b4d" strokeWidth="7" />
          <path d="M68 91c5-30 25-48 52-48s47 18 52 48c-16-10-35-15-52-15s-36 5-52 15z" fill="#58cc02" stroke="#172b4d" strokeWidth="7" />
          <motion.g variants={blinkVariants} custom={0} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="91" cy="72" r="14" fill="#9be15d" stroke="#172b4d" strokeWidth="6" />
            <circle cx="91" cy="72" r="4" fill="#172b4d" />
          </motion.g>
          <motion.g variants={blinkVariants} custom={0.35} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="149" cy="72" r="14" fill="#9be15d" stroke="#172b4d" strokeWidth="6" />
            <circle cx="149" cy="72" r="4" fill="#172b4d" />
          </motion.g>
          <path d="M94 112c11 10 41 10 52 0" fill="none" stroke="#172b4d" strokeWidth="6" strokeLinecap="round" />
          <path d="M67 157c-18 7-25 19-26 33" fill="none" stroke="#172b4d" strokeWidth="9" strokeLinecap="round" />
          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            <path d="M173 157c18 7 25 19 26 33" fill="none" stroke="#172b4d" strokeWidth="9" strokeLinecap="round" />
            <path d="M75 163h90v38H75z" fill="#172b4d" stroke="#172b4d" strokeWidth="6" />
            <path d="M88 168h64v27H88z" fill="#20b8a6" stroke="#172b4d" strokeWidth="5" />
            <path d="M120 168v27" stroke="#172b4d" strokeWidth="4" />
            <path d="M160 185l12 5-12 5z" fill="#ff9600" stroke="#172b4d" strokeWidth="3" />
          </motion.g>
          <path d="M120 40c-3-15 4-25 16-30-2 12-7 20-16 30z" fill="#58cc02" stroke="#172b4d" strokeWidth="5" />
        </motion.g>
        {motionEnabled && state === 'success' && (
          <g fill="#ff9600" stroke="#172b4d" strokeWidth="2">
            <path d="M34 55l9 5-6 10-9-5z" /><path d="M198 48l8-4 5 11-8 4z" />
            <path d="M25 128h12v6H25z" /><path d="M204 126h12v6h-12z" />
            <path d="M49 28l6 7-7 6-6-7z" /><path d="M186 83l6-7 7 6-6 7z" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

export default EchBuriAnimated;
