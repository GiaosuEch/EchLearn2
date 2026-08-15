export interface SectionHeadingProps {
  /** Small uppercase eyebrow above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Trailing content (e.g. an action button), right-aligned. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeading — consistent typographic header for page sections.
 * Uses the Phase 7 typography tokens for a calm, premium hierarchy.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-5)',
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: 'var(--text-caption)',
              fontWeight: 'var(--weight-semibold)' as unknown as number,
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--ech-green-dark)',
              marginBottom: 'var(--space-1)',
            }}
          >
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--weight-bold)' as unknown as number,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--ech-text)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-normal)',
              color: 'var(--ech-text-muted)',
              marginTop: 'var(--space-2)',
              maxWidth: '60ch',
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action != null && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
