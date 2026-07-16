import type { Course } from '../types';

export const courses: Course[] = [
  // English courses (20+)
  { id: 'en-b1', languageId: 'en', title: 'Hello World!', level: 'beginner', description: 'Greetings, introductions, and basic phrases', totalLessons: 8, completedLessons: 8, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'en-b2', languageId: 'en', title: 'Daily Life', level: 'beginner', description: 'Routines, time, and everyday activities', totalLessons: 8, completedLessons: 6, xpReward: 100, skills: ['reading', 'writing'], isLocked: false, order: 2 },
  { id: 'en-b3', languageId: 'en', title: 'Food & Drinks', level: 'beginner', description: 'Ordering food, cooking vocabulary, and restaurant situations', totalLessons: 7, completedLessons: 4, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 3 },
  { id: 'en-b4', languageId: 'en', title: 'Travel Basics', level: 'beginner', description: 'Directions, transport, and travel phrases', totalLessons: 8, completedLessons: 2, xpReward: 120, skills: ['listening', 'speaking'], isLocked: false, order: 4 },
  { id: 'en-b5', languageId: 'en', title: 'Numbers & Shopping', level: 'beginner', description: 'Counting, prices, and shopping conversations', totalLessons: 6, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'listening'], isLocked: false, order: 5 },
  { id: 'en-e1', languageId: 'en', title: 'Family & Friends', level: 'elementary', description: 'Describing people, relationships, and personalities', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['speaking', 'writing'], isLocked: false, order: 6 },
  { id: 'en-e2', languageId: 'en', title: 'House & Home', level: 'elementary', description: 'Rooms, furniture, and describing your home', totalLessons: 7, completedLessons: 0, xpReward: 150, skills: ['vocabulary', 'reading'], isLocked: false, order: 7 },
  { id: 'en-e3', languageId: 'en', title: 'Weather & Seasons', level: 'elementary', description: 'Climate, weather reports, and seasonal activities', totalLessons: 6, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 8 },
  { id: 'en-e4', languageId: 'en', title: 'Health & Body', level: 'elementary', description: 'Body parts, illness, and visiting the doctor', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['vocabulary', 'speaking'], isLocked: true, order: 9 },
  { id: 'en-i1', languageId: 'en', title: 'Work & Career', level: 'intermediate', description: 'Job interviews, workplace vocabulary, and professional English', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing', 'speaking'], isLocked: true, order: 10 },
  { id: 'en-i2', languageId: 'en', title: 'Technology', level: 'intermediate', description: 'Tech vocabulary, discussing gadgets, and digital life', totalLessons: 8, completedLessons: 0, xpReward: 200, skills: ['reading', 'vocabulary'], isLocked: true, order: 11 },
  { id: 'en-i3', languageId: 'en', title: 'Environment', level: 'intermediate', description: 'Climate change, nature, and sustainability', totalLessons: 8, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 12 },
  { id: 'en-i4', languageId: 'en', title: 'News & Media', level: 'intermediate', description: 'Understanding news, media literacy, and current events', totalLessons: 9, completedLessons: 0, xpReward: 220, skills: ['listening', 'reading'], isLocked: true, order: 13 },
  { id: 'en-u1', languageId: 'en', title: 'Academic English', level: 'upper-intermediate', description: 'Essays, research, and academic discussions', totalLessons: 10, completedLessons: 0, xpReward: 250, skills: ['writing', 'reading'], isLocked: true, order: 14 },
  { id: 'en-u2', languageId: 'en', title: 'Business English', level: 'upper-intermediate', description: 'Meetings, presentations, and negotiations', totalLessons: 10, completedLessons: 0, xpReward: 250, skills: ['speaking', 'writing'], isLocked: true, order: 15 },
  { id: 'en-u3', languageId: 'en', title: 'Idioms & Phrasal Verbs', level: 'upper-intermediate', description: 'Common idioms, phrasal verbs, and natural expressions', totalLessons: 8, completedLessons: 0, xpReward: 250, skills: ['vocabulary', 'speaking'], isLocked: true, order: 16 },
  { id: 'en-a1', languageId: 'en', title: 'Advanced Grammar', level: 'advanced', description: 'Complex structures, inversions, and cleft sentences', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['grammar', 'writing'], isLocked: true, order: 17 },
  { id: 'en-a2', languageId: 'en', title: 'Literature & Poetry', level: 'advanced', description: 'Analyzing literature, poetry, and creative writing', totalLessons: 8, completedLessons: 0, xpReward: 300, skills: ['reading', 'writing'], isLocked: true, order: 18 },
  { id: 'en-a3', languageId: 'en', title: 'Debate & Discussion', level: 'advanced', description: 'Argumentation, critical thinking, and public speaking', totalLessons: 8, completedLessons: 0, xpReward: 300, skills: ['speaking'], isLocked: true, order: 19 },
  { id: 'en-m1', languageId: 'en', title: 'Native Speaker Mastery', level: 'mastery', description: 'Slang, humor, cultural nuances, and native-level fluency', totalLessons: 10, completedLessons: 0, xpReward: 400, skills: ['speaking', 'listening'], isLocked: true, order: 20 },

  // French courses
  { id: 'fr-b1', languageId: 'fr', title: 'Bonjour!', level: 'beginner', description: 'Salutations and basic French', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'fr-b2', languageId: 'fr', title: 'La Vie Quotidienne', level: 'beginner', description: 'Daily life in French', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['reading', 'writing'], isLocked: false, order: 2 },
  { id: 'fr-b3', languageId: 'fr', title: 'Au Restaurant', level: 'beginner', description: 'Ordering food and dining culture', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 3 },
  { id: 'fr-e1', languageId: 'fr', title: 'Voyages en France', level: 'elementary', description: 'Traveling in France', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 4 },
  { id: 'fr-i1', languageId: 'fr', title: 'Culture Française', level: 'intermediate', description: 'French culture and society', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 5 },

  // German courses
  { id: 'de-b1', languageId: 'de', title: 'Hallo!', level: 'beginner', description: 'Greetings and basics in German', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'de-b2', languageId: 'de', title: 'Alltag', level: 'beginner', description: 'Daily life vocabulary', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['reading', 'vocabulary'], isLocked: false, order: 2 },
  { id: 'de-e1', languageId: 'de', title: 'Essen und Trinken', level: 'elementary', description: 'Food and drinks in German', totalLessons: 7, completedLessons: 0, xpReward: 150, skills: ['vocabulary', 'speaking'], isLocked: true, order: 3 },
  { id: 'de-i1', languageId: 'de', title: 'Deutsche Kultur', level: 'intermediate', description: 'German culture and traditions', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'de-a1', languageId: 'de', title: 'Geschäftsdeutsch', level: 'advanced', description: 'Business German', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Japanese courses
  { id: 'ja-b1', languageId: 'ja', title: 'こんにちは!', level: 'beginner', description: 'Hiragana, greetings, and basic phrases', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['speaking', 'reading'], isLocked: false, order: 1 },
  { id: 'ja-b2', languageId: 'ja', title: 'カタカナ', level: 'beginner', description: 'Katakana and loanwords', totalLessons: 8, completedLessons: 0, xpReward: 120, skills: ['reading', 'writing'], isLocked: false, order: 2 },
  { id: 'ja-e1', languageId: 'ja', title: '毎日の生活', level: 'elementary', description: 'Daily life in Japanese', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 3 },
  { id: 'ja-i1', languageId: 'ja', title: '日本文化', level: 'intermediate', description: 'Japanese culture and society', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'ja-a1', languageId: 'ja', title: '漢字マスター', level: 'advanced', description: 'Kanji mastery and advanced reading', totalLessons: 12, completedLessons: 0, xpReward: 300, skills: ['reading'], isLocked: true, order: 5 },

  // Korean courses
  { id: 'ko-b1', languageId: 'ko', title: '안녕하세요!', level: 'beginner', description: 'Hangul and basic Korean', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['reading', 'speaking'], isLocked: false, order: 1 },
  { id: 'ko-b2', languageId: 'ko', title: '한국 음식', level: 'beginner', description: 'Korean food and dining', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 2 },
  { id: 'ko-e1', languageId: 'ko', title: 'K-드라마', level: 'elementary', description: 'Learn Korean through K-drama phrases', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'vocabulary'], isLocked: true, order: 3 },
  { id: 'ko-i1', languageId: 'ko', title: '한국 문화', level: 'intermediate', description: 'Korean culture and society', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'ko-a1', languageId: 'ko', title: '비즈니스 한국어', level: 'advanced', description: 'Business Korean', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Spanish courses
  { id: 'es-b1', languageId: 'es', title: '¡Hola!', level: 'beginner', description: 'Greetings and basic Spanish', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'es-b2', languageId: 'es', title: 'Comida y Bebida', level: 'beginner', description: 'Food, drinks, and restaurants', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 2 },
  { id: 'es-e1', languageId: 'es', title: 'Viajes', level: 'elementary', description: 'Traveling in Spanish-speaking countries', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 3 },
  { id: 'es-i1', languageId: 'es', title: 'Cultura Latina', level: 'intermediate', description: 'Latin American culture', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'es-a1', languageId: 'es', title: 'Español de Negocios', level: 'advanced', description: 'Business Spanish', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Chinese courses
  { id: 'zh-b1', languageId: 'zh', title: '你好!', level: 'beginner', description: 'Pinyin, tones, and basic greetings', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'zh-b2', languageId: 'zh', title: '汉字入门', level: 'beginner', description: 'Introduction to Chinese characters', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['reading', 'writing'], isLocked: false, order: 2 },
  { id: 'zh-e1', languageId: 'zh', title: '中国美食', level: 'elementary', description: 'Chinese cuisine and dining', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['vocabulary', 'speaking'], isLocked: true, order: 3 },
  { id: 'zh-i1', languageId: 'zh', title: '中国文化', level: 'intermediate', description: 'Chinese culture and traditions', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'zh-a1', languageId: 'zh', title: '商务中文', level: 'advanced', description: 'Business Chinese', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Italian courses
  { id: 'it-b1', languageId: 'it', title: 'Ciao!', level: 'beginner', description: 'Italian greetings and basics', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'it-b2', languageId: 'it', title: 'La Cucina Italiana', level: 'beginner', description: 'Italian cuisine vocabulary', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'reading'], isLocked: false, order: 2 },
  { id: 'it-e1', languageId: 'it', title: 'Viaggiare in Italia', level: 'elementary', description: 'Traveling in Italy', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 3 },
  { id: 'it-i1', languageId: 'it', title: 'Arte e Cultura', level: 'intermediate', description: 'Italian art and culture', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'it-a1', languageId: 'it', title: 'Italiano Avanzato', level: 'advanced', description: 'Advanced Italian', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Portuguese courses
  { id: 'pt-b1', languageId: 'pt', title: 'Olá!', level: 'beginner', description: 'Portuguese greetings and basics', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'pt-b2', languageId: 'pt', title: 'Comida Brasileira', level: 'beginner', description: 'Brazilian food and culture', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 2 },
  { id: 'pt-e1', languageId: 'pt', title: 'Viagem ao Brasil', level: 'elementary', description: 'Traveling in Brazil', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 3 },
  { id: 'pt-i1', languageId: 'pt', title: 'Cultura Lusófona', level: 'intermediate', description: 'Portuguese-speaking world culture', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'pt-a1', languageId: 'pt', title: 'Português Avançado', level: 'advanced', description: 'Advanced Portuguese', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Russian courses
  { id: 'ru-b1', languageId: 'ru', title: 'Привет!', level: 'beginner', description: 'Cyrillic alphabet and basics', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['reading', 'speaking'], isLocked: false, order: 1 },
  { id: 'ru-b2', languageId: 'ru', title: 'Каждый день', level: 'beginner', description: 'Daily life in Russian', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['listening', 'vocabulary'], isLocked: false, order: 2 },
  { id: 'ru-e1', languageId: 'ru', title: 'Русская кухня', level: 'elementary', description: 'Russian cuisine', totalLessons: 7, completedLessons: 0, xpReward: 150, skills: ['vocabulary', 'speaking'], isLocked: true, order: 3 },
  { id: 'ru-i1', languageId: 'ru', title: 'Русская культура', level: 'intermediate', description: 'Russian culture and literature', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'ru-a1', languageId: 'ru', title: 'Деловой русский', level: 'advanced', description: 'Business Russian', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Vietnamese courses
  { id: 'vi-b1', languageId: 'vi', title: 'Xin chào!', level: 'beginner', description: 'Vietnamese tones and greetings', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['speaking', 'listening'], isLocked: false, order: 1 },
  { id: 'vi-b2', languageId: 'vi', title: 'Ẩm thực Việt', level: 'beginner', description: 'Vietnamese food and culture', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 2 },
  { id: 'vi-e1', languageId: 'vi', title: 'Du lịch Việt Nam', level: 'elementary', description: 'Traveling in Vietnam', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 3 },
  { id: 'vi-i1', languageId: 'vi', title: 'Văn hóa Việt', level: 'intermediate', description: 'Vietnamese culture', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'vi-a1', languageId: 'vi', title: 'Tiếng Việt nâng cao', level: 'advanced', description: 'Advanced Vietnamese', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Thai courses
  { id: 'th-b1', languageId: 'th', title: 'สวัสดี!', level: 'beginner', description: 'Thai script and greetings', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['reading', 'speaking'], isLocked: false, order: 1 },
  { id: 'th-b2', languageId: 'th', title: 'อาหารไทย', level: 'beginner', description: 'Thai food and ordering', totalLessons: 7, completedLessons: 0, xpReward: 100, skills: ['vocabulary', 'speaking'], isLocked: false, order: 2 },
  { id: 'th-e1', languageId: 'th', title: 'เที่ยวเมืองไทย', level: 'elementary', description: 'Traveling in Thailand', totalLessons: 8, completedLessons: 0, xpReward: 150, skills: ['listening', 'speaking'], isLocked: true, order: 3 },
  { id: 'th-i1', languageId: 'th', title: 'วัฒนธรรมไทย', level: 'intermediate', description: 'Thai culture and customs', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'th-a1', languageId: 'th', title: 'ภาษาไทยขั้นสูง', level: 'advanced', description: 'Advanced Thai', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },

  // Arabic courses
  { id: 'ar-b1', languageId: 'ar', title: '!مرحبا', level: 'beginner', description: 'Arabic script and basics', totalLessons: 10, completedLessons: 0, xpReward: 120, skills: ['reading', 'speaking'], isLocked: false, order: 1 },
  { id: 'ar-b2', languageId: 'ar', title: 'الحياة اليومية', level: 'beginner', description: 'Daily life in Arabic', totalLessons: 8, completedLessons: 0, xpReward: 100, skills: ['listening', 'vocabulary'], isLocked: false, order: 2 },
  { id: 'ar-e1', languageId: 'ar', title: 'المطبخ العربي', level: 'elementary', description: 'Arabic cuisine and dining', totalLessons: 7, completedLessons: 0, xpReward: 150, skills: ['vocabulary', 'speaking'], isLocked: true, order: 3 },
  { id: 'ar-i1', languageId: 'ar', title: 'الثقافة العربية', level: 'intermediate', description: 'Arabic culture and history', totalLessons: 10, completedLessons: 0, xpReward: 200, skills: ['reading', 'writing'], isLocked: true, order: 4 },
  { id: 'ar-a1', languageId: 'ar', title: 'العربية للأعمال', level: 'advanced', description: 'Business Arabic', totalLessons: 10, completedLessons: 0, xpReward: 300, skills: ['speaking', 'writing'], isLocked: true, order: 5 },
];
