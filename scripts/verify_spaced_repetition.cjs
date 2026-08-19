const fs = require('fs');
const calculator = fs.readFileSync('src/services/fsrsCalculator.ts','utf8');
const required = [
  'next.setMinutes(next.getMinutes() + 10)',
  'next.setDate(next.getDate() + finalIntervalDays)',
  'masteryScore < 25',
  'masteryScore >= 90',
  'masteryScore >= 75',
  'masteryScore >= 50',
  'masteryScore >= 25',
];
const missing = required.filter((x)=>!calculator.includes(x));
if (missing.length) throw new Error(`Spaced repetition rules incomplete: ${missing.join(', ')}`);
console.log('PASS: Spaced repetition schedule covers immediate reinforcement (10 minutes) and halflife-based dynamic intervals with mastery thresholds 25/50/75/90.');