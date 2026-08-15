export type BadgeTone = 'neutral' | 'green' | 'amber' | 'danger' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

function toneStyle(tone: BadgeTone): React.CSSProperties {
  switch (tone) {
    case 'green':
      return { background: 'color-mix(in srgb, var(--ech-green) 14%, transparent)', color: 'var(--ech-green-dark)' };
    case 'amber':
      return { background: 'color-mix(in srgb, var(--color-accent-500) 16%, transparent)', color: 'var(--color-accent-600)' };
    case 'danger':
      return { background: 'color-mix(in srgb, var(--color-error) 14%, transparent)', color: 'var(--color-error)' };
    case 'info':
      return { background: 'color-mix(in srgb, var(--color-info) 16%, transparent)', color: 'var(--color-info)' };
    case 'neutral':
    default:
      return { background: 'var(--ech-surface-2)', color: 'var(--ech-text-muted)' };
  }
}

/**
 * Badge — small status pill. Used for levels, states, and honest capability
 * markers (e.g. "Unavailable"). Purely presentational.
 */
export default function Badge({ tone = 'neutral', style, children, ...rest }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        fontSize: 'var(--text-caption)',
        fontWeight: 'var(--weight-semibold)' as unknown as number,
        letterSpacing: 'var(--tracking-wide)',
        padding: '0.15rem 0.55rem',
        borderRadius: 'var(--radius-sm)',
        ...toneStyle(tone),
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
