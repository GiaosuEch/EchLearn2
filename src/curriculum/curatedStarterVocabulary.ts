export type CuratedStarterVocabularyItem = {
  id: string;
  language: 'en' | 'zh' | 'ja';
  word: string;
  nativeScript: string;
  romanization: string;
  partOfSpeech: 'phrase' | 'noun' | 'verb' | 'question';
  meaningVietnamese: string;
  example: string;
};

const starterVocabulary: Record<string, CuratedStarterVocabularyItem[]> = {
  en: [
    ['hello', 'hello', 'hello', 'phrase', 'xin chào', 'Hello, nice to meet you.'],
    ['thank you', 'thank you', 'thank you', 'phrase', 'cảm ơn', 'Thank you for your help.'],
    ['please', 'please', 'please', 'phrase', 'làm ơn', 'Please speak slowly.'],
    ['water', 'water', 'water', 'noun', 'nước', 'Can I have water, please?'],
    ['help', 'help', 'help', 'verb', 'giúp đỡ', 'Can you help me?'],
    ['ticket', 'ticket', 'ticket', 'noun', 'vé', 'I need a train ticket.'],
    ['where', 'where', 'where', 'question', 'ở đâu', 'Where is the station?'],
    ['how much', 'how much', 'how much', 'question', 'bao nhiêu tiền', 'How much is this?'],
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `starter_en_${index + 1}`, language: 'en', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),
  zh: [
    ['你好', '你好', 'nǐ hǎo', 'phrase', 'xin chào', '你好，很高兴认识你。'],
    ['谢谢', '谢谢', 'xièxie', 'phrase', 'cảm ơn', '谢谢你的帮助。'],
    ['请', '请', 'qǐng', 'phrase', 'làm ơn', '请说慢一点。'],
    ['水', '水', 'shuǐ', 'noun', 'nước', '请给我一杯水。'],
    ['帮助', '帮助', 'bāngzhù', 'verb', 'giúp đỡ', '你可以帮助我吗？'],
    ['票', '票', 'piào', 'noun', 'vé', '我需要一张票。'],
    ['哪里', '哪里', 'nǎlǐ', 'question', 'ở đâu', '车站在哪里？'],
    ['多少钱', '多少钱', 'duōshao qián', 'question', 'bao nhiêu tiền', '这个多少钱？'],
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `starter_zh_${index + 1}`, language: 'zh', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),
  ja: [
    ['こんにちは', 'こんにちは', 'konnichiwa', 'phrase', 'xin chào', 'こんにちは。はじめまして。'],
    ['ありがとう', 'ありがとう', 'arigatou', 'phrase', 'cảm ơn', 'ありがとう、助かりました。'],
    ['お願いします', 'お願いします', 'onegaishimasu', 'phrase', 'làm ơn', 'ゆっくりお願いします。'],
    ['水', '水', 'mizu', 'noun', 'nước', '水をください。'],
    ['助ける', '助ける', 'tasukeru', 'verb', 'giúp đỡ', '助けてください。'],
    ['切符', '切符', 'kippu', 'noun', 'vé', '切符を一枚ください。'],
    ['どこ', 'どこ', 'doko', 'question', 'ở đâu', '駅はどこですか。'],
    ['いくら', 'いくら', 'ikura', 'question', 'bao nhiêu tiền', 'これはいくらですか。'],
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `starter_ja_${index + 1}`, language: 'ja', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),
};

export function getCuratedStarterVocabulary(language: string): CuratedStarterVocabularyItem[] {
  return starterVocabulary[language] ? [...starterVocabulary[language]] : [];
}
