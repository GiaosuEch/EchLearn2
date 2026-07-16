#!/usr/bin/env node
/**
 * Generate Phase 15 static WAV starter pack for eSpeak-supported languages.
 * This is intentionally owner/developer tooling. It does not fake unsupported voices.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/services/targetLanguageContent.ts'), 'utf8');
const manifestPath = path.join(root, 'public/audio/audio-manifest.json');
const voiceMap = { en: 'en-us', fr: 'fr-fr', de: 'de', zh: 'zh', es: 'es', it: 'it', pt: 'pt-br', ru: 'ru', vi: 'vi' };
const fallbackLanguages = ['ja', 'ko', 'th', 'ar'];
const COUNT = 120;

function langBlock(lang) {
  const marker = `  ${lang}: [`;
  const start = source.indexOf(marker);
  const end = source.indexOf('\n  ],', start);
  if (start < 0 || end < 0) throw new Error(`Cannot locate phrase bank for ${lang}`);
  return source.slice(start + marker.length, end);
}
function targets(lang) {
  const block = langBlock(lang);
  const re = /target:\s*'((?:\\'|[^'])*)'/g;
  const result = [];
  let match;
  while ((match = re.exec(block))) result.push(match[1].replace(/\\'/g, "'"));
  if (result.length < 12) throw new Error(`Too few target phrases for ${lang}`);
  return result;
}
function slug(text, index) {
  const ascii = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 38);
  return `${String(index + 1).padStart(3, '0')}-${ascii}`;
}
function manifestKey(entry) {
  return `${String(entry.lang).split('-')[0].toLowerCase()}::${String(entry.text).normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase()}`;
}
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

const existing = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { entries: [] };
const map = new Map((existing.entries || []).filter(e => e.phase !== '15' && e.kind !== 'listening-task').map(e => [manifestKey(e), e]));
let created = 0;
for (const [lang, voice] of Object.entries(voiceMap)) {
  const phrases = targets(lang);
  const dir = path.join(root, 'public/audio/skill', lang);
  ensureDir(dir);
  for (let i = 0; i < COUNT; i++) {
    const a = phrases[i % phrases.length];
    const b = phrases[(i * 7 + 5) % phrases.length];
    const c = phrases[(i * 11 + Math.floor(i / phrases.length) + 9) % phrases.length];
    const text = [a, b, c].join(' ').normalize('NFC').replace(/\s+/g, ' ').trim();
    const rel = `/audio/skill/${lang}/${slug(text, i)}.wav`;
    const file = path.join(root, 'public', rel);
    if (!fs.existsSync(file)) {
      cp.execFileSync('espeak', ['-v', voice, '-s', lang === 'zh' ? '135' : '145', '-w', file, text], { stdio: 'ignore' });
      created++;
    }
    map.set(`${lang}::${text.toLowerCase()}`, { id: `${lang}_skill_listening_${String(i + 1).padStart(3, '0')}`, lang, text, path: rel, kind: 'listening-task', source: `local-espeak-${voice}`, phase: '15' });
  }
}
const manifest = {
  ...existing,
  version: 'phase15-audio-coverage-v1',
  generatedAt: new Date().toISOString(),
  note: 'Static audio-first starter pack. The app plays matching WAV files first, then browser TTS, then a translated error. Unsupported voice languages are not faked with the wrong voice.',
  supportedFileLanguages: Object.keys(voiceMap),
  fallbackLanguages,
  coverage: {
    targetFilesPerSupportedLanguage: COUNT,
    totalSkillAudioFiles: Object.keys(voiceMap).length * COUNT,
    totalStaticEntries: map.size,
    supportedSkillAudioLanguages: Object.keys(voiceMap),
    fallbackTtsLanguages: fallbackLanguages,
    strategy: 'static skill audio for espeak-supported languages; browser/cloud TTS fallback for Japanese, Korean, Thai, Arabic and any uncovered text',
  },
  entries: Array.from(map.values()).sort((a, b) => String(a.lang).localeCompare(String(b.lang)) || String(a.id).localeCompare(String(b.id))),
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ created, totalEntries: manifest.entries.length, coverage: manifest.coverage }, null, 2));
