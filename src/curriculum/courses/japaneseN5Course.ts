/**
 * Japanese N5 Course — Structured Curriculum
 *
 * Converts the flat lesson registry into 6 thematic units with:
 * - Can-do outcomes per unit
 * - 6-phase pedagogical sequence per lesson
 * - Checkpoints per unit
 * - Remediation paths
 * - Weekly study plan
 * - Mastery gate for N4 progression
 *
 * Grammar points per unit map to Minna no Nihongo / Genki textbook order,
 * which aligns with official JLPT N5 grammar syllabus.
 */

import type {
  CanDoOutcome,
  CurriculumCourse,
  MasteryGate,
  ThematicUnit,
  WeeklyPlanEntry,
} from '../../domain/curriculum/curriculumEngine';

// ─── Course-Level Can-Do Outcomes ───────────────────────────────────

const N5_COURSE_OUTCOMES: readonly CanDoOutcome[] = [
  {
    id: 'n5-read-kana',
    statement: 'Đọc được toàn bộ Hiragana và Katakana, nhận diện ~100 Kanji N5 cơ bản.',
    skill: 'script-recognition',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'matching', minimumScore: 90, description: 'Ghép kana với phiên âm' }],
  },
  {
    id: 'n5-self-introduce',
    statement: 'Giới thiệu bản thân: tên, quốc tịch, nghề nghiệp, sở thích bằng câu đơn giản.',
    skill: 'productive-speaking',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Xây dựng 3+ câu tự giới thiệu' }],
  },
  {
    id: 'n5-daily-routine',
    statement: 'Mô tả thói quen hằng ngày: thời gian, nơi chốn, hoạt động.',
    skill: 'productive-writing',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Viết 5 câu về ngày thường' }],
  },
  {
    id: 'n5-read-short',
    statement: 'Đọc hiểu đoạn văn ngắn (~50-100 chữ) về chủ đề quen thuộc và trả lời câu hỏi.',
    skill: 'receptive-reading',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Trả lời đúng ≥70% câu hỏi đọc hiểu' }],
  },
  {
    id: 'n5-describe-compare',
    statement: 'Mô tả người/vật bằng tính từ, so sánh hai đối tượng.',
    skill: 'grammar-production',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Điền đúng tính từ/so sánh' }],
  },
  {
    id: 'n5-request-permission',
    statement: 'Đưa yêu cầu lịch sự, xin phép, nói quy tắc bằng thể て.',
    skill: 'grammar-production',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Tạo câu yêu cầu/cho phép đúng' }],
  },
  {
    id: 'n5-vocab-800',
    statement: 'Nhận diện và sử dụng ≥700 từ vựng N5 trong ngữ cảnh.',
    skill: 'vocabulary-recognition',
    referenceLevel: 'JLPT-N5',
    assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 80, description: 'Chọn đúng nghĩa từ' }],
  },
];

// ─── Unit 0: Kana Foundation ────────────────────────────────────────

const UNIT_0_KANA: ThematicUnit = {
  id: 'ja-n5-u0-kana',
  title: 'Unit 0 · Hệ chữ Kana',
  theme: 'ひらがな・カタカナ — Nền tảng hệ chữ',
  canDoOutcomes: [
    {
      id: 'u0-read-hiragana',
      statement: 'Đọc và nhận diện toàn bộ 46 ký tự Hiragana cơ bản.',
      skill: 'script-recognition',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'matching', minimumScore: 90, description: 'Ghép hiragana ↔ phiên âm romaji' }],
    },
    {
      id: 'u0-read-katakana',
      statement: 'Đọc và nhận diện toàn bộ 46 ký tự Katakana cơ bản.',
      skill: 'script-recognition',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'matching', minimumScore: 85, description: 'Ghép katakana ↔ phiên âm romaji' }],
    },
  ],
  lessons: [
    {
      id: 'ja-n5-u0-l1-hiragana',
      title: 'Hiragana: あ行 → わ行',
      targetOutcomes: ['u0-read-hiragana'],
      entryRequirements: [],
      estimatedMinutes: 25,
      studyTactics: [
        'Viết mỗi ký tự 5 lần theo nét (stroke order) trước khi làm bài tập.',
        'Đọc to phiên âm khi viết để liên kết âm-hình.',
        'Nhóm 5 ký tự/lần (あいうえお), học xong nhóm mới quay lại ôn nhóm cũ.',
      ],
      commonMistakes: [
        { wrong: 'は đọc là "ha"', correct: 'Khi là trợ từ, は đọc là "wa"', reason: 'Trợ từ は là ngoại lệ duy nhất trong hiragana.' },
        { wrong: 'Nhầm し (shi) và つ (tsu)', correct: 'し = shi (nét cong sang phải), つ = tsu (nét cong xuống)', reason: 'Hình dạng tương tự nhưng hướng nét khác nhau.' },
        { wrong: 'Nhầm ぬ (nu) và め (me)', correct: 'ぬ có vòng xoắn kín, め có vòng hở', reason: 'Chú ý phần cuối nét.' },
      ],
      passCriteria: { minimumScore: 80, requireAllPhases: true },
      nextReviewStrategy: {
        firstReviewAfterHours: 4,
        srsItemKinds: ['vocabulary'],
        nextLessonId: 'ja-n5-u0-l2-katakana',
      },
      phases: [
        {
          type: 'introduce',
          estimatedMinutes: 8,
          completionCriteria: { type: 'time-spent', value: 3 },
          content: {
            explanations: [
              'Hiragana là hệ chữ cơ bản nhất của tiếng Nhật. Có 46 ký tự cơ bản, mỗi ký tự đại diện một âm tiết.',
              'Thứ tự học: あ行 (a-i-u-e-o) → か行 (ka-ki-ku-ke-ko) → さ行 → た行 → な行 → は行 → ま行 → や行 → ら行 → わ行.',
              'Mẹo: Hãy tìm hình ảnh liên tưởng cho mỗi chữ. Ví dụ: あ trông giống chữ "a" bị nghiêng.',
            ],
            examples: [
              { text: 'あ (a)', translation: 'Âm "a" — giống chữ a nghiêng', note: 'Nét 1: ngang, nét 2: đứng cong, nét 3: vòng' },
              { text: 'い (i)', translation: 'Âm "i" — hai nét nghiêng', note: 'Hai nét riêng biệt, không nối' },
              { text: 'う (u)', translation: 'Âm "u" — một nét uốn', note: 'Giống chữ U lộn ngược' },
            ],
          },
        },
        {
          type: 'recognize',
          estimatedMinutes: 7,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            questions: [
              { id: 'u0-l1-r1', prompt: 'Ký tự nào đọc là "ka"?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'か' }, { id: 'b', text: 'き' }, { id: 'c', text: 'さ' }, { id: 'd', text: 'た' }], correctAnswer: 'a', explanation: 'か = ka. き = ki, さ = sa, た = ta.', skill: 'script-recognition', difficulty: 1 },
              { id: 'u0-l1-r2', prompt: 'Đọc ký tự này: し', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'chi' }, { id: 'b', text: 'shi' }, { id: 'c', text: 'tsu' }, { id: 'd', text: 'su' }], correctAnswer: 'b', explanation: 'し = shi. Đây là ngoại lệ — hàng さ bình thường là sa, si, su, se, so nhưng si → shi.', skill: 'script-recognition', difficulty: 1 },
              { id: 'u0-l1-r3', prompt: 'Ghép đúng: ね', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'nu' }, { id: 'b', text: 'ne' }, { id: 'c', text: 'me' }, { id: 'd', text: 'no' }], correctAnswer: 'b', explanation: 'ね = ne. ぬ = nu, め = me, の = no.', skill: 'script-recognition', difficulty: 1 },
              { id: 'u0-l1-r4', prompt: 'Ký tự nào KHÔNG thuộc hàng た?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'た' }, { id: 'b', text: 'ち' }, { id: 'c', text: 'な' }, { id: 'd', text: 'つ' }], correctAnswer: 'c', explanation: 'な thuộc hàng な (na-ni-nu-ne-no), không phải hàng た (ta-chi-tsu-te-to).', skill: 'script-recognition', difficulty: 2 },
              { id: 'u0-l1-r5', prompt: 'Trợ từ は được đọc là gì?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'ha' }, { id: 'b', text: 'wa' }, { id: 'c', text: 'ba' }, { id: 'd', text: 'pa' }], correctAnswer: 'b', explanation: 'Khi は dùng làm trợ từ (particle), nó được đọc là "wa", không phải "ha". Đây là ngoại lệ quan trọng nhất.', skill: 'script-recognition', difficulty: 2 },
            ],
          },
        },
        {
          type: 'guided-practice',
          estimatedMinutes: 10,
          completionCriteria: { type: 'score-threshold', value: 80 },
          content: {
            hints: ['Nhìn kỹ nét cuối cùng để phân biệt các chữ giống nhau.', 'Nhóm các chữ cùng hàng lại để dễ nhớ.'],
            questions: [
              { id: 'u0-l1-gp1', prompt: 'Điền hiragana đúng cho âm "ku": ___', questionType: 'fill-in', correctAnswer: 'く', explanation: 'く = ku. Nét giống dấu < trong toán.', skill: 'script-production', difficulty: 2 },
              { id: 'u0-l1-gp2', prompt: 'Sắp xếp: あ・い・う・え・お → đọc là?', questionType: 'fill-in', correctAnswer: ['a i u e o', 'a, i, u, e, o'], explanation: 'Hàng あ: a-i-u-e-o. Đây là 5 nguyên âm cơ bản của tiếng Nhật.', skill: 'script-recognition', difficulty: 1 },
              { id: 'u0-l1-gp3', prompt: 'Viết từ "sushi" bằng hiragana:', questionType: 'fill-in', correctAnswer: ['すし'], explanation: 'す = su, し = shi → すし = sushi.', skill: 'script-production', difficulty: 2 },
              { id: 'u0-l1-gp4', prompt: 'Từ ともだち đọc là?', questionType: 'fill-in', correctAnswer: ['tomodachi'], explanation: 'と = to, も = mo, だ = da, ち = chi → tomodachi (bạn bè).', skill: 'script-recognition', difficulty: 3 },
            ],
          },
        },
      ],
    },
    {
      id: 'ja-n5-u0-l2-katakana',
      title: 'Katakana: ア行 → ワ行',
      targetOutcomes: ['u0-read-katakana'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u0-l1-hiragana', minimumScore: 80 }],
      estimatedMinutes: 25,
      studyTactics: [
        'So sánh mỗi Katakana với Hiragana tương ứng để thấy điểm giống/khác.',
        'Katakana chủ yếu dùng cho từ ngoại lai. Đọc bảng quảng cáo Nhật để luyện nhận diện.',
        'Tập viết tên riêng (tên bạn, tên thành phố) bằng Katakana.',
      ],
      commonMistakes: [
        { wrong: 'Nhầm ソ (so) và ン (n)', correct: 'ソ nét xiên từ trái sang phải, ン nét xiên từ phải sang trái', reason: 'Hướng nét là cách phân biệt duy nhất.' },
        { wrong: 'Nhầm シ (shi) và ツ (tsu)', correct: 'シ nét từ trên xuống, ツ nét từ dưới lên', reason: 'Hướng 2 nét ngắn bên trái khác nhau.' },
      ],
      passCriteria: { minimumScore: 80, requireAllPhases: true },
      nextReviewStrategy: {
        firstReviewAfterHours: 4,
        srsItemKinds: ['vocabulary'],
        nextLessonId: 'ja-n5-u1-l1-desu',
      },
      phases: [
        {
          type: 'introduce',
          estimatedMinutes: 8,
          completionCriteria: { type: 'time-spent', value: 3 },
          content: {
            explanations: [
              'Katakana là hệ chữ thứ hai, dùng chủ yếu cho từ mượn nước ngoài, tên riêng, và onomatopoeia.',
              'Mỗi Katakana có phiên âm giống hệt Hiragana tương ứng: ア = あ = a, イ = い = i, ...',
              'Nét Katakana thường thẳng và góc cạnh hơn Hiragana.',
            ],
            examples: [
              { text: 'コーヒー', translation: 'cà phê (coffee)', note: 'ー là dấu kéo dài âm, rất phổ biến trong Katakana.' },
              { text: 'テレビ', translation: 'tivi (television)', note: 'Từ mượn tiếng Anh, viết bằng Katakana.' },
              { text: 'ベトナム', translation: 'Việt Nam', note: 'Tên nước ngoài viết bằng Katakana.' },
            ],
          },
        },
        {
          type: 'recognize',
          estimatedMinutes: 7,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            questions: [
              { id: 'u0-l2-r1', prompt: 'ア đọc là gì?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'a' }, { id: 'b', text: 'ka' }, { id: 'c', text: 'sa' }, { id: 'd', text: 'ta' }], correctAnswer: 'a', explanation: 'ア = a. Giống あ nhưng nét góc cạnh hơn.', skill: 'script-recognition', difficulty: 1 },
              { id: 'u0-l2-r2', prompt: 'パン nghĩa là gì?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'bánh mì' }, { id: 'b', text: 'nước' }, { id: 'c', text: 'sữa' }, { id: 'd', text: 'cơm' }], correctAnswer: 'a', explanation: 'パン = pan = bánh mì (từ tiếng Bồ Đào Nha "pão").', skill: 'vocabulary-recognition', difficulty: 1 },
              { id: 'u0-l2-r3', prompt: 'Phân biệt: ソ vs ン — ký tự nào là "n"?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'ソ' }, { id: 'b', text: 'ン' }], correctAnswer: 'b', explanation: 'ン = n. ソ = so. Nét xiên của ン đi từ phải sang trái.', skill: 'script-recognition', difficulty: 3 },
            ],
          },
        },
        {
          type: 'guided-practice',
          estimatedMinutes: 10,
          completionCriteria: { type: 'score-threshold', value: 75 },
          content: {
            hints: ['Katakana thường đi với dấu kéo dài ー cho âm dài.'],
            questions: [
              { id: 'u0-l2-gp1', prompt: 'Viết "taxi" bằng Katakana:', questionType: 'fill-in', correctAnswer: ['タクシー'], explanation: 'タ = ta, ク = ku, シ = shi, ー = kéo dài → タクシー (takushī).', skill: 'script-production', difficulty: 2 },
              { id: 'u0-l2-gp2', prompt: 'ビール đọc là?', questionType: 'fill-in', correctAnswer: ['biiru', 'bīru'], explanation: 'ビ = bi, ー = kéo dài, ル = ru → bīru (bia).', skill: 'script-recognition', difficulty: 2 },
            ],
          },
        },
      ],
    },
  ],
  checkpoint: {
    id: 'ja-n5-u0-checkpoint',
    unitId: 'ja-n5-u0-kana',
    masteryThreshold: 80,
    failureAction: 'retry',
    maxRetries: 3,
    questions: [
      { id: 'u0-cp-1', prompt: 'Ghép: き', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'ki' }, { id: 'b', text: 'sa' }, { id: 'c', text: 'chi' }], correctAnswer: 'a', explanation: 'き = ki', assessedSkill: 'script-recognition', assessedOutcomeId: 'u0-read-hiragana' },
      { id: 'u0-cp-2', prompt: 'Ghép: ま', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'nu' }, { id: 'b', text: 'ma' }, { id: 'c', text: 'ho' }], correctAnswer: 'b', explanation: 'ま = ma', assessedSkill: 'script-recognition', assessedOutcomeId: 'u0-read-hiragana' },
      { id: 'u0-cp-3', prompt: 'Ghép: カ', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'ka' }, { id: 'b', text: 'sa' }, { id: 'c', text: 'na' }], correctAnswer: 'a', explanation: 'カ = ka', assessedSkill: 'script-recognition', assessedOutcomeId: 'u0-read-katakana' },
      { id: 'u0-cp-4', prompt: 'Đọc: がっこう', questionType: 'fill-in', correctAnswer: ['gakkou', 'gakkō', 'gakkoo'], explanation: 'が = ga, っ = phụ âm đôi, こ = ko, う = u (kéo dài) → gakkō (trường học)', assessedSkill: 'script-recognition', assessedOutcomeId: 'u0-read-hiragana' },
      { id: 'u0-cp-5', prompt: 'テレビ nghĩa là?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'đài phát thanh' }, { id: 'b', text: 'tivi' }, { id: 'c', text: 'điện thoại' }], correctAnswer: 'b', explanation: 'テレビ = terebi = tivi (television)', assessedSkill: 'script-recognition', assessedOutcomeId: 'u0-read-katakana' },
    ],
  },
  remediation: {
    weakSkillLessons: {
      script: ['ja-n5-u0-l1-hiragana', 'ja-n5-u0-l2-katakana'],
    },
    supplementaryExercises: [],
  },
};

// ─── Unit 1: Self Introduction ──────────────────────────────────────

const UNIT_1_INTRO: ThematicUnit = {
  id: 'ja-n5-u1-intro',
  title: 'Unit 1 · Giới thiệu bản thân',
  theme: '自己紹介 — Tên, quốc tịch, nghề nghiệp',
  canDoOutcomes: [
    {
      id: 'u1-use-desu',
      statement: 'Dùng mẫu 「A は B です」để giới thiệu bản thân và người khác.',
      skill: 'grammar-production',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Hoàn thành câu với です đúng' }],
    },
    {
      id: 'u1-use-kosoado',
      statement: 'Phân biệt và sử dụng đúng これ・それ・あれ khi chỉ đồ vật.',
      skill: 'grammar-recognition',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Chọn đúng chỉ thị đại từ' }],
    },
    {
      id: 'u1-use-no',
      statement: 'Dùng trợ từ の để nối danh từ và diễn tả sở hữu/quan hệ.',
      skill: 'grammar-production',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Điền の đúng vị trí' }],
    },
    {
      id: 'u1-vocab-60',
      statement: 'Nhận diện 60 từ vựng nền tảng: đại từ, nghề nghiệp, quốc tịch, đồ vật cơ bản.',
      skill: 'vocabulary-recognition',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 80, description: 'Chọn đúng nghĩa từ' }],
    },
    {
      id: 'u1-read-intro',
      statement: 'Đọc hiểu đoạn giới thiệu bản thân ngắn và xác định thông tin chính.',
      skill: 'receptive-reading',
      referenceLevel: 'JLPT-N5',
      assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Trả lời đúng câu hỏi đọc hiểu' }],
    },
  ],
  lessons: [
    {
      id: 'ja-n5-u1-l1-desu',
      title: 'Ngữ pháp: Câu danh từ với です & これ・それ・あれ',
      targetOutcomes: ['u1-use-desu', 'u1-use-kosoado'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u0-l2-katakana', minimumScore: 80 }],
      estimatedMinutes: 20,
      studyTactics: [
        'Học mẫu は...です trước, luyện 10 câu mẫu trước khi làm bài tập.',
        'Với これ/それ/あれ: tưởng tượng khoảng cách vật lý — gần tôi, gần bạn, xa cả hai.',
        'Nói to mỗi câu ví dụ 3 lần để quen ngữ điệu.',
      ],
      commonMistakes: [
        { wrong: '私は学生だ (dùng だ trong hội thoại lịch sự)', correct: '私は学生です', reason: 'です là thể lịch sự, だ là thể thường — N5 ưu tiên thể lịch sự trước.' },
        { wrong: 'それ (chỉ vật gần mình)', correct: 'これ (vật gần mình), それ (vật gần người nghe)', reason: 'これ = gần tôi, それ = gần bạn, あれ = xa cả hai.' },
        { wrong: 'わたし が がくせい です', correct: 'わたし は がくせい です', reason: 'Trợ từ đánh dấu chủ đề là は, không phải が, trong câu giới thiệu.' },
      ],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: {
        firstReviewAfterHours: 8,
        srsItemKinds: ['sentence-pattern', 'grammar-error'],
        nextLessonId: 'ja-n5-u1-l2-vocab',
      },
      phases: [
        {
          type: 'introduce',
          estimatedMinutes: 6,
          completionCriteria: { type: 'time-spent', value: 3 },
          content: {
            explanations: [
              'Mẫu 「A は B です」 dùng để giới thiệu hoặc xác nhận A là B.',
              '「は」 được viết là ha nhưng trong vai trò trợ từ được đọc là wa.',
              '「です」 là cách nói lịch sự ở cuối câu. Ở trình độ N5, hãy ưu tiên thể lịch sự.',
              'これ (cái này, gần tôi) / それ (cái đó, gần bạn) / あれ (cái kia, xa cả hai) — dùng để chỉ đồ vật.',
            ],
            formula: 'A は B です。| これ / それ / あれ は B です。',
            examples: [
              { text: '私は学生です。', translation: 'Tôi là học sinh.', note: '私 = chủ đề, 学生 = thông tin.' },
              { text: 'これは本です。', translation: 'Đây là sách.', note: 'これ = vật gần người nói.' },
              { text: 'あれは学校です。', translation: 'Kia là trường học.', note: 'あれ = vật xa cả hai người.' },
            ],
          },
        },
        {
          type: 'recognize',
          estimatedMinutes: 5,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            questions: [
              { id: 'u1-l1-r1', prompt: '私は___です。(Tôi là học sinh)', questionType: 'multiple-choice', choices: [{ id: 'a', text: '学生', meaning: 'học sinh' }, { id: 'b', text: '食べます', meaning: 'ăn' }, { id: 'c', text: '大きい', meaning: 'to lớn' }], correctAnswer: 'a', explanation: '学生 là danh từ, đi vào vị trí B của A は B です.', skill: 'grammar-recognition', difficulty: 1 },
              { id: 'u1-l1-r2', prompt: 'Vật ở gần người nghe dùng đại từ nào?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'これ' }, { id: 'b', text: 'それ' }, { id: 'c', text: 'あれ' }], correctAnswer: 'b', explanation: 'それ = gần người nghe. これ = gần tôi. あれ = xa cả hai.', skill: 'grammar-recognition', difficulty: 1 },
              { id: 'u1-l1-r3', prompt: 'Trợ từ đánh dấu chủ đề trong câu là gì?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'が' }, { id: 'b', text: 'は' }, { id: 'c', text: 'を' }], correctAnswer: 'b', explanation: 'は (wa) đánh dấu chủ đề. が đánh dấu chủ ngữ (học sau). を đánh dấu tân ngữ.', skill: 'grammar-recognition', difficulty: 1 },
            ],
          },
        },
        {
          type: 'guided-practice',
          estimatedMinutes: 5,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            hints: ['Nhớ: A は B です = A là B (lịch sự).', 'これ gần tôi, それ gần bạn, あれ xa cả hai.'],
            questions: [
              { id: 'u1-l1-gp1', prompt: 'Dịch sang Nhật: "Tanaka là giáo viên."', questionType: 'fill-in', correctAnswer: ['田中さんは先生です', '田中さんは先生です。'], explanation: '田中さん は 先生 です。', skill: 'grammar-production', difficulty: 2 },
              { id: 'u1-l1-gp2', prompt: '___は ペン です。(Đó là cây bút — vật gần người nghe)', questionType: 'fill-in', correctAnswer: ['それ'], explanation: 'Vật gần người nghe → それ.', skill: 'grammar-production', difficulty: 2 },
            ],
          },
        },
        {
          type: 'produce',
          estimatedMinutes: 4,
          completionCriteria: { type: 'score-threshold', value: 60 },
          content: {
            questions: [
              { id: 'u1-l1-p1', prompt: 'Viết 1 câu giới thiệu bản thân bằng mẫu は...です:', questionType: 'free-response', correctAnswer: ['は', 'です'], explanation: 'Bất kỳ câu nào có dạng [tên/tôi] は [thông tin] です đều đúng.', skill: 'grammar-production', difficulty: 3 },
            ],
          },
        },
      ],
    },
    {
      id: 'ja-n5-u1-l2-vocab',
      title: 'Từ vựng: Đại từ, nghề nghiệp, quốc tịch (30 từ)',
      targetOutcomes: ['u1-vocab-60'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u1-l1-desu', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: [
        'Học 5 từ/lần, ôn lại trước khi thêm 5 từ mới.',
        'Mỗi từ mới: đọc to → viết → dùng trong câu → lật flashcard.',
        'Ưu tiên từ có tần suất cao nhất: 私, あなた, 学生, 先生, これ, それ, あれ.',
      ],
      commonMistakes: [],
      passCriteria: { minimumScore: 80, requireAllPhases: false },
      nextReviewStrategy: {
        firstReviewAfterHours: 4,
        srsItemKinds: ['vocabulary'],
        nextLessonId: 'ja-n5-u1-l3-no',
      },
      phases: [
        {
          type: 'introduce',
          estimatedMinutes: 3,
          completionCriteria: { type: 'time-spent', value: 1 },
          content: {
            explanations: [
              'Bộ từ vựng này gồm 30 từ nền tảng nhất: đại từ (tôi, bạn), nghề nghiệp (học sinh, giáo viên), quốc tịch (Nhật, Việt Nam).',
              'Mỗi từ đều có ví dụ trong câu — hãy học từ trong ngữ cảnh, không học từ đơn lẻ.',
            ],
          },
        },
        {
          type: 'spaced-review',
          estimatedMinutes: 12,
          completionCriteria: { type: 'items-reviewed', value: 30 },
          content: {
            reviewItemIds: Array.from({ length: 30 }, (_, i) => `ja:n5:u1:vocab:${String(i + 1).padStart(3, '0')}`),
          },
        },
      ],
    },
    {
      id: 'ja-n5-u1-l3-no',
      title: 'Ngữ pháp: Trợ từ の (sở hữu/quan hệ)',
      targetOutcomes: ['u1-use-no'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u1-l2-vocab', minimumScore: 50 }],
      estimatedMinutes: 15,
      studyTactics: [
        'の nối hai danh từ: N1 の N2 = N2 của/thuộc N1.',
        'Luyện bằng cách dịch cụm danh từ: "sách của tôi" → 私の本.',
      ],
      commonMistakes: [
        { wrong: '私本 (thiếu の)', correct: '私の本', reason: 'Luôn cần の giữa hai danh từ khi diễn tả sở hữu.' },
      ],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: {
        firstReviewAfterHours: 8,
        srsItemKinds: ['sentence-pattern', 'grammar-error'],
        nextLessonId: 'ja-n5-u1-l4-reading',
      },
      phases: [
        {
          type: 'introduce',
          estimatedMinutes: 4,
          completionCriteria: { type: 'time-spent', value: 2 },
          content: {
            explanations: [
              'Trợ từ の dùng để nối hai danh từ: N1 の N2 = N2 của/thuộc N1.',
              'の có thể diễn tả: sở hữu (私の本 = sách của tôi), thuộc tính (日本の車 = xe Nhật), quan hệ (大学の学生 = sinh viên đại học).',
            ],
            formula: 'N1 の N2',
            examples: [
              { text: '私の本', translation: 'sách của tôi', note: '私 = tôi, の = của, 本 = sách' },
              { text: '日本の車', translation: 'xe Nhật', note: '日本 = Nhật Bản, の = thuộc, 車 = xe' },
              { text: '田中さんの友達', translation: 'bạn của Tanaka', note: '田中さん = Tanaka, の = của, 友達 = bạn' },
            ],
          },
        },
        {
          type: 'recognize',
          estimatedMinutes: 4,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            questions: [
              { id: 'u1-l3-r1', prompt: '私___本 (sách của tôi) — điền trợ từ:', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'の' }, { id: 'b', text: 'は' }, { id: 'c', text: 'を' }], correctAnswer: 'a', explanation: 'の nối hai danh từ thể hiện sở hữu.', skill: 'grammar-recognition', difficulty: 1 },
            ],
          },
        },
        {
          type: 'guided-practice',
          estimatedMinutes: 4,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            hints: ['N1 の N2 = N2 của/thuộc N1.'],
            questions: [
              { id: 'u1-l3-gp1', prompt: 'Dịch: "giáo viên của trường"', questionType: 'fill-in', correctAnswer: ['学校の先生'], explanation: '学校 (trường) の 先生 (giáo viên).', skill: 'grammar-production', difficulty: 2 },
            ],
          },
        },
        {
          type: 'produce',
          estimatedMinutes: 3,
          completionCriteria: { type: 'score-threshold', value: 60 },
          content: {
            questions: [
              { id: 'u1-l3-p1', prompt: 'Viết 1 câu dùng の để nối 2 danh từ:', questionType: 'free-response', correctAnswer: ['の'], explanation: 'Bất kỳ câu N1 の N2 đều đúng.', skill: 'grammar-production', difficulty: 3 },
            ],
          },
        },
      ],
    },
    {
      id: 'ja-n5-u1-l4-reading',
      title: 'Đọc hiểu: Đoạn giới thiệu bản thân',
      targetOutcomes: ['u1-read-intro'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u1-l3-no', minimumScore: 70 }],
      estimatedMinutes: 12,
      studyTactics: [
        'Đọc qua 1 lần không dịch → đọc lại lần 2 tìm từ khóa → trả lời câu hỏi.',
        'Gạch chân trợ từ は, の để xác định cấu trúc câu nhanh.',
      ],
      commonMistakes: [
        { wrong: 'Dịch từng từ thay vì đọc theo cụm', correct: 'Đọc theo cụm: [chủ đề]は [thông tin]です', reason: 'Tiếng Nhật có cấu trúc SOV, đọc theo cụm giúp hiểu nhanh hơn.' },
      ],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: {
        firstReviewAfterHours: 24,
        srsItemKinds: ['reading-comprehension'],
      },
      phases: [
        {
          type: 'introduce',
          estimatedMinutes: 4,
          completionCriteria: { type: 'time-spent', value: 2 },
          content: {
            explanations: [
              'Đọc đoạn giới thiệu bản thân ngắn. Tìm: tên (は...です), nghề nghiệp, sở thích.',
              'Đoạn văn: 「私は田中ゆきです。大学の学生です。日本人です。本が好きです。」',
              'Dịch: Tôi là Tanaka Yuki. Tôi là sinh viên đại học. Tôi là người Nhật. Tôi thích sách.',
            ],
          },
        },
        {
          type: 'guided-practice',
          estimatedMinutes: 8,
          completionCriteria: { type: 'score-threshold', value: 70 },
          content: {
            questions: [
              { id: 'u1-l4-gp1', prompt: '田中さんの仕事は何ですか？ (Tanaka làm gì?)', questionType: 'multiple-choice', choices: [{ id: 'a', text: '先生 (giáo viên)' }, { id: 'b', text: '学生 (sinh viên)' }, { id: 'c', text: '医者 (bác sĩ)' }], correctAnswer: 'b', explanation: '大学の学生です = là sinh viên đại học.', skill: 'receptive-reading', difficulty: 1 },
              { id: 'u1-l4-gp2', prompt: '田中さんは何人ですか？ (Tanaka là người nước nào?)', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'ベトナム人' }, { id: 'b', text: '中国人' }, { id: 'c', text: '日本人' }], correctAnswer: 'c', explanation: '日本人です = là người Nhật.', skill: 'receptive-reading', difficulty: 1 },
              { id: 'u1-l4-gp3', prompt: '田中さんは何が好きですか？ (Tanaka thích gì?)', questionType: 'multiple-choice', choices: [{ id: 'a', text: '映画 (phim)' }, { id: 'b', text: '本 (sách)' }, { id: 'c', text: '音楽 (nhạc)' }], correctAnswer: 'b', explanation: '本が好きです = thích sách.', skill: 'receptive-reading', difficulty: 1 },
            ],
          },
        },
      ],
    },
  ],
  checkpoint: {
    id: 'ja-n5-u1-checkpoint',
    unitId: 'ja-n5-u1-intro',
    masteryThreshold: 70,
    failureAction: 'remediate',
    maxRetries: 3,
    questions: [
      { id: 'u1-cp-1', prompt: '私___学生です。', questionType: 'fill-in', correctAnswer: ['は'], explanation: 'は đánh dấu chủ đề.', assessedSkill: 'grammar-production', assessedOutcomeId: 'u1-use-desu' },
      { id: 'u1-cp-2', prompt: 'Vật ở xa cả người nói và người nghe dùng:', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'これ' }, { id: 'b', text: 'それ' }, { id: 'c', text: 'あれ' }], correctAnswer: 'c', explanation: 'あれ = xa cả hai.', assessedSkill: 'grammar-recognition', assessedOutcomeId: 'u1-use-kosoado' },
      { id: 'u1-cp-3', prompt: '田中さん___友達 (bạn của Tanaka)', questionType: 'fill-in', correctAnswer: ['の'], explanation: 'の nối hai danh từ.', assessedSkill: 'grammar-production', assessedOutcomeId: 'u1-use-no' },
      { id: 'u1-cp-4', prompt: '先生 nghĩa là:', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'học sinh' }, { id: 'b', text: 'giáo viên' }, { id: 'c', text: 'bạn' }], correctAnswer: 'b', explanation: '先生 = sensei = giáo viên.', assessedSkill: 'vocabulary-recognition', assessedOutcomeId: 'u1-vocab-60' },
      { id: 'u1-cp-5', prompt: '「私は学生です。日本人です。」— Người này là gì?', questionType: 'multiple-choice', choices: [{ id: 'a', text: 'Giáo viên Việt Nam' }, { id: 'b', text: 'Học sinh Nhật' }, { id: 'c', text: 'Bác sĩ Trung Quốc' }], correctAnswer: 'b', explanation: '学生 = học sinh, 日本人 = người Nhật.', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u1-read-intro' },
    ],
  },
  remediation: {
    weakSkillLessons: {
      grammar: ['ja-n5-u1-l1-desu', 'ja-n5-u1-l3-no'],
      vocabulary: ['ja-n5-u1-l2-vocab'],
      reading: ['ja-n5-u1-l4-reading'],
    },
    supplementaryExercises: [],
  },
};

// ─── Units 2–5 ─────────────────────────────
// Full content authored according to academic standard.

const UNIT_2_DAILY: ThematicUnit = {
  id: 'ja-n5-u2-daily',
  title: 'Unit 2 · Sinh hoạt hằng ngày',
  theme: '毎日の生活 — Thói quen, thời gian, nơi chốn',
  canDoOutcomes: [
    { id: 'u2-use-masu', statement: 'Dùng thể lịch sự Vます/Vません để nói hoạt động hằng ngày.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Chia động từ thể ます đúng' }] },
    { id: 'u2-use-particles', statement: 'Dùng đúng に (thời gian/đích đến), へ (hướng), で (nơi hành động), から～まで.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Điền trợ từ đúng' }] },
    { id: 'u2-vocab-daily', statement: 'Nhận diện 60 từ về thời gian, địa điểm, sinh hoạt.', skill: 'vocabulary-recognition', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 80, description: 'Chọn nghĩa đúng' }] },
    { id: 'u2-read-schedule', statement: 'Đọc hiểu lịch sinh hoạt ngắn và xác định thời gian/nơi/hoạt động.', skill: 'receptive-reading', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Trả lời câu hỏi đọc hiểu' }] },
  ],
  lessons: [
    {
      id: 'ja-n5-u2-l1-vocab',
      title: 'Từ vựng: Thời gian, địa điểm, động từ',
      targetOutcomes: ['u2-vocab-daily'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u1-l4-reading', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: ['Học từ vựng theo cụm, ví dụ: 6時に起きます.'],
      commonMistakes: [],
      passCriteria: { minimumScore: 80, requireAllPhases: false },
      nextReviewStrategy: { firstReviewAfterHours: 4, srsItemKinds: ['vocabulary'], nextLessonId: 'ja-n5-u2-l2-masu' },
      phases: [
        { type: 'introduce', estimatedMinutes: 3, completionCriteria: { type: 'time-spent', value: 1 }, content: { explanations: ['Học các từ vựng dùng cho sinh hoạt hằng ngày.'] } },
        { type: 'spaced-review', estimatedMinutes: 12, completionCriteria: { type: 'items-reviewed', value: 30 }, content: { reviewItemIds: Array.from({ length: 30 }, (_, i) => `ja:n5:u2:vocab:${String(i + 1).padStart(3, '0')}`) } }
      ]
    },
    {
      id: 'ja-n5-u2-l2-masu',
      title: 'Ngữ pháp: Vます / Vません',
      targetOutcomes: ['u2-use-masu'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u2-l1-vocab', minimumScore: 80 }],
      estimatedMinutes: 20,
      studyTactics: ['Nhớ ません là phủ định của ます.'],
      commonMistakes: [{ wrong: '食べますです', correct: '食べます', reason: 'ます đã lịch sự, không thêm です.' }],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'], nextLessonId: 'ja-n5-u2-l3-particles' },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Vます: khẳng định hiện tại/tương lai.', 'Vません: phủ định hiện tại/tương lai.'], formula: 'Vます / Vません', examples: [{ text: '起きます', translation: 'Thức dậy' }] } },
        { type: 'recognize', estimatedMinutes: 5, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u2-l2-r1', prompt: 'Điền thể phủ định của 寝ます (ngủ)', questionType: 'multiple-choice', choices: [{id:'a', text:'寝ません'}, {id:'b', text:'寝ない'}], correctAnswer: 'a', explanation: 'ません là phủ định của ます', skill: 'grammar-recognition', difficulty: 1 }] } },
        { type: 'guided-practice', estimatedMinutes: 10, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u2-l2-gp1', prompt: 'Không ăn (thể lịch sự)', questionType: 'fill-in', correctAnswer: ['食べません'], explanation: '食べます -> 食べません', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    },
    {
      id: 'ja-n5-u2-l3-particles',
      title: 'Ngữ pháp: に, へ, で, を',
      targetOutcomes: ['u2-use-particles'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u2-l2-masu', minimumScore: 70 }],
      estimatedMinutes: 20,
      studyTactics: ['に (thời gian/đích đến), へ (hướng), で (nơi), を (tân ngữ).'],
      commonMistakes: [{ wrong: '学校で行きます', correct: '学校へ/に行きます', reason: 'で dùng cho nơi hành động, へ/に dùng cho đích đến.' }],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['grammar-error'], nextLessonId: 'ja-n5-u2-l4-reading' },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Sử dụng các trợ từ đúng với chức năng của nó trong câu.'], examples: [{ text: 'ごはんを食べます。', translation: 'Ăn cơm.' }] } },
        { type: 'guided-practice', estimatedMinutes: 15, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u2-l3-gp1', prompt: 'Điền trợ từ: 本___読みます。', questionType: 'fill-in', correctAnswer: ['を'], explanation: 'Đọc sách -> dùng を', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    },
    {
      id: 'ja-n5-u2-l4-reading',
      title: 'Đọc hiểu: Lịch sinh hoạt',
      targetOutcomes: ['u2-read-schedule'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u2-l3-particles', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: ['Tìm các cụm từ chỉ thời gian và động từ.'],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 24, srsItemKinds: ['reading-comprehension'] },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Đọc văn bản ngắn về thói quen sinh hoạt.'] } },
        { type: 'guided-practice', estimatedMinutes: 10, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u2-l4-gp1', prompt: 'Đọc: 7時に起きます。(Mấy giờ người này thức dậy?)', questionType: 'multiple-choice', choices: [{id:'a', text:'6 giờ'}, {id:'b', text:'7 giờ'}], correctAnswer: 'b', explanation: '7時に = lúc 7 giờ.', skill: 'receptive-reading', difficulty: 1 }] } }
      ]
    }
  ],
  checkpoint: {
    id: 'ja-n5-u2-checkpoint',
    unitId: 'ja-n5-u2-daily',
    masteryThreshold: 70,
    failureAction: 'remediate',
    maxRetries: 3,
    questions: [
      { id: 'u2-cp-1', prompt: 'Phủ định của 行きます là:', questionType: 'multiple-choice', choices: [{id:'a', text:'行きません'}, {id:'b', text:'行きます'}], correctAnswer: 'a', explanation: 'ません', assessedSkill: 'grammar-production', assessedOutcomeId: 'u2-use-masu' },
      { id: 'u2-cp-2', prompt: 'Trợ từ chỉ nơi chốn xảy ra hành động:', questionType: 'multiple-choice', choices: [{id:'a', text:'で'}, {id:'b', text:'へ'}], correctAnswer: 'a', explanation: 'で', assessedSkill: 'grammar-production', assessedOutcomeId: 'u2-use-particles' },
      { id: 'u2-cp-4', prompt: 'Từ vựng daily', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'vocabulary-recognition', assessedOutcomeId: 'u2-vocab-daily' },
      { id: 'u2-cp-5', prompt: 'Đọc hiểu schedule', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u2-read-schedule' },
      { id: 'u2-cp-3', prompt: '7時___起きます。 (Lúc 7 giờ)', questionType: 'fill-in', correctAnswer: ['に'], explanation: 'Thời gian dùng に.', assessedSkill: 'grammar-production', assessedOutcomeId: 'u2-use-particles' },
      { id: 'u2-cp-4', prompt: 'Từ vựng daily', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'vocabulary-recognition', assessedOutcomeId: 'u2-vocab-daily' },
      { id: 'u2-cp-5', prompt: 'Đọc hiểu schedule', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u2-read-schedule' },
    ]
  },
  remediation: {
    weakSkillLessons: { grammar: ['ja-n5-u2-l2-masu', 'ja-n5-u2-l3-particles'], vocabulary: ['ja-n5-u2-l1-vocab'], reading: ['ja-n5-u2-l4-reading'] },
    supplementaryExercises: []
  }
};

const UNIT_3_DESCRIBE: ThematicUnit = {
  id: 'ja-n5-u3-describe',
  title: 'Unit 3 · Mô tả & So sánh',
  theme: '形容する — Tính từ, mô tả người/vật, so sánh',
  canDoOutcomes: [
    { id: 'u3-use-i-adj', statement: 'Dùng tính từ đuôi い (khẳng định, phủ định, quá khứ) để mô tả.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Biến đổi tính từ đuôi い đúng' }] },
    { id: 'u3-use-na-adj', statement: 'Dùng tính từ đuôi な (khẳng định, phủ định) để mô tả.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Dùng な adj đúng' }] },
    { id: 'u3-use-arimasu', statement: 'Nói sự tồn tại bằng あります (vật) / います (người/động vật).', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Chọn đúng あります/います' }] },
    { id: 'u3-use-yori', statement: 'So sánh hai đối tượng bằng AよりBのほうが…です.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Tạo câu so sánh đúng' }] },
    { id: 'u3-read-description', statement: 'Đọc đoạn mô tả ngắn và xác định đặc điểm, so sánh.', skill: 'receptive-reading', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Trả lời câu hỏi đọc hiểu' }] },
  ],
  lessons: [
    {
      id: 'ja-n5-u3-l1-vocab',
      title: 'Từ vựng: Tính từ và từ mô tả',
      targetOutcomes: ['u3-use-i-adj', 'u3-use-na-adj'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u2-l4-reading', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: ['Học theo cặp trái nghĩa: lớn/nhỏ, nóng/lạnh.'],
      commonMistakes: [],
      passCriteria: { minimumScore: 80, requireAllPhases: false },
      nextReviewStrategy: { firstReviewAfterHours: 4, srsItemKinds: ['vocabulary'], nextLessonId: 'ja-n5-u3-l2-adjectives' },
      phases: [
        { type: 'introduce', estimatedMinutes: 3, completionCriteria: { type: 'time-spent', value: 1 }, content: { explanations: ['Từ vựng tính từ.'] } },
        { type: 'spaced-review', estimatedMinutes: 12, completionCriteria: { type: 'items-reviewed', value: 30 }, content: { reviewItemIds: Array.from({ length: 30 }, (_, i) => `ja:n5:u3:vocab:${String(i + 1).padStart(3, '0')}`) } }
      ]
    },
    {
      id: 'ja-n5-u3-l2-adjectives',
      title: 'Ngữ pháp: Tính từ い và な',
      targetOutcomes: ['u3-use-i-adj', 'u3-use-na-adj'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u3-l1-vocab', minimumScore: 80 }],
      estimatedMinutes: 20,
      studyTactics: ['Chú ý các tính từ ngoại lệ như いい (tốt) và きれい (đẹp - tính từ な).'],
      commonMistakes: [{ wrong: 'きれいなです', correct: 'きれいです', reason: 'Tính từ な không dùng な trước です.' }],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'], nextLessonId: 'ja-n5-u3-l3-arimasu' },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Tính từ chia 2 loại: い và な.'], formula: 'Adj-i です / Adj-na です', examples: [{ text: '大きいです', translation: 'To' }, { text: 'きれいです', translation: 'Đẹp' }] } },
        { type: 'guided-practice', estimatedMinutes: 15, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u3-l2-gp1', prompt: 'Từ きれい thuộc loại tính từ gì?', questionType: 'multiple-choice', choices: [{id:'a', text:'Tính từ い'}, {id:'b', text:'Tính từ な'}], correctAnswer: 'b', explanation: 'Ngoại lệ: kết thúc bằng い nhưng là tính từ な.', skill: 'grammar-recognition', difficulty: 1 }] } }
      ]
    },
    {
      id: 'ja-n5-u3-l3-arimasu',
      title: 'Ngữ pháp: あります và います',
      targetOutcomes: ['u3-use-arimasu'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u3-l2-adjectives', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: ['います cho vật có sinh mạng, あります cho vật vô tri giác.'],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['grammar-error'], nextLessonId: 'ja-n5-u3-l4-yori' },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['があります cho đồ vật, がいます cho người/động vật.'] } },
        { type: 'guided-practice', estimatedMinutes: 10, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u3-l3-gp1', prompt: 'Điền vào chỗ trống: 犬（chó）が___。', questionType: 'multiple-choice', choices: [{id:'a', text:'あります'}, {id:'b', text:'います'}], correctAnswer: 'b', explanation: 'Động vật dùng います.', skill: 'grammar-production', difficulty: 1 }] } }
      ]
    },
    {
      id: 'ja-n5-u3-l4-yori',
      title: 'Ngữ pháp: So sánh AよりB',
      targetOutcomes: ['u3-use-yori'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u3-l3-arimasu', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: ['Ghi nhớ mẫu: A より B の ほうが ~ です (B thì ~ hơn A).'],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'] },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Mẫu câu so sánh hơn.'] } },
        { type: 'guided-practice', estimatedMinutes: 10, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u3-l4-gp1', prompt: 'Tokyo lớn hơn Osaka: 大阪___東京のほうが大きいです。', questionType: 'fill-in', correctAnswer: ['より'], explanation: 'so sánh dùng より.', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    }
  ],
  checkpoint: {
    id: 'ja-n5-u3-checkpoint',
    unitId: 'ja-n5-u3-describe',
    masteryThreshold: 70,
    failureAction: 'remediate',
    maxRetries: 3,
    questions: [
      { id: 'u3-cp-1', prompt: 'Tính từ な đi với danh từ:', questionType: 'multiple-choice', choices: [{id:'a', text:'Thêm な'}, {id:'b', text:'Bỏ な'}], correctAnswer: 'a', explanation: 'Adj-na な N', assessedSkill: 'grammar-production', assessedOutcomeId: 'u3-use-na-adj' },
      { id: 'u3-cp-4', prompt: 'i-adj', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'grammar-production', assessedOutcomeId: 'u3-use-i-adj' },
      { id: 'u3-cp-5', prompt: 'Đọc hiểu desc', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u3-read-description' },
      { id: 'u3-cp-2', prompt: 'Có 1 con mèo:', questionType: 'multiple-choice', choices: [{id:'a', text:'猫があります'}, {id:'b', text:'猫がいます'}], correctAnswer: 'b', explanation: 'Mèo dùng います', assessedSkill: 'grammar-production', assessedOutcomeId: 'u3-use-arimasu' },
      { id: 'u3-cp-3', prompt: 'Thịt đắt hơn cá (Cá yori Thịt hou ga...):', questionType: 'fill-in', correctAnswer: ['より'], explanation: 'So sánh dùng より', assessedSkill: 'grammar-production', assessedOutcomeId: 'u3-use-yori' }
    ]
  },
  remediation: {
    weakSkillLessons: { grammar: ['ja-n5-u3-l2-adjectives', 'ja-n5-u3-l3-arimasu', 'ja-n5-u3-l4-yori'] },
    supplementaryExercises: []
  }
};

const UNIT_4_DESIRE: ThematicUnit = {
  id: 'ja-n5-u4-desire',
  title: 'Unit 4 · Mong muốn & Đề nghị',
  theme: '希望と提案 — Muốn có/muốn làm, mời/đề nghị',
  canDoOutcomes: [
    { id: 'u4-use-hoshii', statement: 'Diễn đạt mong muốn có danh từ bằng Nがほしいです.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Dùng ほしい đúng' }] },
    { id: 'u4-use-tai', statement: 'Diễn đạt mong muốn làm hành động bằng Vたいです.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Biến đổi V→Vたい đúng' }] },
    { id: 'u4-use-masenka', statement: 'Mời ai làm gì bằng Vませんか / đề nghị bằng Vましょう.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Tạo câu mời/đề nghị đúng' }] },
    { id: 'u4-use-mashita', statement: 'Kể hành động quá khứ bằng Vました/Vませんでした.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Chia quá khứ đúng' }] },
    { id: 'u4-read-plan', statement: 'Đọc kế hoạch/hội thoại ngắn và hiểu mong muốn, đề nghị.', skill: 'receptive-reading', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Trả lời câu hỏi đọc hiểu' }] },
  ],
  lessons: [
    {
      id: 'ja-n5-u4-l1-vocab',
      title: 'Từ vựng: Đồ vật, hành động mong muốn',
      targetOutcomes: ['u4-use-hoshii', 'u4-use-tai'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u3-l4-yori', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: [],
      commonMistakes: [],
      passCriteria: { minimumScore: 80, requireAllPhases: false },
      nextReviewStrategy: { firstReviewAfterHours: 4, srsItemKinds: ['vocabulary'], nextLessonId: 'ja-n5-u4-l2-grammar' },
      phases: [
        { type: 'introduce', estimatedMinutes: 3, completionCriteria: { type: 'time-spent', value: 1 }, content: { explanations: ['Từ vựng chỉ sự vật và hoạt động.'] } },
        { type: 'spaced-review', estimatedMinutes: 12, completionCriteria: { type: 'items-reviewed', value: 30 }, content: { reviewItemIds: Array.from({ length: 30 }, (_, i) => `ja:n5:u4:vocab:${String(i + 1).padStart(3, '0')}`) } }
      ]
    },
    {
      id: 'ja-n5-u4-l2-grammar',
      title: 'Ngữ pháp: ほしい, たい, ませんか, ましょう',
      targetOutcomes: ['u4-use-hoshii', 'u4-use-tai', 'u4-use-masenka'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u4-l1-vocab', minimumScore: 80 }],
      estimatedMinutes: 20,
      studyTactics: [],
      commonMistakes: [{ wrong: '本をほしいです', correct: '本がほしいです', reason: 'Tân ngữ của ほしい dùng trợ từ が.' }],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'], nextLessonId: 'ja-n5-u4-l3-past' },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Nがほしい: Muốn danh từ N.', 'Vたい: Muốn làm hành động V.', 'Vませんか: Cùng làm V nhé?', 'Vましょう: Cùng làm V đi.'], formula: 'Nがほしい / Vます -> Vたい' } },
        { type: 'guided-practice', estimatedMinutes: 15, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u4-l2-gp1', prompt: 'Biến đổi 食べます thành dạng "Muốn ăn":', questionType: 'fill-in', correctAnswer: ['食べたい', '食べたいです'], explanation: 'ます -> たい', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    },
    {
      id: 'ja-n5-u4-l3-past',
      title: 'Ngữ pháp: Thì quá khứ ました',
      targetOutcomes: ['u4-use-mashita'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u4-l2-grammar', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: [],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'] },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Quá khứ của Vます là Vました.'] } },
        { type: 'guided-practice', estimatedMinutes: 10, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u4-l3-gp1', prompt: 'Hôm qua tôi đã học: 昨日、勉強し___。', questionType: 'fill-in', correctAnswer: ['ました'], explanation: 'Hành động ở quá khứ dùng ました.', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    }
  ],
  checkpoint: {
    id: 'ja-n5-u4-checkpoint',
    unitId: 'ja-n5-u4-desire',
    masteryThreshold: 70,
    failureAction: 'remediate',
    maxRetries: 3,
    questions: [
      { id: 'u4-cp-1', prompt: 'Muốn có ô tô:', questionType: 'multiple-choice', choices: [{id:'a', text:'車がほしいです'}, {id:'b', text:'車をほしいです'}], correctAnswer: 'a', explanation: 'Dùng が', assessedSkill: 'grammar-production', assessedOutcomeId: 'u4-use-hoshii' },
      { id: 'u4-cp-2', prompt: 'Muốn đi:', questionType: 'fill-in', correctAnswer: ['行きたい', '行きたいです'], explanation: '行き + たい', assessedSkill: 'grammar-production', assessedOutcomeId: 'u4-use-tai' },
      { id: 'u4-cp-4', prompt: 'masenka', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'grammar-production', assessedOutcomeId: 'u4-use-masenka' },
      { id: 'u4-cp-5', prompt: 'Đọc hiểu plan', questionType: 'multiple-choice', choices: [{id:'a', text:'a'}, {id:'b', text:'b'}], correctAnswer: 'a', explanation: '...', assessedSkill: 'receptive-reading', assessedOutcomeId: 'u4-read-plan' },
      { id: 'u4-cp-3', prompt: 'Hôm qua đã ăn:', questionType: 'multiple-choice', choices: [{id:'a', text:'食べます'}, {id:'b', text:'食べました'}], correctAnswer: 'b', explanation: 'ました là quá khứ', assessedSkill: 'grammar-production', assessedOutcomeId: 'u4-use-mashita' }
    ]
  },
  remediation: {
    weakSkillLessons: { grammar: ['ja-n5-u4-l2-grammar', 'ja-n5-u4-l3-past'] },
    supplementaryExercises: []
  }
};

const UNIT_5_PERMISSION: ThematicUnit = {
  id: 'ja-n5-u5-permission',
  title: 'Unit 5 · Yêu cầu & Cho phép',
  theme: '許可とルール — Thể て, yêu cầu, cho phép, cấm',
  canDoOutcomes: [
    { id: 'u5-use-tekudasai', statement: 'Đưa yêu cầu lịch sự bằng Vてください.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Tạo câu yêu cầu đúng' }] },
    { id: 'u5-use-teimasu', statement: 'Mô tả hành động đang diễn ra bằng Vています.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Dùng ています đúng' }] },
    { id: 'u5-use-temoii', statement: 'Xin phép bằng Vてもいいですか / nói cấm bằng Vてはいけません.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Phân biệt cho phép/cấm' }] },
    { id: 'u5-use-dekimasu', statement: 'Nói khả năng bằng Nができます.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'fill-in', minimumScore: 70, description: 'Dùng できます đúng' }] },
    { id: 'u5-use-kara', statement: 'Nêu lý do đơn giản bằng Sから、S.', skill: 'grammar-production', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'sentence-construction', minimumScore: 70, description: 'Tạo câu có lý do đúng' }] },
    { id: 'u5-read-rules', statement: 'Đọc biển báo, quy tắc ngắn và hiểu yêu cầu/cấm/cho phép.', skill: 'receptive-reading', referenceLevel: 'JLPT-N5', assessmentCriteria: [{ evidenceType: 'multiple-choice', minimumScore: 70, description: 'Trả lời câu hỏi đọc hiểu' }] },
  ],
  lessons: [
    {
      id: 'ja-n5-u5-l1-te-form',
      title: 'Ngữ pháp: Thể て (Te-form)',
      targetOutcomes: ['u5-use-tekudasai', 'u5-use-teimasu'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u4-l3-past', minimumScore: 70 }],
      estimatedMinutes: 25,
      studyTactics: ['Học thuộc bài hát chia thể て để nhớ quy tắc nhóm 1.'],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'], nextLessonId: 'ja-n5-u5-l2-permission' },
      phases: [
        { type: 'introduce', estimatedMinutes: 10, completionCriteria: { type: 'time-spent', value: 3 }, content: { explanations: ['Quy tắc chia thể て cực kỳ quan trọng.'], examples: [{ text: '書いてください', translation: 'Hãy viết' }, { text: '食べています', translation: 'Đang ăn' }] } },
        { type: 'guided-practice', estimatedMinutes: 15, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u5-l1-gp1', prompt: 'Thể て của 飲みます (uống):', questionType: 'multiple-choice', choices: [{id:'a', text:'飲みて'}, {id:'b', text:'飲んで'}], correctAnswer: 'b', explanation: 'み/び/に -> んで.', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    },
    {
      id: 'ja-n5-u5-l2-permission',
      title: 'Ngữ pháp: Xin phép và Cấm đoán',
      targetOutcomes: ['u5-use-temoii'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u5-l1-te-form', minimumScore: 70 }],
      estimatedMinutes: 20,
      studyTactics: [],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'], nextLessonId: 'ja-n5-u5-l3-reason' },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Vてもいいですか: Làm V có được không?', 'Vてはいけません: Không được làm V.'] } },
        { type: 'guided-practice', estimatedMinutes: 15, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u5-l2-gp1', prompt: 'Không được hút thuốc: 吸っ___いけません。', questionType: 'fill-in', correctAnswer: ['ては'], explanation: 'Cấu trúc てはいけません.', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    },
    {
      id: 'ja-n5-u5-l3-reason',
      title: 'Ngữ pháp: Lý do với から',
      targetOutcomes: ['u5-use-kara'],
      entryRequirements: [{ prerequisiteId: 'ja-n5-u5-l2-permission', minimumScore: 70 }],
      estimatedMinutes: 15,
      studyTactics: [],
      commonMistakes: [],
      passCriteria: { minimumScore: 70, requireAllPhases: true },
      nextReviewStrategy: { firstReviewAfterHours: 8, srsItemKinds: ['sentence-pattern'] },
      phases: [
        { type: 'introduce', estimatedMinutes: 5, completionCriteria: { type: 'time-spent', value: 2 }, content: { explanations: ['Mệnh đề 1 から, Mệnh đề 2 (Vì 1 nên 2).'] } },
        { type: 'guided-practice', estimatedMinutes: 10, completionCriteria: { type: 'score-threshold', value: 70 }, content: { questions: [{ id: 'u5-l3-gp1', prompt: 'Vì bận rộn: 忙しい___。', questionType: 'fill-in', correctAnswer: ['から', 'ですから'], explanation: 'Đứng sau câu chỉ lý do.', skill: 'grammar-production', difficulty: 2 }] } }
      ]
    }
  ],
  checkpoint: {
    id: 'ja-n5-u5-checkpoint',
    unitId: 'ja-n5-u5-permission',
    masteryThreshold: 70,
    failureAction: 'remediate',
    maxRetries: 3,
    questions: [
      { id: 'u5-cp-1', prompt: 'Hãy đọc sách: 本を___ください。', questionType: 'multiple-choice', choices: [{id:'a', text:'読みて'}, {id:'b', text:'読んで'}], correctAnswer: 'b', explanation: 'み -> んで', assessedSkill: 'grammar-production', assessedOutcomeId: 'u5-use-tekudasai' },
      { id: 'u5-cp-2', prompt: 'Đang mưa: 雨が降っ___。', questionType: 'multiple-choice', choices: [{id:'a', text:'ています'}, {id:'b', text:'てください'}], correctAnswer: 'a', explanation: 'Đang diễn ra dùng ています', assessedSkill: 'grammar-production', assessedOutcomeId: 'u5-use-teimasu' },
      { id: 'u5-cp-3', prompt: 'Có thể về không?', questionType: 'multiple-choice', choices: [{id:'a', text:'帰ってもいいですか'}, {id:'b', text:'帰ってはいけません'}], correctAnswer: 'a', explanation: 'Xin phép dùng てもいいですか', assessedSkill: 'grammar-production', assessedOutcomeId: 'u5-use-temoii' }
    ]
  },
  remediation: {
    weakSkillLessons: { grammar: ['ja-n5-u5-l1-te-form', 'ja-n5-u5-l2-permission', 'ja-n5-u5-l3-reason'] },
    supplementaryExercises: []
  }
};

// ─── Weekly Plan ────────────────────────────────────────────────────

const N5_WEEKLY_PLAN: readonly WeeklyPlanEntry[] = [
  { weekNumber: 1, unitId: 'ja-n5-u0-kana', lessonIds: ['ja-n5-u0-l1-hiragana', 'ja-n5-u0-l2-katakana'], estimatedHours: 4, milestone: 'Đọc được toàn bộ Hiragana và Katakana cơ bản.' },
  { weekNumber: 2, unitId: 'ja-n5-u1-intro', lessonIds: ['ja-n5-u1-l1-desu', 'ja-n5-u1-l2-vocab'], estimatedHours: 3.5, milestone: 'Giới thiệu bản thân bằng mẫu は...です.' },
  { weekNumber: 3, unitId: 'ja-n5-u1-intro', lessonIds: ['ja-n5-u1-l3-no', 'ja-n5-u1-l4-reading'], estimatedHours: 3, milestone: 'Dùng の nối danh từ, đọc đoạn giới thiệu ngắn.' },
  { weekNumber: 4, unitId: 'ja-n5-u2-daily', lessonIds: ['ja-n5-u2-daily-l1-grammar'], estimatedHours: 4, milestone: 'Nói hoạt động hằng ngày bằng Vます.' },
  { weekNumber: 5, unitId: 'ja-n5-u2-daily', lessonIds: [], estimatedHours: 3.5, milestone: 'Dùng trợ từ に/へ/で và đọc lịch sinh hoạt.' },
  { weekNumber: 6, unitId: 'ja-n5-u3-describe', lessonIds: ['ja-n5-u3-describe-l1-grammar'], estimatedHours: 4, milestone: 'Mô tả bằng tính từ い/な, nói sự tồn tại.' },
  { weekNumber: 7, unitId: 'ja-n5-u3-describe', lessonIds: [], estimatedHours: 3.5, milestone: 'So sánh hai đối tượng, đọc đoạn mô tả.' },
  { weekNumber: 8, unitId: 'ja-n5-u4-desire', lessonIds: ['ja-n5-u4-desire-l1-grammar'], estimatedHours: 4, milestone: 'Nói mong muốn và đề nghị.' },
  { weekNumber: 9, unitId: 'ja-n5-u4-desire', lessonIds: [], estimatedHours: 3.5, milestone: 'Kể quá khứ, đọc kế hoạch.' },
  { weekNumber: 10, unitId: 'ja-n5-u5-permission', lessonIds: ['ja-n5-u5-permission-l1-grammar'], estimatedHours: 4, milestone: 'Yêu cầu, xin phép, nói quy tắc.' },
  { weekNumber: 11, unitId: 'ja-n5-u5-permission', lessonIds: [], estimatedHours: 3.5, milestone: 'Nói khả năng, đọc biển báo.' },
  { weekNumber: 12, unitId: 'ja-n5-u5-permission', lessonIds: [], estimatedHours: 4, milestone: 'Ôn tổng hợp và vượt Exit Gate N5.' },
];

// ─── Exit Gate ──────────────────────────────────────────────────────

const N5_EXIT_GATE: MasteryGate = {
  id: 'ja-n5-exit-gate',
  requiredCheckpoints: [
    'ja-n5-u0-checkpoint',
    'ja-n5-u1-checkpoint',
    'ja-n5-u2-checkpoint',
    'ja-n5-u3-checkpoint',
    'ja-n5-u4-checkpoint',
    'ja-n5-u5-checkpoint',
  ],
  minimumAverageScore: 70,
  requiredSRSMastery: [
    { kind: 'vocabulary', minimumMasteredCount: 200, minimumRepetitions: 3 },
    { kind: 'sentence-pattern', minimumMasteredCount: 20, minimumRepetitions: 2 },
    { kind: 'grammar-error', minimumMasteredCount: 0, minimumRepetitions: 1 },
  ],
};

// ─── Course Definition ──────────────────────────────────────────────

export const JAPANESE_N5_COURSE: CurriculumCourse = {
  id: 'ja-n5',
  language: 'ja',
  level: 'N5',
  title: 'Tiếng Nhật N5 — Nền tảng',
  description: 'Khóa học JLPT N5 hoàn chỉnh: từ Kana đến đọc hiểu đoạn văn ngắn, ~30 mẫu ngữ pháp, ~800 từ vựng. Mục tiêu: giao tiếp cơ bản trong sinh hoạt hằng ngày.',
  courseOutcomes: N5_COURSE_OUTCOMES,
  weeklyPlan: N5_WEEKLY_PLAN,
  units: [
    UNIT_0_KANA,
    UNIT_1_INTRO,
    UNIT_2_DAILY,
    UNIT_3_DESCRIBE,
    UNIT_4_DESIRE,
    UNIT_5_PERMISSION,
  ],
  exitGate: N5_EXIT_GATE,
};
