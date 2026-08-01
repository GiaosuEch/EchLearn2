import { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, Mic, BookOpen, Brain, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { Tilt3DCard } from '../ui/Tilt3DCard';

export function HumbleInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<'listening' | 'speaking' | 'ielts' | 'vocab'>('speaking');
  const [isPlaying, setIsPlaying] = useState(false);

  const tabs = [
    { id: 'listening', name: '01 / NGHE AI 3D', icon: Volume2, badge: '3D AUDIO' },
    { id: 'speaking', name: '02 / NÓI REALTIME', icon: Mic, badge: 'VOICE ENGINE' },
    { id: 'ielts', name: '03 / IELTS ACADEMIC', icon: BookOpen, badge: 'BAND 9.0' },
    { id: 'vocab', name: '04 / GHI NHỚ TỰ ĐỘNG', icon: Brain, badge: 'MEMORY LAB' },
  ];

  const demoContent = {
    listening: {
      title: 'Luyện Nghe Nhịp Điệu Tự Nhiên',
      desc: 'Phân tích âm thanh 3D thời gian thực với sóng âm sống động và phụ đề song ngữ tự động.',
      waveform: [18, 36, 24, 48, 16, 32, 54, 28, 42, 19, 38, 22, 45, 20, 34],
      metricLabel: 'Audio Clarity Index',
      metricVal: '99.8%',
    },
    speaking: {
      title: 'Chấm Điểm Phát ÂM & Ngữ Điệu AI',
      desc: 'Hệ thống AI phân tích từng âm tiết, cao độ giọng nói và đưa ra lời khuyên sửa phát âm ngay lập tức.',
      waveform: [22, 44, 30, 60, 20, 40, 68, 35, 52, 24, 48, 28, 56, 26, 42],
      metricLabel: 'Fluency Confidence',
      metricVal: '98.5%',
    },
    ielts: {
      title: 'Khung Đánh Giá Tiêu Chuẩn IELTS 9.0',
      desc: 'Mô phỏng bài thi nói và viết IELTS Academic với phản hồi chi tiết 4 tiêu chí chấm điểm.',
      waveform: [15, 30, 20, 40, 15, 28, 48, 25, 36, 18, 32, 20, 38, 18, 30],
      metricLabel: 'Target IELTS Band',
      metricVal: 'Band 8.5+',
    },
    vocab: {
      title: 'Ghi Nhớ Lặp Lại Ngắt Quãng Spaced Repetition',
      desc: 'Tự động nhắc lại từ vựng vào thời điểm vàng trước khi bạn quên.',
      waveform: [20, 40, 28, 55, 18, 36, 62, 32, 48, 22, 44, 25, 50, 24, 38],
      metricLabel: 'Memory Retention',
      metricVal: '96.2%',
    },
  };

  const activeData = demoContent[activeTab];

  return (
    <section className="py-24 bg-[#0a1128] border-t-2 border-[#FFD700]/30 relative overflow-hidden">
      <div className="max-w-[92rem] mx-auto px-5 sm:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FFD700]/40 bg-[#0c192c]/80 backdrop-blur-md font-serif text-xs text-[#FFD700] uppercase tracking-widest mb-4 font-bold shadow-lg">
            <Sparkles size={14} />
            <span>ECHLEARN AI 3D WORKSPACE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif">
            Trải Nghiệm Không Gian Học <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#E5A93B] to-[#6FFF00]">Công Nghệ AI 3D</span>
          </h2>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-serif text-xs uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFD700] text-[#0a1128] border-[#FFD700] font-bold shadow-lg shadow-[#FFD700]/30 scale-105'
                    : 'bg-white/[0.04] text-white/80 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-white/[0.08]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Card */}
        <Tilt3DCard maxTiltDegrees={8} depthZ={25} className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-12 border-2 border-[#FFD700]/40 bg-gradient-to-b from-[#1c2d42] to-[#0a1128] shadow-[0_20px_60px_rgba(255,215,0,0.15)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#FFD700]/30 pb-6">
              <div>
                <span className="font-serif text-xs text-[#FFD700] uppercase tracking-widest font-bold">{demoContent[activeTab].metricLabel}</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-serif">{activeData.title}</h3>
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-[#FFD700]/20 border border-[#FFD700]/50 font-serif text-xl font-bold text-[#FFD700] shrink-0 shadow-lg">
                {activeData.metricVal}
              </div>
            </div>

            <p className="text-sm sm:text-base text-amber-100/90 mt-6 leading-relaxed font-serif">
              {activeData.desc}
            </p>

            {/* Audio Waveform Interactive Playground */}
            <div className="mt-8 p-6 rounded-2xl bg-black/60 border border-[#FFD700]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#FFD700] text-[#0a1128] font-bold text-xs uppercase tracking-wider hover:bg-[#ffe033] transition-all cursor-pointer shrink-0 shadow-md shadow-[#FFD700]/30"
              >
                <Play size={16} className={isPlaying ? 'animate-spin' : ''} />
                <span>{isPlaying ? 'Đang Chạy Mô Phỏng...' : 'Chạy Thử AI Engine'}</span>
              </button>

              <div className="flex h-10 flex-1 items-center gap-1.5 w-full">
                {activeData.waveform.map((h, idx) => (
                  <motion.span
                    key={idx}
                    animate={isPlaying ? { height: [h, h * 1.5, h * 0.7, h] } : { height: h }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: idx * 0.05 }}
                    className="w-full rounded-full bg-[#FFD700]"
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between text-xs font-serif text-amber-100/70">
              <span className="flex items-center gap-1.5 text-[#FFD700] font-bold">
                <CheckCircle2 size={14} /> SYSTEM STATUS: OPERATIONAL
              </span>
              <span>ECHLEARN AI ENGINE v4.2 PINNED</span>
            </div>
          </div>
        </Tilt3DCard>
      </div>
    </section>
  );
}
