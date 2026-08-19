import { useId } from 'react';

interface EchLearnLogoProps {
  className?: string;
  compact?: boolean;
  showTagline?: boolean;
  showIcon?: boolean;
}

/**
 * Canonical EchLearn Logo with the authentic Ech Buri frog mascot icon.
 */
export function EchLearnLogo({ className = '', compact = false, showTagline = false, showIcon = true }: EchLearnLogoProps) {
  const iconSize = compact ? 32 : 40;
  const gradientId = `logoBgGrad-${useId()}`;

  return (
    <div className={`ech-logo flex items-center gap-2.5 ${compact ? 'ech-logo--compact' : ''} ${className}`} aria-label="EchLearn English Mentor">
      {showIcon && (
        <div className="relative shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 64 64" width={iconSize} height={iconSize} className="rounded-xl shadow-sm transition-transform group-hover:scale-105" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22C55E"/>
                <stop offset="100%" stopColor="#15803D"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${gradientId})`}/>
            <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" fill="none" stroke="#86EFAC" strokeWidth="1" strokeOpacity="0.4"/>
            
            {/* Eye Bumps (Outer) */}
            <circle cx="21" cy="22" r="10" fill="#166534"/>
            <circle cx="43" cy="22" r="10" fill="#166534"/>
            <circle cx="21" cy="22" r="9" fill="#22C55E"/>
            <circle cx="43" cy="22" r="9" fill="#22C55E"/>

            {/* Head / Face Body */}
            <path d="M 12 33 C 11 44 18 53 32 53 C 46 53 53 44 52 33 C 51 27 46 25 42 27 C 37 29 27 29 22 27 C 18 25 13 27 12 33 Z" fill="#22C55E"/>
            
            {/* Eye Whites */}
            <circle cx="21" cy="22" r="6.5" fill="#FFFFFF"/>
            <circle cx="43" cy="22" r="6.5" fill="#FFFFFF"/>

            {/* Pupils */}
            <circle cx="21.5" cy="22" r="3.2" fill="#052E16"/>
            <circle cx="42.5" cy="22" r="3.2" fill="#052E16"/>

            {/* Eye Catchlight Highlights */}
            <circle cx="20" cy="20.5" r="1.3" fill="#FFFFFF"/>
            <circle cx="41" cy="20.5" r="1.3" fill="#FFFFFF"/>

            {/* Cheerful Smile */}
            <path d="M 25 39 Q 32 46 39 39" fill="none" stroke="#052E16" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Rosy Cheeks */}
            <ellipse cx="17" cy="40" rx="2.5" ry="1.4" fill="#F97316" opacity="0.45"/>
            <ellipse cx="47" cy="40" rx="2.5" ry="1.4" fill="#F97316" opacity="0.45"/>
          </svg>
        </div>
      )}
      <div className="flex flex-col justify-center">
        <div className="ech-logo__wordmark" aria-hidden="true">
          <span className="ech-logo__ink">Ech</span>
          <span className="ech-logo__green">Learn</span>
        </div>
        {showTagline && <span className="ech-logo__tagline">English mentor</span>}
      </div>
    </div>
  );
}

export default EchLearnLogo;
