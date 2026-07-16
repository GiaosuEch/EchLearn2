#!/usr/bin/env node
const fs = require('fs');
const src = fs.readFileSync('src/services/aiLearningEngine.ts', 'utf8');
const failures = [];
for (const token of ['viPlacementBank', 'createVietnamesePlacementTest', "targetLanguage === 'vi' && nativeLanguage === 'vi'", 'Chọn nghĩa đúng nhất', 'Nghe từ']) {
  if (!src.includes(token)) failures.push(`missing Vietnamese placement safeguard token: ${token}`);
}
if (/Chọn từ phù hợp với nghĩa/.test(src)) failures.push('AI engine must not use the bad reverse-meaning Vietnamese prompt');
for (const unsafe of ['common word:', 'Robert', 'Missing Meaning']) {
  if (!src.includes(unsafe)) failures.push(`AI engine must keep guard for ${unsafe}`);
}
if (!src.includes('N\\/A')) failures.push('AI engine must keep guard for N/A');
if (!src.includes("type: PlacementQuestion['type'] = index % 3 === 0 ? 'listening'")) failures.push('AI placement should include listening questions but avoid broken reverse-meaning prompt');
if (failures.length) {
  console.error('FAIL verify_ai_placement_vietnamese');
  failures.forEach(f => console.error('-', f));
  process.exit(1);
}
console.log('PASS: Vietnamese AI placement is curated and avoids fake synonym/reverse-meaning bugs.');
