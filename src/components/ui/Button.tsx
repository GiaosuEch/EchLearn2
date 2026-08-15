import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const SIZE: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: 'var(--text-sm)', padding: '0.4rem 0.75rem', minHeight: 36 },
  md: { fontSize: 'var(--text-body)', padding: '0.55rem 1rem', minHeight: 44 },
  lg: { fontSize: 'var(--text-h4)', padding: '0.7rem 1.4rem', minHeight: 52 },
};

function variantStyle(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return { background: 'var(--ech-action)', color: '#052e21', border: '1px solid transparent' };
    case 'secondary':
      return { background: 'var(--ech-surface-2)', color: 'var(--ech-text)', border: '1px solid var(--ech-border)' };
    case 'danger':
      return { background: 'var(--color-error)', color: '#ffffff', border: '1px solid transparent' };
    case 'ghost':
    default:
      return { background: 'transparent', color: 'var(--ech-text-muted)', border: '1px solid transparent' };
  }
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, disabled, style, className, children, ...rest },
  ref,
) {
  const reducedMotion = useReducedMotion();

  const composed: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontWeight: 'var(--weight-semibold)' as unknown as number,
    borderRadius: 'var(--radius-md)',
    width: fullWidth ? '100%' : undefined,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'background var(--ech-dur-fast) ease, color var(--ech-dur-fast) ease',
    ...SIZE[size],
    ...variantStyle(variant),
    ...style,
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      style={composed}
      disabled={disabled}
      whileHover={reducedMotion || disabled ? undefined : { scale: 1.02 }}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
});

export default Button;
