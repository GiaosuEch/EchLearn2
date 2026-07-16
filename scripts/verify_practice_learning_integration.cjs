#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function fail(m){console.error('FAIL:',m);process.exit(1)}
function ok(m){console.log('PASS:',m)}

const service = read('src/services/practiceLearningIntegration.ts');
for (const token of ['recordPracticeAttempt','evaluateWritingPractice','evaluateSpeakingPractice','adaptiveLearningEngine.recordLearningEvent']) if (!service.includes(token)) fail(`service missing ${token}`);
const pages = [
  'src/pages/app/practice/ListeningPracticePage.tsx',
  'src/pages/app/practice/ReadingPracticePage.tsx',
  'src/pages/app/practice/WritingPracticePage.tsx',
  'src/pages/app/practice/SpeakingPracticePage.tsx',
  'src/pages/app/practice/VocabularyTrainerPage.tsx',
  'src/pages/app/practice/GrammarTrainerPage.tsx',
];
for (const p of pages) {
  const text = read(p);
  if (!text.includes('recordPracticeAttempt')) fail(`${p} is not connected to adaptive practice recording`);
}
ok('all core practice pages call recordPracticeAttempt');
