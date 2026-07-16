import { useState, useCallback, useRef } from 'react';

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  error: string | null;
  permissionDenied: boolean;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioUrl: null,
    audioBlob: null,
    error: null,
    permissionDenied: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const isSupported = typeof window !== 'undefined' && 'MediaRecorder' in window;

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setState(s => ({ ...s, error: 'MediaRecorder is not supported in this browser.' }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setState(s => ({
          ...s,
          isRecording: false,
          isPaused: false,
          audioUrl: url,
          audioBlob: blob,
        }));
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100);
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setState(s => ({ ...s, duration: Math.floor((Date.now() - startTimeRef.current) / 1000) }));
      }, 500);

      setState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioUrl: null,
        audioBlob: null,
        error: null,
        permissionDenied: false,
      });
    } catch (err: any) {
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setState(s => ({
        ...s,
        error: isDenied ? 'Microphone permission denied. Please allow microphone access.' : (err?.message || 'Failed to start recording'),
        permissionDenied: isDenied,
      }));
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioUrl: null,
      audioBlob: null,
      error: null,
      permissionDenied: false,
    });
  }, [state.audioUrl]);

  return {
    ...state,
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
