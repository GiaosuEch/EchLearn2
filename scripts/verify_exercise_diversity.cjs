#!/usr/bin/env node
const fs = require('fs');
const src = fs.readFileSync('src/curriculum/exerciseGenerator.ts', 'utf8');
const failures = [];
const requiredTypes = ['multiple-choice','listen-choose','type-what-you-hear','fill-blank','match-pairs','translate'];
for (const type of requiredTypes) {
  if (!src.includes(`type: '${type}'`)) failures.push(`exerciseGenerator missing exercise type: ${type}`);
}
if (!src.includes('slice(0, 8)')) failures.push('exerciseGenerator should sample at least 8 vocabulary items per lesson');
if (!src.includes('VI_LITERACY_ITEMS')) failures.push('exerciseGenerator must use curated Vietnamese literacy items for vi->vi');
if (!src.includes('EN_TO_VI')) failures.push('exerciseGenerator must translate common English meanings to Vietnamese before rendering options');
const withoutGuards = src.replace(/const BAD_OPTION_PATTERNS[\s\S]*?\];/, '').replace(/replace\(\/Missing Meaning\|N\\\/A\/gi,[\s\S]*?\)/g, '');
if (/common word:|Robert/.test(withoutGuards)) failures.push('exerciseGenerator contains unsafe placeholder strings outside guard list');
if (failures.length) {
  console.error('FAIL verify_exercise_diversity');
  failures.forEach(f => console.error('-', f));
  process.exit(1);
}
console.log('PASS: Exercise diversity and Vietnamese safeguards are present.');
