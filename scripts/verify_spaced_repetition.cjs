const fs = require('fs');
const service = fs.readFileSync('src/services/adaptiveLearningEngine.ts','utf8');
const required = [
  'next.setMinutes(next.getMinutes() + 10)',
  'next.setDate(next.getDate() + 1)',
  'next.setDate(next.getDate() + 3)',
  'next.setDate(next.getDate() + 7)',
  'next.setDate(next.getDate() + 21)',
  'masteryScore < 25',
  'masteryScore < 50',
  'masteryScore < 75',
  'masteryScore < 90',
];
const missing = required.filter((x)=>!service.includes(x));
if (missing.length) throw new Error(`Spaced repetition rules incomplete: ${missing.join(', ')}`);
console.log('PASS: Spaced repetition schedule covers 10 minutes, 1 day, 3 days, 7 days, and 21 days.');
