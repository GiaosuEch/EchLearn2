import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en';
import vi from './locales/vi';
// Import other languages...
import fr from './locales/fr';
import de from './locales/de';
import zh from './locales/zh';
import ja from './locales/ja';
import ko from './locales/ko';
import es from './locales/es';
import it from './locales/it';
import pt from './locales/pt';
import ru from './locales/ru';
import th from './locales/th';
import ar from './locales/ar';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  fr: { translation: fr },
  de: { translation: de },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  th: { translation: th },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
