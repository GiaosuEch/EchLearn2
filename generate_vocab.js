import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languages = ['en', 'vi', 'fr', 'de', 'zh', 'ja', 'ko', 'es', 'it', 'pt', 'ru', 'th', 'ar'];
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const pos = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'];

const vocabDir = path.join(__dirname, 'src', 'data', 'vocabulary');
if (!fs.existsSync(vocabDir)) {
  fs.mkdirSync(vocabDir, { recursive: true });
}

languages.forEach(lang => {
  const items = [];
  let idCounter = 1;
  
  for (let i = 0; i < 3000; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const p = pos[Math.floor(Math.random() * pos.length)];
    
    items.push({
      id: `${lang}_v_${idCounter++}`,
      language: lang,
      level: level,
      word: `${lang}-word-${idCounter}`,
      nativeScript: `${lang}-script-${idCounter}`,
      romanization: `${lang}-rom-${idCounter}`,
      partOfSpeech: p,
      meaning: `Meaning of ${lang} word ${idCounter} in English`,
      translation: `Nghĩa tiếng Việt của từ ${idCounter}`,
      example: `This is an example sentence using ${lang}-word-${idCounter}.`,
      exampleTranslation: `Đây là câu ví dụ sử dụng từ ${idCounter}.`,
      tags: [level, p],
      topic: 'general',
      difficulty: Math.floor(Math.random() * 5) + 1,
      mastery: 0
    });
  }
  
  fs.writeFileSync(path.join(vocabDir, `${lang}.json`), JSON.stringify(items, null, 2));
  console.log(`Generated 3000 words for ${lang}`);
});

console.log('Vocabulary generation complete.');
