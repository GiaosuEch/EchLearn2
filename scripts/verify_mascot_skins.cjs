const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/data/customization.ts');
const content = fs.readFileSync(file, 'utf8');
const ids = [...content.matchAll(/"id":"([^"]+)"/g)].map(match => match[1]).filter(id => id.startsWith('frog-'));
const unique = new Set(ids);
if (unique.size < 100) {
  console.error(`FAIL: Expected at least 100 frog mascot skins, found ${unique.size}.`);
  process.exit(1);
}
const required = ['starter', 'seasonal', 'weather', 'anime', 'street', 'fantasy', 'sci-fi', 'school', 'sports', 'music', 'travel', 'festival'];
for (const category of required) {
  if (!content.includes(`"category":"${category}"`)) {
    console.error(`FAIL: Missing mascot skin category ${category}.`);
    process.exit(1);
  }
}
if (/Akatsuki|Naruto|Sharingan|Doraemon|One Piece|Dragon Ball|Pokemon/i.test(content)) {
  console.error('FAIL: Skin registry contains protected anime brand/character names. Use original inspired skins only.');
  process.exit(1);
}
console.log(`PASS: ${unique.size} original frog mascot skins across required categories.`);
