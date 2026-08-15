import { JAPANESE_N5_COURSE } from '../courses/japaneseN5Course.ts';
import { CHINESE_HSK_REGISTRY } from '../chineseHskRegistry.ts';
import { KOREAN_TOPIK1_REGISTRY } from '../koreanTopikRegistry.ts';
import { realworldSurvivalLessons } from '../realworldSurvivalData.ts';
import { HSK1_LESSONS, HSK1_VOCABULARY_DECKS } from '../chineseHsk1Content.ts';
import { KOREAN_TOPIK1_LESSONS, KOREAN_TOPIK1_VOCABULARY_DECKS } from '../koreanTopik1Content.ts';
import { JLPT_N5_LESSONS } from '../jlptN5Lessons.ts';
import { JLPT_N5_VOCABULARY_LESSONS } from '../jlptN5Vocabulary.ts';
import { JAPANESE_LESSON_REGISTRY } from '../japaneseCurriculumRegistry.ts';
import { HIRAGANA_CHART, KATAKANA_CHART, KANA_CHECKS } from '../jlptN5Kana.ts';

export type AuthoredLessonPayload = 
  | { type: 'japanese'; content: any }
  | { type: 'chinese'; content: any }
  | { type: 'korean'; content: any }
  | { type: 'realworld'; content: any };

export function resolveAuthoredLesson(lessonId: string): AuthoredLessonPayload | null {
  // 1. Check Realworld Survival
  const prefix = lessonId.split('-')[0]; // e.g. ja, zh, ko
  if (lessonId.includes('survival') && realworldSurvivalLessons[prefix]) {
    const survivalLesson = realworldSurvivalLessons[prefix].find(l => l.id === lessonId);
    if (survivalLesson) {
      return { type: 'realworld', content: survivalLesson };
    }
  }

  // 2. Check Japanese N5
  if (lessonId.startsWith('ja-n5')) {
    const jpUnit = JAPANESE_N5_COURSE.units.find(u => u.lessons.some(l => l.id === lessonId));
    const jpLesson = jpUnit?.lessons.find(l => l.id === lessonId);
    if (jpLesson) {
      // Inject real kana content if it's the hiragana or katakana lesson
      if (lessonId === 'ja-n5-u0-l1-hiragana' || lessonId === 'ja-n5-u0-l2-katakana') {
        const isHiragana = lessonId.includes('hiragana');
        const chart = isHiragana ? HIRAGANA_CHART : KATAKANA_CHART;
        const mappedContent = {
          ...jpLesson,
          phases: [
            {
              type: 'introduce',
              content: {
                explanations: [`Bảng chữ cái ${isHiragana ? 'Hiragana' : 'Katakana'}`],
                examples: chart.map(c => ({
                  text: { base: c.kana, ruby: c.romaji },
                  translationVi: `Nhóm ${c.group}`
                }))
              }
            },
            {
              type: 'recognize',
              content: {
                questions: KANA_CHECKS.map((q, idx) => {
                  const targetKana = isHiragana ? q.kana : KATAKANA_CHART.find(c => c.romaji === HIRAGANA_CHART.find(h => h.kana === q.kana)?.romaji)?.kana || q.kana;
                  return {
                    id: `kana-q-${idx}`,
                    prompt: `Ký tự: ${targetKana}`,
                    choices: q.options.map((opt, optIdx) => ({
                      id: String.fromCharCode(97 + optIdx),
                      text: { base: opt, ruby: '' },
                      meaningVi: ''
                    })),
                    correctChoiceId: String.fromCharCode(97 + q.options.indexOf(q.correctAnswer)),
                    analysis: q.explanation
                  };
                })
              }
            }
          ]
        };
        return { type: 'japanese', content: mappedContent };
      }
      return { type: 'japanese', content: jpLesson };
    }
  }

  // 2b. Check Japanese N5 Extra (Grammar, Reading, Vocab)
  if (lessonId.startsWith('grammar-') || lessonId.startsWith('reading-')) {
    const lesson = (JLPT_N5_LESSONS as any)[lessonId];
    if (lesson) return { type: 'japanese', content: lesson };
  }
  
  if (lessonId.startsWith('vocab-')) {
    const lesson = (JLPT_N5_VOCABULARY_LESSONS as any)[lessonId];
    if (lesson) {
      const jpMeta = JAPANESE_LESSON_REGISTRY.find(l => l.id === lessonId);
      const mappedContent = {
        ...jpMeta,
        title: lesson.title,
        explanation: ['Học các từ vựng sau đây.'],
        examples: lesson.cards.map((card: any) => ({
          text: card.word,
          translationVi: card.meaning,
          note: `Ví dụ: ${card.example.map((s: any) => s.base).join('')} - ${card.exampleTranslation}`
        })),
        questions: []
      };
      return { type: 'japanese', content: mappedContent };
    }
  }

  // 3. Check Chinese HSK1
  if (lessonId.startsWith('zh:hsk') || lessonId.startsWith('zh-hsk')) {
    const zhMeta = CHINESE_HSK_REGISTRY.find(l => l.id === lessonId);
    let zhContent = HSK1_LESSONS.find(l => l.id === lessonId);
    
    if (!zhContent && lessonId.includes('vocabulary')) {
      const deck = HSK1_VOCABULARY_DECKS.find(d => d.id === lessonId);
      if (deck) {
        zhContent = {
          id: deck.id,
          level: 'HSK1',
          skill: 'vocabulary',
          title: deck.title,
          explanation: ['Học các từ vựng sau đây.'],
          examples: deck.cards.map(card => ({
            text: { hanzi: card.hanzi, pinyin: card.pinyin },
            translationVi: card.meaningVi,
            note: `Ví dụ: ${card.example.hanzi} (${card.example.pinyin}) - ${card.example.translationVi}`
          })),
          questions: []
        } as any;
      }
    }

    if (zhMeta || zhContent) {
      // Merge metadata and content
      return { type: 'chinese', content: { ...zhMeta, ...zhContent } };
    }
  }

  // 4. Check Korean TOPIK1
  if (lessonId.startsWith('ko:topik') || lessonId.startsWith('ko-topik')) {
    const koMeta = KOREAN_TOPIK1_REGISTRY.find(l => l.id === lessonId);
    let koContent = KOREAN_TOPIK1_LESSONS.find(l => l.id === lessonId);
    
    if (!koContent && lessonId.includes('vocabulary')) {
      const deck = KOREAN_TOPIK1_VOCABULARY_DECKS.find(d => d.id === lessonId);
      if (deck) {
        koContent = {
          id: deck.id,
          skill: 'vocabulary',
          title: deck.title,
          explanation: ['Học các từ vựng sau đây.'],
          examples: deck.cards.map(card => ({
            text: { hangul: card.hangul, romanization: card.romanization },
            translationVi: card.meaningVi,
            note: `Ví dụ: ${card.example.hangul} (${card.example.romanization}) - ${card.example.translationVi}`
          })),
          questions: []
        } as any;
      }
    }

    if (koMeta || koContent) {
      // Merge metadata and content
      return { type: 'korean', content: { ...koMeta, ...koContent } };
    }
  }

  return null;
}
