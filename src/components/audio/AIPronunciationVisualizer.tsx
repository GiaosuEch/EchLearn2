import { useEffect, useRef } from 'react';
import { Volume2, Sparkles } from 'lucide-react';

interface AIPronunciationVisualizerProps {
  isRecording: boolean;
  targetLanguage: string;
}

export function AIPronunciationVisualizer({ isRecording, targetLanguage }: AIPronunciationVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 16;
      const barWidth = 4;
      const spacing = (canvas.width - barCount * barWidth) / (barCount + 1);

      for (let i = 0; i < barCount; i++) {
        const x = spacing + i * (barWidth + spacing);
        const heightMultiplier = isRecording
          ? Math.sin(phase + i * 0.4) * 0.4 + 0.6
          : 0.15;
        const barHeight = canvas.height * heightMultiplier;
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += 0.12;
      if (isRecording) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording]);

  // Phonetic IPA sample guides by target language
  const ipaGuides: Record<string, { phrase: string; ipa: string; stress: string }> = {
    en: { phrase: 'Hello, nice to meet you', ipa: '/həˈloʊ naɪs tuː miːt juː/', stress: 'Trọng âm chính ở /loʊ/ & /miːt/' },
    ja: { phrase: 'こんにちは (Konnichiwa)', ipa: '/kon.ni.tɕi.wa/', stress: 'Nhịp điệu cao thấp ở âm thứ 3 /tɕi/' },
    zh: { phrase: '你好 (Nǐ hǎo)', ipa: '/ni²¹⁴ xaʊ²¹⁴/', stress: 'Thanh 3 biến điệu -> Thanh 2 Ní hǎo' },
    ko: { phrase: '안녕하세요 (Annyeonghaseyo)', ipa: '/an.njʌŋ.ha.se.jo/', stress: 'Ngắt nhịp tự nhiên ở /se.jo/' },
    fr: { phrase: 'Bonjour, comment allez-vous', ipa: '/bɔ̃.ʒuʁ kɔ.mɑ̃.t‿a.le.vu/', stress: 'Liaison liên kết âm giữa t và a' },
    es: { phrase: 'Hola, ¿cómo estás?', ipa: '/ˈo.la ˈko.mo esˈtas/', stress: 'Trọng âm tự nhiên ở âm tiết /tas/' },
    de: { phrase: 'Guten Tag, wie geht es Ihnen', ipa: '/ˈɡuː.tən taːk viː ɡeːt ɛs ˈiː.nən/', stress: 'Rõ khẩu hình nguyên âm /uː/ & /aː/' },
    ru: { phrase: 'Здравствуйте (Zdravstvuyte)', ipa: '/ˈzra.fstfʊjtʲe/', stress: 'Trọng âm ở nguyên âm /a/' },
    vi: { phrase: 'Xin chào, rất vui được gặp bạn', ipa: '/sin.tɕaːw.zət.vuj/', stress: 'Giữ đúng dấu hỏi & dấu nặng' },
  };

  const currentGuide = ipaGuides[targetLanguage] || ipaGuides.en;

  return (
    <div className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
          <Volume2 size={14} /> Sóng Âm Phổ Phát Âm AI (Live Spectrum)
        </span>
        {isRecording && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 animate-pulse">
            LIVE MIC ACTIVE
          </span>
        )}
      </div>

      {/* Canvas Spectrum Visualizer */}
      <div className="h-12 w-full bg-slate-950 rounded-xl flex items-center justify-center p-2 border border-slate-800">
        <canvas ref={canvasRef} width={280} height={40} className="w-full h-full" />
      </div>

      {/* IPA Phoneme Breakdown Guide */}
      <div className="pt-2 border-t border-slate-800 text-left space-y-1">
        <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
          <Sparkles size={12} className="text-amber-400" /> Phân tích ngữ âm IPA ({targetLanguage.toUpperCase()}):
        </p>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
          <span className="text-xs font-mono font-bold text-emerald-300">{currentGuide.ipa}</span>
          <span className="text-[10px] text-slate-400 font-medium">• {currentGuide.stress}</span>
        </div>
      </div>
    </div>
  );
}
