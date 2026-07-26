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
const maskNonRenderedSource = (source) => source.replace(
  /\/\*[\s\S]*?\*\/|^[\t ]*\/\/[^\r\n]*|(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/gm,
  (match) => ' '.repeat(match.length),
);
const getRenderedJsxOpeningTags = (source) => {
  const masked = maskNonRenderedSource(source);
  const tags = [];
  const tagStart = /<[A-Za-z][\w.:-]*/g;
  let match;
  while ((match = tagStart.exec(masked))) {
    let braceDepth = 0;
    for (let cursor = match.index + match[0].length; cursor < masked.length; cursor += 1) {
      if (masked[cursor] === '{') braceDepth += 1;
      else if (masked[cursor] === '}') braceDepth = Math.max(0, braceDepth - 1);
      else if (masked[cursor] === '>' && braceDepth === 0) {
        tags.push(source.slice(match.index, cursor + 1));
        tagStart.lastIndex = cursor + 1;
        break;
      }
    }
  }
  return tags;
};
const getMobileMenuButton = (source) => getRenderedJsxOpeningTags(source)
  .find((tag) => /^<button\b/.test(tag) && /\bonClick\s*=\s*\{[\s\S]*?\bsetMobileMenu\s*\(/.test(tag));
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
  const idPattern = new RegExp(`(?:^|\\s)id\\s*=\\s*["']${escapedId}["'](?=\\s|/?>)`);
  return getRenderedJsxOpeningTags(source).some((tag) => idPattern.test(tag));
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

const mobileMenuButton = getMobileMenuButton(publicLayout);
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
