#!/usr/bin/env node
const fs = require('fs');
const failures = [];
const supabase = fs.readFileSync('src/lib/supabase.ts', 'utf8');
const env = fs.existsSync('.env.example') ? fs.readFileSync('.env.example', 'utf8') : '';
if (!supabase.includes('getBackendMode')) failures.push('supabase.ts must expose getBackendMode().');
if (!supabase.includes('isSupabaseConfigured')) failures.push('supabase.ts must expose isSupabaseConfigured().');
if (!supabase.includes('/rest/v1')) failures.push('supabase.ts must reject URLs that include /rest/v1.');
if (!/service[_-]?role/i.test(supabase)) failures.push('supabase.ts must explicitly reject service role keys.');
if (/(SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|JWT_SECRET)\s*=/.test(env)) failures.push('.env.example must not define server secret variables.');
if (!env.includes('VITE_SUPABASE_URL') || !env.includes('VITE_SUPABASE_ANON_KEY')) failures.push('.env.example must include VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
for (let i = 0; i <= 8; i += 1) {
  const prefix = String(i).padStart(3, '0');
  const exists = fs.readdirSync('supabase/migrations').some(name => name.startsWith(prefix + '_'));
  if (!exists) failures.push(`Missing Supabase migration ${prefix}_*.sql`);
}
const migrations = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).map(f => fs.readFileSync(`supabase/migrations/${f}`, 'utf8')).join('\n');
if (!/enable row level security/i.test(migrations)) failures.push('Migrations must enable RLS.');
if (!/auth\.uid\(\)/.test(migrations)) failures.push('RLS policies must use auth.uid().');
if (failures.length) { console.error('FAIL verify_supabase_runtime_contract'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log('PASS: Supabase production/local runtime contract is safe.');
