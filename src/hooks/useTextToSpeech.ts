import { useState, useCallback } from 'react';
import type { VoiceLang } from '../services/audioService';
import { audioService } from '../services/audioService';
import { useTranslation } from 'react-i18next';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const speak = useCallback(async (text: string, lang: VoiceLang = 'en-US', rate?: number) => {
    const clean = String(text || '').trim();
    if (!clean) {
      const message = t('lesson.errors.tts_failed', { defaultValue: 'Không có nội dung âm thanh để phát.' });
      setError(message);
      return;
    }
    setIsSpeaking(true);
    setError(null);
    try {
      await audioService.speak(clean, lang, rate, t);
    } catch (e: any) {
      setError(e?.message || t('lesson.errors.tts_failed', { defaultValue: 'Không thể phát âm thanh.' }));
    } finally {
      setIsSpeaking(false);
    }
  }, [t]);

  const pronounce = useCallback(async (word: string, lang: VoiceLang = 'en-US') => {
    await speak(word, lang, 0.9);
  }, [speak]);

  const stop = useCallback(() => {
    audioService.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, pronounce, stop, isSpeaking, error, isSupported: audioService.isSupported };
}
