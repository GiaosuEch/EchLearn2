import { motion } from 'motion/react';

interface Text3DFlyInProps {
  text: string;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export function Text3DFlyIn({
  text,
  className = '',
  glowColor = '#6FFF00',
  delay = 0,
}: Text3DFlyInProps) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 45,
      rotateX: -60,
      scale: 1.25,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 14,
        stiffness: 110,
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.3em] gap-y-[0.1em] [perspective:1000px] [transform-style:preserve-3d] ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          variants={childVariants}
          className="inline-block transform-gpu"
          style={{
            textShadow: `0 0 25px ${glowColor}50, 0 10px 30px rgba(0,0,0,0.8)`,
          }}
        >
          {word === '\n' ? <br /> : word}
        </motion.span>
      ))}
    </motion.span>
  );
}
