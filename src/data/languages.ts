import type { Language } from '../types';

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

export const languages: Language[] = [
  {
    id: 'en', name: 'English', nativeName: 'Tiếng Anh', code: 'en', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w80/gb.png',
    difficulty: 'easy', totalLessons: 480, totalLearners: 2500000,
    description: 'Ngôn ngữ toàn cầu! Thành thạo giao tiếp hàng ngày hoặc bứt phá IELTS.',
    hasIELTS: true,
    skills: [
      { id: 'en-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'en-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'en-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'en-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'fr', name: 'French', nativeName: 'Français (Tiếng Pháp)', code: 'fr', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w80/fr.png',
    difficulty: 'medium', totalLessons: 480, totalLearners: 1200000,
    description: 'Ngôn ngữ của tình yêu, văn hóa và nghệ thuật giao tiếp thanh lịch.',
    hasIELTS: false,
    skills: [
      { id: 'fr-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'fr-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'fr-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'fr-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'de', name: 'German', nativeName: 'Deutsch (Tiếng Đức)', code: 'de', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w80/de.png',
    difficulty: 'medium', totalLessons: 480, totalLearners: 900000,
    description: 'Kỹ thuật, triết học và sự chính xác tuyệt vời trong từng câu nói.',
    hasIELTS: false,
    skills: [
      { id: 'de-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'de-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'de-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'de-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'zh', name: 'Chinese', nativeName: '中文 (Tiếng Trung)', code: 'zh', flag: '🇨🇳', flagUrl: 'https://flagcdn.com/w80/cn.png',
    difficulty: 'expert', totalLessons: 480, totalLearners: 1800000,
    description: 'Ngôn ngữ phổ biến nhất thế giới! Khám phá tiếng Trung phổ thông sinh động.',
    hasIELTS: false,
    skills: [
      { id: 'zh-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'zh-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'zh-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'zh-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'ja', name: 'Japanese', nativeName: '日本語 (Tiếng Nhật)', code: 'ja', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w80/jp.png',
    difficulty: 'expert', totalLessons: 480, totalLearners: 1500000,
    description: 'Từ Anime đến kinh doanh — mở khóa nền văn hóa Nhật Bản siêu thú vị!',
    hasIELTS: false,
    skills: [
      { id: 'ja-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ja-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ja-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ja-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'ko', name: 'Korean', nativeName: '한국어 (Tiếng Hàn)', code: 'ko', flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w80/kr.png',
    difficulty: 'hard', totalLessons: 480, totalLearners: 1100000,
    description: 'K-pop, K-drama và nền văn hóa Hàn Quốc đầy màu sắc đang chờ bạn.',
    hasIELTS: false,
    skills: [
      { id: 'ko-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ko-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ko-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ko-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'es', name: 'Spanish', nativeName: 'Español (Tây Ban Nha)', code: 'es', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w80/es.png',
    difficulty: 'easy', totalLessons: 480, totalLearners: 2000000,
    description: 'Được nói trên 20+ quốc gia. Cánh cửa dẫn bạn đến thế giới Latinh sôi động!',
    hasIELTS: false,
    skills: [
      { id: 'es-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'es-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'es-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'es-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'it', name: 'Italian', nativeName: 'Italiano (Tiếng Ý)', code: 'it', flag: '🇮🇹', flagUrl: 'https://flagcdn.com/w80/it.png',
    difficulty: 'medium', totalLessons: 480, totalLearners: 650000,
    description: 'Nghệ thuật, ẩm thực, thời trang và phong cách sống la dolce vita tuyệt vời.',
    hasIELTS: false,
    skills: [
      { id: 'it-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'it-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'it-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'it-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'pt', name: 'Portuguese', nativeName: 'Português (Tiếng Bồ Đào Nha)', code: 'pt', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w80/br.png',
    difficulty: 'medium', totalLessons: 480, totalLearners: 700000,
    description: 'Từ Bồ Đào Nha đến Brazil — ngôn ngữ toàn cầu đầy sức sống.',
    hasIELTS: false,
    skills: [
      { id: 'pt-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'pt-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'pt-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'pt-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'ru', name: 'Russian', nativeName: 'Русский (Tiếng Nga)', code: 'ru', flag: '🇷🇺', flagUrl: 'https://flagcdn.com/w80/ru.png',
    difficulty: 'hard', totalLessons: 480, totalLearners: 800000,
    description: 'Văn học, khoa học và thế giới văn hóa Nga bao la kỳ vĩ.',
    hasIELTS: false,
    skills: [
      { id: 'ru-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ru-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ru-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ru-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', code: 'vi', flag: '🇻🇳', flagUrl: 'https://flagcdn.com/w80/vn.png',
    difficulty: 'hard', totalLessons: 480, totalLearners: 400000,
    description: 'Vẻ đẹp thanh điệu, văn hóa phong phú và nền ẩm thực Việt Nam tuyệt vời!',
    hasIELTS: false,
    skills: [
      { id: 'vi-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'vi-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'vi-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'vi-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'th', name: 'Thai', nativeName: 'ภาษาไทย (Tiếng Thái)', code: 'th', flag: '🇹🇭', flagUrl: 'https://flagcdn.com/w80/th.png',
    difficulty: 'hard', totalLessons: 480, totalLearners: 350000,
    description: 'Đất nước của những nụ cười, điệu múa và văn hóa xứ Chùa Vàng xinh đẹp.',
    hasIELTS: false,
    skills: [
      { id: 'th-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'th-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'th-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'th-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
  {
    id: 'ar', name: 'Arabic', nativeName: 'العربية (Tiếng Ả Rập)', code: 'ar', flag: '🇸🇦', flagUrl: 'https://flagcdn.com/w80/sa.png',
    difficulty: 'expert', totalLessons: 480, totalLearners: 600000,
    description: 'Một trong những ngôn ngữ cổ xưa và có chữ viết nghệ thuật đẹp nhất thế giới.',
    hasIELTS: false,
    skills: [
      { id: 'ar-listen', name: 'listening', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ar-speak', name: 'speaking', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ar-read', name: 'reading', progress: 0, totalLessons: 120, completedLessons: 0 },
      { id: 'ar-write', name: 'writing', progress: 0, totalLessons: 120, completedLessons: 0 },
    ],
  },
];
