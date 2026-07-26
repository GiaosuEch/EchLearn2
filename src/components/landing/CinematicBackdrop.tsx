import type { JSX } from 'react';

export type CinematicBackdropProps = {
  intensity?: 'hero' | 'quiet' | 'luminous';
  className?: string;
};

/**
 * CSS honors prefers-reduced-motion so this purely decorative scene stays static
 * for people who request less motion.
 */
export function CinematicBackdrop({
  intensity = 'hero',
  className,
}: CinematicBackdropProps): JSX.Element {
  const classes = ['cinematic-backdrop', 'cinematic-motion', `cinematic-backdrop--${intensity}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} aria-hidden="true">
      <div className="cinematic-backdrop__light" />
      <div className="cinematic-backdrop__horizon" />
      <div className="cinematic-backdrop__orb cinematic-backdrop__orb--one" />
      <div className="cinematic-backdrop__orb cinematic-backdrop__orb--two" />
    </div>
  );
}
