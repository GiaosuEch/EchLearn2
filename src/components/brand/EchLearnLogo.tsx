interface EchLearnLogoProps {
  className?: string;
  compact?: boolean;
  showTagline?: boolean;
}

/** Shared wordmark based on the EchLearn identity: navy type, leaf-green frog mark. */
export function EchLearnLogo({ className = '', compact = false, showTagline = false }: EchLearnLogoProps) {
  return (
    <div className={`ech-logo ${compact ? 'ech-logo--compact' : ''} ${className}`} aria-label="EchLearn English Mentor">
      <div className="ech-logo__wordmark" aria-hidden="true">
        <span className="ech-logo__ink">Ech</span>
        <span className="ech-logo__green">Learn</span>
      </div>
      {showTagline && <span className="ech-logo__tagline">English mentor</span>}
    </div>
  );
}

export default EchLearnLogo;
