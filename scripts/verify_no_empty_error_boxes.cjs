#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const failures = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts)$/.test(entry.name)) check(full);
  }
}
function check(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (/bg-error\/10/.test(text) && /\{error\s*&&/.test(text) && !/error\.trim\(\)/.test(text)) failures.push(`${file} renders error box without trimming message.`);
  if (/setError\(result\.error\)/.test(text)) failures.push(`${file} forwards raw possibly empty result.error.`);
  if (/setError\(regError\)/.test(text)) failures.push(`${file} forwards raw possibly empty regError.`);
}
walk('src');
if (failures.length) { console.error('FAIL verify_no_empty_error_boxes'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log('PASS: error boxes require visible messages.');
