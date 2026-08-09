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
