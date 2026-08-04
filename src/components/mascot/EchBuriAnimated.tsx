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

/** The heavy lid squeezes shut and the eye bag bulges sideways; `custom` staggers the second eye. */
const blinkVariants: Variants = {
  idle: (delay: number) => ({
    scaleY: [1, 1, 0.12, 1],
    scaleX: [1, 1, 1.08, 1],
    transition: { duration: 5.4, times: [0, 0.92, 0.96, 1], ease: 'easeInOut', repeat: Infinity, delay },
  }),
  success: { scaleY: 1, scaleX: 1, transition: { duration: 0.2 } },
};

/** The raised arm and book pose that reads as celebration. */
const bookVariants: Variants = {
  idle: { y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  success: { y: [0, -16, -11], transition: { duration: 0.68, ease: 'easeInOut' } },
};

const eyeOrigin = { transformBox: 'fill-box', transformOrigin: 'center 58%' } as const;

const OUTLINE = '#3D9B22';
const BODY = '#5FC22B';
const BELLY = '#B4E24C';
const CHEEK = '#CDE86B';
const FRAME = '#2F3A34';
const MOUTH = '#2C6B26';
const PUPIL = '#26332B';
const VEST = '#1E7CD6';
const VEST_EDGE = '#1660AD';
const SHIRT = '#FFFFFF';
const TIE = '#E2382B';
const BOOK_COVER = '#F6821F';
const BOOK_EDGE = '#C9600C';
const BOOK_PAGE = '#FFFFFF';
const BOOKMARK = '#FFC534';
const GROUND = '#E9EFE3';

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
        {/* Contact shadow keeps the mascot grounded without leaving the flat palette */}
        <ellipse cx="120" cy="218" rx="58" ry="6" fill={GROUND} />
        <motion.g
          variants={bodyVariants}
          animate={motionEnabled ? state : false}
          stroke={OUTLINE}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Webbed feet tucked behind the body, only the tips read */}
          <ellipse cx="88" cy="208" rx="22" ry="11" fill={BELLY} transform="rotate(-8 88 208)" />
          <ellipse cx="166" cy="203" rx="22" ry="11" fill={BELLY} transform="rotate(14 166 203)" />
          <path d="M78 216v-6M93 218v-6M155 211v-6M170 208v-6" fill="none" strokeWidth={4} />

          {/* Three idea sparks over a tidy leaf sprout */}
          <path d="M120 6v11M99 12l5 10M141 12l-5 10" fill="none" stroke={BODY} strokeWidth={7} />
          <path d="M120 58q-4 -14 0 -24" fill="none" strokeWidth={5} />
          <ellipse cx="105" cy="34" rx="13" ry="8" fill={BELLY} transform="rotate(-24 105 34)" />
          <ellipse cx="135" cy="32" rx="13" ry="8" fill={BELLY} transform="rotate(20 135 32)" />

          {/* Plump round body and lighter belly */}
          <ellipse cx="120" cy="136" rx="72" ry="78" fill={BODY} />
          <ellipse cx="120" cy="180" rx="48" ry="34" fill={BELLY} stroke="none" />

          {/* Soft cheeks and a small unimpressed pout in the gap between the lenses */}
          <ellipse cx="62" cy="128" rx="11" ry="7" fill={CHEEK} stroke="none" />
          <ellipse cx="178" cy="128" rx="11" ry="7" fill={CHEEK} stroke="none" />
          <path d="M113 110q7 -11 14 -2" fill="none" stroke={MOUTH} strokeWidth={5} />

          {/* Big round spectacles: sclera and indignant upward glance sit under the frames */}
          <motion.g variants={blinkVariants} custom={0} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <ellipse cx="82" cy="92" rx="20" ry="19" fill="#FFFFFF" stroke="none" />
            <circle cx="90" cy="95" r="9.5" fill={PUPIL} stroke="none" />
            <circle cx="86" cy="91" r="3.5" fill="#FFFFFF" stroke="none" />
            <path d="M65 90q16 -12 32 -8" fill="none" stroke={PUPIL} strokeWidth={8} />
          </motion.g>
          <motion.g variants={blinkVariants} custom={0.35} animate={motionEnabled ? state : false} style={eyeOrigin}>
            <ellipse cx="158" cy="92" rx="20" ry="19" fill="#FFFFFF" stroke="none" />
            <circle cx="150" cy="95" r="9.5" fill={PUPIL} stroke="none" />
            <circle cx="146" cy="91" r="3.5" fill="#FFFFFF" stroke="none" />
            <path d="M175 90q-16 -12 -32 -8" fill="none" stroke={PUPIL} strokeWidth={8} />
          </motion.g>
          <g fill="none" stroke={FRAME} strokeWidth={9}>
            <circle cx="82" cy="92" r="26" />
            <circle cx="158" cy="92" r="26" />
            <path d="M110 86q10 -4 20 0" strokeWidth={7} />
            <path d="M52 78l-11 -5M188 78l11 -5" strokeWidth={7} />
          </g>

          {/* Scholar layer: blue waistcoat, white shirt and red tie across the chest */}
          <path d="M86 120h68l-6 56H92z" fill={VEST} stroke={VEST_EDGE} />
          <path d="M105 120h30l-15 32z" fill={SHIRT} stroke="none" />
          <path d="M112 120h16l-5 12l7 24l-10 10l-10 -10l7 -24z" fill={TIE} stroke="none" />

          {/* Flat orange book hugged against the chest */}
          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            <rect x="94" y="142" width="52" height="14" rx="5" fill={BOOK_PAGE} stroke={BOOK_EDGE} strokeWidth={4} />
            <rect x="90" y="148" width="60" height="52" rx="5" fill={BOOK_COVER} stroke={BOOK_EDGE} />
            <rect x="105" y="166" width="30" height="8" rx="4" fill={BOOKMARK} stroke="none" />
            <path d="M52 156q4 20 26 22M188 156q-4 20 -26 22" fill="none" strokeWidth={5} />
            <ellipse cx="88" cy="173" rx="18" ry="12" fill={BODY} />
            <ellipse cx="152" cy="173" rx="18" ry="12" fill={BODY} />
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
