import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface PepeReadingBook3DProps {
  size?: number;
  className?: string;
  imageUrl?: string;
}

export function PepeReadingBook3D({
  size = 460,
  className = '',
  imageUrl = '/mascots/ech_buri_study_companion.png',
}: PepeReadingBook3DProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Clean Ambient Radial Halo Behind Pepe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(111,255,0,0.18),transparent_70%)] blur-3xl pointer-events-none" />

      {/* Pepe Smooth Floating Physics */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, -1, 0, 1, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex items-center justify-center [perspective:1000px] z-10"
      >
        {/* Pepe Mascot Image - Clean, Sharp & Crisp */}
        <img
          src={imageUrl}
          alt="Pepe Mascot Reading Book MEMOLOGY 101"
          style={{ width: size, height: size }}
          className="object-contain filter drop-shadow-[0_20px_45px_rgba(111,255,0,0.25)]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/mascots/ech_buri_study_companion.png';
          }}
        />

        {/* Ambient Magic Sparkles Floating Gracefully */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {[0, 1, 2, 3].map((sparkleIdx) => (
            <motion.div
              key={sparkleIdx}
              animate={{
                y: [10, -70],
                x: [(sparkleIdx % 2 === 0 ? 20 : -20), (sparkleIdx % 2 === 0 ? -40 : 40)],
                opacity: [0, 0.85, 0],
                scale: [0.5, 1.2, 0.3],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: sparkleIdx * 0.5,
                ease: 'easeOut',
              }}
              className="absolute top-[40%] left-[48%] text-[#6FFF00]"
            >
              <Sparkles size={16} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
