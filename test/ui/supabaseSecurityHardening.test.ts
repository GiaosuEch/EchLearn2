import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const migration = readFileSync(
  new URL('../../supabase/migrations/20260809130000_secure_record_study_day.sql', import.meta.url),
  'utf8',
);

const indexMigration = readFileSync(
  new URL('../../supabase/migrations/20260809133000_add_missing_foreign_key_indexes.sql', import.meta.url),
  'utf8',
);

const licenseMigration = readFileSync(
  new URL('../../supabase/migrations/202608200001_harden_license_redemption.sql', import.meta.url),
  'utf8',
);

const protectedRoomMigration = readFileSync(
  new URL('../../supabase/migrations/202608200002_harden_protected_chat_rooms.sql', import.meta.url),
  'utf8',
);

const licenseService = readFileSync(
  new URL('../../src/services/licenseVerificationService.ts', import.meta.url),
  'utf8',
);

const communityService = readFileSync(
  new URL('../../src/services/communitySupabaseService.ts', import.meta.url),
  'utf8',
);

test('study streak RPC is never callable anonymously', () => {
  assert.match(migration, /revoke all on function public\.record_study_day\(date\) from public, anon;/i);
  assert.match(migration, /grant execute on function public\.record_study_day\(date\) to authenticated;/i);
});

test('hot ownership and community foreign keys have covering indexes', () => {
  assert.match(indexMigration, /create index if not exists idx_daily_mission_progress_user_id/i);
  assert.match(indexMigration, /create index if not exists idx_lesson_attempts_user_id/i);
  assert.match(indexMigration, /create index if not exists idx_chat_messages_room_id/i);
  assert.match(indexMigration, /create index if not exists idx_community_posts_author_id/i);
});

test('license redemption is authenticated and server-authoritative', () => {
  assert.match(licenseMigration, /v_user_id is null[\s\S]*authentication required/i);
  assert.match(licenseMigration, /update public\.profiles[\s\S]*subscription_tier = v_lic\.plan/i);
  assert.match(licenseMigration, /revoke all on function public\.redeem_license\(text, text\) from public, anon/i);
  assert.match(licenseMigration, /private\.is_giaosuech_admin\(\)/i);
  assert.doesNotMatch(licenseService, /fallback to local entitlement grant/i);
  assert.match(licenseService, /session\.user\.id !== userId/i);
  assert.match(licenseService, /key: maskLicenseKey\(keyString\)/i);
});

test('protected chat rooms verify passwords in an authenticated RPC', () => {
  assert.match(protectedRoomMigration, /extensions\.crypt\(p_password, v_password_hash\)/i);
  assert.match(protectedRoomMigration, /drop policy if exists "Users can join rooms"/i);
  assert.match(protectedRoomMigration, /grant execute on function public\.join_chat_room\(uuid, text\) to authenticated/i);
  assert.match(communityService, /supabase\.rpc\('join_chat_room'/i);
  assert.doesNotMatch(communityService, /Joining protected room/i);
});
