#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const failures = [];
const manifestPath = path.join('public', 'audio', 'audio-manifest.json');
if (!fs.existsSync(manifestPath)) failures.push('missing audio manifest');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { entries: [] };
const supported = ['en','fr','de','zh','es','it','pt','ru','vi'];
const fallbackOnly = ['ja','ko','th','ar'];
for (const lang of supported) {
  const skillEntries = (manifest.entries || []).filter(e => e.lang === lang && e.kind === 'listening-task' && e.phase === '15');
  if (skillEntries.length < 100) failures.push(`${lang}: expected at least 100 static listening-task files, got ${skillEntries.length}`);
  const uniqueText = new Set(skillEntries.map(e => String(e.text).toLowerCase().trim()));
  if (uniqueText.size < 100) failures.push(`${lang}: expected at least 100 unique listening-task texts, got ${uniqueText.size}`);
  for (const entry of skillEntries) {
    const local = path.join('public', entry.path.replace(/^\//, ''));
    if (!fs.existsSync(local)) failures.push(`${lang}: missing file ${entry.path}`);
    else if (fs.statSync(local).size < 1000) failures.push(`${lang}: tiny audio file ${entry.path}`);
  }
}
for (const lang of fallbackOnly) {
  if (!manifest.fallbackLanguages?.includes(lang)) failures.push(`${lang}: must be declared fallback-only until real voices are configured`);
}
const viPlacement = (manifest.entries || []).filter(e => e.lang === 'vi' && e.kind === 'placement-test');
if (viPlacement.length < 8) failures.push(`Vietnamese AI placement should have at least 8 static word audio files, got ${viPlacement.length}`);
if (!String(manifest.note || '').includes('not faked')) failures.push('manifest note must be honest that missing languages are not faked');
if (failures.length) {
  console.error('FAIL verify_audio_coverage');
  failures.slice(0, 100).forEach(f => console.error('-', f));
  process.exit(1);
}
console.log(`PASS: static audio coverage verified (${supported.length} supported languages, >=100 unique listening files each, ${viPlacement.length} Vietnamese placement files).`);
