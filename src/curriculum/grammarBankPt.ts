import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankPt: GrammarTopic[] = [
  {
    id: 'pt_g1', title: 'Artigos (o/a, um/uma)', level: 'A1',
    description: 'Definite and indefinite articles in Portuguese',
    theory: 'Portuguese has gendered articles: "o" (masc.) / "a" (fem.) for definite, "um" (masc.) / "uma" (fem.) for indefinite. Plurals: os/as, uns/umas.',
    formula: 'o/a + noun (definite) | um/uma + noun (indefinite)',
    examples: [{ sentence: 'O gato dorme. / A casa e grande.', explanation: '"o" for masculine "gato", "a" for feminine "casa"' }],
    commonMistakes: ['O casa (casa is feminine) -> A casa'],
    questions: [
      { id: 'pt_g1q1', question: '___ livro esta na mesa.', options: ['O', 'A', 'Um', 'Uma'], correctAnswer: 'O', explanation: '"Livro" is masculine singular -> "O".' },
      { id: 'pt_g1q2', question: 'Ela tem ___ amiga brasileira.', options: ['um', 'uma', 'o', 'a'], correctAnswer: 'uma', explanation: '"Amiga" is feminine -> indefinite article "uma".' },
    ],
    tags: ['articles', 'basics']
  },
  {
    id: 'pt_g2', title: 'Presente do indicativo (-ar/-er/-ir)', level: 'A1',
    description: 'Regular present-tense conjugation for the three verb groups',
    theory: 'Drop the infinitive ending and add: -ar (falo, falas, fala, falamos, falam), -er (como, comes, come, comemos, comem), -ir (parto, partes, parte, partimos, partem).',
    formula: 'radical + endings per conjugation group',
    examples: [{ sentence: 'Eu falo portugues. / Nos comemos arroz.', explanation: '"falo" from falar (-ar), "comemos" from comer (-er)' }],
    commonMistakes: ['Ele falo (wrong person) -> Ele fala'],
    questions: [
      { id: 'pt_g2q1', question: 'Nos ___ (viver) em Lisboa.', options: ['vivo', 'vives', 'vivemos', 'vivem'], correctAnswer: 'vivemos', explanation: 'With "nos", -ir/-er verbs take -emos: vivemos.' },
      { id: 'pt_g2q2', question: 'Eles ___ (cantar) muito bem.', options: ['canto', 'canta', 'cantamos', 'cantam'], correctAnswer: 'cantam', explanation: 'With "eles", -ar verbs take -am: cantam.' },
    ],
    tags: ['verbs', 'conjugation', 'basics']
  },
  {
    id: 'pt_g3', title: 'Preterito perfeito vs imperfeito', level: 'A2',
    description: 'Choosing between completed past actions and habitual/background past',
    theory: 'Perfeito = completed, one-time past actions. Imperfeito = habitual, repeated, or background past actions and descriptions.',
    examples: [{ sentence: 'Ontem eu comi pizza. / Quando era crianca, eu comia pizza toda semana.', explanation: '"comi" = one-time completed; "comia" = habitual past' }],
    commonMistakes: ['Ontem eu comia pizza (habitual form for one-time event) -> Ontem eu comi pizza'],
    questions: [
      { id: 'pt_g3q1', question: 'Quando eu era jovem, eu ___ (nadar) todos os dias.', options: ['nadei', 'nadava', 'nado', 'nadarei'], correctAnswer: 'nadava', explanation: 'Habitual past action -> imperfeito: nadava.' },
      { id: 'pt_g3q2', question: 'Ontem ela ___ (comprar) um vestido novo.', options: ['comprava', 'comprou', 'compra', 'comprara'], correctAnswer: 'comprou', explanation: 'Completed past action -> preterito perfeito: comprou.' },
    ],
    tags: ['verbs', 'past-tense']
  },
  {
    id: 'pt_g4', title: 'Pronomes de objeto (o/a, lhe)', level: 'A2',
    description: 'Direct and indirect object pronouns',
    theory: 'Direct object pronouns: o/a/os/as (him/her/them). Indirect object pronouns: lhe/lhes (to him/her/them). They usually go after the verb with a hyphen, or before in certain constructions.',
    examples: [{ sentence: 'Eu vi-o na rua. / Eu dei-lhe o presente.', explanation: '"o" = direct (him); "lhe" = indirect (to him/her)' }],
    commonMistakes: ['Eu lhe vi (indirect for direct object) -> Eu o vi'],
    questions: [
      { id: 'pt_g4q1', question: 'Eu comprei a revista. Eu comprei-___.', options: ['a', 'o', 'lhe', 'las'], correctAnswer: 'a', explanation: '"Revista" is feminine singular -> direct object pronoun "a".' },
      { id: 'pt_g4q2', question: 'Ele disse ao Joao: Ele disse-___ a verdade.', options: ['lhe', 'o', 'a', 'lhes'], correctAnswer: 'lhe', explanation: '"Ao Joao" is indirect object -> "lhe".' },
    ],
    tags: ['pronouns', 'object-pronouns']
  },
  {
    id: 'pt_g5', title: 'Subjuntivo presente', level: 'B1',
    description: 'Present subjunctive after expressions of wish, doubt, emotion',
    theory: 'Used after "que" with verbs of desire (querer), doubt (duvidar), emotion (esperar). Regular: -ar -> -e endings, -er/-ir -> -a endings.',
    formula: 'que + sujeito + subjuntivo',
    examples: [{ sentence: 'Espero que voce fale com ele.', explanation: '"fale" is subjunctive of "falar" after "espero que"' }],
    commonMistakes: ['Espero que voce fala (indicative instead of subjunctive) -> Espero que voce fale'],
    questions: [
      { id: 'pt_g5q1', question: 'Eu quero que ele ___ (estudar) mais.', options: ['estude', 'estuda', 'estudar', 'estudou'], correctAnswer: 'estude', explanation: 'After "quero que", use subjunctive: estude.' },
      { id: 'pt_g5q2', question: 'Duvido que eles ___ (saber) a resposta.', options: ['saibam', 'sabem', 'saber', 'souberam'], correctAnswer: 'saibam', explanation: 'After "duvido que", use subjunctive of saber: saibam.' },
    ],
    tags: ['verbs', 'subjunctive']
  },
  {
    id: 'pt_g6', title: 'Futuro do subjuntivo', level: 'B1',
    description: 'Future subjunctive in conditional and temporal clauses',
    theory: 'Unique to Portuguese. Used after "quando", "se", "assim que" for future possibility. Formed from the 3rd person plural preterite stem + -r, -res, -r, -rmos, -rem.',
    examples: [{ sentence: 'Quando eu chegar, telefono-te.', explanation: '"chegar" is future subjunctive after "quando" for a future event' }],
    commonMistakes: ['Quando eu chego (present instead of future subjunctive) -> Quando eu chegar'],
    questions: [
      { id: 'pt_g6q1', question: 'Se voce ___ (poder), venha amanha.', options: ['puder', 'pode', 'podia', 'poderia'], correctAnswer: 'puder', explanation: 'After "se" for future possibility -> future subjunctive: puder.' },
      { id: 'pt_g6q2', question: 'Quando nos ___ (ter) tempo, viajamos.', options: ['tivermos', 'temos', 'teremos', 'tivemos'], correctAnswer: 'tivermos', explanation: 'After "quando" for future -> future subjunctive: tivermos.' },
    ],
    tags: ['verbs', 'subjunctive', 'advanced']
  },
  {
    id: 'pt_g7', title: 'Voz passiva', level: 'B2',
    description: 'Forming passive voice sentences in Portuguese',
    theory: 'Use "ser" conjugated in the appropriate tense + past participle (agrees in gender/number) + "por" for the agent. Alternative: passive "se" (vende-se).',
    formula: 'ser + particípio passado + por',
    examples: [{ sentence: 'O livro foi escrito por Machado de Assis.', explanation: '"foi escrito" = passive of "escrever"; "por" introduces the agent' }],
    commonMistakes: ['A carta foi escrito (no gender agreement) -> A carta foi escrita'],
    questions: [
      { id: 'pt_g7q1', question: 'A musica ___ (cantar) por todos.', options: ['foi cantada', 'foi cantado', 'cantou', 'e cantar'], correctAnswer: 'foi cantada', explanation: '"Musica" is feminine -> ser + cantada (fem. agreement).' },
      { id: 'pt_g7q2', question: 'Os quadros ___ (pintar) por artistas locais.', options: ['foram pintados', 'foi pintado', 'pintaram', 'sao pintar'], correctAnswer: 'foram pintados', explanation: 'Plural masculine -> foram + pintados.' },
    ],
    tags: ['passive-voice', 'advanced']
  },
  {
    id: 'pt_g8', title: 'Regencia verbal (assistir a, gostar de)', level: 'B2',
    description: 'Verb-preposition government in Portuguese',
    theory: 'Many Portuguese verbs require specific prepositions: assistir a (to watch), gostar de (to like), precisar de (to need), pensar em (to think about). Using the wrong preposition is a common error.',
    examples: [{ sentence: 'Eu assisti ao jogo. / Ela gosta de musica.', explanation: '"assistir" requires "a"; "gostar" requires "de"' }],
    commonMistakes: ['Eu assisti o jogo (missing preposition "a") -> Eu assisti ao jogo'],
    questions: [
      { id: 'pt_g8q1', question: 'Ela gosta ___ chocolate.', options: ['de', 'a', 'em', 'com'], correctAnswer: 'de', explanation: '"Gostar" requires the preposition "de".' },
      { id: 'pt_g8q2', question: 'Nos assistimos ___ filme ontem.', options: ['ao', 'o', 'no', 'do'], correctAnswer: 'ao', explanation: '"Assistir" requires "a" + "o" contracts to "ao".' },
    ],
    tags: ['prepositions', 'regency', 'advanced']
  },
];
