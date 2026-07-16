import fs from 'fs';
import path from 'path';
import translatte from 'translatte';

const vocabDir = path.join(process.cwd(), 'public/data/vocabulary');

const languages = [
  'en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'
];

async function translateBatch(words, to) {
  const text = words.join('\n');
  try {
    const res = await translatte(text, { to });
    return res.text.split('\n').map(s => s.trim());
  } catch (e) {
    console.error(`Translation error to ${to}:`, e.message);
    return words; // fallback
  }
}

async function fixLanguage(lang) {
  const file = path.join(vocabDir, lang, 'part-001.json');
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${lang}, no part-001.json`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`Processing ${lang} - ${data.length} items`);

  let modified = false;
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Check if we need to fix meaningVietnamese
    const needsVi = batch.some(item => !item.meaningVietnamese || item.meaningVietnamese.startsWith('Nghĩa:') || item.meaningVietnamese.startsWith('Meaning:'));
    const needsEn = batch.some(item => !item.meaningEnglish || item.meaningEnglish.startsWith('Meaning:') || item.meaningEnglish.startsWith('Nghĩa:'));
    const needsEx = batch.some(item => !item.exampleTranslation || item.exampleTranslation.includes('(Ví dụ cho từ'));

    if (!needsVi && !needsEn && !needsEx) continue;

    const wordsToTranslate = batch.map(b => b.word);
    const examplesToTranslate = batch.map(b => b.example || `I can say "${b.word}".`);
    
    let viTranslations = [];
    if (needsVi) {
      viTranslations = await translateBatch(wordsToTranslate, 'vi');
      await new Promise(r => setTimeout(r, 500));
    }
    
    let enTranslations = [];
    if (needsEn && lang !== 'en') {
      enTranslations = await translateBatch(wordsToTranslate, 'en');
      await new Promise(r => setTimeout(r, 500));
    }

    let exTranslations = [];
    if (needsEx) {
      exTranslations = await translateBatch(examplesToTranslate, 'vi');
      await new Promise(r => setTimeout(r, 500));
    }

    for (let j = 0; j < batch.length; j++) {
      const idx = i + j;
      if (needsVi && viTranslations[j] && viTranslations[j] !== data[idx].word) {
        data[idx].meaningVietnamese = viTranslations[j];
        modified = true;
      }
      if (needsEn && lang !== 'en' && enTranslations[j] && enTranslations[j] !== data[idx].word) {
        data[idx].meaningEnglish = enTranslations[j];
        modified = true;
      }
      if (needsEx && exTranslations[j]) {
        data[idx].exampleTranslation = exTranslations[j];
        modified = true;
      }
    }
    process.stdout.write(`\rFixed ${Math.min(i + batchSize, data.length)} / ${data.length} for ${lang}`);
  }
  
  if (modified) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`\nSaved ${lang}`);
  } else {
    console.log(`\nNo changes needed for ${lang}`);
  }
}

async function run() {
  for (const lang of languages) {
    await fixLanguage(lang);
  }
  console.log('All done!');
}

run();
