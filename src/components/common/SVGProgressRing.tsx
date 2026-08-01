import { useEffect, useState } from 'react';

interface SVGProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  delayMs?: number;
}

export function SVGProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  color = '#10B981',
  trackColor = 'rgba(148,163,184,0.15)',
  label,
  sublabel,
  delayMs = 150,
}: SVGProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(100, Math.max(0, progress)));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [progress, delayMs]);

  const dashOffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Target Fill Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </svg>

        {/* Center Percentage Text */}
        <span className="absolute text-xs font-black text-slate-900 dark:text-white font-mono">
          {Math.round(animatedProgress)}%
        </span>
      </div>

      {label && (
        <span className="text-[11px] font-extrabold text-slate-900 dark:text-white mt-1.5">{label}</span>
      )}
      {sublabel && (
        <span className="text-[10px] text-slate-400 font-medium">{sublabel}</span>
      )}
    </div>
  );
}
