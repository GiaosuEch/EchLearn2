import { motion } from 'motion/react';

interface InfiniteCarouselProps {
  items: React.ReactNode[];
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function InfiniteCarousel({ items, speed = 40, direction = 'left', className = '' }: InfiniteCarouselProps) {
  // Duplicate items to ensure smooth infinite scrolling
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className={`overflow-hidden flex w-full relative ${className}`}>
      {/* Gradient masks for smooth edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-r from-dark-950 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-l from-dark-950 to-transparent pointer-events-none" />
      
      <motion.div
        className="flex gap-4 min-w-max"
        animate={{
          x: direction === 'left' ? ['0%', '-33.33%'] : ['-33.33%', '0%']
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={index} className="flex-shrink-0">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
