import { resolveAuthoredLesson } from './src/curriculum/roadmap/lessonPayloadResolver';

async function verify() {
  console.log('--- Verifying lessonPayloadResolver ---');
  const payloadZh = resolveAuthoredLesson('zh:hsk:hsk1:grammar:shi-ma-01');
  if (payloadZh) {
    console.log('ZH Payload found! Type:', payloadZh.type);
    if (payloadZh.type === 'chinese') {
      console.log('ZH Title:', payloadZh.content.title);
      console.log('ZH Explanation count:', payloadZh.content.explanation?.length || 0);
      console.log('ZH Questions count:', payloadZh.content.questions?.length || 0);
    }
  } else {
    console.log('FAILED: Payload not found for zh');
  }

  const payloadKo = resolveAuthoredLesson('ko:topik:topik1:grammar:ieyo-yeyo-01');
  if (payloadKo) {
    console.log('KO Payload found! Type:', payloadKo.type);
    if (payloadKo.type === 'korean') {
      console.log('KO Title:', payloadKo.content.title);
      console.log('KO Explanation count:', payloadKo.content.explanation?.length || 0);
      console.log('KO Questions count:', payloadKo.content.questions?.length || 0);
    }
  } else {
    console.log('FAILED: Payload not found for ko');
  }
}

verify().catch(console.error);
