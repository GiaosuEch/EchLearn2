import { VocabularyEngine } from './vocabularyEngine';

export interface CollocationItem {
  phrase: string;
  meaning: string;
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
}

class VocabularyService {
  private cache: Record<string, VocabularyItem[]> = {};
  private fetchPromises: Record<string, Promise<VocabularyItem[]> | undefined> = {};

  async getVocabularyForLanguage(langId: string): Promise<VocabularyItem[]> {
    const baseLang = langId.split('-')[0];
    
    if (this.cache[baseLang]) {
      return this.cache[baseLang];
    }
    
    if (this.fetchPromises[baseLang]) {
      return this.fetchPromises[baseLang];
    }
    
    this.fetchPromises[baseLang] = (async () => {
      let baseWords: VocabularyItem[] = [];
      
      try {
        const directRes = await fetch(`/data/vocabulary/${baseLang}.json`);
        if (directRes.ok) {
          const data = await directRes.json();
          baseWords = data;
        } else {
          let partNumber = 1;
          while (partNumber <= 5) {
            const partFilename = `part-${String(partNumber).padStart(3, '0')}.json`;
            const res = await fetch(`/data/vocabulary/${baseLang}/${partFilename}`);
            if (!res.ok) break;
            const data = await res.json();
            baseWords = baseWords.concat(data);
            if (data.length === 0) break;
            partNumber++;
          }
        }
      } catch (e) {
        console.error(`Failed to load vocabulary for ${baseLang}`, e);
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
