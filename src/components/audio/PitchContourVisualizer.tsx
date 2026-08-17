import { useEffect, useRef, useState } from 'react';
import { detectPitchAutocorrelation, calculatePitchContourDTW } from '../../services/acousticPitchDetector';
import { Activity } from 'lucide-react';

interface PitchContourVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  targetPitchContour?: number[];
  targetPhrase?: string;
  className?: string;
}

export function PitchContourVisualizer({
  stream,
  isRecording,
  targetPitchContour = [140, 150, 165, 180, 175, 160, 145, 130],
  targetPhrase,
  className = ''
}: PitchContourVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const [currentPitch, setCurrentPitch] = useState<number>(0);
  const [pitchHistory, setPitchHistory] = useState<number[]>([]);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  useEffect(() => {
    if (!isRecording || !stream) {
      if (pitchHistory.length > 5 && targetPitchContour.length > 0) {
        const { similarityPercent } = calculatePitchContourDTW(targetPitchContour, pitchHistory);
        setSimilarityScore(similarityPercent);
      }
      return;
    }

    setPitchHistory([]);
    setSimilarityScore(null);

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    audioCtxRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    const sampleRate = audioCtx.sampleRate;
    const buffer = new Float32Array(analyser.fftSize);
    const recordedPitches: number[] = [];

    const updateLoop = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getFloatTimeDomainData(buffer);

      const { pitchHz, clarity } = detectPitchAutocorrelation(buffer, sampleRate);
      if (clarity > 0.3 && pitchHz > 60 && pitchHz < 450) {
        setCurrentPitch(pitchHz);
        recordedPitches.push(pitchHz);
        if (recordedPitches.length > 100) recordedPitches.shift();
        setPitchHistory([...recordedPitches]);
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [isRecording, stream, targetPitchContour]);

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines (Pitch reference Hz)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const minHz = 80;
    const maxHz = 350;
    const hzToY = (hz: number) => height - ((hz - minHz) / (maxHz - minHz)) * (height - 30) - 15;

    // 1. Draw Native Target Pitch Curve (Golden/Emerald Dashed)
    if (targetPitchContour.length > 1) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)'; // Emerald translucent
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      targetPitchContour.forEach((hz, i) => {
        const x = (i / (targetPitchContour.length - 1)) * (width - 40) + 20;
        const y = hzToY(hz);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Learner Recorded Pitch Curve (Solid Vibrant Cyan)
    if (pitchHistory.length > 1) {
      ctx.strokeStyle = '#38bdf8'; // Sky-400
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      pitchHistory.forEach((hz, i) => {
        const x = (i / Math.max(pitchHistory.length - 1, 1)) * (width - 40) + 20;
        const y = hzToY(hz);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [pitchHistory, targetPitchContour]);

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Acoustic Pitch Contour & Intonation Tracker
              {isRecording && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 animate-pulse">
                  LIVE F0
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400">
              {targetPhrase ? `Đường cong ngữ điệu mẫu: "${targetPhrase}"` : 'So khớp cao độ và ngữ điệu câu'}
            </p>
          </div>
        </div>

        {similarityScore !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs text-slate-400">Intonation Match:</span>
            <span className="text-sm font-black text-emerald-400">{similarityScore}%</span>
          </div>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-800">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={160} 
          className="w-full h-40 bg-slate-900 block"
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400/60 border-t border-dashed border-emerald-400 inline-block" />
              Mẫu chuẩn bản xứ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-sky-400 rounded-full inline-block" />
              Giọng của bạn ({currentPitch > 0 ? `${currentPitch} Hz` : '---'})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            YIN F0 Engine
          </span>
        </div>
      </div>
    </div>
  );
}
