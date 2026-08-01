import { motion } from 'motion/react';

export function VanGoghSectionAccents() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {/* Dynamic Van Gogh Swirling Wind Strokes (SVG Vector Impasto Curves) */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vanGoghGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#E5A93B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2E5A44" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <motion.path
          d="M -100 150 Q 200 50, 500 250 T 1100 100 T 1800 300"
          fill="none"
          stroke="url(#vanGoghGoldGrad)"
          strokeWidth="3"
          strokeDasharray="12 8"
          animate={{ strokeDashoffset: [0, -200] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        <motion.path
          d="M -50 400 Q 300 200, 700 500 T 1300 350 T 1950 550"
          fill="none"
          stroke="url(#vanGoghGoldGrad)"
          strokeWidth="4"
          strokeDasharray="15 10"
          animate={{ strokeDashoffset: [0, 200] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  );
}
