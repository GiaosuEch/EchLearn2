export type CuratedStarterVocabularyItem = {
  id: string;
  language: string;
  word: string;
  nativeScript: string;
  romanization: string;
  partOfSpeech: 'phrase' | 'noun' | 'verb' | 'question' | 'adjective' | 'adverb';
  meaningVietnamese: string;
  example: string;
};

const starterVocabulary: Record<string, CuratedStarterVocabularyItem[]> = {
  en: [
    ['mitigate', 'mitigate', 'mitigate', 'verb', 'giảm nhẹ, làm dịu bớt', 'The government must take action to mitigate the effects of climate change.'],
    ['proliferation', 'proliferation', 'proliferation', 'noun', 'sự gia tăng nhanh chóng', 'The proliferation of smartphones has changed how we communicate.'],
    ['ubiquitous', 'ubiquitous', 'ubiquitous', 'adjective', 'có mặt ở khắp nơi', 'Plastic has become a ubiquitous material in modern manufacturing.'],
    ['paradigm', 'paradigm', 'paradigm', 'noun', 'mô hình, hệ nhận thức', 'The discovery of DNA created a new paradigm in biological sciences.'],
    ['empirical', 'empirical', 'empirical', 'adjective', 'dựa trên kinh nghiệm/thực nghiệm', 'The theory is supported by robust empirical evidence.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_en_${index + 1}`, language: 'en', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),
  
  fr: [
    ['atténuer', 'atténuer', 'atténuer', 'verb', 'giảm nhẹ', 'Le gouvernement doit atténuer la crise.'],
    ['prolifération', 'prolifération', 'prolifération', 'noun', 'sự gia tăng', 'La prolifération des armes.'],
    ['omniprésent', 'omniprésent', 'omniprésent', 'adjective', 'có mặt khắp nơi', 'La technologie est omniprésente.'],
    ['paradigme', 'paradigme', 'paradigme', 'noun', 'mô hình', 'Un nouveau paradigme économique.'],
    ['empirique', 'empirique', 'empirique', 'adjective', 'thực nghiệm', 'Des données empiriques.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_fr_${index + 1}`, language: 'fr', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  de: [
    ['abmildern', 'abmildern', 'abmildern', 'verb', 'giảm nhẹ', 'Wir müssen die Folgen abmildern.'],
    ['Verbreitung', 'Verbreitung', 'Verbreitung', 'noun', 'sự gia tăng', 'Die Verbreitung von Wissen.'],
    ['allgegenwärtig', 'allgegenwärtig', 'allgegenwärtig', 'adjective', 'có mặt khắp nơi', 'Stress ist allgegenwärtig.'],
    ['Paradigma', 'Paradigma', 'Paradigma', 'noun', 'mô hình', 'Ein neues Paradigma.'],
    ['empirisch', 'empirisch', 'empirisch', 'adjective', 'thực nghiệm', 'Empirische Forschung.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_de_${index + 1}`, language: 'de', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  zh: [
    ['缓解', '缓解', 'huǎn jiě', 'verb', 'giảm nhẹ', '这项政策有助于缓解压力。'],
    ['激增', '激增', 'jī zēng', 'noun', 'sự gia tăng', '人口的激增带来挑战。'],
    ['无处不在', '无处不在', 'wú chù bù zài', 'adjective', 'có mặt khắp nơi', '互联网现在无处不在。'],
    ['范式', '范式', 'fàn shì', 'noun', 'mô hình', '科学界的一个新范式。'],
    ['实证', '实证', 'shí zhèng', 'adjective', 'thực nghiệm', '我们需要实证研究。']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_zh_${index + 1}`, language: 'zh', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  ja: [
    ['緩和する', '緩和する', 'kanwa suru', 'verb', 'giảm nhẹ', '症状を緩和する。'],
    ['激増', '激増', 'gekizou', 'noun', 'sự gia tăng', '観光客の激増。'],
    ['遍在する', '遍在する', 'henzai suru', 'adjective', 'có mặt khắp nơi', '遍在するネットワーク。'],
    ['パラダイム', 'パラダイム', 'paradaimu', 'noun', 'mô hình', 'パラダイムシフトが起きる。'],
    ['実証的', '実証的', 'jisshouteki', 'adjective', 'thực nghiệm', '実証的な証拠が必要だ。']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_ja_${index + 1}`, language: 'ja', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  ko: [
    ['완화하다', '완화하다', 'wanhwahada', 'verb', 'giảm nhẹ', '증상을 완화하다.'],
    ['급증', '급증', 'geupjeung', 'noun', 'sự gia tăng', '수요의 급증.'],
    ['편재하는', '편재하는', 'pyeonjaehaneun', 'adjective', 'có mặt khắp nơi', '편재하는 기술.'],
    ['패러다임', '패러다임', 'paereodaim', 'noun', 'mô hình', '새로운 패러다임.'],
    ['실증적', '실증적', 'siljeungjeok', 'adjective', 'thực nghiệm', '실증적 연구.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_ko_${index + 1}`, language: 'ko', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  es: [
    ['mitigar', 'mitigar', 'mitigar', 'verb', 'giảm nhẹ', 'Debemos mitigar el daño.'],
    ['proliferación', 'proliferación', 'proliferación', 'noun', 'sự gia tăng', 'La proliferación de ideas.'],
    ['ubicuo', 'ubicuo', 'ubicuo', 'adjective', 'có mặt khắp nơi', 'El uso del teléfono es ubicuo.'],
    ['paradigma', 'paradigma', 'paradigma', 'noun', 'mô hình', 'Un cambio de paradigma.'],
    ['empírico', 'empírico', 'empírico', 'adjective', 'thực nghiệm', 'Evidencia empírica.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_es_${index + 1}`, language: 'es', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  it: [
    ['mitigare', 'mitigare', 'mitigare', 'verb', 'giảm nhẹ', 'Dobbiamo mitigare i rischi.'],
    ['proliferazione', 'proliferazione', 'proliferazione', 'noun', 'sự gia tăng', 'La proliferazione delle armi.'],
    ['onnipresente', 'onnipresente', 'onnipresente', 'adjective', 'có mặt khắp nơi', 'La tecnologia è onnipresente.'],
    ['paradigma', 'paradigma', 'paradigma', 'noun', 'mô hình', 'Un nuovo paradigma.'],
    ['empirico', 'empirico', 'empirico', 'adjective', 'thực nghiệm', 'Ricerca empirica.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_it_${index + 1}`, language: 'it', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  pt: [
    ['mitigar', 'mitigar', 'mitigar', 'verb', 'giảm nhẹ', 'É preciso mitigar os impactos.'],
    ['proliferação', 'proliferação', 'proliferação', 'noun', 'sự gia tăng', 'A proliferação de doenças.'],
    ['onipresente', 'onipresente', 'onipresente', 'adjective', 'có mặt khắp nơi', 'A internet é onipresente.'],
    ['paradigma', 'paradigma', 'paradigma', 'noun', 'mô hình', 'Um novo paradigma social.'],
    ['empírico', 'empírico', 'empírico', 'adjective', 'thực nghiệm', 'Estudo empírico.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_pt_${index + 1}`, language: 'pt', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  ru: [
    ['смягчать', 'смягчать', 'smyagchat', 'verb', 'giảm nhẹ', 'Нужно смягчать последствия.'],
    ['распространение', 'распространение', 'rasprostraneniye', 'noun', 'sự gia tăng', 'Распространение информации.'],
    ['вездесущий', 'вездесущий', 'vezdesushchiy', 'adjective', 'có mặt khắp nơi', 'Вездесущий интернет.'],
    ['парадигма', 'парадигма', 'paradigma', 'noun', 'mô hình', 'Новая парадигма.'],
    ['эмпирический', 'эмпирический', 'empiricheskiy', 'adjective', 'thực nghiệm', 'Эмпирический метод.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_ru_${index + 1}`, language: 'ru', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  vi: [
    ['giảm nhẹ', 'giảm nhẹ', 'giảm nhẹ', 'verb', 'giảm nhẹ', 'Chính phủ cần giảm nhẹ hậu quả.'],
    ['sự gia tăng', 'sự gia tăng', 'sự gia tăng', 'noun', 'sự gia tăng', 'Sự gia tăng dân số.'],
    ['khắp nơi', 'khắp nơi', 'khắp nơi', 'adjective', 'có mặt khắp nơi', 'Mạng xã hội có mặt khắp nơi.'],
    ['mô hình', 'mô hình', 'mô hình', 'noun', 'mô hình', 'Một mô hình kinh tế mới.'],
    ['thực nghiệm', 'thực nghiệm', 'thực nghiệm', 'adjective', 'thực nghiệm', 'Bằng chứng thực nghiệm.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_vi_${index + 1}`, language: 'vi', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  th: [
    ['บรรเทา', 'บรรเทา', 'bantao', 'verb', 'giảm nhẹ', 'ช่วยบรรเทาความเจ็บปวด'],
    ['การแพร่กระจาย', 'การแพร่กระจาย', 'kan phrae krachai', 'noun', 'sự gia tăng', 'การแพร่กระจายของข่าวสาร'],
    ['มีอยู่ทุกหนทุกแห่ง', 'มีอยู่ทุกหนทุกแห่ง', 'mi yu thuk hon thuk haeng', 'adjective', 'có mặt khắp nơi', 'สมาร์ทโฟนมีอยู่ทุกหนทุกแห่ง'],
    ['กระบวนทัศน์', 'กระบวนทัศน์', 'krabuan that', 'noun', 'mô hình', 'กระบวนทัศน์ใหม่'],
    ['เชิงประจักษ์', 'เชิงประจักษ์', 'choeng prachak', 'adjective', 'thực nghiệm', 'หลักฐานเชิงประจักษ์']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_th_${index + 1}`, language: 'th', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example })),

  ar: [
    ['يُخفّف', 'يخفف', 'yukhaffif', 'verb', 'giảm nhẹ', 'يجب أن نخفف من المخاطر.'],
    ['انتشار', 'انتشار', 'intishar', 'noun', 'sự gia tăng', 'انتشار التكنولوجيا.'],
    ['موجود في كل مكان', 'موجود في كل مكان', 'mawjud fi kull makan', 'adjective', 'có mặt khắp nơi', 'الإنترنت موجود في كل مكان.'],
    ['نموذج', 'نموذج', 'namudhaj', 'noun', 'mô hình', 'نموذج فكري جديد.'],
    ['تجريبي', 'تجريبي', 'tajribi', 'adjective', 'thực nghiệm', 'دليل تجريبي.']
  ].map(([word, nativeScript, romanization, partOfSpeech, meaningVietnamese, example], index) => ({ id: `academic_ar_${index + 1}`, language: 'ar', word, nativeScript, romanization, partOfSpeech: partOfSpeech as CuratedStarterVocabularyItem['partOfSpeech'], meaningVietnamese, example }))
};

export function getCuratedStarterVocabulary(language: string): CuratedStarterVocabularyItem[] {
  return starterVocabulary[language] ? [...starterVocabulary[language]] : [];
}
