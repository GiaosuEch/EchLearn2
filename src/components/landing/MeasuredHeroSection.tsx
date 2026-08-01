import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BG_IMAGE_1 = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85';
const FRONT_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4';
const OVERLAY_IMAGE = 'https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png';

export default function MeasuredHeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string>('');
  
  // Parallax grid state
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const targetGridOffset = useRef({ x: 0, y: 0 });
  const currentGridOffset = useRef({ x: 0, y: 0 });

  // Cursor spotlight smoothing state
  const targetCursor = useRef({ x: -1000, y: -1000 });
  const smoothCursor = useRef({ x: -1000, y: -1000 });

  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lock body overflow when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Create offscreen canvas for spotlight mask
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasRef.current = canvas;

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Mouse movement for spotlight + grid parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      targetCursor.current = { x, y };

      // Calculate grid offset relative to center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      targetGridOffset.current = {
        x: ((x - centerX) / (centerX || 1)) * 16,
        y: ((y - centerY) / (centerY || 1)) * 16,
      };
    };

    const handleMouseLeave = () => {
      targetCursor.current = { x: -1000, y: -1000 };
      targetGridOffset.current = { x: 0, y: 0 };
    };

    const el = sectionRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Animation Loop: lerp cursor & grid, render radial mask dataURL
  useEffect(() => {
    let animId: number;

    const render = () => {
      // 1. Lerp cursor position (factor 0.1)
      smoothCursor.current.x += (targetCursor.current.x - smoothCursor.current.x) * 0.1;
      smoothCursor.current.y += (targetCursor.current.y - smoothCursor.current.y) * 0.1;

      // 2. Lerp grid parallax (factor 0.06)
      currentGridOffset.current.x += (targetGridOffset.current.x - currentGridOffset.current.x) * 0.06;
      currentGridOffset.current.y += (targetGridOffset.current.y - currentGridOffset.current.y) * 0.06;
      setGridOffset({ x: currentGridOffset.current.x, y: currentGridOffset.current.y });

      // 3. Draw Spotlight Radial Mask to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const { x, y } = smoothCursor.current;
          if (x > -500 && y > -500) {
            const radius = 260;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
            grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }

          setMaskDataUrl(canvas.toDataURL());
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-helvetica-neue selection:bg-white selection:text-black">
      
      {/* ── Section Navigation (z-40, absolute) ── */}
      <nav className="absolute top-0 left-0 right-0 z-40 px-6 sm:px-10 py-6 flex items-center justify-between pointer-events-auto">
        {/* Left: Geometric Logo SVG */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 256 256" className="w-7 h-7 fill-white">
            <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
          </svg>
          <span className="font-instrument italic text-xl text-white font-normal tracking-wide">EchLearn Measured</span>
        </div>

        {/* Center: Frosted Glass Nav Pill (Desktop) */}
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-spotlight">
          {['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us'].map((item) => (
            <button
              key={item}
              className="px-4 py-1.5 text-sm font-medium text-white/70 hover:text-white rounded-full transition-colors font-sans"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right: Desktop CTA */}
        <div className="hidden md:block">
          <button className="flex items-center gap-2.5 px-5 py-2 rounded-full liquid-glass-spotlight text-white text-sm font-medium hover:bg-white/10 transition-all font-sans">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Reserve Yours</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-full liquid-glass-spotlight"
          aria-label="Open menu"
        >
          <span className="w-5 h-[1.5px] bg-white rounded-full" />
          <span className="w-3.5 h-[1.5px] bg-white rounded-full" />
        </button>
      </nav>

      {/* ── Mobile Fullscreen Menu (z-55) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans"
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0.8, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: -90 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-4 rounded-full liquid-glass-spotlight text-white flex items-center justify-center w-12 h-12"
            >
              <span className="w-5 h-[1.5px] bg-white absolute rotate-45" />
              <span className="w-5 h-[1.5px] bg-white absolute -rotate-45" />
            </motion.button>

            {/* Stacked Nav Items */}
            <div className="flex flex-col items-center gap-6">
              {['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us'].map((item, index) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + index * 0.06,
                    ease: [0.77, 0, 0.18, 1],
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl sm:text-4xl text-white/90 font-medium hover:text-white transition-colors"
                >
                  {item}
                </motion.button>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.77, 0, 0.18, 1] }}
              className="mt-12"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full liquid-glass-spotlight text-white text-base font-medium"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span>Reserve Yours</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section (100vh) ── */}
      <div ref={sectionRef} className="relative w-full h-full overflow-hidden select-none">
        
        {/* Layer 1: Grid Background (z-0, opacity 0.1, parallax offset) */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`,
          }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="measured-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#measured-grid)" />
          </svg>
        </div>

        {/* Layer 2: Background Image (z-10) */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat pointer-events-none"
          style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
        />

        {/* Layer 3: Hero Text "Measured" (z-20) */}
        <div className="absolute top-20 sm:top-28 md:top-32 left-0 right-0 z-20 text-center pointer-events-none">
          <h1 className="font-instrument italic font-normal text-white text-[4.5rem] xs:text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem] leading-[0.9] tracking-tight uppercase drop-shadow-2xl">
            Measured
          </h1>
        </div>

        {/* Layer 4: Overlay Image (z-25) */}
        <img
          src={OVERLAY_IMAGE}
          alt=""
          className="absolute inset-0 z-25 w-full h-full object-cover pointer-events-none"
          aria-hidden="true"
        />

        {/* Layer 5: Spotlight Reveal Mask Video (z-30, clipped to bottom 60%) */}
        <div
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
          style={{
            WebkitMaskImage: maskDataUrl ? `url(${maskDataUrl})` : 'none',
            maskImage: maskDataUrl ? `url(${maskDataUrl})` : 'none',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            src={FRONT_VIDEO}
            className="w-full h-full object-cover"
            style={{
              clipPath: 'inset(40% 0 0 0)',
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
