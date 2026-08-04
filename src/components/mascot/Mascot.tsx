import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../../stores/appStore';
import MascotSkinRenderer from './MascotSkinRenderer';

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

/** Existing, local artwork selected for each semantic mascot state. */
export const mascotAssetByExpression: Record<MascotExpression, string> = {
  happy: '/mascots/generated/ech-buri-reading-v2.png',
  thinking: '/mascots/pepe_mascot_thinking.png',
  encouraging: '/mascots/pepe_mascot_tutor.png',
  surprised: '/mascots/pepe_mascot_celebrate.png',
  cool: '/mascots/pepe_mascot_avatar.png',
  savage: '/mascots/mascot_frog_backpack.png',
  sad: '/mascots/pepe_mascot_sad.png',
};

export const mascotAssetByAction: Record<MascotAction, string> = {
  reading: '/mascots/ech_buri_study_companion.png',
  listening: '/mascots/pepe_mascot_tutor.png',
  speaking: '/mascots/pepe_mascot_tutor.png',
  celebrating: '/mascots/pepe_mascot_celebrate.png',
  thinking: '/mascots/pepe_mascot_thinking.png',
  workout: '/mascots/mascot_frog_backpack.png',
  coffee: '/mascots/pepe_mascot_avatar.png',
  sleeping: '/mascots/pepe_mascot_sad.png',
  wave: '/mascots/pepe_mascot_avatar.png',
};

const mascotAltByExpression: Record<MascotExpression, string> = {
  happy: 'Ếch Buri vui vẻ đang học cùng sách',
  thinking: 'Ếch Buri đang suy nghĩ',
  encouraging: 'Ếch Buri đang hướng dẫn học tập',
  surprised: 'Ếch Buri đang ăn mừng',
  cool: 'Ếch Buri tự tin',
  savage: 'Ếch Buri sẵn sàng chinh phục thử thách',
  sad: 'Ếch Buri đang động viên sau một lần chưa đúng',
};

export function VectorFrogMascot({ expression = 'happy', size = 100 }: { expression?: string; size?: number }) {
  // Expressions eyes and mouth path configurations
  const isSurprised = expression === 'surprised' || expression === 'savage';
  const isThinking = expression === 'thinking';
  const isSad = expression === 'sad';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl filter transition-transform duration-300"
    >
      <defs>
        {/* Skin Gradients */}
        <radialGradient id="frogSkin" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>

        <linearGradient id="bellySkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>

        <linearGradient id="backpackLeather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <radialGradient id="eyeGloss" cx="35%" cy="35%" r="40%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="60" cy="112" rx="38" ry="7" fill="#000000" fillOpacity="0.2" />

      {/* Backpack behind body */}
      <rect x="24" y="55" width="22" height="32" rx="6" fill="url(#backpackLeather)" stroke="#451a03" strokeWidth="2.5" />
      <path d="M 28 55 Q 35 48 42 55" fill="none" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
      <rect x="28" y="65" width="14" height="14" rx="3" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
      <circle cx="35" cy="72" r="2" fill="#fbbf24" />

      {/* Main Frog Body */}
      <ellipse cx="60" cy="78" rx="32" ry="26" fill="url(#frogSkin)" stroke="#166534" strokeWidth="3" />

      {/* Frog Belly */}
      <ellipse cx="60" cy="82" rx="20" ry="16" fill="url(#bellySkin)" stroke="#22c55e" strokeWidth="1.5" />

      {/* Feet */}
      <ellipse cx="42" cy="106" rx="14" ry="6" fill="url(#frogSkin)" stroke="#166534" strokeWidth="2" />
      <ellipse cx="78" cy="106" rx="14" ry="6" fill="url(#frogSkin)" stroke="#166534" strokeWidth="2" />

      {/* Frog Head & Eye Bumps */}
      <path
        d="M 32 46 C 24 20, 52 18, 55 36 C 58 36, 62 36, 65 36 C 68 18, 96 20, 88 46 C 98 62, 22 62, 32 46 Z"
        fill="url(#frogSkin)"
        stroke="#166534"
        strokeWidth="3"
      />

      {/* Left Eye Socket & Pupil */}
      <circle cx="44" cy="30" r="14" fill="url(#eyeGloss)" stroke="#166534" strokeWidth="2.5" />
      {isThinking ? (
        <ellipse cx="46" cy="28" rx="4" ry="6" fill="#0f172a" />
      ) : isSurprised ? (
        <circle cx="44" cy="30" r="7" fill="#0f172a" />
      ) : (
        <circle cx="45" cy="30" r="6" fill="#0f172a" />
      )}
      <circle cx="42" cy="27" r="2.5" fill="#ffffff" />

      {/* Right Eye Socket & Pupil */}
      <circle cx="76" cy="30" r="14" fill="url(#eyeGloss)" stroke="#166534" strokeWidth="2.5" />
      {isThinking ? (
        <ellipse cx="74" cy="26" rx="4" ry="6" fill="#0f172a" />
      ) : isSurprised ? (
        <circle cx="76" cy="30" r="7" fill="#0f172a" />
      ) : (
        <circle cx="75" cy="30" r="6" fill="#0f172a" />
      )}
      <circle cx="73" cy="27" r="2.5" fill="#ffffff" />

      {/* Cheeks (Pink Blush) */}
      <circle cx="36" cy="50" r="6" fill="#f472b6" fillOpacity="0.5" />
      <circle cx="84" cy="50" r="6" fill="#f472b6" fillOpacity="0.5" />

      {/* Mouth */}
      {isSad ? (
        <path d="M 46 54 Q 60 46 74 54" fill="none" stroke="#166534" strokeWidth="3.5" strokeLinecap="round" />
      ) : isSurprised ? (
        <ellipse cx="60" cy="52" rx="7" ry="9" fill="#0f172a" stroke="#166534" strokeWidth="2" />
      ) : (
        <path d="M 44 48 Q 60 60 76 48" fill="none" stroke="#166534" strokeWidth="3.5" strokeLinecap="round" />
      )}

      {/* Arms & Hands (Pointing Forward cheerfully) */}
      <path d="M 32 70 Q 20 62 16 68" fill="none" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
      <circle cx="14" cy="69" r="4" fill="url(#frogSkin)" stroke="#166534" strokeWidth="2" />

      <path d="M 88 70 Q 102 62 108 58" fill="none" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="57" r="4" fill="url(#frogSkin)" stroke="#166534" strokeWidth="2" />
    </svg>
  );
}

export default function Mascot({ expression = 'happy', action, size = 100, animate = true, message, skinId: _skinId }: MascotProps) {
  const mascotAnimation = useAppStore((state) => state.mascotAnimation);
  const shouldAnimate = animate && mascotAnimation;
  const [hasAssetError, setHasAssetError] = useState(false);
  const assetSrc = action ? (mascotAssetByAction[action] || mascotAssetByExpression[expression]) : mascotAssetByExpression[expression];

  // When a skinId is explicitly provided, render the dynamic SVG skin
  const useSkinRenderer = Boolean(_skinId);

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
        ) : hasAssetError ? (
          <VectorFrogMascot expression={expression} size={size} />
        ) : (
          <img
            src={assetSrc}
            aria-label={mascotAltByExpression[expression]}
          alt="Ếch Buri đang học cùng sách" 
          className="w-full h-full object-contain drop-shadow-md"
          onError={() => setHasAssetError(true)}
        />
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
