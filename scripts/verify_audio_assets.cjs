#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const manifestPath = path.join('public', 'audio', 'audio-manifest.json');
const failures = [];
if (!fs.existsSync(manifestPath)) failures.push('missing public/audio/audio-manifest.json');
let manifest = { entries: [], supportedFileLanguages: [], fallbackLanguages: [] };
if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const requiredFileLangs = ['en','fr','de','zh','es','it','pt','ru','vi'];
for (const lang of requiredFileLangs) {
  if (!manifest.supportedFileLanguages?.includes(lang)) failures.push(`manifest missing static file language: ${lang}`);
  const count = (manifest.entries || []).filter(e => e.lang === lang).length;
  if (count < 100) failures.push(`${lang}: expected at least 100 static audio entries, got ${count}`);
}
for (const lang of ['ja','ko','th','ar']) {
  if (!manifest.fallbackLanguages?.includes(lang)) failures.push(`manifest should declare browser/cloud TTS fallback language: ${lang}`);
}
for (const entry of manifest.entries || []) {
  if (!entry.lang || !entry.text || !entry.path) failures.push(`invalid manifest entry: ${JSON.stringify(entry)}`);
  const local = entry.path.replace(/^\//, 'public/');
  if (!fs.existsSync(local)) failures.push(`missing audio file: ${entry.path}`);
  else if (fs.statSync(local).size < 1000) failures.push(`audio file too small: ${entry.path}`);
}

const audioService = fs.readFileSync('src/services/audioService.ts','utf8');
if (!audioService.includes('audioManifestService.find')) failures.push('audioService must check static audio manifest before TTS fallback');
if (!audioService.includes('falling back to browser TTS')) failures.push('audioService must log fallback to browser TTS if file fails');
const speaker = fs.readFileSync('src/components/audio/SpeakerButton.tsx','utf8');
if (!speaker.includes('audioService.speak')) failures.push('SpeakerButton must use audioService, not raw ttsService');

if (failures.length) {
  console.error('FAIL verify_audio_assets');
  failures.slice(0,100).forEach(f => console.error('-', f));
  process.exit(1);
}
console.log(`PASS: ${manifest.entries.length} static audio manifest entries verified; unsupported file languages use TTS fallback.`);
