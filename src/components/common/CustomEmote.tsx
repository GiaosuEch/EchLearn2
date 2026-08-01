import { Flame, Star, Crown, Target, CheckCircle2, Sparkles, Trophy, Zap } from 'lucide-react';

export type EmoteType = 
  | 'mascot-happy'
  | 'mascot-celebrate'
  | 'mascot-tutor'
  | 'mascot-thinking'
  | 'mascot-study'
  | 'mascot-vangogh'
  | 'mascot-backpack'
  | 'mascot-avatar'
  | 'peepo-happy'
  | 'peepo-smart'
  | 'peepo-dance'
  | 'peepo-pat'
  | 'blob-cheer'
  | 'blob-heart'
  | 'blob-fire'
  | 'cat-jam'
  | 'ech-buri-think'
  | 'streak-fire'
  | 'xp-star'
  | 'league-crown'
  | 'ielts-target'
  | 'verified-check'
  | 'sparkles-badge'
  | 'trophy-gold';

interface CustomEmoteProps {
  type: EmoteType;
  size?: number;
  className?: string;
}

const MASCOT_MAP: Record<string, string> = {
  'mascot-happy': '/mascots/ech_buri_duolingo_style_mascot.png',
  'mascot-celebrate': '/mascots/pepe_mascot_celebrate.png',
  'mascot-tutor': '/mascots/pepe_mascot_tutor.png',
  'mascot-thinking': '/mascots/pepe_mascot_thinking.png',
  'mascot-study': '/mascots/ech_buri_study_companion.png',
  'mascot-vangogh': '/mascots/ech_buri_vangogh_mascot.png',
  'mascot-backpack': '/mascots/mascot_frog_backpack.png',
  'mascot-avatar': '/mascots/pepe_mascot_avatar.png',
  'peepo-happy': '/mascots/ech_buri_official_mascot.png',
  'peepo-smart': '/mascots/ech_buri_study_companion.png',
  'peepo-dance': '/mascots/pepe_mascot_celebrate.png',
  'peepo-pat': '/mascots/pepe_mascot_avatar.png',
  'blob-cheer': '/mascots/pepe_mascot_celebrate.png',
  'blob-heart': '/mascots/ech_buri_duolingo_style_mascot.png',
  'blob-fire': '/mascots/pepe_mascot_tutor.png',
  'cat-jam': '/mascots/ech_buri_vangogh_mascot.png',
  'ech-buri-think': '/mascots/pepe_mascot_thinking.png',
};

export function CustomEmote({ type, size = 24, className = '' }: CustomEmoteProps) {
  if (MASCOT_MAP[type]) {
    return (
      <img
        src={MASCOT_MAP[type]}
        alt={type}
        style={{ width: size, height: size }}
        className={`inline-block object-cover rounded-full shadow-sm transform hover:scale-110 transition-transform ${className}`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/mascots/pepe_mascot_avatar.png';
        }}
      />
    );
  }

  switch (type) {
    case 'streak-fire':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 p-1 shrink-0 ${className}`}>
          <Flame size={size * 0.7} className="fill-white stroke-white animate-pulse" />
        </span>
      );
    case 'xp-star':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30 p-1 shrink-0 ${className}`}>
          <Star size={size * 0.7} className="fill-slate-950 stroke-slate-950" />
        </span>
      );
    case 'league-crown':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-400/30 p-1 shrink-0 ${className}`}>
          <Crown size={size * 0.7} className="fill-slate-950 stroke-slate-950" />
        </span>
      );
    case 'ielts-target':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30 p-1 shrink-0 ${className}`}>
          <Target size={size * 0.7} className="stroke-[2.5]" />
        </span>
      );
    case 'verified-check':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 p-1 shrink-0 ${className}`}>
          <CheckCircle2 size={size * 0.7} className="stroke-[2.5]" />
        </span>
      );
    case 'sparkles-badge':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white shadow-md shadow-sky-400/30 p-1 shrink-0 ${className}`}>
          <Sparkles size={size * 0.7} className="fill-white stroke-white" />
        </span>
      );
    case 'trophy-gold':
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 shadow-md shadow-amber-500/30 p-1 shrink-0 ${className}`}>
          <Trophy size={size * 0.7} className="fill-slate-950 stroke-slate-950" />
        </span>
      );
    default:
      return (
        <span style={{ width: size, height: size }} className={`inline-flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 p-1 shrink-0 ${className}`}>
          <Zap size={size * 0.7} />
        </span>
      );
  }
}

export default CustomEmote;
