import { LearningPackRegistry } from '../domain/learning/learningPackRegistry.ts';
import { CHINESE_HSK1_PACK } from './chineseHsk1Pack.ts';
import { JAPANESE_JLPT_N5_PACK } from './japaneseJlptN5Pack.ts';
import { KOREAN_TOPIK1_DEFINITION } from './koreanTopik1Pack.ts';

export const LEARNING_PACKS = [JAPANESE_JLPT_N5_PACK, CHINESE_HSK1_PACK, KOREAN_TOPIK1_DEFINITION] as const;
export const learningPackRegistry = new LearningPackRegistry(LEARNING_PACKS);
