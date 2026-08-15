import type { CourseUnit } from './englishCourse.ts';
import { getAuthoredRoadmapUnits } from './roadmap/languageRoadmapAdapter.ts';

export interface ProductPackFeature {
  id: string;
  title: string;
  description: string;
  path: string;
  bannerType: 'realworld' | 'ielts' | 'standard';
}

export interface ProductPack {
  readonly languageId: string;
  readonly title?: string;
  readonly description?: string;
  readonly units: readonly CourseUnit[];
  readonly features: readonly ProductPackFeature[];
}

const buildFeatures = (lang: string): ProductPackFeature[] => {
  const features: ProductPackFeature[] = [];
  
  if (lang.startsWith('en')) {
    features.push({
      id: 'realworld-mastery',
      title: 'Realworld Mastery: giao tiếp thực chiến',
      description: 'Hoàn thành 6 bước để tự tạo câu, nhớ lại cụm trọng tâm và tự rà soát.',
      path: '/app/survival',
      bannerType: 'realworld'
    });
  }
  return features;
};

import type { ReadonlyDeep } from 'type-fest';

const buildPack = async (lang: string, name: string, signal?: AbortSignal): Promise<ProductPack> => {
  const [{ getRealworldSurvivalCourse }, { generateStandardCourse }] = await Promise.all([
    import('./realworldSurvivalCourse.ts'),
    import('./megaCurriculumGenerator.ts')
  ]);
  
  if (signal?.aborted) {
    throw new DOMException('Aborted by UI before generating course', 'AbortError');
  }

  let standardUnits: CourseUnit[] = [];
  if (['ja', 'zh', 'ko'].some(prefix => lang.startsWith(prefix))) {
      standardUnits = await getAuthoredRoadmapUnits(lang);
  } else {
      standardUnits = generateStandardCourse(lang, name);
  }
  
  const packTitles: Record<string, { title: string, description: string }> = {
    'en': { title: 'Tiếng Anh Thực Chiến', description: 'Hoàn thành các bài học dưới đây để giao tiếp tự tin mỗi ngày.' },
    'ja': { title: 'Tiếng Nhật JLPT N5', description: 'Lộ trình N5 với Kana, Ngữ pháp, và Từ vựng toàn diện.' },
    'zh': { title: 'Tiếng Trung HSK 1', description: 'Lộ trình HSK 1 xây dựng nền tảng nghe nói đọc viết vững chắc.' },
    'ko': { title: 'Tiếng Hàn TOPIK I', description: 'Lộ trình TOPIK I kèm Hangul, Ngữ pháp và Từ vựng thiết yếu.' }
  };
  const meta = packTitles[lang.split('-')[0]] || { title: 'Lộ trình học tập', description: 'Hoàn thành các bài học dưới đây.' };

  return {
    languageId: lang,
    title: meta.title,
    description: meta.description,
    units: [...getRealworldSurvivalCourse(lang), ...standardUnits],
    features: buildFeatures(lang)
  };
};

type ProductPackFactory = (signal?: AbortSignal) => Promise<ProductPack>;

export const courseRegistry: Record<string, ProductPackFactory> = {
  'en': (s) => buildPack('en', 'Tiếng Anh', s),
  'en-US': (s) => buildPack('en-US', 'Tiếng Anh', s),
  'fr': (s) => buildPack('fr', 'Tiếng Pháp', s),
  'fr-FR': (s) => buildPack('fr-FR', 'Tiếng Pháp', s),
  'de': (s) => buildPack('de', 'Tiếng Đức', s),
  'de-DE': (s) => buildPack('de-DE', 'Tiếng Đức', s),
  'zh': (s) => buildPack('zh', 'Tiếng Trung', s),
  'zh-CN': (s) => buildPack('zh-CN', 'Tiếng Trung', s),
  'ja': (s) => buildPack('ja', 'Tiếng Nhật', s),
  'ja-JP': (s) => buildPack('ja-JP', 'Tiếng Nhật', s),
  'ko': (s) => buildPack('ko', 'Tiếng Hàn', s),
  'ko-KR': (s) => buildPack('ko-KR', 'Tiếng Hàn', s),
  'es': (s) => buildPack('es', 'Tiếng Tây Ban Nha', s),
  'es-ES': (s) => buildPack('es-ES', 'Tiếng Tây Ban Nha', s),
  'it': (s) => buildPack('it', 'Tiếng Ý', s),
  'it-IT': (s) => buildPack('it-IT', 'Tiếng Ý', s),
  'pt': (s) => buildPack('pt', 'Tiếng Bồ Đào Nha', s),
  'pt-BR': (s) => buildPack('pt-BR', 'Tiếng Bồ Đào Nha', s),
  'ru': (s) => buildPack('ru', 'Tiếng Nga', s),
  'ru-RU': (s) => buildPack('ru-RU', 'Tiếng Nga', s),
  'vi': (s) => buildPack('vi', 'Tiếng Việt', s),
  'vi-VN': (s) => buildPack('vi-VN', 'Tiếng Việt', s),
  'th': (s) => buildPack('th', 'Tiếng Thái', s),
  'th-TH': (s) => buildPack('th-TH', 'Tiếng Thái', s),
  'ar': (s) => buildPack('ar', 'Tiếng Ả Rập', s),
  'ar-SA': (s) => buildPack('ar-SA', 'Tiếng Ả Rập', s),
};

const packCache: Record<string, Promise<ReadonlyDeep<ProductPack>>> = {};

export function getProductPackForLanguage(languageId: string, signal?: AbortSignal): Promise<ReadonlyDeep<ProductPack>> {
  // Multiplexed Promise Caching
  // If no cache, create the core fetcher WITHOUT a signal (so it doesn't die on shared abort)
  if (!packCache[languageId]) {
    const factory = courseRegistry[languageId];
    
    // Pass undefined instead of the user's signal to the factory
    packCache[languageId] = (factory ? factory(undefined) : courseRegistry['en'](undefined))
      .then(pack => pack as ReadonlyDeep<ProductPack>)
      .catch(err => {
        // Auto-eviction if the CORE fetch fails
        delete packCache[languageId];
        throw err;
      });
  }
  
  // Return a branch that listens to the SPECIFIC caller's AbortSignal
  return new Promise<ReadonlyDeep<ProductPack>>((resolve, reject) => {
    // If already aborted, fail early without touching the cache
    if (signal?.aborted) {
      return reject(new DOMException('Aborted by UI', 'AbortError'));
    }

    // Setup an abort listener that rejects THIS specific caller
    const abortHandler = () => {
      reject(new DOMException('Aborted by UI', 'AbortError'));
    };
    
    signal?.addEventListener('abort', abortHandler);

    packCache[languageId]
      .then(pack => resolve(pack))
      .catch(err => reject(err))
      .finally(() => {
        signal?.removeEventListener('abort', abortHandler);
      });
  });
}

export async function getCourseForLanguage(languageId: string, signal?: AbortSignal): Promise<ReadonlyDeep<CourseUnit[]>> {
  const pack = await getProductPackForLanguage(languageId, signal);
  return pack.units;
}
