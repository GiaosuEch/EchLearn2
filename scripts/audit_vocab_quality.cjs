const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '../public/data/vocabulary');

function auditLanguage(lang) {
  const langDir = path.join(vocabDir, lang);
  if (!fs.existsSync(langDir)) return null;

  const files = fs.readdirSync(langDir).filter(f => f.startsWith('part-') && f.endsWith('.json'));
  let totalWords = 0;
  let failures = [];
  const seenIds = new Set();

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf8'));
    totalWords += data.length;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      // Check duplicate IDs
      if (seenIds.has(item.id)) {
        failures.push(`Duplicate ID: ${item.id}`);
      }
      seenIds.add(item.id);

      // Check synthetic patterns
      if (/Word\d+/i.test(item.word)) {
        failures.push(`Fake word placeholder found: ${item.word} (ID: ${item.id})`);
      }
      if (/^Meaning:/i.test(item.meaningEnglish || '') || /^Meaning:/i.test(item.meaningVietnamese || '') || /^Nghĩa:/i.test(item.meaningVietnamese || '')) {
        failures.push(`Meaning prefix found in ID: ${item.id}`);
      }
      if ((item.word === 'N/A' || item.meaningEnglish === 'N/A' || item.meaningVietnamese === 'N/A')) {
        failures.push(`N/A field found in ID: ${item.id}`);
      }

      // Check empty or missing fields
      if (!item.meaningEnglish || item.meaningEnglish.trim() === '') failures.push(`Missing/empty meaningEnglish: ${item.id}`);
      if (!item.pronunciationLocale || /-XX$/i.test(item.pronunciationLocale)) failures.push(`Invalid pronunciationLocale: ${item.id}`);
      if (!item.meaningVietnamese || item.meaningVietnamese.trim() === '') failures.push(`Missing/empty meaningVietnamese: ${item.id}`);
      if (item.meaningEnglish === 'Missing Meaning' || item.meaningVietnamese === 'Missing Meaning') {
        failures.push(`Missing Meaning string found in ID: ${item.id}`);
      }

      // Target word equal to meaning (basic check)
      if (item.word.toLowerCase() === item.meaningVietnamese?.toLowerCase()) {
        failures.push(`Target word equals meaningVietnamese: ${item.word} (ID: ${item.id})`);
      }

      // Check synthetic examples
      if (item.example && item.example.includes("Here is an example sentence")) {
        failures.push(`Fake example found: ${item.example} (ID: ${item.id})`);
      }
      if (item.example && (item.example.includes("(Ví dụ cho từ") || item.exampleTranslation.includes("(Ví dụ cho từ"))) {
        failures.push(`Placeholder example translation found in ID: ${item.id}`);
      }
    }
  }

  return { totalWords, failures };
}

console.log('--- RUNNING VOCAB QUALITY AUDIT ---');
const languages = ['en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];
let allPassed = true;

for (const lang of languages) {
  const res = auditLanguage(lang);
  if (!res) {
    console.log(`[FAIL] ${lang.toUpperCase()}: Directory missing`);
    allPassed = false;
    continue;
  }

  if (res.failures.length > 0) {
    console.log(`[FAIL] ${lang.toUpperCase()} - ${res.totalWords} words. Found ${res.failures.length} quality issues.`);
    // Print first 5
    res.failures.slice(0, 5).forEach(f => console.log(`   -> ${f}`));
    if (res.failures.length > 5) console.log(`   -> ... and ${res.failures.length - 5} more.`);
    allPassed = false;
  } else {
    console.log(`[PASS] ${lang.toUpperCase()} - ${res.totalWords} words.`);
  }
}

if (!allPassed) {
  console.error('\nFAILED: Vocabulary quality audit found synthetic/fake data.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All vocabulary data passes quality checks.');
  process.exit(0);
}
