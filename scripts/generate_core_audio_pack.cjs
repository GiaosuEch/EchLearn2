#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = process.cwd();
const outRoot = path.join(root, 'public/audio/core');
const manifestPath = path.join(root, 'public/audio/audio-manifest.json');

const espeakVoices = {
  en: 'en-us',
  fr: 'fr-fr',
  de: 'de',
  zh: 'zh',
  es: 'es',
  it: 'it',
  pt: 'pt-pt',
  ru: 'ru',
  vi: 'vi',
};

const fallbackLanguages = ['ja', 'ko', 'th', 'ar'];

const phrases = {
  en: ['Hello', 'Thank you', 'coffee', 'Where is the station?', 'I would like coffee and water.', 'fast', 'music', 'listen'],
  fr: ['Bonjour', 'Merci', 'café', 'Où est la gare ?', 'Je voudrais un café et de l’eau.', 'rapide', 'musique', 'écouter'],
  de: ['Hallo', 'Danke', 'Kaffee', 'Wo ist der Bahnhof?', 'Ich möchte Kaffee und Wasser.', 'schnell', 'Musik', 'hören'],
  zh: ['你好', '谢谢', '咖啡', '车站在哪里？', '我想要咖啡和水。', '快', '音乐', '听'],
  es: ['Hola', 'Gracias', 'café', '¿Dónde está la estación?', 'Quiero café y agua.', 'rápido', 'música', 'escuchar'],
  it: ['Ciao', 'Grazie', 'caffè', 'Dov’è la stazione?', 'Vorrei un caffè e acqua.', 'veloce', 'musica', 'ascoltare'],
  pt: ['Olá', 'Obrigado', 'café', 'Onde fica a estação?', 'Quero café e água.', 'rápido', 'música', 'ouvir'],
  ru: ['Здравствуйте', 'Спасибо', 'кофе', 'Где вокзал?', 'Я хочу кофе и воду.', 'быстрый', 'музыка', 'слушать'],
  vi: ['Xin chào', 'Cảm ơn', 'cà phê', 'Nhà ga ở đâu?', 'Tôi muốn cà phê và nước.', 'nhanh', 'âm nhạc', 'nghe', 'cảm giác', 'khác', 'đồng nghĩa'],
};

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42)
    .toLowerCase() || 'audio';
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function getDurationMs(wavPath) {
  try {
    const buffer = fs.readFileSync(wavPath);
    // PCM WAV: sample rate at byte 24, byte rate at 28, data size at 40 for normal espeak output.
    const byteRate = buffer.readUInt32LE(28);
    const dataSize = buffer.readUInt32LE(40);
    return Math.round((dataSize / byteRate) * 1000);
  } catch {
    return undefined;
  }
}

ensureDir(outRoot);
const entries = [];

for (const [lang, voice] of Object.entries(espeakVoices)) {
  const langDir = path.join(outRoot, lang);
  ensureDir(langDir);
  const seen = new Set();
  for (const text of phrases[lang]) {
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const fileName = `${slugify(text)}.wav`;
    const filePath = path.join(langDir, fileName);
    try {
      execFileSync('espeak', ['-v', voice, '-s', '135', '-w', filePath, text], { stdio: 'ignore' });
    } catch (error) {
      console.error(`Could not generate ${lang} audio for ${text}: ${error.message}`);
      continue;
    }
    entries.push({
      id: `${lang}_${slugify(text)}`,
      lang,
      text,
      path: `/audio/core/${lang}/${fileName}`,
      kind: text.length > 16 ? 'sentence' : 'word',
      source: `local-espeak-${voice}`,
      durationMs: getDurationMs(filePath),
    });
  }
}

const manifest = {
  version: 'phase14-core-audio-v1',
  generatedAt: new Date().toISOString(),
  note: 'Starter static audio pack. If an entry is missing, the app falls back to browser SpeechSynthesis. Japanese, Korean, Thai and Arabic are intentionally left to browser/cloud TTS until a licensed audio pack is added.',
  supportedFileLanguages: Object.keys(espeakVoices),
  fallbackLanguages,
  entries,
};

ensureDir(path.dirname(manifestPath));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Generated ${entries.length} static audio files.`);
console.log(`Manifest: ${path.relative(root, manifestPath)}`);
