import type { ReactNode } from 'react';

export interface SectionEyebrowProps {
  children: ReactNode;
}

export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return <p className="atelier-eyebrow">{children}</p>;
}

export default SectionEyebrow;
