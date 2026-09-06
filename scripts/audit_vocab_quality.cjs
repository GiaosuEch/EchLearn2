const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '../public/data/vocabulary');

/**
 * Licences we are permitted to ship. Mirrors ALLOWED_LICENSES in
 * src/services/contentLicenses.ts and the table in THIRD_PARTY_LICENSES.md;
 * all three must be updated together. Content carrying anything else fails the
 * build rather than shipping under terms we have not verified.
 */
const ALLOWED_LICENSES = new Set([
  'CC0-1.0',
  'CC-BY-2.0-FR',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-SA-3.0',
  'PUBLIC-DOMAIN',
  'PROPRIETARY',
]);

/** Licences that oblige us to display a credit wherever the content appears. */
const ATTRIBUTION_REQUIRED = new Set([
  'CC-BY-2.0-FR',
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-SA-3.0',
]);

/**
 * Sentences produced by the old templating generator, which wrapped a word in a
 * fixed carrier phrase ("I can say X", "Yo digo X") instead of finding a real
 * example. These teach nothing: the carrier is identical for every word, so the
 * learner sees the same sentence 3,000 times.
 *
 * This is the check that matters most. Before it existed, 39,000 fabricated
 * entries passed the audit while genuinely sourced entries failed it for having
 * an honestly empty field — exactly the wrong incentive.
 */
const TEMPLATE_SENTENCE_PATTERNS = [
  /^I can say ["“]/i,
  /^Ich sage ["“]/i,
  /^Je dis ["“]/i,
  /^Yo digo ["“]/i,
  /^Io dico ["“]/i,
  /^Eu digo ["“]/i,
  /^Я говорю ["“]/i,
  /^Tôi nói ["“]/i,
  /^私は「/,
  /^저는 ["“]/,
  /^我说[“"]/,
  /^ฉันพูดว่า ["“]/,
  /^أنا أقول ["“]/,
  /^\(Ví dụ cho từ/i,
];

function isTemplateSentence(value) {
  if (typeof value !== 'string' || !value) return false;
  return TEMPLATE_SENTENCE_PATTERNS.some((pattern) => pattern.test(value.trim()));
}

/**
 * Validates one provenance block. Ingested entries must say where they came
 * from and under what terms; an unattributed CC BY entry is a licence breach,
 * not a cosmetic omission.
 */
function auditProvenance(item, field, failures) {
  const prov = item[field];
  if (!prov) return;

  if (!prov.source || !prov.license) {
    failures.push(`${field} missing source/license: ${item.id}`);
    return;
  }
  if (!ALLOWED_LICENSES.has(prov.license)) {
    failures.push(`${field} unrecognised licence "${prov.license}": ${item.id}`);
  }
  if (ATTRIBUTION_REQUIRED.has(prov.license) && !prov.attribution) {
    failures.push(`${field} licence ${prov.license} requires attribution: ${item.id}`);
  }
  if (ATTRIBUTION_REQUIRED.has(prov.license) && !prov.sourceUrl) {
    failures.push(`${field} licence ${prov.license} requires a verifiable sourceUrl: ${item.id}`);
  }
}

function auditLanguage(lang) {
  const langDir = path.join(vocabDir, lang);
  if (!fs.existsSync(langDir)) return null;

  const files = fs.readdirSync(langDir).filter(f => f.startsWith('part-') && f.endsWith('.json'));
  let totalWords = 0;
  let failures = [];
  const gaps = [];
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

      // Licence enforcement for externally sourced content.
      auditProvenance(item, 'provenance', failures);
      auditProvenance(item, 'exampleProvenance', failures);

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

      // Fabricated carrier sentences. Hard failure: this is invented content.
      if (isTemplateSentence(item.example)) {
        failures.push(`Template carrier sentence: "${item.example}" (ID: ${item.id})`);
      }
      if (isTemplateSentence(item.exampleTranslation)) {
        failures.push(`Template example translation: "${item.exampleTranslation}" (ID: ${item.id})`);
      }

      // Check empty or missing fields
      if (!item.meaningEnglish || item.meaningEnglish.trim() === '') failures.push(`Missing/empty meaningEnglish: ${item.id}`);
      if (item.meaningEnglish === 'Missing Meaning' || item.meaningVietnamese === 'Missing Meaning') {
        failures.push(`Missing Meaning string found in ID: ${item.id}`);
      }

      // Honest gaps. An entry sourced from a real corpus that has not been
      // translated yet is incomplete, not fraudulent — it is reported so the
      // backlog is visible, but it does not fail the build. Filling these with
      // invented text to silence the audit is the exact failure being removed.
      if (item.pronunciationLocale && /-XX$/i.test(item.pronunciationLocale)) {
        failures.push(`Placeholder pronunciationLocale "${item.pronunciationLocale}": ${item.id}`);
      } else if (!item.pronunciationLocale) {
        gaps.push(`missing pronunciationLocale: ${item.id}`);
      }
      if (!item.meaningVietnamese || item.meaningVietnamese.trim() === '') {
        gaps.push(`awaiting Vietnamese gloss: ${item.id}`);
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

  return { totalWords, failures, gaps };
}

console.log('--- RUNNING VOCAB QUALITY AUDIT ---');
const languages = ['en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];
let allPassed = true;
let totalGaps = 0;

for (const lang of languages) {
  const res = auditLanguage(lang);
  if (!res) {
    console.log(`[FAIL] ${lang.toUpperCase()}: Directory missing`);
    allPassed = false;
    continue;
  }

  const gapNote = res.gaps.length > 0 ? ` (${res.gaps.length} open gaps)` : '';

  if (res.failures.length > 0) {
    console.log(`[FAIL] ${lang.toUpperCase()} - ${res.totalWords} words. Found ${res.failures.length} quality issues.${gapNote}`);
    res.failures.slice(0, 5).forEach(f => console.log(`   -> ${f}`));
    if (res.failures.length > 5) console.log(`   -> ... and ${res.failures.length - 5} more.`);
    allPassed = false;
  } else {
    console.log(`[PASS] ${lang.toUpperCase()} - ${res.totalWords} words.${gapNote}`);
    if (res.gaps.length > 0) {
      console.log(`   -> ${res.gaps[0]}${res.gaps.length > 1 ? ` (+${res.gaps.length - 1} more)` : ''}`);
    }
  }
  totalGaps += res.gaps.length;
}

if (totalGaps > 0) {
  console.log(
    `\n${totalGaps} open gaps across all languages. These are entries sourced from a`
    + '\nreal corpus that are not yet fully translated. They do not fail the build —'
    + '\nan honestly empty field is better than an invented one.',
  );
}

if (!allPassed) {
  console.error('\nFAILED: Vocabulary quality audit found synthetic/fake data.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All vocabulary data passes quality checks.');
  process.exit(0);
}
