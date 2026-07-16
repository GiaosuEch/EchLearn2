const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '../public/data/vocabulary');
const langs = ['en', 'de', 'fr', 'es', 'ja', 'ko', 'zh', 'it', 'pt', 'ru', 'vi', 'th', 'ar'];

const placeMap = {
  'york': 'thành phố York',
  'paris': 'thành phố Paris',
  'rome': 'thành phố Rome',
  'washington': 'thành phố/bang Washington',
  'california': 'bang California',
  'chicago': 'thành phố Chicago',
  'mexico': 'nước Mexico',
  'texas': 'bang Texas',
  'vegas': 'thành phố Las Vegas'
};

const entityMap = {
  'fbi': 'Cục Điều tra Liên bang Mỹ',
  'messi': 'cầu thủ Lionel Messi',
  'pa': 'viết tắt của bố/cha',
  'st.': 'thánh (Saint) / viết tắt'
};

const lastNameMap = {
  'smith': 'họ Smith / tên Smith',
  'carter': 'họ Carter / tên Carter',
  'wilson': 'họ Wilson / tên Wilson',
  'johnson': 'họ Johnson / tên Johnson',
  'lee': 'họ Lee / tên Lee'
};

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

for (const lang of langs) {
  const file = path.join(vocabDir, lang, 'part-001.json');
  if (!fs.existsSync(file)) continue;

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let modified = false;

  data.forEach(item => {
    if (item.word && item.meaningVietnamese && item.word.toLowerCase() === item.meaningVietnamese.toLowerCase()) {
      const lower = item.word.toLowerCase();
      
      if (placeMap[lower]) {
        item.meaningVietnamese = placeMap[lower];
      } else if (entityMap[lower]) {
        item.meaningVietnamese = entityMap[lower];
      } else if (lastNameMap[lower]) {
        item.meaningVietnamese = lastNameMap[lower];
      } else {
        item.meaningVietnamese = `tên riêng ${capitalize(item.word)}`;
      }
      
      // Also update meaningEnglish to not equal word if needed
      if (item.meaningEnglish && item.word.toLowerCase() === item.meaningEnglish.toLowerCase()) {
        item.meaningEnglish = `Proper name: ${capitalize(item.word)}`;
      } else if (!item.meaningEnglish || item.meaningEnglish.startsWith('Meaning:')) {
        item.meaningEnglish = `Proper name: ${capitalize(item.word)}`;
      }

      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Fixed proper nouns in ${lang}`);
  }
}
