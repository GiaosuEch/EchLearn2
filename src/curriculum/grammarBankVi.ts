import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankVi: GrammarTopic[] = [
  {
    id: 'vi_g1', title: 'Dai tu nhan xung (Personal pronouns)', level: 'A1',
    description: 'Vietnamese personal pronouns based on age, gender, and relationship',
    theory: 'Vietnamese pronouns encode social relationships. "Toi" (I, neutral), "anh" (older male/you), "chi" (older female/you), "em" (younger person/I to elder), "ban" (friend/you). Choice depends on relative age and formality.',
    examples: [{ sentence: 'Em chao anh! (I greet you, older brother)', explanation: '"Em" = I (younger), "anh" = you (older male)' }],
    commonMistakes: ['Using "toi" with close friends (too formal) -> Use "minh" or "to" informally'],
    questions: [
      { id: 'vi_g1q1', question: 'Speaking to an older woman, you call her:', options: ['chi', 'anh', 'em', 'ban'], correctAnswer: 'chi', explanation: '"Chi" is used for an older female.' },
      { id: 'vi_g1q2', question: 'A younger person refers to themselves as:', options: ['em', 'anh', 'chi', 'ong'], correctAnswer: 'em', explanation: '"Em" = I/me when speaking to someone older.' },
    ],
    tags: ['pronouns', 'basics']
  },
  {
    id: 'vi_g2', title: 'Tu chi loai (Classifiers)', level: 'A1',
    description: 'Noun classifiers: con, cai, chiec, qua and more',
    theory: 'Vietnamese nouns need classifiers when counting or specifying. Common classifiers: "con" (animals, some objects), "cai" (most inanimate objects), "chiec" (single items of a pair), "qua/trai" (round fruits).',
    formula: 'number + classifier + noun',
    examples: [{ sentence: 'hai con meo (two cats) / ba cai ban (three tables)', explanation: '"con" for animals, "cai" for objects' }],
    commonMistakes: ['hai cai meo (wrong classifier for animals) -> hai con meo'],
    questions: [
      { id: 'vi_g2q1', question: 'ba ___ cho (three dogs)', options: ['con', 'cai', 'chiec', 'qua'], correctAnswer: 'con', explanation: '"Con" is the classifier for animals.' },
      { id: 'vi_g2q2', question: 'mot ___ giay (one shoe)', options: ['chiec', 'con', 'cai', 'qua'], correctAnswer: 'chiec', explanation: '"Chiec" is used for single items, especially from pairs.' },
    ],
    tags: ['classifiers', 'basics']
  },
  {
    id: 'vi_g3', title: 'Da/dang/se (Tense markers)', level: 'A2',
    description: 'Expressing past, present progressive, and future',
    theory: 'Vietnamese verbs do not conjugate. Tense is marked by particles: "da" (past / completed), "dang" (present / ongoing), "se" (future). They go before the verb. "roi" can follow the verb to emphasize completion.',
    formula: 'Subject + da/dang/se + verb',
    examples: [{ sentence: 'Toi da an com roi. / Anh ay dang lam viec. / Chung toi se di.', explanation: '"da...roi" = already ate; "dang" = is working; "se" = will go' }],
    commonMistakes: ['Toi da dang an (stacking tense markers) -> Choose one: Toi da an or Toi dang an'],
    questions: [
      { id: 'vi_g3q1', question: '"She will study tomorrow" -> Co ay ___ hoc ngay mai.', options: ['se', 'da', 'dang', 'roi'], correctAnswer: 'se', explanation: '"Se" marks future tense before the verb.' },
      { id: 'vi_g3q2', question: '"I already ate" -> Toi ___ an com roi.', options: ['da', 'dang', 'se', 'chua'], correctAnswer: 'da', explanation: '"Da...roi" marks a completed action.' },
    ],
    tags: ['tense', 'aspect']
  },
  {
    id: 'vi_g4', title: 'Tu noi (Connectors)', level: 'A2',
    description: 'Using vi/nen/nhung/ma to connect clauses',
    theory: '"Vi" = because (cause), "nen" = so/therefore (result). "Nhung" = but (contrast). "Ma" = but/yet (contrast, more colloquial). "Vi...nen" is a common paired connector.',
    formula: 'Vi + clause, nen + clause | clause + nhung + clause',
    examples: [{ sentence: 'Vi troi mua nen toi o nha. (Because it rains, I stay home)', explanation: '"Vi...nen" = because...therefore' }],
    commonMistakes: ['Vi troi mua nhung toi o nha (mixing cause with contrast) -> Vi troi mua nen toi o nha'],
    questions: [
      { id: 'vi_g4q1', question: '___ troi lanh ___ toi mac ao am.', options: ['Vi...nen', 'Nhung...ma', 'Ma...vi', 'Nen...vi'], correctAnswer: 'Vi...nen', explanation: '"Vi...nen" = because...so (cause and result).' },
      { id: 'vi_g4q2', question: 'Toi muon di ___ toi khong co thoi gian.', options: ['nhung', 'nen', 'vi', 'va'], correctAnswer: 'nhung', explanation: '"Nhung" = but, showing contrast between wanting and not having time.' },
    ],
    tags: ['connectors', 'syntax']
  },
  {
    id: 'vi_g5', title: 'Cau bi dong (duoc/bi passive)', level: 'B1',
    description: 'Passive constructions with duoc (positive) and bi (negative)',
    theory: '"Duoc" marks passive with positive or neutral outcomes. "Bi" marks passive with negative or undesirable outcomes. Pattern: subject + duoc/bi + agent + verb.',
    formula: 'Subject + duoc/bi + (agent) + verb',
    examples: [{ sentence: 'Anh ay duoc khen. / Co ay bi phat.', explanation: '"duoc khen" = was praised (positive); "bi phat" = was punished (negative)' }],
    commonMistakes: ['Co ay duoc phat (using duoc for punishment) -> Co ay bi phat'],
    questions: [
      { id: 'vi_g5q1', question: '"He was praised by the teacher" -> Anh ay ___ co giao khen.', options: ['duoc', 'bi', 'da', 'dang'], correctAnswer: 'duoc', explanation: 'Praise is positive -> use "duoc".' },
      { id: 'vi_g5q2', question: '"The child was scolded" -> Dua tre ___ mang.', options: ['bi', 'duoc', 'se', 'dang'], correctAnswer: 'bi', explanation: 'Scolding is negative -> use "bi".' },
    ],
    tags: ['passive', 'intermediate']
  },
  {
    id: 'vi_g6', title: 'Cau truc so sanh (Comparisons)', level: 'B1',
    description: 'Comparative and superlative structures with hon/nhat/bang',
    theory: '"hon" = more than (comparative). "nhat" = most (superlative). "bang" = equal to. Pattern: A + adj + hon + B (comparative), A + adj + nhat (superlative), A + adj + bang + B (equal).',
    formula: 'A + adj + hon/bang + B | A + adj + nhat',
    examples: [{ sentence: 'Anh ay cao hon toi. / Co ay la nguoi gioi nhat lop.', explanation: '"cao hon" = taller than; "gioi nhat" = best in class' }],
    commonMistakes: ['Anh ay hon cao toi (wrong word order) -> Anh ay cao hon toi'],
    questions: [
      { id: 'vi_g6q1', question: '"This book is more interesting than that one" -> Cuon sach nay hay ___ cuon kia.', options: ['hon', 'nhat', 'bang', 'lam'], correctAnswer: 'hon', explanation: '"hon" after adjective = comparative (more...than).' },
      { id: 'vi_g6q2', question: '"She is the tallest" -> Co ay cao ___.', options: ['nhat', 'hon', 'bang', 'lam'], correctAnswer: 'nhat', explanation: '"nhat" after adjective = superlative (the most).' },
    ],
    tags: ['comparison', 'intermediate']
  },
  {
    id: 'vi_g7', title: 'Thanh ngu (Idioms/proverbs)', level: 'B2',
    description: 'Common Vietnamese idiomatic expressions and proverbs',
    theory: 'Vietnamese idioms (thanh ngu) and proverbs (tuc ngu) are widely used. They often use four-word patterns or rhyming structures. Understanding them is key to natural fluency.',
    examples: [{ sentence: 'Nuoc chay da mon (Dripping water wears away stone = persistence pays off)', explanation: 'A proverb encouraging perseverance' }],
    commonMistakes: ['Using idioms literally in translation -> Understand the figurative meaning'],
    questions: [
      { id: 'vi_g7q1', question: '"An qua nho ke trong cay" means:', options: ['Be grateful to those who help you', 'Eat fruit every day', 'Plant more trees', 'Fruit is delicious'], correctAnswer: 'Be grateful to those who help you', explanation: 'Literally "Eating fruit, remember the planter" = show gratitude.' },
      { id: 'vi_g7q2', question: '"Hoc an hoc noi, hoc goi hoc mo" teaches about:', options: ['Learning manners and social skills', 'Learning to cook', 'Studying at school', 'Opening gifts'], correctAnswer: 'Learning manners and social skills', explanation: 'This proverb emphasizes learning proper behavior in daily life.' },
    ],
    tags: ['idioms', 'proverbs', 'advanced']
  },
  {
    id: 'vi_g8', title: 'Phong cach ngon ngu (Register)', level: 'B2',
    description: 'Formal vs informal register in Vietnamese',
    theory: 'Vietnamese has distinct registers. Formal: "quy vi" (you, honorific), "xin" (please, polite), Sino-Vietnamese words. Informal: slang, shortened forms, casual pronouns (may, tau, mi). Written formal uses different vocabulary than spoken casual.',
    examples: [{ sentence: 'Formal: Xin moi quy vi. / Informal: Vao di may!', explanation: '"Xin moi quy vi" = Please come in (formal); "Vao di may" = Come in! (very informal)' }],
    commonMistakes: ['Using "may/tau" in formal settings (rude) -> Use "anh/chi" or "quy vi"'],
    questions: [
      { id: 'vi_g8q1', question: 'Which is the formal way to say "please sit down"?', options: ['Xin moi ngoi', 'Ngoi di may', 'Ngoi xuong', 'Ngoi di'], correctAnswer: 'Xin moi ngoi', explanation: '"Xin moi" is the polite/formal invitation form.' },
      { id: 'vi_g8q2', question: 'In a business letter, you would address the reader as:', options: ['Quy ong/ba', 'May', 'Ban', 'Cau'], correctAnswer: 'Quy ong/ba', explanation: '"Quy ong/ba" is the formal honorific for Mr./Mrs. in correspondence.' },
    ],
    tags: ['register', 'formality', 'advanced']
  },
];
