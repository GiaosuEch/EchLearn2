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
const getMobileMenuButton = (source) => Array.from(source.matchAll(/<button\b[\s\S]*?<\/button>/g))
  .find(([button]) => /setMobileMenu\s*\(/.test(button));

const css = read('src/index.css');
const landing = read('src/pages/public/LandingPage.tsx');
const publicLayout = read('src/components/layout/PublicLayout.tsx');
const appLayout = read('src/components/layout/AppLayout.tsx');
const topBar = read('src/components/layout/TopBar.tsx');
const publicShell = `${landing}\n${publicLayout}`;

required(css, '--ech-canvas', 'src/index.css');
required(css, '@media (prefers-reduced-motion: reduce)', 'src/index.css');
required(landing, '<h1', 'src/pages/public/LandingPage.tsx');

const normalizedLanding = landing.normalize('NFD').replace(/\p{M}/gu, '');
if (/Local AI Qwen3|chay\s+truc\s+tiep\s+tren\s+browser/i.test(normalizedLanding)) {
  fail('unsupported local-AI landing claim');
}

requiredMatch(publicShell, /href\s*=\s*["']#main-content["']/, 'public skip link is missing');
requiredMatch(publicShell, /<main\s+[^>]*\bid\s*=\s*["']main-content["']/, 'public main target is missing');
requiredMatch(publicShell, /<nav\s+[^>]*\baria-label\s*=\s*["'][^"']+/, 'public navigation must be labelled');

const mobileMenuButton = getMobileMenuButton(publicShell);
if (!mobileMenuButton) fail('public mobile menu button is missing');
requiredMatch(mobileMenuButton, /\baria-label\s*=/, 'public mobile menu button must be labelled');
requiredMatch(mobileMenuButton, /\baria-expanded\s*=/, 'public mobile menu button must expose expanded state');
const controlledMenu = mobileMenuButton.match(/\baria-controls\s*=\s*["']([^"']+)["']/);
if (!controlledMenu) fail('public mobile menu button must identify its controlled menu');
const controlledMenuId = controlledMenu[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
requiredMatch(publicShell, new RegExp(`\\bid\\s*=\\s*["']${controlledMenuId}["']`), 'public mobile menu control has no matching element');

requiredMatch(appLayout, /<main\s+[^>]*\bid\s*=\s*["']app-main["']/, 'AppLayout main target is missing');

const topBarLabels = topBar.match(/\baria-label\s*=/g) || [];
if (topBarLabels.length < 4) fail('TopBar controls must have accessible labels');

const forbiddenLandingDependencies = [
  [/\bhttps?:\/\/[^\s"'`]+/i, 'remote URL'],
  [/<(?:video|audio|iframe|embed|object|source)\b/i, 'media embed'],
  [/\b(?:fetch|new\s+Audio)\s*\(/i, 'runtime media request'],
];
for (const [pattern, dependency] of forbiddenLandingDependencies) {
  if (pattern.test(landing)) fail(`landing contains ${dependency}`);
}

console.log('PASS: Atelier UI contract verified.');
