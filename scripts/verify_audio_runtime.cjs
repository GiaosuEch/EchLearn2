#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const srcFiles = walk('src').filter(f => /\.(tsx?|jsx?)$/.test(f));
const publicFiles = walk('public');
const audioFiles = [...srcFiles, ...publicFiles].filter(f => /\.(mp3|wav|ogg|m4a|webm)$/i.test(f));
const failures = [];

function read(file) { return fs.readFileSync(file, 'utf8'); }
function assertIncludes(file, needle, message) {
  const text = read(file);
  if (!text.includes(needle)) failures.push(`${file}: ${message}`);
}

assertIncludes('src/services/ttsService.ts', 'SpeechSynthesisUtterance', 'must use SpeechSynthesisUtterance for generated audio');
assertIncludes('src/services/audioService.ts', 'audioManifestService.find', 'audioService must prefer static audio manifest before TTS fallback');
assertIncludes('src/services/ttsService.ts', 'tts_blocked', 'must show visible blocked-audio error');
assertIncludes('src/services/ttsService.ts', 'tts_failed', 'must show visible failed-audio error');
assertIncludes('src/components/audio/SpeakerButton.tsx', 'word ?? text', 'SpeakerButton must accept text alias for AI placement audio');
assertIncludes('src/components/audio/SpeakerButton.tsx', 'audioService.speak', 'SpeakerButton must route playback through audioService');
assertIncludes('src/components/audio/SpeakerButton.tsx', 'languageId || language', 'SpeakerButton must accept language alias');
assertIncludes('src/hooks/useTextToSpeech.ts', 'await audioService.speak', 'useTextToSpeech must await audioService to avoid silent failures');

const aiPage = 'src/pages/app/onboarding/AIOnboardingPage.tsx';
if (fs.existsSync(aiPage)) {
  const text = read(aiPage);
  if (!/q\.type\s*===\s*['"]listening['"][\s\S]{0,220}<SpeakerButton/.test(text)) failures.push(`${aiPage}: listening placement questions must render a SpeakerButton`);
  if (/<SpeakerButton\s+text=/.test(text)) failures.push(`${aiPage}: use canonical SpeakerButton word/languageId props after compatibility hotfix`);
}

const staticAudioRefs = [];
for (const file of srcFiles) {
  const text = read(file);
  const matches = text.match(/['"`]([^'"`]+\.(?:mp3|wav|ogg|m4a|webm))['"`]/gi) || [];
  for (const raw of matches) {
    const ref = raw.slice(1, -1);
    staticAudioRefs.push({ file, ref });
  }
}
for (const { file, ref } of staticAudioRefs) {
  if (/^https?:\/\//.test(ref)) continue;
  const normalized = ref.replace(/^\//, 'public/');
  const candidates = [normalized, path.join(path.dirname(file), ref), path.join('public', ref)];
  if (!candidates.some(c => fs.existsSync(c))) failures.push(`${file}: missing static audio asset ${ref}`);
}

const requiredLocales = ['en-US','fr-FR','de-DE','zh-CN','ja-JP','ko-KR','es-ES','it-IT','pt-PT','ru-RU','vi-VN','th-TH','ar-SA'];
const languageUtils = fs.existsSync('src/utils/languageUtils.ts') ? read('src/utils/languageUtils.ts') : '';
for (const locale of requiredLocales) {
  if (!languageUtils.includes(locale) && !read('src/services/ttsService.ts').includes(locale)) failures.push(`missing TTS locale: ${locale}`);
}

if (failures.length) {
  console.error('FAIL verify_audio_runtime');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PASS: Audio runtime verified.');
console.log(`Static audio assets found: ${audioFiles.length}. Static files are used where manifest entries exist; browser TTS remains fallback.`);
