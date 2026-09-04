import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankRu: GrammarTopic[] = [
  // ═══ A1 ═══
  {
    id: 'ru_g1', title: 'Род существительных (Gender)', level: 'A1',
    description: 'Grammatical gender of Russian nouns: masculine, feminine, neuter',
    theory: 'Russian nouns have three genders. Masculine nouns usually end in a consonant or -й. Feminine nouns usually end in -а/-я or -ь. Neuter nouns usually end in -о/-е. Gender determines adjective and verb agreement.',
    formula: 'Consonant/-й -> м.р. / -а/-я -> ж.р. / -о/-е -> ср.р.',
    examples: [
      { sentence: 'стол (м.р.) / книга (ж.р.) / окно (ср.р.)', explanation: '"стол" ends in consonant (masc.), "книга" in -а (fem.), "окно" in -о (neuter)' },
    ],
    commonMistakes: ['красивая стол (feminine adj. with masc. noun) -> красивый стол'],
    questions: [
      { id: 'ru_g1q1', question: 'Какой род у слова "музей"? (What gender is "museum"?)', options: ['мужской', 'женский', 'средний', 'множественный'], correctAnswer: 'мужской', explanation: '"Музей" ends in -й, which is masculine.' },
      { id: 'ru_g1q2', question: 'Какой род у слова "тетрадь"? (What gender is "notebook"?)', options: ['женский', 'мужской', 'средний', 'множественный'], correctAnswer: 'женский', explanation: '"Тетрадь" ends in -ь and is feminine (must be memorized for -ь words).' },
    ],
    tags: ['gender', 'nouns', 'basics']
  },
  {
    id: 'ru_g2', title: 'Спряжение глаголов (Verb conjugation)', level: 'A1',
    description: 'First and second conjugation of Russian verbs in the present tense',
    theory: 'Russian verbs belong to two conjugation groups. 1st conjugation (-ать/-ять/-еть): -у/-ешь/-ет/-ем/-ете/-ут. 2nd conjugation (-ить): -у/-ишь/-ит/-им/-ите/-ят. Some verbs are irregular.',
    formula: '1st: -у/-ешь/-ет/-ем/-ете/-ут; 2nd: -у/-ишь/-ит/-им/-ите/-ят',
    examples: [
      { sentence: 'Я читаю книгу. / Он говорит по-русски.', explanation: '"Читать" (1st conj.) -> читаю; "говорить" (2nd conj.) -> говорит' },
    ],
    commonMistakes: ['Он читает -> correct; Он говорет (wrong ending) -> Он говорит'],
    questions: [
      { id: 'ru_g2q1', question: 'Мы ___ (знать) русский язык.', options: ['знаем', 'знаим', 'знают', 'знаете'], correctAnswer: 'знаем', explanation: '"Знать" is 1st conjugation; with "мы" -> знаем.' },
      { id: 'ru_g2q2', question: 'Они ___ (любить) музыку.', options: ['любят', 'любют', 'любим', 'любите'], correctAnswer: 'любят', explanation: '"Любить" is 2nd conjugation; with "они" -> любят.' },
    ],
    tags: ['verbs', 'conjugation', 'basics']
  },
  {
    id: 'ru_g3', title: 'Именительный и Винительный падежи (Nom./Acc.)', level: 'A1',
    description: 'Nominative case for subjects and Accusative case for direct objects',
    theory: 'The nominative case marks the subject. The accusative marks the direct object. For masculine animate nouns and all feminine -а/-я nouns, the accusative form changes. Feminine -а -> -у, -я -> -ю. Masculine animate = genitive form.',
    formula: 'Nom: subject / Acc: -а -> -у, -я -> -ю (fem.); animate masc. = Gen.',
    examples: [
      { sentence: 'Я вижу маму. (I see Mom.)', explanation: '"Мама" (nom.) changes to "маму" (acc.) as the direct object' },
    ],
    commonMistakes: ['Я вижу мама (nominative as object) -> Я вижу маму'],
    questions: [
      { id: 'ru_g3q1', question: 'Я люблю ___. (I love my sister.)', options: ['сестру', 'сестра', 'сестре', 'сестрой'], correctAnswer: 'сестру', explanation: '"Сестра" in accusative becomes "сестру" (-а -> -у).' },
      { id: 'ru_g3q2', question: 'Он читает ___. (He reads a book.)', options: ['книгу', 'книга', 'книге', 'книгой'], correctAnswer: 'книгу', explanation: '"Книга" in accusative becomes "книгу" (-а -> -у).' },
    ],
    tags: ['cases', 'nouns', 'basics']
  },
  // ═══ A2 ═══
  {
    id: 'ru_g4', title: 'Дательный и Предложный падежи (Dat./Prep.)', level: 'A2',
    description: 'Dative case for indirect objects and Prepositional case for location',
    theory: 'Dative marks the indirect object (to/for whom): fem. -а -> -е, masc. consonant + -у. Prepositional is used after в/на (location) and о (about): fem. -а -> -е, masc. consonant + -е, neuter -о -> -е.',
    formula: 'Dat: -е (fem.) / -у (masc.); Prep: -е (most nouns)',
    examples: [
      { sentence: 'Я дал книгу другу. Я живу в Москве.', explanation: '"Другу" = dative of "друг" (to a friend); "Москве" = prepositional of "Москва" (in Moscow)' },
    ],
    commonMistakes: ['Я живу в Москва (no case change) -> Я живу в Москве'],
    questions: [
      { id: 'ru_g4q1', question: 'Я позвонил ___. (I called my mother.)', options: ['маме', 'маму', 'мама', 'мамой'], correctAnswer: 'маме', explanation: '"Мама" in dative becomes "маме" (-а -> -е).' },
      { id: 'ru_g4q2', question: 'Мы живём в ___. (We live in Russia.)', options: ['России', 'Россия', 'Россию', 'Россией'], correctAnswer: 'России', explanation: '"Россия" in prepositional becomes "России" (-ия -> -ии).' },
    ],
    tags: ['cases', 'nouns']
  },
  {
    id: 'ru_g5', title: 'Совершенный/несовершенный вид (Aspect)', level: 'A2',
    description: 'Perfective and imperfective verb aspect in Russian',
    theory: 'Russian verbs come in aspect pairs. Imperfective (НСВ) describes ongoing, habitual, or repeated actions. Perfective (СВ) describes completed, one-time actions with a result. Perfective is often formed with a prefix.',
    formula: 'НСВ: process/habit; СВ: completed result (e.g. читать/прочитать)',
    examples: [
      { sentence: 'Я читал книгу (НСВ, was reading). / Я прочитал книгу (СВ, finished reading).', explanation: '"Читал" = process; "прочитал" = completed with result' },
    ],
    commonMistakes: ['Вчера я писал письмо (implies unfinished) vs Вчера я написал письмо (finished it)'],
    questions: [
      { id: 'ru_g5q1', question: 'Я наконец ___ эту книгу! (I finally finished this book!)', options: ['прочитал', 'читал', 'читаю', 'буду читать'], correctAnswer: 'прочитал', explanation: '"Наконец" (finally) implies completion -> perfective "прочитал".' },
      { id: 'ru_g5q2', question: 'Каждый день я ___ газету. (Every day I read a newspaper.)', options: ['читаю', 'прочитаю', 'прочитал', 'читал'], correctAnswer: 'читаю', explanation: 'Habitual action (every day) uses imperfective present: читаю.' },
    ],
    tags: ['verbs', 'aspect']
  },
  // ═══ B1 ═══
  {
    id: 'ru_g6', title: 'Родительный падеж (Genitive case)', level: 'B1',
    description: 'The genitive case for possession, absence, and quantities',
    theory: 'The genitive expresses possession (книга друга), absence (нет воды), quantities (много людей), and is used after many prepositions (из, от, без, для, у). Masc: +а/-я, Fem: -а -> -ы, -я -> -и, Neuter: -о -> -а.',
    formula: 'Masc: +а; Fem: -ы/-и; Neuter: -а; after нет/много/из/без/у',
    examples: [
      { sentence: 'У меня нет машины. (I don\'t have a car.)', explanation: '"Нет" requires genitive: "машина" -> "машины"' },
    ],
    commonMistakes: ['У меня нет машина (nominative after нет) -> У меня нет машины'],
    questions: [
      { id: 'ru_g6q1', question: 'Это книга ___. (This is my brother\'s book.)', options: ['брата', 'брат', 'брату', 'братом'], correctAnswer: 'брата', explanation: 'Possession uses genitive: "брат" -> "брата".' },
      { id: 'ru_g6q2', question: 'В классе много ___. (There are many students in class.)', options: ['студентов', 'студенты', 'студентам', 'студентами'], correctAnswer: 'студентов', explanation: '"Много" requires genitive plural: "студенты" -> "студентов".' },
    ],
    tags: ['cases', 'nouns']
  },
  {
    id: 'ru_g7', title: 'Творительный падеж (Instrumental case)', level: 'B1',
    description: 'The instrumental case for means, accompaniment, and professions',
    theory: 'The instrumental case expresses the instrument/means (писать ручкой), accompaniment with "с" (с другом), and profession after "быть/стать" (Он стал врачом). Masc: +ом, Fem: -а -> -ой, Neuter: -ом.',
    formula: 'Masc: +ом; Fem: -ой/-ей; Neuter: +м; with с/быть/стать',
    examples: [
      { sentence: 'Я пишу ручкой. / Я иду с другом.', explanation: '"Ручкой" = instrumental of "ручка" (with a pen); "другом" = instrumental of "друг" (with a friend)' },
    ],
    commonMistakes: ['Он стал врач (nominative with стать) -> Он стал врачом'],
    questions: [
      { id: 'ru_g7q1', question: 'Она хочет стать ___. (She wants to become a doctor.)', options: ['врачом', 'врач', 'врача', 'врачу'], correctAnswer: 'врачом', explanation: '"Стать" requires instrumental: "врач" -> "врачом".' },
      { id: 'ru_g7q2', question: 'Я еду в школу с ___. (I go to school with my sister.)', options: ['сестрой', 'сестра', 'сестру', 'сестре'], correctAnswer: 'сестрой', explanation: '"С" + instrumental: "сестра" -> "сестрой".' },
    ],
    tags: ['cases', 'nouns']
  },
  {
    id: 'ru_g8', title: 'Глаголы движения (Verbs of motion)', level: 'B1',
    description: 'Unidirectional vs multidirectional verbs of motion',
    theory: 'Russian has pairs of motion verbs: unidirectional (one direction, right now) and multidirectional (habitual, round trips). идти/ходить (on foot), ехать/ездить (by transport). Prefixed forms add meaning: выходить, уходить, приходить.',
    formula: 'Unidirectional: идти/ехать (now); Multidirectional: ходить/ездить (habit)',
    examples: [
      { sentence: 'Я иду в школу. / Я хожу в школу каждый день.', explanation: '"Иду" = going right now; "хожу" = go regularly' },
    ],
    commonMistakes: ['Я иду в школу каждый день (unidirectional for habit) -> Я хожу в школу каждый день'],
    questions: [
      { id: 'ru_g8q1', question: 'Каждое лето мы ___ на море. (Every summer we go to the sea.)', options: ['ездим', 'едем', 'ехали', 'поехали'], correctAnswer: 'ездим', explanation: 'Habitual travel uses multidirectional "ездить": ездим.' },
      { id: 'ru_g8q2', question: 'Смотри, он ___ сюда! (Look, he is coming here!)', options: ['идёт', 'ходит', 'ходил', 'пошёл'], correctAnswer: 'идёт', explanation: 'Motion happening right now in one direction uses "идти": идёт.' },
    ],
    tags: ['verbs', 'motion']
  },
  // ═══ B2 ═══
  {
    id: 'ru_g9', title: 'Причастия (Participles)', level: 'B2',
    description: 'Active and passive participles in Russian',
    theory: 'Russian has four types of participles: present active (-ущий/-ющий, -ащий/-ящий), past active (-вший/-ший), present passive (-емый/-имый), past passive (-нный/-тый). They function as adjectives and agree in gender, number, case.',
    formula: 'Present active: -ущий/-ящий; Past passive: -нный/-тый',
    examples: [
      { sentence: 'Читающий студент сидит в библиотеке.', explanation: '"Читающий" = present active participle of "читать" (the student who is reading)' },
    ],
    commonMistakes: ['книга, написавшая автором (active instead of passive) -> книга, написанная автором'],
    questions: [
      { id: 'ru_g9q1', question: 'Книга, ___ Толстым, очень длинная. (The book written by Tolstoy is very long.)', options: ['написанная', 'написавшая', 'пишущая', 'писавшая'], correctAnswer: 'написанная', explanation: 'Past passive participle agrees with "книга" (fem.): написанная.' },
      { id: 'ru_g9q2', question: 'Девушка, ___ у окна, моя сестра. (The girl sitting by the window is my sister.)', options: ['сидящая', 'сидевшая', 'сидённая', 'сидимая'], correctAnswer: 'сидящая', explanation: 'Present active participle, fem., from "сидеть": сидящая.' },
    ],
    tags: ['participles', 'advanced']
  },
  {
    id: 'ru_g10', title: 'Деепричастия (Verbal adverbs)', level: 'B2',
    description: 'Using gerunds/verbal adverbs to express simultaneous or prior actions',
    theory: 'Imperfective деепричастия (-а/-я) describe actions simultaneous with the main verb. Perfective деепричастия (-в/-вши/-ши) describe actions completed before the main verb. The subject of both clauses must be the same.',
    formula: 'Imperf: stem + а/я (simultaneous); Perf: stem + в (prior action)',
    examples: [
      { sentence: 'Читая книгу, он пил кофе. (While reading a book, he drank coffee.)', explanation: '"Читая" = imperfective verbal adverb, simultaneous with the main verb' },
    ],
    commonMistakes: ['Прочитая книгу (imperf. form for completed) -> Прочитав книгу'],
    questions: [
      { id: 'ru_g10q1', question: '___ домашнее задание, она пошла гулять. (Having done homework, she went for a walk.)', options: ['Сделав', 'Делая', 'Сделавшая', 'Делавшая'], correctAnswer: 'Сделав', explanation: 'Completed prior action uses perfective verbal adverb: сделав.' },
      { id: 'ru_g10q2', question: '___ по улице, я встретил друга. (While walking along the street, I met a friend.)', options: ['Идя', 'Пойдя', 'Идущий', 'Шедший'], correctAnswer: 'Идя', explanation: 'Simultaneous action uses imperfective verbal adverb: идя.' },
    ],
    tags: ['verbal-adverbs', 'advanced']
  },
];
