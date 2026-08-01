import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const listeningPage = readFileSync(new URL('../../src/pages/app/practice/ListeningPracticePage.tsx', import.meta.url), 'utf8');
const lofiPlayer = readFileSync(new URL('../../src/components/audio/JapaneseLofiPlayer.tsx', import.meta.url), 'utf8');

test('listening roadmap renders a bounded task page with accessible page navigation', () => {
  assert.match(listeningPage, /const TASKS_PER_PAGE = 12;/);
  assert.match(listeningPage, /const visibleTasks = filtered\.slice\(pageStart, pageStart \+ TASKS_PER_PAGE\);/);
  assert.match(listeningPage, /\{visibleTasks\.map\(/);
  assert.doesNotMatch(listeningPage, /\{filtered\.map\(/);
  assert.match(listeningPage, /aria-label="Previous listening tasks"/);
  assert.match(listeningPage, /aria-label="Next listening tasks"/);
});

test('listening task accurately discloses text-to-speech and labels playback controls', () => {
  assert.doesNotMatch(listeningPage, /Native Listening Practice Guide|giọng đọc bản xứ|native audio speech/i);
  assert.match(listeningPage, /Text-to-speech listening practice/);
  assert.match(listeningPage, /aria-label=\{isSpeaking \? 'Pause text-to-speech audio' : 'Play text-to-speech audio'\}/);
  assert.match(listeningPage, /aria-label="Stop text-to-speech audio"/);
});

test('lofi music stops and stays suppressed while a listening task is active', () => {
  assert.match(lofiPlayer, /window\.addEventListener\('echlern:listening-task-activity', handleListeningTaskActivity\)/);
  assert.match(lofiPlayer, /audioRef\.current\?\.pause\(\)/);
  assert.match(lofiPlayer, /setIsPlaying\(false\)/);
  assert.match(lofiPlayer, /if \(isListeningTaskActive\) return null;/);
  assert.match(lofiPlayer, /aria-label=\{isPlaying \? 'Pause lofi music' : 'Play lofi music'\}/);
});

test('listening practice keeps video resources as external links, not embedded players', () => {
  assert.match(listeningPage, /target="_blank" rel="noreferrer"/);
  assert.doesNotMatch(listeningPage, /<iframe\b/i);
});
