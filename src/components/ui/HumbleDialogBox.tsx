import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function HumbleDialogBox() {
  const messages = [
    { main: 'Welcome to Echlearn 3D — Thế giới học ngôn ngữ AI thông minh', sub: 'PRESS ARROWS TO START →', link: '/register', cta: 'BẮT ĐẦU HỌC' },
    { main: 'Luyện nghe & phát âm AI 3D thời gian thực chính xác 99.4%', sub: 'PRESS ARROWS TO START →', link: '/languages', cta: 'CHỌN NGÔN NGỮ' },
    { main: 'Lập trình tư duy ngôn ngữ cùng linh vật Pepe Mascot 3D', sub: 'PRESS ARROWS TO START →', link: '/app/speaking', cta: 'THỰC HÀNH NÓI' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  const currentMsg = messages[currentIndex];

  // Typing effect for the main message
  useEffect(() => {
    setTypedText('');
    let i = 0;
    const fullText = currentMsg.main;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl"
    >
      <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 border-2 border-white/20 bg-[#010828]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4">
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm sm:text-base font-bold text-white min-h-[2.5rem] flex items-center">
            {typedText}
            <span className="w-2 h-4 bg-[#6FFF00] inline-block ml-1 animate-pulse" />
          </p>

          <p className="font-mono text-[10px] sm:text-[11px] font-bold text-[#FF4000] tracking-widest uppercase mt-1">
            {currentMsg.sub}
          </p>
        </div>

        {/* Right Arrow Controls matching humblefactory.ai video 100% */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 border border-white/15 shrink-0 shadow-inner">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ArrowLeft size={16} />
          </button>
          
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-xl bg-[#6FFF00] text-[#010828] font-bold flex items-center justify-center hover:bg-[#5fe600] transition-all cursor-pointer shadow-md shadow-[#6FFF00]/30"
            aria-label="Next Slide"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
