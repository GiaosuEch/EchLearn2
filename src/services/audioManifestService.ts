export interface StaticAudioEntry {
  id: string;
  lang: string;
  text: string;
  path: string;
  kind?: 'word' | 'phrase' | 'sentence' | 'test' | 'lesson';
  source?: string;
  durationMs?: number;
}

export interface StaticAudioManifest {
  version: string;
  generatedAt: string;
  note?: string;
  supportedFileLanguages: string[];
  fallbackLanguages: string[];
  entries: StaticAudioEntry[];
}

function normalizeLanguageId(language?: string): string {
  return String(language || 'en').split('-')[0].toLowerCase();
}

function normalizeAudioText(text?: string): string {
  return String(text || '')
    .normalize('NFC')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

class AudioManifestService {
  private manifestPromise: Promise<StaticAudioManifest | null> | null = null;
  private entryMap = new Map<string, StaticAudioEntry>();

  private key(lang: string, text: string) {
    return `${normalizeLanguageId(lang)}::${normalizeAudioText(text)}`;
  }

  async load(): Promise<StaticAudioManifest | null> {
    if (typeof fetch === 'undefined') return null;
    if (this.manifestPromise) return this.manifestPromise;
    this.manifestPromise = fetch('/audio/audio-manifest.json', { cache: 'no-cache' })
      .then(async (response) => {
        if (!response.ok) return null;
        const manifest = await response.json() as StaticAudioManifest;
        this.entryMap.clear();
        for (const entry of manifest.entries || []) {
          if (entry?.lang && entry?.text && entry?.path) this.entryMap.set(this.key(entry.lang, entry.text), entry);
        }
        return manifest;
      })
      .catch(() => null);
    return this.manifestPromise;
  }

  async find(text: string, language: string): Promise<StaticAudioEntry | null> {
    const cleanText = String(text || '').trim();
    if (!cleanText) return null;
    await this.load();
    const lang = normalizeLanguageId(language);
    return this.entryMap.get(this.key(lang, cleanText))
      || this.entryMap.get(this.key(language, cleanText))
      || null;
  }

  async hasAudio(text: string, language: string): Promise<boolean> {
    return Boolean(await this.find(text, language));
  }
}

export const audioManifestService = new AudioManifestService();
