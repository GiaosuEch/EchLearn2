import { useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';

interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  maxTiltDegrees?: number;
  glareColor?: string;
  glowColor?: string;
  depthZ?: number;
  onClick?: () => void;
}

export function Tilt3DCard({
  children,
  className = '',
  maxTiltDegrees = 15,
  glareColor = 'rgba(255, 255, 255, 0.15)',
  glowColor = 'rgba(111, 255, 0, 0.25)',
  depthZ = 20,
  onClick,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const calcY = ((x - centerX) / centerX) * maxTiltDegrees;
    const calcX = -((y - centerY) / centerY) * maxTiltDegrees;

    setRotX(calcX);
    setRotY(calcY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handlePointerLeave = () => {
    setRotX(0);
    setRotY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative group cursor-pointer transition-transform duration-300 ease-out ${className}`}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="w-full h-full rounded-2xl transition-all duration-200 ease-out transform-gpu relative overflow-hidden"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`,
          transformStyle: 'preserve-3d',
          boxShadow: glarePos.opacity > 0 
            ? `0 20px 40px -10px rgba(0,0,0,0.6), 0 0 30px 0 ${glowColor}` 
            : '0 10px 30px -5px rgba(0,0,0,0.5)',
        }}
      >
        {/* Dynamic Specular Glare Reflection Layer */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-30"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(600px circle at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 45%)`,
          }}
        />

        {/* 3D Depth Inner Wrapper */}
        <div
          className="relative z-10 w-full h-full transition-transform duration-200"
          style={{
            transform: glarePos.opacity > 0 ? `translateZ(${depthZ}px)` : 'translateZ(0px)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
