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
      let allWords: VocabularyItem[] = [];
      let partNumber = 1;
      
      while (true) {
        const partFilename = `part-${String(partNumber).padStart(3, '0')}.json`;
        try {
          const res = await fetch(`/data/vocabulary/${baseLang}/${partFilename}`);
          if (!res.ok) {
            // If part 1 fails, we might still have the old fallback `en.json` file format
            if (partNumber === 1) {
              const oldRes = await fetch(`/data/vocabulary/${baseLang}.json`);
              if (oldRes.ok) {
                const data = await oldRes.json();
                allWords = allWords.concat(data);
              }
            }
            break; // Stop fetching when a part is not found
          }
          const data = await res.json();
          allWords = allWords.concat(data);
          
          if (data.length === 0) break;
          partNumber++;
        } catch (e) {
          console.error(`Failed to load ${partFilename} for ${baseLang}`, e);
          break;
        }
      }

      this.cache[baseLang] = allWords;
      return allWords;
    })();
      
    return this.fetchPromises[baseLang];
  }
}

export const vocabularyService = new VocabularyService();
