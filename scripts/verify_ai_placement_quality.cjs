#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const langs = ['en','fr','de','zh','ja','ko','es','it','pt','ru','vi','th','ar'];
const forbidden = [/common word:/i,/^robert$/i,/missing meaning/i,/^n\/a$/i,/^meaning:/i,/random option/i,/placeholder/i,/exampletranslation/i];
const viAccent = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const allowedViNoAccent = new Set(['nhanh','cham','vui','lon','hoc','nghe','noi','doc','viet','xin chao','gia dinh','cong viec','thoi gian','thuc an','du lich','am nhac','co','khong','la','va','toi','ban','nha ga','ca phe']);
function looksEnglish(value){
  const v=String(value||'').trim();
  if (!v) return true;
  if (viAccent.test(v)) return false;
  if (allowedViNoAccent.has(v.toLowerCase())) return false;
  return /^[a-z]+(?:\s+[a-z]+){0,2}$/i.test(v);
}
let failures=[];
for (const lang of langs){
  const file=path.join('public/data/vocabulary',lang,'part-001.json');
  if (!fs.existsSync(file)){ failures.push(`${lang}: missing vocabulary file`); continue; }
  const data=JSON.parse(fs.readFileSync(file,'utf8')).slice(0,120);
  for (let i=0;i<Math.min(30,data.length);i++){
    const item=data[i];
    const raw=String(item.meaningVietnamese||item.translation||item.meaning||'').replace(/^Meaning:\s*/i,'').trim();
    if (!raw || forbidden.some(r=>r.test(raw))) failures.push(`${lang}:${item.word}: forbidden meaning ${raw}`);
  }
}
const engine=fs.readFileSync('src/services/aiLearningEngine.ts','utf8');
['common word:','Robert','Missing Meaning','N/A','englishToVietnamese','forbiddenOptionPatterns'].forEach(token=>{
  if (!engine.includes(token)) failures.push(`engine missing guard for ${token}`);
});
if (failures.length){
  console.error('FAIL verify_ai_placement_quality');
  failures.slice(0,50).forEach(f=>console.error('-',f));
  process.exit(1);
}
console.log('PASS: AI placement quality guards and vocabulary surface checks are valid.');
