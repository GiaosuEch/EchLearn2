/**
 * MascotSkinRenderer — Dynamic SVG-based mascot renderer that uses skin data
 * (bodyColor, bellyColor, outfitColor, trimColor, accessory, pattern) to
 * produce visually unique avatars for each skin.
 *
 * Replaces the single-PNG approach that made every skin look identical.
 */
import { useId } from 'react';
import type { MascotSkin } from '../../data/customization';
import { getMascotSkin } from '../../data/customization';

interface MascotSkinRendererProps {
  skinId: string;
  size?: number;
  expression?: 'happy' | 'thinking' | 'cool' | 'savage' | 'surprised' | 'sad' | 'encouraging';
}

/* ── Accessory SVG renderers ──────────────────────────────────────────── */

function HokageHat({ color }: { color: string }) {
  return (
    <g>
      {/* Hokage cloak collar */}
      <path d="M 30 58 Q 60 48 90 58 L 88 72 Q 60 62 32 72 Z" fill={color} stroke="#b91c1c" strokeWidth="1.5" />
      {/* Flame pattern on cloak */}
      <path d="M 34 68 Q 36 60 40 68 Q 44 60 48 68" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
      <path d="M 72 68 Q 76 60 80 68 Q 84 60 86 68" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
      {/* Headband */}
      <rect x="30" y="18" width="60" height="8" rx="3" fill="#1e40af" stroke="#1e3a5f" strokeWidth="1" />
      {/* Metal plate */}
      <rect x="47" y="17" width="26" height="10" rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      {/* Leaf symbol */}
      <path d="M 56 22 Q 60 17 64 22 Q 60 27 56 22" fill="none" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="60" y1="18" x2="60" y2="26" stroke="#0f172a" strokeWidth="1" />
    </g>
  );
}

function SaiyanAura({ color }: { color: string }) {
  return (
    <g>
      {/* Golden aura glow */}
      <ellipse cx="60" cy="55" rx="50" ry="55" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
      <ellipse cx="60" cy="55" rx="44" ry="50" fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
      {/* Spiky hair */}
      <path d="M 38 20 L 30 -2 L 42 14 L 38 -6 L 48 12 L 50 -4 L 54 14 L 58 -8 L 62 14 L 66 -4 L 70 12 L 74 -6 L 76 14 L 82 -2 L 80 20" 
        fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
      {/* Energy bolts */}
      <line x1="20" y1="40" x2="10" y2="35" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
      <line x1="100" y1="40" x2="110" y2="35" stroke="#fbbf24" strokeWidth="2" opacity="0.6" />
      <line x1="15" y1="60" x2="5" y2="58" stroke="#fde047" strokeWidth="1.5" opacity="0.4" />
      <line x1="105" y1="60" x2="115" y2="58" stroke="#fde047" strokeWidth="1.5" opacity="0.4" />
    </g>
  );
}

function StrawHat() {
  return (
    <g>
      {/* Hat brim */}
      <ellipse cx="60" cy="20" rx="38" ry="8" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      {/* Hat dome */}
      <path d="M 40 20 Q 40 0 60 -2 Q 80 0 80 20" fill="#fde047" stroke="#b45309" strokeWidth="2" />
      {/* Red band */}
      <rect x="40" y="14" width="40" height="6" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
      {/* Vest */}
      <path d="M 38 60 L 42 90 Q 60 95 78 90 L 82 60" fill="none" stroke="#dc2626" strokeWidth="3" />
      <line x1="60" y1="62" x2="60" y2="88" stroke="#dc2626" strokeWidth="2" />
      {/* Scar under left eye */}
      <path d="M 40 40 L 38 48" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function DemonSlayerHaori({ color, trimColor }: { color: string; trimColor: string }) {
  return (
    <g>
      {/* Checkered haori coat */}
      <rect x="28" y="55" width="64" height="40" rx="4" fill={color} stroke={trimColor} strokeWidth="1.5" opacity="0.85" />
      {/* Checkered pattern */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <rect key={i} x={30 + (i % 4) * 15} y={57 + Math.floor(i / 4) * 18} width="13" height="16" rx="1" fill={i % 2 === 0 ? trimColor : color} opacity="0.7" />
      ))}
      {/* Katana behind back */}
      <line x1="90" y1="30" x2="95" y2="100" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <rect x="87" y="28" width="6" height="10" rx="2" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
      {/* Blade glint */}
      <line x1="92" y1="38" x2="93" y2="55" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.6" />
    </g>
  );
}

function Blindfold({ color }: { color: string }) {
  return (
    <g>
      {/* Black uniform */}
      <path d="M 36 58 L 36 92 Q 60 98 84 92 L 84 58" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
      {/* White trim */}
      <line x1="36" y1="58" x2="84" y2="58" stroke="#e2e8f0" strokeWidth="2" />
      {/* Blindfold */}
      <rect x="28" y="24" width="64" height="12" rx="4" fill={color} stroke="#1e40af" strokeWidth="1.5" />
      {/* Infinity symbol through blindfold */}
      <path d="M 48 30 Q 54 24 60 30 Q 66 36 72 30" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.8" />
      {/* Six-eyes glow */}
      <circle cx="44" cy="30" r="3" fill="#38bdf8" opacity="0.5" />
      <circle cx="76" cy="30" r="3" fill="#38bdf8" opacity="0.5" />
    </g>
  );
}

function CyberJacket({ color, trimColor }: { color: string; trimColor: string }) {
  return (
    <g>
      {/* Jacket */}
      <path d="M 30 55 L 28 95 Q 60 100 92 95 L 90 55" fill={color} stroke={trimColor} strokeWidth="2" />
      {/* Collar pop */}
      <path d="M 34 55 L 30 45 L 40 55" fill={color} stroke={trimColor} strokeWidth="1.5" />
      <path d="M 86 55 L 90 45 L 80 55" fill={color} stroke={trimColor} strokeWidth="1.5" />
      {/* LED lines */}
      <line x1="35" y1="65" x2="35" y2="90" stroke={trimColor} strokeWidth="1.5" opacity="0.8" />
      <line x1="85" y1="65" x2="85" y2="90" stroke={trimColor} strokeWidth="1.5" opacity="0.8" />
      {/* Neon circuit patterns */}
      <path d="M 45 70 L 55 70 L 55 80 L 65 80" fill="none" stroke={trimColor} strokeWidth="1" opacity="0.6" />
      {/* Cyber glasses */}
      <rect x="32" y="26" width="22" height="10" rx="3" fill="#0f172a" stroke={trimColor} strokeWidth="1.5" />
      <rect x="66" y="26" width="22" height="10" rx="3" fill="#0f172a" stroke={trimColor} strokeWidth="1.5" />
      <line x1="54" y1="31" x2="66" y2="31" stroke={trimColor} strokeWidth="1.5" />
      {/* LED eye glow */}
      <circle cx="43" cy="31" r="2" fill={trimColor} opacity="0.9" />
      <circle cx="77" cy="31" r="2" fill={trimColor} opacity="0.9" />
    </g>
  );
}

function WizardHat({ color, trimColor }: { color: string; trimColor: string }) {
  return (
    <g>
      {/* Robe */}
      <path d="M 32 58 L 30 95 Q 60 100 90 95 L 88 58" fill={color} stroke="#451a03" strokeWidth="1.5" />
      {/* Robe belt */}
      <rect x="42" y="72" width="36" height="5" rx="2" fill={trimColor} />
      {/* Pointy hat */}
      <path d="M 35 22 L 60 -12 L 85 22" fill={color} stroke="#451a03" strokeWidth="2" />
      {/* Hat brim */}
      <ellipse cx="60" cy="22" rx="30" ry="6" fill={color} stroke="#451a03" strokeWidth="1.5" />
      {/* Star on hat */}
      <polygon points="60,-2 62,4 68,4 63,8 65,14 60,10 55,14 57,8 52,4 58,4" fill={trimColor} />
      {/* Wand */}
      <line x1="95" y1="50" x2="108" y2="30" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="110" cy="28" r="4" fill={trimColor} opacity="0.8" />
    </g>
  );
}

function ScoutCape({ color }: { color: string }) {
  return (
    <g>
      {/* Cape flowing behind */}
      <path d="M 32 55 L 18 100 Q 60 108 102 100 L 88 55" fill={color} stroke="#166534" strokeWidth="2" opacity="0.8" />
      {/* Wings emblem */}
      <path d="M 50 68 L 42 62 L 48 68 L 40 72 L 50 68" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      <path d="M 70 68 L 78 62 L 72 68 L 80 72 L 70 68" fill="#1e40af" stroke="#1e3a5f" strokeWidth="0.8" />
      {/* Belt / 3DMG harness lines */}
      <line x1="40" y1="58" x2="40" y2="90" stroke="#78350f" strokeWidth="1.5" />
      <line x1="80" y1="58" x2="80" y2="90" stroke="#78350f" strokeWidth="1.5" />
      <rect x="38" y="75" width="4" height="6" rx="1" fill="#64748b" />
      <rect x="78" y="75" width="4" height="6" rx="1" fill="#64748b" />
    </g>
  );
}

function HeroCape({ color, trimColor }: { color: string; trimColor: string }) {
  return (
    <g>
      {/* Cape */}
      <path d="M 36 55 L 20 105 Q 60 115 100 105 L 84 55" fill={trimColor} stroke="#991b1b" strokeWidth="2" />
      {/* Jumpsuit */}
      <path d="M 36 58 L 36 92 Q 60 98 84 92 L 84 58" fill={color} stroke="#a16207" strokeWidth="1.5" />
      {/* Belt */}
      <rect x="38" y="74" width="44" height="6" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
      <circle cx="60" cy="77" r="3" fill={trimColor} />
      {/* Gloves */}
      <circle cx="14" cy="69" r="5" fill={trimColor} stroke="#991b1b" strokeWidth="1.5" />
      <circle cx="110" cy="57" r="5" fill={trimColor} stroke="#991b1b" strokeWidth="1.5" />
    </g>
  );
}

function GenericAccessory({ accessory, color, trimColor }: { accessory: string; color: string; trimColor: string }) {
  switch (accessory) {
    case 'sunglasses':
      return (
        <g>
          <rect x="32" y="26" width="20" height="10" rx="4" fill="#0f172a" stroke={trimColor} strokeWidth="1.5" />
          <rect x="68" y="26" width="20" height="10" rx="4" fill="#0f172a" stroke={trimColor} strokeWidth="1.5" />
          <line x1="52" y1="31" x2="68" y2="31" stroke={trimColor} strokeWidth="1.5" />
        </g>
      );
    case 'goggles':
      return (
        <g>
          <circle cx="44" cy="28" r="12" fill="none" stroke={trimColor} strokeWidth="2.5" />
          <circle cx="76" cy="28" r="12" fill="none" stroke={trimColor} strokeWidth="2.5" />
          <line x1="56" y1="28" x2="64" y2="28" stroke={trimColor} strokeWidth="2" />
          <circle cx="44" cy="28" r="8" fill={color} opacity="0.2" />
          <circle cx="76" cy="28" r="8" fill={color} opacity="0.2" />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M 34 55 Q 60 62 86 55 Q 88 65 86 75 L 78 85" fill={color} stroke={trimColor} strokeWidth="1.5" />
          <path d="M 78 85 L 72 100" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case 'mask':
      return (
        <g>
          <path d="M 36 38 Q 60 45 84 38 L 84 50 Q 60 56 36 50 Z" fill={color} stroke={trimColor} strokeWidth="1.5" opacity="0.85" />
        </g>
      );
    case 'earphones':
      return (
        <g>
          <path d="M 28 28 Q 24 28 24 36 L 24 42 Q 24 46 28 46" fill={color} stroke={trimColor} strokeWidth="1.5" />
          <path d="M 92 28 Q 96 28 96 36 L 96 42 Q 96 46 92 46" fill={color} stroke={trimColor} strokeWidth="1.5" />
          <path d="M 28 22 Q 28 8 60 8 Q 92 8 92 22" fill="none" stroke={trimColor} strokeWidth="2.5" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <ellipse cx="60" cy="18" rx="28" ry="6" fill={color} stroke={trimColor} strokeWidth="1.5" />
          <path d="M 32 18 Q 32 4 60 2 Q 88 4 88 18" fill={color} stroke={trimColor} strokeWidth="1.5" />
          <path d="M 30 18 L 18 22" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'headband':
      return (
        <g>
          <rect x="28" y="18" width="64" height="8" rx="3" fill={color} stroke={trimColor} strokeWidth="1.5" />
          <path d="M 90 22 L 100 18 L 104 24 L 98 28" fill={color} stroke={trimColor} strokeWidth="1" />
        </g>
      );
    case 'badge':
      return (
        <g>
          <circle cx="48" cy="72" r="6" fill={trimColor} stroke={color} strokeWidth="1.5" />
          <polygon points="48,67 49.5,70 53,70 50.5,72.5 51.5,76 48,74 44.5,76 45.5,72.5 43,70 46.5,70" fill={color} />
        </g>
      );
    case 'star-pin':
      return (
        <g>
          <polygon points="75,62 77,68 83,68 78,72 80,78 75,74 70,78 72,72 67,68 73,68" fill={trimColor} stroke={color} strokeWidth="1" />
        </g>
      );
    case 'cyber-glasses':
      return (
        <g>
          <rect x="30" y="25" width="24" height="12" rx="3" fill="#0f172a" stroke={trimColor} strokeWidth="2" />
          <rect x="66" y="25" width="24" height="12" rx="3" fill="#0f172a" stroke={trimColor} strokeWidth="2" />
          <line x1="54" y1="31" x2="66" y2="31" stroke={trimColor} strokeWidth="2" />
          {/* HUD display */}
          <line x1="35" y1="29" x2="48" y2="29" stroke={trimColor} strokeWidth="0.8" opacity="0.7" />
          <line x1="35" y1="32" x2="44" y2="32" stroke={trimColor} strokeWidth="0.8" opacity="0.5" />
          <circle cx="43" cy="31" r="1.5" fill={trimColor} opacity="0.9" />
          <circle cx="77" cy="31" r="1.5" fill={trimColor} opacity="0.9" />
        </g>
      );
    case 'astronaut':
      return (
        <g>
          <ellipse cx="60" cy="35" rx="30" ry="28" fill="none" stroke="#94a3b8" strokeWidth="3" />
          <ellipse cx="60" cy="35" rx="26" ry="24" fill="#e2e8f0" opacity="0.15" />
          <ellipse cx="50" cy="30" rx="6" ry="4" fill="#ffffff" opacity="0.3" />
        </g>
      );
    default:
      return null;
  }
}

/* ── Pattern Overlays ─────────────────────────────────────────────────── */
function PatternOverlay({ pattern, color }: { pattern: string; color: string }) {
  const patternOpacity = 0.15;
  switch (pattern) {
    case 'flame':
      return (
        <g opacity={patternOpacity}>
          <path d="M 40 95 Q 42 85 46 95 Q 48 85 52 95" stroke={color} fill="none" strokeWidth="2" />
          <path d="M 65 95 Q 68 82 72 95 Q 74 85 78 95" stroke={color} fill="none" strokeWidth="2" />
        </g>
      );
    case 'bolt':
      return (
        <g opacity={patternOpacity * 2}>
          <path d="M 50 65 L 55 72 L 52 72 L 58 82" stroke={color} fill="none" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 68 65 L 73 72 L 70 72 L 76 82" stroke={color} fill="none" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case 'star':
      return (
        <g opacity={patternOpacity * 2}>
          <polygon points="60,62 62,68 68,68 63,72 65,78 60,74 55,78 57,72 52,68 58,68" fill={color} />
        </g>
      );
    case 'wave':
      return (
        <g opacity={patternOpacity * 2}>
          <path d="M 35 80 Q 42 74 50 80 Q 58 86 65 80 Q 72 74 80 80" fill="none" stroke={color} strokeWidth="2" />
        </g>
      );
    case 'checkered':
      return (
        <g opacity={patternOpacity}>
          {[0, 1, 2, 3].map(i => (
            <rect key={i} x={42 + (i % 2) * 12} y={65 + Math.floor(i / 2) * 12} width="10" height="10" fill={color} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/* ── Aura Effects ─────────────────────────────────────────────────────── */
function AuraEffect({ skin }: { skin: MascotSkin }) {
  if (skin.rarity === 'legendary') {
    return (
      <g>
        <ellipse cx="60" cy="60" rx="52" ry="56" fill="none" stroke={skin.trimColor} strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="60" cy="60" rx="48" ry="52" fill="none" stroke={skin.outfitColor} strokeWidth="1" opacity="0.15" strokeDasharray="6 3">
          <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="6s" repeatCount="indefinite" />
        </ellipse>
      </g>
    );
  }
  if (skin.rarity === 'epic') {
    return (
      <ellipse cx="60" cy="60" rx="50" ry="54" fill="none" stroke={skin.trimColor} strokeWidth="1" opacity="0.15" strokeDasharray="3 6" />
    );
  }
  return null;
}

/* ── Main Renderer ────────────────────────────────────────────────────── */
export default function MascotSkinRenderer({ skinId, size = 100, expression = 'happy' }: MascotSkinRendererProps) {
  const skin = getMascotSkin(skinId);
  const svgInstanceId = useId().replace(/:/g, '');
  const skinGradientId = `skin-${skin.id}-${svgInstanceId}`;
  const bellyGradientId = `belly-${skin.id}-${svgInstanceId}`;
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
      className="drop-shadow-xl filter"
    >
      <defs>
        <radialGradient id={skinGradientId} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={skin.bodyColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={skin.bodyColor} />
        </radialGradient>
        <linearGradient id={bellyGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skin.bellyColor} />
          <stop offset="100%" stopColor={skin.bellyColor} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Aura effect for legendary/epic */}
      <AuraEffect skin={skin} />

      {/* Shadow */}
      <ellipse cx="60" cy="112" rx="38" ry="7" fill="#000000" fillOpacity="0.15" />

      {/* Special skin accessories (behind body) */}
      {skin.accessory === 'scout-cape' && <ScoutCape color={skin.outfitColor} />}
      {skin.accessory === 'hero-cape' && <HeroCape color={skin.outfitColor} trimColor={skin.trimColor} />}

      {/* Main Body */}
      <ellipse cx="60" cy="78" rx="32" ry="26" fill={`url(#${skinGradientId})`} stroke={skin.bodyColor} strokeWidth="2.5" />

      {/* Belly */}
      <ellipse cx="60" cy="82" rx="20" ry="16" fill={`url(#${bellyGradientId})`} stroke={skin.bellyColor} strokeWidth="1" />

      {/* Pattern overlay on body */}
      <PatternOverlay pattern={skin.pattern} color={skin.trimColor} />

      {/* Feet */}
      <ellipse cx="42" cy="106" rx="14" ry="6" fill={skin.bodyColor} stroke={skin.bodyColor} strokeWidth="1.5" />
      <ellipse cx="78" cy="106" rx="14" ry="6" fill={skin.bodyColor} stroke={skin.bodyColor} strokeWidth="1.5" />

      {/* Head */}
      <path
        d="M 32 46 C 24 20, 52 18, 55 36 C 58 36, 62 36, 65 36 C 68 18, 96 20, 88 46 C 98 62, 22 62, 32 46 Z"
        fill={skin.bodyColor}
        stroke={skin.bodyColor}
        strokeWidth="2"
      />

      {/* Left Eye */}
      <circle cx="44" cy="30" r="14" fill="#ffffff" stroke={skin.bodyColor} strokeWidth="2" />
      {isThinking ? <ellipse cx="46" cy="28" rx="4" ry="6" fill="#0f172a" /> :
       isSurprised ? <circle cx="44" cy="30" r="7" fill="#0f172a" /> :
       <circle cx="45" cy="30" r="6" fill="#0f172a" />}
      <circle cx="42" cy="27" r="2.5" fill="#ffffff" />

      {/* Right Eye */}
      <circle cx="76" cy="30" r="14" fill="#ffffff" stroke={skin.bodyColor} strokeWidth="2" />
      {isThinking ? <ellipse cx="74" cy="26" rx="4" ry="6" fill="#0f172a" /> :
       isSurprised ? <circle cx="76" cy="30" r="7" fill="#0f172a" /> :
       <circle cx="75" cy="30" r="6" fill="#0f172a" />}
      <circle cx="73" cy="27" r="2.5" fill="#ffffff" />

      {/* Cheeks */}
      <circle cx="36" cy="50" r="6" fill="#f472b6" fillOpacity="0.4" />
      <circle cx="84" cy="50" r="6" fill="#f472b6" fillOpacity="0.4" />

      {/* Mouth */}
      {isSad ? (
        <path d="M 46 54 Q 60 46 74 54" fill="none" stroke={skin.bodyColor} strokeWidth="3" strokeLinecap="round" />
      ) : isSurprised ? (
        <ellipse cx="60" cy="52" rx="7" ry="9" fill="#0f172a" stroke={skin.bodyColor} strokeWidth="1.5" />
      ) : (
        <path d="M 44 48 Q 60 60 76 48" fill="none" stroke={skin.bodyColor} strokeWidth="3" strokeLinecap="round" />
      )}

      {/* Arms */}
      <path d="M 32 70 Q 20 62 16 68" fill="none" stroke={skin.bodyColor} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="14" cy="69" r="4" fill={skin.bodyColor} stroke={skin.bodyColor} strokeWidth="1.5" />
      <path d="M 88 70 Q 102 62 108 58" fill="none" stroke={skin.bodyColor} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="110" cy="57" r="4" fill={skin.bodyColor} stroke={skin.bodyColor} strokeWidth="1.5" />

      {/* Skin-specific accessories (in front) */}
      {skin.accessory === 'hokage-hat' && <HokageHat color={skin.outfitColor} />}
      {skin.accessory === 'saiyan-aura' && <SaiyanAura color={skin.trimColor} />}
      {skin.accessory === 'strawhat' && <StrawHat />}
      {skin.accessory === 'demon-blade' && <DemonSlayerHaori color={skin.outfitColor} trimColor={skin.trimColor} />}
      {skin.accessory === 'blindfold' && <Blindfold color={skin.trimColor} />}
      {skin.accessory === 'cyber-jacket' && <CyberJacket color={skin.outfitColor} trimColor={skin.trimColor} />}
      {skin.accessory === 'wizard-hat' && <WizardHat color={skin.outfitColor} trimColor={skin.trimColor} />}
      
      {/* Generic accessories for non-themed skins */}
      {!['hokage-hat', 'saiyan-aura', 'strawhat', 'demon-blade', 'blindfold', 'cyber-jacket', 'wizard-hat', 'scout-cape', 'hero-cape'].includes(skin.accessory) && (
        <GenericAccessory accessory={skin.accessory} color={skin.outfitColor} trimColor={skin.trimColor} />
      )}
    </svg>
  );
}
