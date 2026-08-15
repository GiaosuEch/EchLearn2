import Card from './Card';
import AnimatedNumber from './AnimatedNumber';

export interface StatTileProps {
  label: string;
  /** Already-computed numeric value (deterministic upstream). */
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Optional leading icon (e.g. a lucide-react icon element). */
  icon?: React.ReactNode;
  /** Animate the value with a count-up. Default true. */
  animate?: boolean;
  className?: string;
}

/**
 * StatTile — compact metric card. Wraps AnimatedNumber so the displayed value
 * always resolves to the exact upstream figure (no fabricated stats).
 */
export default function StatTile({
  label,
  value,
  decimals = 0,
  prefix,
  suffix,
  icon,
  animate = true,
  className,
}: StatTileProps) {
  return (
    <Card padding="sm" elevation="sm" className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {icon != null && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'color-mix(in srgb, var(--ech-green) 12%, transparent)',
              color: 'var(--ech-green-dark)',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-caption)',
              fontWeight: 'var(--weight-medium)' as unknown as number,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--ech-text-muted)',
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--weight-bold)' as unknown as number,
              letterSpacing: 'var(--tracking-tight)',
              lineHeight: 'var(--leading-tight)',
              color: 'var(--ech-text)',
            }}
          >
            {animate ? (
              <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
            ) : (
              `${prefix ?? ''}${value.toFixed(decimals)}${suffix ?? ''}`
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
