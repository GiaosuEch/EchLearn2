import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run from the project root
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

const MOJIBAKE_PATTERNS = [
  /\ufffd/, // U+FFFD Replacement Character
  /â€¦/,     // ...
  /â€™/,     // ’
  /â€œ/,     // “
  /â€\u009D/, // ” (sometimes appears as â€ without the last byte, but we match specifically)
  /Ã¡/, /Ã /, /Ã¢/, /Ã£/, /Ã¤/, /Ã¥/, /Ã¦/, /Ã§/, /Ã¨/, /Ã©/, /Ãª/, /Ã«/, /Ã¬/, /Ã­/, /Ã®/, /Ã¯/,
  /á»/, /Ä‘/, /Há»/, /Tá»/, /Æ/
];

let hasErrors = false;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(ts|tsx|js|jsx|json|md)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of MOJIBAKE_PATTERNS) {
          if (pattern.test(line)) {
            // Ignore valid Vietnamese characters that might clash if the regex isn't precise.
            // But U+FFFD and specific artifacts like â€¦ are definitely errors.
            console.error(`[Mojibake Error] ${fullPath}:${i + 1}`);
            console.error(`  Line: ${line.trim()}`);
            hasErrors = true;
            break;
          }
        }
      }
    }
  }
}

console.log('Scanning src/ for mojibake encoding errors...');
scanDir(rootDir);

if (hasErrors) {
  console.error('\nEncoding errors found! Please fix the mojibake characters.');
  process.exit(1);
} else {
  console.log('No encoding errors found. All files look clean!');
  process.exit(0);
}
