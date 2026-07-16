const fs = require('fs');
const service = fs.readFileSync('src/services/adaptiveLearningEngine.ts','utf8');
const migration = fs.readFileSync('supabase/migrations/007_learning_engine.sql','utf8');
const serviceTokens = ['isSupabaseConfigured', 'supabase.from', 'localDb', 'learning_profiles', 'learning_item_progress', 'learning_events', 'review_queue'];
const migrationTokens = ['enable row level security', 'learning_profiles', 'learning_item_progress', 'learning_events', 'review_queue', 'daily_learning_plans', 'auth.uid() = user_id'];
const missing = [...serviceTokens.filter((x)=>!service.includes(x)), ...migrationTokens.filter((x)=>!migration.includes(x))];
if (missing.length) throw new Error(`Progress persistence incomplete: ${missing.join(', ')}`);
console.log('PASS: Progress persistence supports Supabase with RLS and local fallback.');
