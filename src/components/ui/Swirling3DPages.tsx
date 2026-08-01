import { motion } from 'motion/react';

export function Swirling3DPages() {
  // Elegant, delicate floating paper sheets placed in outer ambient space
  const pages = [
    { id: 1, top: '12%', left: '8%', size: 'w-10 h-14', delay: 0, rotate: -22, pathX: [-10, 15, -10], pathY: [0, -25, 0] },
    { id: 2, top: '18%', right: '12%', size: 'w-12 h-16', delay: 0.8, rotate: 28, pathX: [12, -15, 12], pathY: [0, -30, 0] },
    { id: 3, top: '42%', right: '6%', size: 'w-11 h-15', delay: 1.4, rotate: 15, pathX: [15, -18, 15], pathY: [0, -25, 0] },
    { id: 4, top: '65%', right: '15%', size: 'w-10 h-14', delay: 0.5, rotate: -18, pathX: [-12, 15, -12], pathY: [0, -28, 0] },
    { id: 5, top: '8%', left: '38%', size: 'w-9 h-12', delay: 1.1, rotate: 10, pathX: [8, -12, 8], pathY: [0, -20, 0] },
    { id: 6, top: '68%', left: '10%', size: 'w-11 h-15', delay: 1.8, rotate: 32, pathX: [12, -15, 12], pathY: [0, -22, 0] },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden [perspective:1200px]">
      {pages.map((p) => (
        <motion.div
          key={p.id}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
          }}
          animate={{
            x: p.pathX,
            y: p.pathY,
            rotateX: [0, 35, 0, -35, 0],
            rotateY: [0, 50, 0, -50, 0],
            rotateZ: [p.rotate, p.rotate + 15, p.rotate - 15, p.rotate],
          }}
          transition={{
            duration: 7 + (p.id % 3),
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          className={`absolute ${p.size} rounded-md bg-gradient-to-br from-white/80 via-purple-100/40 to-[#6FFF00]/20 border border-white/40 shadow-[0_12px_30px_rgba(0,0,0,0.3)] backdrop-blur-md transform-gpu`}
        >
          {/* Subtle 3D paper lines */}
          <div className="p-2 space-y-1 opacity-30">
            <div className="h-0.5 w-full bg-white/80 rounded" />
            <div className="h-0.5 w-3/4 bg-white/80 rounded" />
            <div className="h-0.5 w-4/5 bg-white/80 rounded" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
