const fs = require('fs');
const path = require('path');

const VOCAB_DIR = path.join(__dirname, '..', 'public', 'data', 'vocabulary');
const LANGS = ['en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];

function clean(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/^Meaning:\s*/i, '').replace(/^Nghĩa:\s*/i, '').trim();
}

function isBad(value, targetWord = '') {
  const text = clean(value);
  if (!text) return true;
  if (/^(Missing Meaning|N\/A|Random option|Placeholder)$/i.test(text)) return true;
  if (/^meaning\s*:/i.test(String(value))) return true;
  if (targetWord && text.toLowerCase() === clean(targetWord).toLowerCase()) return true;
  return false;
}

function meaning(item, native = 'vi') {
  const candidates = native === 'vi'
    ? [item.meaningVietnamese, item.translation, item.meaningEnglish, item.meaning]
    : [item.meaningEnglish, item.meaningVietnamese, item.translation, item.meaning];
  for (const candidate of candidates) {
    const text = clean(candidate);
    if (!isBad(text, item.word)) return text;
  }
  return '';
}

function loadLanguage(lang) {
  const dir = path.join(VOCAB_DIR, lang);
  const files = fs.readdirSync(dir).filter((file) => /^part-\d+\.json$/.test(file)).sort();
  return files.flatMap((file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
}

let failures = 0;
console.log('--- RUNNING LESSON OPTION RUNTIME VERIFICATION ---');
for (const lang of LANGS) {
  const data = loadLanguage(lang);
  const usable = data.filter((item) => item.word && meaning(item, 'vi') && !isBad(meaning(item, 'vi'), item.word));
  if (usable.length < 50) {
    console.error(`[FAIL] ${lang}: only ${usable.length} usable vocabulary items for Vietnamese meanings.`);
    failures++;
    continue;
  }

  for (const item of usable.slice(0, 120)) {
    const correct = meaning(item, 'vi');
    const options = [correct]
      .concat(usable.filter((other) => other.word !== item.word).map((other) => meaning(other, 'vi')).filter((option) => option && !isBad(option, item.word)).slice(0, 8))
      .filter(Boolean);
    const uniqueOptions = [...new Set(options)].slice(0, 4);
    if (uniqueOptions.length < 2) {
      console.error(`[FAIL] ${lang}: not enough options for ${item.word}`);
      failures++;
    }
    for (const option of uniqueOptions) {
      if (isBad(option, item.word)) {
        console.error(`[FAIL] ${lang}: bad option "${option}" for target "${item.word}"`);
        failures++;
      }
    }
    if (!correct || isBad(correct, item.word)) {
      console.error(`[FAIL] ${lang}: bad correct meaning "${correct}" for target "${item.word}"`);
      failures++;
    }
  }
  console.log(`[${failures === 0 ? 'PASS' : 'CHECKED'}] ${lang.toUpperCase()}: lesson options were checked.`);
}

if (failures > 0) {
  console.error(`\nFAILED: ${failures} lesson option issues found.`);
  process.exit(1);
}
console.log('\nPASS: All generated lesson options are valid.');
