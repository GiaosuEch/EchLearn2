import { motion } from 'motion/react';

interface BlobBackgroundProps {
  className?: string;
  variant?: 'default' | 'aurora' | 'cosmic' | 'dreamcore';
  colors?: string[]; // backward compat
}

export function BlobBackground({ 
  className = '',
  variant: _variant = 'dreamcore',
  colors: _colors,
}: BlobBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Primary surreal dreamcore blob */}
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1.1, 1], 
          x: [0, 100, -50, 0],
          y: [0, -60, 40, 0],
          opacity: [0.12, 0.28, 0.16, 0.12],
          rotate: [0, 25, -15, 0]
        }} 
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute -top-1/4 -right-1/4 w-[750px] h-[750px] rounded-full bg-gradient-to-br from-cyan-400 via-indigo-600 to-purple-600 blur-[130px]" 
      />
      
      {/* Secondary dreamcore neon sphere */}
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.35, 1.2], 
          x: [0, -80, 50, 0],
          y: [0, 80, -40, 0],
          opacity: [0.1, 0.22, 0.12, 0.1],
          rotate: [0, -30, 15, 0]
        }} 
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute -bottom-1/3 -left-1/4 w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-emerald-400 blur-[120px]" 
      />
      
      {/* Tertiary surreal floating light orb */}
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 0.85, 1], 
          x: [0, 45, -60, 0],
          y: [0, -35, 30, 0],
          opacity: [0.08, 0.18, 0.1, 0.08],
          rotate: [0, 35, -20, 0]
        }} 
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-1/3 left-1/3 w-[550px] h-[550px] rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 blur-[110px]" 
      />

      {/* Dreamcore floating light capsule orb */}
      <motion.div
        animate={{
          scale: [0.9, 1.3, 1, 0.9],
          x: [-30, 50, -20, -30],
          y: [20, -40, 60, 20],
          opacity: [0.05, 0.15, 0.08, 0.05],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/4 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-violet-600 blur-[90px]"
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px'
      }} />
    </div>
  );
}
