const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '../public/data/vocabulary');

const languages = [
  'en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'
];

const TARGET_COUNT = 3000;

let allPassed = true;

console.log('--- VOCABULARY COUNTS ---');

for (const lang of languages) {
  const langDir = path.join(vocabDir, lang);
  let currentCount = 0;
  
  if (fs.existsSync(langDir)) {
    const existingFiles = fs.readdirSync(langDir).filter(f => f.startsWith('part-') && f.endsWith('.json'));
    for (const file of existingFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf-8'));
        if (Array.isArray(data)) {
          currentCount += data.length;
        }
      } catch (e) {
        console.error(`Failed to read ${file}`);
      }
    }
  }

  const passed = currentCount >= TARGET_COUNT;
  if (!passed) allPassed = false;

  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${lang.toUpperCase()}: ${currentCount} / ${TARGET_COUNT}`);
}

console.log('\n--- OVERALL STATUS ---');
if (allPassed) {
  console.log('✅ ALL VOCABULARY COUNTS MET.');
  process.exit(0);
} else {
  console.log('❌ SOME VOCABULARY COUNTS ARE BELOW REQUIRED MINIMUM.');
  process.exit(1);
}
