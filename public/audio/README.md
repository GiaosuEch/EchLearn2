# Ech Lern Audio Pack

Phase 15 adds real static MP3 files for daily-life listening tasks.

Runtime order:
1. Use a matching file from audio-manifest.json.
2. Fall back to browser SpeechSynthesis.
3. Show a translated error if no audio is available.

Supported file languages in this pack: en, fr, de, zh, es, it, pt, ru, vi.
Fallback-only languages for now: ja, ko, th, ar.

The fallback-only languages are not faked with the wrong voice. They should be generated later through a real cloud TTS pipeline or native audio corpus.
