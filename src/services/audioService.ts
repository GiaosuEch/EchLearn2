/** audioService.ts — static audio pack first, browser SpeechSynthesis fallback second. */

import { ttsService } from './ttsService';
import { audioManifestService } from './audioManifestService';

export type VoiceLang = string;
type TFunction = (key: string, options?: any) => string;

class AudioService {
  private audioEl: HTMLAudioElement | null = null;

  get isSupported(): boolean {
    return ttsService.isSupported || typeof Audio !== 'undefined';
  }

  getVoices(lang?: string): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const voices = window.speechSynthesis.getVoices();
    if (!lang) return voices;
    const prefix = lang.split('-')[0].toLowerCase();
    return voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
  }

  /**
   * Speak text aloud.
   * Priority:
   * 1. curated static file from /public/audio/audio-manifest.json
   * 2. browser TTS fallback
   */
  async speak(text: string, lang: VoiceLang = 'en-US', rate = 1, t?: TFunction): Promise<void> {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return ttsService.speak(clean, lang, t, { rate });

    const staticEntry = await audioManifestService.find(clean, lang);
    if (staticEntry?.path) {
      try {
        await this.playUrl(staticEntry.path);
        return;
      } catch (error) {
        console.warn('Static audio failed, falling back to browser TTS', staticEntry.path, error);
      }
    }

    return ttsService.speak(clean, lang, t, { rate });
  }

  /** Speak a word for vocabulary pronunciation. */
  pronounce(word: string, lang: VoiceLang = 'en-US', t?: TFunction): Promise<void> {
    return this.speak(word, lang, 0.9, t);
  }

  /** Read a longer transcript aloud for listening practice. */
  readTranscript(text: string, lang: VoiceLang = 'en-US', rate = 0.9, t?: TFunction): Promise<void> {
    return this.speak(text, lang, rate, t);
  }

  /** Play an audio file from URL. */
  playUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stopAudio();
      if (typeof Audio === 'undefined') {
        reject(new Error('HTMLAudioElement is not supported in this browser'));
        return;
      }
      this.audioEl = new Audio(url);
      this.audioEl.preload = 'auto';
      this.audioEl.onended = () => resolve();
      this.audioEl.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      this.audioEl.play().catch(reject);
    });
  }

  pauseAudio(): void {
    if (this.audioEl && !this.audioEl.paused) this.audioEl.pause();
  }

  resumeAudio(): void {
    if (this.audioEl && this.audioEl.paused) void this.audioEl.play();
  }

  stop(): void {
    ttsService.stop();
    this.stopAudio();
  }

  private stopAudio(): void {
    if (!this.audioEl) return;
    this.audioEl.pause();
    this.audioEl.currentTime = 0;
    this.audioEl = null;
  }

  get isSpeaking(): boolean {
    if (this.audioEl && !this.audioEl.paused) return true;
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    return window.speechSynthesis.speaking || window.speechSynthesis.pending;
  }
}

export const audioService = new AudioService();
