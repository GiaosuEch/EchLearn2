const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '..', 'public', 'data', 'vocabulary');

// Master dictionary map for rich accurate details
const dictionaryMaster = {
  // Animals
  cat: {
    en: { word: 'cat', romanization: '[kæt]', meaningVietnamese: 'Con mèo', meaningEnglish: 'Small domesticated feline animal with soft fur', example: 'The cat is sleeping peacefully on the sofa.', exampleTranslation: 'Con mèo đang ngủ yên bình trên ghế sofa.' },
    zh: { word: '猫', nativeScript: '猫', romanization: 'māo', meaningVietnamese: 'Con mèo', meaningEnglish: 'Small domesticated feline animal', example: '这只猫在沙发上睡着了。', exampleTranslation: 'Con mèo này đang ngủ trên ghế sofa.' },
    ja: { word: '猫', nativeScript: '猫', romanization: 'neko (ねこ)', meaningVietnamese: 'Con mèo', meaningEnglish: 'Small domesticated feline animal', example: '猫がソファで静かに寝ています。', exampleTranslation: 'Con mèo đang ngủ yên tĩnh trên ghế sofa.' },
    ko: { word: '고양이', nativeScript: '고양이', romanization: 'goyangi', meaningVietnamese: 'Con mèo', meaningEnglish: 'Small domesticated feline animal', example: '고양이가 소파에서 자고 있습니다.', exampleTranslation: 'Con mèo đang ngủ trên ghế sofa.' },
    fr: { word: 'chat', nativeScript: 'chat', romanization: '[ʃa]', meaningVietnamese: 'Con mèo', meaningEnglish: 'Petit animal félin domestique', example: 'Le chat dort sur le canapé.', exampleTranslation: 'Con mèo đang ngủ trên ghế sofa.' },
    de: { word: 'Katze', nativeScript: 'Katze', romanization: '[ˈkat͡sə]', meaningVietnamese: 'Con mèo', meaningEnglish: 'Kleines Hauskatzen-Tier', example: 'Die Katze schläft auf dem Sofa.', exampleTranslation: 'Con mèo đang ngủ trên ghế sofa.' },
    es: { word: 'gato', nativeScript: 'gato', romanization: 'gato', meaningVietnamese: 'Con mèo', meaningEnglish: 'Pequeño felino doméstico', example: 'El gato duerme tranquilamente en el sofá.', exampleTranslation: 'Con mèo đang ngủ yên bình trên ghế sofa.' },
    ru: { word: 'кошка', nativeScript: 'кошка', romanization: 'koshka [koʂkə]', meaningVietnamese: 'Con mèo', meaningEnglish: 'Маленькое домашнее животное', example: 'Кошка спит на диване.', exampleTranslation: 'Con mèo đang ngủ trên ghế sofa.' },
    th: { word: 'แมว', nativeScript: 'แมว', romanization: 'mæw', meaningVietnamese: 'Con mèo', meaningEnglish: 'Small domesticated feline animal', example: 'แมวกำลังนอนอยู่บนโซฟา', exampleTranslation: 'Con mèo đang ngủ trên ghế sofa.' },
    ar: { word: 'قطة', nativeScript: 'قطة', romanization: 'qiṭṭah', meaningVietnamese: 'Con mèo', meaningEnglish: 'Small domesticated feline animal', example: 'القطة تنام على الأريكة.', exampleTranslation: 'Con mèo đang ngủ trên ghế sofa.' }
  },
  dog: {
    en: { word: 'dog', romanization: '[dɔɡ]', meaningVietnamese: 'Con chó', meaningEnglish: 'Loyal domesticated carnivorous mammal', example: 'The dog wagged its tail happily.', exampleTranslation: 'Con chó vẫy đuôi vui mừng.' },
    zh: { word: '狗', nativeScript: '狗', romanization: 'gǒu', meaningVietnamese: 'Con chó', meaningEnglish: 'Loyal domesticated animal', example: '这只狗高兴地摇着尾巴。', exampleTranslation: 'Con chó vui mừng vẫy đuôi.' },
    ja: { word: '犬', nativeScript: '犬', romanization: 'inu (いぬ)', meaningVietnamese: 'Con chó', meaningEnglish: 'Loyal domesticated animal', example: '犬が嬉しそうに尾を振っています。', exampleTranslation: 'Con chó vẫy đuôi vui mừng.' },
    ko: { word: '개', nativeScript: '개', romanization: 'gae', meaningVietnamese: 'Con chó', meaningEnglish: 'Loyal domesticated animal', example: '개가 꼬리를 흔들며 반겼습니다.', exampleTranslation: 'Con chó vẫy đuôi mừng rỡ.' },
    fr: { word: 'chien', nativeScript: 'chien', romanization: '[ʃjɛ̃]', meaningVietnamese: 'Con chó', meaningEnglish: 'Canidé domestique fidèle', example: 'Le chien remue la queue joyeusement.', exampleTranslation: 'Con chó vui mừng vẫy đuôi.' },
    de: { word: 'Hund', nativeScript: 'Hund', romanization: '[hʊnt]', meaningVietnamese: 'Con chó', meaningEnglish: 'Treues Haustier Säugetier', example: 'Der Hund wedelt freudig mit dem Schwanz.', exampleTranslation: 'Con chó vẫy đuôi vui mừng.' },
    es: { word: 'perro', nativeScript: 'perro', romanization: 'perro', meaningVietnamese: 'Con chó', meaningEnglish: 'Mamífero carnívoro doméstico leal', example: 'El perro movía la cola de alegría.', exampleTranslation: 'Con chó vẫy đuôi vui mừng.' },
    ru: { word: 'собака', nativeScript: 'собака', romanization: 'sobaka [sɐˈbakə]', meaningVietnamese: 'Con chó', meaningEnglish: 'Преданное домашнее животное', example: 'Собака радостно виляет хвостом.', exampleTranslation: 'Con chó vui mừng vẫy đuôi.' },
    th: { word: 'หมา', nativeScript: 'หมา', romanization: 'mǎː', meaningVietnamese: 'Con chó', meaningEnglish: 'Loyal domesticated animal', example: 'สุนัขสั่นหางด้วยความดีใจ', exampleTranslation: 'Con chó vẫy đuôi vui mừng.' },
    ar: { word: 'كلب', nativeScript: 'كلب', romanization: 'kalb', meaningVietnamese: 'Con chó', meaningEnglish: 'Loyal domesticated animal', example: 'الكلب هز ذيله بفرح.', exampleTranslation: 'Con chó vẫy đuôi vui mừng.' }
  },
  lion: {
    en: { word: 'lion', romanization: '[ˈlaɪən]', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Large wild tawny feline predator', example: 'The lion is known as king of the jungle.', exampleTranslation: 'Sư tử được biết đến là chúa tể rừng xanh.' },
    zh: { word: '狮子', nativeScript: '狮子', romanization: 'shīzi', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Large wild feline predator', example: '狮子被称为百兽之王。', exampleTranslation: 'Sư tử được gọi là chúa tể muôn thú.' },
    ja: { word: 'ライオン', nativeScript: 'ライオン', romanization: 'raion (らいおん)', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Large wild feline predator', example: 'ライオンは百獣の王と呼ばれます。', exampleTranslation: 'Sư tử được gọi là chúa tể muôn thú.' },
    ko: { word: '사자', nativeScript: '사자', romanization: 'saja', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Large wild feline predator', example: '사자는 동물의 왕으로 불립니다.', exampleTranslation: 'Sư tử được gọi là vua của muôn loài.' },
    fr: { word: 'lion', nativeScript: 'lion', romanization: '[ljɔ̃]', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Grand félin prédateur sauvage', example: 'Le lion est le roi de la savane.', exampleTranslation: 'Sư tử là vua của thảo nguyên.' },
    de: { word: 'Löwe', nativeScript: 'Löwe', romanization: '[ˈløːvə]', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Großes wildes Raubtier', example: 'Der Löwe ist der König der Tiere.', exampleTranslation: 'Sư tử là vua của muôn thú.' },
    es: { word: 'león', nativeScript: 'león', romanization: 'león', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Gran felino depredador salvaje', example: 'El león es el rey de la selva.', exampleTranslation: 'Sư tử là chúa tể rừng xanh.' },
    ru: { word: 'лев', nativeScript: 'лев', romanization: 'lev [lʲef]', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Крупное хищное животное', example: 'Лев — царь зверей.', exampleTranslation: 'Sư tử là vua của muôn thú.' },
    th: { word: 'สิงโต', nativeScript: 'สิงโต', romanization: 'sǐŋ-toː', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Large wild feline predator', example: 'สิงโตเป็นเจ้าแห่งสัตว์ป่า', exampleTranslation: 'Sư tử là chúa tể muôn thú.' },
    ar: { word: 'أسد', nativeScript: 'أسد', romanization: 'asad', meaningVietnamese: 'Con sư tử', meaningEnglish: 'Large wild feline predator', example: 'الأسد هو ملك الغابة.', exampleTranslation: 'Sư tử là chúa tể rừng xanh.' }
  },
  tiger: {
    en: { word: 'tiger', romanization: '[ˈtaɪɡər]', meaningVietnamese: 'Con hổ', meaningEnglish: 'Large wild striped feline predator', example: 'The tiger has dark stripes on orange fur.', exampleTranslation: 'Con hổ có sọc đen trên bộ lông màu cam.' },
    zh: { word: '老虎', nativeScript: '老虎', romanization: 'lǎohǔ', meaningVietnamese: 'Con hổ', meaningEnglish: 'Large wild striped feline predator', example: '老虎在森林里静静巡视。', exampleTranslation: 'Con hổ đang lặng lẽ đi tuần trong rừng.' },
    ja: { word: '虎', nativeScript: '虎', romanization: 'tora (とら)', meaningVietnamese: 'Con hổ', meaningEnglish: 'Large wild striped feline predator', example: '虎は黄色と黒のしま模様があります。', exampleTranslation: 'Con hổ có sọc vằn vàng và đen.' },
    ko: { word: '호랑이', nativeScript: '호랑이', romanization: 'horangi', meaningVietnamese: 'Con hổ', meaningEnglish: 'Large wild striped feline predator', example: '호랑이는 용맹한 동물입니다.', exampleTranslation: 'Con hổ là một loài động vật dũng mãnh.' },
    fr: { word: 'tigre', nativeScript: 'tigre', romanization: '[tiɡʁ]', meaningVietnamese: 'Con hổ', meaningEnglish: 'Grand félin rayé sauvage', example: 'Le tigre se déplace silencieusement.', exampleTranslation: 'Con hổ di chuyển một cách rón rén.' },
    de: { word: 'Tiger', nativeScript: 'Tiger', romanization: '[ˈtiːɡɐ]', meaningVietnamese: 'Con hổ', meaningEnglish: 'Große gestreifte Raubkatze', example: 'Der Tiger hat schwarze Streifen.', exampleTranslation: 'Con hổ có các sọc vằn màu đen.' },
    es: { word: 'tigre', nativeScript: 'tigre', romanization: 'tigre', meaningVietnamese: 'Con hổ', meaningEnglish: 'Gran felino salvaje rayado', example: 'El tigre tiene rayas negras distintivas.', exampleTranslation: 'Con hổ có những sọc đen đặc trưng.' },
    ru: { word: 'тигр', nativeScript: 'тигр', romanization: 'tigr [tʲiɡr]', meaningVietnamese: 'Con hổ', meaningEnglish: 'Крупная полосатая хищная кошка', example: 'Тигр тихо идет по тайге.', exampleTranslation: 'Con hổ lặng lẽ bước đi trên rừng taiga.' },
    th: { word: 'เสือ', nativeScript: 'เสือ', romanization: 'sɯ̌a', meaningVietnamese: 'Con hổ', meaningEnglish: 'Large wild striped feline predator', example: 'เสือมีลายสีดำบนขนสีส้ม', exampleTranslation: 'Con hổ có sọc đen trên bộ lông màu cam.' },
    ar: { word: 'نمر', nativeScript: 'نمر', romanization: 'nimr', meaningVietnamese: 'Con hổ', meaningEnglish: 'Large wild striped feline predator', example: 'النمر لديه خطوط سوداء مميزة.', exampleTranslation: 'Con hổ có các sọc đen đặc trưng.' }
  },
  elephant: {
    en: { word: 'elephant', romanization: '[ˈɛləfənt]', meaningVietnamese: 'Con voi', meaningEnglish: 'Huge mammal with a trunk and large ears', example: 'The elephant sprayed water with its trunk.', exampleTranslation: 'Con voi phun nước bằng chiếc vòi của nó.' },
    zh: { word: '大象', nativeScript: '大象', romanization: 'dàxiàng', meaningVietnamese: 'Con voi', meaningEnglish: 'Huge mammal with a trunk', example: '大象用长鼻子喷水。', exampleTranslation: 'Con voi dùng chiếc vòi dài phun nước.' },
    ja: { word: '象', nativeScript: '象', romanization: 'zō (ぞう)', meaningVietnamese: 'Con voi', meaningEnglish: 'Huge mammal with a trunk', example: '象が長い鼻で水をかけています。', exampleTranslation: 'Con voi dùng vòi dài phun nước.' },
    ko: { word: '코끼리', nativeScript: '코끼리', romanization: 'kokkiri', meaningVietnamese: 'Con voi', meaningEnglish: 'Huge mammal with a trunk', example: '코끼리가 긴 코로 물을 뿜습니다.', exampleTranslation: 'Con voi phun nước bằng cái vòi dài.' },
    fr: { word: 'éléphant', nativeScript: 'éléphant', romanization: '[elefɑ̃]', meaningVietnamese: 'Con voi', meaningEnglish: 'Grand mammifère avec une trompe', example: 'L’éléphant utilise sa trompe pour boire.', exampleTranslation: 'Con voi dùng vòi của nó để uống nước.' },
    de: { word: 'Elefant', nativeScript: 'Elefant', romanization: '[eleˈfant]', meaningVietnamese: 'Con voi', meaningEnglish: 'Großes Säugetier mit Rüssel', example: 'Der Elefant spritzt Wasser mit seinem Rüssel.', exampleTranslation: 'Con voi phun nước bằng chiếc vòi của nó.' },
    es: { word: 'elefante', nativeScript: 'elefante', romanization: 'elefante', meaningVietnamese: 'Con voi', meaningEnglish: 'Mamífero enorme con trompa', example: 'El elefante usó su trompa para beber.', exampleTranslation: 'Con voi đã dùng chiếc vòi của mình để uống nước.' },
    ru: { word: 'слон', nativeScript: 'слон', romanization: 'slon [slon]', meaningVietnamese: 'Con voi', meaningEnglish: 'Огромное млекопитающее с хоботом', example: 'Слон набирает воду хоботом.', exampleTranslation: 'Con voi hút nước bằng cái vòi.' },
    th: { word: 'ช้าง', nativeScript: 'ช้าง', romanization: 'cháːŋ', meaningVietnamese: 'Con voi', meaningEnglish: 'Huge mammal with a trunk', example: 'ช้างใช้งวงยาวพ่นน้ำ', exampleTranslation: 'Con voi dùng vòi dài phun nước.' },
    ar: { word: 'فيل', nativeScript: 'فيل', romanization: 'fīl', meaningVietnamese: 'Con voi', meaningEnglish: 'Huge mammal with a trunk', example: 'الفيل يستخدم خرطومه لرش الماء.', exampleTranslation: 'Con voi dùng chiếc vòi của nó để phun nước.' }
  }
};

const genericVietnameseMap = {
  cat: 'Con mèo',
  dog: 'Con chó',
  lion: 'Con sư tử',
  tiger: 'Con hổ',
  elephant: 'Con voi',
  bear: 'Con gấu',
  wolf: 'Con chó sói',
  fox: 'Con cáo',
  deer: 'Con hươu',
  rabbit: 'Con thỏ',
  mouse: 'Con chuột',
  horse: 'Con ngựa',
  cow: 'Con bò',
  pig: 'Con heo (lợn)',
  sheep: 'Con cừu',
  monkey: 'Con khỉ',
  snake: 'Con rắn',
  eagle: 'Chim đại bàng',
  duck: 'Con vịt',
  chicken: 'Con gà',
  fish: 'Con cá',
  apple: 'Quả táo',
  banana: 'Quả chuối',
  orange: 'Quả cam',
  bread: 'Bánh mì',
  rice: 'Cơm / Gạo',
  water: 'Nước uống',
  milk: 'Sữa tươi',
  coffee: 'Cà phê',
  tea: 'Trà',
  book: 'Quyển sách',
  pen: 'Cây bút',
  phone: 'Điện thoại',
  computer: 'Máy tính',
  car: 'Xe hơi',
  bus: 'Xe buýt',
  train: 'Tàu hỏa',
  house: 'Ngôi nhà',
  school: 'Trường học',
  hospital: 'Bệnh viện',
  sun: 'Mặt trời',
  moon: 'Mặt trăng',
  star: 'Ngôi sao',
  rain: 'Cơn mưa',
  snow: 'Tuyết rơi',
  friend: 'Người bạn',
  family: 'Gia đình',
  love: 'Tình yêu',
  happy: 'Vui vẻ',
  sad: 'Buồn bã'
};

const languages = ['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'th', 'ar', 'vi'];

languages.forEach(lang => {
  const file = path.join(vocabDir, `${lang}.json`);
  if (!fs.existsSync(file)) return;

  const raw = fs.readFileSync(file, 'utf8');
  let items = JSON.parse(raw);

  let updatedCount = 0;

  items = items.map(item => {
    // Check if we have specific overrides for key words (like cat, dog, lion, tiger, elephant)
    const key = (item.romanization || item.word || '').toLowerCase();
    
    if (dictionaryMaster[key] && dictionaryMaster[key][lang]) {
      const data = dictionaryMaster[key][lang];
      updatedCount++;
      return {
        ...item,
        word: data.word,
        nativeScript: data.nativeScript || data.word,
        romanization: data.romanization,
        meaning: data.meaningEnglish,
        meaningEnglish: data.meaningEnglish,
        meaningVietnamese: data.meaningVietnamese,
        translation: data.meaningVietnamese,
        example: data.example,
        exampleTranslation: data.exampleTranslation
      };
    }

    // Clean up generic template strings across all words
    let vietMeaning = item.meaningVietnamese || item.translation || '';
    if (!vietMeaning || vietMeaning === 'A common animal.' || vietMeaning === 'Một loài động vật thông thường.') {
      vietMeaning = genericVietnameseMap[key] || `${item.word} (Nghĩa Tiếng Việt)`;
    }

    let engMeaning = item.meaningEnglish || item.meaning || '';
    if (!engMeaning || engMeaning === 'A common animal.' || engMeaning === 'よくある動物。' || engMeaning === '一种常见的动物。') {
      engMeaning = `Distinct vocabulary word: ${item.word}`;
    }

    return {
      ...item,
      meaning: engMeaning,
      meaningEnglish: engMeaning,
      meaningVietnamese: vietMeaning,
      translation: vietMeaning,
      romanization: (item.romanization === 'cat' && lang !== 'en') ? item.word : item.romanization
    };
  });

  fs.writeFileSync(file, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Updated ${lang}.json: ${updatedCount} key overrides applied, total ${items.length} words cleaned.`);
});

console.log('Vocabulary database purge complete!');
