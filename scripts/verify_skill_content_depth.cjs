const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'src/services/targetLanguageContent.ts');
const languagesPath = path.join(root, 'src/data/languages.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const languages = fs.readFileSync(languagesPath, 'utf8');

const requiredLangs = ['en','fr','de','zh','ja','ko','es','it','pt','ru','vi','th','ar'];
const requiredFunctions = ['getTargetListeningTasks','getTargetSpeakingPrompts','getTargetReadingPassages','getTargetWritingPrompts'];
const failures = [];

if (!/CONTENT_TARGET_COUNT\s*=\s*120/.test(source)) failures.push('CONTENT_TARGET_COUNT must be 120.');
for (const fn of requiredFunctions) {
  if (!source.includes(`export function ${fn}`)) failures.push(`Missing ${fn}.`);
  const skill = fn.includes('Listening') ? 'listening' : fn.includes('Speaking') ? 'speaking' : fn.includes('Reading') ? 'reading' : 'writing';
  if (!source.includes(`id: `) || !source.includes(`_${skill}_daily_`)) failures.push(`${fn} does not generate stable ${skill} daily ids.`);
  if (!source.includes('Array.from({ length: CONTENT_TARGET_COUNT }')) failures.push(`${fn} should generate CONTENT_TARGET_COUNT items.`);
}
for (const lang of requiredLangs) {
  if (!new RegExp(`${lang}:\\s*\\[`).test(source)) failures.push(`Missing phraseBank for ${lang}.`);
  const skillTotals = (languages.match(new RegExp(`${lang}-(listen|speak|read|write)'[\\s\\S]{0,90}?totalLessons:\\s*120`, 'g')) || []).length;
  if (skillTotals !== 4) failures.push(`${lang} should expose 120 lessons for listening/speaking/reading/writing in languages.ts; found ${skillTotals}.`);
}
const dailySituationCount = (source.match(/tag:\s*'/g) || []).length;
if (dailySituationCount < 30) failures.push(`Expected at least 30 daily-life situations, found ${dailySituationCount}.`);
if (!source.includes('youtube_search') || !source.includes('youtube.com/results?search_query=')) failures.push('Missing YouTube search media resources.');
if (!source.includes('meaningVietnamese')) failures.push('Generated content must include Vietnamese meanings.');
if (/common word:|Robert|Missing Meaning|N\/A|Meaning:/.test(source)) failures.push('Forbidden placeholder text found in generated skill content source.');

if (failures.length) {
  console.error('FAIL: skill content depth verification failed');
  for (const failure of failures) console.error('-', failure);
  process.exit(1);
}
console.log('PASS: 13 languages expose 120 listening + 120 speaking + 120 reading + 120 writing items with daily-life topics and YouTube search references.');
