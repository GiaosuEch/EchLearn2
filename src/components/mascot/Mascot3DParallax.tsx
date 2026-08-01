import { useEffect, useRef } from 'react';

interface Mascot3DParallaxProps {
  imageSrc?: string;
  className?: string;
  size?: number;
}

export function Mascot3DParallax({
  imageSrc = '/mascots/ech_buri_study_companion.png',
  className = '',
  size = 200,
}: Mascot3DParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLImageElement>(null);

  // Mouse & sine wave animation refs for 60fps rAF loop
  const posRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;

      // 1. Sine wave floating motion (smooth 60fps wave)
      const sineY = Math.sin(elapsed * 0.0025) * 6;
      const sineRotate = Math.sin(elapsed * 0.0018) * 2;

      // 2. Smooth Lerp for mouse tracking parallax (factor 0.08 for fluid inertia)
      posRef.current.currentX += (posRef.current.targetX - posRef.current.currentX) * 0.08;
      posRef.current.currentY += (posRef.current.targetY - posRef.current.currentY) * 0.08;

      if (mascotRef.current) {
        const totalX = posRef.current.currentX;
        const totalY = posRef.current.currentY + sineY;
        const tiltX = (posRef.current.currentY / 10) * -1;
        const tiltY = posRef.current.currentX / 10;

        mascotRef.current.style.transform = `
          translate3d(${totalX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0px) 
          rotate(${sineRotate.toFixed(2)}deg)
          perspective(600px)
          rotateX(${tiltX.toFixed(2)}deg)
          rotateY(${tiltY.toFixed(2)}deg)
        `;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalize mouse delta from center (-20px to +20px max offset)
    const deltaX = ((e.clientX - centerX) / (rect.width / 2)) * 16;
    const deltaY = ((e.clientY - centerY) / (rect.height / 2)) * 16;

    posRef.current.targetX = deltaX;
    posRef.current.targetY = deltaY;
  };

  const handleMouseLeave = () => {
    posRef.current.targetX = 0;
    posRef.current.targetY = 0;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Soft 3D Glow Aura */}
      <div 
        className="absolute w-3/4 h-3/4 rounded-full bg-emerald-500/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" 
      />

      {/* 3D Mascot Image with rAF Transform */}
      <img
        ref={mascotRef}
        src={imageSrc}
        alt="Ech Buri Mascot 3D"
        style={{ width: size * 0.9, height: size * 0.9 }}
        className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] will-change-transform transition-shadow duration-300 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
}
