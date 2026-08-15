import { useState, useRef, useCallback } from 'react';
import { DTW } from '../lib/dsp/dtw';
import { syncQueue } from '../services/syncQueueService';

interface ChallengeResult {
  score: number;
  isProcessing: boolean;
}

export const usePronunciationChallenge = (nodeId: string, _expectedPhrase: string, onEvaluated: (score: number) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
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
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      recordedDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        recordedDataRef.current.push(sum / inputData.length);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, []);

  const stopRecordingAndEvaluate = useCallback(() => {
    if (processorRef.current && audioContextRef.current && streamRef.current) {
      processorRef.current.disconnect();
      audioContextRef.current.close();
      streamRef.current.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      setResult({ score: 0, isProcessing: true });

      setTimeout(() => {
        const userSequence = recordedDataRef.current;
        const nativeSequence = Array.from({ length: 20 }, (_, i) => Math.sin(i * 0.2) * 0.5 + 0.5);

        if (userSequence.length === 0) {
          setResult({ score: 0, isProcessing: false });
          onEvaluated(0);
          return;
        }

        const dist = DTW.calculateDistance(userSequence, nativeSequence, 10);
        const rawScore = DTW.evaluateScore(dist, 50);
        const normalizedScore = Math.max(0, Math.min(1, rawScore));

        setResult({
          score: Math.round(normalizedScore * 100),
          isProcessing: false
        });

        // Offline CRDT Sync (Phase 3 Integration)
        syncQueue.pushChange('UPDATE_SRS', {
          nodeId,
          score: normalizedScore,
          timestamp: Date.now()
        });

        // Trigger callback to update domain state
        onEvaluated(normalizedScore);

      }, 50);
    }
  }, [nodeId, onEvaluated]);

  return {
    isRecording,
    startRecording,
    stopRecordingAndEvaluate,
    result
  };
};
