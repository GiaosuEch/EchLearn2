import { motion, useAnimation, useInView } from 'motion/react';
import { useEffect, useRef } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function SplitText({ text, className = '', delay = 0, duration = 0.5, once = true }: SplitTextProps) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10%" });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap overflow-hidden mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              className="inline-block"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: duration,
                    ease: [0.2, 0.65, 0.3, 0.9],
                    delay: delay + (wordIndex * 0.1) + (charIndex * 0.02),
                  },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
