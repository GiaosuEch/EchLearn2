#!/usr/bin/env node
const fs = require('fs');
const app = fs.readFileSync('src/App.tsx','utf8');
const checks = [
  ['path="listening"', '<ListeningPracticePage />'],
  ['path="speaking"', '<SpeakingPracticePage />'],
  ['path="reading"', '<ReadingPracticePage />'],
  ['path="writing"', '<WritingPracticePage />'],
  ['path="vocabulary"', '<VocabularyTrainerPage />'],
  ['path="grammar"', '<GrammarTrainerPage />'],
];
const failures=[];
for (const [route, component] of checks){
  const i=app.indexOf(route);
  if (i<0 || !app.slice(i, i+180).includes(component)) failures.push(`${route} does not render ${component}`);
}
const pageChecks = [
  ['src/pages/app/practice/SpeakingPracticePage.tsx','speaking_title','Listening Practice'],
  ['src/pages/app/practice/ListeningPracticePage.tsx','listeningPractice','Speaking Practice'],
  ['src/pages/app/practice/ReadingPracticePage.tsx','readingPractice','Listening Practice'],
];
for (const [file, good, bad] of pageChecks){
  const text=fs.readFileSync(file,'utf8');
  if (!text.includes(good)) failures.push(`${file} missing expected marker ${good}`);
  if (text.includes(`title="${bad}"`)) failures.push(`${file} contains wrong hardcoded title ${bad}`);
}
if (failures.length){ console.error('FAIL verify_route_component_mapping'); failures.forEach(f=>console.error('-',f)); process.exit(1); }
console.log('PASS: route component mapping is correct.');
