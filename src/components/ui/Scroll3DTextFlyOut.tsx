import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface Scroll3DTextFlyOutProps {
  text: string;
  className?: string;
  glowColor?: string;
}

export function Scroll3DTextFlyOut({
  text,
  className = '',
  glowColor = '#6FFF00',
}: Scroll3DTextFlyOutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.95', 'end 0.05'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 22,
    stiffness: 120,
    restDelta: 0.001,
  });

  // Dynamic 3D transformation driven by scroll position
  const scale = useTransform(smoothProgress, [0, 0.45, 0.8, 1], [0.6, 1, 1.3, 1.75]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.1, 1, 1, 0.1]);
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [-40, 0, 40]);
  const y = useTransform(smoothProgress, [0, 0.5, 1], [60, 0, -60]);

  return (
    <div ref={containerRef} className={`relative py-2 overflow-visible [perspective:1200px] ${className}`}>
      <motion.div
        style={{
          scale,
          opacity,
          rotateX,
          y,
          textShadow: `0 0 35px ${glowColor}70, 0 15px 45px rgba(0,0,0,0.9)`,
        }}
        className="transform-gpu origin-center font-bold tracking-tight inline-block"
      >
        {text}
      </motion.div>
    </div>
  );
}
