export interface GrammarQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  description: string;
  theory: string;
  formula?: string;
  examples: { sentence: string; explanation: string }[];
  commonMistakes?: string[];
  questions: GrammarQuestion[];
  tags: string[];
}

export const grammarBank: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'g1', title: 'Verb "To Be"', level: 'A1',
    description: 'Using am, is, are in the present tense',
    theory: 'The verb "to be" is one of the most important verbs. Use "am" with I, "is" with he/she/it, and "are" with you/we/they.',
    formula: 'Subject + am/is/are + complement',
    examples: [
      { sentence: 'I am a student.', explanation: 'Use "am" with "I"' },
      { sentence: 'She is happy.', explanation: 'Use "is" with "she"' },
      { sentence: 'They are from Vietnam.', explanation: 'Use "are" with "they"' },
    ],
    commonMistakes: ['❌ "I is happy" → ✅ "I am happy"', '❌ "She are tall" → ✅ "She is tall"'],
    questions: [
      { id: 'g1q1', question: 'She ___ a teacher.', options: ['am', 'is', 'are', 'be'], correctAnswer: 'is', explanation: 'Use "is" with he/she/it.' },
      { id: 'g1q2', question: 'They ___ my friends.', options: ['am', 'is', 'are', 'be'], correctAnswer: 'are', explanation: 'Use "are" with they/we/you.' },
      { id: 'g1q3', question: 'I ___ from Vietnam.', options: ['am', 'is', 'are', 'be'], correctAnswer: 'am', explanation: 'Use "am" only with "I".' },
    ],
    tags: ['basics', 'tenses']
  },
  {
    id: 'g2', title: 'Present Simple', level: 'A1',
    description: 'Routines, habits, and general facts',
    theory: 'Use the present simple for things that happen regularly, habits, and general truths. Add -s or -es for he/she/it.',
    formula: 'Subject + V(s/es) | Subject + do/does + not + V',
    examples: [
      { sentence: 'I wake up at 7 AM every day.', explanation: 'A daily routine' },
      { sentence: 'She works in a hospital.', explanation: 'Add -s for third person singular' },
      { sentence: 'Water boils at 100°C.', explanation: 'A scientific fact' },
    ],
    commonMistakes: ['❌ "She work hard" → ✅ "She works hard"', '❌ "He don\'t like coffee" → ✅ "He doesn\'t like coffee"'],
    questions: [
      { id: 'g2q1', question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 'goes', explanation: 'Third person singular: add -es to "go".' },
      { id: 'g2q2', question: 'They ___ play football on Sundays.', options: ['don\'t', 'doesn\'t', 'isn\'t', 'aren\'t'], correctAnswer: 'don\'t', explanation: 'Use "don\'t" with they/we/I/you.' },
      { id: 'g2q3', question: '___ he speak English?', options: ['Do', 'Does', 'Is', 'Are'], correctAnswer: 'Does', explanation: 'Use "Does" for questions with he/she/it.' },
    ],
    tags: ['tenses', 'basics']
  },
  {
    id: 'g3', title: 'Present Continuous', level: 'A1',
    description: 'Actions happening right now',
    theory: 'Use the present continuous for actions happening at the moment of speaking, temporary situations, and future arrangements.',
    formula: 'Subject + am/is/are + V-ing',
    examples: [
      { sentence: 'I am studying English right now.', explanation: 'Happening at the moment' },
      { sentence: 'She is living in London this year.', explanation: 'Temporary situation' },
    ],
    commonMistakes: ['❌ "I studying now" → ✅ "I am studying now"', '❌ "She is go to school" → ✅ "She is going to school"'],
    questions: [
      { id: 'g3q1', question: 'Look! It ___ (rain).', options: ['rains', 'is raining', 'rain', 'rained'], correctAnswer: 'is raining', explanation: 'Action happening now → present continuous.' },
      { id: 'g3q2', question: 'She ___ (read) a book at the moment.', options: ['reads', 'is reading', 'read', 'has read'], correctAnswer: 'is reading', explanation: '"At the moment" signals present continuous.' },
    ],
    tags: ['tenses', 'basics']
  },
  {
    id: 'g4', title: 'Articles: A, An, The', level: 'A1',
    description: 'When to use a, an, and the',
    theory: '"A" is used before consonant sounds, "an" before vowel sounds. "The" is used for specific or already-mentioned things. No article for general uncountable or plural nouns.',
    examples: [
      { sentence: 'I have a cat.', explanation: '"A" before consonant sound' },
      { sentence: 'She is an engineer.', explanation: '"An" before vowel sound' },
      { sentence: 'The sun is bright today.', explanation: '"The" for unique things' },
    ],
    commonMistakes: ['❌ "I am a honest person" → ✅ "I am an honest person" (silent h)', '❌ "The water is important for life" → ✅ "Water is important for life" (general)'],
    questions: [
      { id: 'g4q1', question: 'She is ___ doctor.', options: ['a', 'an', 'the', '—'], correctAnswer: 'a', explanation: '"Doctor" starts with a consonant sound.' },
      { id: 'g4q2', question: 'I saw ___ interesting movie.', options: ['a', 'an', 'the', '—'], correctAnswer: 'an', explanation: '"Interesting" starts with a vowel sound.' },
    ],
    tags: ['basics', 'articles']
  },
  {
    id: 'g5', title: 'Countable and Uncountable Nouns', level: 'A1',
    description: 'Understanding which nouns can be counted',
    theory: 'Countable nouns have a plural form (book/books). Uncountable nouns cannot be counted directly (water, information, advice). Use "much" with uncountable and "many" with countable.',
    examples: [
      { sentence: 'I have three books.', explanation: '"Book" is countable' },
      { sentence: 'Can I have some water?', explanation: '"Water" is uncountable' },
    ],
    commonMistakes: ['❌ "many informations" → ✅ "much information"', '❌ "an advice" → ✅ "a piece of advice"'],
    questions: [
      { id: 'g5q1', question: 'How ___ sugar do you want?', options: ['many', 'much', 'few', 'some'], correctAnswer: 'much', explanation: '"Sugar" is uncountable, so use "much".' },
      { id: 'g5q2', question: 'There are ___ students in the class.', options: ['much', 'many', 'a lot', 'any'], correctAnswer: 'many', explanation: '"Students" is countable plural, so use "many".' },
    ],
    tags: ['basics', 'nouns']
  },
  {
    id: 'g6', title: 'Basic Prepositions of Place', level: 'A1',
    description: 'In, on, at, under, next to, between',
    theory: 'Use "in" for enclosed spaces, "on" for surfaces, "at" for specific points. "Under" means below, "next to" means beside, "between" means in the middle of two things.',
    examples: [
      { sentence: 'The book is on the table.', explanation: '"On" for surfaces' },
      { sentence: 'She lives in Paris.', explanation: '"In" for cities and countries' },
      { sentence: 'We met at the station.', explanation: '"At" for specific points/locations' },
    ],
    questions: [
      { id: 'g6q1', question: 'The cat is ___ the box.', options: ['in', 'on', 'at', 'to'], correctAnswer: 'in', explanation: 'Inside an enclosed space → "in".' },
      { id: 'g6q2', question: 'I will meet you ___ the airport.', options: ['in', 'on', 'at', 'by'], correctAnswer: 'at', explanation: 'A specific point/location → "at".' },
    ],
    tags: ['basics', 'prepositions']
  },

  // ═══ A2 ═══
  {
    id: 'g7', title: 'Past Simple', level: 'A2',
    description: 'Completed actions in the past',
    theory: 'Use the past simple for finished actions at a specific time in the past. Add -ed to regular verbs. Irregular verbs have special forms (go→went, eat→ate).',
    formula: 'Subject + V2 (past form) | Subject + did not + V1',
    examples: [
      { sentence: 'I visited London last year.', explanation: 'Regular verb: visit → visited' },
      { sentence: 'She went to the cinema yesterday.', explanation: 'Irregular verb: go → went' },
    ],
    commonMistakes: ['❌ "I goed to school" → ✅ "I went to school"', '❌ "Did she went?" → ✅ "Did she go?"'],
    questions: [
      { id: 'g7q1', question: 'She ___ (buy) a new phone yesterday.', options: ['buys', 'bought', 'buyed', 'buying'], correctAnswer: 'bought', explanation: '"Buy" is irregular: buy → bought.' },
      { id: 'g7q2', question: 'They ___ (not/come) to the party.', options: ['didn\'t came', 'didn\'t come', 'don\'t come', 'doesn\'t come'], correctAnswer: 'didn\'t come', explanation: 'Negative past: did not + base form.' },
    ],
    tags: ['tenses', 'past']
  },
  {
    id: 'g8', title: 'Past Continuous', level: 'A2',
    description: 'Actions in progress at a specific time in the past',
    theory: 'Use the past continuous for actions that were in progress at a particular time in the past, or for background actions interrupted by another event.',
    formula: 'Subject + was/were + V-ing',
    examples: [
      { sentence: 'I was watching TV when she called.', explanation: 'Background action interrupted by another' },
      { sentence: 'At 8 PM, they were having dinner.', explanation: 'In progress at a specific time' },
    ],
    questions: [
      { id: 'g8q1', question: 'While I ___ (walk), it started to rain.', options: ['walked', 'was walking', 'am walking', 'walk'], correctAnswer: 'was walking', explanation: 'Past continuous for the ongoing action interrupted by the rain.' },
    ],
    tags: ['tenses', 'past']
  },
  {
    id: 'g9', title: 'Comparatives and Superlatives', level: 'A2',
    description: 'Comparing things using adjectives',
    theory: 'Add -er for short adjectives (tall→taller) or use "more" for longer ones (beautiful→more beautiful). Use "the" + -est or "the most" for superlatives.',
    formula: 'Short adj: adj + -er than | Long adj: more + adj + than',
    examples: [
      { sentence: 'She is taller than her brother.', explanation: 'Comparative with -er' },
      { sentence: 'This is the most interesting book I\'ve read.', explanation: 'Superlative with "the most"' },
    ],
    commonMistakes: ['❌ "more better" → ✅ "better" (irregular)', '❌ "gooder" → ✅ "better"'],
    questions: [
      { id: 'g9q1', question: 'This book is ___ (interesting) than that one.', options: ['interestinger', 'more interesting', 'most interesting', 'interesting'], correctAnswer: 'more interesting', explanation: '"Interesting" has 4 syllables → use "more".' },
      { id: 'g9q2', question: 'She is the ___ (good) student in the class.', options: ['goodest', 'better', 'best', 'most good'], correctAnswer: 'best', explanation: '"Good" is irregular: good → better → best.' },
    ],
    tags: ['adjectives', 'comparison']
  },
  {
    id: 'g10', title: 'Modal Verbs: Can, Could, Should', level: 'A2',
    description: 'Expressing ability, possibility, and advice',
    theory: '"Can" expresses present ability. "Could" expresses past ability or polite requests. "Should" gives advice or recommendations.',
    examples: [
      { sentence: 'I can speak three languages.', explanation: 'Present ability' },
      { sentence: 'Could you help me, please?', explanation: 'Polite request' },
      { sentence: 'You should study harder.', explanation: 'Advice' },
    ],
    questions: [
      { id: 'g10q1', question: '___ you swim when you were five?', options: ['Can', 'Could', 'Should', 'Must'], correctAnswer: 'Could', explanation: 'Past ability → "could".' },
      { id: 'g10q2', question: 'You ___ see a doctor if you feel sick.', options: ['can', 'could', 'should', 'would'], correctAnswer: 'should', explanation: 'Advice → "should".' },
    ],
    tags: ['modals']
  },

  // ═══ B1 ═══
  {
    id: 'g11', title: 'Present Perfect', level: 'B1',
    description: 'Past actions with a connection to the present',
    theory: 'Use the present perfect for experiences (ever/never), changes, unfinished time periods (today, this week), and actions with present results.',
    formula: 'Subject + have/has + V3 (past participle)',
    examples: [
      { sentence: 'I have visited Paris three times.', explanation: 'Life experience' },
      { sentence: 'She has lived here since 2010.', explanation: 'Unfinished time period' },
      { sentence: 'They have just finished the project.', explanation: 'Recent action with present relevance' },
    ],
    commonMistakes: ['❌ "I have went" → ✅ "I have gone"', '❌ "She has visit London" → ✅ "She has visited London"', '❌ "I have seen her yesterday" → ✅ "I saw her yesterday" (specific past time → past simple)'],
    questions: [
      { id: 'g11q1', question: 'I ___ (never/eat) sushi before.', options: ['never ate', 'have never eaten', 'never eating', 'have never ate'], correctAnswer: 'have never eaten', explanation: '"Never" + present perfect for life experiences.' },
      { id: 'g11q2', question: 'She ___ (live) here for 10 years.', options: ['lived', 'has lived', 'is living', 'lives'], correctAnswer: 'has lived', explanation: '"For 10 years" with unfinished time → present perfect.' },
      { id: 'g11q3', question: '___ you ___ the new restaurant?', options: ['Have/tried', 'Did/tried', 'Have/try', 'Do/try'], correctAnswer: 'Have/tried', explanation: 'Asking about life experience → present perfect.' },
    ],
    tags: ['tenses']
  },
  {
    id: 'g12', title: 'Future Forms: Will vs Going To', level: 'B1',
    description: 'Talking about the future',
    theory: '"Will" for spontaneous decisions, promises, and predictions without evidence. "Be going to" for plans already decided and predictions with evidence.',
    examples: [
      { sentence: 'I\'ll help you with that. (spontaneous)', explanation: 'Decision made at the moment' },
      { sentence: 'I\'m going to travel to Japan next month.', explanation: 'Pre-planned decision' },
      { sentence: 'Look at those clouds! It\'s going to rain.', explanation: 'Prediction with evidence' },
    ],
    questions: [
      { id: 'g12q1', question: 'I ___ (help) you carry those bags. (just decided)', options: ['will help', 'am going to help', 'help', 'am helping'], correctAnswer: 'will help', explanation: 'Spontaneous decision → "will".' },
      { id: 'g12q2', question: 'We ___ (visit) our grandparents next weekend. (already planned)', options: ['will visit', 'are going to visit', 'visit', 'visiting'], correctAnswer: 'are going to visit', explanation: 'Pre-planned → "going to".' },
    ],
    tags: ['tenses', 'future']
  },
  {
    id: 'g13', title: 'Conditionals: Zero and First', level: 'B1',
    description: 'Real and possible situations',
    theory: 'Zero conditional: general truths (If + present, present). First conditional: possible future situations (If + present, will + infinitive).',
    formula: 'Zero: If + present simple, present simple | First: If + present simple, will + infinitive',
    examples: [
      { sentence: 'If you heat water to 100°C, it boils.', explanation: 'Zero: scientific fact' },
      { sentence: 'If it rains tomorrow, I will stay home.', explanation: 'First: possible future' },
    ],
    commonMistakes: ['❌ "If it will rain" → ✅ "If it rains" (no "will" in the if-clause for first conditional)'],
    questions: [
      { id: 'g13q1', question: 'If you ___ (study) hard, you will pass the exam.', options: ['will study', 'study', 'studied', 'would study'], correctAnswer: 'study', explanation: 'First conditional: present simple in the if-clause.' },
      { id: 'g13q2', question: 'If water reaches 0°C, it ___.', options: ['will freeze', 'freezes', 'froze', 'would freeze'], correctAnswer: 'freezes', explanation: 'Zero conditional: general truth → present simple in both clauses.' },
    ],
    tags: ['conditionals']
  },
  {
    id: 'g14', title: 'Relative Clauses (Basic)', level: 'B1',
    description: 'Using who, which, that, where to give more information',
    theory: 'Use "who" for people, "which" for things, "that" for both, and "where" for places. Defining clauses are essential to the meaning.',
    examples: [
      { sentence: 'The man who lives next door is a doctor.', explanation: '"Who" for people' },
      { sentence: 'I read a book which was very interesting.', explanation: '"Which" for things' },
      { sentence: 'This is the city where I was born.', explanation: '"Where" for places' },
    ],
    questions: [
      { id: 'g14q1', question: 'The woman ___ called you is my sister.', options: ['who', 'which', 'where', 'whose'], correctAnswer: 'who', explanation: '"Who" for people.' },
      { id: 'g14q2', question: 'I love the café ___ we met.', options: ['who', 'which', 'where', 'that'], correctAnswer: 'where', explanation: '"Where" for places.' },
    ],
    tags: ['clauses']
  },

  // ═══ B2 ═══
  {
    id: 'g15', title: 'Second Conditional', level: 'B2',
    description: 'Hypothetical or unlikely situations',
    theory: 'Use the second conditional for unreal/imaginary present situations. If + past simple, would + infinitive.',
    formula: 'If + past simple, would + infinitive',
    examples: [
      { sentence: 'If I had a million dollars, I would travel the world.', explanation: 'Imaginary situation' },
      { sentence: 'If she were taller, she would play basketball.', explanation: '"Were" is used for all subjects in formal English' },
    ],
    commonMistakes: ['❌ "If I would have money" → ✅ "If I had money"'],
    questions: [
      { id: 'g15q1', question: 'If I ___ (be) you, I would accept the offer.', options: ['am', 'was', 'were', 'would be'], correctAnswer: 'were', explanation: 'Second conditional uses "were" for all subjects.' },
      { id: 'g15q2', question: 'What would you do if you ___ (win) the lottery?', options: ['win', 'won', 'would win', 'will win'], correctAnswer: 'won', explanation: 'Second conditional: past simple in the if-clause.' },
    ],
    tags: ['conditionals']
  },
  {
    id: 'g16', title: 'Third Conditional', level: 'B2',
    description: 'Imagining a different past',
    theory: 'Use the third conditional for unreal past situations — imagining how things would be different if the past had been different.',
    formula: 'If + past perfect, would have + past participle',
    examples: [
      { sentence: 'If I had studied harder, I would have passed the exam.', explanation: 'Regretting a past action' },
      { sentence: 'If she hadn\'t missed the bus, she would have arrived on time.', explanation: 'Imagining a different outcome' },
    ],
    questions: [
      { id: 'g16q1', question: 'If I ___ (know) about the meeting, I would have attended.', options: ['knew', 'had known', 'would know', 'know'], correctAnswer: 'had known', explanation: 'Third conditional: past perfect in the if-clause.' },
    ],
    tags: ['conditionals', 'advanced']
  },
  {
    id: 'g17', title: 'Passive Voice', level: 'B2',
    description: 'Focusing on the action rather than the doer',
    theory: 'Use the passive when the action is more important than who does it, or when the doer is unknown. Form: be + past participle.',
    formula: 'Subject + be + V3 (past participle) + (by agent)',
    examples: [
      { sentence: 'The Mona Lisa was painted by Leonardo da Vinci.', explanation: 'The painting is the focus' },
      { sentence: 'English is spoken in many countries.', explanation: 'General fact — doer not important' },
      { sentence: 'The window was broken.', explanation: 'Doer unknown' },
    ],
    commonMistakes: ['❌ "The book was wrote" → ✅ "The book was written"'],
    questions: [
      { id: 'g17q1', question: 'This bridge ___ (build) in 1990.', options: ['built', 'was built', 'is built', 'has built'], correctAnswer: 'was built', explanation: 'Past passive: was/were + past participle.' },
      { id: 'g17q2', question: 'English ___ (speak) all over the world.', options: ['speaks', 'is spoken', 'spoke', 'was spoken'], correctAnswer: 'is spoken', explanation: 'Present passive for general truth.' },
    ],
    tags: ['passive', 'academic']
  },
  {
    id: 'g18', title: 'Reported Speech', level: 'B2',
    description: 'Retelling what someone said',
    theory: 'When reporting speech, shift the tense back: present→past, past→past perfect, will→would. Change pronouns and time references.',
    examples: [
      { sentence: '"I love this city," she said. → She said (that) she loved that city.', explanation: 'Present → Past; this → that' },
      { sentence: '"I will come tomorrow," he said. → He said he would come the next day.', explanation: 'Will → Would; tomorrow → the next day' },
    ],
    questions: [
      { id: 'g18q1', question: '"I am tired," she said. → She said she ___ tired.', options: ['is', 'was', 'were', 'has been'], correctAnswer: 'was', explanation: 'Present "am" shifts to past "was".' },
    ],
    tags: ['communication', 'academic']
  },
  {
    id: 'g19', title: 'Used to / Would', level: 'B2',
    description: 'Past habits and repeated actions',
    theory: '"Used to" describes past habits or states that are no longer true. "Would" can replace "used to" for repeated actions (but NOT states).',
    examples: [
      { sentence: 'I used to live in the countryside.', explanation: 'Past state — cannot use "would"' },
      { sentence: 'We would play football every evening.', explanation: 'Past repeated action — "would" is OK' },
    ],
    commonMistakes: ['❌ "I use to play" → ✅ "I used to play"', '❌ "I would live in Paris" (state) → ✅ "I used to live in Paris"'],
    questions: [
      { id: 'g19q1', question: 'She ___ have long hair when she was young.', options: ['used to', 'would', 'use to', 'was used to'], correctAnswer: 'used to', explanation: '"Have long hair" is a state → use "used to".' },
    ],
    tags: ['past', 'habits']
  },

  // ═══ C1 ═══
  {
    id: 'g20', title: 'Mixed Conditionals', level: 'C1',
    description: 'Combining second and third conditionals',
    theory: 'Mix past and present conditions/results. Type 1: If + past perfect, would + infinitive (past cause → present result). Type 2: If + past simple, would have + past participle (present state → past result).',
    examples: [
      { sentence: 'If I had studied medicine, I would be a doctor now.', explanation: 'Past condition → Present result' },
      { sentence: 'If she spoke Chinese, she would have got the job.', explanation: 'Present state → Past result' },
    ],
    questions: [
      { id: 'g20q1', question: 'If I ___ (save) money, I would have a house now.', options: ['saved', 'had saved', 'would save', 'save'], correctAnswer: 'had saved', explanation: 'Past condition (didn\'t save) → present result (no house).' },
    ],
    tags: ['conditionals', 'advanced']
  },
  {
    id: 'g21', title: 'Wish and If Only', level: 'C1',
    description: 'Expressing regrets and desires',
    theory: '"Wish" + past simple for present wishes. "Wish" + past perfect for past regrets. "Wish" + would for complaints.',
    examples: [
      { sentence: 'I wish I spoke French.', explanation: 'Present wish (I don\'t speak French)' },
      { sentence: 'I wish I had studied harder.', explanation: 'Past regret (I didn\'t study hard)' },
      { sentence: 'I wish it would stop raining.', explanation: 'Complaint about something you want to change' },
    ],
    questions: [
      { id: 'g21q1', question: 'I wish I ___ (can) fly.', options: ['can', 'could', 'would', 'had'], correctAnswer: 'could', explanation: 'Present wish about ability → past tense "could".' },
    ],
    tags: ['advanced', 'wishes']
  },
  {
    id: 'g22', title: 'Participle Clauses', level: 'C1',
    description: 'Using participles to shorten sentences',
    theory: 'Present participle (-ing) for active meaning. Past participle (-ed) for passive meaning. Perfect participle (having + V3) for completed actions.',
    examples: [
      { sentence: 'Walking home, I saw a rainbow.', explanation: 'Shortened from "While I was walking home"' },
      { sentence: 'Written in 1920, the novel is still popular.', explanation: 'Shortened from "The novel, which was written in 1920"' },
      { sentence: 'Having finished the exam, she left the room.', explanation: 'Shortened from "After she had finished the exam"' },
    ],
    questions: [
      { id: 'g22q1', question: '___ in 1969, the building is now a museum.', options: ['Building', 'Built', 'Having built', 'Being built'], correctAnswer: 'Built', explanation: 'The building was built (passive) → past participle.' },
    ],
    tags: ['advanced', 'academic']
  },
  {
    id: 'g23', title: 'Cleft Sentences', level: 'C1',
    description: 'Emphasizing specific information',
    theory: 'Use "It is/was ... that/who" or "What ... is/was" to emphasize a particular part of the sentence.',
    examples: [
      { sentence: 'It was John who broke the window.', explanation: 'Emphasis on WHO did it' },
      { sentence: 'What I need is a holiday.', explanation: 'Emphasis on WHAT is needed' },
    ],
    questions: [
      { id: 'g23q1', question: '___ I need is more practice.', options: ['What', 'It', 'That', 'Which'], correctAnswer: 'What', explanation: '"What-clause" to emphasize the object.' },
    ],
    tags: ['advanced', 'emphasis']
  },
  {
    id: 'g24', title: 'Inversion for Emphasis', level: 'C1',
    description: 'Inverting subject and auxiliary for stylistic effect',
    theory: 'Place negative or restrictive adverbs at the beginning of a sentence and invert the subject/auxiliary: Never have I, Rarely does she, Not only did he.',
    examples: [
      { sentence: 'Never have I seen such a beautiful sunset.', explanation: 'Emphasis on "never"' },
      { sentence: 'Not only did she win, but she also set a new record.', explanation: 'Double emphasis' },
      { sentence: 'Hardly had we arrived when it started to rain.', explanation: 'Emphasis on the timing' },
    ],
    commonMistakes: ['❌ "Never I have seen" → ✅ "Never have I seen"'],
    questions: [
      { id: 'g24q1', question: 'Rarely ___ such talent.', options: ['I see', 'do I see', 'I do see', 'see I'], correctAnswer: 'do I see', explanation: 'After "Rarely", invert auxiliary + subject.' },
    ],
    tags: ['advanced', 'emphasis', 'academic']
  },

  // ═══ C2 ═══
  {
    id: 'g25', title: 'Subjunctive Mood', level: 'C2',
    description: 'Formal suggestions and demands',
    theory: 'After verbs like suggest, recommend, insist, demand, and propose, use the base form of the verb (subjunctive). This is common in formal/academic writing.',
    examples: [
      { sentence: 'I suggest that he study more.', explanation: '"Study" (not "studies") — subjunctive' },
      { sentence: 'It is essential that she be informed.', explanation: '"Be" (not "is") — formal register' },
    ],
    questions: [
      { id: 'g25q1', question: 'The committee recommends that the plan ___ approved.', options: ['is', 'be', 'will be', 'was'], correctAnswer: 'be', explanation: 'Subjunctive after "recommends that" → base form "be".' },
    ],
    tags: ['advanced', 'formal', 'academic']
  },
  {
    id: 'g26', title: 'Complex Noun Phrases', level: 'C2',
    description: 'Building sophisticated noun phrases for academic writing',
    theory: 'Academic English uses complex noun phrases with pre-modifiers (adjectives, participles) and post-modifiers (prepositional phrases, relative clauses, to-infinitives).',
    examples: [
      { sentence: 'The recently published peer-reviewed article on climate change received wide attention.', explanation: 'Multiple pre- and post-modifiers' },
    ],
    questions: [
      { id: 'g26q1', question: 'Which is the most complex noun phrase?', options: ['A book', 'The old book on the shelf', 'The recently discovered ancient text believed to date from the 3rd century', 'A big red car'], correctAnswer: 'The recently discovered ancient text believed to date from the 3rd century', explanation: 'Multiple layers of pre- and post-modification.' },
    ],
    tags: ['advanced', 'academic', 'writing']
  },

  // ═══ IELTS-focused grammar ═══
  {
    id: 'g27', title: 'Hedging and Cautious Language', level: 'C1',
    description: 'Academic caution in IELTS Writing',
    theory: 'In academic writing, avoid absolute statements. Use hedging: "tend to", "may", "it could be argued that", "appears to", "to some extent".',
    examples: [
      { sentence: 'This could potentially lead to economic problems.', explanation: 'Hedged with "could potentially"' },
      { sentence: 'It appears that technology has a significant impact.', explanation: 'Hedged with "it appears that"' },
    ],
    questions: [
      { id: 'g27q1', question: 'Which is the most academically appropriate?', options: ['Technology always causes problems.', 'Technology tends to create certain challenges.', 'Technology is terrible.', 'Everyone hates technology.'], correctAnswer: 'Technology tends to create certain challenges.', explanation: '"Tends to" and "certain" are hedging devices.' },
    ],
    tags: ['ielts', 'academic', 'writing']
  },
  {
    id: 'g28', title: 'Linking Words and Discourse Markers', level: 'B2',
    description: 'Connecting ideas in speaking and writing',
    theory: 'Use linking words to show addition (moreover, furthermore), contrast (however, nevertheless), cause (because, due to), and result (therefore, consequently).',
    examples: [
      { sentence: 'The policy failed. However, it taught us a valuable lesson.', explanation: 'Contrast' },
      { sentence: 'Due to heavy rain, the event was cancelled.', explanation: 'Cause' },
      { sentence: 'She studied hard; therefore, she passed the exam.', explanation: 'Result' },
    ],
    questions: [
      { id: 'g28q1', question: 'The project was expensive. ___, it was very successful.', options: ['Therefore', 'Nevertheless', 'Because', 'Due to'], correctAnswer: 'Nevertheless', explanation: '"Nevertheless" shows contrast (expensive BUT successful).' },
      { id: 'g28q2', question: '___ the rain, we decided to stay indoors.', options: ['Although', 'Due to', 'However', 'Moreover'], correctAnswer: 'Due to', explanation: '"Due to" introduces a cause (the rain was the reason).' },
    ],
    tags: ['ielts', 'academic', 'linking']
  },
  {
    id: 'g29', title: 'Gerunds and Infinitives', level: 'B1',
    description: 'When to use -ing form vs to + infinitive',
    theory: 'Some verbs are followed by gerunds (enjoy reading), some by infinitives (want to read), and some can use both with a change in meaning (stop doing vs stop to do).',
    examples: [
      { sentence: 'I enjoy reading books.', explanation: '"Enjoy" is always followed by gerund' },
      { sentence: 'She wants to learn French.', explanation: '"Want" is always followed by infinitive' },
      { sentence: 'He stopped smoking. (quit the habit)', explanation: 'Different meaning from "He stopped to smoke" (paused in order to smoke)' },
    ],
    commonMistakes: ['❌ "I enjoy to read" → ✅ "I enjoy reading"', '❌ "I suggest to go" → ✅ "I suggest going"'],
    questions: [
      { id: 'g29q1', question: 'I can\'t stand ___ in traffic jams.', options: ['to sit', 'sitting', 'sit', 'sat'], correctAnswer: 'sitting', explanation: '"Can\'t stand" is followed by the gerund.' },
      { id: 'g29q2', question: 'She decided ___ abroad.', options: ['studying', 'to study', 'study', 'studied'], correctAnswer: 'to study', explanation: '"Decide" is followed by the infinitive.' },
    ],
    tags: ['verbs']
  },
  {
    id: 'g30', title: 'Subject-Verb Agreement', level: 'B1',
    description: 'Making sure the verb matches the subject',
    theory: 'A singular subject takes a singular verb; a plural subject takes a plural verb. Watch out for tricky subjects like "everyone" (singular), "the number of" (singular), and "a number of" (plural).',
    examples: [
      { sentence: 'Everyone is here.', explanation: '"Everyone" is singular' },
      { sentence: 'The number of students has increased.', explanation: '"The number of" is singular' },
      { sentence: 'A number of students have complained.', explanation: '"A number of" is plural' },
    ],
    commonMistakes: ['❌ "The team are ready" (British English is OK but American prefers "is")', '❌ "Each of the students have" → ✅ "Each of the students has"'],
    questions: [
      { id: 'g30q1', question: 'Neither of them ___ ready.', options: ['are', 'is', 'were', 'have been'], correctAnswer: 'is', explanation: '"Neither of" takes a singular verb.' },
      { id: 'g30q2', question: 'A number of issues ___ raised at the meeting.', options: ['was', 'were', 'is', 'has been'], correctAnswer: 'were', explanation: '"A number of" takes a plural verb.' },
    ],
    tags: ['grammar', 'academic']
  },
];
