const fs = require('fs');
const path = require('path');

const required = [
  'src/services/aiLearningEngine.ts',
  'src/services/personalizedLearningService.ts',
  'src/pages/app/onboarding/AIOnboardingPage.tsx',
  'supabase/migrations/006_ai_onboarding_music.sql',
];

let issues = 0;
for (const file of required) {
  if (!fs.existsSync(path.join(__dirname, '..', file))) {
    console.error(`FAIL missing ${file}`);
    issues++;
  }
}

const engine = fs.readFileSync(path.join(__dirname, '../src/services/aiLearningEngine.ts'), 'utf8');
const page = fs.readFileSync(path.join(__dirname, '../src/pages/app/onboarding/AIOnboardingPage.tsx'), 'utf8');
const migration = fs.readFileSync(path.join(__dirname, '../supabase/migrations/006_ai_onboarding_music.sql'), 'utf8');

const checks = [
  ['unique seed includes userId', /userId.*targetLanguage.*nativeLanguage.*selfLevel/s.test(engine)],
  ['deterministic hash seed exists', /function hashSeed/.test(engine)],
  ['question generation exists', /generateUniquePlacementTest/.test(engine)],
  ['scoring exists', /scorePlacementTest/.test(engine)],
  ['roadmap generation exists', /buildRoadmap/.test(engine)],
  ['onboarding asks four levels', /levelNone/.test(page) && /levelSome/.test(page) && /levelKnown/.test(page) && /levelFluent/.test(page)],
  ['page saves results', /personalizedLearningService\.save/.test(page)],
  ['migration has RLS', /enable row level security/i.test(migration) && /auth\.uid\(\) = user_id/i.test(migration)],
];

for (const [label, ok] of checks) {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); issues++; }
}

if (/Math\.random\(\)/.test(engine)) {
  console.error('FAIL engine uses Math.random; placement must be seed-based');
  issues++;
}

if (issues) process.exit(1);
console.log('PASS AI personalization verification complete');
