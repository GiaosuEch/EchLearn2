#!/usr/bin/env node
const fs = require('fs');
const text = fs.readFileSync('src/utils/languageUtils.ts','utf8');
const required = ['en-US','fr-FR','de-DE','zh-CN','ja-JP','ko-KR','es-ES','it-IT','pt-PT','ru-RU','vi-VN','th-TH','ar-SA'];
const missing = required.filter(x=>!text.includes(x));
if (missing.length){ console.error('FAIL verify_tts_language_map'); console.error('missing:', missing.join(', ')); process.exit(1); }
console.log('PASS: TTS locale map covers all supported languages.');
