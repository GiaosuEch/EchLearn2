import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankTh: GrammarTopic[] = [
  {
    id: 'th_g1', title: 'ครับ/ค่ะ (Polite particles)', level: 'A1',
    description: 'Gender-based polite sentence-ending particles',
    theory: 'Thai uses polite particles at the end of sentences. Males say "ครับ" (khrap) and females say "ค่ะ" (kha, falling tone) for statements or "คะ" (kha, high tone) for questions. These show respect and politeness.',
    examples: [{ sentence: 'สวัสดีครับ / สวัสดีค่ะ', explanation: 'Males end with ครับ, females with ค่ะ when greeting' }],
    commonMistakes: ['Male using ค่ะ or female using ครับ -> Match particle to speaker gender'],
    questions: [
      { id: 'th_g1q1', question: 'A male speaker says: ขอบคุณ___', options: ['ครับ', 'ค่ะ', 'คะ', 'จ้ะ'], correctAnswer: 'ครับ', explanation: 'Male speakers use ครับ for polite ending.' },
      { id: 'th_g1q2', question: 'A female speaker asks: คุณชื่ออะไร___', options: ['คะ', 'ครับ', 'ค่ะ', 'จ้า'], correctAnswer: 'คะ', explanation: 'Female speakers use คะ (high tone) for questions.' },
    ],
    tags: ['particles', 'politeness', 'basics']
  },
  {
    id: 'th_g2', title: 'ลักษณนาม (Classifiers)', level: 'A1',
    description: 'Noun classifiers: ตัว, คน, อัน, ใบ and more',
    theory: 'Thai nouns require classifiers when counting. Common classifiers: คน (people), ตัว (animals/shirts), อัน (small objects), ใบ (flat/hollow things), เล่ม (books). Pattern: noun + number + classifier.',
    formula: 'noun + number + classifier',
    examples: [{ sentence: 'แมว 3 ตัว (cats, 3, classifier)', explanation: '"ตัว" is the classifier for animals' }],
    commonMistakes: ['หมา 2 คน (คน is for people, not dogs) -> หมา 2 ตัว'],
    questions: [
      { id: 'th_g2q1', question: 'นักเรียน 5 ___', options: ['คน', 'ตัว', 'อัน', 'ใบ'], correctAnswer: 'คน', explanation: '"คน" is the classifier for people (นักเรียน = student).' },
      { id: 'th_g2q2', question: 'หนังสือ 2 ___', options: ['เล่ม', 'ตัว', 'คน', 'อัน'], correctAnswer: 'เล่ม', explanation: '"เล่ม" is the classifier for books.' },
    ],
    tags: ['classifiers', 'basics']
  },
  {
    id: 'th_g3', title: 'กำลัง...อยู่ (Progressive)', level: 'A2',
    description: 'Expressing actions in progress',
    theory: 'To express an ongoing action, place "กำลัง" before the verb and optionally "อยู่" after. กำลัง alone or อยู่ alone can also mark progressive aspect.',
    formula: 'Subject + กำลัง + verb + (อยู่)',
    examples: [{ sentence: 'เขากำลังกินข้าวอยู่', explanation: '"กำลัง...อยู่" frames "กิน" (eat) as happening now' }],
    commonMistakes: ['เขากินอยู่กำลัง (wrong word order) -> เขากำลังกินอยู่'],
    questions: [
      { id: 'th_g3q1', question: 'She is reading a book: เธอ___ อ่านหนังสือ อยู่', options: ['กำลัง', 'แล้ว', 'จะ', 'เคย'], correctAnswer: 'กำลัง', explanation: '"กำลัง" before the verb marks progressive aspect.' },
      { id: 'th_g3q2', question: 'Which shows an action in progress?', options: ['เขากำลังนอนอยู่', 'เขานอนแล้ว', 'เขาจะนอน', 'เขาเคยนอน'], correctAnswer: 'เขากำลังนอนอยู่', explanation: '"กำลัง...อยู่" = in progress; "แล้ว" = completed; "จะ" = future.' },
    ],
    tags: ['tense', 'progressive']
  },
  {
    id: 'th_g4', title: 'แล้ว/ยัง (Completion markers)', level: 'A2',
    description: 'Expressing completed and not-yet-completed actions',
    theory: '"แล้ว" after a verb means the action is completed (already). "ยัง" in a question asks if something is done yet. "ยังไม่" means "not yet".',
    formula: 'verb + แล้ว (done) | ยังไม่ + verb (not yet)',
    examples: [{ sentence: 'กินข้าวแล้ว / ยังไม่ได้กิน', explanation: '"แล้ว" = already ate; "ยังไม่ได้กิน" = haven\'t eaten yet' }],
    commonMistakes: ['ยังกินแล้ว (mixing completion markers) -> กินแล้ว or ยังไม่ได้กิน'],
    questions: [
      { id: 'th_g4q1', question: '"Have you eaten?" -> กินข้าว___หรือยัง', options: ['แล้ว', 'อยู่', 'กำลัง', 'จะ'], correctAnswer: 'แล้ว', explanation: '"แล้วหรือยัง" is the pattern for asking if something is done.' },
      { id: 'th_g4q2', question: '"Not yet" in Thai is:', options: ['ยังไม่', 'ไม่แล้ว', 'กำลังไม่', 'แล้วไม่'], correctAnswer: 'ยังไม่', explanation: '"ยังไม่" means "not yet" — placed before the verb.' },
    ],
    tags: ['aspect', 'completion']
  },
  {
    id: 'th_g5', title: 'ถูก/โดน (Passive voice)', level: 'B1',
    description: 'Forming passive constructions, often with negative connotation',
    theory: '"ถูก" and "โดน" create passive constructions. "โดน" is more colloquial and usually implies something unpleasant. Pattern: subject + ถูก/โดน + verb (+ by agent).',
    formula: 'Subject + ถูก/โดน + verb',
    examples: [{ sentence: 'เขาถูกดุ (He was scolded)', explanation: '"ถูก" marks passive; often used for unpleasant events' }],
    commonMistakes: ['เขาถูกรัก (passive for positive events sounds odd) -> use active: ทุกคนรักเขา'],
    questions: [
      { id: 'th_g5q1', question: '"He was bitten by a dog" -> เขา___หมากัด', options: ['โดน', 'กำลัง', 'จะ', 'ได้'], correctAnswer: 'โดน', explanation: '"โดน" is used for passive, especially unpleasant experiences.' },
      { id: 'th_g5q2', question: 'Which sentence is passive?', options: ['เธอถูกตำหนิ', 'เธอตำหนิเขา', 'เธอกำลังพูด', 'เธอจะไป'], correctAnswer: 'เธอถูกตำหนิ', explanation: '"ถูก" before verb = passive: She was blamed.' },
    ],
    tags: ['passive', 'intermediate']
  },
  {
    id: 'th_g6', title: 'ให้ (Causative/benefactive)', level: 'B1',
    description: 'Using ให้ for causation, permission, and doing things for someone',
    theory: '"ให้" has multiple uses: (1) causative — make/let someone do something, (2) benefactive — do something for someone, (3) give. Pattern varies by meaning.',
    formula: 'Subject + ให้ + person + verb (causative)',
    examples: [{ sentence: 'แม่ให้ลูกไปโรงเรียน (Mom lets/makes the child go to school)', explanation: '"ให้" here means "let/make" — causative use' }],
    commonMistakes: ['ให้เขาทำ (ambiguous: let him do / make him do) -> add context to clarify'],
    questions: [
      { id: 'th_g6q1', question: '"The teacher told students to read" -> ครู___นักเรียนอ่านหนังสือ', options: ['ให้', 'ถูก', 'โดน', 'กำลัง'], correctAnswer: 'ให้', explanation: '"ให้" in causative means to tell/make/let someone do something.' },
      { id: 'th_g6q2', question: 'Which sentence means "I did it for you"?', options: ['ฉันทำให้คุณ', 'ฉันให้คุณทำ', 'ฉันถูกทำ', 'ฉันโดนทำ'], correctAnswer: 'ฉันทำให้คุณ', explanation: 'verb + ให้ + person = benefactive (do something for someone).' },
    ],
    tags: ['causative', 'intermediate']
  },
  {
    id: 'th_g7', title: 'ทั้ง...ทั้ง / ไม่...ก็ (Correlatives)', level: 'B2',
    description: 'Correlative conjunctions for both...and, neither...nor, if not...then',
    theory: '"ทั้ง...ทั้ง" = both...and. "ไม่...ก็..." = if not...then / either...or. These create balanced compound sentences emphasizing paired ideas.',
    examples: [{ sentence: 'เขาทั้งเก่งทั้งขยัน (He is both talented and hardworking)', explanation: '"ทั้ง...ทั้ง" pairs two qualities' }],
    commonMistakes: ['เขาทั้งเก่ง (only one ทั้ง, incomplete pair) -> เขาทั้งเก่งทั้งขยัน'],
    questions: [
      { id: 'th_g7q1', question: '"Both delicious and cheap" -> ___อร่อย___ถูก', options: ['ทั้ง...ทั้ง', 'ไม่...ก็', 'ถ้า...ก็', 'แม้...ก็'], correctAnswer: 'ทั้ง...ทั้ง', explanation: '"ทั้ง...ทั้ง" expresses "both...and".' },
      { id: 'th_g7q2', question: '"If not today, then tomorrow" -> ___วันนี้___พรุ่งนี้', options: ['ไม่...ก็', 'ทั้ง...ทั้ง', 'ถูก...โดน', 'แล้ว...ยัง'], correctAnswer: 'ไม่...ก็', explanation: '"ไม่...ก็" means "if not X, then Y".' },
    ],
    tags: ['conjunctions', 'advanced']
  },
  {
    id: 'th_g8', title: 'คำราชาศัพท์ (Royal vocabulary)', level: 'B2',
    description: 'Special vocabulary used when referring to royalty',
    theory: 'Thai has a distinct register for royalty (ราชาศัพท์). Common verbs get replaced: กิน -> เสวย (eat), นอน -> บรรทม (sleep), พูด -> รับสั่ง (speak). Used in news about the royal family and formal contexts.',
    examples: [{ sentence: 'พระองค์เสวยพระกระยาหาร (His Majesty dines)', explanation: '"เสวย" replaces "กิน" in royal register' }],
    commonMistakes: ['พระองค์กิน (common word for royalty) -> พระองค์เสวย'],
    questions: [
      { id: 'th_g8q1', question: 'The royal word for "sleep" (นอน) is:', options: ['บรรทม', 'เสวย', 'รับสั่ง', 'เสด็จ'], correctAnswer: 'บรรทม', explanation: '"บรรทม" is the royal vocabulary for "sleep".' },
      { id: 'th_g8q2', question: 'The royal word for "eat" (กิน) is:', options: ['เสวย', 'บรรทม', 'ตรัส', 'ทอดพระเนตร'], correctAnswer: 'เสวย', explanation: '"เสวย" replaces "กิน" when referring to royalty.' },
    ],
    tags: ['register', 'royal', 'advanced']
  },
];
