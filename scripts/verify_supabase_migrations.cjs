#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const requiredFiles = ['000_init.sql', '001_profiles.sql', '002_progress.sql', '003_social.sql', '004_chat_rooms.sql', '005_ielts_attempts.sql'];
const requiredTables = ['profiles', 'user_settings', 'user_progress', 'lesson_attempts', 'vocabulary_mastery', 'xp_events', 'friends', 'chat_rooms', 'chat_room_members', 'chat_messages', 'voice_rooms', 'voice_room_participants', 'ielts_attempts'];
const requiredPolicyPhrases = ['enable row level security', 'auth.uid()', 'profiles update own', 'settings update own', 'friends read involved', 'chat messages send members', 'ielts attempts read own'];
const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(dir, file))) errors.push(`Missing migration ${file}`);
}

const sql = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n').toLowerCase()
  : '';

for (const table of requiredTables) {
  if (!sql.includes(`table if not exists public.${table}`) && !sql.includes(`table ${table}`)) errors.push(`Missing table definition: ${table}`);
}
for (const phrase of requiredPolicyPhrases) {
  if (!sql.includes(phrase.toLowerCase())) errors.push(`Missing RLS/policy marker: ${phrase}`);
}
if (/service_role|supabase_service_role_key|database_url|jwt_secret/i.test(sql)) {
  errors.push('Migrations or comments include secret names that should not be part of frontend setup docs.');
}

if (errors.length) {
  console.error('FAIL: Supabase migration verification failed:');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log('PASS: Supabase migrations include required production tables and RLS markers.');
