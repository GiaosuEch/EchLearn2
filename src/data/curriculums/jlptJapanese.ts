import type { DeepCurriculumData } from '../../curriculum/deepCurriculumTypes.ts';

export const jlptJapaneseData: DeepCurriculumData = {
  languageFamily: 'ja',
  levels: [
    {
      id: 'JLPT_N3',
      name: 'JLPT N3 - Intermediate',
      desc: 'Bridging the gap to advanced Japanese. Understanding everyday situations with some degree of complexity.',
      lessons: [
        { 
          title: 'Grammar Nuances: ために vs ように', 
          type: 'grammar', 
          officialRubricMapping: 'JLPT N3 Grammar', 
          targetGrammar: ['ために', 'ように'], 
          estimatedMinutes: 25,
          targetCollocations: ['合格するために', '忘れないように'],
          assessmentPrompt: 'Translate and explain the difference: 1) 家を買うために貯金している。 2) 日本語が話せるように毎日練習している。',
          modelAnswer: '1) "I am saving money in order to buy a house" (ために is for controllable actions with a clear purpose). 2) "I am practicing every day so that I can speak Japanese" (ように is for uncontrollable states or potential forms).',
          commonMistakes: ['Using ために with potential verbs (e.g., 話せるために is WRONG).', 'Using ように when the subjects of both clauses are the same and the verb is volitional.']
        },
        { 
          title: 'Reading: Inference and Author\'s Intent', 
          type: 'reading', 
          officialRubricMapping: 'JLPT N3 Reading Comprehension', 
          targetVocabLimit: 400, 
          estimatedMinutes: 35,
          targetCollocations: ['筆者の主張', '最も言いたいこと', '言い換えれば'],
          assessmentPrompt: 'Read the text about modern work culture. What is the author\'s main criticism of "telework"?',
          modelAnswer: 'The author argues that while telework increases efficiency, it fundamentally erodes the spontaneous communication (雑談) that sparks innovation in a corporate environment.',
          commonMistakes: ['Choosing an answer that is factually true in the real world but not stated in the text.', 'Failing to catch double negatives like ～ないわけではない (it does not mean that...).']
        },
        {
          title: 'Grammar: Expressing Regret & Irreversible Actions',
          type: 'grammar',
          officialRubricMapping: 'JLPT N3 Grammar',
          targetGrammar: ['～てしまう', '～たらよかった', '～ばよかった'],
          estimatedMinutes: 25,
          targetCollocations: ['食べてしまった', '行けばよかった', '言わなければよかった'],
          assessmentPrompt: 'Express regret using appropriate grammar: "I wish I had studied harder for the exam." and "I accidentally ate all the cake."',
          modelAnswer: 'もっと試験のために勉強すればよかった。(Motto shiken no tame ni benkyou sureba yokatta.) / ケーキを全部食べてしまった。(Keeki o zenbu tabete shimatta.)',
          commonMistakes: ['Confusing ～てしまう (accidental/complete) with ～ちゃう (casual contraction) in formal writing.', 'Using ～たらよかった and ～ばよかった interchangeably without understanding the nuance that ～ば emphasizes the condition more.']
        },
        {
          title: 'Vocabulary: Onomatopoeia (擬音語・擬態語)',
          type: 'vocabulary',
          officialRubricMapping: 'JLPT N3 Vocabulary',
          targetVocabLimit: 50,
          estimatedMinutes: 20,
          targetCollocations: ['ドキドキする', 'ぐっすり眠る', 'ペラペラ話す', 'ぼんやりする'],
          assessmentPrompt: 'Match each onomatopoeia to its meaning and use in a sentence: ドキドキ, ぐっすり, ペラペラ, ぼんやり.',
          modelAnswer: 'ドキドキ = heart pounding (excitement/nervousness): 初めてのデートでドキドキした。 ぐっすり = deeply (sleep): 昨日はぐっすり眠れた。 ペラペラ = fluently: 彼女は英語がペラペラだ。 ぼんやり = absent-mindedly: ぼんやりしていたら電車を乗り過ごした。',
          commonMistakes: ['Treating all onomatopoeia as childish when they are essential in adult Japanese.', 'Using the wrong particle (e.g., ドキドキと instead of ドキドキする).']
        },
        {
          title: 'Listening: Information Retrieval (即時応答)',
          type: 'listening',
          officialRubricMapping: 'JLPT N3 Listening',
          estimatedMinutes: 25,
          targetCollocations: ['要するに', 'つまり', 'ということは'],
          assessmentPrompt: 'Listen to a short conversation at a hotel front desk. What does the guest need to do before checking in?',
          modelAnswer: 'The guest needs to fill out a registration form (宿泊カード) and present a valid photo ID. The receptionist uses つまり to summarize the two requirements.',
          commonMistakes: ['Selecting the first option mentioned by the speaker before hearing the complete instruction.', 'Confusing similar-sounding words like 宿泊 (shukuhaku, stay) and 出発 (shuppatsu, departure).']
        }
      ]
    },
    {
      id: 'JLPT_N2',
      name: 'JLPT N2 - Pre-Advanced Business & Academic',
      desc: 'Understanding Japanese used in everyday situations, and in a variety of circumstances to a certain degree.',
      lessons: [
        { 
          title: 'Advanced Grammar: As expected vs Contrary to expectation', 
          type: 'grammar', 
          officialRubricMapping: 'JLPT N2 Grammar', 
          targetGrammar: ['ばかりに', 'どころか', 'にとどまらず'], 
          estimatedMinutes: 30,
          targetCollocations: ['お金がないばかりに', '感謝されるどころか'],
          assessmentPrompt: 'Combine these two ideas using N2 grammar: He didn\'t just fail the exam; he got the lowest score in the school.',
          modelAnswer: '彼は試験に落ちたどころか、学校で最低点を取ってしまった。 (Kare wa shiken ni ochita dokoroka, gakkou de saiteiten o totte shimatta.)',
          commonMistakes: ['Confusing どころか (far from) with ばかりか (not only).', 'Incorrect conjugation before the grammar point.']
        },
        { 
          title: 'Listening: Integrated Spoken Discourse', 
          type: 'listening', 
          officialRubricMapping: 'JLPT N2 Listening - Integrated', 
          targetVocabLimit: 800, 
          estimatedMinutes: 40,
          targetCollocations: ['というのも', '一理ある', '念のため'],
          assessmentPrompt: 'Listen to the meeting excerpt. Why did the manager ultimately reject Plan A, despite its lower cost?',
          modelAnswer: 'The manager rejected Plan A because the long-term maintenance costs would offset the initial savings, and it misaligned with the company\'s new eco-friendly branding initiative.',
          commonMistakes: ['Stopping at the first mention of "cost" and picking the distractor.', 'Missing the conversational pivot words like ところが or とはいえ.']
        },
        {
          title: 'Grammar: Expressing Extent & Limitation',
          type: 'grammar',
          officialRubricMapping: 'JLPT N2 Grammar',
          targetGrammar: ['～に限り', '～をもとに', '～に沿って', '～を踏まえて'],
          estimatedMinutes: 30,
          targetCollocations: ['初回に限り無料', '調査結果をもとに', '方針に沿って'],
          assessmentPrompt: 'Rewrite using appropriate N2 grammar: "Based on the survey results, we will revise the plan in accordance with the new company policy."',
          modelAnswer: '調査結果をもとに、新しい会社の方針に沿って計画を見直します。(Chousa kekka o moto ni, atarashii kaisha no houshin ni sotte keikaku o minaosu.)',
          commonMistakes: ['Using をもとに and に基づいて as perfect synonyms (もとに is looser, 基づいて is stricter/more formal).', 'Confusing に沿って (along/in accordance with) with について (about).']
        },
        {
          title: 'Reading: Editorial & Opinion Pieces (社説読解)',
          type: 'reading',
          officialRubricMapping: 'JLPT N2 Reading Comprehension',
          targetVocabLimit: 1000,
          estimatedMinutes: 40,
          targetCollocations: ['賛否両論', '一概には言えない', '検討の余地がある'],
          assessmentPrompt: 'Read the newspaper editorial about Japan\'s declining birth rate. According to the author, which proposed government measure does the author consider insufficient and why?',
          modelAnswer: 'The author considers the childcare subsidy measure insufficient (検討の余地がある) because it addresses only the financial burden while ignoring the deeper societal issue of excessive working hours (過労) that prevents young couples from considering parenthood.',
          commonMistakes: ['Interpreting 一概には言えない (cannot say unconditionally) as the author having no opinion, when it actually signals a nuanced stance.', 'Confusing the author\'s reported counterarguments with the author\'s own position.']
        },
        {
          title: 'Vocabulary: Formal Written Japanese (書き言葉)',
          type: 'vocabulary',
          officialRubricMapping: 'JLPT N2 Vocabulary',
          targetVocabLimit: 60,
          estimatedMinutes: 25,
          targetCollocations: ['～に関して', '～に伴い', '～を除いて', '～に際して'],
          assessmentPrompt: 'Convert these casual expressions into formal written Japanese (書き言葉): 1) "この件について" → 2) "変わるのと一緒に" → 3) "これを除いて"',
          modelAnswer: '1) 本件に関して (honken ni kanshite) 2) 変化に伴い (henka ni tomonai) 3) これを除いて → 本件を除き (honken o nozoki)',
          commonMistakes: ['Using 話し言葉 (spoken language) in formal business documents.', 'Overusing に対して when に関して is more appropriate for "regarding" context.']
        }
      ]
    },
    {
      id: 'JLPT_N1',
      name: 'JLPT N1 - Advanced Mastery & Keigo',
      desc: 'The ability to understand Japanese used in a variety of circumstances, including highly abstract and logical texts.',
      lessons: [
        { 
          title: 'Business Keigo: Supreme Politeness (Sonkeigo & Kenjougo)', 
          type: 'speaking', 
          officialRubricMapping: 'JLPT N1 Business Keigo', 
          targetGrammar: ['お～いただく', '～ていらっしゃる', '拝見する'], 
          estimatedMinutes: 45,
          targetCollocations: ['ご査収の程よろしくお願いいたします', 'お手数をおかけしますが', '承知いたしました'],
          assessmentPrompt: 'You are writing an email to a highly respected client. Ask them to look at the attached document and reply by tomorrow.',
          modelAnswer: '添付資料をご査収いただき、誠に恐縮ですが、明日までにご返答いただけますと幸いに存じます。 (Tenpu shiryou o gosashuu itadaki, makoto ni kyoushuku desu ga, ashita made ni gohentou itadakemasu to saiwai ni zonjimasu.)',
          commonMistakes: ['Using Sonkeigo (respectful) for your own actions (e.g., 私がご覧になります instead of 拝見します).', 'Double Keigo (二重敬語) - making it overly polite to the point of being grammatically incorrect (e.g., おっしゃられる instead of おっしゃる).']
        },
        { 
          title: 'Reading: Abstract Logical Paradigms', 
          type: 'reading', 
          officialRubricMapping: 'JLPT N1 Reading - Logical', 
          targetVocabLimit: 2000, 
          estimatedMinutes: 50,
          targetCollocations: ['相関関係', 'パラダイムシフト', '内在する矛盾'],
          assessmentPrompt: 'Based on the philosophical essay provided, explain the author\'s concept of "Categorical Imperative" in the context of modern social media.',
          modelAnswer: 'The author posits that the "Categorical Imperative" is violated on social media because users treat others merely as a means to an end (metrics/attention), rather than as an end in themselves.',
          commonMistakes: ['Relying on prior knowledge of philosophy rather than strictly interpreting the text provided.', 'Failing to parse highly complex, multi-clause sentences that span an entire paragraph.']
        },
        {
          title: 'Grammar: Classical Japanese Vestiges in Modern Usage',
          type: 'grammar',
          officialRubricMapping: 'JLPT N1 Grammar',
          targetGrammar: ['～たりとも', '～であれ～であれ', '～をもってしても', '～にはあたらない'],
          estimatedMinutes: 40,
          targetCollocations: ['一瞬たりとも油断できない', '男性であれ女性であれ', '最先端の技術をもってしても'],
          assessmentPrompt: 'Use each grammar point in a sentence about environmental policy: たりとも, であれ～であれ, をもってしても, にはあたらない.',
          modelAnswer: '環境問題に関しては、一秒たりとも無駄にはできない。先進国であれ途上国であれ、全ての国が協力すべきだ。最先端の技術をもってしても、既に失われた生態系を完全に復元することは困難である。とはいえ、現状を悲観するにはあたらない。',
          commonMistakes: ['Using たりとも with large quantities (it emphasizes "not even the smallest amount").', 'Confusing にはあたらない (is not worth doing) with にあたって (on the occasion of).']
        },
        {
          title: 'Listening: Rapid Speech & Dialect Recognition',
          type: 'listening',
          officialRubricMapping: 'JLPT N1 Listening',
          targetVocabLimit: 1500,
          estimatedMinutes: 45,
          targetCollocations: ['なんぼ (Kansai: いくら)', 'あかん (Kansai: だめ)', 'ちゃう (Kansai: 違う)'],
          assessmentPrompt: 'Listen to the Kansai-dialect conversation between two Osaka businessmen. What is the main business decision they reach?',
          modelAnswer: 'They decide to delay the product launch by two weeks (「二週間延ばそ」= 二週間延ばそう) because the quality assurance testing revealed a critical defect (あかんわ、これ = this is no good).',
          commonMistakes: ['Failing to parse Kansai contractions (e.g., してへん = していない).', 'Missing the decisive utterance because it\'s phrased casually in dialect rather than standard Japanese.']
        },
        {
          title: 'Writing: Academic Paper Abstract (論文要旨)',
          type: 'writing',
          officialRubricMapping: 'JLPT N1 Writing',
          targetGrammar: ['～と考えられる', '～が明らかになった', '～において', '～に基づき'],
          estimatedMinutes: 50,
          targetCollocations: ['本研究では', '先行研究を踏まえ', '有意な差が認められた', '今後の課題として'],
          assessmentPrompt: 'Write a 100-word academic abstract in Japanese about a study that found a correlation between sleep quality and academic performance among university students.',
          modelAnswer: '本研究では、大学生の睡眠の質と学業成績の相関関係について調査した。先行研究を踏まえ、200名の学生を対象にアンケート調査を実施した結果、睡眠時間が6時間未満の学生群と7時間以上の学生群の間に、GPA において有意な差が認められた（p<0.05）。これらの結果から、十分な睡眠が学業成績の向上に寄与すると考えられる。今後の課題として、睡眠の質を定量的に測定する手法の改善が挙げられる。',
          commonMistakes: ['Using casual 話し言葉 in an academic abstract (e.g., ～と思う instead of ～と考えられる).', 'Omitting hedging language (～と考えられる, ～が示唆される) and making definitive claims without evidence.']
        }
      ]
    }
  ]
};
