import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const customEmoji = readFileSync(resolve(process.cwd(), 'src/components/common/CustomEmoji.tsx'), 'utf8');
const appIcon = readFileSync(resolve(process.cwd(), 'src/components/common/AppIcon.tsx'), 'utf8');

test('generic interface glyphs are served by the Lucide icon system', () => {
  assert.match(customEmoji, /import \{ AppIcon/);
  assert.match(customEmoji, /<AppIcon name=\{name as AppIconName\}/);
  assert.doesNotMatch(customEmoji, /const SVG_GLYPHS/);
  assert.match(appIcon, /from 'lucide-react'/);
});

test('Buri remains the only mascot artwork path in the shared icon component', () => {
  assert.match(customEmoji, /type MascotName/);
  assert.match(customEmoji, /ech-buri-study/);
  assert.doesNotMatch(appIcon, /ech-buri/);
});
