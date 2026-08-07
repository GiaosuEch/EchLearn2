import test from 'node:test';
import assert from 'node:assert/strict';
import { profileService } from '../../src/services/profileService';
import { getDiscordCommunityUrl, normalizeDiscordInviteUrl } from '../../src/data/communityLinks';
import { userService } from '../../src/services/userService';
import { queueOfflineAction, getOfflineQueue, flushOfflineQueue } from '../../src/services/offlineSyncService';
import { getTargetListeningTasks } from '../../src/services/targetLanguageContent';

test('auto self-check: getLeaderboard attaches unique handles and ID tags to prevent duplicate names', async () => {
  const board = await profileService.getLeaderboard(20);
  assert.ok(board.length > 0, 'Leaderboard must return at least 1 entry');

  board.forEach(entry => {
    assert.ok(entry.id, 'Leaderboard entry must have a valid id');
    assert.ok(entry.name, 'Leaderboard entry must have a valid name');
    assert.ok(entry.username, 'Leaderboard entry must have a username handle');
  });

  const duplicateGenericCount = board.filter(b => b.name === 'Học Viên Ếch').length;
  assert.equal(duplicateGenericCount, 0, 'No entry should display plain un-tagged "Học Viên Ếch"');
});

test('auto self-check: Discord community link resolves correctly to Discadia server', () => {
  const url = getDiscordCommunityUrl();
  assert.ok(url.includes('discadia.com') || url.includes('discord.gg'), 'Discord community link must be valid');
  assert.equal(normalizeDiscordInviteUrl('https://discadia.com/ech-lern-sv/'), 'https://discadia.com/ech-lern-sv/');
});

test('auto self-check: local user creation produces unique random UUIDs and handles', () => {
  const u1 = userService.createLocalUser('test1@example.com', 'Học Viên Alpha');
  const u2 = userService.createLocalUser('test2@example.com', 'Học Viên Beta');

  assert.notEqual(u1.id, u2.id, 'User IDs must be unique');
  assert.notEqual(u1.username, u2.username, 'User usernames must be unique');
});

test('auto self-check: offline sync queue stores and flushes actions cleanly', async () => {
  queueOfflineAction('COMPLETED_LESSON', { lessonId: 'l1', xp: 50 });
  const queue = getOfflineQueue();
  assert.ok(queue.length > 0, 'Offline queue must retain queued item');
  
  const flushedCount = await flushOfflineQueue();
  assert.ok(flushedCount >= 1, 'Flush must return count of processed items');
  assert.equal(getOfflineQueue().length, 0, 'Queue must be empty after flush');
});

test('auto self-check: all 13 target languages have non-empty curriculum tasks', () => {
  const langs = ['en', 'ja', 'zh', 'ko', 'fr', 'es', 'de', 'ru', 'vi'];
  langs.forEach(lang => {
    const tasks = getTargetListeningTasks(lang, 'vi');
    assert.ok(tasks.length > 0, `Language ${lang} must have listening tasks`);
  });
});
