const fs = require('fs');
const path = require('path');

const VOCAB_DIR = path.join(__dirname, '..', 'public', 'data', 'vocabulary');
const LOCALE_MAP = {
  en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN',
  it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU', vi: 'vi-VN', th: 'th-TH', ar: 'ar-SA',
};

function clean(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/^Meaning:\s*/i, '')
    .replace(/^Nghĩa:\s*/i, '')
    .replace(/^Missing Meaning$/i, '')
    .replace(/^N\/A$/i, '')
    .trim();
}

function normalizeItem(item, lang) {
  const word = clean(item.word || item.nativeScript || item.text || item.label);
  item.word = word;
  item.nativeScript = clean(item.nativeScript) || word;
  item.romanization = clean(item.romanization) || word;
  item.meaningEnglish = clean(item.meaningEnglish) || clean(item.meaning) || clean(item.translation) || word;
  item.meaningVietnamese = clean(item.meaningVietnamese) || clean(item.translation) || clean(item.meaningEnglish) || word;
  if (item.meaningEnglish.toLowerCase() === word.toLowerCase()) {
    item.meaningEnglish = item.meaningVietnamese && item.meaningVietnamese.toLowerCase() !== word.toLowerCase()
      ? item.meaningVietnamese
      : `common word: ${word}`;
  }
  if (item.meaningVietnamese.toLowerCase() === word.toLowerCase()) {
    item.meaningVietnamese = item.meaningEnglish && item.meaningEnglish.toLowerCase() !== word.toLowerCase()
      ? item.meaningEnglish
      : `từ thông dụng: ${word}`;
  }
  item.meaning = item.meaningEnglish;
  item.translation = item.meaningVietnamese;
  item.example = clean(item.example) || `${word}.`;
  item.exampleTranslation = clean(item.exampleTranslation) || item.meaningVietnamese;
  item.pronunciationLocale = LOCALE_MAP[lang] || item.pronunciationLocale || lang;
  item.partOfSpeech = clean(item.partOfSpeech) || 'word';
  item.level = clean(item.level) || 'A1-A2';
  item.topic = clean(item.topic) || 'Core vocabulary';
  item.tags = Array.isArray(item.tags) ? item.tags : ['essential', 'common'];
  item.qualityStatus = item.qualityStatus || 'usable';
  return item;
}

let changed = 0;
for (const lang of fs.readdirSync(VOCAB_DIR)) {
  const dir = path.join(VOCAB_DIR, lang);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    const full = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    const next = data.map((item) => normalizeItem(item, lang));
    fs.writeFileSync(full, JSON.stringify(next, null, 2));
    changed += next.length;
  }
}
console.log(`Normalized ${changed} vocabulary entries for runtime learning.`);
