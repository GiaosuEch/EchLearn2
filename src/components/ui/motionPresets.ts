import type { Transition } from 'motion/react';

/**
 * Phase 7 shared motion presets.
 *
 * A single source of truth for entry/transition motion so every page and
 * surface feels consistent — and so reduced-motion is honored everywhere via
 * one helper instead of ad-hoc `initial`/`animate` props scattered per page.
 *
 * Mirrors the CSS motion tokens in index.css (--ech-ease-out, --ech-dur-*).
 */

// easeOutQuint-ish curve matching --ech-ease-out.
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DURATION = {
  fast: 0.12,
  base: 0.2,
  slow: 0.42,
  reveal: 0.9,
} as const;

export interface MotionEntryProps {
  initial: false | { opacity: number; y?: number };
  animate: { opacity: number; y?: number };
  transition: Transition;
}

/**
 * Standard "fade + rise" page/section entry.
 * Under reduced motion, elements appear instantly with no transform.
 */
export function fadeRise(reducedMotion: boolean | null, delay = 0): MotionEntryProps {
  if (reducedMotion) {
    return { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } };
  }
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.slow, ease: EASE_OUT, delay },
  };
}

/** Simple fade only (for content that shouldn't shift layout). */
export function fadeIn(reducedMotion: boolean | null, delay = 0): MotionEntryProps {
  if (reducedMotion) {
    return { initial: false, animate: { opacity: 1 }, transition: { duration: 0 } };
  }
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: DURATION.slow, ease: EASE_OUT, delay },
  };
}
