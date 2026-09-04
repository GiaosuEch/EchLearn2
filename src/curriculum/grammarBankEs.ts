import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankEs: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'es_g1', title: 'Ser vs Estar', level: 'A1',
    description: 'Two verbs "to be" in Spanish and when to use each',
    theory: '"Ser" describes identity, origin, profession, and permanent traits. "Estar" describes location, temporary states, emotions, and conditions. Mixing them changes meaning: "Es aburrido" (he is boring) vs "Está aburrido" (he is bored).',
    formula: 'Ser = identity/origin | Estar = location/state',
    examples: [
      { sentence: 'Ella es doctora. / Ella está cansada.', explanation: 'Ser for profession; estar for temporary state' },
    ],
    commonMistakes: ['❌ "Yo estoy español" → ✅ "Yo soy español" (origin uses ser)'],
    questions: [
      { id: 'es_g1q1', question: 'María ___ de México.', options: ['es', 'está', 'ser', 'estar'], correctAnswer: 'es', explanation: 'Origin requires "ser".' },
      { id: 'es_g1q2', question: 'El café ___ caliente.', options: ['es', 'está', 'son', 'están'], correctAnswer: 'está', explanation: 'Temporary state (hot) requires "estar".' },
    ],
    tags: ['basics', 'verbs']
  },
  {
    id: 'es_g2', title: 'Presente regular', level: 'A1',
    description: 'Regular present-tense conjugation for -ar, -er, -ir verbs',
    theory: 'Spanish regular verbs follow predictable endings based on their infinitive group. Remove the infinitive ending and add the corresponding person/number suffix.',
    formula: '-ar: -o/-as/-a/-amos/-áis/-an | -er: -o/-es/-e/-emos/-éis/-en',
    examples: [
      { sentence: 'Yo hablo español. Tú comes pan. Él vive aquí.', explanation: '-ar → hablo, -er → comes, -ir → vive' },
    ],
    commonMistakes: ['❌ "Yo hables" → ✅ "Yo hablo" (first person singular ends in -o)'],
    questions: [
      { id: 'es_g2q1', question: 'Nosotros ___ (hablar) español.', options: ['hablamos', 'hablan', 'habláis', 'hablas'], correctAnswer: 'hablamos', explanation: 'Nosotros + -ar verb → -amos ending.' },
      { id: 'es_g2q2', question: 'Ella ___ (comer) a las dos.', options: ['come', 'comes', 'comen', 'comemos'], correctAnswer: 'come', explanation: 'Third person singular of -er verb → -e ending.' },
    ],
    tags: ['tenses', 'basics']
  },
  {
    id: 'es_g3', title: 'Pretérito indefinido', level: 'A1',
    description: 'Simple past tense for completed actions',
    theory: 'The pretérito indefinido expresses completed actions at a specific point in the past. It is the main narrative tense in Spanish. Regular -ar verbs take a distinct set of endings.',
    formula: '-ar: -é/-aste/-ó/-amos/-asteis/-aron',
    examples: [
      { sentence: 'Ayer hablé con mi madre.', explanation: 'Completed action yesterday: hablar → hablé' },
    ],
    commonMistakes: ['❌ "Yo habló" → ✅ "Yo hablé" (accent on -é for first person)'],
    questions: [
      { id: 'es_g3q1', question: 'Ellos ___ (comprar) un coche ayer.', options: ['compraron', 'compraban', 'compran', 'comprarán'], correctAnswer: 'compraron', explanation: 'Third person plural pretérito indefinido of -ar → -aron.' },
      { id: 'es_g3q2', question: 'Yo ___ (trabajar) allí en 2020.', options: ['trabajé', 'trabajaba', 'trabajo', 'trabajaré'], correctAnswer: 'trabajé', explanation: 'Completed past action at a specific time → pretérito indefinido.' },
    ],
    tags: ['tenses', 'past']
  },
  {
    id: 'es_g4', title: 'Gustar', level: 'A1',
    description: 'Expressing likes and dislikes with the verb gustar',
    theory: 'Gustar works backwards compared to English "to like". The thing liked is the grammatical subject, and the person who likes it is an indirect object pronoun. Use "gusta" for singular nouns/infinitives and "gustan" for plural nouns.',
    formula: 'Me/Te/Le/Nos/Os/Les + gusta (sg) / gustan (pl)',
    examples: [
      { sentence: 'Me gusta el café. / Me gustan los libros.', explanation: 'Singular noun → gusta; plural noun → gustan' },
    ],
    commonMistakes: ['❌ "Yo gusto el café" → ✅ "Me gusta el café" (indirect object, not subject)'],
    questions: [
      { id: 'es_g4q1', question: 'A ella le ___ las películas de terror.', options: ['gusta', 'gustan', 'gusto', 'gustas'], correctAnswer: 'gustan', explanation: '"Las películas" is plural → gustan.' },
      { id: 'es_g4q2', question: 'Nos ___ bailar salsa.', options: ['gusta', 'gustan', 'gustamos', 'gusto'], correctAnswer: 'gusta', explanation: 'An infinitive (bailar) takes the singular form → gusta.' },
    ],
    tags: ['basics', 'verbs']
  },

  // ═══ A2 ═══
  {
    id: 'es_g5', title: 'Imperfecto vs Indefinido', level: 'A2',
    description: 'Choosing between habitual past and completed past',
    theory: 'The imperfecto describes habitual or repeated actions in the past, background descriptions, and ongoing states. The indefinido marks completed, one-time events. In narration, imperfecto sets the scene while indefinido advances the plot.',
    examples: [
      { sentence: 'Cuando era niño, jugaba al fútbol. Un día me rompí el brazo.', explanation: 'Imperfecto for habitual action; indefinido for the single event' },
    ],
    commonMistakes: ['❌ "Ayer llovía" (for a completed event) → ✅ "Ayer llovió" (completed)'],
    questions: [
      { id: 'es_g5q1', question: 'De pequeño, yo ___ (ir) a la playa cada verano.', options: ['fui', 'iba', 'voy', 'iré'], correctAnswer: 'iba', explanation: 'Habitual past action → imperfecto.' },
      { id: 'es_g5q2', question: 'Anoche ___ (llegar) a casa a las diez.', options: ['llegaba', 'llegué', 'llego', 'llegaré'], correctAnswer: 'llegué', explanation: 'One-time completed action at a specific time → indefinido.' },
    ],
    tags: ['tenses', 'past']
  },
  {
    id: 'es_g6', title: 'Por vs Para', level: 'A2',
    description: 'Two prepositions with distinct uses',
    theory: '"Por" indicates cause, reason, exchange, duration, and movement through. "Para" indicates purpose, destination, recipient, and deadlines. A helpful mnemonic: por looks back (why it happened), para looks forward (what it is for).',
    examples: [
      { sentence: 'Estudio por la noche. / Estudio para el examen.', explanation: 'Por = during (time); para = purpose (the exam)' },
    ],
    commonMistakes: ['❌ "Gracias para tu ayuda" → ✅ "Gracias por tu ayuda" (cause/reason)'],
    questions: [
      { id: 'es_g6q1', question: 'Este regalo es ___ ti.', options: ['por', 'para', 'de', 'a'], correctAnswer: 'para', explanation: 'Recipient/destination → para.' },
      { id: 'es_g6q2', question: 'Cambié mi coche ___ una moto.', options: ['por', 'para', 'con', 'de'], correctAnswer: 'por', explanation: 'Exchange → por.' },
    ],
    tags: ['prepositions']
  },

  // ═══ B1 ═══
  {
    id: 'es_g7', title: 'Subjuntivo presente', level: 'B1',
    description: 'Expressing wishes, doubts, and emotions',
    theory: 'The present subjunctive is used after expressions of desire, doubt, emotion, and impersonal judgments. It appears in subordinate clauses introduced by "que". To form it, take the yo-present indicative, drop the -o, and add opposite-vowel endings.',
    formula: 'que + subj: -ar→-e/-es/-e/-emos/-éis/-en',
    examples: [
      { sentence: 'Quiero que vengas a mi fiesta.', explanation: 'Desire (quiero) triggers subjunctive (vengas)' },
    ],
    commonMistakes: ['❌ "Espero que vienes" → ✅ "Espero que vengas" (esperar triggers subjunctive)'],
    questions: [
      { id: 'es_g7q1', question: 'Es importante que tú ___ (estudiar) más.', options: ['estudias', 'estudies', 'estudiar', 'estudiarás'], correctAnswer: 'estudies', explanation: 'Impersonal expression + que → subjunctive: estudiar → estudies.' },
      { id: 'es_g7q2', question: 'Dudo que él ___ (tener) razón.', options: ['tiene', 'tenga', 'tendrá', 'tuvo'], correctAnswer: 'tenga', explanation: 'Doubt (dudo que) triggers subjunctive: tener → tenga.' },
    ],
    tags: ['subjunctive', 'verbs']
  },
  {
    id: 'es_g8', title: 'Condicional', level: 'B1',
    description: 'Expressing hypothetical actions and polite requests',
    theory: 'The conditional tense expresses what would happen under certain conditions, polite requests, and advice. It is formed by adding endings directly to the full infinitive, making it one of the easiest tenses to conjugate.',
    formula: 'infinitivo + -ía/-ías/-ía/-íamos/-íais/-ían',
    examples: [
      { sentence: 'Yo viajaría por todo el mundo.', explanation: 'Hypothetical: viajar + -ía → viajaría' },
    ],
    commonMistakes: ['❌ "Yo hablaré si pudiera" → ✅ "Yo hablaría si pudiera" (conditional, not future)'],
    questions: [
      { id: 'es_g8q1', question: 'Con más dinero, yo ___ (comprar) una casa.', options: ['compro', 'compré', 'compraría', 'compraré'], correctAnswer: 'compraría', explanation: 'Hypothetical situation → conditional: comprar + -ía.' },
      { id: 'es_g8q2', question: '¿___ (poder) usted ayudarme?', options: ['Puede', 'Podría', 'Pudo', 'Podrá'], correctAnswer: 'Podría', explanation: 'Polite request → conditional: poder → podría.' },
    ],
    tags: ['tenses', 'verbs']
  },

  // ═══ B2 ═══
  {
    id: 'es_g9', title: 'Subjuntivo imperfecto', level: 'B2',
    description: 'Past subjunctive for hypothetical and past wishes',
    theory: 'The imperfect subjunctive is used for hypothetical conditions (si + imperfect subjunctive + conditional), past wishes, and polite requests. It is derived from the third person plural of the pretérito indefinido by replacing -ron with -ra endings.',
    formula: '3a pers. pl. pret. indef. → -ra/-ras/-ra/-ramos/-rais/-ran',
    examples: [
      { sentence: 'Si tuviera dinero, viajaría. (tuvieron → tuviera)', explanation: 'Hypothetical condition with imperfect subjunctive' },
    ],
    commonMistakes: ['❌ "Si tendría dinero" → ✅ "Si tuviera dinero" (never conditional after si)'],
    questions: [
      { id: 'es_g9q1', question: 'Si yo ___ (ser) tú, aceptaría la oferta.', options: ['soy', 'fuera', 'sería', 'fui'], correctAnswer: 'fuera', explanation: 'Hypothetical si-clause → imperfect subjunctive: ser → fuera.' },
      { id: 'es_g9q2', question: 'Ojalá ___ (poder) quedarme más tiempo.', options: ['puedo', 'pudiera', 'podría', 'pude'], correctAnswer: 'pudiera', explanation: 'Ojalá + wish about unlikely present → imperfect subjunctive.' },
    ],
    tags: ['subjunctive', 'advanced']
  },
  {
    id: 'es_g10', title: 'Voz pasiva', level: 'B2',
    description: 'Passive voice to focus on the action or result',
    theory: 'The passive voice in Spanish is formed with "ser" + past participle, and the participle agrees in gender and number with the subject. It is less common than in English; Spanish often prefers the pasiva refleja (se + verb) for impersonal constructions.',
    formula: 'ser + participio (+ por + agente)',
    examples: [
      { sentence: 'El libro fue escrito por Cervantes.', explanation: 'Passive: ser (fue) + participle (escrito) + agent (por Cervantes)' },
    ],
    commonMistakes: ['❌ "La casa fue construido" → ✅ "La casa fue construida" (participle agrees in gender)'],
    questions: [
      { id: 'es_g10q1', question: 'Las cartas ___ (enviar) ayer por correo.', options: ['enviaron', 'fueron enviadas', 'se enviaron', 'han enviado'], correctAnswer: 'fueron enviadas', explanation: 'Passive: ser (fueron) + participle agreeing with feminine plural subject (enviadas).' },
      { id: 'es_g10q2', question: 'El cuadro ___ (pintar) por Picasso.', options: ['pintó', 'fue pintado', 'se pintó', 'ha pintado'], correctAnswer: 'fue pintado', explanation: 'Passive with named agent (por Picasso) → ser + participio.' },
    ],
    tags: ['passive', 'academic']
  },
];
