const fs = require('fs');

const generateVocab = () => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let words = [];
    let idCounter = 1;
    
    // Some sample words for generation
    const samples = {
        A1: ['hello', 'world', 'cat', 'dog', 'house', 'water', 'food', 'book', 'pen', 'table', 'chair', 'sun', 'moon', 'star', 'car', 'bus', 'train'],
        A2: ['family', 'friend', 'school', 'work', 'money', 'time', 'day', 'night', 'morning', 'evening', 'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty'],
        B1: ['environment', 'technology', 'education', 'health', 'travel', 'culture', 'society', 'economy', 'politics', 'science', 'art', 'music', 'history', 'geography'],
        B2: ['sustainable', 'innovative', 'comprehensive', 'significant', 'essential', 'fundamental', 'crucial', 'vital', 'beneficial', 'detrimental', 'perspective', 'controversy', 'hypothesis'],
        C1: ['ubiquitous', 'ephemeral', 'surreptitious', 'pragmatic', 'esoteric', 'capricious', 'fastidious', 'sycophant', 'idiosyncrasy', 'anomaly', 'paradigm', 'dichotomy', 'enigma'],
        C2: ['obfuscate', 'recalcitrant', 'intransigent', 'pusillanimous', 'mercurial', 'quixotic', 'pedantic', 'obsequious', 'trenchant', 'cacophony', 'mellifluous', 'serendipity']
    };

    levels.forEach(level => {
        const levelWords = samples[level] || [];
        // Add more synthetic words if needed to reach ~100 total
        let count = 0;
        while(count < 17) {
            const word = levelWords[count % levelWords.length];
            words.push({
                id: \ocab-\\,
                word: word + (count >= levelWords.length ? count : ''),
                partOfSpeech: 'noun',
                level: level,
                meaning: \Meaning of \\,
                example: \This is an example for \.\,
                translation: \B?n d?ch c?a \\,
                pronunciation: \/\/\,
                tags: ['general']
            });
            count++;
        }
    });

    const content = \export interface VocabularyItem {
  id: string;
  word: string;
  partOfSpeech: string;
  level: string;
  meaning: string;
  example: string;
  translation: string;
  pronunciation: string;
  tags: string[];
}

export const vocabularyBank: VocabularyItem[] = \;
\;

    fs.writeFileSync('d:/Nguyen/ANTI/src/curriculum/vocabularyBank.ts', content);
};

generateVocab();
