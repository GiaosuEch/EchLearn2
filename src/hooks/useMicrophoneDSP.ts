import { useState, useRef, useCallback } from 'react';

import { DTW } from '../lib/dsp/dtw';

interface DSPResult {
  score: number;
  warpingDistance: number;
  isProcessing: boolean;
}

export const useMicrophoneDSP = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<DSPResult | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recordedDataRef = useRef<number[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Deprecated but widely supported. AudioWorklet is better for prod, but ScriptProcessor is simpler for pure logic demo.
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      recordedDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Downsample or extract envelope (simplified for performance)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const averageAmplitude = sum / inputData.length;
        
        // Push feature (we're using a highly simplified time-domain amplitude contour as a feature vector)
        // In a full implementation, we'd pass small windows to FFT and get magnitude spectrum arrays.
        recordedDataRef.current.push(averageAmplitude);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Cannot access microphone. Please check permissions.');
    }
  }, []);

  const stopRecordingAndEvaluate = useCallback(() => {
    if (processorRef.current && audioContextRef.current && streamRef.current) {
      processorRef.current.disconnect();
      audioContextRef.current.close();
      streamRef.current.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setResult(() => ({ score: 0, warpingDistance: 0, isProcessing: true }));

      // Process the collected sequence using our purely mathematical DTW
      setTimeout(() => {
        const userSequence = recordedDataRef.current;
        
        // MOCK NATIVE SEQUENCE: 
        // In reality, this would be the cached native speaker's amplitude contour for the specific collocation.
        // We simulate a synthetic curve here.
        const nativeSequence = Array.from({ length: 20 }, (_, i) => Math.sin(i * 0.2) * 0.5 + 0.5);

        if (userSequence.length === 0) {
          setResult({ score: 0, warpingDistance: Infinity, isProcessing: false });
          return;
        }

        // Apply Dynamic Time Warping
        const dist = DTW.calculateDistance(userSequence, nativeSequence, 10);
        const score = DTW.evaluateScore(dist, 50); // 50 is an arbitrary max distance for this synthetic data

        setResult({
          score: Math.round(score * 100),
          warpingDistance: Math.round(dist * 100) / 100,
          isProcessing: false
        });
      }, 50); // Short timeout to allow UI update before heavy CPU task
    }
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecordingAndEvaluate,
    result
  };
};
