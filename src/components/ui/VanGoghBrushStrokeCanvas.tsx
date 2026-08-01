import { motion } from 'motion/react';

export function VanGoghBrushStrokeCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
      {/* SVG Van Gogh Impasto Oil Brush Strokes (Vector Swirl Textures) */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="goldOilBrush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#E5A93B" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#2E5A44" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6FFF00" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="starryBlueBrush" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A89DC" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1E3F60" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Swirling Wind Strokes Around Center */}
        <motion.path
          d="M -100,200 C 300,50 600,450 1100,200 C 1400,50 1800,350 2100,150"
          fill="none"
          stroke="url(#goldOilBrush)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="18 12"
          animate={{ strokeDashoffset: [0, -300] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        <motion.path
          d="M -50,450 C 400,250 800,600 1300,300 C 1600,150 1950,500 2200,250"
          fill="none"
          stroke="url(#starryBlueBrush)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="24 16"
          animate={{ strokeDashoffset: [0, 350] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        />

        {/* Impressionist Star Spirals */}
        <g transform="translate(18%, 25%)">
          <motion.circle
            cx="0"
            cy="0"
            r="80"
            fill="none"
            stroke="url(#goldOilBrush)"
            strokeWidth="4"
            strokeDasharray="10 15"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
        </g>

        <g transform="translate(82%, 35%)">
          <motion.circle
            cx="0"
            cy="0"
            r="110"
            fill="none"
            stroke="url(#starryBlueBrush)"
            strokeWidth="5"
            strokeDasharray="14 18"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
        </g>
      </svg>
    </div>
  );
}
