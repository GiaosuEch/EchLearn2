import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getMascotSkin } from '../../data/customization';
import { useAppStore } from '../../stores/appStore';

interface MascotProps {
  expression?: 'happy' | 'thinking' | 'encouraging' | 'surprised' | 'cool' | 'savage';
  size?: number;
  animate?: boolean;
  message?: string;
  skinId?: string;
}

const patternSymbol: Record<string, string> = {
  cloud: '☁', star: '✦', snow: '❄', leaf: '❧', flame: '◆', wave: '≈', music: '♪', bolt: '⚡', moon: '◐', sun: '☀', pixel: '▣', plain: '',
};

function Accessory({ accessory, trimColor }: { accessory: string; trimColor: string }) {
  if (accessory === 'sunglasses') {
    return <g><rect x="20" y="21" width="18" height="10" rx="3" fill="#0F172A" /><rect x="42" y="21" width="18" height="10" rx="3" fill="#0F172A" /><line x1="38" y1="26" x2="42" y2="26" stroke="#0F172A" strokeWidth="2" /><path d="M 22 23 L 34 23" stroke="white" strokeWidth="1" opacity="0.3" /></g>;
  }
  if (accessory === 'headband') return <g><rect x="12" y="16" width="56" height="5" rx="1" fill={trimColor} /><circle cx="40" cy="18.5" r="2" fill="white" /></g>;
  if (accessory === 'scarf') return <path d="M 22 51 C 34 58 48 58 60 51 L 58 58 C 46 64 34 64 23 58 Z" fill={trimColor} opacity="0.95" />;
  if (accessory === 'hood') return <path d="M 16 42 C 16 18 28 8 40 8 C 52 8 64 18 64 42 C 57 31 51 25 40 25 C 29 25 23 31 16 42 Z" fill="#0B1120" opacity="0.85" />;
  if (accessory === 'bow') return <g><path d="M 38 15 C 28 8 24 18 34 21 Z" fill={trimColor} /><path d="M 42 15 C 52 8 56 18 46 21 Z" fill={trimColor} /><circle cx="40" cy="18" r="2.5" fill="#fff" /></g>;
  if (accessory === 'cap') return <path d="M 20 19 C 27 9 52 9 60 19 L 61 23 C 50 18 31 18 19 23 Z" fill={trimColor} />;
  if (accessory === 'earphones') return <g><path d="M 18 30 C 18 16 62 16 62 30" stroke={trimColor} strokeWidth="3" fill="none" /><circle cx="18" cy="31" r="4" fill={trimColor} /><circle cx="62" cy="31" r="4" fill={trimColor} /></g>;
  if (accessory === 'badge') return <circle cx="58" cy="56" r="4" fill={trimColor} />;
  if (accessory === 'float') return <ellipse cx="40" cy="61" rx="27" ry="8" fill={trimColor} opacity="0.75" />;
  if (accessory === 'leaf-hat') return <path d="M 34 13 C 44 2 55 9 49 19 C 44 16 39 15 34 13 Z" fill="#65A30D" />;
  if (accessory === 'star-pin') return <text x="58" y="19" fontSize="10" fill={trimColor}>★</text>;
  if (accessory === 'goggles') return <g><circle cx="28" cy="26" r="10" fill="none" stroke={trimColor} strokeWidth="2" /><circle cx="52" cy="26" r="10" fill="none" stroke={trimColor} strokeWidth="2" /><line x1="38" y1="26" x2="42" y2="26" stroke={trimColor} strokeWidth="2" /></g>;
  if (accessory === 'mask') return <rect x="25" y="39" width="30" height="10" rx="5" fill="#0F172A" opacity="0.75" />;
  return null;
}

export default function Mascot({ expression = 'happy', size = 80, animate = true, message, skinId }: MascotProps) {
  const selectedSkinId = useAppStore((state) => state.mascotSkinId);
  const mascotAnimation = useAppStore((state) => state.mascotAnimation);
  const skin = getMascotSkin(skinId || selectedSkinId);
  const symbol = patternSymbol[skin.pattern] || '';
  const shouldAnimate = animate && mascotAnimation;

  // Playful periodic blink so the mascot feels alive instead of a static sticker
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (!shouldAnimate) return;
    let cancelled = false;
    const scheduleNextBlink = () => {
      const delay = 2200 + Math.random() * 2600;
      const timer = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        setTimeout(() => !cancelled && setBlinking(false), 140);
        scheduleNextBlink();
      }, delay);
      return timer;
    };
    const timer = scheduleNextBlink();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [shouldAnimate]);

  const eyeScaleY = blinking ? 0.15 : 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative cursor-pointer"
        animate={shouldAnimate ? { y: [0, -7, 0], rotate: [0, -2, 2, 0] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={shouldAnimate ? { scale: 1.08, rotate: [0, -4, 4, 0], transition: { duration: 0.5 } } : { scale: 1.05 }}
        whileTap={{ scale: 0.9, rotate: -6 }}
        style={{ width: size, height: size }}
        title={skin.name}
      >
        <svg viewBox="0 0 80 80" width={size} height={size}>
          <ellipse cx="40" cy="48" rx="28" ry="24" fill={skin.bodyColor} />
          <ellipse cx="40" cy="52" rx="20" ry="16" fill={skin.bellyColor} />

          <path d="M 16 50 L 40 65 L 64 50 L 58 70 L 22 70 Z" fill={skin.outfitColor} />
          <path d="M 40 65 L 25 50" stroke={skin.trimColor} strokeWidth="2" />
          <path d="M 40 65 L 55 50" stroke={skin.trimColor} strokeWidth="2" />
          {symbol && <><text x="25" y="60" fontSize="8" fill={skin.trimColor} opacity="0.9">{symbol}</text><text x="51" y="64" fontSize="8" fill={skin.trimColor} opacity="0.9">{symbol}</text></>}

          <circle cx="28" cy="28" r="14" fill={skin.bodyColor} />
          <circle cx="52" cy="28" r="14" fill={skin.bodyColor} />
          <circle cx="28" cy="26" r="9" fill="white" />
          <circle cx="52" cy="26" r="9" fill="white" />
          <circle cx={expression === 'thinking' ? 26 : 30} cy="25" r="4" fill="#0F172A" style={{ transformOrigin: '28px 25px', transform: `scaleY(${eyeScaleY})`, transition: 'transform 0.08s ease' }} />
          <circle cx={expression === 'thinking' ? 50 : 54} cy="25" r="4" fill="#0F172A" style={{ transformOrigin: '52px 25px', transform: `scaleY(${eyeScaleY})`, transition: 'transform 0.08s ease' }} />
          <circle cx="31" cy="23" r="1.5" fill="white" opacity="0.8" />
          <circle cx="55" cy="23" r="1.5" fill="white" opacity="0.8" />

          {expression === 'happy' || expression === 'encouraging' ? (
            <path d="M 28 46 Q 40 56 52 46" stroke="#064E3B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : expression === 'surprised' ? (
            <ellipse cx="40" cy="48" rx="5" ry="4" fill="#064E3B" />
          ) : expression === 'savage' ? (
            <path d="M 30 48 Q 40 44 50 48" stroke="#064E3B" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 32 46 Q 40 48 48 46" stroke="#064E3B" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          <circle cx="22" cy="42" r="4" fill="#FCA5A5" opacity="0.5" />
          <circle cx="58" cy="42" r="4" fill="#FCA5A5" opacity="0.5" />
          <Accessory accessory={skin.accessory} trimColor={skin.trimColor} />
          {(expression === 'cool' || expression === 'savage') && skin.accessory !== 'sunglasses' && <Accessory accessory="sunglasses" trimColor={skin.trimColor} />}
        </svg>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
          className="relative glass-card px-4 py-2 max-w-xs text-sm text-dark-200 text-center"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-800/60 rotate-45 border-l border-t border-dark-700/50" />
          {message}
        </motion.div>
      )}
    </div>
  );
}
