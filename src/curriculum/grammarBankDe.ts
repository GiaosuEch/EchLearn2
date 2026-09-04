import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankDe: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'de_g1', title: 'Artikel (der/die/das)', level: 'A1',
    description: 'German definite articles by grammatical gender',
    theory: 'Every German noun has a grammatical gender: masculine (der), feminine (die), or neuter (das). Plural always uses "die". The gender must be memorized with each noun.',
    formula: 'der (m) / die (f) / das (n) / die (pl)',
    examples: [
      { sentence: 'Der Tisch ist groß. Die Lampe ist klein. Das Buch ist neu.', explanation: 'der = masculine, die = feminine, das = neuter' },
    ],
    commonMistakes: ['❌ "das Tisch" → ✅ "der Tisch" — Tisch is masculine'],
    questions: [
      { id: 'de_g1q1', question: '___ Hund ist braun.', options: ['der', 'die', 'das', 'den'], correctAnswer: 'der', explanation: 'Hund (dog) is masculine → der.' },
      { id: 'de_g1q2', question: '___ Kind spielt im Garten.', options: ['der', 'die', 'das', 'dem'], correctAnswer: 'das', explanation: 'Kind (child) is neuter → das.' },
    ],
    tags: ['basics', 'articles', 'german']
  },
  {
    id: 'de_g2', title: 'Akkusativ', level: 'A1',
    description: 'The accusative case for direct objects',
    theory: 'The accusative case marks the direct object of a verb. Only the masculine article changes: der becomes den. Feminine, neuter, and plural articles stay the same.',
    formula: 'der→den / die→die / das→das / die→die',
    examples: [
      { sentence: 'Ich sehe den Mann. (I see the man.)', explanation: 'der Mann → den Mann in accusative' },
    ],
    commonMistakes: ['❌ "Ich sehe der Mann" → ✅ "Ich sehe den Mann"'],
    questions: [
      { id: 'de_g2q1', question: 'Ich kaufe ___ Kuchen. (m)', options: ['der', 'den', 'dem', 'das'], correctAnswer: 'den', explanation: 'Kuchen is masculine; accusative changes der to den.' },
      { id: 'de_g2q2', question: 'Er trinkt ___ Milch. (f)', options: ['der', 'den', 'die', 'das'], correctAnswer: 'die', explanation: 'Milch is feminine; accusative keeps die unchanged.' },
    ],
    tags: ['cases', 'basics', 'german']
  },
  {
    id: 'de_g3', title: 'Perfekt mit haben', level: 'A1',
    description: 'Forming the conversational past tense with haben',
    theory: 'The Perfekt is the most common past tense in spoken German. It is formed with a conjugated form of "haben" plus the past participle. Regular verbs build the participle with ge- + stem + -t.',
    formula: 'haben + ge- + Stamm + -t/-en',
    examples: [
      { sentence: 'Ich habe Deutsch gelernt. (I learned German.)', explanation: 'haben (conjugated) + ge-lern-t (past participle)' },
    ],
    commonMistakes: ['❌ "Ich habe lerne" → ✅ "Ich habe gelernt"'],
    questions: [
      { id: 'de_g3q1', question: 'Er ___ ein Buch gelesen.', options: ['hat', 'haben', 'ist', 'sein'], correctAnswer: 'hat', explanation: 'Third person singular of haben is "hat".' },
      { id: 'de_g3q2', question: 'Wir haben Fußball ___.', options: ['spielen', 'gespielt', 'spielt', 'gespielen'], correctAnswer: 'gespielt', explanation: 'spielen → ge-spiel-t (regular past participle).' },
    ],
    tags: ['tenses', 'basics', 'german']
  },
  {
    id: 'de_g4', title: 'Modalverben', level: 'A1',
    description: 'Modal verbs: können, müssen, wollen, dürfen, sollen',
    theory: 'Modal verbs modify the meaning of the main verb: können (can/ability), müssen (must/necessity), wollen (want), dürfen (may/permission), sollen (should/obligation). The modal is conjugated and the main verb goes to the end in infinitive form.',
    examples: [
      { sentence: 'Ich kann Deutsch sprechen. (I can speak German.)', explanation: 'Modal "kann" is conjugated; "sprechen" stays infinitive at the end' },
    ],
    commonMistakes: ['❌ "Ich kann spreche" → ✅ "Ich kann sprechen" — main verb stays infinitive'],
    questions: [
      { id: 'de_g4q1', question: 'Du ___ hier nicht rauchen. (not allowed)', options: ['kannst', 'darfst', 'willst', 'musst'], correctAnswer: 'darfst', explanation: '"dürfen" expresses permission; "darfst nicht" = not allowed.' },
      { id: 'de_g4q2', question: 'Wir ___ morgen früh aufstehen. (necessity)', options: ['wollen', 'können', 'müssen', 'sollen'], correctAnswer: 'müssen', explanation: '"müssen" expresses necessity or obligation.' },
    ],
    tags: ['verbs', 'modals', 'german']
  },

  // ═══ A2 ═══
  {
    id: 'de_g5', title: 'Dativ', level: 'A2',
    description: 'The dative case for indirect objects',
    theory: 'The dative case marks the indirect object — the person or thing that receives the direct object. Masculine and neuter articles change to dem/einem, feminine to der/einer, and plural nouns add -n to the ending with den.',
    formula: 'dem/einem (m,n) / der/einer (f) / den+n (pl)',
    examples: [
      { sentence: 'Ich gebe dem Kind ein Buch. (I give the child a book.)', explanation: 'das Kind → dem Kind in dative' },
    ],
    commonMistakes: ['❌ "Ich helfe der Mann" → ✅ "Ich helfe dem Mann" — helfen requires dative'],
    questions: [
      { id: 'de_g5q1', question: 'Ich gebe ___ Frau die Blumen. (f)', options: ['die', 'der', 'dem', 'den'], correctAnswer: 'der', explanation: 'Feminine dative article: die → der.' },
      { id: 'de_g5q2', question: 'Er hilft ___ Kindern. (pl)', options: ['die', 'der', 'dem', 'den'], correctAnswer: 'den', explanation: 'Plural dative article: die → den (+ -n on noun).' },
    ],
    tags: ['cases', 'german']
  },
  {
    id: 'de_g6', title: 'Wechselpräpositionen', level: 'A2',
    description: 'Two-way prepositions that take accusative or dative',
    theory: 'The nine two-way prepositions (in, auf, an, unter, über, vor, hinter, neben, zwischen) take the accusative when describing movement/direction (Wohin?) and the dative when describing a static position/location (Wo?).',
    examples: [
      { sentence: 'Ich gehe in das (ins) Kino. vs. Ich bin in dem (im) Kino.', explanation: 'Movement → Akk (ins); position → Dat (im)' },
    ],
    commonMistakes: ['❌ "Ich gehe in dem Kino" → ✅ "Ich gehe in das Kino" — movement requires accusative'],
    questions: [
      { id: 'de_g6q1', question: 'Die Katze springt auf ___ Tisch. (movement)', options: ['dem', 'den', 'der', 'das'], correctAnswer: 'den', explanation: 'Movement onto the table → accusative: den Tisch.' },
      { id: 'de_g6q2', question: 'Das Buch liegt auf ___ Tisch. (position)', options: ['dem', 'den', 'der', 'das'], correctAnswer: 'dem', explanation: 'Static position on the table → dative: dem Tisch.' },
    ],
    tags: ['prepositions', 'cases', 'german']
  },

  // ═══ B1 ═══
  {
    id: 'de_g7', title: 'Nebensätze', level: 'B1',
    description: 'Subordinate clauses with verb-final position',
    theory: 'In subordinate clauses introduced by conjunctions like weil (because), dass (that), wenn (when/if), or obwohl (although), the conjugated verb moves to the end of the clause.',
    formula: 'weil/dass/wenn/obwohl + S + ... + Verb(Ende)',
    examples: [
      { sentence: 'Ich lerne Deutsch, weil ich in Berlin arbeiten will.', explanation: 'The modal "will" goes to the end after "weil"' },
    ],
    commonMistakes: ['❌ "weil ich will arbeiten" → ✅ "weil ich arbeiten will" — verb must go to end'],
    questions: [
      { id: 'de_g7q1', question: 'Ich weiß, dass er morgen ___.', options: ['kommt', 'kommen', 'er kommt', 'kommt er'], correctAnswer: 'kommt', explanation: 'In a dass-clause the conjugated verb goes to the end.' },
      { id: 'de_g7q2', question: 'Sie bleibt zu Hause, weil sie krank ___.', options: ['ist', 'sein', 'hat', 'wird'], correctAnswer: 'ist', explanation: 'The verb "ist" moves to the end of the weil-clause.' },
    ],
    tags: ['clauses', 'word-order', 'german']
  },
  {
    id: 'de_g8', title: 'Passiv', level: 'B1',
    description: 'The passive voice in German',
    theory: 'The German passive (Vorgangspassiv) is formed with "werden" plus the past participle (Partizip II). The subject of the passive sentence is the thing being acted upon. The doer can be expressed with "von + Dativ".',
    formula: 'werden + Partizip II',
    examples: [
      { sentence: 'Das Haus wird gebaut. (The house is being built.)', explanation: 'werden (conjugated) + gebaut (past participle)' },
    ],
    commonMistakes: ['❌ "Das Haus ist gebaut" (= state) → ✅ "Das Haus wird gebaut" (= process/action)'],
    questions: [
      { id: 'de_g8q1', question: 'Der Brief ___ geschrieben.', options: ['wird', 'hat', 'ist', 'haben'], correctAnswer: 'wird', explanation: 'Passive present: werden + Partizip II.' },
      { id: 'de_g8q2', question: 'Die Tür wurde von dem Lehrer ___.', options: ['öffnen', 'geöffnet', 'öffnete', 'geöffnen'], correctAnswer: 'geöffnet', explanation: 'Past passive: wurde + past participle (geöffnet).' },
    ],
    tags: ['passive', 'german']
  },

  // ═══ B2 ═══
  {
    id: 'de_g9', title: 'Relativsätze', level: 'B2',
    description: 'Relative clauses to add information about a noun',
    theory: 'Relative clauses describe a noun in more detail. The relative pronoun (der/die/das) agrees in gender and number with the noun it refers to, and takes its case from its function within the relative clause. The verb goes to the end.',
    formula: 'Nomen, der/die/das + Verb(Ende)',
    examples: [
      { sentence: 'Der Mann, der dort steht, ist mein Lehrer.', explanation: 'der Mann (m) → relative pronoun "der" (nominative); verb "steht" at the end' },
    ],
    commonMistakes: ['❌ "Der Mann, der steht dort" → ✅ "Der Mann, der dort steht" — verb goes to end'],
    questions: [
      { id: 'de_g9q1', question: 'Die Frau, ___ ich gestern getroffen habe, ist Ärztin.', options: ['die', 'der', 'das', 'dem'], correctAnswer: 'die', explanation: 'die Frau (f) is accusative object in the relative clause → die.' },
      { id: 'de_g9q2', question: 'Das Buch, ___ auf dem Tisch liegt, gehört mir.', options: ['der', 'die', 'das', 'dem'], correctAnswer: 'das', explanation: 'das Buch (n) is the subject of the relative clause → das.' },
    ],
    tags: ['clauses', 'advanced', 'german']
  },
  {
    id: 'de_g10', title: 'Konjunktiv II', level: 'B2',
    description: 'Subjunctive mood for wishes, polite requests, and hypotheticals',
    theory: 'Konjunktiv II expresses unreal or hypothetical situations, wishes, and polite requests. Most verbs use "würde + Infinitiv". The verbs haben, sein, and modal verbs use their own Konjunktiv II forms: hätte, wäre, könnte, müsste, etc.',
    formula: 'würde + Infinitiv / hätte / wäre',
    examples: [
      { sentence: 'Wenn ich reich wäre, würde ich eine Weltreise machen.', explanation: '"wäre" (Konj. II of sein) + "würde machen" for the hypothetical result' },
    ],
    commonMistakes: ['❌ "Wenn ich reich bin, mache ich..." (= real) → ✅ "Wenn ich reich wäre, würde ich..." (= hypothetical)'],
    questions: [
      { id: 'de_g10q1', question: 'Wenn ich mehr Zeit ___, würde ich Sport machen.', options: ['habe', 'hätte', 'hatte', 'haben'], correctAnswer: 'hätte', explanation: 'Hypothetical condition requires Konjunktiv II: hätte.' },
      { id: 'de_g10q2', question: 'An deiner Stelle ___ ich zum Arzt gehen.', options: ['werde', 'will', 'würde', 'wollte'], correctAnswer: 'würde', explanation: '"An deiner Stelle" (if I were you) triggers Konjunktiv II: würde + Infinitiv.' },
    ],
    tags: ['subjunctive', 'advanced', 'german']
  },
];
