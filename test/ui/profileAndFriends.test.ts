import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const friendsPage = readFileSync(new URL('../../src/pages/app/community/FriendsPage.tsx', import.meta.url), 'utf8');
const communityService = readFileSync(new URL('../../src/services/communitySupabaseService.ts', import.meta.url), 'utf8');
const profilePage = readFileSync(new URL('../../src/pages/app/profile/ProfilePage.tsx', import.meta.url), 'utf8');

test('friends show a learner identity, never their email address or internal id', () => {
  assert.doesNotMatch(friendsPage, /\{u\.email\}/);
  assert.doesNotMatch(friendsPage, /ID:\s*\{u\.id\}/);
  assert.match(friendsPage, /\{u\.displayName \|\|/);
  assert.match(friendsPage, /\{u\.avatarUrl \?/);
});

test('friend requests use persisted connections rather than fabricated friends', () => {
  assert.match(communityService, /localDb\.getTable<[^>]*>\('friends'\)/);
  assert.doesNotMatch(communityService, /friend_001/);
  assert.doesNotMatch(communityService, /friend_002/);
  assert.match(communityService, /async respondToFriendRequest/);
});

test('profile and friends use the same customized avatar and display name fields', () => {
  assert.match(profilePage, /user\?\.avatarUrl/);
  assert.match(profilePage, /user\?\.displayName/);
  assert.match(communityService, /displayName:\s*(?:profile\.)?displayName/);
  assert.match(communityService, /avatarUrl:\s*(?:profile\.)?avatarUrl/);
});
