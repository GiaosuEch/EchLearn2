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

const OUTLINE = '#2E5E32';
const BODY = '#4CAF50';
const BELLY = '#8BC34A';
const CHEEK = '#FF8FA3';
const PUPIL = '#243B26';
const BOOK_COVER = '#26A69A';
const BOOK_PAGE = '#F7FBF2';
const BOOKMARK = '#FFB300';

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
        <motion.g
          variants={bodyVariants}
          animate={motionEnabled ? state : false}
          stroke={OUTLINE}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Webbed feet peeking out from under the belly */}
          <ellipse cx="82" cy="201" rx="28" ry="13" fill={BELLY} />
          <ellipse cx="158" cy="201" rx="28" ry="13" fill={BELLY} />
          <path d="M73 210v-5M91 210v-5M149 210v-5M167 210v-5" fill="none" strokeWidth={4} />

          {/* Leaf sprout */}
          <path d="M120 80c-2-14-1-24 0-30" fill="none" strokeWidth={5} />
          <path d="M120 52c-1-14 6-24 19-28 1 14-6 24-19 28z" fill={BELLY} strokeWidth={5} />

          {/* Plump round body and lighter belly */}
          <ellipse cx="120" cy="140" rx="72" ry="64" fill={BODY} />
          <ellipse cx="120" cy="158" rx="47" ry="42" fill={BELLY} stroke="none" />

          {/* Blush and a soft closed smile */}
          <ellipse cx="78" cy="122" rx="13" ry="8.5" fill={CHEEK} stroke="none" />
          <ellipse cx="162" cy="122" rx="13" ry="8.5" fill={CHEEK} stroke="none" />
          <path d="M100 114q20 19 40 0" fill="none" strokeWidth={5} />

          {/* Bulging frog eyes riding above the head */}
          <circle cx="88" cy="72" r="28" fill={BODY} />
          <circle cx="152" cy="72" r="28" fill={BODY} />
          <motion.g variants={blinkVariants} custom={0} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="88" cy="70" r="19" fill="#FFFFFF" strokeWidth={5} />
            <circle cx="90" cy="73" r="10" fill={PUPIL} stroke="none" />
            <circle cx="86.5" cy="69.5" r="4" fill="#FFFFFF" stroke="none" />
            <circle cx="93.5" cy="77" r="2" fill="#FFFFFF" stroke="none" opacity="0.85" />
          </motion.g>
          <motion.g variants={blinkVariants} custom={0.35} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <circle cx="152" cy="70" r="19" fill="#FFFFFF" strokeWidth={5} />
            <circle cx="150" cy="73" r="10" fill={PUPIL} stroke="none" />
            <circle cx="146.5" cy="69.5" r="4" fill="#FFFFFF" stroke="none" />
            <circle cx="153.5" cy="77" r="2" fill="#FFFFFF" stroke="none" opacity="0.85" />
          </motion.g>

          {/* Little book hugged against the chest */}
          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            <rect x="80" y="145" width="80" height="40" rx="7" fill={BOOK_COVER} strokeWidth={5} />
            <rect x="88" y="151" width="64" height="28" rx="4" fill={BOOK_PAGE} strokeWidth={4} />
            <path d="M120 151v28" fill="none" strokeWidth={4} />
            <path d="M142 145v17l-6.5-5.5L129 162v-17z" fill={BOOKMARK} strokeWidth={3} />
            <circle cx="80" cy="166" r="12" fill={BODY} strokeWidth={5} />
            <circle cx="160" cy="166" r="12" fill={BODY} strokeWidth={5} />
          </motion.g>
        </motion.g>
        {motionEnabled && state === 'success' && (
          <g fill={BOOKMARK} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round">
            <path d="M28 62l10 4-5 11-10-4z" /><path d="M204 54l9-5 6 11-9 5z" />
            <circle cx="22" cy="126" r="5" /><circle cx="218" cy="122" r="5" />
            <path d="M44 26l7 7-7 7-7-7z" /><path d="M196 20l7 7-7 7-7-7z" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

export default EchBuriAnimated;
