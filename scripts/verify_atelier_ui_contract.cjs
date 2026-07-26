#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readRequired = (relativePath) => {
  if (!fs.existsSync(path.join(root, relativePath))) fail(`${relativePath} is missing`);
  return read(relativePath);
};
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
  .find((tag) => /^<button\b/.test(tag) && /(?:^|\s)onClick\s*=\s*\{[\s\S]*?\bsetMobileMenu(?:Open)?\s*\(/.test(tag));
const getJsxAttribute = (source, name) => source.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^{}]*)\\})`, 's'));
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
  return /^(?:true|false|!?(?:mobileMenu(?:Open)?|sidebarOpen|showLangDropdown|showNotifications)|Boolean\((?:mobileMenu(?:Open)?|sidebarOpen|showLangDropdown|showNotifications)\)|(?:mobileMenu(?:Open)?|sidebarOpen|showLangDropdown|showNotifications)\s*\?\s*true\s*:\s*false)$/.test(expression);
};
const hasRenderedJsxElementWithId = (source, id) => {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const idPattern = new RegExp(`(?:^|\\s)id\\s*=\\s*["']${escapedId}["'](?=\\s|/?>)`);
  return getRenderedJsxOpeningTags(source).some((tag) => idPattern.test(tag));
};

const css = read('src/index.css');
const atelierSurface = readRequired('src/components/atelier/AtelierSurface.tsx');
const sectionEyebrow = readRequired('src/components/atelier/SectionEyebrow.tsx');
const echBuriPresence = readRequired('src/components/atelier/EchBuriPresence.tsx');
const landing = read('src/pages/public/LandingPage.tsx');
const publicLayout = read('src/components/layout/PublicLayout.tsx');
const appLayout = read('src/components/layout/AppLayout.tsx');
const topBar = read('src/components/layout/TopBar.tsx');
const publicShell = `${landing}\n${publicLayout}`;

required(css, '--ech-canvas', 'src/index.css');
for (const token of [
  '--ech-surface-1',
  '--ech-surface-2',
  '--ech-text',
  '--ech-text-muted',
  '--ech-action',
  '--ech-achievement',
]) {
  required(css, token, 'src/index.css');
}
requiredMatch(css, /:where\(a,\s*button,\s*input,\s*select,\s*textarea\):focus-visible\s*\{/,
  'src/index.css focus-visible rule is missing');
required(css, '@media (prefers-reduced-motion: reduce)', 'src/index.css');
requiredMatch(atelierSurface, /export\s+(?:function|const)\s+AtelierSurface\b/,
  'AtelierSurface component is missing');
required(atelierSurface, 'atelier-surface--', 'src/components/atelier/AtelierSurface.tsx');
requiredMatch(sectionEyebrow, /export\s+(?:function|const)\s+SectionEyebrow\b/,
  'SectionEyebrow component is missing');
required(sectionEyebrow, 'atelier-eyebrow', 'src/components/atelier/SectionEyebrow.tsx');
requiredMatch(echBuriPresence, /export\s+(?:function|const)\s+EchBuriPresence\b/,
  'EchBuriPresence component is missing');
required(echBuriPresence, 'Mascot', 'src/components/atelier/EchBuriPresence.tsx');

const hero = readRequired('src/components/landing/AtelierHero.tsx');
const landingChapter = readRequired('src/components/landing/LandingChapter.tsx');
const landingSource = `${landing}\n${hero}\n${landingChapter}`;
requiredMatch(hero, /export\s+(?:function|const)\s+AtelierHero\b/,
  'AtelierHero component is missing');
requiredMatch(landingChapter, /export\s+(?:function|const)\s+LandingChapter\b/,
  'LandingChapter component is missing');
if ((landingSource.match(/<h1\b/g) || []).length !== 1) {
  fail('landing must render exactly one h1');
}
for (const anchor of ['start', 'practice', 'evidence', 'remember', 'progress']) {
  requiredMatch(landing, new RegExp(`<LandingChapter[^>]*\\bid\\s*=\\s*[\"']${anchor}[\"']`, 's'),
    `landing chapter ${anchor} is missing`);
}
requiredMatch(hero, /<nav\b[^>]*aria-label\s*=\s*[\"']Primary navigation[\"']/,
  'landing primary navigation must be labelled');
const landingMobileMenuButton = getMobileMenuButton(hero);
if (!landingMobileMenuButton) fail('landing mobile menu button is missing');
if (!hasNonEmptyAriaLabel(getJsxAttribute(landingMobileMenuButton, 'aria-label'))) {
  fail('landing mobile menu button must have a nonempty accessible label');
}
if (!hasValidExpandedState(getJsxAttribute(landingMobileMenuButton, 'aria-expanded'))) {
  fail('landing mobile menu button must expose aria-expanded as true or false');
}
const landingControlledMenu = landingMobileMenuButton.match(/(?:^|\s)aria-controls\s*=\s*[\"']([^\"']+)[\"']/);
if (!landingControlledMenu || !hasRenderedJsxElementWithId(hero, landingControlledMenu[1])) {
  fail('landing mobile menu control has no matching rendered element');
}
requiredMatch(hero, /aria-label\s*=\s*[\"']Close navigation[\"']/,
  'landing mobile menu must have a labelled close button');

const normalizedLanding = landingSource.normalize('NFD').replace(/\p{M}/gu, '');
if (/Local AI Qwen3|chay\s+truc\s+tiep\s+tren\s+browser/i.test(normalizedLanding)) {
  fail('unsupported local-AI landing claim');
}

requiredMatch(publicShell, /href\s*=\s*["']#main-content["']/, 'public skip link is missing');
requiredMatch(publicShell, /<main\s+[^>]*\bid\s*=\s*["']main-content["']/, 'public main target is missing');
requiredMatch(publicShell, /<nav\b[^>]*(?:^|\s)aria-label\s*=\s*["'][^"']+/m, 'public navigation must be labelled');
required(publicLayout, 'Local AI foundation in development.', 'PublicLayout.tsx honest AI limitation is missing');
required(publicLayout, 'Automated assessment unavailable until an approved model is installed.', 'PublicLayout.tsx automated assessment limitation is missing');

const mobileMenuButton = getMobileMenuButton(publicLayout);
if (!mobileMenuButton) fail('public mobile menu button is missing');
if (!hasNonEmptyAriaLabel(getJsxAttribute(mobileMenuButton, 'aria-label'))) {
  fail('public mobile menu button must have a nonempty accessible label');
}
if (!hasValidExpandedState(getJsxAttribute(mobileMenuButton, 'aria-expanded'))) {
  fail('public mobile menu button must expose aria-expanded as true or false');
}
const controlledMenu = mobileMenuButton.match(/(?:^|\s)aria-controls\s*=\s*["']([^"']+)["']/);
if (!controlledMenu) fail('public mobile menu button must identify its controlled menu');
if (!hasRenderedJsxElementWithId(publicShell, controlledMenu[1])) {
  fail('public mobile menu control has no matching rendered element');
}

requiredMatch(appLayout, /<main\s+[^>]*\bid\s*=\s*["']app-main["']/, 'AppLayout main target is missing');
requiredMatch(appLayout, /<aside\s+[^>]*\bid\s*=\s*["']app-sidebar["']/, 'AppLayout sidebar target is missing');
requiredMatch(appLayout, /<aside\s+[^>]*\baria-label\s*=/, 'AppLayout sidebar must be labelled');
requiredMatch(appLayout, /event\.key\s*===\s*["']Escape["']/, 'AppLayout mobile sidebar must close on Escape');
requiredMatch(appLayout, /app-sidebar-toggle/, 'AppLayout must restore focus to the mobile sidebar control');
requiredMatch(appLayout, /inert\s*=\s*\{isMobile\s*&&\s*!sidebarOpen\}/,
  'AppLayout mobile sidebar must become inert when closed');
requiredMatch(appLayout, /sidebar\?\.contains\(document\.activeElement\)/,
  'AppLayout must restore focus when route navigation closes the mobile sidebar');
requiredMatch(appLayout, /aria-controls\s*=\s*\{sectionContentId\}/,
  'AppLayout sidebar section controls must identify their content');
requiredMatch(appLayout, /aria-expanded\s*=\s*\{sectionExpanded\}/,
  'AppLayout sidebar section controls must expose their expanded state');
requiredMatch(appLayout, /<ul\s+id\s*=\s*\{sectionContentId\}/,
  'AppLayout sidebar section content must have a matching id');
for (const orchestrationToken of [
  'i18n.changeLanguage',
  'applyCosmeticSettings',
  'fetchStats',
  'window.innerWidth < 1024',
  'JapaneseLofiPlayer',
]) {
  required(appLayout, orchestrationToken, 'AppLayout.tsx');
}

const appMenuButton = getRenderedJsxOpeningTags(topBar)
  .find((tag) => /^<button\b/.test(tag) && /app-sidebar-toggle/.test(tag));
if (!appMenuButton) fail('TopBar mobile sidebar control is missing');
if (!hasNonEmptyAriaLabel(getJsxAttribute(appMenuButton, 'aria-label'))) {
  fail('TopBar mobile sidebar control must have a nonempty accessible label');
}
if (!hasValidExpandedState(getJsxAttribute(appMenuButton, 'aria-expanded'))) {
  fail('TopBar mobile sidebar control must expose aria-expanded');
}
const appSidebarControl = appMenuButton.match(/(?:^|\s)aria-controls\s*=\s*["']([^"']+)["']/);
if (!appSidebarControl || !hasRenderedJsxElementWithId(appLayout, appSidebarControl[1])) {
  fail('TopBar mobile sidebar control has no matching rendered sidebar');
}

for (const [control, description] of [
  ['language-menu-button', 'language selector'],
  ['notifications-menu-button', 'notifications control'],
]) {
  const button = getRenderedJsxOpeningTags(topBar)
    .find((tag) => /^<button\b/.test(tag) && new RegExp(`\\bid\\s*=\\s*["']${control}["']`).test(tag));
  if (!button) fail(`TopBar ${description} is missing`);
  if (!hasNonEmptyAriaLabel(getJsxAttribute(button, 'aria-label'))) {
    fail(`TopBar ${description} must have a nonempty accessible label`);
  }
  if (!hasValidExpandedState(getJsxAttribute(button, 'aria-expanded'))) {
    fail(`TopBar ${description} must expose aria-expanded`);
  }
  const menu = button.match(/(?:^|\s)aria-controls\s*=\s*["']([^"']+)["']/);
  if (!menu || !hasRenderedJsxElementWithId(topBar, menu[1])) {
    fail(`TopBar ${description} has no matching rendered popover`);
  }
}
requiredMatch(topBar, /event\.key\s*!==\s*["']Escape["']/, 'TopBar dialogs must close on Escape');
required(topBar, 'languageTriggerRef.current?.focus()', 'TopBar.tsx');
required(topBar, 'notificationsTriggerRef.current?.focus()', 'TopBar.tsx');

const forbiddenLandingDependencies = [
  [/["'`](?:https?:)?\/\/[^\s"'`]+["'`]/i, 'remote URL literal'],
  [/<(?:video|audio|iframe|embed|object|source)\b/i, 'media embed'],
  [/\b(?:fetch|new\s+Audio)\s*\(/i, 'runtime media request'],
];
for (const [pattern, dependency] of forbiddenLandingDependencies) {
  if (pattern.test(landingSource)) fail(`landing contains ${dependency}`);
}

console.log('PASS: Atelier UI contract verified.');
