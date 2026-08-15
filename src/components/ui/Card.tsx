import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Card — flat, token-driven surface. No glassmorphism, no gradients.
 * Premium comes from restrained borders, tinted shadows, and generous padding.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding scale. Default 'md'. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Elevation via tinted shadow token. Default 'sm'. */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  /** Subtle lift + emerald border on hover (for clickable cards). */
  interactive?: boolean;
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-5)',
  lg: 'var(--space-6)',
};

const SHADOW: Record<NonNullable<CardProps['elevation']>, string> = {
  none: 'none',
  sm: 'var(--ech-shadow-sm)',
  md: 'var(--ech-shadow-md)',
  lg: 'var(--ech-shadow-lg)',
};

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = 'md', elevation = 'sm', interactive = false, style, className, children, ...rest },
  ref,
) {
  const reducedMotion = useReducedMotion();

  const baseStyle: React.CSSProperties = {
    background: 'var(--ech-surface)',
    border: '1px solid var(--ech-border)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: SHADOW[elevation],
    padding: PADDING[padding],
    ...style,
  };

  if (!interactive) {
    return (
      <div ref={ref} className={className} style={baseStyle} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...baseStyle, cursor: 'pointer' }}
      whileHover={reducedMotion ? undefined : { y: -2, boxShadow: 'var(--ech-shadow-md)' }}
      whileTap={reducedMotion ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
});

export default Card;
