#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const envFiles = ['.env', '.env.local', '.env.production'].map((file) => path.join(root, file)).filter(fs.existsSync);
const env = {};
for (const file of envFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const forbiddenKeys = Object.keys(env).filter((name) => /SUPABASE_SERVICE_ROLE|SERVICE_ROLE|DATABASE_URL|JWT_SECRET/i.test(name));

if (forbiddenKeys.length) {
  console.error(`FAIL: Forbidden secret-like frontend env var(s): ${forbiddenKeys.join(', ')}`);
  process.exit(1);
}

if (!url && !key) {
  console.log('PASS: Supabase env is absent; app will use local MVP mode. Production must set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(0);
}

if (!url || !key) {
  console.error('FAIL: Partial Supabase env. Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or leave both blank for local mode.');
  process.exit(1);
}

if (url.includes('/rest/v1')) {
  console.error('FAIL: VITE_SUPABASE_URL must be the base project URL only, not /rest/v1.');
  process.exit(1);
}

try {
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('bad protocol');
} catch {
  console.error('FAIL: VITE_SUPABASE_URL is not a valid URL.');
  process.exit(1);
}

if (/service[_-]?role/i.test(key)) {
  console.error('FAIL: VITE_SUPABASE_ANON_KEY appears to be a service role key. Never expose it in frontend.');
  process.exit(1);
}

console.log('PASS: Supabase env shape is valid for frontend production mode.');
