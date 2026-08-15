const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/data/advanced_lessons');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// English - IELTS Band 9 focus
const englishTopics = [
  'Environmental Sustainability & Climate Action',
  'Artificial Intelligence and Future Economies',
  'Sociological Impacts of Globalization',
  'Advanced Medical Ethics & Biotechnology'
];

// Chinese - HSK 6 focus
const chineseTopics = [
  '中國傳統哲學與現代社會 (Chinese Philosophy & Modern Society)',
  '一帶一路與全球經濟 (Belt and Road & Global Economy)',
  '文言文與成語解析 (Classical Chinese & Chengyu)',
  '科技創新與數字化轉型 (Tech Innovation & Digital Transformation)'
];

function generateAdvancedLesson(language, lessonId, index) {
  const isEnglish = language === 'en';
  const topic = isEnglish ? englishTopics[index % englishTopics.length] : chineseTopics[index % chineseTopics.length];
  
  const lesson = {
    id: `${language}_advanced_${index}`,
    title: topic,
    level: isEnglish ? 'IELTS Band 8.5-9.0' : 'HSK 6',
    focus: isEnglish ? 'Academic Reading & Writing' : 'Advanced Reading & Chengyu',
    content: {
      vocabulary: isEnglish ? [
        { word: 'Paradigm shift', meaning: 'A fundamental change in approach or underlying assumptions.', cefr: 'C2' },
        { word: 'Ubiquitous', meaning: 'Present, appearing, or found everywhere.', cefr: 'C2' },
        { word: 'Mitigate', meaning: 'Make less severe, serious, or painful.', cefr: 'C1' }
      ] : [
        { word: '根深蒂固 (gēn shēn dì gù)', meaning: 'Deep-rooted; inveterate.', cefr: 'C2' },
        { word: '潜移默化 (qián yí mò huà)', meaning: 'Imperceptible influence; to influence secretly.', cefr: 'C2' },
        { word: '不可思议 (bù kě sī yì)', meaning: 'Inconceivable; unimaginable.', cefr: 'C1' }
      ],
      reading: {
        text: isEnglish 
          ? `The advent of artificial intelligence has precipitated a paradigm shift in global economic structures. Ostensibly, the proliferation of automation might exacerbate income inequality; however, proponents argue it could catalyze unprecedented innovation. It is imperative that policymakers implement robust frameworks to mitigate potential socio-economic disruptions.`
          : `在当今全球化的背景下，传统文化的保护显得尤为重要。许多传统观念在人们心中根深蒂固，但随着科技的发展，现代生活方式正潜移默化地改变着新一代的价值观。这种变化速度之快，简直令人不可思议。`,
        questions: [
          {
            question: isEnglish ? 'What is the primary concern regarding AI mentioned in the text?' : '文章主要讨论了什么话题？',
            options: isEnglish 
              ? ['It will replace all human workers.', 'It might exacerbate income inequality.', 'It is too expensive to implement.']
              : ['传统文化的保护', '科技的快速发展', '现代生活方式的优越性'],
            answer: isEnglish ? 'It might exacerbate income inequality.' : '传统文化的保护'
          }
        ]
      },
      grammar: isEnglish ? [
        { point: 'Inversion for Emphasis', example: 'Seldom do we see such a rapid technological evolution.', explanation: 'Used in formal academic writing to emphasize the rarity or importance of an event.' }
      ] : [
        { point: 'Rhetorical Questions (反问句)', example: '难道我们不应该保护传统文化吗？', explanation: 'Used to emphasize a point by stating it as a question to which the answer is obvious.' }
      ]
    }
  };

  fs.writeFileSync(path.join(outDir, `${lesson.id}.json`), JSON.stringify(lesson, null, 2));
}

console.log('Generating 50 advanced lessons...');

for (let i = 1; i <= 25; i++) {
  generateAdvancedLesson('en', `en_advanced_${i}`, i);
}

for (let i = 1; i <= 25; i++) {
  generateAdvancedLesson('zh', `zh_advanced_${i}`, i);
}

console.log('Successfully generated 50 advanced lessons in public/data/advanced_lessons');
