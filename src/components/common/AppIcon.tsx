import type { ComponentProps } from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  CircleX,
  Crown,
  Flame,
  Gift,
  GraduationCap,
  Headphones,
  Heart,
  Inbox,
  Lightbulb,
  Mic,
  Moon,
  PartyPopper,
  Pencil,
  Puzzle,
  Send,
  Sparkles,
  Star,
  Target,
  Trophy,
  Volume2,
  Zap,
} from 'lucide-react';

export type AppIconName =
  | 'blob-happy' | 'blob-sad' | 'blob-think' | 'blob-cheer' | 'blob-heart' | 'blob-fire' | 'blob-cool'
  | 'streak-fire' | 'xp-star' | 'xp-bolt' | 'league-crown' | 'trophy-gold' | 'gem-blue' | 'coin-gold'
  | 'heart-life' | 'gift-chest' | 'verified-check' | 'sparkles-badge' | 'ielts-target' | 'graduation-cap'
  | 'brain-grammar' | 'owl-night' | 'butterfly-social' | 'speaker-audio' | 'arrow-hint' | 'wave-hello'
  | 'note-write' | 'cross-error' | 'lightbulb-tip' | 'party-popper' | 'film-clip' | 'puzzle-piece' | 'moon-dark'
  | 'inbox-in' | 'inbox-out' | 'skill-book' | 'skill-mic' | 'skill-headphones' | 'skill-pencil' | 'skill-target';

type AppIconProps = Omit<ComponentProps<typeof Sparkles>, 'ref'> & {
  name: AppIconName;
  size?: number;
};

const ICONS = {
  'blob-happy': Sparkles,
  'blob-sad': Heart,
  'blob-think': Lightbulb,
  'blob-cheer': Sparkles,
  'blob-heart': Heart,
  'blob-fire': Flame,
  'blob-cool': Star,
  'streak-fire': Flame,
  'xp-star': Star,
  'xp-bolt': Zap,
  'league-crown': Crown,
  'trophy-gold': Trophy,
  'gem-blue': Sparkles,
  'coin-gold': Star,
  'heart-life': Heart,
  'gift-chest': Gift,
  'verified-check': CheckCircle2,
  'sparkles-badge': Sparkles,
  'ielts-target': Target,
  'graduation-cap': GraduationCap,
  'brain-grammar': Brain,
  'owl-night': Moon,
  'butterfly-social': Sparkles,
  'speaker-audio': Volume2,
  'arrow-hint': Send,
  'wave-hello': Heart,
  'note-write': Pencil,
  'cross-error': CircleX,
  'lightbulb-tip': Lightbulb,
  'party-popper': PartyPopper,
  'film-clip': Sparkles,
  'puzzle-piece': Puzzle,
  'moon-dark': Moon,
  'inbox-in': Inbox,
  'inbox-out': Inbox,
  'skill-book': BookOpen,
  'skill-mic': Mic,
  'skill-headphones': Headphones,
  'skill-pencil': Pencil,
  'skill-target': Target,
} as const;

/** Shared, recognisable line icons for every functional UI surface. */
export function AppIcon({ name, size = 20, className = '', ...props }: AppIconProps) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={2} className={`shrink-0 text-emerald-600 dark:text-emerald-400 ${className}`} {...props} />;
}

export default AppIcon;
