// Vocabulary is now loaded dynamically via vocabularyService
import { speaking as frSpeak } from './languages/fr/speaking';
import { speaking as deSpeak } from './languages/de/speaking';
import { speaking as zhSpeak } from './languages/zh/speaking';
import { speaking as jaSpeak } from './languages/ja/speaking';
import { speaking as koSpeak } from './languages/ko/speaking';
import { speaking as esSpeak } from './languages/es/speaking';
import { speaking as itSpeak } from './languages/it/speaking';
import { speaking as ptSpeak } from './languages/pt/speaking';
import { speaking as ruSpeak } from './languages/ru/speaking';
import { speaking as viSpeak } from './languages/vi/speaking';
import { speaking as thSpeak } from './languages/th/speaking';
import { speaking as arSpeak } from './languages/ar/speaking';

import { writing as frWrite } from './languages/fr/writing';
import { writing as deWrite } from './languages/de/writing';
import { writing as zhWrite } from './languages/zh/writing';
import { writing as jaWrite } from './languages/ja/writing';
import { writing as koWrite } from './languages/ko/writing';
import { writing as esWrite } from './languages/es/writing';
import { writing as itWrite } from './languages/it/writing';
import { writing as ptWrite } from './languages/pt/writing';
import { writing as ruWrite } from './languages/ru/writing';
import { writing as viWrite } from './languages/vi/writing';
import { writing as thWrite } from './languages/th/writing';
import { writing as arWrite } from './languages/ar/writing';

import { speakingPrompts as ieltsSpeaking } from './speakingPrompts';
import { writingPrompts as ieltsWriting } from './writingPrompts';

export const speakingRegistry: Record<string, any[]> = {
  'en': [...ieltsSpeaking.filter(p => !p.tags.includes('ielts')), ...ieltsSpeaking.filter(p => p.tags.includes('ielts'))],
  'en-US': [...ieltsSpeaking.filter(p => !p.tags.includes('ielts')), ...ieltsSpeaking.filter(p => p.tags.includes('ielts'))],
  'fr': frSpeak, 'fr-FR': frSpeak,
  'de': deSpeak, 'de-DE': deSpeak,
  'zh': zhSpeak, 'zh-CN': zhSpeak,
  'ja': jaSpeak, 'ja-JP': jaSpeak,
  'ko': koSpeak, 'ko-KR': koSpeak,
  'es': esSpeak, 'es-ES': esSpeak,
  'it': itSpeak, 'it-IT': itSpeak,
  'pt': ptSpeak, 'pt-BR': ptSpeak,
  'ru': ruSpeak, 'ru-RU': ruSpeak,
  'vi': viSpeak, 'vi-VN': viSpeak,
  'th': thSpeak, 'th-TH': thSpeak,
  'ar': arSpeak, 'ar-SA': arSpeak,
};

export const writingRegistry: Record<string, any[]> = {
  'en': [...ieltsWriting.filter(p => !p.tags.includes('ielts')), ...ieltsWriting.filter(p => p.tags.includes('ielts'))],
  'en-US': [...ieltsWriting.filter(p => !p.tags.includes('ielts')), ...ieltsWriting.filter(p => p.tags.includes('ielts'))],
  'fr': frWrite, 'fr-FR': frWrite,
  'de': deWrite, 'de-DE': deWrite,
  'zh': zhWrite, 'zh-CN': zhWrite,
  'ja': jaWrite, 'ja-JP': jaWrite,
  'ko': koWrite, 'ko-KR': koWrite,
  'es': esWrite, 'es-ES': esWrite,
  'it': itWrite, 'it-IT': itWrite,
  'pt': ptWrite, 'pt-BR': ptWrite,
  'ru': ruWrite, 'ru-RU': ruWrite,
  'vi': viWrite, 'vi-VN': viWrite,
  'th': thWrite, 'th-TH': thWrite,
  'ar': arWrite, 'ar-SA': arWrite,
};


export function getSpeakingForLanguage(langId: string) {
  const baseLanguage = langId.split('-')[0];
  
  const registry = speakingRegistry[langId] || speakingRegistry[baseLanguage];
  if (registry && registry.length > 0) {
    return registry;
  }
  
  // Fallback if missing
  return ieltsSpeaking.filter(p => !p.tags.includes('ielts')).map((p: any) => ({
    ...p,
    id: `${baseLanguage}_${p.id}`,
    title: `${p.title || p.topic} (${baseLanguage.toUpperCase()})`,
    prompt: p.prompt
  }));
}

export function getWritingForLanguage(langId: string) {
  const baseLanguage = langId.split('-')[0];
  
  const registry = writingRegistry[langId] || writingRegistry[baseLanguage];
  if (registry && registry.length > 0) {
    return registry;
  }
  
  // Fallback if missing
  return ieltsWriting.filter(p => !p.tags.includes('ielts')).map(p => ({
    ...p,
    id: `${baseLanguage}_${p.id}`,
    title: p.topic,
    topic: p.topic,
    prompt: p.prompt
  }));
}
