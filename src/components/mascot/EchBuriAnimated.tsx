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
  idle: (delay: number) => ({
    scaleY: [1, 1, 0.12, 1],
    scaleX: [1, 1, 1.08, 1],
    transition: { duration: 5.4, times: [0, 0.92, 0.96, 1], ease: 'easeInOut', repeat: Infinity, delay },
  }),
  welcome: { scaleY: [1, 0.12, 1], transition: { duration: 0.34, delay: 0.42, ease: 'easeInOut' } },
  success: { scaleY: 1, scaleX: 1, transition: { duration: 0.2 } },
  incorrect: { scaleY: 0.45, scaleX: 1.1, transition: { duration: 0.2 } },
  thinking: { scaleY: 0.85, scaleX: 0.9, y: -2, transition: { duration: 0.2 } },
  cheering: { scaleY: 1.1, scaleX: 0.95, transition: { duration: 0.2 } },
  listening: { scaleY: 0.9, scaleX: 1, transition: { duration: 0.2 } },
};

const bookVariants: Variants = {
  idle: { y: 0, rotate: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  welcome: { y: 0, rotate: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  success: { y: [0, -22, -14], rotate: [0, -12, 12, 0], transition: { duration: 0.72, ease: 'easeInOut' } },
  incorrect: { y: 12, rotate: -5, transition: { duration: 0.3 } },
  thinking: { y: -2, rotate: 4, transition: { duration: 0.4 } },
  cheering: { y: [0, -24, -16], rotate: [0, -12, 12, 0], transition: { duration: 0.8 } },
  listening: { y: 0, rotate: 0, transition: { duration: 0.4 } },
};

const eyeOrigin = { transformBox: 'fill-box', transformOrigin: 'center 58%' } as const;

const OUTLINE = '#134718';
const BODY = '#18B65B';
const BELLY = '#FFFFFF';
const MOUTH = '#134718';
const PUPIL = '#134718';
const BOOK_COVER = '#F4B41A';
const GROUND = '#CBD5E1';
const SPARKLE = '#FFC107';
const SWEAT = '#1CB0F6';
const SWEAT_EDGE = '#0284C7';

export function EchBuriAnimated({ size = 120, state = 'idle', animate = true, className = '' }: EchBuriAnimatedProps) {
  const reducedMotion = useReducedMotion();
  const mascotAnimation = useAppStore((store) => store.mascotAnimation);
  const motionEnabled = animate && !reducedMotion && mascotAnimation;

  return (
    <motion.div
      className={className}
      role="img"
      aria-label="Linh vật Ech Buri"
      data-mascot-state={state}
      style={{ width: size, height: size, willChange: motionEnabled ? 'transform' : 'auto' }}
      initial={false}
      animate={motionEnabled ? state : undefined}
      whileHover={motionEnabled ? { y: -8, rotate: 2, scale: 1.05 } : undefined}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true" focusable="false">
        {/* Soft ground shadow */}
        <ellipse cx="120" cy="226" rx="60" ry="7" fill={GROUND} opacity={0.5} />

        <motion.g
          variants={bodyVariants}
          animate={motionEnabled ? state : false}
          stroke={OUTLINE}
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Webbed Feet at bottom */}
          {state === 'success' || state === 'cheering' ? (
            <>
              <ellipse cx="70" cy="210" rx="20" ry="10" fill={BODY} transform="rotate(-20 70 210)" />
              <ellipse cx="170" cy="210" rx="20" ry="10" fill={BODY} transform="rotate(20 170 210)" />
            </>
          ) : (
            <>
              <path d="M62 208 C50 208 45 222 65 224 C85 226 95 218 85 208 Z" fill={BODY} />
              <path d="M178 208 C190 208 195 222 175 224 C155 226 145 218 155 208 Z" fill={BODY} />
              <path d="M66 218 v-4 M75 220 v-4 M165 220 v-4 M174 218 v-4" fill="none" strokeWidth={3} />
            </>
          )}

          {/* Chubby Torso */}
          <path d="M65 115 C45 142 50 198 120 202 C190 198 195 142 175 115 Z" fill={BODY} />

          {/* White Chest / Belly Patch */}
          <path d="M80 120 C70 148 75 190 120 192 C165 190 170 148 160 120 Z" fill={BELLY} stroke="none" />

          {/* Seamless Head Silhouette with Eye Bumps */}
          <path
            d="M66 100 C45 76 50 38 85 36 C100 35 112 46 120 49 C128 46 140 35 155 36 C190 38 195 76 174 100 C160 116 80 116 66 100 Z"
            fill={BODY}
          />

          {/* Nostrils */}
          <circle cx="114" cy="76" r="2.2" fill={OUTLINE} stroke="none" />
          <circle cx="126" cy="76" r="2.2" fill={OUTLINE} stroke="none" />

          {/* Mouth - Dynamic per State */}
          {state === 'success' || state === 'cheering' ? (
            <g stroke="none">
              <path d="M92 88 Q120 120 148 88 Z" fill={MOUTH} />
              <path d="M102 102 Q120 114 138 102 Q120 96 102 102 Z" fill="#FF708A" />
            </g>
          ) : state === 'incorrect' ? (
            <path d="M98 102 Q120 84 142 102" fill="none" stroke={MOUTH} strokeWidth={5.5} />
          ) : state === 'thinking' ? (
            <path d="M108 96 Q122 96 134 92" fill="none" stroke={MOUTH} strokeWidth={5.5} />
          ) : (
            <path d="M92 90 Q120 108 148 90" fill="none" stroke={MOUTH} strokeWidth={5.5} />
          )}

          {/* Eyes - Dynamic per State */}
          {state === 'incorrect' ? (
            <g stroke="none">
              <circle cx="78" cy="62" r="20" fill="#FFFFFF" />
              <path d="M64 52 Q78 60 92 52" stroke={OUTLINE} strokeWidth={5.5} fill="none" />
              <ellipse cx="78" cy="66" rx="8" ry="6" fill={PUPIL} />
              <circle cx="162" cy="62" r="20" fill="#FFFFFF" />
              <path d="M148 52 Q162 60 176 52" stroke={OUTLINE} strokeWidth={5.5} fill="none" />
              <ellipse cx="162" cy="66" rx="8" ry="6" fill={PUPIL} />
            </g>
          ) : state === 'thinking' ? (
            <g stroke="none">
              <circle cx="78" cy="62" r="20" fill="#FFFFFF" />
              <circle cx="84" cy="56" r="10.5" fill={PUPIL} />
              <circle cx="87" cy="52" r="4" fill="#FFFFFF" />
              <circle cx="162" cy="62" r="20" fill="#FFFFFF" />
              <circle cx="168" cy="56" r="10.5" fill={PUPIL} />
              <circle cx="171" cy="52" r="4" fill="#FFFFFF" />
            </g>
          ) : (
            <motion.g variants={blinkVariants} custom={0} animate={motionEnabled ? state : false} style={eyeOrigin}>
              <circle cx="78" cy="62" r="20" fill="#FFFFFF" stroke="none" />
              <circle cx="78" cy="62" r="11.5" fill={PUPIL} stroke="none" />
              <circle cx="74" cy="57" r="4.5" fill="#FFFFFF" stroke="none" />
              <circle cx="82" cy="66" r="1.8" fill="#FFFFFF" stroke="none" />
              <circle cx="162" cy="62" r="20" fill="#FFFFFF" stroke="none" />
              <circle cx="162" cy="62" r="11.5" fill={PUPIL} stroke="none" />
              <circle cx="158" cy="57" r="4.5" fill="#FFFFFF" stroke="none" />
              <circle cx="166" cy="66" r="1.8" fill="#FFFFFF" stroke="none" />
            </motion.g>
          )}

          {/* Golden Yellow Book & Arms */}
          <motion.g variants={bookVariants} animate={motionEnabled ? state : false}>
            {state === 'success' || state === 'cheering' ? (
              <>
                <path d="M55 120 Q40 90 52 70" fill="none" stroke={BODY} strokeWidth={16} strokeLinecap="round" />
                <path d="M185 120 Q200 90 188 70" fill="none" stroke={BODY} strokeWidth={16} strokeLinecap="round" />
                <rect x="92" y="38" width="50" height="58" rx="7" fill={BOOK_COVER} stroke={OUTLINE} strokeWidth={4.5} />
                <rect x="96" y="42" width="42" height="50" rx="4" fill="#FFE082" stroke="none" />
                <text x="117" y="67" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="900" fontFamily="sans-serif" stroke="none">ECH</text>
                <text x="117" y="78" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="900" fontFamily="sans-serif" stroke="none">BURI</text>
              </>
            ) : state === 'thinking' ? (
              <>
                <rect x="135" y="124" width="55" height="66" rx="7" fill={BOOK_COVER} stroke={OUTLINE} strokeWidth={5} />
                <rect x="140" y="128" width="45" height="57" rx="4" fill="#FFE082" stroke="none" />
                <text x="162" y="156" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="900" fontFamily="sans-serif" stroke="none">ECH</text>
                <text x="162" y="167" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="900" fontFamily="sans-serif" stroke="none">BURI</text>
                <path d="M65 125 Q48 135 58 152" fill="none" stroke={BODY} strokeWidth={16} strokeLinecap="round" />
                <path d="M145 110 Q130 98 120 102" fill="none" stroke={BODY} strokeWidth={14} strokeLinecap="round" />
              </>
            ) : (
              <>
                <rect x="135" y="124" width="55" height="66" rx="7" fill={BOOK_COVER} stroke={OUTLINE} strokeWidth={5} />
                <rect x="140" y="128" width="45" height="57" rx="4" fill="#FFE082" stroke="none" />
                <rect x="131" y="128" width="6" height="57" rx="2.5" fill="#FFFFFF" stroke={OUTLINE} strokeWidth={2.5} />
                <path d="M162 136 l3 3.5 l4.5 2.5 l-4.5 2.5 l-3 3.5 l-2.5 -3.5 l-4.5 -2.5 l4.5 -2.5 z" fill="#FFFFFF" stroke="none" />
                <text x="162" y="158" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="900" fontFamily="sans-serif" stroke="none">ECH</text>
                <text x="162" y="169" textAnchor="middle" fill="#5D4037" fontSize="10" fontWeight="900" fontFamily="sans-serif" stroke="none">BURI</text>
                {state === 'welcome' ? (
                  <motion.path
                    d="M65 125 Q42 108 50 82"
                    fill="none"
                    stroke={BODY}
                    strokeWidth={16}
                    strokeLinecap="round"
                    animate={motionEnabled ? { rotate: [0, -18, 14, 0] } : undefined}
                    transition={{ duration: 0.62, ease: 'easeInOut' }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'bottom right' }}
                  />
                ) : <path d="M65 125 Q48 135 56 154 Q66 162 74 148" fill={BODY} />}
                <path d="M165 125 Q178 135 172 150 Q160 154 152 138" fill={BODY} />
              </>
            )}
          </motion.g>
        </motion.g>

        {motionEnabled && (state === 'success' || state === 'cheering') && (
          <g fill={SPARKLE} stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round">
            <path d="M24 45l10 4-5 11-10-4z" /><path d="M210 38l10-5 6 11-10 5z" />
            <circle cx="18" cy="108" r="6" fill="#1CB0F6" /><circle cx="224" cy="104" r="6" fill="#FF708A" />
            <path d="M40 18l7 7-7 7-7-7z" /><path d="M198 14l7 7-7 7-7-7z" />
            <circle cx="44" cy="148" r="4.5" fill="#FFC107" /><circle cx="194" cy="148" r="4.5" fill="#45B629" />
          </g>
        )}

        {motionEnabled && state === 'thinking' && (
          <g stroke={SPARKLE} strokeWidth={4.5} fill="none" strokeLinecap="round">
            <path d="M194 24 A10 10 0 0 1 210 35 C210 45 198 45 198 56" />
            <circle cx="198" cy="68" r="2.5" fill={SPARKLE} stroke="none" />
          </g>
        )}

        {motionEnabled && state === 'incorrect' && (
          <g fill={SWEAT} stroke={SWEAT_EDGE} strokeWidth={2.2}>
            <path d="M184 82 C184 76, 194 76, 194 82 C194 88, 184 88, 184 82 Z" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

export default EchBuriAnimated;
