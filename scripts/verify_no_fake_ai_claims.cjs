#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function fail(m){console.error('FAIL:',m);process.exit(1)}
function ok(m){console.log('PASS:',m)}

const files = [
  'src/services/practiceLearningIntegration.ts',
  'src/pages/app/practice/WritingPracticePage.tsx',
  'src/pages/app/practice/SpeakingPracticePage.tsx',
  'src/services/aiLearningEngine.ts',
];
const forbidden = ['official IELTS score','100% accurate','perfect pronunciation scoring','examiner official'];
for (const p of files) {
  const text = read(p).toLowerCase();
  for (const f of forbidden) if (text.includes(f.toLowerCase())) fail(`${p} contains fake claim: ${f}`);
}
const service = read('src/services/practiceLearningIntegration.ts').toLowerCase();
if (!service.includes('local practice feedback') && !service.includes('phản hồi cục bộ')) fail('missing honest local feedback disclaimer');
ok('no fake AI/examiner claims found in phase 17 scope');
