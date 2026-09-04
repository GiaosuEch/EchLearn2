import type { Language } from '../types';
import { authoredLessonCount } from './authoredLessonCounts.ts';

const FLAG_MAP: Record<string, string> = {
  en: 'https://flagcdn.com/w80/gb.png',
  fr: 'https://flagcdn.com/w80/fr.png',
  de: 'https://flagcdn.com/w80/de.png',
  zh: 'https://flagcdn.com/w80/cn.png',
  ja: 'https://flagcdn.com/w80/jp.png',
  ko: 'https://flagcdn.com/w80/kr.png',
  es: 'https://flagcdn.com/w80/es.png',
  it: 'https://flagcdn.com/w80/it.png',
  pt: 'https://flagcdn.com/w80/br.png',
  ru: 'https://flagcdn.com/w80/ru.png',
  vi: 'https://flagcdn.com/w80/vn.png',
  th: 'https://flagcdn.com/w80/th.png',
  ar: 'https://flagcdn.com/w80/sa.png',
};

export function getFlagUrl(code: string): string {
  return FLAG_MAP[code.toLowerCase()] || `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

// totalLessons is derived from authored content (src/data/authoredLessonCounts.ts),
// never hardcoded. No invented learner counts are published anywhere.
export const languages: Language[] = [
  {
    id: 'en', name: 'English', nativeName: 'Tiếng Anh', code: 'en', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w80/gb.png',
    difficulty: 'easy', totalLessons: authoredLessonCount('en'),
    description: 'Ngôn ngữ toàn cầu! Thành thạo giao tiếp hàng ngày hoặc bứt phá IELTS.',
    hasIELTS: true,
  },
  {
    id: 'fr', name: 'French', nativeName: 'Français (Tiếng Pháp)', code: 'fr', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w80/fr.png',
    difficulty: 'medium', totalLessons: authoredLessonCount('fr'),
    description: 'Ngôn ngữ của tình yêu, văn hóa và nghệ thuật giao tiếp thanh lịch.',
    hasIELTS: false,
  },
  {
    id: 'de', name: 'German', nativeName: 'Deutsch (Tiếng Đức)', code: 'de', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w80/de.png',
    difficulty: 'medium', totalLessons: authoredLessonCount('de'),
    description: 'Kỹ thuật, triết học và sự chính xác tuyệt vời trong từng câu nói.',
    hasIELTS: false,
  },
  {
    id: 'zh', name: 'Chinese', nativeName: '中文 (Tiếng Trung)', code: 'zh', flag: '🇨🇳', flagUrl: 'https://flagcdn.com/w80/cn.png',
    difficulty: 'expert', totalLessons: authoredLessonCount('zh'),
    description: 'Ngôn ngữ phổ biến nhất thế giới! Khám phá tiếng Trung phổ thông sinh động.',
    hasIELTS: false,
  },
  {
    id: 'ja', name: 'Japanese', nativeName: '日本語 (Tiếng Nhật)', code: 'ja', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w80/jp.png',
    difficulty: 'expert', totalLessons: authoredLessonCount('ja'),
    description: 'Từ Anime đến kinh doanh — mở khóa nền văn hóa Nhật Bản siêu thú vị!',
    hasIELTS: false,
  },
  {
    id: 'ko', name: 'Korean', nativeName: '한국어 (Tiếng Hàn)', code: 'ko', flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w80/kr.png',
    difficulty: 'hard', totalLessons: authoredLessonCount('ko'),
    description: 'K-pop, K-drama và nền văn hóa Hàn Quốc đầy màu sắc đang chờ bạn.',
    hasIELTS: false,
  },
  {
    id: 'es', name: 'Spanish', nativeName: 'Español (Tây Ban Nha)', code: 'es', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w80/es.png',
    difficulty: 'easy', totalLessons: authoredLessonCount('es'),
    description: 'Được nói trên 20+ quốc gia. Cánh cửa dẫn bạn đến thế giới Latinh sôi động!',
    hasIELTS: false,
  },
  {
    id: 'it', name: 'Italian', nativeName: 'Italiano (Tiếng Ý)', code: 'it', flag: '🇮🇹', flagUrl: 'https://flagcdn.com/w80/it.png',
    difficulty: 'medium', totalLessons: authoredLessonCount('it'),
    description: 'Nghệ thuật, ẩm thực, thời trang và phong cách sống la dolce vita tuyệt vời.',
    hasIELTS: false,
  },
  {
    id: 'pt', name: 'Portuguese', nativeName: 'Português (Tiếng Bồ Đào Nha)', code: 'pt', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w80/br.png',
    difficulty: 'medium', totalLessons: authoredLessonCount('pt'),
    description: 'Từ Bồ Đào Nha đến Brazil — ngôn ngữ toàn cầu đầy sức sống.',
    hasIELTS: false,
  },
  {
    id: 'ru', name: 'Russian', nativeName: 'Русский (Tiếng Nga)', code: 'ru', flag: '🇷🇺', flagUrl: 'https://flagcdn.com/w80/ru.png',
    difficulty: 'hard', totalLessons: authoredLessonCount('ru'),
    description: 'Văn học, khoa học và thế giới văn hóa Nga bao la kỳ vĩ.',
    hasIELTS: false,
  },
  {
    id: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', code: 'vi', flag: '🇻🇳', flagUrl: 'https://flagcdn.com/w80/vn.png',
    difficulty: 'hard', totalLessons: authoredLessonCount('vi'),
    description: 'Vẻ đẹp thanh điệu, văn hóa phong phú và nền ẩm thực Việt Nam tuyệt vời!',
    hasIELTS: false,
  },
  {
    id: 'th', name: 'Thai', nativeName: 'ภาษาไทย (Tiếng Thái)', code: 'th', flag: '🇹🇭', flagUrl: 'https://flagcdn.com/w80/th.png',
    difficulty: 'hard', totalLessons: authoredLessonCount('th'),
    description: 'Đất nước của những nụ cười, điệu múa và văn hóa xứ Chùa Vàng xinh đẹp.',
    hasIELTS: false,
  },
  {
    id: 'ar', name: 'Arabic', nativeName: 'العربية (Tiếng Ả Rập)', code: 'ar', flag: '🇸🇦', flagUrl: 'https://flagcdn.com/w80/sa.png',
    difficulty: 'expert', totalLessons: authoredLessonCount('ar'),
    description: 'Một trong những ngôn ngữ cổ xưa và có chữ viết nghệ thuật đẹp nhất thế giới.',
    hasIELTS: false,
  },
];
