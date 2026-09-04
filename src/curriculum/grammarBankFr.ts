import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankFr: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'fr_g1', title: 'Articles (le/la/un/une)', level: 'A1',
    description: 'Definite and indefinite articles in French',
    theory: 'French nouns have gender. Use "le" (masc.) / "la" (fem.) for definite, "un" (masc.) / "une" (fem.) for indefinite. Before a vowel, le/la become "l\'".',
    formula: 'le + masc, la + fem, les + plural',
    examples: [
      { sentence: 'Le chat dort. / La maison est grande.', explanation: '"le" for masculine "chat", "la" for feminine "maison"' },
    ],
    commonMistakes: ['Le maison (maison is feminine) -> La maison'],
    questions: [
      { id: 'fr_g1q1', question: '___ livre est sur la table.', options: ['Le', 'La', 'Les', 'Un'], correctAnswer: 'Le', explanation: '"Livre" is masculine singular, so use "le".' },
      { id: 'fr_g1q2', question: 'Elle a ___ amie formidable.', options: ['un', 'une', 'le', 'la'], correctAnswer: 'une', explanation: '"Amie" is feminine, so the indefinite article is "une".' },
    ],
    tags: ['articles', 'basics']
  },
  {
    id: 'fr_g2', title: 'Present -er verbs', level: 'A1',
    description: 'Conjugating regular -er verbs in the present tense',
    theory: 'Regular -er verbs (parler, manger, aimer) drop the -er and add endings: -e, -es, -e, -ons, -ez, -ent.',
    formula: 'je -e, tu -es, il -e, nous -ons, vous -ez, ils -ent',
    examples: [
      { sentence: 'Je parle francais. / Nous parlons ensemble.', explanation: 'Drop "-er" from "parler", add the ending for each subject' },
    ],
    commonMistakes: ['Je parles (with "je" use -e, not -es) -> Je parle'],
    questions: [
      { id: 'fr_g2q1', question: 'Nous ___ (aimer) le chocolat.', options: ['aime', 'aimes', 'aimons', 'aiment'], correctAnswer: 'aimons', explanation: 'With "nous", add -ons to the stem: aim + ons.' },
      { id: 'fr_g2q2', question: 'Ils ___ (chanter) bien.', options: ['chante', 'chantes', 'chantons', 'chantent'], correctAnswer: 'chantent', explanation: 'With "ils", add -ent to the stem: chant + ent.' },
    ],
    tags: ['verbs', 'conjugation', 'basics']
  },
  {
    id: 'fr_g3', title: 'Passe compose (avoir)', level: 'A1',
    description: 'Forming the past tense with auxiliary "avoir"',
    theory: 'The passe compose uses a conjugated auxiliary + past participle. Most verbs use "avoir". Regular past participles: -er -> -e, -ir -> -i, -re -> -u.',
    formula: 'Sujet + avoir + participe passe',
    examples: [
      { sentence: "J'ai mange une pomme.", explanation: '"ai" is "avoir" conjugated for "je"; "mange" is the past participle of "manger"' },
    ],
    commonMistakes: ['J\'ai manger (infinitive instead of participle) -> J\'ai mange'],
    questions: [
      { id: 'fr_g3q1', question: 'Elle ___ (finir) ses devoirs.', options: ['a fini', 'est fini', 'a finir', 'avoir fini'], correctAnswer: 'a fini', explanation: '"Finir" uses "avoir"; past participle: fini.' },
      { id: 'fr_g3q2', question: 'Nous ___ (regarder) un film.', options: ['avons regarde', 'sommes regarde', 'avons regarder', 'avoir regarde'], correctAnswer: 'avons regarde', explanation: '"Regarder" uses "avoir" with "nous" -> avons + regarde.' },
    ],
    tags: ['verbs', 'past-tense']
  },
  {
    id: 'fr_g4', title: 'Negation', level: 'A1',
    description: 'Forming negative sentences with ne...pas',
    theory: 'To make a sentence negative, wrap the conjugated verb with "ne" (before) and "pas" (after). "Ne" becomes "n\'" before a vowel.',
    formula: 'ne + verbe + pas',
    examples: [
      { sentence: 'Je ne parle pas anglais.', explanation: '"ne" before "parle", "pas" after it' },
    ],
    commonMistakes: ['Je pas parle (wrong order) -> Je ne parle pas'],
    questions: [
      { id: 'fr_g4q1', question: 'Il ___ aime ___ le cafe.', options: ['ne...pas', 'ne...plus', 'pas...ne', 'ni...ni'], correctAnswer: 'ne...pas', explanation: 'Standard negation wraps the verb: ne + verb + pas.' },
      { id: 'fr_g4q2', question: 'Choose the correct negation: "Elle ___ mange ___."', options: ['ne...pas', 'ne...rien', 'pas...ne', 'ne...jamais'], correctAnswer: 'ne...pas', explanation: 'Basic negation uses ne...pas around the verb.' },
    ],
    tags: ['negation', 'basics']
  },
  // ═══ A2 ═══
  {
    id: 'fr_g5', title: 'Imparfait', level: 'A2',
    description: 'The imperfect tense for descriptions and habitual past actions',
    theory: 'The imparfait describes ongoing or repeated past actions and past descriptions. Take the "nous" present-tense stem and add imparfait endings.',
    formula: 'Radical (nous form) + -ais/-ais/-ait/-ions/-iez/-aient',
    examples: [
      { sentence: 'Quand j\'etais petit, je jouais dehors.', explanation: '"etais" and "jouais" describe habitual past actions' },
    ],
    commonMistakes: ['Je parlait (wrong ending for je) -> Je parlais'],
    questions: [
      { id: 'fr_g5q1', question: 'Quand j\'___ (etre) enfant, j\'aimais le chocolat.', options: ['etais', 'etait', 'suis', 'ai ete'], correctAnswer: 'etais', explanation: 'With "je", the imparfait ending is -ais: et + ais.' },
      { id: 'fr_g5q2', question: 'Nous ___ (habiter) a Paris en 2010.', options: ['habitions', 'habitons', 'avons habite', 'habite'], correctAnswer: 'habitions', explanation: 'Imparfait with "nous" uses -ions: habit + ions.' },
    ],
    tags: ['verbs', 'past-tense']
  },
  {
    id: 'fr_g6', title: 'Pronoms COD (le/la/les)', level: 'A2',
    description: 'Direct object pronouns and their placement',
    theory: 'Direct object pronouns (le, la, les) replace a noun already mentioned. They go before the conjugated verb. "Le" replaces masculine, "la" feminine, "les" plural nouns.',
    examples: [
      { sentence: 'Tu vois le film? -> Tu le vois?', explanation: '"le" replaces "le film" and goes before the verb' },
    ],
    commonMistakes: ['Je vois le (pronoun after verb) -> Je le vois'],
    questions: [
      { id: 'fr_g6q1', question: 'Tu aimes cette chanson? Oui, je ___ aime.', options: ['la', 'le', 'les', 'lui'], correctAnswer: 'la', explanation: '"Chanson" is feminine -> use "la" before the verb.' },
      { id: 'fr_g6q2', question: 'Il mange les pommes? Oui, il ___ mange.', options: ['les', 'le', 'la', 'leur'], correctAnswer: 'les', explanation: '"Pommes" is plural -> use "les" before the verb.' },
    ],
    tags: ['pronouns', 'object-pronouns']
  },
  // ═══ B1 ═══
  {
    id: 'fr_g7', title: 'Subjonctif present', level: 'B1',
    description: 'The subjunctive mood after expressions of desire, doubt, and emotion',
    theory: 'The subjonctif is used after "que" with verbs of wish (vouloir), emotion (etre content), doubt (douter), and necessity (il faut). Form it from the "ils" present stem + -e, -es, -e, -ions, -iez, -ent.',
    formula: 'que + sujet + subjonctif',
    examples: [
      { sentence: 'Il faut que tu fasses tes devoirs.', explanation: '"fasses" is the subjunctive of "faire" after "il faut que"' },
    ],
    commonMistakes: ['Il faut que tu fais (indicative instead of subjunctive) -> Il faut que tu fasses'],
    questions: [
      { id: 'fr_g7q1', question: 'Je veux que tu ___ (venir) demain.', options: ['viennes', 'viens', 'venir', 'venais'], correctAnswer: 'viennes', explanation: 'After "vouloir que", use the subjunctive: viennes.' },
      { id: 'fr_g7q2', question: 'Il faut que nous ___ (aller) au marche.', options: ['allions', 'allons', 'irons', 'aller'], correctAnswer: 'allions', explanation: 'After "il faut que", use the subjunctive: allions.' },
    ],
    tags: ['verbs', 'subjunctive']
  },
  {
    id: 'fr_g8', title: 'Conditionnel present', level: 'B1',
    description: 'Expressing hypothetical situations and polite requests',
    theory: 'The conditionnel uses the future stem (usually the infinitive) + imparfait endings. It expresses hypothetical results, polite requests, and wishes.',
    formula: 'infinitif + -ais/-ais/-ait/-ions/-iez/-aient',
    examples: [
      { sentence: 'Je voudrais un cafe, s\'il vous plait.', explanation: '"voudrais" is the conditionnel of "vouloir" for a polite request' },
    ],
    commonMistakes: ['Si j\'aurais (conditionnel in si-clause) -> Si j\'avais... je ferais'],
    questions: [
      { id: 'fr_g8q1', question: 'Si j\'avais de l\'argent, je ___ (voyager) partout.', options: ['voyagerais', 'voyage', 'voyagerai', 'voyageais'], correctAnswer: 'voyagerais', explanation: 'Hypothetical result uses conditionnel: voyager + ais.' },
      { id: 'fr_g8q2', question: 'Nous ___ (aimer) vous aider.', options: ['aimerions', 'aimons', 'aimerons', 'aimions'], correctAnswer: 'aimerions', explanation: 'Polite offer uses conditionnel: aimer + ions.' },
    ],
    tags: ['verbs', 'conditionnel']
  },
  // ═══ B2 ═══
  {
    id: 'fr_g9', title: 'Voix passive', level: 'B2',
    description: 'Forming passive voice sentences in French',
    theory: 'The passive voice shifts focus to the receiver of the action. Use "etre" (conjugated in the appropriate tense) + past participle (agrees in gender/number) + "par" for the agent.',
    formula: 'etre + participe passe + par',
    examples: [
      { sentence: 'Le gateau est mange par les enfants.', explanation: '"est mange" = passive of "manger"; "par les enfants" = agent' },
    ],
    commonMistakes: ['La lettre est ecrit par Marie (no agreement) -> La lettre est ecrite par Marie'],
    questions: [
      { id: 'fr_g9q1', question: 'La chanson ___ (chanter) par tout le monde.', options: ['est chantee', 'a chante', 'chante', 'est chanter'], correctAnswer: 'est chantee', explanation: '"Chanson" is feminine -> etre + chantee (fem. agreement).' },
      { id: 'fr_g9q2', question: 'Les livres ___ (lire) par les etudiants.', options: ['sont lus', 'ont lu', 'est lu', 'sont lire'], correctAnswer: 'sont lus', explanation: 'Plural subject -> sont + lus (masc. plural agreement).' },
    ],
    tags: ['passive-voice', 'advanced']
  },
  {
    id: 'fr_g10', title: 'Gerondif', level: 'B2',
    description: 'Expressing simultaneous actions with "en + present participle"',
    theory: 'The gerondif expresses an action happening at the same time as the main verb, or how/why something is done. Form the present participle from the "nous" stem + -ant, then add "en" before it.',
    formula: 'en + participe present',
    examples: [
      { sentence: 'Il ecoute de la musique en travaillant.', explanation: '"en travaillant" = while working (simultaneous action)' },
    ],
    commonMistakes: ['En travaillent (wrong spelling) -> en travaillant'],
    questions: [
      { id: 'fr_g10q1', question: 'Elle a appris le francais ___ (regarder) des films.', options: ['en regardant', 'regardant', 'en regarde', 'a regarder'], correctAnswer: 'en regardant', explanation: 'Gerondif = en + present participle: en regardant.' },
      { id: 'fr_g10q2', question: 'Il s\'est blesse ___ (courir).', options: ['en courant', 'courant', 'en courir', 'a courant'], correctAnswer: 'en courant', explanation: 'Gerondif of "courir" = en courant (while running).' },
    ],
    tags: ['gerondif', 'advanced']
  },
];
