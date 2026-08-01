import { motion } from 'motion/react';

export function MasterpieceCosmicPortal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
      {/* Outer Van Gogh Cosmic Swirl Aura */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute w-[580px] h-[580px] sm:w-[720px] sm:h-[720px] rounded-full opacity-45 blur-3xl"
        style={{
          background: 'conic-gradient(from 0deg, #6FFF00, #10B981, #06B6D4, #6366F1, #EC4899, #FF4000, #6FFF00)',
        }}
      />

      {/* Apple Glassmorphism Inner Sphere Core */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full border-2 border-white/20 bg-gradient-to-b from-[#6FFF00]/15 via-[#10B981]/10 to-[#010828]/80 backdrop-blur-3xl shadow-[0_0_120px_rgba(111,255,0,0.25)] flex items-center justify-center"
      >
        {/* Swirling Golden Ratio Light Rings (Van Gogh Starry Night Energy) */}
        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 rounded-full border border-dashed border-[#6FFF00]/40 opacity-70"
        />

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-14 rounded-full border border-white/30 opacity-50"
        />

        <motion.div
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-28 rounded-full border border-emerald-400/40 opacity-60"
        />

        {/* Specular Light Reflection Arc (Apple Design System) */}
        <div className="absolute top-6 inset-x-12 h-32 rounded-t-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none blur-sm" />
      </motion.div>
    </div>
  );
}
