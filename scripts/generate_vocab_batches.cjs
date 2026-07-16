const fs = require('fs');
const path = require('path');
const https = require('https');

const vocabDir = path.join(__dirname, '../public/data/vocabulary');

// Maps language code to hermitdave frequency list suffix
const languages = {
  en: { freq: 'en', year: 2018, name: 'English' },
  de: { freq: 'de', year: 2018, name: 'German' },
  fr: { freq: 'fr', year: 2018, name: 'French' },
  es: { freq: 'es', year: 2018, name: 'Spanish' },
  ja: { freq: 'ja', year: 2016, name: 'Japanese' },
  ko: { freq: 'ko', year: 2018, name: 'Korean' },
  zh: { freq: 'zh_cn', year: 2018, name: 'Chinese' },
  it: { freq: 'it', year: 2018, name: 'Italian' },
  pt: { freq: 'pt_br', year: 2018, name: 'Portuguese' },
  ru: { freq: 'ru', year: 2018, name: 'Russian' },
  vi: { freq: 'vi', year: 2018, name: 'Vietnamese' },
  th: { freq: 'th', year: 2018, name: 'Thai' },
  ar: { freq: 'ar', year: 2018, name: 'Arabic' }
};

const TARGET_COUNT = 3000;

function fetchFrequencyList(langCode, year) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/${year}/${langCode}/${langCode}_50k.txt`;
    console.log(`Fetching dictionary for ${langCode}...`);
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) {
        return resolve([]); // Fallback empty if not found
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const words = data.split('\n')
          .map(line => line.split(' ')[0])
          .filter(word => word && word.length > 0)
          .slice(0, TARGET_COUNT);
        resolve(words);
      });
    }).on('error', reject);
  });
}

const customHighQualityData = {
  ja: [
    { word: 'こんにちは', rom: 'konnichiwa', en: 'hello', vi: 'xin chào', ex: 'こんにちは、お元気ですか？', ex_vi: 'Xin chào, bạn khỏe không?' },
    { word: 'ありがとう', rom: 'arigatou', en: 'thank you', vi: 'cảm ơn', ex: '手伝ってくれてありがとう。', ex_vi: 'Cảm ơn vì đã giúp đỡ.' },
    { word: '学校', rom: 'gakkou', en: 'school', vi: 'trường học', ex: '私は学校に行きます。', ex_vi: 'Tôi đi đến trường.' },
    { word: '先生', rom: 'sensei', en: 'teacher', vi: 'giáo viên', ex: '先生に質問します。', ex_vi: 'Tôi hỏi giáo viên.' },
    { word: '食べる', rom: 'taberu', en: 'to eat', vi: 'ăn', ex: '朝ごはんを食べる。', ex_vi: 'Tôi ăn bữa sáng.' },
    { word: '行く', rom: 'iku', en: 'to go', vi: 'đi', ex: '明日、東京へ行く。', ex_vi: 'Ngày mai tôi đi Tokyo.' },
    { word: '水', rom: 'mizu', en: 'water', vi: 'nước', ex: '水を飲みます。', ex_vi: 'Tôi uống nước.' },
    { word: '友達', rom: 'tomodachi', en: 'friend', vi: 'bạn bè', ex: '友達と遊ぶ。', ex_vi: 'Chơi với bạn bè.' },
  ],
  es: [
    { word: 'pero', en: 'but', vi: 'nhưng', ex: 'Quiero ir, pero no puedo.', ex_vi: 'Tôi muốn đi, nhưng tôi không thể.' },
    { word: 'porque', en: 'because', vi: 'bởi vì', ex: 'Estudio español porque es útil.', ex_vi: 'Tôi học tiếng Tây Ban Nha vì nó hữu ích.' },
    { word: 'casa', en: 'house', vi: 'ngôi nhà', ex: 'Mi casa es muy grande.', ex_vi: 'Nhà tôi rất lớn.' },
    { word: 'comer', en: 'to eat', vi: 'ăn', ex: 'Me gusta comer pizza.', ex_vi: 'Tôi thích ăn pizza.' },
    { word: 'hablar', en: 'to speak', vi: 'nói', ex: 'Ella puede hablar tres idiomas.', ex_vi: 'Cô ấy có thể nói ba ngôn ngữ.' },
  ]
};

const genericTemplates = {
  en: (w) => `I can say "${w}".`,
  de: (w) => `Ich sage "${w}".`,
  fr: (w) => `Je dis "${w}".`,
  es: (w) => `Yo digo "${w}".`,
  ja: (w) => `私は「${w}」と言います。`,
  ko: (w) => `저는 "${w}"라고 말합니다.`,
  zh: (w) => `我说“${w}”。`,
  it: (w) => `Io dico "${w}".`,
  pt: (w) => `Eu digo "${w}".`,
  ru: (w) => `Я говорю "${w}".`,
  vi: (w) => `Tôi nói "${w}".`,
  th: (w) => `ฉันพูดว่า "${w}"`,
  ar: (w) => `أنا أقول "${w}".`
};

function generateWordObject(lang, index, realWord) {
  let hq = null;
  if (customHighQualityData[lang]) {
    hq = customHighQualityData[lang].find(item => item.word === realWord);
  }

  const template = genericTemplates[lang] || genericTemplates.en;
  
  const exampleSentence = hq ? hq.ex : template(realWord);
  const exampleVi = hq ? hq.ex_vi : `(Ví dụ cho từ "${realWord}")`;
  const meaningEn = hq ? hq.en : `Meaning: ${realWord}`;
  const meaningVi = hq ? hq.vi : `Nghĩa: ${realWord}`;
  const romanization = hq && hq.rom ? hq.rom : realWord;

  return {
    id: `v_${lang}_${index}`,
    language: lang,
    level: index < 1000 ? 'A1-A2' : index < 2000 ? 'B1-B2' : 'C1-C2',
    word: realWord,
    nativeScript: realWord,
    romanization: romanization,
    partOfSpeech: ['noun', 'verb', 'adjective', 'adverb'][index % 4],
    meaningEnglish: meaningEn,
    meaningVietnamese: meaningVi,
    example: exampleSentence,
    exampleTranslation: exampleVi,
    topic: ['Everyday', 'Work', 'Travel', 'Academic'][index % 4],
    tags: ['essential', 'common', 'ielts'],
    pronunciationLocale: `${lang}-XX`,
    difficulty: (index % 100) + 1,
    qualityStatus: hq ? 'high' : 'low_confidence'
  };
}

async function generateBatch() {
  if (!fs.existsSync(vocabDir)) {
    fs.mkdirSync(vocabDir, { recursive: true });
  }

  for (const [lang, config] of Object.entries(languages)) {
    const langDir = path.join(vocabDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    let words = await fetchFrequencyList(config.freq, config.year);
    
    // Inject high quality words if they aren't in the list
    if (customHighQualityData[lang]) {
      for (const hq of customHighQualityData[lang]) {
        if (!words.includes(hq.word)) {
          words.unshift(hq.word);
        }
      }
    }

    if (words.length === 0) {
      console.log(`Failed to fetch for ${lang}. Generating fallback.`);
      for(let i = 0; i < TARGET_COUNT; i++) words.push(`word${i}`);
    }

    words = [...new Set(words)]; // Deduplicate
    
    let generatedCount = 0;
    const items = [];
    
    for (let i = 0; i < TARGET_COUNT && i < words.length; i++) {
      items.push(generateWordObject(lang, i + 1, words[i]));
      generatedCount++;
    }

    // Save as chunks
    const chunkSize = 3000;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const partNum = Math.floor(i / chunkSize) + 1;
      const fileName = `part-${String(partNum).padStart(3, '0')}.json`;
      fs.writeFileSync(path.join(langDir, fileName), JSON.stringify(chunk, null, 2));
      console.log(`Saved ${lang}/${fileName}. Total for lang: ${items.length}`);
    }
  }
}

generateBatch().then(() => {
  console.log('Finished generating vocabulary batches.');
});
