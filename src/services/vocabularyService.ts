import { VocabularyEngine } from './vocabularyEngine.ts';

export interface CollocationItem {
  phrase: string;
  meaning: string;
}

/**
 * Where a piece of content came from and under what terms we may ship it.
 *
 * Optional so every previously authored entry keeps compiling, but the audit
 * gate (`scripts/audit_vocab_quality.cjs`) requires it on anything ingested
 * from an external corpus. `license` must be on the allowlist in
 * `src/services/contentLicenses.ts` — an unrecognised licence fails the build
 * rather than silently shipping content we cannot redistribute.
 */
export interface ContentProvenance {
  /** Corpus identifier, e.g. 'tatoeba' | 'wiktionary' | 'authored'. */
  source: string;
  /** SPDX-style identifier, e.g. 'CC-BY-2.0-FR'. */
  license: string;
  /** Deep link to the specific entry, for attribution and verification. */
  sourceUrl?: string;
  /** Human-readable credit line rendered in the UI. */
  attribution?: string;
  /** ISO date the entry was pulled, so stale corpora are visible. */
  retrievedAt?: string;
}

export interface VocabularyItem {
  id: string;
  language: string;
  level: string;
  word: string;
  nativeScript?: string;
  romanization?: string;
  partOfSpeech: string;
  meaning: string;
  translation: string;
  meaningEnglish: string;
  meaningVietnamese: string;
  pronunciationLocale?: string;
  qualityStatus?: string;
  example: string;
  exampleTranslation: string;
  tags: string[];
  topic: string;
  difficulty: number;
  mastery: number;
  collocations?: CollocationItem[];
  /** Provenance for the headword/definition layer. */
  provenance?: ContentProvenance;
  /**
   * Provenance for `example`/`exampleTranslation` when the sentence comes from
   * a different corpus than the definition — Tatoeba sentences paired with a
   * Wiktionary headword is the common case, and the two carry different terms.
   */
  exampleProvenance?: ContentProvenance;
}

/**
 * Upper bound on part files fetched per language. At the ingest chunk size of
 * 3,000 this allows 120,000 entries — well clear of the 10,000-per-language
 * target while still terminating if a directory listing goes wrong.
 */
const MAX_VOCABULARY_PARTS = 40;

export function normalizeVocabularyLanguage(language: unknown): string {
  if (typeof language !== 'string') return 'en';
  const normalized = language.trim().toLowerCase().split('-')[0];
  return normalized || 'en';
}

class VocabularyService {
  private cache: Record<string, VocabularyItem[]> = {};
  private fetchPromises: Record<string, Promise<VocabularyItem[]> | undefined> = {};

  async getVocabularyForLanguage(langId: string | null | undefined): Promise<VocabularyItem[]> {
    const baseLang = normalizeVocabularyLanguage(langId);
    
    if (this.cache[baseLang]) {
      return this.cache[baseLang];
    }
    
    if (this.fetchPromises[baseLang]) {
      return this.fetchPromises[baseLang];
    }
    
    this.fetchPromises[baseLang] = (async () => {
      let baseWords: VocabularyItem[] = [];

      // Relative public assets only resolve in a browser. Node-based quality
      // tests deliberately use the deterministic VocabularyEngine fallback.
      if (typeof window !== 'undefined') {
        // Both shapes are read and concatenated. The flat file used to shadow
        // the part files entirely, which silently hid every ingested batch;
        // reading both means an ingest run is visible without having to delete
        // the legacy file first. De-duplication happens downstream in
        // VocabularyEngine.getAuthenticBank, which keys by lowercased word.
        try {
          const directRes = await fetch(`/data/vocabulary/${baseLang}.json`);
          if (directRes.ok) {
            const data = await directRes.json();
            if (Array.isArray(data)) baseWords = data;
          }
        } catch (error) {
          console.error(`Failed to load flat vocabulary for ${baseLang}`, error);
        }

        try {
          let partNumber = 1;
          while (partNumber <= MAX_VOCABULARY_PARTS) {
            const partFilename = `part-${String(partNumber).padStart(3, '0')}.json`;
            const res = await fetch(`/data/vocabulary/${baseLang}/${partFilename}`);
            if (!res.ok) break;
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) break;
            baseWords = baseWords.concat(data);
            partNumber++;
          }
        } catch (error) {
          console.error(`Failed to load vocabulary parts for ${baseLang}`, error);
        }
      }

      // Return authentic Oxford/Cambridge dictionary collection via VocabularyEngine
      const finalBank = VocabularyEngine.getAuthenticBank(baseLang, baseWords);

      this.cache[baseLang] = finalBank;
      return finalBank;
    })();
      
    return this.fetchPromises[baseLang];
  }
}

export const vocabularyService = new VocabularyService();
