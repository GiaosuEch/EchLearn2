import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * AnimatedNumber — deterministic count-up primitive.
 *
 * NON-AI / NO-FABRICATION CONTRACT:
 *  - The animation is a pure presentation of a value that was ALREADY computed
 *    upstream by the deterministic math cores (e.g. IELTSEvaluator, SRSAlgorithm).
 *  - The final rendered value is guaranteed to equal `value` exactly — the tween
 *    only affects intermediate frames, never the resting result.
 *  - When the user prefers reduced motion, the value is shown instantly.
 *
 * It never generates, rounds-away, or guesses a number on its own.
 */
export interface AnimatedNumberProps {
  /** The final, already-computed value to display. */
  value: number;
  /** Fixed decimal places (e.g. 1 for an IELTS Band like 7.5). Default 0. */
  decimals?: number;
  /** Count-up envelope in ms. Ignored under reduced motion. Default token: 900ms. */
  durationMs?: number;
  /** Value to start counting from. Default 0. */
  from?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Optional custom formatter; overrides `decimals`/`prefix`/`suffix`. */
  format?: (n: number) => string;
  'aria-label'?: string;
}

// easeOutCubic — matches --ech-ease-out feel; deterministic, no randomness.
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  durationMs = 900,
  from = 0,
  prefix = '',
  suffix = '',
  className,
  format,
  'aria-label': ariaLabel,
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState<number>(reducedMotion ? value : from);
  const frameRef = useRef<number | null>(null);

  const render = (n: number): string =>
    format ? format(n) : `${prefix}${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    // Reduced motion or non-finite input → land on the exact value immediately.
    if (reducedMotion || !Number.isFinite(value)) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const startValue = from;
    const delta = value - startValue;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / Math.max(1, durationMs));
      const next = startValue + delta * easeOutCubic(progress);
      if (progress >= 1) {
        setDisplay(value); // guarantee exact final value
        frameRef.current = null;
        return;
      }
      setDisplay(next);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, from, durationMs, reducedMotion]);

  return (
    <span className={className} aria-label={ariaLabel ?? render(value)}>
      {/* Screen readers get the final value; sighted users see the count-up. */}
      <span aria-hidden="true">{render(display)}</span>
    </span>
  );
}
