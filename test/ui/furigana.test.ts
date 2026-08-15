import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (relativePath: string) =>
  readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');

test('FuriganaText ensures screen reader accessibility instead of double reading', async () => {
  const content = await source('src/components/ui/FuriganaText.tsx');
  
  // 1. Must use the native ruby element
  assert.match(
    content,
    /<ruby/g,
    'FuriganaText must use native <ruby> element'
  );

  // 2. Must apply aria-label to the ruby container so screen readers read the kana (ruby) instead of Kanji
  assert.match(
    content,
    /<ruby[^>]*aria-label=\{ruby\}[^>]*>/g,
    'FuriganaText must set aria-label={ruby} on the <ruby> container'
  );

  // 3. Must hide the visual <rt> element from screen readers
  assert.match(
    content,
    /<rt[^>]*aria-hidden/g,
    'FuriganaText must hide the <rt> element using aria-hidden'
  );
  
  // 4. Base text should also be hidden from screen readers if we are setting aria-label on the container
  assert.match(
    content,
    /aria-hidden/g,
    'FuriganaText must use aria-hidden for visual-only elements'
  );
});
