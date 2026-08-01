import React from 'react';
import { CustomEmote, type EmoteType } from '../common/CustomEmote';

interface ExpressiveBadgeProps {
  children: React.ReactNode;
  emote?: EmoteType;
  variant?: 'emerald' | 'amber' | 'sky' | 'purple' | 'rose' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 border-b-4 border-b-emerald-600',
  amber: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 border-b-4 border-b-amber-600',
  sky: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 border-b-4 border-b-sky-600',
  purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 border-b-4 border-b-purple-600',
  rose: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 border-b-4 border-b-rose-600',
  slate: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 border-b-4 border-b-slate-400 dark:border-b-slate-900',
};

const SIZE_STYLES: Record<string, { badge: string; emoteSize: number }> = {
  sm: { badge: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl font-extrabold', emoteSize: 18 },
  md: { badge: 'px-3.5 py-1.5 text-sm gap-2 rounded-2xl font-black', emoteSize: 22 },
  lg: { badge: 'px-4 py-2 text-base gap-2.5 rounded-2xl font-black', emoteSize: 26 },
};

export function ExpressiveBadge({
  children,
  emote,
  variant = 'emerald',
  size = 'md',
  className = '',
}: ExpressiveBadgeProps) {
  const currentSize = SIZE_STYLES[size] || SIZE_STYLES.md;
  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.emerald;

  return (
    <span
      className={`inline-flex items-center tracking-wide shadow-sm transform hover:-translate-y-0.5 active:translate-y-0 transition-transform ${currentSize.badge} ${currentVariant} ${className}`}
    >
      {emote && <CustomEmote type={emote} size={currentSize.emoteSize} />}
      <span>{children}</span>
    </span>
  );
}

export default ExpressiveBadge;
