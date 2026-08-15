import { getProductPackForLanguage } from './src/curriculum/courseRegistry';
import { resolveAuthoredLesson } from './src/curriculum/roadmap/lessonPayloadResolver';

async function verify() {
  console.log('--- Verifying courseRegistry (Japanese N5 Roadmap) ---');
  const jaPack = await getProductPackForLanguage('ja');
  console.log('Japanese units count:', jaPack.units.length);
  if (jaPack.units.length > 0) {
    console.log('First unit title:', jaPack.units[0].title);
    if (jaPack.units[0].lessons.length > 0) {
      console.log('First unit first lesson ID:', jaPack.units[0].lessons[0].id);
    }
    
    // Find the actual Japanese N5 Unit 0 Lesson 1 to verify
    const firstJpLesson = jaPack.units.flatMap(u => u.lessons).find(l => l.id.startsWith('ja-n5'));
    if (firstJpLesson) {
      console.log('Found first JP lesson ID in roadmap:', firstJpLesson.id);
    }
  }

  console.log('\n--- Verifying lessonPayloadResolver ---');
  const payload = resolveAuthoredLesson('ja-n5-u0-l1-hiragana');
  if (payload) {
    console.log('Payload found! Type:', payload.type);
    if (payload.type === 'japanese') {
      console.log('Lesson Title:', payload.content.title);
      console.log('Lesson Target Outcomes:', payload.content.targetOutcomes);
      console.log('Phases count:', payload.content.phases.length);
    }
  } else {
    console.log('FAILED: Payload not found for ja-n5-u0-l1-hiragana');
  }
}

verify().catch(console.error);
