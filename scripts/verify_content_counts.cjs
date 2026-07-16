const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '../public/data/vocabulary');

const requiredCounts = {
  en: 1000,
  de: 300,
  fr: 300,
  es: 300,
  ja: 300,
  ko: 300,
  zh: 300,
  it: 100,
  pt: 100,
  ru: 100,
  vi: 100,
  th: 100,
  ar: 100,
};

let allPassed = true;
const results = {};

console.log('--- VOCABULARY COUNTS ---');

for (const [lang, minCount] of Object.entries(requiredCounts)) {
  const filePath = path.join(vocabDir, `${lang}.json`);
  let count = 0;
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data)) {
        count = data.length;
      }
    } catch (e) {
      console.error(`Error parsing ${lang}.json:`, e.message);
    }
  }

  results[lang] = { count, required: minCount };
  const passed = count >= minCount;
  if (!passed) allPassed = false;

  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${lang.toUpperCase()}: ${count} / ${minCount}`);
}

console.log('\n--- OVERALL STATUS ---');
if (allPassed) {
  console.log('✅ ALL VOCABULARY COUNTS MET.');
  process.exit(0);
} else {
  console.log('❌ SOME VOCABULARY COUNTS ARE BELOW REQUIRED MINIMUM.');
  process.exit(1);
}
