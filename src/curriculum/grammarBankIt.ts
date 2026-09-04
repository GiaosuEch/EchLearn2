import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankIt: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'it_g1', title: 'Articoli (il/lo/la, un/uno/una)', level: 'A1',
    description: 'Definite and indefinite articles in Italian',
    theory: 'Italian has gendered articles. Definite: il (masc.), lo (masc. before s+cons/z), la (fem.), i/gli/le (plurals). Indefinite: un (masc.), uno (before s+cons/z), una/un\' (fem.).',
    formula: 'il/lo/la + noun (definite) / un/uno/una + noun (indefinite)',
    examples: [
      { sentence: 'Il gatto dorme. / Lo studente studia. / La casa e grande.', explanation: '"il" before consonant, "lo" before s+consonant, "la" for feminine' },
    ],
    commonMistakes: ['Il studente (wrong article before s+cons) -> Lo studente'],
    questions: [
      { id: 'it_g1q1', question: '___ zaino e pesante. (The backpack is heavy.)', options: ['Lo', 'Il', 'La', 'Un'], correctAnswer: 'Lo', explanation: '"Zaino" starts with z, so use "lo" for the definite article.' },
      { id: 'it_g1q2', question: 'Ho ___ amica italiana. (I have an Italian friend.)', options: ["un'", 'una', 'un', 'uno'], correctAnswer: "un'", explanation: '"Amica" is feminine starting with a vowel, so use "un\'".' },
    ],
    tags: ['articles', 'basics']
  },
  {
    id: 'it_g2', title: 'Presente indicativo (-are/-ere/-ire)', level: 'A1',
    description: 'Conjugating regular verbs in the present indicative',
    theory: 'Italian verbs fall into three conjugations: -are (parlare), -ere (leggere), -ire (dormire). Drop the ending and add: -are: -o/-i/-a/-iamo/-ate/-ano; -ere: -o/-i/-e/-iamo/-ete/-ono; -ire: -o/-i/-e/-iamo/-ite/-ono.',
    formula: '-are: -o/-i/-a/-iamo/-ate/-ano',
    examples: [
      { sentence: 'Io parlo italiano. / Noi mangiamo la pizza.', explanation: '"Parlare" -> parlo (io); "mangiare" -> mangiamo (noi)' },
    ],
    commonMistakes: ['Io parla (third-person ending with io) -> Io parlo'],
    questions: [
      { id: 'it_g2q1', question: 'Loro ___ (leggere) il giornale.', options: ['leggono', 'leggano', 'legge', 'leggere'], correctAnswer: 'leggono', explanation: '"Leggere" with "loro" uses the -ono ending: leggono.' },
      { id: 'it_g2q2', question: 'Tu ___ (dormire) molto.', options: ['dormi', 'dorme', 'dormo', 'dormite'], correctAnswer: 'dormi', explanation: '"Dormire" with "tu" uses the -i ending: dormi.' },
    ],
    tags: ['verbs', 'conjugation', 'basics']
  },
  {
    id: 'it_g3', title: 'Passato prossimo (avere/essere + participio)', level: 'A1',
    description: 'Forming the past tense with auxiliary verbs',
    theory: 'The passato prossimo uses avere or essere + past participle. Most verbs use avere. Verbs of motion/change (andare, venire) use essere and the participle agrees in gender/number.',
    formula: 'avere/essere + participio passato (-ato/-uto/-ito)',
    examples: [
      { sentence: 'Ho mangiato la pizza. / Sono andato a Roma.', explanation: '"Mangiare" uses avere; "andare" uses essere (masculine agreement)' },
    ],
    commonMistakes: ['Ho andato (wrong auxiliary) -> Sono andato'],
    questions: [
      { id: 'it_g3q1', question: 'Maria ___ (arrivare) ieri.', options: ['e arrivata', 'ha arrivato', 'e arrivato', 'ha arrivata'], correctAnswer: 'e arrivata', explanation: '"Arrivare" uses essere; Maria is feminine -> arrivata.' },
      { id: 'it_g3q2', question: 'Noi ___ (comprare) un regalo.', options: ['abbiamo comprato', 'siamo comprato', 'abbiamo compare', 'siamo comprati'], correctAnswer: 'abbiamo comprato', explanation: '"Comprare" uses avere with noi -> abbiamo comprato.' },
    ],
    tags: ['verbs', 'past-tense']
  },
  // ═══ A2 ═══
  {
    id: 'it_g4', title: 'Imperfetto vs Passato prossimo', level: 'A2',
    description: 'Choosing between imperfetto and passato prossimo',
    theory: 'The imperfetto describes habitual or ongoing past actions and background descriptions. The passato prossimo describes completed actions. Imperfetto endings: -avo/-evo/-ivo for io.',
    formula: 'Imperfetto: habitual/description; Passato prossimo: completed event',
    examples: [
      { sentence: 'Mentre dormivo, ha suonato il telefono.', explanation: '"dormivo" (imperfetto: ongoing) vs "ha suonato" (passato prossimo: sudden event)' },
    ],
    commonMistakes: ['Quando ero bambino, ho giocato sempre (completed for habitual) -> giocavo sempre'],
    questions: [
      { id: 'it_g4q1', question: 'Da bambino ___ (giocare) sempre a calcio.', options: ['giocavo', 'ho giocato', 'gioco', 'giochero'], correctAnswer: 'giocavo', explanation: 'Habitual past action uses imperfetto: giocavo.' },
      { id: 'it_g4q2', question: 'Ieri ___ (vedere) un film bellissimo.', options: ['ho visto', 'vedevo', 'vedo', 'vedro'], correctAnswer: 'ho visto', explanation: 'A completed past action uses passato prossimo: ho visto.' },
    ],
    tags: ['verbs', 'past-tense', 'aspect']
  },
  {
    id: 'it_g5', title: 'Pronomi diretti (lo/la/li/le)', level: 'A2',
    description: 'Direct object pronouns and their placement',
    theory: 'Direct object pronouns replace the noun receiving the action: lo (him/it masc.), la (her/it fem.), li (them masc.), le (them fem.). They go before the conjugated verb.',
    formula: 'lo/la/li/le + verb',
    examples: [
      { sentence: 'Vedi il libro? Si, lo vedo.', explanation: '"lo" replaces "il libro" (masculine singular) and goes before the verb' },
    ],
    commonMistakes: ['Vedo lo (pronoun after verb) -> Lo vedo'],
    questions: [
      { id: 'it_g5q1', question: 'Mangi la pizza? Si, ___ mangio.', options: ['la', 'lo', 'le', 'li'], correctAnswer: 'la', explanation: '"Pizza" is feminine singular -> use "la" before the verb.' },
      { id: 'it_g5q2', question: 'Conosci i miei amici? Si, ___ conosco.', options: ['li', 'lo', 'le', 'la'], correctAnswer: 'li', explanation: '"Amici" is masculine plural -> use "li" before the verb.' },
    ],
    tags: ['pronouns', 'object-pronouns']
  },
  // ═══ B1 ═══
  {
    id: 'it_g6', title: 'Congiuntivo presente', level: 'B1',
    description: 'The present subjunctive after expressions of opinion, emotion, and doubt',
    theory: 'The congiuntivo is used after "che" with verbs of opinion (pensare), emotion (essere contento), doubt (dubitare), and impersonal expressions (bisogna che). Endings: -are -> -i/-i/-i/-iamo/-iate/-ino.',
    formula: 'che + soggetto + congiuntivo',
    examples: [
      { sentence: 'Penso che lui parli italiano.', explanation: '"parli" is the congiuntivo of "parlare" after "penso che"' },
    ],
    commonMistakes: ['Penso che lui parla (indicative after penso che) -> Penso che lui parli'],
    questions: [
      { id: 'it_g6q1', question: 'Credo che Maria ___ (essere) brava.', options: ['sia', 'e', 'era', 'sara'], correctAnswer: 'sia', explanation: 'After "credo che", use congiuntivo of essere: sia.' },
      { id: 'it_g6q2', question: 'Bisogna che voi ___ (studiare) di piu.', options: ['studiate', 'studiate', 'studiamo', 'studiano'], correctAnswer: 'studiate', explanation: 'After "bisogna che", congiuntivo with voi: studiate.' },
    ],
    tags: ['verbs', 'subjunctive']
  },
  {
    id: 'it_g7', title: 'Condizionale', level: 'B1',
    description: 'Expressing hypothetical situations and polite requests',
    theory: 'The condizionale uses the future stem + imperfetto-like endings: -ei, -esti, -ebbe, -emmo, -este, -ebbero. It expresses wishes, polite requests, and hypothetical results.',
    formula: 'future stem + -ei/-esti/-ebbe/-emmo/-este/-ebbero',
    examples: [
      { sentence: 'Vorrei un caffe, per favore.', explanation: '"vorrei" is the condizionale of "volere" for a polite request' },
    ],
    commonMistakes: ['Se avrei tempo (condizionale in se-clause) -> Se avessi tempo, andrei'],
    questions: [
      { id: 'it_g7q1', question: 'Con piu soldi, ___ (comprare) una casa.', options: ['comprerei', 'compro', 'comprero', 'compravo'], correctAnswer: 'comprerei', explanation: 'Hypothetical result uses condizionale: comprerei.' },
      { id: 'it_g7q2', question: '___ (potere) aiutarmi, per favore?', options: ['Potresti', 'Puoi', 'Potrai', 'Potevi'], correctAnswer: 'Potresti', explanation: 'Polite request uses condizionale: potresti.' },
    ],
    tags: ['verbs', 'condizionale']
  },
  {
    id: 'it_g8', title: 'Pronomi combinati (glielo/gliela)', level: 'B1',
    description: 'Combining indirect and direct object pronouns',
    theory: 'When both indirect (mi/ti/gli/le/ci/vi) and direct (lo/la/li/le) pronouns appear, the indirect comes first and changes form: mi->me, ti->te, gli/le->glie (written together: glielo, gliela, glieli, gliele).',
    formula: 'indirect + direct -> combined (e.g. gli + lo -> glielo)',
    examples: [
      { sentence: 'Dai il libro a Marco? Si, glielo do.', explanation: '"gli" (to him) + "lo" (it) -> "glielo" before the verb' },
    ],
    commonMistakes: ['Gli lo do (not combined) -> Glielo do'],
    questions: [
      { id: 'it_g8q1', question: 'Mandi la lettera a Maria? Si, ___ mando.', options: ['gliela', 'glielo', 'glieli', 'gliele'], correctAnswer: 'gliela', explanation: '"le" (to her) + "la" (it, fem.) -> "gliela".' },
      { id: 'it_g8q2', question: 'Puoi portare i libri a Paolo? Si, ___ porto.', options: ['glieli', 'glielo', 'gliela', 'gliele'], correctAnswer: 'glieli', explanation: '"gli" (to him) + "li" (them, masc.) -> "glieli".' },
    ],
    tags: ['pronouns', 'combined-pronouns']
  },
  // ═══ B2 ═══
  {
    id: 'it_g9', title: 'Passivo (essere + participio passato)', level: 'B2',
    description: 'Forming passive voice sentences in Italian',
    theory: 'The passive shifts focus to the receiver. Use "essere" conjugated in the desired tense + past participle (agreeing in gender/number). The agent is introduced with "da".',
    formula: 'essere + participio passato + da (agent)',
    examples: [
      { sentence: 'La pizza e mangiata da tutti.', explanation: '"e mangiata" = passive of "mangiare"; "da tutti" = by everyone' },
    ],
    commonMistakes: ['Il libro e scritto da Maria (no agreement issue here, but:) La lettera e scritto -> La lettera e scritta'],
    questions: [
      { id: 'it_g9q1', question: 'Le canzoni ___ (cantare) dal coro.', options: ['sono cantate', 'hanno cantato', 'e cantata', 'sono cantati'], correctAnswer: 'sono cantate', explanation: '"Canzoni" is fem. plural -> sono + cantate (fem. plural agreement).' },
      { id: 'it_g9q2', question: 'Il quadro ___ (dipingere) da Picasso.', options: ['fu dipinto', 'ha dipinto', 'e dipingere', 'sono dipinti'], correctAnswer: 'fu dipinto', explanation: 'Passato remoto passive: "fu" (essere) + "dipinto" (masc. singular).' },
    ],
    tags: ['passive-voice', 'advanced']
  },
  {
    id: 'it_g10', title: 'Periodo ipotetico (se + congiuntivo/condizionale)', level: 'B2',
    description: 'Forming conditional sentences with "if" clauses',
    theory: 'Italian has three main conditional types. Type 1 (real): se + presente, futuro. Type 2 (possible): se + congiuntivo imperfetto, condizionale presente. Type 3 (impossible): se + congiuntivo trapassato, condizionale passato.',
    formula: 'Se + congiuntivo imperfetto, condizionale presente (Type 2)',
    examples: [
      { sentence: 'Se avessi tempo, viaggerei di piu.', explanation: '"avessi" (congiuntivo imperfetto) + "viaggerei" (condizionale) = Type 2 hypothetical' },
    ],
    commonMistakes: ['Se avrei tempo (condizionale in se-clause) -> Se avessi tempo'],
    questions: [
      { id: 'it_g10q1', question: 'Se ___ (essere) ricco, comprerei un\'isola.', options: ['fossi', 'sarei', 'sono', 'ero'], correctAnswer: 'fossi', explanation: 'Type 2 "if" clause uses congiuntivo imperfetto: fossi.' },
      { id: 'it_g10q2', question: 'Se avessi studiato, ___ (superare) l\'esame.', options: ['avrei superato', 'ho superato', 'superavo', 'superero'], correctAnswer: 'avrei superato', explanation: 'Type 3 result uses condizionale passato: avrei superato.' },
    ],
    tags: ['conditionals', 'advanced']
  },
];
