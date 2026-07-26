#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exit(1);
};
const required = (source, token, file) => {
  if (!source.includes(token)) fail(`${file} missing ${token}`);
};
const requiredMatch = (source, pattern, message) => {
  if (!pattern.test(source)) fail(message);
};

const css = read('src/index.css');
const landing = read('src/pages/public/LandingPage.tsx');
const publicLayout = read('src/components/layout/PublicLayout.tsx');
const appLayout = read('src/components/layout/AppLayout.tsx');
const topBar = read('src/components/layout/TopBar.tsx');
const publicShell = `${landing}\n${publicLayout}`;

required(css, '--ech-canvas', 'src/index.css');
required(css, '@media (prefers-reduced-motion: reduce)', 'src/index.css');
required(landing, '<h1', 'src/pages/public/LandingPage.tsx');

if (/Local AI Qwen3|cháº¡y trá»±c tiáº¿p trÃªn browser/i.test(landing)) {
  fail('unsupported local-AI landing claim');
}

requiredMatch(publicShell, /href\s*=\s*["']#main-content["']/, 'public skip link is missing');
requiredMatch(publicShell, /<main\s+[^>]*\bid\s*=\s*["']main-content["']/, 'public main target is missing');
requiredMatch(publicShell, /<nav\s+[^>]*\baria-label\s*=\s*["'][^"']+/, 'public navigation must be labelled');
requiredMatch(publicShell, /<button\s+[^>]*\baria-label\s*=\s*["'][^"']+/, 'public mobile menu must be labelled');
requiredMatch(publicShell, /<button\s+[^>]*\baria-controls\s*=\s*["'][^"']+/, 'public mobile menu must identify its controlled menu');
requiredMatch(appLayout, /<main\s+[^>]*\bid\s*=\s*["']app-main["']/, 'AppLayout main target is missing');

const topBarLabels = topBar.match(/\baria-label\s*=/g) || [];
if (topBarLabels.length < 4) fail('TopBar controls must have accessible labels');

for (const forbidden of ['cloudfront.net', 'figma.site']) {
  if (landing.toLowerCase().includes(forbidden)) fail(`landing depends on ${forbidden}`);
}
if (/fetch\s*\(\s*vid\.url\s*\)/i.test(landing)) fail('landing fetches a video URL');
if (/<video\b/i.test(landing)) fail('landing has a video dependency');

console.log('PASS: Atelier UI contract verified.');
