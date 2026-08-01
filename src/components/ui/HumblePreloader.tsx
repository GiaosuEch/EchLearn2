import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function HumblePreloader() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusText, setStatusText] = useState('[ INITIALIZING ECHLEARN AI 3D ENGINE... ]');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
          }, 200);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 20) + 10;

        if (next > 25 && next < 60) {
          setStatusText('[ LOADING HOLOGRAPHIC MESH & PARTICLES... ]');
        } else if (next >= 60 && next < 88) {
          setStatusText('[ CALIBRATING REALTIME VOICE MODELS... ]');
        } else if (next >= 88) {
          setStatusText('[ SYSTEM READY. WELCOME LEARNER. ]');
        }

        return Math.min(next, 100);
      });
    }, 40);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#010828] p-8 text-white select-none overflow-hidden"
        >
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(to_right,#6FFF00_1px,transparent_1px),linear-gradient(to_bottom,#6FFF00_1px,transparent_1px)] [background-size:3.5rem_3.5rem]" />

          {/* Top Bar Navigation Info */}
          <div className="w-full max-w-7xl flex items-center justify-between font-mono text-xs text-white/70 tracking-widest relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6FFF00] animate-ping" />
              <span className="text-[#6FFF00] font-bold">[ HUMBLE FACTORY AI ]</span>
            </div>
            <span className="text-white/80">ECHLEARN PLATFORM v4.2</span>
          </div>

          {/* Center 3D Percent Counter */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            <div className="relative flex items-baseline">
              <motion.span
                key={progress}
                initial={{ opacity: 0.6, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="text-[clamp(7rem,22vw,18rem)] font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#6FFF00] via-[#34D399] to-[#00F0FF] leading-none"
                style={{
                  textShadow: '0 0 75px rgba(111,255,0,0.45)',
                }}
              >
                {progress.toString().padStart(2, '0')}
              </motion.span>
              <span className="text-3xl sm:text-7xl font-mono text-[#6FFF00] font-bold ml-2">%</span>
            </div>

            {/* Glowing Laser Progress Bar */}
            <div className="w-72 sm:w-[28rem] h-2 rounded-full bg-white/10 overflow-hidden mt-4 p-0.5 border border-white/20 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#6FFF00] via-[#00F0FF] to-[#FF4000] shadow-lg shadow-[#6FFF00]/50"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            {/* Dynamic Monospace Status Log */}
            <p className="mt-8 font-mono text-xs sm:text-sm text-[#6FFF00] tracking-widest uppercase flex items-center gap-2">
              <Sparkles size={16} className="animate-spin text-[#6FFF00]" />
              <span>{statusText}</span>
            </p>
          </div>

          {/* Bottom Footer Info */}
          <div className="w-full max-w-7xl flex items-center justify-between font-mono text-[11px] text-white/50 relative z-10">
            <span>[ SYSTEM STATUS: OPERATIONAL ]</span>
            <span>INITIALIZING 3D ENGINE</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
