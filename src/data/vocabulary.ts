import type { VocabularyItem, GrammarTopic } from '../types';

export const vocabulary: VocabularyItem[] = [
  { id: 'v1', word: 'abundant', translation: 'dồi dào', pronunciation: '/əˈbʌndənt/', example: 'The region has abundant natural resources.', exampleTranslation: 'Vùng này có nguồn tài nguyên thiên nhiên dồi dào.', partOfSpeech: 'adjective', level: 'B1 (Intermediate)', mastery: 80 },
  { id: 'v2', word: 'elaborate', translation: 'chi tiết, phức tạp', pronunciation: '/ɪˈlæbərət/', example: 'She gave an elaborate explanation of the theory.', exampleTranslation: 'Cô ấy đưa ra một giải thích chi tiết về lý thuyết.', partOfSpeech: 'adjective', level: 'B1 (Intermediate)', mastery: 60 },
  { id: 'v3', word: 'inevitable', translation: 'không thể tránh khỏi', pronunciation: '/ɪnˈevɪtəbl/', example: 'Change is inevitable in any organization.', exampleTranslation: 'Sự thay đổi là không thể tránh khỏi ở bất kỳ tổ chức nào.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 45 },
  { id: 'v4', word: 'phenomenon', translation: 'hiện tượng', pronunciation: '/fɪˈnɒmɪnən/', example: 'Climate change is a global phenomenon.', exampleTranslation: 'Biến đổi khí hậu là một hiện tượng toàn cầu.', partOfSpeech: 'noun', level: 'B1 (Intermediate)', mastery: 70 },
  { id: 'v5', word: 'substantial', translation: 'đáng kể', pronunciation: '/səbˈstænʃəl/', example: 'There has been a substantial increase in sales.', exampleTranslation: 'Doanh số bán hàng đã tăng đáng kể.', partOfSpeech: 'adjective', level: 'B1 (Intermediate)', mastery: 55 },
  { id: 'v6', word: 'consequently', translation: 'do đó', pronunciation: '/ˈkɒnsɪkwəntli/', example: 'She studied hard; consequently, she passed the exam.', exampleTranslation: 'Cô ấy học chăm chỉ; do đó, cô ấy đã đỗ kỳ thi.', partOfSpeech: 'adverb', level: 'B2 (Upper-Intermediate)', mastery: 40 },
  { id: 'v7', word: 'demonstrate', translation: 'chứng minh', pronunciation: '/ˈdemənstreɪt/', example: 'The experiment demonstrates the effect of gravity.', exampleTranslation: 'Thí nghiệm chứng minh tác dụng của trọng lực.', partOfSpeech: 'verb', level: 'B1 (Intermediate)', mastery: 85 },
  { id: 'v8', word: 'significant', translation: 'quan trọng, đáng kể', pronunciation: '/sɪɡˈnɪfɪkənt/', example: 'This is a significant achievement.', exampleTranslation: 'Đây là một thành tựu đáng kể.', partOfSpeech: 'adjective', level: 'B1 (Intermediate)', mastery: 90 },
  { id: 'v9', word: 'controversial', translation: 'gây tranh cãi', pronunciation: '/ˌkɒntrəˈvɜːʃəl/', example: 'The new policy is highly controversial.', exampleTranslation: 'Chính sách mới gây tranh cãi mạnh mẽ.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 35 },
  { id: 'v10', word: 'implement', translation: 'triển khai, thực hiện', pronunciation: '/ˈɪmplɪment/', example: 'The government plans to implement new regulations.', exampleTranslation: 'Chính phủ dự định triển khai các quy định mới.', partOfSpeech: 'verb', level: 'B1 (Intermediate)', mastery: 65 },
  { id: 'v11', word: 'perspective', translation: 'góc nhìn', pronunciation: '/pəˈspektɪv/', example: 'From my perspective, this is the best solution.', exampleTranslation: 'Từ góc nhìn của tôi, đây là giải pháp tốt nhất.', partOfSpeech: 'noun', level: 'B1 (Intermediate)', mastery: 75 },
  { id: 'v12', word: 'reluctant', translation: 'miễn cưỡng', pronunciation: '/rɪˈlʌktənt/', example: 'She was reluctant to share her opinion.', exampleTranslation: 'Cô ấy miễn cưỡng chia sẻ ý kiến của mình.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 50 },
  { id: 'v13', word: 'enhance', translation: 'nâng cao', pronunciation: '/ɪnˈhɑːns/', example: 'Technology can enhance the learning experience.', exampleTranslation: 'Công nghệ có thể nâng cao trải nghiệm học tập.', partOfSpeech: 'verb', level: 'B1 (Intermediate)', mastery: 72 },
  { id: 'v14', word: 'deteriorate', translation: 'xấu đi', pronunciation: '/dɪˈtɪəriəreɪt/', example: 'Air quality continues to deteriorate.', exampleTranslation: 'Chất lượng không khí tiếp tục xấu đi.', partOfSpeech: 'verb', level: 'C1 (Advanced)', mastery: 30 },
  { id: 'v15', word: 'allocate', translation: 'phân bổ', pronunciation: '/ˈæləkeɪt/', example: 'The budget was allocated to different departments.', exampleTranslation: 'Ngân sách được phân bổ cho các phòng ban khác nhau.', partOfSpeech: 'verb', level: 'B2 (Upper-Intermediate)', mastery: 42 },
  { id: 'v16', word: 'advocate', translation: 'ủng hộ, tán thành', pronunciation: '/ˈædvəkeɪt/', example: 'She advocates for equal rights.', exampleTranslation: 'Cô ấy ủng hộ quyền bình đẳng.', partOfSpeech: 'verb', level: 'B2 (Upper-Intermediate)', mastery: 55 },
  { id: 'v17', word: 'comprehensive', translation: 'toàn diện', pronunciation: '/ˌkɒmprɪˈhensɪv/', example: 'The report provides a comprehensive overview.', exampleTranslation: 'Báo cáo cung cấp cái nhìn toàn diện.', partOfSpeech: 'adjective', level: 'B1 (Intermediate)', mastery: 68 },
  { id: 'v18', word: 'predominant', translation: 'chiếm ưu thế', pronunciation: '/prɪˈdɒmɪnənt/', example: 'English is the predominant language in business.', exampleTranslation: 'Tiếng Anh là ngôn ngữ chiếm ưu thế trong kinh doanh.', partOfSpeech: 'adjective', level: 'C1 (Advanced)', mastery: 25 },
  { id: 'v19', word: 'fluctuate', translation: 'dao động', pronunciation: '/ˈflʌktʃueɪt/', example: 'Prices fluctuate depending on demand.', exampleTranslation: 'Giá dao động tùy thuộc vào nhu cầu.', partOfSpeech: 'verb', level: 'B2 (Upper-Intermediate)', mastery: 48 },
  { id: 'v20', word: 'hypothesis', translation: 'giả thuyết', pronunciation: '/haɪˈpɒθəsɪs/', example: 'The scientist tested her hypothesis.', exampleTranslation: 'Nhà khoa học kiểm tra giả thuyết của cô ấy.', partOfSpeech: 'noun', level: 'C1 (Advanced)', mastery: 38 },
  { id: 'v21', word: 'resilient', translation: 'kiên cường', pronunciation: '/rɪˈzɪliənt/', example: 'Children are remarkably resilient.', exampleTranslation: 'Trẻ em rất kiên cường.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 52 },
  { id: 'v22', word: 'ambiguous', translation: 'mơ hồ', pronunciation: '/æmˈbɪɡjuəs/', example: 'The instructions were ambiguous.', exampleTranslation: 'Hướng dẫn mơ hồ.', partOfSpeech: 'adjective', level: 'C1 (Advanced)', mastery: 33 },
  { id: 'v23', word: 'feasible', translation: 'khả thi', pronunciation: '/ˈfiːzəbl/', example: 'The plan is technically feasible.', exampleTranslation: 'Kế hoạch khả thi về mặt kỹ thuật.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 58 },
  { id: 'v24', word: 'underlying', translation: 'tiềm ẩn', pronunciation: '/ˌʌndəˈlaɪɪŋ/', example: 'The underlying cause of the problem is poverty.', exampleTranslation: 'Nguyên nhân tiềm ẩn của vấn đề là nghèo đói.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 44 },
  { id: 'v25', word: 'preliminary', translation: 'sơ bộ', pronunciation: '/prɪˈlɪmɪnəri/', example: 'The preliminary results are encouraging.', exampleTranslation: 'Kết quả sơ bộ rất đáng khích lệ.', partOfSpeech: 'adjective', level: 'C1 (Advanced)', mastery: 28 },
  { id: 'v26', word: 'versatile', translation: 'đa năng', pronunciation: '/ˈvɜːsətaɪl/', example: 'She is a versatile performer.', exampleTranslation: 'Cô ấy là một nghệ sĩ đa năng.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 62 },
  { id: 'v27', word: 'coherent', translation: 'mạch lạc', pronunciation: '/kəʊˈhɪərənt/', example: 'Your essay needs to be more coherent.', exampleTranslation: 'Bài luận của bạn cần mạch lạc hơn.', partOfSpeech: 'adjective', level: 'B2 (Upper-Intermediate)', mastery: 55 },
  { id: 'v28', word: 'procrastinate', translation: 'trì hoãn', pronunciation: '/prəˈkræstɪneɪt/', example: "Don't procrastinate — start studying now!", exampleTranslation: 'Đừng trì hoãn — bắt đầu học ngay!', partOfSpeech: 'verb', level: 'B1 (Intermediate)', mastery: 70 },
  { id: 'v29', word: 'meticulous', translation: 'tỉ mỉ', pronunciation: '/məˈtɪkjʊləs/', example: 'She is meticulous in her research.', exampleTranslation: 'Cô ấy tỉ mỉ trong nghiên cứu.', partOfSpeech: 'adjective', level: 'C1 (Advanced)', mastery: 22 },
  { id: 'v30', word: 'unprecedented', translation: 'chưa từng có', pronunciation: '/ʌnˈpresɪdentɪd/', example: 'The pandemic caused unprecedented disruption.', exampleTranslation: 'Đại dịch gây ra sự gián đoạn chưa từng có.', partOfSpeech: 'adjective', level: 'C1 (Advanced)', mastery: 35 },
  { id: 'v31', word: 'scrutinize', translation: 'xem xét kỹ', pronunciation: '/ˈskruːtɪnaɪz/', example: 'The committee will scrutinize the proposal.', exampleTranslation: 'Ủy ban sẽ xem xét kỹ đề xuất.', partOfSpeech: 'verb', level: 'C1 (Advanced)', mastery: 18 },
  { id: 'v32', word: 'alleviate', translation: 'giảm bớt', pronunciation: '/əˈliːvieɪt/', example: 'Medication can alleviate the symptoms.', exampleTranslation: 'Thuốc có thể giảm bớt triệu chứng.', partOfSpeech: 'verb', level: 'C1 (Advanced)', mastery: 40 },
];

export const grammarTopics: GrammarTopic[] = [
  {
    id: 'g1', title: 'Present Simple vs Present Continuous', description: 'When to use each present tense', level: 'A1 (Beginner)', isCompleted: true,
    explanation: 'Present Simple is used for habits, routines, and general truths. Present Continuous is used for actions happening right now or temporary situations.',
    examples: [
      { sentence: 'I study English every day.', translation: 'Tôi học tiếng Anh mỗi ngày.', highlight: 'study', explanation: 'Habit/routine → Present Simple' },
      { sentence: 'I am studying English right now.', translation: 'Tôi đang học tiếng Anh ngay bây giờ.', highlight: 'am studying', explanation: 'Action happening now → Present Continuous' },
    ],
    exercises: [],
  },
  {
    id: 'g2', title: 'Past Simple vs Past Continuous', description: 'Narrating past events', level: 'A1 (Beginner)', isCompleted: true,
    explanation: 'Past Simple is used for completed actions in the past. Past Continuous is used for ongoing actions that were interrupted.',
    examples: [
      { sentence: 'I walked to school yesterday.', translation: 'Tôi đi bộ đến trường hôm qua.', highlight: 'walked', explanation: 'Completed past action → Past Simple' },
      { sentence: 'I was walking when it started to rain.', translation: 'Tôi đang đi bộ thì trời bắt đầu mưa.', highlight: 'was walking', explanation: 'Ongoing action interrupted → Past Continuous' },
    ],
    exercises: [],
  },
  {
    id: 'g3', title: 'Present Perfect', description: 'Connecting past to present', level: 'A2 (Elementary)', isCompleted: true,
    explanation: 'Present Perfect connects a past action to the present moment. Used with "since", "for", "already", "yet", "just".',
    examples: [
      { sentence: 'I have lived here for 5 years.', translation: 'Tôi đã sống ở đây 5 năm.', highlight: 'have lived', explanation: 'Started in past, continues to present' },
      { sentence: 'She has already finished her homework.', translation: 'Cô ấy đã hoàn thành bài tập rồi.', highlight: 'has already finished', explanation: 'Past action relevant to now' },
    ],
    exercises: [],
  },
  {
    id: 'g4', title: 'Conditional Sentences (Type 0, 1, 2)', description: 'If clauses and their meanings', level: 'B1 (Intermediate)', isCompleted: false,
    explanation: 'Type 0: general truths (If + present, present). Type 1: real/possible future (If + present, will + V). Type 2: unreal present (If + past, would + V).',
    examples: [
      { sentence: 'If you heat water, it boils.', translation: 'Nếu bạn đun nước, nó sôi.', highlight: 'heat...boils', explanation: 'Type 0: General truth' },
      { sentence: 'If I study hard, I will pass.', translation: 'Nếu tôi học chăm, tôi sẽ đỗ.', highlight: 'study...will pass', explanation: 'Type 1: Real future possibility' },
      { sentence: 'If I had more time, I would travel.', translation: 'Nếu tôi có nhiều thời gian hơn, tôi sẽ đi du lịch.', highlight: 'had...would travel', explanation: 'Type 2: Unreal present' },
    ],
    exercises: [],
  },
  {
    id: 'g5', title: 'Passive Voice', description: 'Changing focus from doer to receiver', level: 'B1 (Intermediate)', isCompleted: false,
    explanation: 'Passive voice shifts focus to the action receiver. Form: be + past participle. Used when the doer is unknown or unimportant.',
    examples: [
      { sentence: 'The cake was baked by my mother.', translation: 'Bánh được làm bởi mẹ tôi.', highlight: 'was baked', explanation: 'Past passive' },
      { sentence: 'English is spoken worldwide.', translation: 'Tiếng Anh được nói trên toàn thế giới.', highlight: 'is spoken', explanation: 'Present passive — agent omitted' },
    ],
    exercises: [],
  },
  {
    id: 'g6', title: 'Reported Speech', description: 'Reporting what others said', level: 'B1 (Intermediate)', isCompleted: false,
    explanation: 'When reporting speech, tenses shift back. Present → Past, Past → Past Perfect, Will → Would.',
    examples: [
      { sentence: 'He said (that) he was tired.', translation: 'Anh ấy nói rằng anh ấy mệt.', highlight: 'said...was', explanation: '"I am tired" → "he was tired"' },
      { sentence: 'She told me she would come.', translation: 'Cô ấy bảo tôi rằng cô ấy sẽ đến.', highlight: 'told...would', explanation: '"I will come" → "she would come"' },
    ],
    exercises: [],
  },
  {
    id: 'g7', title: 'Relative Clauses', description: 'Adding information about nouns', level: 'B2 (Upper-Intermediate)', isCompleted: false,
    explanation: 'Defining clauses identify which person/thing. Non-defining clauses add extra info (commas). Who/which/that/whose/where/when.',
    examples: [
      { sentence: 'The man who lives next door is a teacher.', translation: 'Người đàn ông sống bên cạnh là giáo viên.', highlight: 'who lives next door', explanation: 'Defining — identifies which man' },
      { sentence: 'My sister, who is a doctor, lives in London.', translation: 'Chị tôi, người là bác sĩ, sống ở London.', highlight: ', who is a doctor,', explanation: 'Non-defining — adds extra info' },
    ],
    exercises: [],
  },
  {
    id: 'g8', title: 'Modal Verbs', description: 'Expressing ability, possibility, obligation', level: 'B1 (Intermediate)', isCompleted: false,
    explanation: 'Can (ability), could (past ability/polite), may/might (possibility), must (obligation), should (advice), would (conditional).',
    examples: [
      { sentence: 'You must wear a seatbelt.', translation: 'Bạn phải đeo dây an toàn.', highlight: 'must', explanation: 'Obligation/necessity' },
      { sentence: 'She might come to the party.', translation: 'Cô ấy có thể đến bữa tiệc.', highlight: 'might', explanation: 'Possibility (less certain than may)' },
    ],
    exercises: [],
  },
  {
    id: 'g9', title: 'Articles (a, an, the)', description: 'Using articles correctly', level: 'A1 (Beginner)', isCompleted: false,
    explanation: 'A/an for first mention or non-specific. The for specific/known. Zero article for general plurals and uncountable nouns.',
    examples: [
      { sentence: 'I saw a dog. The dog was big.', translation: 'Tôi thấy một con chó. Con chó đó to.', highlight: 'a...The', explanation: 'First mention → a. Known → the' },
      { sentence: 'Water is essential for life.', translation: 'Nước là thiết yếu cho cuộc sống.', highlight: 'Water', explanation: 'General uncountable — no article' },
    ],
    exercises: [],
  },
  {
    id: 'g10', title: 'Conditionals Type 3 & Mixed', description: 'Imagining different pasts', level: 'C1 (Advanced)', isCompleted: false,
    explanation: 'Type 3: If + had + pp, would have + pp (unreal past). Mixed: different time references in condition and result.',
    examples: [
      { sentence: 'If I had studied harder, I would have passed.', translation: 'Nếu tôi đã học chăm hơn, tôi đã đỗ rồi.', highlight: 'had studied...would have passed', explanation: 'Type 3: Unreal past' },
      { sentence: 'If I had taken that job, I would be rich now.', translation: 'Nếu tôi đã nhận công việc đó, bây giờ tôi giàu rồi.', highlight: 'had taken...would be', explanation: 'Mixed: past condition → present result' },
    ],
    exercises: [],
  },
  {
    id: 'g11', title: 'Gerunds and Infinitives', description: 'When to use -ing or to + verb', level: 'B1 (Intermediate)', isCompleted: false,
    explanation: 'Some verbs take gerund (enjoy, avoid, consider), some take infinitive (want, decide, hope), some take both with different meanings (stop, remember, try).',
    examples: [
      { sentence: 'I enjoy learning languages.', translation: 'Tôi thích học ngôn ngữ.', highlight: 'enjoy learning', explanation: 'Enjoy + gerund' },
      { sentence: 'I decided to study abroad.', translation: 'Tôi quyết định du học.', highlight: 'decided to study', explanation: 'Decide + infinitive' },
    ],
    exercises: [],
  },
];

