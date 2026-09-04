import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankKo: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'ko_g1', title: '이다/아니다 (to be / not to be)', level: 'A1',
    description: 'Expressing identity and negation with 이다 and 아니다',
    theory: 'Use "이다" to say something IS something (noun + 이다). Use "아니다" to negate (noun + 이/가 아니다). 이다 attaches directly to the noun; 아니다 requires the subject particle.',
    formula: 'Noun + 이다 (is) / Noun + 이/가 아니다 (is not)',
    examples: [
      { sentence: '저는 학생이에요. / 저는 선생님이 아니에요.', explanation: '"이에요" is the polite form of "이다"; "이 아니에요" negates it' },
    ],
    commonMistakes: ['저는 학생 아니에요 (missing particle) -> 저는 학생이 아니에요'],
    questions: [
      { id: 'ko_g1q1', question: '이것은 책___. (This is a book.)', options: ['이에요', '아니에요', '있어요', '없어요'], correctAnswer: '이에요', explanation: '"책" ends in a consonant, so use "이에요" (polite 이다).' },
      { id: 'ko_g1q2', question: '저는 의사가 ___. (I am not a doctor.)', options: ['아니에요', '이에요', '있어요', '없어요'], correctAnswer: '아니에요', explanation: 'Negation uses "가 아니에요" after a vowel-ending noun.' },
    ],
    tags: ['copula', 'basics']
  },
  {
    id: 'ko_g2', title: '조사 은/는, 이/가, 을/를 (particles)', level: 'A1',
    description: 'Topic, subject, and object particles in Korean',
    theory: 'Korean uses particles after nouns to mark their role. 은/는 marks the topic, 이/가 marks the subject, 을/를 marks the object. Use the consonant form (은, 이, 을) after consonants and the vowel form (는, 가, 를) after vowels.',
    formula: 'Consonant + 은/이/을, Vowel + 는/가/를',
    examples: [
      { sentence: '나는 사과를 먹어요. (I eat an apple.)', explanation: '"나" ends in a vowel -> 는; "사과" ends in a vowel -> 를' },
    ],
    commonMistakes: ['나은 사과을 먹어요 (wrong particle forms) -> 나는 사과를 먹어요'],
    questions: [
      { id: 'ko_g2q1', question: '고양이___ 귀여워요. (The cat is cute.)', options: ['가', '를', '은', '을'], correctAnswer: '가', explanation: '"고양이" ends in a vowel, so the subject particle is "가".' },
      { id: 'ko_g2q2', question: '저___ 커피___ 마셔요. (I drink coffee.)', options: ['는...를', '은...을', '가...를', '는...을'], correctAnswer: '는...를', explanation: '"저" ends in a vowel -> 는; "커피" ends in a vowel -> 를.' },
    ],
    tags: ['particles', 'basics']
  },
  {
    id: 'ko_g3', title: '과거형 -았/었 (past tense)', level: 'A1',
    description: 'Forming the past tense in Korean',
    theory: 'To form the past tense, add -았- (after ㅏ/ㅗ vowels) or -었- (after other vowels) before the ending. 하다 verbs become 했다. The polite ending becomes -았어요/-었어요.',
    formula: 'Stem (ㅏ/ㅗ) + 았어요, Stem (other) + 었어요, 하다 -> 했어요',
    examples: [
      { sentence: '어제 학교에 갔어요. (I went to school yesterday.)', explanation: '"가다" stem has ㅏ -> 갔어요 (가 + 았어요 contracts)' },
    ],
    commonMistakes: ['먹았어요 (ㅓ vowel should use 었) -> 먹었어요'],
    questions: [
      { id: 'ko_g3q1', question: '어제 뭐 ___? (What did you do yesterday?)', options: ['했어요', '해요', '할 거예요', '하세요'], correctAnswer: '했어요', explanation: '"하다" in past tense becomes "했어요".' },
      { id: 'ko_g3q2', question: '저는 어제 책을 ___. (I read a book yesterday.)', options: ['읽었어요', '읽어요', '읽을 거예요', '읽으세요'], correctAnswer: '읽었어요', explanation: '"읽다" stem vowel is ㅣ -> use 었: 읽었어요.' },
    ],
    tags: ['verbs', 'past-tense']
  },
  // ═══ A2 ═══
  {
    id: 'ko_g4', title: '-고 싶다 (want to) / -아/어야 하다 (must)', level: 'A2',
    description: 'Expressing desire and obligation in Korean',
    theory: 'Attach -고 싶다 to a verb stem to express wanting. Attach -아/어야 하다 to express obligation or necessity. -고 싶다 is subjective desire; -아/어야 하다 is external necessity.',
    formula: 'Stem + 고 싶다 (want) / Stem + 아/어야 하다 (must)',
    examples: [
      { sentence: '한국에 가고 싶어요. / 숙제를 해야 해요.', explanation: '"가고 싶어요" = want to go; "해야 해요" = must do' },
    ],
    commonMistakes: ['가야 싶어요 (mixing patterns) -> 가고 싶어요'],
    questions: [
      { id: 'ko_g4q1', question: '저는 피자를 ___. (I want to eat pizza.)', options: ['먹고 싶어요', '먹어야 해요', '먹었어요', '먹어요'], correctAnswer: '먹고 싶어요', explanation: 'Desire: stem + 고 싶어요 -> 먹고 싶어요.' },
      { id: 'ko_g4q2', question: '내일까지 이것을 ___. (You must finish this by tomorrow.)', options: ['끝내야 해요', '끝내고 싶어요', '끝냈어요', '끝내요'], correctAnswer: '끝내야 해요', explanation: 'Obligation: stem + 아/어야 하다 -> 끝내야 해요.' },
    ],
    tags: ['verbs', 'modality']
  },
  {
    id: 'ko_g5', title: '연결어미 -고, -지만, -(으)면 (connectors)', level: 'A2',
    description: 'Connecting clauses with conjunctive endings',
    theory: 'Use -고 to list actions or connect equal clauses (and). Use -지만 for contrast (but). Use -(으)면 for conditions (if/when). These attach directly to the verb stem.',
    formula: 'Stem + 고 (and) / Stem + 지만 (but) / Stem + (으)면 (if)',
    examples: [
      { sentence: '밥을 먹고 커피를 마셔요. (I eat rice and drink coffee.)', explanation: '"-고" connects two sequential actions' },
    ],
    commonMistakes: ['비가 오면지만 (stacking connectors) -> 비가 오지만 / 비가 오면'],
    questions: [
      { id: 'ko_g5q1', question: '한국어는 재미있___ 어려워요. (Korean is fun but difficult.)', options: ['지만', '고', '으면', '어서'], correctAnswer: '지만', explanation: 'Contrast between fun and difficult uses "-지만" (but).' },
      { id: 'ko_g5q2', question: '시간이 ___  같이 가요. (If you have time, let\'s go together.)', options: ['있으면', '있고', '있지만', '있어서'], correctAnswer: '있으면', explanation: 'Conditional "if" uses "-(으)면": 있 + 으면.' },
    ],
    tags: ['connectors', 'conjunctions']
  },
  // ═══ B1 ═══
  {
    id: 'ko_g6', title: '간접화법 -다고 하다 (indirect speech)', level: 'B1',
    description: 'Reporting what someone said using indirect quotation',
    theory: 'Indirect speech uses different endings by sentence type: statements use -(ㄴ/는)다고 하다, questions use -(느)냐고 하다, commands use -(으)라고 하다, suggestions use -자고 하다.',
    formula: 'Statement: -다고 하다 / Question: -냐고 하다 / Command: -(으)라고 하다',
    examples: [
      { sentence: '친구가 내일 온다고 했어요. (My friend said they\'re coming tomorrow.)', explanation: '"온다고" reports the statement "내일 와요"' },
    ],
    commonMistakes: ['온다라고 했어요 (extra 라) -> 온다고 했어요'],
    questions: [
      { id: 'ko_g6q1', question: '선생님이 조용히 ___ 했어요. (The teacher told us to be quiet.)', options: ['하라고', '한다고', '하냐고', '하자고'], correctAnswer: '하라고', explanation: 'Reporting a command uses "-(으)라고 하다".' },
      { id: 'ko_g6q2', question: '그 사람이 어디에 ___ 물어봤어요. (They asked where I live.)', options: ['사냐고', '산다고', '살라고', '살자고'], correctAnswer: '사냐고', explanation: 'Reporting a question uses "-냐고 하다".' },
    ],
    tags: ['speech', 'quotation']
  },
  {
    id: 'ko_g7', title: '피동 -이/히/리/기 (passive voice)', level: 'B1',
    description: 'Forming passive verbs in Korean',
    theory: 'Korean passives are formed by adding suffixes -이, -히, -리, or -기 to the verb stem. The suffix depends on the verb and must be memorized. The agent is marked with 에게/한테 (by).',
    formula: 'Stem + 이/히/리/기 -> passive verb',
    examples: [
      { sentence: '문이 닫혔어요. (The door was closed.)', explanation: '"닫다" (to close) + 히 -> "닫히다" (to be closed)' },
    ],
    commonMistakes: ['문이 닫이다 (wrong suffix) -> 문이 닫히다'],
    questions: [
      { id: 'ko_g7q1', question: '이 책이 많이 ___. (This book is read a lot.)', options: ['읽히다', '읽이다', '읽리다', '읽기다'], correctAnswer: '읽히다', explanation: '"읽다" takes the suffix -히 to form the passive "읽히다".' },
      { id: 'ko_g7q2', question: '아이가 엄마한테 ___. (The child is held by the mother.)', options: ['안기다', '안이다', '안히다', '안리다'], correctAnswer: '안기다', explanation: '"안다" (to hold) + 기 -> "안기다" (to be held).' },
    ],
    tags: ['passive', 'verbs']
  },
  {
    id: 'ko_g8', title: '사동 -이/히/리/기/우/추 (causative)', level: 'B1',
    description: 'Forming causative verbs in Korean',
    theory: 'Causative verbs express making or letting someone do something. Add suffixes -이, -히, -리, -기, -우, or -추 to the verb stem. The person caused to act is marked with 에게.',
    formula: 'Stem + 이/히/리/기/우/추 -> causative verb',
    examples: [
      { sentence: '엄마가 아이를 웃겼어요. (Mom made the child laugh.)', explanation: '"웃다" (to laugh) + 기 -> "웃기다" (to make laugh)' },
    ],
    commonMistakes: ['아이를 먹이다 vs 먹히다 (causative vs passive) -> 먹이다 = to feed, 먹히다 = to be eaten'],
    questions: [
      { id: 'ko_g8q1', question: '아기에게 우유를 ___. (I feed milk to the baby.)', options: ['먹여요', '먹어요', '먹혀요', '먹겨요'], correctAnswer: '먹여요', explanation: '"먹다" + 이 -> "먹이다" (to feed); polite form "먹여요".' },
      { id: 'ko_g8q2', question: '선생님이 학생들을 ___. (The teacher made the students sit.)', options: ['앉혀요', '앉아요', '앉겨요', '앉이요'], correctAnswer: '앉혀요', explanation: '"앉다" (to sit) + 히 -> "앉히다" (to seat someone); polite "앉혀요".' },
    ],
    tags: ['causative', 'verbs']
  },
  // ═══ B2 ═══
  {
    id: 'ko_g9', title: '-(으)ㄹ 뿐만 아니라 (not only...but also)', level: 'B2',
    description: 'Expressing addition with "not only X but also Y"',
    theory: 'Use -(으)ㄹ 뿐만 아니라 after a verb stem to say "not only...but also". For nouns, use 뿐만 아니라 directly. The second clause adds further information.',
    formula: 'Verb stem + (으)ㄹ 뿐만 아니라 / Noun + 뿐만 아니라',
    examples: [
      { sentence: '그는 영어뿐만 아니라 일본어도 해요.', explanation: '"뿐만 아니라" after noun "영어" = not only English but also Japanese' },
    ],
    commonMistakes: ['영어뿐 아니라 (missing 만) -> 영어뿐만 아니라'],
    questions: [
      { id: 'ko_g9q1', question: '이 식당은 맛있을 ___ 가격도 싸요.', options: ['뿐만 아니라', '뿐이에요', '만 해요', '뿐이라'], correctAnswer: '뿐만 아니라', explanation: '"Not only delicious but also cheap" uses "뿐만 아니라".' },
      { id: 'ko_g9q2', question: '한국어___ 중국어도 공부해요. (I study not only Korean but also Chinese.)', options: ['뿐만 아니라', '때문에', '지만', '이라서'], correctAnswer: '뿐만 아니라', explanation: 'After noun "한국어", use "뿐만 아니라" for "not only...but also".' },
    ],
    tags: ['connectors', 'advanced']
  },
  {
    id: 'ko_g10', title: '-(으)ㄴ/는 반면에 (on the other hand)', level: 'B2',
    description: 'Expressing contrast between two facts',
    theory: 'Use -(으)ㄴ/는 반면에 to contrast two facts. For adjectives, use -(으)ㄴ 반면에. For verbs in present tense, use -는 반면에. For past tense, use -(으)ㄴ 반면에.',
    formula: 'Adj stem + (으)ㄴ 반면에 / Verb stem + 는 반면에',
    examples: [
      { sentence: '이 가방은 비싼 반면에 품질이 좋아요.', explanation: '"비싼 반면에" contrasts the high price with the good quality' },
    ],
    commonMistakes: ['비싸는 반면에 (verb ending on adjective) -> 비싼 반면에'],
    questions: [
      { id: 'ko_g10q1', question: '서울은 복잡한 ___ 부산은 조용해요.', options: ['반면에', '때문에', '덕분에', '대신에'], correctAnswer: '반면에', explanation: 'Contrasting Seoul (busy) with Busan (quiet) uses "반면에".' },
      { id: 'ko_g10q2', question: '형은 키가 ___ 반면에 동생은 키가 작아요.', options: ['큰', '크는', '크고', '커서'], correctAnswer: '큰', explanation: 'Adjective "크다" before "반면에" uses the -(으)ㄴ form: 큰.' },
    ],
    tags: ['connectors', 'contrast', 'advanced']
  },
];
