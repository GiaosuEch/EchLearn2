export type PhoneticData = {
  text: string;
  phonetic: string; // Furigana / Romaji / Pinyin / IPA
  meaningVi: string;
  meaningEn: string;
  type: string;
};

export const phoneticDictionary: Record<string, Record<string, PhoneticData>> = {
  ja: {
    'こんにちは': { text: 'こんにちは', phonetic: 'Konnichiwa (こん にち は)', meaningVi: 'Xin chào', meaningEn: 'Hello', type: 'greeting' },
    'ありがとう': { text: 'ありがとう', phonetic: 'Arigatou (ありが とう)', meaningVi: 'Cảm ơn', meaningEn: 'Thank you', type: 'phrase' },
    '猫': { text: '猫', phonetic: 'Neko [ねこ]', meaningVi: 'Con mèo', meaningEn: 'Cat', type: 'noun' },
    '犬': { text: '犬', phonetic: 'Inu [いぬ]', meaningVi: 'Con chó', meaningEn: 'Dog', type: 'noun' },
    '水': { text: '水', phonetic: 'Mizu [みず]', meaningVi: 'Nước', meaningEn: 'Water', type: 'noun' },
    '本': { text: '本', phonetic: 'Hon [ほん]', meaningVi: 'Sách', meaningEn: 'Book', type: 'noun' },
    '先生': { text: '先生', phonetic: 'Sensei [せんせい]', meaningVi: 'Thầy/Cô giáo', meaningEn: 'Teacher', type: 'noun' },
    '学生': { text: '学生', phonetic: 'Gakusei [がくせい]', meaningVi: 'Học sinh', meaningEn: 'Student', type: 'noun' },
    '食べる': { text: '食べる', phonetic: 'Taberu [たべる]', meaningVi: 'Ăn', meaningEn: 'To eat', type: 'verb' },
    '飲む': { text: '飲む', phonetic: 'Nomu [のむ]', meaningVi: 'Uống', meaningEn: 'To drink', type: 'verb' },
  },
  zh: {
    '你好': { text: '你好', phonetic: 'Nǐ hǎo (nǐ hǎo)', meaningVi: 'Xin chào', meaningEn: 'Hello', type: 'greeting' },
    '谢谢': { text: '谢谢', phonetic: 'Xièxie (xiè xie)', meaningVi: 'Cảm ơn', meaningEn: 'Thank you', type: 'phrase' },
    '猫': { text: '猫', phonetic: 'Māo (māo)', meaningVi: 'Con mèo', meaningEn: 'Cat', type: 'noun' },
    '水': { text: '水', phonetic: 'Shuǐ (shuǐ)', meaningVi: 'Nước', meaningEn: 'Water', type: 'noun' },
    '书': { text: '书', phonetic: 'Shū (shū)', meaningVi: 'Sách', meaningEn: 'Book', type: 'noun' },
    '老师': { text: '老师', phonetic: 'Lǎoshī (lǎo shī)', meaningVi: 'Thầy/Cô giáo', meaningEn: 'Teacher', type: 'noun' },
  },
  ko: {
    '안녕하세요': { text: '안녕하세요', phonetic: 'An-nyeong-ha-se-yo', meaningVi: 'Xin chào', meaningEn: 'Hello', type: 'greeting' },
    '감사합니다': { text: '감사합니다', phonetic: 'Gam-sa-ham-ni-da', meaningVi: 'Cảm ơn', meaningEn: 'Thank you', type: 'phrase' },
    '고양이': { text: '고양이', phonetic: 'Go-yang-i', meaningVi: 'Con mèo', meaningEn: 'Cat', type: 'noun' },
    '물': { text: '물', phonetic: 'Mul', meaningVi: 'Nước', meaningEn: 'Water', type: 'noun' },
    '책': { text: '책', phonetic: 'Chaek', meaningVi: 'Sách', meaningEn: 'Book', type: 'noun' },
    '선생님': { text: '선생님', phonetic: 'Seon-saeng-nim', meaningVi: 'Thầy/Cô giáo', meaningEn: 'Teacher', type: 'noun' },
  },
  en: {
    'apple': { text: 'apple', phonetic: '/ˈæp.əl/', meaningVi: 'Quả táo', meaningEn: 'Apple', type: 'noun' },
    'book': { text: 'book', phonetic: '/bʊk/', meaningVi: 'Cuốn sách', meaningEn: 'Book', type: 'noun' },
    'teacher': { text: 'teacher', phonetic: '/ˈtiː.tʃər/', meaningVi: 'Giáo viên', meaningEn: 'Teacher', type: 'noun' },
    'student': { text: 'student', phonetic: '/ˈstjuː.dənt/', meaningVi: 'Học sinh', meaningEn: 'Student', type: 'noun' },
    'resilient': { text: 'resilient', phonetic: '/rɪˈzɪl.jənt/', meaningVi: 'Kiên cường, đàn hồi', meaningEn: 'Able to recover quickly', type: 'adjective' },
    'meticulous': { text: 'meticulous', phonetic: '/məˈtɪk.jə.ləs/', meaningVi: 'Tỉ mỉ, cẩn thận', meaningEn: 'Very careful and precise', type: 'adjective' },
  }
};

export function getPhoneticInfo(word: string, language = 'en'): PhoneticData {
  const langDict = phoneticDictionary[language] || phoneticDictionary['en'];
  if (langDict && langDict[word]) {
    return langDict[word];
  }

  // Fallback transliteration generator
  return {
    text: word,
    phonetic: `/${word.toLowerCase().replace(/e$/i, 'ə')}/`,
    meaningVi: 'Từ vựng bài học',
    meaningEn: 'Lesson vocabulary',
    type: 'word'
  };
}
