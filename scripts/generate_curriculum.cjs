const fs = require('fs');
const path = require('path');

const languages = [
  { id: 'en', code: 'en-US', name: 'English', targetVocab: 200, targetGrammar: 40, targetListen: 30, targetSpeak: 30, targetRead: 30, targetWrite: 30 },
  { id: 'fr', code: 'fr-FR', name: 'French', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'de', code: 'de-DE', name: 'German', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'zh', code: 'zh-CN', name: 'Chinese', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'ja', code: 'ja-JP', name: 'Japanese', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'ko', code: 'ko-KR', name: 'Korean', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'es', code: 'es-ES', name: 'Spanish', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'it', code: 'it-IT', name: 'Italian', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'pt', code: 'pt-BR', name: 'Portuguese', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'ru', code: 'ru-RU', name: 'Russian', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'vi', code: 'vi-VN', name: 'Vietnamese', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'th', code: 'th-TH', name: 'Thai', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 },
  { id: 'ar', code: 'ar-SA', name: 'Arabic', targetVocab: 50, targetGrammar: 10, targetListen: 10, targetSpeak: 10, targetRead: 5, targetWrite: 5 }
];

const topics = [
  'Greetings', 'Numbers', 'Food', 'Travel', 'Work', 
  'Family', 'Hobbies', 'Weather', 'Emotions', 'Education',
  'Health', 'Shopping', 'Sports', 'Technology', 'Nature'
];

function getRandomTopic(index) {
  return topics[index % topics.length];
}

const outDir = path.join(__dirname, '../src/curriculum/languages');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function generateVocab(lang, count) {
  let content = `// Auto-generated vocabulary for ${lang.name}\n`;
  content += `export const vocabulary = [\n`;
  for (let i = 1; i <= count; i++) {
    const topic = getRandomTopic(i);
    content += `  {
    id: 'v_${lang.id}_${i}',
    word: '${lang.name} Word ${i}',
    translation: 'Translation ${i}',
    pronunciation: '/pron_${i}/',
    partOfSpeech: 'noun',
    example: 'This is example ${i} in ${lang.name}.',
    category: '${topic}',
      level: '${i <= 10 ? 'A1' : i <= 20 ? 'A2' : i <= 30 ? 'B1' : 'B2'}',
    audioUrl: null // Use TTS fallback
  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateGrammar(lang, count) {
  let content = `// Auto-generated grammar for ${lang.name}\n`;
  content += `export const grammar = [\n`;
  for (let i = 1; i <= count; i++) {
    const topic = getRandomTopic(i);
    content += `  {
    id: 'g_${lang.id}_${i}',
    title: '${lang.name} Grammar Topic ${i} (${topic})',
    description: 'Learn how to use structure ${i} in ${lang.name}.',
    level: '${i <= 5 ? 'A1' : i <= 15 ? 'A2' : 'B1'}',
    category: 'Syntax',
    rules: ['Rule 1: Always do this.', 'Rule 2: Never do that.'],
    examples: [
      { ${lang.id}: 'Example ${i} A', translation: 'English translation A' },
      { ${lang.id}: 'Example ${i} B', translation: 'English translation B' }
    ]
  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateReading(lang, count) {
  let content = `// Auto-generated reading for ${lang.name}\n`;
  content += `export const reading = [\n`;
  for (let i = 1; i <= count; i++) {
    const topic = getRandomTopic(i);
    content += `  {
    id: 'r_${lang.id}_${i}',
    title: '${lang.name} Reading Passage ${i} - ${topic}',
    level: '${i <= 5 ? 'A1' : i <= 15 ? 'A2' : 'B1'}',
    content: 'This is a reading passage about ${topic} in ${lang.name}. It contains multiple sentences and tests reading comprehension. The user should read this text carefully to answer the following questions.',
    questions: [
      {
        id: 'rq_${lang.id}_${i}_1',
        type: 'multiple-choice',
        question: 'What is the main topic of the passage?',
        options: ['${topic}', 'Unrelated Topic 1', 'Unrelated Topic 2', 'Unrelated Topic 3'],
        correctAnswer: '${topic}',
        explanation: 'The passage explicitly mentions ${topic}.'
      },
      {
        id: 'rq_${lang.id}_${i}_2',
        type: 'true-false',
        question: 'The passage contains multiple sentences.',
        correctAnswer: 'true',
        explanation: 'Yes, it says so in the text.'
      }
    ]
  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateListening(lang, count) {
  let content = `// Auto-generated listening for ${lang.name}\n`;
  content += `export const listening = [\n`;
  for (let i = 1; i <= count; i++) {
    const topic = getRandomTopic(i);
    content += `  {
    id: 'l_${lang.id}_${i}',
    title: '${lang.name} Listening Task ${i} - ${topic}',
    level: '${i <= 5 ? 'A1' : i <= 15 ? 'A2' : 'B1'}',
    transcript: 'Welcome to this listening exercise about ${topic}. Please listen closely and answer the questions.',
    audioUrl: null, // TTS fallback
    questions: [
      {
        id: 'lq_${lang.id}_${i}_1',
        question: 'What does the speaker discuss?',
        options: ['${topic}', 'Something else', 'Nothing', 'Everything'],
        correctAnswer: '${topic}'
      }
    ]
  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateSpeaking(lang, count) {
  let content = `// Auto-generated speaking for ${lang.name}\n`;
  content += `export const speaking = [\n`;
  for (let i = 1; i <= count; i++) {
    const topic = getRandomTopic(i);
    content += `  {
    id: 's_${lang.id}_${i}',
    title: '${lang.name} Speaking ${i}: ${topic}',
    level: '${i <= 5 ? 'A1' : i <= 15 ? 'A2' : 'B1'}',
    type: 'read-aloud',
    prompt: 'Please read the following sentence aloud:',
    textToRead: 'I enjoy learning about ${topic} in ${lang.name}.',
    expectedKeywords: ['enjoy', 'learning', '${topic}']
  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateWriting(lang, count) {
  let content = `// Auto-generated writing for ${lang.name}\n`;
  content += `export const writing = [\n`;
  for (let i = 1; i <= count; i++) {
    const topic = getRandomTopic(i);
    content += `  {
    id: 'w_${lang.id}_${i}',
    title: '${lang.name} Writing ${i}: ${topic}',
    level: '${i <= 5 ? 'A1' : i <= 15 ? 'A2' : 'B1'}',
    type: 'essay',
    prompt: 'Write a short paragraph about ${topic}.',
    minWords: 20
  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateCourseData(lang) {
  let content = `// Auto-generated course structure for ${lang.name}\n`;
  content += `import type { CourseUnit } from '../../englishCourse';\n\n`;
  content += `export const course: CourseUnit[] = [\n`;
  let lessonId = 1;
  for (let m = 1; m <= 3; m++) {
    content += `  {
    id: '${lang.id}_mod_${m}',
    title: 'Module ${m}',
    description: 'Learn ${lang.name} - Level ${m}',
    level: 'A${m}',
    lessons: [\n`;
    for (let l = 1; l <= 5; l++) {
      let type = ['vocabulary', 'grammar', 'reading', 'listening', 'speaking'][l % 5];
      let prefix = type === 'vocabulary' ? 'v' : type === 'grammar' ? 'g' : type === 'reading' ? 'r' : type === 'listening' ? 'l' : 's';
      let refIndex = ((m - 1) * 5 + l);
      content += `      {
        id: '${lang.id}_les_${lessonId++}',
        title: '${lang.name} Lesson ${lessonId - 1}',
        type: '${type}',
        referenceId: '${prefix}_${lang.id}_${refIndex}'
      },\n`;
    }
    content += `    ]\n  },\n`;
  }
  content += `];\n`;
  return content;
}

function generateIndex(lang) {
  return `export * from './vocabulary';\nexport * from './grammar';\nexport * from './reading';\nexport * from './listening';\nexport * from './speaking';\nexport * from './writing';\nexport * from './course';\n`;
}

languages.forEach(lang => {
  const langDir = path.join(outDir, lang.id);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  fs.writeFileSync(path.join(langDir, 'vocabulary.ts'), generateVocab(lang, lang.targetVocab));
  fs.writeFileSync(path.join(langDir, 'grammar.ts'), generateGrammar(lang, lang.targetGrammar));
  fs.writeFileSync(path.join(langDir, 'reading.ts'), generateReading(lang, lang.targetRead));
  fs.writeFileSync(path.join(langDir, 'listening.ts'), generateListening(lang, lang.targetListen));
  fs.writeFileSync(path.join(langDir, 'speaking.ts'), generateSpeaking(lang, lang.targetSpeak));
  fs.writeFileSync(path.join(langDir, 'writing.ts'), generateWriting(lang, lang.targetWrite));
  fs.writeFileSync(path.join(langDir, 'course.ts'), generateCourseData(lang));
  fs.writeFileSync(path.join(langDir, 'index.ts'), generateIndex(lang));
});

console.log('Curriculum generation completed for 13 languages.');
