#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const failures = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/Page\.tsx$/.test(entry.name) || ['App.tsx'].includes(entry.name)) check(full);
  }
}
function check(file) {
  const text = fs.readFileSync(file, 'utf8');
  const isDefaultPageReExport = /^export\s+\{\s*default\s*\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/m.test(text);
  if (!isDefaultPageReExport && !text.includes('return (') && !text.includes('return <') && !text.includes('=> (')) failures.push(`${file} has no obvious JSX return.`);
  if (/\n\s*return\s+null\s*;\n\s*}/.test(text) && !/loading|redirect|guard|fallback|map\(/i.test(text)) failures.push(`${file} may render a blank page with final return null.`);
  if (/className="[^"]*min-h-screen[^"]*"/.test(text) && !/<h1|PageShell|glass-card|Mascot|Outlet/.test(text)) failures.push(`${file} has shell layout but no visible content marker.`);
}
walk('src/pages');
if (failures.length) { console.error('FAIL verify_no_blank_pages'); failures.forEach(f => console.error('-', f)); process.exit(1); }
console.log('PASS: no obvious blank page patterns found.');
