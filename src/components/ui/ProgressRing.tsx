import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * ProgressRing — circular progress fed by an already-computed ratio.
 *
 * NON-AI CONTRACT: `value` is a real, upstream-computed ratio in [0, 1]
 * (e.g. SRSAlgorithm.calculateRetrievability). This component only draws it.
 * It clamps out-of-range input but never invents progress.
 */
export interface ProgressRingProps {
  /** Progress ratio in [0, 1]. */
  value: number;
  /** Pixel diameter. Default 64. */
  size?: number;
  /** Stroke width. Default 6. */
  stroke?: number;
  /** Track color token. Default var(--ech-border). */
  trackColor?: string;
  /** Fill color token. Default var(--ech-green). */
  fillColor?: string;
  /** Optional centered content (e.g. a percentage label). */
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export default function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  trackColor = 'var(--ech-border)',
  fillColor = 'var(--ech-green)',
  children,
  className,
  'aria-label': ariaLabel,
}: ProgressRingProps) {
  const reducedMotion = useReducedMotion();
  const gradientId = useId();
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const pct = Math.round(clamped * 100);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${pct}%`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true" focusable="false" key={gradientId}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reducedMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {children != null && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
