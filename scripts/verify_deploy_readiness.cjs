#!/usr/bin/env node
const fs = require('fs');
const failures = [];
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts?.build || !pkg.scripts?.dev) failures.push('package.json must include dev and build scripts.');
if (!pkg.scripts?.['verify:phase18']) failures.push('package.json must include verify:phase18.');
if (!pkg.scripts?.['verify:all']) failures.push('package.json must include verify:all.');
const netlify = fs.existsSync('netlify.toml') ? fs.readFileSync('netlify.toml', 'utf8') : '';
const redirects = fs.existsSync('public/_redirects') ? fs.readFileSync('public/_redirects', 'utf8') : '';
if (!/publish\s*=\s*"dist"/.test(netlify)) failures.push('netlify.toml must publish dist.');
if (!/to\s*=\s*"\/index\.html"/.test(netlify) && !redirects.includes('/* /index.html 200')) failures.push('SPA redirect to index.html is missing.');
for (const doc of ['docs/DEPLOYMENT_NETLIFY.md','docs/SUPABASE_PRODUCTION_SETUP.md','docs/PHASE_18_PRODUCTION_QA_DEPLOY_READINESS_REPORT.md']) {
  if (!fs.existsSync(doc)) failures.push(`Missing deploy/readiness doc ${doc}`);
}
const env = fs.existsSync('.env.example') ? fs.readFileSync('.env.example','utf8') : '';
if (!env.includes('VITE_SUPABASE_URL') || !env.includes('VITE_SUPABASE_ANON_KEY')) failures.push('.env.example missing Supabase public env vars.');
if (/(SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|JWT_SECRET)\s*=/.test(env)) failures.push('.env.example exposes server secret variables.');
if (failures.length) { console.error('FAIL verify_deploy_readiness'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log('PASS: deploy readiness contract is present.');
