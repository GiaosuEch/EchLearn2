import type { ReadingPassage } from './readingLibrary.ts';

export const readingLibraryJa: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'ja_r1', title: 'わたしのいちにち', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'わたしのなまえはゆきです。まいあさ七じにおきます。かおをあらって、はをみがきます。あさごはんにパンとたまごをたべます。ぎゅうにゅうをのみます。八じにがっこうにいきます。でんしゃにのります。がっこうで日本語とすうがくをべんきょうします。ごご四じにいえにかえります。よるはしゅくだいをしてから、テレビをみます。十一じにねます。',
    wordCount: 100,
    vocabularyHighlights: ['おきます', 'あさごはん', 'でんしゃ', 'べんきょう', 'しゅくだい'],
    questions: [
      { id: 'ja_r1q1', type: 'multiple_choice', question: 'ゆきさんはなんじにおきますか？', options: ['六じ', '七じ', '八じ', '九じ'], correctAnswer: '七じ', explanation: '「まいあさ七じにおきます」とあります。' },
      { id: 'ja_r1q2', type: 'true_false', question: 'ゆきさんはバスでがっこうにいきます。', options: ['True', 'False'], correctAnswer: 'False', explanation: '「でんしゃにのります」とあります。バスではありません。' },
      { id: 'ja_r1q3', type: 'multiple_choice', question: 'ゆきさんはなにをべんきょうしますか？', options: ['えいごとかがく', '日本語とすうがく', 'おんがくとびじゅつ', 'れきしとちり'], correctAnswer: '日本語とすうがく', explanation: '「日本語とすうがくをべんきょうします」とあります。' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'ja_r2', title: 'スーパーでかいもの', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'きょうは土よう日です。おかあさんとスーパーにいきます。まず、やさいをかいます。トマトとにんじんとキャベツをかいます。つぎに、くだものをかいます。りんごとバナナをかいます。それから、おにくとさかなもかいます。わたしはチョコレートがほしいです。でも、おかあさんは「だめ」といいます。さいごに、ぎゅうにゅうとたまごをかいます。おかねをはらって、いえにかえります。わたしはおかあさんのおてつだいをします。',
    wordCount: 105,
    vocabularyHighlights: ['スーパー', 'やさい', 'くだもの', 'おかね', 'おてつだい'],
    questions: [
      { id: 'ja_r2q1', type: 'multiple_choice', question: 'きょうはなんようびですか？', options: ['日よう日', '土よう日', '金よう日', '月よう日'], correctAnswer: '土よう日', explanation: '「きょうは土よう日です」とあります。' },
      { id: 'ja_r2q2', type: 'true_false', question: 'チョコレートをかいました。', options: ['True', 'False'], correctAnswer: 'False', explanation: 'おかあさんが「だめ」といったので、かいませんでした。' },
      { id: 'ja_r2q3', type: 'multiple_choice', question: 'どんなくだものをかいましたか？', options: ['みかんとぶどう', 'りんごとバナナ', 'いちごとメロン', 'ももとすいか'], correctAnswer: 'りんごとバナナ', explanation: '「りんごとバナナをかいます」とあります。' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'ja_r3', title: '京都旅行', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: '先週末、友だちと京都に旅行しました。東京から新幹線で二時間半かかりました。京都に着いてから、まず金閣寺に行きました。金閣寺はとてもきれいで、金色に光っていました。たくさん写真をとりました。午後は嵐山を散歩しました。竹の林がとても美しかったです。夕方、祇園で抹茶アイスクリームを食べました。とてもおいしかったです。二日目は伏見稲荷大社に行きました。赤い鳥居がたくさん並んでいて、とても印象的でした。京都はお寺や神社が多くて、日本の伝統文化を感じることができます。また行きたいです。',
    wordCount: 145,
    vocabularyHighlights: ['新幹線', '金閣寺', '散歩', '鳥居', '伝統文化'],
    questions: [
      { id: 'ja_r3q1', type: 'multiple_choice', question: '東京から京都までどのくらいかかりましたか？', options: ['一時間', '二時間半', '三時間', '四時間'], correctAnswer: '二時間半', explanation: '「新幹線で二時間半かかりました」とあります。' },
      { id: 'ja_r3q2', type: 'true_false', question: '嵐山で抹茶アイスクリームを食べました。', options: ['True', 'False'], correctAnswer: 'False', explanation: '抹茶アイスクリームを食べたのは祇園です。嵐山では散歩をしました。' },
      { id: 'ja_r3q3', type: 'multiple_choice', question: '伏見稲荷大社で何が印象的でしたか？', options: ['金色のお寺', '竹の林', '赤い鳥居', '桜の花'], correctAnswer: '赤い鳥居', explanation: '「赤い鳥居がたくさん並んでいて、とても印象的でした」とあります。' },
    ],
    tags: ['travel', 'japan']
  },
  {
    id: 'ja_r4', title: '日本の食べ物', level: 'A2', topic: 'Food & Culture', sourceType: 'original',
    content: '日本の食文化はとても豊かです。日本料理は2013年にユネスコの無形文化遺産に登録されました。日本では、地域によって有名な食べ物が違います。北海道はラーメンと海鮮が有名です。大阪はたこ焼きとお好み焼きで知られています。東京にはいろいろな種類のお寿司屋さんがあります。\n\n日本人は食事の前に「いただきます」と言い、食事の後に「ごちそうさまでした」と言います。これは食べ物への感謝を表す大切な習慣です。日本の食事はごはん、みそ汁、おかずの組み合わせが基本です。見た目も大切にするので、日本料理はいつもきれいに盛り付けられています。',
    wordCount: 150,
    vocabularyHighlights: ['食文化', '無形文化遺産', '海鮮', '感謝', '盛り付け'],
    questions: [
      { id: 'ja_r4q1', type: 'multiple_choice', question: '日本料理はいつユネスコの無形文化遺産に登録されましたか？', options: ['2010年', '2013年', '2015年', '2018年'], correctAnswer: '2013年', explanation: '「2013年にユネスコの無形文化遺産に登録されました」とあります。' },
      { id: 'ja_r4q2', type: 'true_false', question: '大阪はお寿司で有名です。', options: ['True', 'False'], correctAnswer: 'False', explanation: '大阪は「たこ焼きとお好み焼き」で知られています。お寿司は東京です。' },
      { id: 'ja_r4q3', type: 'multiple_choice', question: '「いただきます」はいつ言いますか？', options: ['食事の後', '食事の前', '料理中', '買い物の時'], correctAnswer: '食事の前', explanation: '「日本人は食事の前に「いただきます」と言い」とあります。' },
    ],
    tags: ['food', 'culture', 'japan']
  },

  // ═══ B1 ═══
  {
    id: 'ja_r5', title: '日本の教育制度', level: 'B1', topic: 'Education', sourceType: 'original',
    content: '日本の教育制度は小学校六年、中学校三年、高校三年、大学四年という構造になっています。小学校と中学校は義務教育で、すべての子供が無料で教育を受けることができます。高校への進学率は約98%で、ほとんどの生徒が高校に進学します。\n\n日本の学校教育の特徴として、生徒が教室の掃除をすることが挙げられます。これは責任感と協力の精神を育てるためです。また、部活動も日本の学校生活の重要な一部です。スポーツ系と文化系の部活があり、多くの生徒が放課後に参加しています。\n\nしかし、受験競争が激しいことも日本の教育の特徴です。良い大学に入るために、多くの生徒が塾に通っています。受験のプレッシャーが生徒の精神的な健康に影響を与えるという批判もあります。近年、教育改革が進められ、暗記中心の教育から考える力を重視する教育への転換が図られています。',
    wordCount: 185,
    vocabularyHighlights: ['義務教育', '進学率', '部活動', '受験競争', '教育改革'],
    questions: [
      { id: 'ja_r5q1', type: 'multiple_choice', question: '日本の義務教育は何年間ですか？', options: ['六年', '九年', '十二年', '十六年'], correctAnswer: '九年', explanation: '小学校六年と中学校三年が義務教育なので、合計九年間です。' },
      { id: 'ja_r5q2', type: 'true_false', question: '日本では専門の清掃員が教室を掃除します。', options: ['True', 'False'], correctAnswer: 'False', explanation: '「生徒が教室の掃除をする」とあります。専門の清掃員ではありません。' },
      { id: 'ja_r5q3', type: 'multiple_choice', question: '近年の教育改革は何を重視していますか？', options: ['暗記力', '考える力', 'スポーツ', '外国語'], correctAnswer: '考える力', explanation: '「暗記中心の教育から考える力を重視する教育への転換が図られています」とあります。' },
    ],
    tags: ['education', 'society', 'japan']
  },

  // ═══ B2 ═══
  {
    id: 'ja_r6', title: 'テクノロジーと社会', level: 'B2', topic: 'Technology & Society', sourceType: 'original',
    content: '人工知能（AI）やロボット技術の急速な発展は、社会のあらゆる面に大きな変化をもたらしている。製造業ではすでに多くの工場で産業用ロボットが導入され、自動化が進んでいる。医療分野では、AIが画像診断の精度を向上させ、病気の早期発見に貢献している。\n\nしかし、こうした技術革新は雇用に対する不安も引き起こしている。オックスフォード大学の研究によれば、今後二十年以内に現在の仕事の約半数がAIやロボットに代替される可能性があるという。特に事務作業や定型的な業務は自動化の影響を受けやすいとされている。\n\n一方で、テクノロジーの進歩は新しい仕事や産業を生み出す側面もある。データサイエンティストやAIエンジニアなど、以前は存在しなかった職業が急速に増えている。重要なのは、変化する労働市場に適応するために、生涯を通じた学び直しやスキルの更新が必要だということである。\n\nまた、テクノロジーの発展に伴い、プライバシーの保護やAIの倫理的な利用に関する議論も活発化している。便利さの追求と人権の尊重をどう両立させるかは、現代社会が直面する重要な課題の一つである。',
    wordCount: 225,
    vocabularyHighlights: ['人工知能', '自動化', '雇用', '代替', '倫理的'],
    questions: [
      { id: 'ja_r6q1', type: 'multiple_choice', question: 'オックスフォード大学の研究は何を示していますか？', options: ['AIは使えない', '仕事の約半数がAIに代替される可能性がある', 'すべての仕事がなくなる', 'ロボットは危険である'], correctAnswer: '仕事の約半数がAIに代替される可能性がある', explanation: '「現在の仕事の約半数がAIやロボットに代替される可能性がある」とあります。' },
      { id: 'ja_r6q2', type: 'true_false', question: 'テクノロジーの進歩は新しい仕事を生み出さない。', options: ['True', 'False'], correctAnswer: 'False', explanation: '「テクノロジーの進歩は新しい仕事や産業を生み出す側面もある」とあります。' },
      { id: 'ja_r6q3', type: 'multiple_choice', question: '文章によると、現代社会の重要な課題は何ですか？', options: ['テクノロジーの使用をやめること', '便利さの追求と人権の尊重の両立', 'すべてのロボットを廃棄すること', '大学教育を廃止すること'], correctAnswer: '便利さの追求と人権の尊重の両立', explanation: '「便利さの追求と人権の尊重をどう両立させるかは、現代社会が直面する重要な課題の一つ」とあります。' },
    ],
    tags: ['technology', 'society', 'work']
  },
];
