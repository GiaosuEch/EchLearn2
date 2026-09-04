import type { GrammarTopic } from './grammarBank.ts';

export const grammarBankAr: GrammarTopic[] = [
  {
    id: 'ar_g1', title: 'الضمائر المنفصلة (Independent pronouns)', level: 'A1',
    description: 'Subject pronouns in Arabic',
    theory: 'Arabic has 12 independent pronouns covering singular, dual, and plural for all genders. Key ones: أنا (I), أنتَ (you m.), أنتِ (you f.), هو (he), هي (she), نحن (we), هم (they m.), هنّ (they f.).',
    examples: [{ sentence: 'أنا طالبٌ. / هي معلمةٌ.', explanation: '"أنا" = I, "هي" = she; pronouns stand independently' }],
    commonMistakes: ['Using هو for a female -> Use هي for females'],
    questions: [
      { id: 'ar_g1q1', question: '"We are students" -> ___ طلابٌ', options: ['نحن', 'هم', 'أنتم', 'أنا'], correctAnswer: 'نحن', explanation: '"نحن" = we.' },
      { id: 'ar_g1q2', question: '"She is a doctor" -> ___ طبيبةٌ', options: ['هي', 'هو', 'أنتِ', 'هنّ'], correctAnswer: 'هي', explanation: '"هي" = she; "طبيبة" is feminine form.' },
    ],
    tags: ['pronouns', 'basics']
  },
  {
    id: 'ar_g2', title: 'الجملة الاسمية (Nominal sentences)', level: 'A1',
    description: 'Sentences that begin with a noun (subject + predicate without a verb)',
    theory: 'Arabic nominal sentences have a مبتدأ (subject) and خبر (predicate) with no verb "to be" in the present. The subject is definite, the predicate is usually indefinite.',
    formula: 'مبتدأ (definite) + خبر (indefinite)',
    examples: [{ sentence: 'البيتُ كبيرٌ (The house is big)', explanation: 'No verb needed; "البيت" = subject, "كبير" = predicate' }],
    commonMistakes: ['الكتابُ الجميلُ (both definite = noun phrase, not sentence) -> الكتابُ جميلٌ'],
    questions: [
      { id: 'ar_g2q1', question: '"The weather is beautiful" -> الطقسُ ___', options: ['جميلٌ', 'الجميلُ', 'جميلاً', 'بجميلٍ'], correctAnswer: 'جميلٌ', explanation: 'Predicate is indefinite (no ال) with nominative case: جميلٌ.' },
      { id: 'ar_g2q2', question: 'Which is a complete nominal sentence?', options: ['المدرسةُ كبيرةٌ', 'المدرسةُ الكبيرةُ', 'في المدرسةِ', 'كتبَ الطالبُ'], correctAnswer: 'المدرسةُ كبيرةٌ', explanation: 'Definite subject + indefinite predicate = nominal sentence.' },
    ],
    tags: ['syntax', 'basics']
  },
  {
    id: 'ar_g3', title: 'الفعل الماضي (Past tense verbs)', level: 'A2',
    description: 'Conjugating past tense verbs by person, number, and gender',
    theory: 'Past tense verbs conjugate with suffixes. Base form is 3rd person masculine singular (فَعَلَ). Add suffixes: -تُ (I), -تَ (you m.), -تِ (you f.), -نا (we), -وا (they m.), -ا (dual), etc.',
    formula: 'Root + past tense suffix',
    examples: [{ sentence: 'كتبتُ رسالةً. / ذهبوا إلى المدرسةِ.', explanation: '"كتبتُ" = I wrote (-تُ); "ذهبوا" = they went (-وا)' }],
    commonMistakes: ['كتبوا الطلاب (verb before subject should use singular) -> كتبَ الطلابُ or الطلابُ كتبوا'],
    questions: [
      { id: 'ar_g3q1', question: '"She wrote a letter" -> ___ رسالةً', options: ['كتبَتْ', 'كتبَ', 'كتبتُ', 'كتبوا'], correctAnswer: 'كتبَتْ', explanation: 'Third person feminine singular past tense adds -َتْ.' },
      { id: 'ar_g3q2', question: '"We went to the market" -> ___ إلى السوقِ', options: ['ذهبنا', 'ذهبَ', 'ذهبوا', 'ذهبتُ'], correctAnswer: 'ذهبنا', explanation: '"نا" suffix marks first person plural: ذهبنا.' },
    ],
    tags: ['verbs', 'past-tense']
  },
  {
    id: 'ar_g4', title: 'الفعل المضارع (Present tense verbs)', level: 'A2',
    description: 'Present/future tense verb conjugation with prefixes and suffixes',
    theory: 'Present tense uses prefixes: أ- (I), تَ- (you m./she), يَ- (he/they), نَ- (we). Some forms add suffixes too: -ينَ (you f.), -ونَ (they m./you pl. m.).',
    formula: 'Prefix + root + (suffix)',
    examples: [{ sentence: 'أدرسُ العربيةَ. / يكتبونَ الدرسَ.', explanation: '"أدرسُ" = I study (أ- prefix); "يكتبون" = they write (ي- prefix + -ون)' }],
    commonMistakes: ['يدرسُ الطالبةُ (masculine prefix for female) -> تدرسُ الطالبةُ'],
    questions: [
      { id: 'ar_g4q1', question: '"He reads the book" -> ___ الكتابَ', options: ['يقرأُ', 'أقرأُ', 'تقرأُ', 'نقرأُ'], correctAnswer: 'يقرأُ', explanation: 'Third person masculine singular uses يَ- prefix: يقرأ.' },
      { id: 'ar_g4q2', question: '"We write" -> ___', options: ['نكتبُ', 'يكتبُ', 'أكتبُ', 'تكتبُ'], correctAnswer: 'نكتبُ', explanation: 'First person plural uses نَ- prefix: نكتب.' },
    ],
    tags: ['verbs', 'present-tense']
  },
  {
    id: 'ar_g5', title: 'الإضافة (Construct state / Idafa)', level: 'B1',
    description: 'Linking two nouns to show possession or relation',
    theory: 'Idafa joins two nouns: the first (مُضاف) loses its tanwin and definite article, the second (مُضاف إليه) takes genitive case. Meaning: "X of Y" or "Y\'s X".',
    formula: 'noun1 (no ال, no tanwin) + noun2 (genitive)',
    examples: [{ sentence: 'كتابُ الطالبِ (the student\'s book)', explanation: '"كتاب" has no ال or tanwin; "الطالب" is in genitive (الطالبِ)' }],
    commonMistakes: ['الكتابُ الطالبِ (first noun should not have ال in idafa) -> كتابُ الطالبِ'],
    questions: [
      { id: 'ar_g5q1', question: '"The teacher\'s office" is:', options: ['مكتبُ المعلمِ', 'المكتبُ المعلمِ', 'مكتبٌ المعلمِ', 'مكتبُ معلمٌ'], correctAnswer: 'مكتبُ المعلمِ', explanation: 'First noun drops ال and tanwin; second noun in genitive.' },
      { id: 'ar_g5q2', question: '"Door of the house" is:', options: ['بابُ البيتِ', 'البابُ البيتِ', 'بابٌ بيتٌ', 'بابُ بيتُ'], correctAnswer: 'بابُ البيتِ', explanation: 'Idafa: باب (no ال) + البيت in genitive case.' },
    ],
    tags: ['syntax', 'possession']
  },
  {
    id: 'ar_g6', title: 'المبني للمجهول (Passive voice)', level: 'B1',
    description: 'Transforming active verbs to passive by changing vowel patterns',
    theory: 'Arabic passive changes internal vowels. Past passive: فُعِلَ (from فَعَلَ). Present passive: يُفعَلُ (from يَفعَلُ). The agent is usually omitted.',
    formula: 'Past: فُعِلَ | Present: يُفعَلُ',
    examples: [{ sentence: 'كُتِبَ الدرسُ (The lesson was written)', explanation: 'كَتَبَ (active) becomes كُتِبَ (passive) by vowel change' }],
    commonMistakes: ['فَعِلَ (wrong vowel pattern) -> فُعِلَ for passive'],
    questions: [
      { id: 'ar_g6q1', question: 'Passive of فَتَحَ (he opened) is:', options: ['فُتِحَ', 'فَتِحَ', 'فُتَحَ', 'يَفتَحُ'], correctAnswer: 'فُتِحَ', explanation: 'Past passive pattern: فُعِلَ -> فُتِحَ.' },
      { id: 'ar_g6q2', question: 'Passive of يَكتُبُ (he writes) is:', options: ['يُكتَبُ', 'يَكتِبُ', 'كُتِبَ', 'يُكتِبُ'], correctAnswer: 'يُكتَبُ', explanation: 'Present passive pattern: يُفعَلُ -> يُكتَبُ.' },
    ],
    tags: ['passive', 'intermediate']
  },
  {
    id: 'ar_g7', title: 'الحروف الشمسية والقمرية (Sun/Moon letters)', level: 'B2',
    description: 'Assimilation rules for the definite article ال',
    theory: 'Sun letters (ت, ث, د, ذ, ر, ز, س, ش, ص, ض, ط, ظ, ن, ل) cause the ل in ال to assimilate (الشّمس = ash-shams). Moon letters (ب, ج, ح, خ, ع, غ, ف, ق, ك, م, ه, و, ي) keep the ل pronounced (القمر = al-qamar).',
    examples: [{ sentence: 'الشَّمسُ (ash-shams) vs القَمَرُ (al-qamar)', explanation: 'ش is a sun letter (assimilation); ق is a moon letter (no assimilation)' }],
    commonMistakes: ['Pronouncing الشمس as "al-shams" -> "ash-shams" (assimilation required)'],
    questions: [
      { id: 'ar_g7q1', question: 'How is النور pronounced?', options: ['an-nur', 'al-nur', 'a-nur', 'an-noor'], correctAnswer: 'an-nur', explanation: 'ن is a sun letter -> ال assimilates: an-nur.' },
      { id: 'ar_g7q2', question: 'Which word keeps "al-" without assimilation?', options: ['الكتاب', 'الدرس', 'الشمس', 'النهر'], correctAnswer: 'الكتاب', explanation: 'ك is a moon letter -> "al-kitab" with no assimilation.' },
    ],
    tags: ['phonology', 'advanced']
  },
  {
    id: 'ar_g8', title: 'أسلوب الشرط (Conditional sentences)', level: 'B2',
    description: 'Forming conditional sentences with إن, لو, إذا',
    theory: '"إنْ" for real/possible conditions (jussive mood). "لو" for unreal/hypothetical past conditions. "إذا" for expected/likely future conditions. Structure: particle + condition + result.',
    formula: 'إنْ / لو / إذا + فعل الشرط + جواب الشرط',
    examples: [{ sentence: 'إنْ تدرسْ تنجحْ (If you study, you succeed)', explanation: '"إنْ" + jussive mood for both condition and result' }],
    commonMistakes: ['لو درسَ نجحَ (using لو for real conditions) -> إنْ يدرسْ ينجحْ'],
    questions: [
      { id: 'ar_g8q1', question: '"If he had studied, he would have succeeded" uses:', options: ['لو', 'إنْ', 'إذا', 'لكنْ'], correctAnswer: 'لو', explanation: '"لو" is for unreal/hypothetical past conditions.' },
      { id: 'ar_g8q2', question: 'إنْ ___ تنجحْ (If you study, you succeed)', options: ['تدرسْ', 'درستَ', 'تدرسُ', 'ادرسْ'], correctAnswer: 'تدرسْ', explanation: 'After إنْ, the verb takes jussive mood (مجزوم): تدرسْ.' },
    ],
    tags: ['conditionals', 'advanced']
  },
];
