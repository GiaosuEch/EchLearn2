import { toast } from 'sonner';
import { getLanguageMeta, normalizeLanguage } from '../utils/languageUtils';

export type TTSLanguage = string;

const FALLBACK_LOCALE: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  vi: 'vi-VN',
  th: 'th-TH',
  ar: 'ar-SA',
};

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
}

function clampRate(rate?: number) {
  if (!Number.isFinite(rate || 0)) return 0.92;
  return Math.max(0.55, Math.min(1.25, Number(rate)));
}

function normalizeLocale(languageId: TTSLanguage): { id: string; locale: string } {
  const raw = String(languageId || 'en').trim();
  if (/^[a-z]{2,3}-[A-Z]{2}$/i.test(raw)) {
    const id = normalizeLanguage(raw.split('-')[0]);
    return { id, locale: raw };
  }
  const id = normalizeLanguage(raw);
  try {
    return { id, locale: getLanguageMeta(id).ttsLocale || FALLBACK_LOCALE[id] || 'en-US' };
  } catch {
    return { id, locale: FALLBACK_LOCALE[id] || 'en-US' };
  }
}

class TTSService {
  private loadPromise: Promise<SpeechSynthesisVoice[]> | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  get isSupported(): boolean {
    return Boolean(getSpeechSynthesis());
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    const synth = getSpeechSynthesis();
    if (!synth) return [];

    const existing = synth.getVoices();
    if (existing.length > 0) {
      return existing;
    }

    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise(resolve => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        const voices = synth.getVoices();
        resolve(voices);
      };

      const previous = synth.onvoiceschanged;
      synth.onvoiceschanged = (event) => {
        if (typeof previous === 'function') previous.call(synth, event);
        finish();
      };

      setTimeout(finish, 700);
    });

    return this.loadPromise;
  }

  private findVoice(voices: SpeechSynthesisVoice[], locale: string, id: string): SpeechSynthesisVoice | undefined {
    const lowerLocale = locale.toLowerCase();
    const lowerId = id.toLowerCase();
    return voices.find(v => v.lang.toLowerCase() === lowerLocale)
      || voices.find(v => v.lang.toLowerCase().startsWith(`${lowerId}-`))
      || voices.find(v => v.lang.toLowerCase().startsWith(lowerId))
      || voices.find(v => v.lang.toLowerCase().startsWith(locale.split('-')[0].toLowerCase()));
  }

  async speak(text: string, languageId: TTSLanguage = 'en', t?: (key: string, options?: any) => string, options?: { rate?: number }): Promise<void> {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) {
      const message = t?.('lesson.errors.tts_failed', { defaultValue: 'Không có nội dung âm thanh để phát.' }) || 'Không có nội dung âm thanh để phát.';
      toast.error(message);
      throw new Error(message);
    }

    const synth = getSpeechSynthesis();
    if (!synth) {
      const message = t?.('lesson.errors.tts_not_supported', { defaultValue: 'Trình duyệt chưa có giọng đọc cho ngôn ngữ này.' }) || 'Trình duyệt chưa có giọng đọc cho ngôn ngữ này.';
      toast.error(message);
      throw new Error(message);
    }

    const { id, locale } = normalizeLocale(languageId);
    const voices = await this.loadVoices();
    const voice = this.findVoice(voices, locale, id);

    this.stop();
    // Chromium sometimes leaves speechSynthesis paused after cancel/navigation.
    if (synth.paused) synth.resume();
    await new Promise(resolve => setTimeout(resolve, 40));

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = locale;
    utterance.rate = clampRate(options?.rate);
    utterance.pitch = 1;
    utterance.volume = 1;
    if (voice) utterance.voice = voice;

    this.activeUtterance = utterance;

    return new Promise((resolve, reject) => {
      let settled = false;
      let started = false;
      const estimatedMs = Math.max(2500, Math.min(45000, clean.length * 95));

      const settle = (ok: boolean, error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(startTimer);
        clearTimeout(endTimer);
        if (this.activeUtterance === utterance) this.activeUtterance = null;
        ok ? resolve() : reject(error);
      };

      const showFail = (fallback: string) => {
        const message = t?.('lesson.errors.tts_failed', { defaultValue: fallback }) || fallback;
        toast.error(message);
        return new Error(message);
      };

      const startTimer = window.setTimeout(() => {
        if (settled || started || synth.speaking || synth.pending) return;
        try {
          synth.resume();
        } catch {
          // ignored
        }
        const message = t?.('lesson.errors.tts_blocked', { defaultValue: 'Trình duyệt đã chặn âm thanh. Hãy bấm lại.' }) || 'Trình duyệt đã chặn âm thanh. Hãy bấm lại.';
        toast.error(message);
        settle(false, new Error(message));
      }, 1200);

      const endTimer = window.setTimeout(() => {
        if (settled) return;
        // Some browsers do not fire onend for speechSynthesis reliably. Do not leave UI stuck.
        settle(true);
      }, estimatedMs);

      utterance.onstart = () => {
        started = true;
      };

      utterance.onend = () => settle(true);

      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'canceled') {
          settle(true);
          return;
        }
        settle(false, showFail('Không thể phát âm thanh.'));
      };

      try {
        synth.speak(utterance);
        // iOS/Chromium workaround: nudge the queue after user click.
        setTimeout(() => {
          try { if (synth.paused) synth.resume(); } catch { /* ignored */ }
        }, 80);
      } catch (error) {
        settle(false, error instanceof Error ? error : showFail('Không thể phát âm thanh.'));
      }
    });
  }

  stop() {
    const synth = getSpeechSynthesis();
    if (!synth) return;
    try {
      synth.cancel();
      if (synth.paused) synth.resume();
    } catch {
      // ignored
    }
    this.activeUtterance = null;
  }
}

export const ttsService = new TTSService();
