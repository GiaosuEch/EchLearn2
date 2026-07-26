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
const getJsxAttribute = (source, name) => source.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^{}]*)\\})`, 's'));
const hasNonEmptyAriaLabel = (attribute) => {
  if (!attribute) return false;
  const value = (attribute[1] ?? attribute[2] ?? attribute[3] ?? '').trim();
  return value.length > 0 && !/^(?:''|""|null|undefined)$/.test(value);
};
const hasValidExpandedState = (attribute) => {
  if (!attribute) return false;
  const literal = attribute[1] ?? attribute[2];
  if (literal !== undefined) return literal === 'true' || literal === 'false';
  const expression = (attribute[3] || '').trim();
  return /^(?:true|false|!?mobileMenu|Boolean\(mobileMenu\)|mobileMenu\s*\?\s*true\s*:\s*false)$/.test(expression);
};
const hasRenderedJsxElementWithId = (source, id) => {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idPattern = new RegExp(`\\bid\\s*=\\s*["']${escapedId}["']`);
  const skipQuoted = (start, quote) => {
    let index = start + 1;
    while (index < source.length) {
      if (source[index] === '\\') index += 2;
      else if (source[index++] === quote) break;
    }
    return index;
  };

  for (let index = 0; index < source.length; index += 1) {
    if (source.startsWith('//', index)) {
      index = source.indexOf('\n', index + 2);
      if (index < 0) return false;
      continue;
    }
    if (source.startsWith('/*', index)) {
      index = source.indexOf('*/', index + 2);
      if (index < 0) return false;
      index += 1;
      continue;
    }
    if (/['"`]/.test(source[index])) {
      index = skipQuoted(index, source[index]) - 1;
      continue;
    }
    if (source[index] !== '<' || !/[A-Za-z]/.test(source[index + 1] || '')) continue;

    let braceDepth = 0;
    let quote = null;
    for (let cursor = index + 1; cursor < source.length; cursor += 1) {
      const character = source[cursor];
      if (quote) {
        if (character === '\\') cursor += 1;
        else if (character === quote) quote = null;
        continue;
      }
      if (/['"`]/.test(character)) {
        quote = character;
        continue;
      }
      if (character === '{') braceDepth += 1;
      else if (character === '}') braceDepth = Math.max(0, braceDepth - 1);
      else if (character === '>' && braceDepth === 0) {
        if (idPattern.test(source.slice(index, cursor + 1))) return true;
        index = cursor;
        break;
      }
    }
  }
  return false;
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

const normalizedLanding = landing.normalize('NFD').replace(/\p{M}/gu, '');
if (/Local AI Qwen3|chay\s+truc\s+tiep\s+tren\s+browser/i.test(normalizedLanding)) {
  fail('unsupported local-AI landing claim');
}

requiredMatch(publicShell, /href\s*=\s*["']#main-content["']/, 'public skip link is missing');
requiredMatch(publicShell, /<main\s+[^>]*\bid\s*=\s*["']main-content["']/, 'public main target is missing');
requiredMatch(publicShell, /<nav\s+[^>]*\baria-label\s*=\s*["'][^"']+/, 'public navigation must be labelled');

const mobileMenuButton = getMobileMenuButton(publicShell);
if (!mobileMenuButton) fail('public mobile menu button is missing');
if (!hasNonEmptyAriaLabel(getJsxAttribute(mobileMenuButton, 'aria-label'))) {
  fail('public mobile menu button must have a nonempty accessible label');
}
if (!hasValidExpandedState(getJsxAttribute(mobileMenuButton, 'aria-expanded'))) {
  fail('public mobile menu button must expose aria-expanded as true or false');
}
const controlledMenu = mobileMenuButton.match(/\baria-controls\s*=\s*["']([^"']+)["']/);
if (!controlledMenu) fail('public mobile menu button must identify its controlled menu');
if (!hasRenderedJsxElementWithId(publicShell, controlledMenu[1])) {
  fail('public mobile menu control has no matching rendered element');
}

requiredMatch(appLayout, /<main\s+[^>]*\bid\s*=\s*["']app-main["']/, 'AppLayout main target is missing');

const topBarLabels = topBar.match(/\baria-label\s*=/g) || [];
if (topBarLabels.length < 4) fail('TopBar controls must have accessible labels');

const forbiddenLandingDependencies = [
  [/["'`](?:https?:)?\/\/[^\s"'`]+["'`]/i, 'remote URL literal'],
  [/<(?:video|audio|iframe|embed|object|source)\b/i, 'media embed'],
  [/\b(?:fetch|new\s+Audio)\s*\(/i, 'runtime media request'],
];
for (const [pattern, dependency] of forbiddenLandingDependencies) {
  if (pattern.test(landing)) fail(`landing contains ${dependency}`);
}

console.log('PASS: Atelier UI contract verified.');
