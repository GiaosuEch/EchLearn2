import type { Lesson } from '../types';

export const lessons: Lesson[] = [
  // English Beginner - Hello World! (Course en-b1)
  {
    id: 'en-b1-l1', courseId: 'en-b1', title: 'Nice to Meet You', description: 'Learn basic greetings and introductions',
    skill: 'speaking', level: 1, xpReward: 15, estimatedMinutes: 5, isCompleted: true, isLocked: false, order: 1,
    vocabularyPreview: [
      { id: 'lv1', word: 'hello', translation: 'xin chào', pronunciation: '/həˈloʊ/', example: 'Hello, how are you?', exampleTranslation: 'Xin chào, bạn khỏe không?', partOfSpeech: 'interjection', level: 'beginner', mastery: 100 },
      { id: 'lv2', word: 'goodbye', translation: 'tạm biệt', pronunciation: '/ɡʊdˈbaɪ/', example: 'Goodbye, see you tomorrow!', exampleTranslation: 'Tạm biệt, hẹn gặp lại ngày mai!', partOfSpeech: 'interjection', level: 'beginner', mastery: 100 },
    ],
    exercises: [
      { id: 'ex1', lessonId: 'en-b1-l1', type: 'multiple-choice', question: 'How do you greet someone in the morning?', instruction: 'Choose the correct greeting', options: ['Good morning', 'Good night', 'Goodbye', 'See you'], correctAnswer: 'Good morning', explanation: '"Good morning" is used to greet someone before noon.' },
      { id: 'ex2', lessonId: 'en-b1-l1', type: 'translate', question: 'Translate: "Xin chào, tôi là David"', instruction: 'Type the English translation', correctAnswer: 'Hello, I am David', explanation: 'A simple introduction using "Hello" and "I am".' },
      { id: 'ex3', lessonId: 'en-b1-l1', type: 'arrange-sentence', question: 'Arrange the words to make a sentence', instruction: 'Put the words in the correct order', words: ['to', 'Nice', 'meet', 'you'], correctAnswer: ['Nice', 'to', 'meet', 'you'], explanation: '"Nice to meet you" is a common greeting when meeting someone for the first time.' },
      { id: 'ex4', lessonId: 'en-b1-l1', type: 'fill-blank', question: 'My _____ is David. Nice to meet you!', instruction: 'Fill in the blank', correctAnswer: 'name', explanation: '"My name is..." is how you introduce yourself.' },
      { id: 'ex5', lessonId: 'en-b1-l1', type: 'multiple-choice', question: 'What does "How are you?" mean?', instruction: 'Choose the correct meaning', options: ['Bạn khỏe không?', 'Bạn ở đâu?', 'Bạn là ai?', 'Bạn bao nhiêu tuổi?'], correctAnswer: 'Bạn khỏe không?', explanation: '"How are you?" is asking about someone\'s well-being.' },
    ],
  },
  {
    id: 'en-b1-l2', courseId: 'en-b1', title: 'Saying Hello', description: 'Different ways to say hello',
    skill: 'listening', level: 1, xpReward: 15, estimatedMinutes: 5, isCompleted: true, isLocked: false, order: 2,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex6', lessonId: 'en-b1-l2', type: 'multiple-choice', question: 'Which is an informal greeting?', instruction: 'Choose the casual greeting', options: ["Hey, what's up?", 'Good evening, sir', 'How do you do?', 'It is a pleasure'], correctAnswer: "Hey, what's up?", explanation: '"Hey, what\'s up?" is a very casual, informal greeting.' },
      { id: 'ex7', lessonId: 'en-b1-l2', type: 'match-pairs', question: 'Match the greeting with its response', instruction: 'Connect each greeting with the correct response', pairs: [{ left: 'How are you?', right: "I'm fine, thanks" }, { left: 'Nice to meet you', right: 'Nice to meet you too' }, { left: "What's your name?", right: "I'm Anna" }], correctAnswer: [''], explanation: 'Common greeting-response pairs in English.' },
      { id: 'ex8', lessonId: 'en-b1-l2', type: 'fill-blank', question: "_____ morning! How are you _____?", instruction: 'Fill in the blanks', correctAnswer: 'Good, today', explanation: '"Good morning" and "How are you today?" are standard greetings.' },
    ],
  },
  {
    id: 'en-b1-l3', courseId: 'en-b1', title: 'About Me', description: 'Talking about yourself',
    skill: 'speaking', level: 1, xpReward: 15, estimatedMinutes: 6, isCompleted: true, isLocked: false, order: 3,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex9', lessonId: 'en-b1-l3', type: 'translate', question: 'Translate: "Tôi đến từ Việt Nam"', instruction: 'Type the English translation', correctAnswer: 'I am from Vietnam', explanation: '"I am from + country" is how you state your origin.' },
      { id: 'ex10', lessonId: 'en-b1-l3', type: 'multiple-choice', question: 'How do you ask someone their age?', instruction: 'Select the correct question', options: ['How old are you?', 'How are you?', 'Where are you?', 'What are you?'], correctAnswer: 'How old are you?', explanation: '"How old are you?" asks about age.' },
      { id: 'ex11', lessonId: 'en-b1-l3', type: 'arrange-sentence', question: 'Make a sentence', instruction: 'Arrange the words', words: ['I', 'am', '25', 'years', 'old'], correctAnswer: ['I', 'am', '25', 'years', 'old'], explanation: '"I am [age] years old" states your age.' },
    ],
  },
  {
    id: 'en-b1-l4', courseId: 'en-b1', title: 'Countries & Nationalities', description: 'Learn about countries and nationalities',
    skill: 'vocabulary', level: 1, xpReward: 15, estimatedMinutes: 7, isCompleted: true, isLocked: false, order: 4,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex12', lessonId: 'en-b1-l4', type: 'match-pairs', question: 'Match country with nationality', instruction: 'Connect each country with its nationality', pairs: [{ left: 'Japan', right: 'Japanese' }, { left: 'France', right: 'French' }, { left: 'Korea', right: 'Korean' }, { left: 'Vietnam', right: 'Vietnamese' }], correctAnswer: [''], explanation: 'Countries and their corresponding nationalities.' },
      { id: 'ex13', lessonId: 'en-b1-l4', type: 'fill-blank', question: 'She is from Spain. She is _____.', instruction: 'Fill in the nationality', correctAnswer: 'Spanish', explanation: 'Spain → Spanish' },
    ],
  },
  {
    id: 'en-b1-l5', courseId: 'en-b1', title: 'Numbers 1-20', description: 'Learn to count in English',
    skill: 'vocabulary', level: 1, xpReward: 15, estimatedMinutes: 5, isCompleted: true, isLocked: false, order: 5,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex14', lessonId: 'en-b1-l5', type: 'multiple-choice', question: 'What number is "thirteen"?', instruction: 'Select the correct number', options: ['13', '30', '3', '31'], correctAnswer: '13', explanation: 'Thirteen = 13' },
      { id: 'ex15', lessonId: 'en-b1-l5', type: 'type-what-you-hear', question: 'Type the number you hear: "seventeen"', instruction: 'Type the number', correctAnswer: '17', explanation: 'Seventeen = 17' },
    ],
  },
  {
    id: 'en-b1-l6', courseId: 'en-b1', title: 'Basic Questions', description: 'Learn to ask simple questions',
    skill: 'grammar', level: 1, xpReward: 15, estimatedMinutes: 6, isCompleted: true, isLocked: false, order: 6,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex16', lessonId: 'en-b1-l6', type: 'arrange-sentence', question: 'Form a question', instruction: 'Arrange into a question', words: ['Where', 'do', 'you', 'live', '?'], correctAnswer: ['Where', 'do', 'you', 'live', '?'], explanation: 'Wh- questions use: Wh + do/does + subject + verb' },
      { id: 'ex17', lessonId: 'en-b1-l6', type: 'fill-blank', question: '_____ is your phone number?', instruction: 'Fill in the question word', correctAnswer: 'What', explanation: '"What" asks for information or things.' },
    ],
  },
  {
    id: 'en-b1-l7', courseId: 'en-b1', title: 'Colors & Shapes', description: 'Basic colors and shapes vocabulary',
    skill: 'vocabulary', level: 1, xpReward: 15, estimatedMinutes: 5, isCompleted: false, isLocked: false, order: 7,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex18', lessonId: 'en-b1-l7', type: 'multiple-choice', question: 'What color is the sky on a clear day?', instruction: 'Select the correct color', options: ['Blue', 'Green', 'Red', 'Yellow'], correctAnswer: 'Blue', explanation: 'The sky is typically blue on a clear day.' },
    ],
  },
  {
    id: 'en-b1-l8', courseId: 'en-b1', title: 'Review & Test', description: 'Review everything from this course',
    skill: 'mixed', level: 1, xpReward: 25, estimatedMinutes: 10, isCompleted: false, isLocked: false, order: 8,
    vocabularyPreview: [],
    exercises: [
      { id: 'ex19', lessonId: 'en-b1-l8', type: 'multiple-choice', question: 'Choose the correct response: "How are you?"', instruction: 'Select the best response', options: ["I'm fine, thanks!", "I'm David", "I'm from Japan", "I'm 20"], correctAnswer: "I'm fine, thanks!", explanation: '"How are you?" asks about well-being, not name or origin.' },
      { id: 'ex20', lessonId: 'en-b1-l8', type: 'translate', question: 'Translate: "Tạm biệt, hẹn gặp lại!"', instruction: 'Type the translation', correctAnswer: 'Goodbye, see you again!', explanation: 'A common farewell expression.' },
    ],
  },
];
