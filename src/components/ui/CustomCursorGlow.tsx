import { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export function CustomCursorGlow() {
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useSpring(-100, { damping: 25, stiffness: 250 });
  const cursorY = useSpring(-100, { damping: 25, stiffness: 250 });

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      className="pointer-events-none fixed z-50 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(111,255,0,0.15)_0,rgba(0,240,255,0.08)_45%,transparent_70%)] blur-xl"
    />
  );
}
