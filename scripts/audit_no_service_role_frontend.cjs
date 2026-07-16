#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const scanDirs = ['src', 'public'];
const scanFiles = ['.env.example', 'netlify.toml', 'vite.config.ts', 'package.json'];
const forbidden = [/SUPABASE_SERVICE_ROLE_KEY\s*=/i, /service_role\s*[:=]/i, /sk-[A-Za-z0-9_-]{20,}/, /DATABASE_URL\s*=/i, /JWT_SECRET\s*=/i];
const matches = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = [
  ...scanDirs.flatMap((dir) => walk(path.join(root, dir))),
  ...scanFiles.map((file) => path.join(root, file)).filter(fs.existsSync),
];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  forbidden.forEach((pattern) => {
    if (pattern.test(text)) matches.push(`${path.relative(root, file)} -> ${pattern}`);
  });
}

if (matches.length) {
  console.error('FAIL: frontend contains secret/service-role-looking content:');
  matches.forEach((m) => console.error(`- ${m}`));
  process.exit(1);
}

console.log('PASS: no service role/DATABASE/JWT secret found in frontend files.');
