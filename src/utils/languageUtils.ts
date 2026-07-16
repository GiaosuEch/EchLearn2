export type SupportedLang = 'en' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'es' | 'it' | 'pt' | 'ru' | 'vi' | 'th' | 'ar';

export const supportedLanguages: { id: SupportedLang; name: string; nativeName: string; flag: string; ttsLocale: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', ttsLocale: 'en-US' },
  { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', ttsLocale: 'fr-FR' },
  { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', ttsLocale: 'de-DE' },
  { id: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', ttsLocale: 'zh-CN' },
  { id: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', ttsLocale: 'ja-JP' },
  { id: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', ttsLocale: 'ko-KR' },
  { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', ttsLocale: 'es-ES' },
  { id: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', ttsLocale: 'it-IT' },
  { id: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', ttsLocale: 'pt-PT' },
  { id: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', ttsLocale: 'ru-RU' },
  { id: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', ttsLocale: 'vi-VN' },
  { id: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', ttsLocale: 'th-TH' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', ttsLocale: 'ar-SA' },
];

export function normalizeLanguage(lang?: string): SupportedLang {
  const base = String(lang || 'en').split('-')[0].toLowerCase();
  return (supportedLanguages.some(l => l.id === base) ? base : 'en') as SupportedLang;
}

export function getLanguageMeta(lang?: string) {
  const id = normalizeLanguage(lang);
  return supportedLanguages.find(l => l.id === id) || supportedLanguages[0];
}

export function stripBadPrefixes(value: string): string {
  return String(value || '')
    .replace(/^meaning\s*:\s*/i, '')
    .replace(/^nghĩa\s*:\s*/i, '')
    .replace(/^n\/a$/i, '')
    .trim();
}

export function cleanText(value: unknown): string {
  if (value == null) return '';
  return stripBadPrefixes(String(value).replace(/\s+/g, ' ').trim());
}

export function isBadLearningText(value: unknown, targetWord?: string): boolean {
  const text = cleanText(value);
  if (!text) return true;
  if (/^(n\/a|missing meaning|undefined|null)$/i.test(text)) return true;
  if (/^\w{2}Word\d+$/i.test(text)) return true;
  if (/^word\s*\d+$/i.test(text)) return true;
  if (/here is an example sentence using the word/i.test(text)) return true;
  const target = cleanText(targetWord).toLocaleLowerCase();
  if (target && text.toLocaleLowerCase() === target) return true;
  return false;
}

export function displayLearningWord(item: any): string {
  return cleanText(item?.nativeScript) || cleanText(item?.word) || cleanText(item?.text) || cleanText(item?.label);
}

export function getMeaningForNativeLanguage(item: any, nativeLanguage?: string, targetWord?: string): string {
  const native = normalizeLanguage(nativeLanguage);
  const candidates = native === 'vi'
    ? [item?.meaningVietnamese, item?.translation, item?.meaningEnglish, item?.meaning, item?.label, item?.text]
    : native === 'en'
      ? [item?.meaningEnglish, item?.meaningVietnamese, item?.translation, item?.meaning, item?.label, item?.text]
      : [item?.[`meaning${native.toUpperCase()}`], item?.meaningVietnamese, item?.meaningEnglish, item?.translation, item?.meaning, item?.label, item?.text];
  for (const candidate of candidates) {
    const text = cleanText(candidate);
    if (!isBadLearningText(text, targetWord)) return text;
  }
  return '';
}

export function uniqueStable(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values.map(cleanText)) {
    const key = value.toLocaleLowerCase();
    if (value && !seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function fallbackMeanings(nativeLanguage?: string): string[] {
  const native = normalizeLanguage(nativeLanguage);
  const map: Record<string, string[]> = {
    vi: ['một người bạn', 'một địa điểm', 'một hành động', 'một đồ vật', 'một cảm xúc', 'một thời điểm'],
    en: ['a friend', 'a place', 'an action', 'an object', 'a feeling', 'a time'],
    es: ['un amigo', 'un lugar', 'una acción', 'un objeto', 'un sentimiento', 'un momento'],
    de: ['ein Freund', 'ein Ort', 'eine Handlung', 'ein Gegenstand', 'ein Gefühl', 'eine Zeit'],
    fr: ['un ami', 'un lieu', 'une action', 'un objet', 'un sentiment', 'un moment'],
    ja: ['友達', '場所', '行動', '物', '気持ち', '時間'],
    ko: ['친구', '장소', '행동', '물건', '감정', '시간'],
    zh: ['朋友', '地点', '动作', '物品', '感觉', '时间'],
  };
  return map[native] || map.en;
}
