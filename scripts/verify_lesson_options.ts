import { generateExercisesForModule } from '../src/curriculum/exerciseGenerator';
import fs from 'fs';
import path from 'path';

// Mock fetch to read local files
global.fetch = async (url: string) => {
  if (url.startsWith('/data/vocabulary/')) {
    const file = path.join(process.cwd(), 'public', url);
    if (fs.existsSync(file)) {
      return {
        ok: true,
        json: async () => JSON.parse(fs.readFileSync(file, 'utf-8'))
      } as any;
    }
  }
  return { ok: false } as any;
};

async function verify() {
  console.log('--- RUNNING LESSON OPTIONS VERIFICATION ---');
  let failures = 0;
  
  const tMock = (key: string, options?: any) => {
    if (options && options.word) {
      return `whatIsMeaning:${options.word}`;
    }
    return key;
  };

  const testLanguages = ['en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];

  for (const lang of testLanguages) {
    try {
      const exercises = await generateExercisesForModule('mod_test_1', lang, 'vi', tMock);
      for (const ex of exercises) {
        if (!ex.type) {
          console.error(`FAIL [${lang}]: Exercise missing type`, ex);
          failures++;
          continue;
        }
        if (!ex.question) {
          console.error(`FAIL [${lang}]: Exercise missing question`, ex);
          failures++;
          continue;
        }
        if (!ex.correctAnswer) {
          console.error(`FAIL [${lang}]: Exercise missing correctAnswer`, ex);
          failures++;
          continue;
        }
        
        let targetWord = '';
        if (ex.question.startsWith('whatIsMeaning:')) {
          targetWord = ex.question.split(':')[1];
        }

        if (ex.type === 'multiple-choice' || ex.type === 'listen-choose') {
          if (!ex.options || ex.options.length === 0) {
            console.error(`FAIL [${lang}]: Exercise missing options array`, ex);
            failures++;
          } else {
            ex.options.forEach((opt: string, idx: number) => {
              if (typeof opt !== 'string' || opt.trim() === '') {
                console.error(`FAIL [${lang}]: Option ${idx} is empty or invalid in ${ex.id}`, opt);
                failures++;
              }
              if (opt === 'N/A' || opt.includes('Random')) {
                console.error(`FAIL [${lang}]: Option ${idx} has placeholder text "${opt}" in ${ex.id}`);
                failures++;
              }
              if (opt === 'Missing Meaning') {
                console.error(`FAIL [${lang}]: Option ${idx} has Missing Meaning in ${ex.id}`);
                failures++;
              }
              if (opt.toLowerCase().startsWith('meaning:')) {
                console.error(`FAIL [${lang}]: Option ${idx} starts with Meaning prefix: "${opt}" in ${ex.id}`);
                failures++;
              }
              if (opt.toLowerCase().startsWith('nghĩa:')) {
                console.error(`FAIL [${lang}]: Option ${idx} starts with Nghĩa prefix: "${opt}" in ${ex.id}`);
                failures++;
              }
              if (targetWord && opt.toLowerCase() === targetWord.toLowerCase()) {
                console.error(`FAIL [${lang}]: Option "${opt}" equals the target word "${targetWord}" in ${ex.id}`);
                failures++;
              }
            });
            if (!ex.options.includes(ex.correctAnswer)) {
              console.error(`FAIL [${lang}]: Correct answer is not in options!`, ex.correctAnswer, ex.options);
              failures++;
            }
          }
        }

        if (ex.type === 'type-what-you-hear') {
          if (!ex.audioText) {
            console.error(`FAIL [${lang}]: type-what-you-hear exercise is missing audioText in ${ex.id}`);
            failures++;
          }
          if (!ex.targetText) {
            console.error(`FAIL [${lang}]: type-what-you-hear exercise is missing targetText in ${ex.id}`);
            failures++;
          }
        }
      }
    } catch (e) {
      console.error(`Error generating exercises for ${lang}:`, e);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\nFAILED: Found ${failures} issues with lesson options.`);
    process.exit(1);
  } else {
    console.log('\nPASS: All generated lesson options are valid.');
    process.exit(0);
  }
}

verify();
