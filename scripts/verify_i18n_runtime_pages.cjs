#!/usr/bin/env node
const fs = require('fs');
const failures = [];
const files = [
  'src/pages/auth/RegisterPage.tsx',
  'src/pages/auth/LoginPage.tsx',
  'src/pages/auth/ForgotPasswordPage.tsx',
  'src/pages/app/PracticeHubPage.tsx',
  'src/pages/app/DashboardPage.tsx',
  'src/pages/app/LessonPlayerPage.tsx',
  'src/pages/app/practice/ListeningPracticePage.tsx',
  'src/pages/app/practice/SpeakingPracticePage.tsx',
  'src/pages/app/practice/ReadingPracticePage.tsx',
  'src/pages/app/practice/WritingPracticePage.tsx',
  'src/pages/app/media/MusicPodcastLabPage.tsx'
];
const forbidden = [
  'Choose Your Languages', 'Which language do you want to master?', 'Your Native Language', 'Language You Want to Learn',
  'Practice Hub', 'Choose a skill to practice', 'Listening Practice', 'Reading Practice', 'Speaking Practice',
  'Week 1: sounds and survival words', 'common word:', 'Robert', 'Missing Meaning', 'Next Question', 'Type what you hear'
];
for (const file of files) {
  if (!fs.existsSync(file)) { failures.push(`Missing ${file}`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  for (const term of forbidden) {
    if (text.includes(term)) failures.push(`${file} contains hardcoded runtime text: ${term}`);
  }
}
const phaseText = fs.readFileSync('src/i18n/phase129Text.ts', 'utf8');
for (const key of ['welcomeBack', 'loginSubtitle', 'forgotPassword', 'resetPasswordTitle']) {
  if (!phaseText.includes(key)) failures.push(`phase129Text missing auth key ${key}`);
}
if (failures.length) { console.error('FAIL verify_i18n_runtime_pages'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log('PASS: runtime i18n smoke checks passed.');
