import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface AudioVisualizerProps {
  isRecording: boolean;
  stream: MediaStream | null;
  className?: string;
}

export function AudioVisualizer({ isRecording, stream, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording && stream && canvasRef.current) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!analyzerRef.current) {
        analyzerRef.current = ctx.createAnalyser();
        analyzerRef.current.fftSize = 128;
        analyzerRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceRef.current) {
        sourceRef.current = ctx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyzerRef.current);
      }

      const analyzer = analyzerRef.current;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');

      if (!canvasCtx) return;

      const draw = () => {
        if (!isRecording) return;
        requestRef.current = requestAnimationFrame(draw);

        analyzer.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;
        
        canvasCtx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;

          // Premium visualizer gradient: Emerald to Cyan
          const gradient = canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#10b981'); // Emerald 500
          gradient.addColorStop(1, '#06b6d4'); // Cyan 500

          canvasCtx.fillStyle = gradient;
          
          // Draw bars rounded at top
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          canvasCtx.fill();

          x += barWidth + 1;
        }
      };

      draw();
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (canvasRef.current) {
        const canvasCtx = canvasRef.current.getContext('2d');
        if (canvasCtx) {
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRecording, stream]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isRecording ? 1 : 0.4, scale: isRecording ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center shadow-inner ${className}`}
    >
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium text-sm tracking-widest uppercase">
          Awaiting Neural Input
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={100} 
        className="w-full h-full object-cover opacity-90 mix-blend-screen"
      />
    </motion.div>
  );
}
