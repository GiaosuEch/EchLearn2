import { useState } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {(isHovered || isPlaying) && (
          <motion.div
            initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2"
          >
            <Music size={14} className="text-[var(--ech-orange)] animate-pulse" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Beneath the Rain - Nom Tunes
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={togglePlay}
        className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isPlaying 
            ? 'bg-[var(--ech-orange)] text-white shadow-[var(--ech-orange)]/30' 
            : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
        aria-label="Toggle background music"
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* Hidden YouTube Player */}
      <div className="hidden">
        <ReactPlayer 
          url="https://www.youtube.com/watch?v=erfvDZyfYT4"
          playing={isPlaying}
          loop={true}
          volume={0.4}
          width="0"
          height="0"
          config={{
            youtube: {
              playerVars: { 
                showinfo: 0, 
                controls: 0,
                modestbranding: 1
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default BackgroundMusic;
