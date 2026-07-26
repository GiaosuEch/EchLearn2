import type { ReactNode } from 'react';

export type AtelierSurfaceTone =
  | 'default'
  | 'canvas'
  | 'surface'
  | 'raised'
  | 'accent'
  | 'muted'
  | 'emphasis';

export interface AtelierSurfaceProps {
  tone?: AtelierSurfaceTone;
  children: ReactNode;
  className?: string;
}

export function AtelierSurface({
  tone = 'default',
  children,
  className = '',
}: AtelierSurfaceProps) {
  const classes = ['atelier-surface', `atelier-surface--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return <section className={classes}>{children}</section>;
}

export default AtelierSurface;
