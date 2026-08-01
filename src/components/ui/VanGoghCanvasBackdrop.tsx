import { useEffect, useRef } from 'react';
import { globalPerformanceProfile } from '../../utils/performanceOptimizer';

export function VanGoghCanvasBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (globalPerformanceProfile.isLowEndDevice) return; // Skip canvas loop on low-end phones for maximum speed!
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create Van Gogh impressionist swirling stroke particles
    const strokes: Array<{
      x: number;
      y: number;
      length: number;
      angle: number;
      speed: number;
      color: string;
      width: number;
      curve: number;
    }> = [];

    const colors = [
      '#FFD700', // Starry Gold
      '#E5A93B', // Wheatfield Amber
      '#2E5A44', // Cypress Dark Green
      '#4A89DC', // Cobalt Blue
      '#1F3A60', // Ultramarine Night
      '#6FFF00', // Neon Cyber Emerald
      '#F5D76E', // Sunlit Ochre
    ];

    for (let i = 0; i < 180; i++) {
      strokes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 25 + Math.random() * 45,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 3 + Math.random() * 5,
        curve: (Math.random() - 0.5) * 0.04,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;

      // Dark Oil Canvas Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a1128');
      grad.addColorStop(0.4, '#1c2d42');
      grad.addColorStop(0.7, '#2e4028');
      grad.addColorStop(1, '#050a18');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render Van Gogh Impressionist Brush Strokes with Impasto Texture
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      strokes.forEach((s) => {
        s.angle += s.curve + Math.sin(time + s.x * 0.005) * 0.02;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Wrap edges
        if (s.x < -50) s.x = width + 50;
        if (s.x > width + 50) s.x = -50;
        if (s.y < -50) s.y = height + 50;
        if (s.y > height + 50) s.y = -50;

        // Draw textured oil brush stroke
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.globalAlpha = 0.5 + Math.sin(time + s.length) * 0.25;

        const endX = s.x + Math.cos(s.angle) * s.length;
        const endY = s.y + Math.sin(s.angle) * s.length;

        // Quadratic curve for Van Gogh wind swirl feeling
        const controlX = (s.x + endX) / 2 + Math.sin(s.angle) * 15;
        const controlY = (s.y + endY) / 2 + Math.cos(s.angle) * 15;

        ctx.moveTo(s.x, s.y);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70 mix-blend-screen"
    />
  );
}
