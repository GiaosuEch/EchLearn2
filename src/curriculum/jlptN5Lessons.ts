/**
 * Authored JLPT N5 starter lessons.
 *
 * This product-pack content is intentionally static: no runtime generation,
 * remote content lookup, or randomized answer construction is permitted.
 */
export type JapaneseSegment = Readonly<{
  base: string;
  ruby?: string;
}>;

export type LessonCompletion = Readonly<{
  percent: number;
  completed: boolean;
}>;

export type GrammarQuestion = Readonly<{
  id: string;
  prompt: readonly JapaneseSegment[];
  choices: readonly Readonly<{ id: string; text: readonly JapaneseSegment[]; meaning: string }>[];
  correctChoiceId: string;
  analysis: string;
}>;

export type ReadingQuestion = Readonly<{
  id: string;
  question: string;
  choices: readonly Readonly<{ id: string; label: string }>[];
  correctChoiceId: string;
  analysis: string;
}>;

export type GrammarLesson = Readonly<{
  id: string;
  level: 'N5';
  skill: 'grammar';
  title: string;
  japaneseTitle: readonly JapaneseSegment[];
  explanation: readonly string[];
  formula: readonly JapaneseSegment[];
  examples: readonly Readonly<{ japanese: readonly JapaneseSegment[]; translation: string; note: string }>[];
  questions: readonly GrammarQuestion[];
}>;

export type ReadingLesson = Readonly<{
  id: string;
  level: 'N5';
  skill: 'reading';
  title: string;
  japaneseTitle: readonly JapaneseSegment[];
  introduction: string;
  passage: readonly JapaneseSegment[];
  translation: string;
  questions: readonly ReadingQuestion[];
}>;

export type JLPTN5Lesson = GrammarLesson | ReadingLesson;

export const JLPT_N5_LESSONS = {
  'grammar-1': {
    id: 'grammar-1',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 1 · Câu danh từ với です',
    japaneseTitle: [{ base: '名詞文', ruby: 'めいしぶん' }, { base: 'です' }],
    explanation: [
      'Mẫu 「A は B です」 dùng để giới thiệu hoặc xác nhận A là B. 「は」 được viết là ha nhưng trong vai trò trợ từ được đọc là wa.',
      '「です」 là cách nói lịch sự ở cuối câu. Ở trình độ N5, hãy ưu tiên nhận ra thứ tự chủ đề → thông tin → です trước khi dịch từng từ.',
    ],
    formula: [
      { base: 'A' }, { base: 'は' }, { base: 'B' }, { base: 'です' },
    ],
    examples: [
      {
        japanese: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '学生', ruby: 'がくせい' }, { base: 'です' }, { base: '。' }],
        translation: 'Tôi là học sinh / sinh viên.',
        note: '「私」 là chủ đề; 「学生」 là thông tin được giới thiệu.',
      },
      {
        japanese: [{ base: '田中', ruby: 'たなか' }, { base: 'さん' }, { base: 'は' }, { base: '先生', ruby: 'せんせい' }, { base: 'です' }, { base: '。' }],
        translation: 'Anh/chị Tanaka là giáo viên.',
        note: 'Thêm 「さん」 sau tên người để lịch sự.',
      },
      {
        japanese: [{ base: 'これ' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }],
        translation: 'Đây là một quyển sách.',
        note: '「これ」 là “đây/cái này”, vẫn theo cùng công thức.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '___' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '学生', ruby: 'がくせい' }], meaning: 'học sinh / sinh viên' },
          { id: 'b', text: [{ base: '食', ruby: 'た' }, { base: 'べます' }], meaning: 'ăn' },
          { id: 'c', text: [{ base: '大', ruby: 'おお' }, { base: 'きい' }], meaning: 'to lớn' },
        ],
        correctChoiceId: 'a',
        analysis: '「学生」 là danh từ nên đi tự nhiên vào vị trí B của mẫu A は B です. 「食べます」 là động từ, còn 「大きい」 là tính từ.',
      },
      {
        id: 'q2',
        prompt: [{ base: 'これ' }, { base: 'は' }, { base: '___' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '本', ruby: 'ほん' }], meaning: 'sách' },
          { id: 'b', text: [{ base: '行', ruby: 'い' }, { base: 'きます' }], meaning: 'đi' },
          { id: 'c', text: [{ base: '静', ruby: 'しず' }, { base: 'か' }], meaning: 'yên tĩnh' },
        ],
        correctChoiceId: 'a',
        analysis: 'Câu này xác định một đồ vật: “Đây là sách.” Vì vậy cần danh từ 「本」.',
      },
      {
        id: 'q3',
        prompt: [{ base: '「Tôi là giáo viên」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '先生', ruby: 'せんせい' }, { base: 'です' }, { base: '。' }], meaning: 'Tôi là giáo viên.' },
          { id: 'b', text: [{ base: '私', ruby: 'わたし' }, { base: 'を' }, { base: '先生', ruby: 'せんせい' }, { base: 'です' }, { base: '。' }], meaning: 'Sai trợ từ.' },
          { id: 'c', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '先生', ruby: 'せんせい' }, { base: 'ます' }, { base: '。' }], meaning: 'Sai kết thúc câu.' },
        ],
        correctChoiceId: 'a',
        analysis: 'Câu danh từ lịch sự dùng 「は」 để nêu chủ đề và kết thúc bằng 「です」. 「を」 đánh dấu tân ngữ, còn 「ます」 đi với động từ.',
      },
    ],
  },
  'reading-1': {
    id: 'reading-1',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 1 · Buổi sáng của Yuki',
    japaneseTitle: [{ base: 'ゆきさんの朝', ruby: 'ゆきさんのあさ' }],
    introduction: 'Đọc một lần để nắm ý chính, sau đó dùng furigana để kiểm tra cách đọc của từ có kanji.',
    passage: [
      { base: 'ゆき' }, { base: 'さん' }, { base: 'は' }, { base: '毎朝', ruby: 'まいあさ' }, { base: '七時', ruby: 'しちじ' }, { base: 'に' }, { base: '起', ruby: 'お' }, { base: 'きます' }, { base: '。' },
      { base: '朝', ruby: 'あさ' }, { base: 'ごはん' }, { base: 'は' }, { base: 'パン' }, { base: 'と' }, { base: '牛乳', ruby: 'ぎゅうにゅう' }, { base: 'です' }, { base: '。' },
      { base: '八時', ruby: 'はちじ' }, { base: 'に' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' },
      { base: '学校', ruby: 'がっこう' }, { base: 'で' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' },
    ],
    translation: 'Mỗi sáng Yuki dậy lúc bảy giờ. Bữa sáng là bánh mì và sữa. Lúc tám giờ, bạn ấy đi đến trường và học tiếng Nhật ở đó.',
    questions: [
      {
        id: 'q1',
        question: 'Yuki thức dậy lúc mấy giờ?',
        choices: [{ id: 'a', label: '7 giờ' }, { id: 'b', label: '8 giờ' }, { id: 'c', label: '9 giờ' }],
        correctChoiceId: 'a',
        analysis: 'Câu đầu ghi rõ 「毎朝七時に起きます」: Yuki thức dậy lúc 7 giờ. 8 giờ là thời điểm đến trường.',
      },
      {
        id: 'q2',
        question: 'Bữa sáng của Yuki gồm những gì?',
        choices: [{ id: 'a', label: 'Cơm và trà' }, { id: 'b', label: 'Bánh mì và sữa' }, { id: 'c', label: 'Mì và cà phê' }],
        correctChoiceId: 'b',
        analysis: 'Đoạn văn nói 「パンと牛乳です」. 「と」 nối hai danh từ: bánh mì và sữa.',
      },
      {
        id: 'q3',
        question: 'Yuki làm gì ở trường?',
        choices: [{ id: 'a', label: 'Học tiếng Nhật' }, { id: 'b', label: 'Ăn sáng' }, { id: 'c', label: 'Đi ngủ' }],
        correctChoiceId: 'a',
        analysis: 'Câu cuối là 「学校で日本語を勉強します」: bạn ấy học tiếng Nhật ở trường.',
      },
    ],
  },
  'grammar-2': {
    id: 'grammar-2',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 2 · これ・それ・あれ',
    japaneseTitle: [{ base: 'これ・それ・あれ' }],
    explanation: [
      'Ba từ này dùng để chỉ đồ vật. 「これ」 là vật gần người nói, 「それ」 là vật gần người nghe, còn 「あれ」 là vật xa cả hai người.',
      'Sau khi chọn đúng từ chỉ định, bạn vẫn có thể dùng mẫu quen thuộc 「これ は 本 です」 để nói vật đó là gì.',
    ],
    formula: [{ base: 'これ／それ／あれ' }, { base: 'は' }, { base: '名詞', ruby: 'めいし' }, { base: 'です' }],
    examples: [
      {
        japanese: [{ base: 'これ' }, { base: 'は' }, { base: '私', ruby: 'わたし' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }],
        translation: 'Đây là sách của tôi.',
        note: 'Quyển sách ở gần người nói nên dùng 「これ」.',
      },
      {
        japanese: [{ base: 'それ' }, { base: 'は' }, { base: '何', ruby: 'なん' }, { base: 'です' }, { base: 'か' }, { base: '。' }],
        translation: 'Đó là gì?',
        note: 'Dùng 「それ」 khi hỏi về vật gần người nghe.',
      },
      {
        japanese: [{ base: 'あれ' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'です' }, { base: '。' }],
        translation: 'Kia là trường học.',
        note: 'Ngôi trường ở xa cả hai người nên dùng 「あれ」.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '「Đây là bút của tôi」' }, { base: 'に' }, { base: '合', ruby: 'あ' }, { base: 'う' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: 'これ' }, { base: 'は' }, { base: '私', ruby: 'わたし' }, { base: 'の' }, { base: 'ペン' }, { base: 'です' }, { base: '。' }], meaning: 'Đây là bút của tôi.' },
          { id: 'b', text: [{ base: 'それ' }, { base: 'を' }, { base: '私', ruby: 'わたし' }, { base: 'の' }, { base: 'ペン' }, { base: 'です' }, { base: '。' }], meaning: 'Sai trợ từ.' },
          { id: 'c', text: [{ base: 'あれ' }, { base: 'は' }, { base: '私', ruby: 'わたし' }, { base: 'の' }, { base: 'ペン' }, { base: 'ます' }, { base: '。' }], meaning: 'Sai kết thúc câu.' },
        ],
        correctChoiceId: 'a',
        analysis: '「これ」 chỉ vật gần người nói. Câu danh từ giữ 「は」 và kết thúc bằng 「です」.',
      },
      {
        id: 'q2',
        prompt: [{ base: '相手', ruby: 'あいて' }, { base: 'の' }, { base: '近', ruby: 'ちか' }, { base: 'くにある' }, { base: '物', ruby: 'もの' }, { base: 'は' }, { base: '___' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'これ' }], meaning: 'gần người nói' },
          { id: 'b', text: [{ base: 'それ' }], meaning: 'gần người nghe' },
          { id: 'c', text: [{ base: 'あれ' }], meaning: 'xa cả hai' },
        ],
        correctChoiceId: 'b',
        analysis: 'Vật gần người nghe dùng 「それ」. Đây là điểm phân biệt cốt lõi của ba từ chỉ định.',
      },
      {
        id: 'q3',
        prompt: [{ base: '遠', ruby: 'とお' }, { base: 'くにある' }, { base: '学校', ruby: 'がっこう' }, { base: 'は' }, { base: '___' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'これ' }], meaning: 'gần người nói' },
          { id: 'b', text: [{ base: 'それ' }], meaning: 'gần người nghe' },
          { id: 'c', text: [{ base: 'あれ' }], meaning: 'xa cả hai' },
        ],
        correctChoiceId: 'c',
        analysis: 'Vị trí xa cả người nói lẫn người nghe cần 「あれ」.',
      },
    ],
  },
  'reading-2': {
    id: 'reading-2',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 2 · Ở cửa hàng',
    japaneseTitle: [{ base: '店', ruby: 'みせ' }, { base: 'で' }],
    introduction: 'Tìm vật mà người nói muốn mua và nhận diện từ chỉ định trong một hội thoại ngắn.',
    passage: [
      { base: '山田', ruby: 'やまだ' }, { base: 'さん' }, { base: 'と' }, { base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: '店', ruby: 'みせ' }, { base: 'にいます' }, { base: '。' },
      { base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: '赤', ruby: 'あか' }, { base: 'い' }, { base: 'ペン' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' },
      { base: '山田', ruby: 'やまだ' }, { base: 'さん' }, { base: 'は' }, { base: '「それ' }, { base: 'は' }, { base: 'いくらですか」' }, { base: 'と' }, { base: '聞', ruby: 'き' }, { base: 'きます' }, { base: '。' },
      { base: '店員', ruby: 'てんいん' }, { base: 'は' }, { base: '「五百円', ruby: 'ごひゃくえん' }, { base: 'です」' }, { base: 'と' }, { base: '言', ruby: 'い' }, { base: 'います' }, { base: '。' },
    ],
    translation: 'Yamada và Mina đang ở cửa hàng. Mina nhìn một cây bút đỏ. Yamada hỏi: “Cái đó giá bao nhiêu?” Nhân viên nói: “500 yên.”',
    questions: [
      {
        id: 'q1',
        question: 'Mina đang xem vật gì?',
        choices: [{ id: 'a', label: 'Một cây bút đỏ' }, { id: 'b', label: 'Một quyển sách' }, { id: 'c', label: 'Một cái túi' }],
        correctChoiceId: 'a',
        analysis: 'Câu thứ hai ghi 「赤いペンを見ます」: Mina nhìn một cây bút đỏ.',
      },
      {
        id: 'q2',
        question: '「それ」 trong câu hỏi của Yamada chỉ vật nào?',
        choices: [{ id: 'a', label: 'Cây bút Mina đang nhìn' }, { id: 'b', label: 'Cửa hàng' }, { id: 'c', label: 'Yamada' }],
        correctChoiceId: 'a',
        analysis: 'Yamada hỏi ngay sau khi Mina nhìn bút đỏ. 「それ」 chỉ đồ vật gần Mina/người nghe trong ngữ cảnh này.',
      },
      {
        id: 'q3',
        question: 'Cây bút có giá bao nhiêu?',
        choices: [{ id: 'a', label: '100 yên' }, { id: 'b', label: '500 yên' }, { id: 'c', label: '1.000 yên' }],
        correctChoiceId: 'b',
        analysis: 'Nhân viên nói 「五百円です」, nghĩa là 500 yên.',
      },
    ],
  },
  'grammar-3': {
    id: 'grammar-3',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 3 · N に 行きます',
    japaneseTitle: [{ base: '場所', ruby: 'ばしょ' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }],
    explanation: [
      'Khi muốn nói điểm đến, đặt địa điểm trước 「に」 rồi dùng động từ di chuyển: 「行きます」 (đi), 「来ます」 (đến) hoặc 「帰ります」 (về).',
      '「に」 trả lời cho câu hỏi “đến đâu?”. Trợ từ 「へ」 cũng thường dùng với nghĩa này, nhưng ở bài này hãy nắm chắc khuôn N に 行きます trước.',
    ],
    formula: [{ base: '場所', ruby: 'ばしょ' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます／来', ruby: 'き' }, { base: 'ます／帰', ruby: 'かえ' }, { base: 'ります' }],
    examples: [
      {
        japanese: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }],
        translation: 'Tôi đi đến trường.',
        note: '「学校」 là điểm đến nên đứng trước 「に」.',
      },
      {
        japanese: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '来', ruby: 'き' }, { base: 'ます' }, { base: '。' }],
        translation: 'Bạn tôi đến nhà.',
        note: 'Động từ thay đổi thành 「来ます」, nhưng vai trò đánh dấu điểm đến của 「に」 không đổi.',
      },
      {
        japanese: [{ base: '夜', ruby: 'よる' }, { base: 'に' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'ります' }, { base: '。' }],
        translation: 'Buổi tối tôi về nhà.',
        note: 'Câu có thể có một 「に」 cho thời điểm và một 「に」 cho điểm đến.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: '___' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'に' }], meaning: 'đến / tới (điểm đến)' },
          { id: 'b', text: [{ base: 'を' }], meaning: 'đánh dấu tân ngữ' },
          { id: 'c', text: [{ base: 'と' }], meaning: 'và / với' },
        ],
        correctChoiceId: 'a',
        analysis: '「学校」 là nơi người nói đi tới, nên dùng 「に」 trước 「行きます」. 「を」 không đánh dấu điểm đến.',
      },
      {
        id: 'q2',
        prompt: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '___' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '来', ruby: 'き' }, { base: 'ます' }], meaning: 'đến' },
          { id: 'b', text: [{ base: '本', ruby: 'ほん' }], meaning: 'sách' },
          { id: 'c', text: [{ base: '学生', ruby: 'がくせい' }], meaning: 'học sinh / sinh viên' },
        ],
        correctChoiceId: 'a',
        analysis: 'Sau địa điểm và 「に」 cần một động từ di chuyển. 「来ます」 diễn tả “đến”.',
      },
      {
        id: 'q3',
        prompt: [{ base: '「Tôi về nhà」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'ります' }, { base: '。' }], meaning: 'Tôi về nhà.' },
          { id: 'b', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'を' }, { base: '帰', ruby: 'かえ' }, { base: 'ります' }, { base: '。' }], meaning: 'Sai trợ từ cho điểm đến.' },
          { id: 'c', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }], meaning: 'Sai động từ.' },
        ],
        correctChoiceId: 'a',
        analysis: 'Điểm đến 「家」 đi với 「に」; hành động “về” là 「帰ります」.',
      },
    ],
  },
  'reading-3': {
    id: 'reading-3',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 3 · Lịch trình thứ Bảy',
    japaneseTitle: [{ base: '土曜日', ruby: 'どようび' }, { base: 'の' }, { base: '予定', ruby: 'よてい' }],
    introduction: 'Đọc các mốc thời gian và chú ý mỗi địa điểm đứng trước trợ từ 「に」 như thế nào.',
    passage: [
      { base: '土曜日', ruby: 'どようび' }, { base: 'の' }, { base: '朝', ruby: 'あさ' }, { base: '、' }, { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '九時', ruby: 'くじ' }, { base: 'に' }, { base: '図書館', ruby: 'としょかん' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' },
      { base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' },
      { base: '午後', ruby: 'ごご' }, { base: '三時', ruby: 'さんじ' }, { base: 'に' }, { base: '友達', ruby: 'ともだち' }, { base: 'の' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' },
      { base: '夜', ruby: 'よる' }, { base: '、' }, { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'ります' }, { base: '。' },
    ],
    translation: 'Sáng thứ Bảy, Ken đến thư viện lúc 9 giờ. Ở thư viện, bạn ấy đọc sách tiếng Nhật. Lúc 3 giờ chiều, bạn ấy đi đến nhà bạn. Buổi tối, Ken về nhà.',
    questions: [
      {
        id: 'q1',
        question: 'Lúc 9 giờ Ken đi đâu?',
        choices: [{ id: 'a', label: 'Đến thư viện' }, { id: 'b', label: 'Đến nhà bạn' }, { id: 'c', label: 'Về nhà' }],
        correctChoiceId: 'a',
        analysis: 'Câu đầu ghi 「九時に図書館に行きます」: lúc 9 giờ Ken đi đến thư viện.',
      },
      {
        id: 'q2',
        question: 'Ken làm gì ở thư viện?',
        choices: [{ id: 'a', label: 'Đọc sách tiếng Nhật' }, { id: 'b', label: 'Uống sữa' }, { id: 'c', label: 'Mua bút' }],
        correctChoiceId: 'a',
        analysis: 'Câu thứ hai là 「図書館で日本語の本を読みます」, nghĩa là Ken đọc sách tiếng Nhật ở thư viện.',
      },
      {
        id: 'q3',
        question: 'Sau khi đến nhà bạn lúc 3 giờ, Ken về nhà khi nào?',
        choices: [{ id: 'a', label: 'Buổi sáng' }, { id: 'b', label: 'Buổi tối' }, { id: 'c', label: 'Lúc 9 giờ' }],
        correctChoiceId: 'b',
        analysis: 'Câu cuối bắt đầu bằng 「夜」 và nói Ken 「家に帰ります」, tức là về nhà vào buổi tối.',
      },
    ],
  },
  'grammar-4': {
    id: 'grammar-4',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 4 · Danh từ với の',
    japaneseTitle: [{ base: '名詞', ruby: 'めいし' }, { base: 'の' }, { base: '名詞', ruby: 'めいし' }],
    explanation: [
      'Trợ từ 「の」 nối hai danh từ. Cụm đứng trước bổ nghĩa hoặc thuộc về danh từ đứng sau: 「私の本」 là “sách của tôi”, 「日本語の先生」 là “giáo viên tiếng Nhật”.',
      'Hãy đọc từ phải sang trái khi dịch cụm danh từ: trong 「学校の先生」, danh từ chính là 「先生」; phần 「学校の」 cho biết giáo viên đó thuộc trường học.',
    ],
    formula: [{ base: 'N1' }, { base: 'の' }, { base: 'N2' }],
    examples: [
      {
        japanese: [{ base: 'これ' }, { base: 'は' }, { base: '私', ruby: 'わたし' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }],
        translation: 'Đây là sách của tôi.',
        note: '「私の」 bổ nghĩa cho 「本」.',
      },
      {
        japanese: [{ base: 'あれ' }, { base: 'は' }, { base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '先生', ruby: 'せんせい' }, { base: 'です' }, { base: '。' }],
        translation: 'Kia là giáo viên tiếng Nhật.',
        note: '「日本語の先生」 nghĩa là giáo viên dạy tiếng Nhật, không phải “tiếng Nhật của giáo viên”.',
      },
      {
        japanese: [{ base: '学校', ruby: 'がっこう' }, { base: 'の' }, { base: '図書館', ruby: 'としょかん' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きいです' }, { base: '。' }],
        translation: 'Thư viện của trường lớn.',
        note: '「学校の図書館」 liên kết nơi sở hữu với danh từ chính là thư viện.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '私', ruby: 'わたし' }, { base: '___' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'の' }], meaning: 'của / liên kết danh từ' },
          { id: 'b', text: [{ base: 'を' }], meaning: 'đánh dấu tân ngữ' },
          { id: 'c', text: [{ base: 'に' }], meaning: 'đến / tại thời điểm' },
        ],
        correctChoiceId: 'a',
        analysis: '「私」 và 「本」 đều là danh từ. Dùng 「の」 để tạo cụm “sách của tôi”.',
      },
      {
        id: 'q2',
        prompt: [{ base: '「Giáo viên tiếng Nhật」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '語', ruby: 'ご' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '先生', ruby: 'せんせい' }], meaning: 'giáo viên tiếng Nhật' },
          { id: 'b', text: [{ base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '先生', ruby: 'せんせい' }], meaning: 'sai trợ từ' },
          { id: 'c', text: [{ base: '先生', ruby: 'せんせい' }, { base: 'の' }, { base: '日本語', ruby: 'にほんご' }], meaning: 'tiếng Nhật của giáo viên' },
        ],
        correctChoiceId: 'a',
        analysis: 'Danh từ bổ nghĩa đứng trước 「の」. 「日本語の先生」 là giáo viên dạy tiếng Nhật.',
      },
      {
        id: 'q3',
        prompt: [{ base: '学校', ruby: 'がっこう' }, { base: 'の' }, { base: '___' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きいです' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '図書館', ruby: 'としょかん' }], meaning: 'thư viện' },
          { id: 'b', text: [{ base: '帰', ruby: 'かえ' }, { base: 'ります' }], meaning: 'về' },
          { id: 'c', text: [{ base: '忙', ruby: 'いそが' }, { base: 'しい' }], meaning: 'bận' },
        ],
        correctChoiceId: 'a',
        analysis: 'Sau 「学校の」 cần một danh từ được bổ nghĩa. 「図書館」 tạo cụm “thư viện của trường”.',
      },
    ],
  },
  'reading-4': {
    id: 'reading-4',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 4 · Sách của Mina',
    japaneseTitle: [{ base: 'ミナ' }, { base: 'さん' }, { base: 'の' }, { base: '本', ruby: 'ほん' }],
    introduction: 'Tìm danh từ chính trong từng cụm có 「の」 và dùng ngữ cảnh để xác định mối quan hệ giữa các đồ vật, người và nơi chốn.',
    passage: [
      { base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '学生', ruby: 'がくせい' }, { base: 'です' }, { base: '。' },
      { base: 'ミナ' }, { base: 'さん' }, { base: 'の' }, { base: 'かばん' }, { base: 'に' }, { base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: 'あります' }, { base: '。' },
      { base: 'その' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'の' }, { base: '図書館', ruby: 'としょかん' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' },
      { base: '今日', ruby: 'きょう' }, { base: '、' }, { base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: 'その' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' },
    ],
    translation: 'Mina là học viên tiếng Nhật. Trong túi của Mina có một quyển sách tiếng Nhật. Quyển sách đó là sách của thư viện trường. Hôm nay Mina đọc quyển sách ấy.',
    questions: [
      {
        id: 'q1',
        question: 'Mina là học viên của lĩnh vực nào?',
        choices: [{ id: 'a', label: 'Tiếng Nhật' }, { id: 'b', label: 'Bệnh viện' }, { id: 'c', label: 'Công viên' }],
        correctChoiceId: 'a',
        analysis: 'Câu đầu có cụm 「日本語の学生」, nghĩa là học viên / sinh viên tiếng Nhật.',
      },
      {
        id: 'q2',
        question: 'Quyển sách ở đâu?',
        choices: [{ id: 'a', label: 'Trong túi của Mina' }, { id: 'b', label: 'Ở ga tàu' }, { id: 'c', label: 'Ở bệnh viện' }],
        correctChoiceId: 'a',
        analysis: 'Câu thứ hai nói 「ミナさんのかばんに日本語の本があります」: có sách tiếng Nhật trong túi của Mina.',
      },
      {
        id: 'q3',
        question: 'Quyển sách thuộc về nơi nào?',
        choices: [{ id: 'a', label: 'Thư viện của trường' }, { id: 'b', label: 'Nhà của bạn' }, { id: 'c', label: 'Cửa hàng' }],
        correctChoiceId: 'a',
        analysis: '「学校の図書館の本」 là sách của thư viện thuộc trường học.',
      },
    ],
  },
  'grammar-5': {
    id: 'grammar-5',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 5 · あります・います',
    japaneseTitle: [{ base: 'あります・います' }],
    explanation: [
      'Dùng 「あります」 khi nói đồ vật, cây cối hoặc sự vật không có sự sống tồn tại ở đâu đó. Dùng 「います」 khi nói người hoặc động vật tồn tại ở đâu đó.',
      'Mẫu cơ bản là 「N は 場所 に あります／います」. Danh từ đầu câu là vật hoặc người đang được nói đến; địa điểm đứng trước 「に」.',
    ],
    formula: [{ base: 'N' }, { base: 'は' }, { base: '場所', ruby: 'ばしょ' }, { base: 'に' }, { base: 'あります／います' }],
    examples: [
      {
        japanese: [{ base: '本', ruby: 'ほん' }, { base: 'は' }, { base: 'かばん' }, { base: 'に' }, { base: 'あります' }, { base: '。' }],
        translation: 'Có một quyển sách trong túi.',
        note: '「本」 là đồ vật nên dùng 「あります」.',
      },
      {
        japanese: [{ base: '犬', ruby: 'いぬ' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: 'います' }, { base: '。' }],
        translation: 'Có một con chó ở công viên.',
        note: '「犬」 là động vật nên dùng 「います」.',
      },
      {
        japanese: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '図書館', ruby: 'としょかん' }, { base: 'に' }, { base: 'います' }, { base: '。' }],
        translation: 'Bạn tôi ở thư viện.',
        note: 'Người đi với 「います」, ngay cả khi câu không nêu hành động.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '机', ruby: 'つくえ' }, { base: 'に' }, { base: '___' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'あります' }], meaning: 'có (đồ vật)' },
          { id: 'b', text: [{ base: 'います' }], meaning: 'có (người/động vật)' },
          { id: 'c', text: [{ base: '行', ruby: 'い' }, { base: 'きます' }], meaning: 'đi' },
        ],
        correctChoiceId: 'a',
        analysis: '「本」 là đồ vật không có sự sống, vì vậy dùng 「あります」.',
      },
      {
        id: 'q2',
        prompt: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '駅', ruby: 'えき' }, { base: 'に' }, { base: '___' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'あります' }], meaning: 'dành cho đồ vật' },
          { id: 'b', text: [{ base: 'います' }], meaning: 'dành cho người / động vật' },
          { id: 'c', text: [{ base: 'です' }], meaning: 'là' },
        ],
        correctChoiceId: 'b',
        analysis: '「友達」 là người nên phải dùng 「います」 để diễn tả đang có mặt ở ga.',
      },
      {
        id: 'q3',
        prompt: [{ base: '「Có một con chó ở công viên」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: '犬', ruby: 'いぬ' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: 'います' }, { base: '。' }], meaning: 'Có một con chó ở công viên.' },
          { id: 'b', text: [{ base: '犬', ruby: 'いぬ' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'を' }, { base: 'あります' }, { base: '。' }], meaning: 'Sai trợ từ và động từ.' },
          { id: 'c', text: [{ base: '犬', ruby: 'いぬ' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }], meaning: 'Sai kết thúc câu.' },
        ],
        correctChoiceId: 'a',
        analysis: 'Động vật 「犬」 dùng 「います」 và địa điểm 「公園」 đứng trước 「に」.',
      },
    ],
  },
  'reading-5': {
    id: 'reading-5',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 5 · Chiều ở công viên',
    japaneseTitle: [{ base: '公園', ruby: 'こうえん' }, { base: 'の' }, { base: '午後', ruby: 'ごご' }],
    introduction: 'Đọc từng câu, trước tiên xác định chủ thể là người/động vật hay đồ vật, rồi đối chiếu với 「います」 hoặc 「あります」.',
    passage: [
      { base: '今日', ruby: 'きょう' }, { base: 'の' }, { base: '午後', ruby: 'ごご' }, { base: '、' }, { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: 'います' }, { base: '。' },
      { base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: '犬', ruby: 'いぬ' }, { base: 'が' }, { base: '二匹', ruby: 'にひき' }, { base: 'います' }, { base: '。' },
      { base: 'ベンチ' }, { base: 'の' }, { base: '上', ruby: 'うえ' }, { base: 'に' }, { base: '赤', ruby: 'あか' }, { base: 'い' }, { base: 'かばん' }, { base: 'が' }, { base: 'あります' }, { base: '。' },
      { base: 'かばん' }, { base: 'の' }, { base: '中', ruby: 'なか' }, { base: 'に' }, { base: '本', ruby: 'ほん' }, { base: 'と' }, { base: 'ペン' }, { base: 'が' }, { base: 'あります' }, { base: '。' },
    ],
    translation: 'Chiều nay, Ken ở công viên. Có hai con chó trong công viên. Trên ghế băng có một chiếc túi đỏ. Trong túi có một quyển sách và một cây bút.',
    questions: [
      {
        id: 'q1',
        question: 'Ken đang ở đâu?',
        choices: [{ id: 'a', label: 'Ở công viên' }, { id: 'b', label: 'Ở thư viện' }, { id: 'c', label: 'Ở ga tàu' }],
        correctChoiceId: 'a',
        analysis: 'Câu đầu nói rõ 「ケンさんは公園にいます」: Ken ở công viên.',
      },
      {
        id: 'q2',
        question: 'Ở công viên có bao nhiêu con chó?',
        choices: [{ id: 'a', label: 'Một con' }, { id: 'b', label: 'Hai con' }, { id: 'c', label: 'Không có con nào' }],
        correctChoiceId: 'b',
        analysis: '「二匹います」 nghĩa là có hai con (động vật nhỏ).',
      },
      {
        id: 'q3',
        question: 'Trong chiếc túi có những gì?',
        choices: [{ id: 'a', label: 'Một quyển sách và một cây bút' }, { id: 'b', label: 'Hai con chó' }, { id: 'c', label: 'Một ga tàu' }],
        correctChoiceId: 'a',
        analysis: 'Câu cuối ghi 「本とペンがあります」: trong túi có sách và bút.',
      },
    ],
  },
  'grammar-6': {
    id: 'grammar-6',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 6 · N を Vます',
    japaneseTitle: [{ base: '名詞', ruby: 'めいし' }, { base: 'を' }, { base: '動詞', ruby: 'どうし' }],
    explanation: [
      'Trợ từ 「を」 đánh dấu tân ngữ trực tiếp: thứ mà hành động tác động tới. Trong câu 「本を読みます」, quyển sách là thứ được đọc.',
      'Ở dạng lịch sự N5, động từ thường kết thúc bằng 「ます」. Hãy nhận ra cả cụm N を Vます trước khi cố dịch từng thành phần.',
    ],
    formula: [{ base: '人', ruby: 'ひと' }, { base: 'は' }, { base: 'N' }, { base: 'を' }, { base: 'Vます' }],
    examples: [
      {
        japanese: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '水', ruby: 'みず' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みます' }, { base: '。' }],
        translation: 'Tôi uống nước.',
        note: '「水」 là thứ được uống nên đi với 「を」.',
      },
      {
        japanese: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' }],
        translation: 'Bạn tôi đọc sách.',
        note: '「本を」 tạo cụm “sách (được) đọc”.',
      },
      {
        japanese: [{ base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: 'パン' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' }],
        translation: 'Ken ăn bánh mì.',
        note: 'Động từ 「食べます」 cần tân ngữ là món ăn.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '本', ruby: 'ほん' }, { base: '___' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'を' }], meaning: 'đánh dấu thứ được đọc' },
          { id: 'b', text: [{ base: 'に' }], meaning: 'đánh dấu điểm đến / thời điểm' },
          { id: 'c', text: [{ base: 'の' }], meaning: 'nối danh từ' },
        ],
        correctChoiceId: 'a',
        analysis: '「本」 là tân ngữ trực tiếp của hành động 「読みます」, nên dùng 「を」.',
      },
      {
        id: 'q2',
        prompt: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '水', ruby: 'みず' }, { base: 'を' }, { base: '___' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '飲', ruby: 'の' }, { base: 'みます' }], meaning: 'uống' },
          { id: 'b', text: [{ base: '学生', ruby: 'がくせい' }], meaning: 'học sinh / sinh viên' },
          { id: 'c', text: [{ base: '公園', ruby: 'こうえん' }], meaning: 'công viên' },
        ],
        correctChoiceId: 'a',
        analysis: 'Sau cụm tân ngữ 「水を」 cần một hành động phù hợp. 「飲みます」 nghĩa là uống.',
      },
      {
        id: 'q3',
        prompt: [{ base: '「Mina ăn bánh mì」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: 'パン' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' }], meaning: 'Mina ăn bánh mì.' },
          { id: 'b', text: [{ base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: 'パン' }, { base: 'に' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' }], meaning: 'Sai trợ từ tân ngữ.' },
          { id: 'c', text: [{ base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: 'パン' }, { base: 'を' }, { base: '先生', ruby: 'せんせい' }, { base: 'です' }, { base: '。' }], meaning: 'Sai động từ.' },
        ],
        correctChoiceId: 'a',
        analysis: 'Bánh mì là thứ Mina ăn, nên 「パンを」 đi với 「食べます」.',
      },
    ],
  },
  'reading-6': {
    id: 'reading-6',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 6 · Bữa trưa của Yuki',
    japaneseTitle: [{ base: 'ゆき' }, { base: 'さん' }, { base: 'の' }, { base: '昼', ruby: 'ひる' }],
    introduction: 'Tìm các cụm danh từ đứng trước 「を」 để xác định chính xác đối tượng của từng hành động.',
    passage: [
      { base: '今日', ruby: 'きょう' }, { base: 'の' }, { base: '昼', ruby: 'ひる' }, { base: '、' }, { base: 'ゆき' }, { base: 'さん' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'で' }, { base: 'ご飯', ruby: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' },
      { base: '水', ruby: 'みず' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みます' }, { base: '。' },
      { base: '食', ruby: 'た' }, { base: 'べた' }, { base: '後', ruby: 'あと' }, { base: '、' }, { base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' },
      { base: '午後', ruby: 'ごご' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '話', ruby: 'はな' }, { base: 'します' }, { base: '。' },
    ],
    translation: 'Trưa nay, Yuki ăn cơm ở trường và uống nước. Sau khi ăn, bạn ấy đọc sách tiếng Nhật ở thư viện. Buổi chiều, Yuki nói chuyện với bạn.',
    questions: [
      {
        id: 'q1',
        question: 'Yuki ăn gì ở trường?',
        choices: [{ id: 'a', label: 'Cơm / bữa ăn' }, { id: 'b', label: 'Sách tiếng Nhật' }, { id: 'c', label: 'Một cây bút' }],
        correctChoiceId: 'a',
        analysis: 'Cụm 「ご飯を食べます」 nói Yuki ăn cơm / bữa ăn.',
      },
      {
        id: 'q2',
        question: 'Yuki đọc gì ở thư viện?',
        choices: [{ id: 'a', label: 'Sách tiếng Nhật' }, { id: 'b', label: 'Nước' }, { id: 'c', label: 'Xe buýt' }],
        correctChoiceId: 'a',
        analysis: 'Đoạn văn có 「日本語の本を読みます」: Yuki đọc sách tiếng Nhật.',
      },
      {
        id: 'q3',
        question: 'Buổi chiều Yuki làm gì?',
        choices: [{ id: 'a', label: 'Nói chuyện với bạn' }, { id: 'b', label: 'Về nhà' }, { id: 'c', label: 'Đến bệnh viện' }],
        correctChoiceId: 'a',
        analysis: 'Câu cuối nói 「友達と話します」: Yuki nói chuyện với bạn.',
      },
    ],
  },
  'grammar-7': {
    id: 'grammar-7',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 7 · N が 好きです',
    japaneseTitle: [{ base: '名詞', ruby: 'めいし' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }],
    explanation: [
      'Để nói thích một thứ, người Nhật dùng 「N が 好きです」. Dù tiếng Việt có thể dịch là “tôi thích N”, đối tượng được thích đi với 「が」 trong mẫu này, không phải 「を」.',
      'Bạn có thể đặt người nói ở đầu câu: 「私は本が好きです」. Khi ngữ cảnh đã rõ, chủ ngữ thường được lược bỏ và chỉ nói 「本が好きです」.',
    ],
    formula: [{ base: '人', ruby: 'ひと' }, { base: 'は' }, { base: 'N' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }],
    examples: [
      {
        japanese: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '日本語', ruby: 'にほんご' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }],
        translation: 'Tôi thích tiếng Nhật.',
        note: 'Thứ được thích là 「日本語」 nên dùng 「が」.',
      },
      {
        japanese: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }],
        translation: 'Bạn tôi thích sách.',
        note: 'Không dùng 「本を好きです」 trong mẫu N5 này.',
      },
      {
        japanese: [{ base: '犬', ruby: 'いぬ' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: 'か' }, { base: '。' }],
        translation: 'Bạn có thích chó không?',
        note: 'Thêm 「か」 ở cuối để biến câu thành câu hỏi lịch sự.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: '___' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: 'が' }], meaning: 'đánh dấu đối tượng được thích' },
          { id: 'b', text: [{ base: 'を' }], meaning: 'tân ngữ trực tiếp thông thường' },
          { id: 'c', text: [{ base: 'の' }], meaning: 'nối danh từ' },
        ],
        correctChoiceId: 'a',
        analysis: 'Mẫu cố định N が 好きです dùng 「が」 trước 「好きです」.',
      },
      {
        id: 'q2',
        prompt: [{ base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: '日本語', ruby: 'にほんご' }, { base: 'が' }, { base: '___' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '好', ruby: 'す' }, { base: 'きです' }], meaning: 'thích' },
          { id: 'b', text: [{ base: '食', ruby: 'た' }, { base: 'べます' }], meaning: 'ăn' },
          { id: 'c', text: [{ base: 'あります' }], meaning: 'có (đồ vật)' },
        ],
        correctChoiceId: 'a',
        analysis: 'Cụm 「日本語が好きです」 diễn tả Mina thích tiếng Nhật.',
      },
      {
        id: 'q3',
        prompt: [{ base: '「Tôi thích công viên」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }], meaning: 'Tôi thích công viên.' },
          { id: 'b', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'を' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }], meaning: 'Sai trợ từ trong mẫu này.' },
          { id: 'c', text: [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'が' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], meaning: 'Tôi đi công viên.' },
        ],
        correctChoiceId: 'a',
        analysis: 'Với 「好きです」, đối tượng 「公園」 đi cùng 「が」.',
      },
    ],
  },
  'reading-7': {
    id: 'reading-7',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 7 · Sở thích của hai người bạn',
    japaneseTitle: [{ base: '二人', ruby: 'ふたり' }, { base: 'の' }, { base: '好', ruby: 'す' }, { base: 'きなこと' }],
    introduction: 'Đọc để phân biệt điều mỗi nhân vật thích và hoạt động họ làm cùng nhau.',
    passage: [
      { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' },
      { base: '特', ruby: 'とく' }, { base: 'に' }, { base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' },
      { base: 'ミナ' }, { base: 'さん' }, { base: 'は' }, { base: '犬', ruby: 'いぬ' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' },
      { base: '土曜日', ruby: 'どようび' }, { base: 'に' }, { base: '、' }, { base: '二人', ruby: 'ふたり' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'で' }, { base: '犬', ruby: 'いぬ' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' },
    ],
    translation: 'Ken thích sách, đặc biệt là sách tiếng Nhật. Mina thích chó. Vào thứ Bảy, hai người xem chó ở công viên.',
    questions: [
      {
        id: 'q1',
        question: 'Ken đặc biệt thích loại sách nào?',
        choices: [{ id: 'a', label: 'Sách tiếng Nhật' }, { id: 'b', label: 'Sách của bệnh viện' }, { id: 'c', label: 'Sách của công viên' }],
        correctChoiceId: 'a',
        analysis: 'Câu thứ hai nói 「特に日本語の本が好きです」: Ken đặc biệt thích sách tiếng Nhật.',
      },
      {
        id: 'q2',
        question: 'Mina thích gì?',
        choices: [{ id: 'a', label: 'Chó' }, { id: 'b', label: 'Xe buýt' }, { id: 'c', label: 'Nước' }],
        correctChoiceId: 'a',
        analysis: 'Câu thứ ba có 「犬が好きです」: Mina thích chó.',
      },
      {
        id: 'q3',
        question: 'Thứ Bảy hai người làm gì?',
        choices: [{ id: 'a', label: 'Xem chó ở công viên' }, { id: 'b', label: 'Đọc sách ở ga' }, { id: 'c', label: 'Ăn cơm ở bệnh viện' }],
        correctChoiceId: 'a',
        analysis: 'Câu cuối ghi rõ hai người xem chó ở công viên.',
      },
    ],
  },
  'grammar-8': {
    id: 'grammar-8',
    level: 'N5',
    skill: 'grammar',
    title: 'Bài 8 · Tính từ đuôi い',
    japaneseTitle: [{ base: 'い' }, { base: '形容詞', ruby: 'けいようし' }],
    explanation: [
      'Tính từ đuôi 「い」 đứng trước 「です」 để miêu tả danh từ: 「本は面白いです」, “quyển sách thú vị”. Phần 「い」 là một phần của tính từ, không phải trợ từ.',
      'Một tính từ có thể đứng ngay trước danh từ: 「赤いペン」 (cây bút đỏ). Trong câu khẳng định lịch sự, dùng N は Aいです.',
    ],
    formula: [{ base: 'N' }, { base: 'は' }, { base: 'Aい' }, { base: 'です' }],
    examples: [
      {
        japanese: [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '面白', ruby: 'おもしろ' }, { base: 'いです' }, { base: '。' }],
        translation: 'Quyển sách này thú vị.',
        note: '「面白い」 là tính từ đuôi い và đi trước 「です」.',
      },
      {
        japanese: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'いです' }, { base: '。' }],
        translation: 'Hôm nay nóng.',
        note: '「暑い」 dùng cho thời tiết nóng.',
      },
      {
        japanese: [{ base: 'あれ' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: 'い' }, { base: '山', ruby: 'やま' }, { base: 'です' }, { base: '。' }],
        translation: 'Kia là ngọn núi cao.',
        note: 'Khi bổ nghĩa trực tiếp cho danh từ 「山」, 「高い」 không cần 「です」 ở giữa.',
      },
    ],
    questions: [
      {
        id: 'q1',
        prompt: [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '___' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '面白', ruby: 'おもしろ' }, { base: 'い' }], meaning: 'thú vị' },
          { id: 'b', text: [{ base: '図書館', ruby: 'としょかん' }], meaning: 'thư viện' },
          { id: 'c', text: [{ base: '読', ruby: 'よ' }, { base: 'みます' }], meaning: 'đọc' },
        ],
        correctChoiceId: 'a',
        analysis: 'Sau chủ đề và trước 「です」 cần tính từ để miêu tả cuốn sách. 「面白い」 là tính từ phù hợp.',
      },
      {
        id: 'q2',
        prompt: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '___' }, { base: 'です' }, { base: '。' }],
        choices: [
          { id: 'a', text: [{ base: '暑', ruby: 'あつ' }, { base: 'い' }], meaning: 'nóng (thời tiết)' },
          { id: 'b', text: [{ base: '水', ruby: 'みず' }], meaning: 'nước' },
          { id: 'c', text: [{ base: '友達', ruby: 'ともだち' }], meaning: 'bạn bè' },
        ],
        correctChoiceId: 'a',
        analysis: 'Câu mô tả thời tiết hôm nay cần tính từ. 「暑いです」 nghĩa là nóng.',
      },
      {
        id: 'q3',
        prompt: [{ base: '「Cây bút đỏ này rẻ」' }, { base: 'にいちばん' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }],
        choices: [
          { id: 'a', text: [{ base: 'この' }, { base: '赤', ruby: 'あか' }, { base: 'い' }, { base: 'ペン' }, { base: 'は' }, { base: '安', ruby: 'やす' }, { base: 'いです' }, { base: '。' }], meaning: 'Cây bút đỏ này rẻ.' },
          { id: 'b', text: [{ base: 'この' }, { base: '赤', ruby: 'あか' }, { base: 'ペン' }, { base: 'は' }, { base: '安', ruby: 'やす' }, { base: 'いです' }, { base: '。' }], meaning: 'Thiếu い ở 赤い.' },
          { id: 'c', text: [{ base: 'この' }, { base: '赤', ruby: 'あか' }, { base: 'い' }, { base: 'ペン' }, { base: 'を' }, { base: '安', ruby: 'やす' }, { base: 'いです' }, { base: '。' }], meaning: 'Sai trợ từ.' },
        ],
        correctChoiceId: 'a',
        analysis: '「赤い」 đứng trước danh từ 「ペン」; toàn bộ cụm là chủ đề với 「は」, sau đó dùng 「安いです」.',
      },
    ],
  },
  'reading-8': {
    id: 'reading-8',
    level: 'N5',
    skill: 'reading',
    title: 'Bài đọc 8 · Chủ nhật ở biển',
    japaneseTitle: [{ base: '日曜日', ruby: 'にちようび' }, { base: 'の' }, { base: '海', ruby: 'うみ' }],
    introduction: 'Đọc các tính từ mô tả để hiểu thời tiết, đồ vật và cảm nhận của người kể.',
    passage: [
      { base: '日曜日', ruby: 'にちようび' }, { base: 'の' }, { base: '朝', ruby: 'あさ' }, { base: '、' }, { base: '天気', ruby: 'てんき' }, { base: 'は' }, { base: 'とても' }, { base: 'いいです' }, { base: '。' },
      { base: '空', ruby: 'そら' }, { base: 'は' }, { base: '青', ruby: 'あお' }, { base: 'いです' }, { base: '。' }, { base: '海', ruby: 'うみ' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きいです' }, { base: '。' },
      { base: 'ケン' }, { base: 'さん' }, { base: 'の' }, { base: '白', ruby: 'しろ' }, { base: 'い' }, { base: 'かばん' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きいです' }, { base: '。' },
      { base: 'かばん' }, { base: 'の' }, { base: '中', ruby: 'なか' }, { base: 'に' }, { base: '面白', ruby: 'おもしろ' }, { base: 'い' }, { base: '本', ruby: 'ほん' }, { base: 'があります' }, { base: '。' },
    ],
    translation: 'Sáng Chủ nhật, thời tiết rất đẹp. Bầu trời xanh. Biển lớn. Chiếc túi trắng của Ken lớn. Trong túi có một quyển sách thú vị.',
    questions: [
      {
        id: 'q1',
        question: 'Thời tiết sáng Chủ nhật như thế nào?',
        choices: [{ id: 'a', label: 'Rất đẹp' }, { id: 'b', label: 'Rất lạnh' }, { id: 'c', label: 'Rất đắt' }],
        correctChoiceId: 'a',
        analysis: 'Câu đầu nói 「天気はとてもいいです」: thời tiết rất đẹp / tốt.',
      },
      {
        id: 'q2',
        question: 'Ken mang chiếc túi màu gì?',
        choices: [{ id: 'a', label: 'Màu trắng' }, { id: 'b', label: 'Màu đỏ' }, { id: 'c', label: 'Màu đen' }],
        correctChoiceId: 'a',
        analysis: 'Đoạn văn có cụm 「白いかばん」: chiếc túi trắng.',
      },
      {
        id: 'q3',
        question: 'Trong túi có gì?',
        choices: [{ id: 'a', label: 'Một quyển sách thú vị' }, { id: 'b', label: 'Một con chó' }, { id: 'c', label: 'Một cây bút đỏ' }],
        correctChoiceId: 'a',
        analysis: 'Câu cuối cho biết trong túi có 「面白い本」, một quyển sách thú vị.',
      },
    ],
  },
  'grammar-9': {
    id: 'grammar-9', level: 'N5', skill: 'grammar', title: 'Bài 9 · Phủ định tính từ い',
    japaneseTitle: [{ base: 'い' }, { base: '形容詞', ruby: 'けいようし' }, { base: 'の' }, { base: '否定', ruby: 'ひてい' }],
    explanation: [
      'Để nói một tính từ đuôi い là không…, đổi い cuối thành く rồi thêm ないです: 「高い」→「高くないです」. Đây là phủ định lịch sự hiện tại.',
      'Chỉ đổi phần い cuối của tính từ. Ví dụ 「暑い」 thành 「暑くないです」; đừng dùng 「暑いないです」. Mẫu này dùng được cho giá tiền, thời tiết và miêu tả quen thuộc.',
    ],
    formula: [{ base: 'Aい' }, { base: '→' }, { base: 'Aくないです' }],
    examples: [
      { japanese: [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: 'くないです' }, { base: '。' }], translation: 'Quyển sách này không đắt.', note: '「高い」 đổi thành 「高くないです」.' },
      { japanese: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'くないです' }, { base: '。' }], translation: 'Hôm nay không nóng.', note: '「暑い」 là tính từ chỉ thời tiết nóng.' },
      { japanese: [{ base: 'この' }, { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'くないです' }, { base: '。' }], translation: 'Con đường này không dài.', note: '「長い」 mất い và nhận くないです.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: '___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'くないです' }], meaning: 'không đắt' }, { id: 'b', text: [{ base: 'いないです' }], meaning: 'dạng sai' }, { id: 'c', text: [{ base: 'ですか' }], meaning: 'câu hỏi' }], correctChoiceId: 'a', analysis: 'Phủ định của 「高い」 là 「高くないです」: đổi い thành く rồi thêm ないです.' },
      { id: 'q2', prompt: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'くないです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Hôm nay không nóng.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Hôm nay rất nóng.' }], meaning: 'sai phủ định' }, { id: 'c', text: [{ base: 'Hôm nay là mùa hè.' }], meaning: 'không có trong câu' }], correctChoiceId: 'a', analysis: '「暑くないです」 là phủ định của nóng: hôm nay không nóng.' },
      { id: 'q3', prompt: [{ base: '「Con đường này không dài」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: 'この' }, { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'くないです' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'この' }, { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'いないです' }, { base: '。' }], meaning: 'sai biến đổi' }, { id: 'c', text: [{ base: 'この' }, { base: '道', ruby: 'みち' }, { base: 'を' }, { base: '長', ruby: 'なが' }, { base: 'くないです' }, { base: '。' }], meaning: 'sai trợ từ' }], correctChoiceId: 'a', analysis: '「長い」 → 「長くないです」; danh từ 「道」 là chủ đề nên đi với は.' },
    ],
  },
  'reading-9': {
    id: 'reading-9', level: 'N5', skill: 'reading', title: 'Bài đọc 9 · Buổi đi công viên',
    japaneseTitle: [{ base: '公園', ruby: 'こうえん' }, { base: 'の' }, { base: '午後', ruby: 'ごご' }],
    introduction: 'Đọc các câu phủ định tính từ い và đối chiếu thông tin có/không trong đoạn văn.',
    passage: [
      { base: '今日', ruby: 'きょう' }, { base: 'の' }, { base: '午後', ruby: 'ごご' }, { base: '、' }, { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' },
      { base: '天気', ruby: 'てんき' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'くないです' }, { base: '。' }, { base: '公園', ruby: 'こうえん' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きくないです' }, { base: 'が' }, { base: '、' }, { base: '静', ruby: 'しず' }, { base: 'かです' }, { base: '。' },
      { base: 'ミカ' }, { base: 'さん' }, { base: 'の' }, { base: 'かばん' }, { base: 'は' }, { base: '重', ruby: 'おも' }, { base: 'くないです' }, { base: '。' }, { base: '中', ruby: 'なか' }, { base: 'に' }, { base: '水', ruby: 'みず' }, { base: 'と' }, { base: '小', ruby: 'ちい' }, { base: 'さい' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: 'あります' }, { base: '。' },
    ],
    translation: 'Chiều nay Mika đi công viên. Thời tiết không nóng. Công viên không lớn nhưng yên tĩnh. Túi của Mika không nặng. Bên trong có nước và một quyển sách nhỏ.',
    questions: [
      { id: 'q1', question: 'Thời tiết chiều nay như thế nào?', choices: [{ id: 'a', label: 'Không nóng' }, { id: 'b', label: 'Rất nóng' }, { id: 'c', label: 'Có tuyết' }], correctChoiceId: 'a', analysis: 'Đoạn đọc viết 「天気は暑くないです」: thời tiết không nóng.' },
      { id: 'q2', question: 'Công viên có đặc điểm nào?', choices: [{ id: 'a', label: 'Không lớn nhưng yên tĩnh' }, { id: 'b', label: 'Lớn và ồn ào' }, { id: 'c', label: 'Không có người' }], correctChoiceId: 'a', analysis: '「大きくないですが、静かです」 nghĩa là không lớn nhưng yên tĩnh.' },
      { id: 'q3', question: 'Trong túi của Mika có gì?', choices: [{ id: 'a', label: 'Nước và một quyển sách nhỏ' }, { id: 'b', label: 'Một chiếc túi nặng' }, { id: 'c', label: 'Một con chó nhỏ' }], correctChoiceId: 'a', analysis: 'Câu cuối cho biết 「水と小さい本があります」: có nước và một quyển sách nhỏ.' },
    ],
  },
  'grammar-10': {
    id: 'grammar-10', level: 'N5', skill: 'grammar', title: 'Bài 10 · Phủ định tính từ な',
    japaneseTitle: [{ base: 'な' }, { base: '形容詞', ruby: 'けいようし' }, { base: 'の' }, { base: '否定', ruby: 'ひてい' }],
    explanation: [
      'Với tính từ đuôi な, bỏ な trước です rồi thêm じゃないです để nói “không…”. Ví dụ: 「静かです」→「静かじゃないです」.',
      'Mẫu này khác tính từ đuôi い: không đổi âm cuối. Dùng với các từ quen thuộc như 「元気」(khỏe), 「有名」(nổi tiếng), 「便利」(tiện lợi).',
    ],
    formula: [{ base: 'Aな' }, { base: '→' }, { base: 'Aじゃないです' }],
    examples: [
      { japanese: [{ base: 'この' }, { base: '町', ruby: 'まち' }, { base: 'は' }, { base: '静', ruby: 'しず' }, { base: 'かじゃないです' }, { base: '。' }], translation: 'Thị trấn này không yên tĩnh.', note: '「静か」 là tính từ đuôi な; giữ nguyên gốc rồi thêm じゃないです.' },
      { japanese: [{ base: '田中', ruby: 'たなか' }, { base: 'さん' }, { base: 'は' }, { base: '元気', ruby: 'げんき' }, { base: 'じゃないです' }, { base: '。' }], translation: 'Anh/chị Tanaka không khỏe.', note: '「元気」 không có い ở cuối nên không dùng くないです.' },
      { japanese: [{ base: 'この' }, { base: '店', ruby: 'みせ' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'じゃないです' }, { base: '。' }], translation: 'Cửa hàng này không nổi tiếng.', note: '「有名」 chuyển thẳng sang 「有名じゃないです」.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: 'この' }, { base: '町', ruby: 'まち' }, { base: 'は' }, { base: '静', ruby: 'しず' }, { base: 'か___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'じゃないです' }], meaning: 'không yên tĩnh' }, { id: 'b', text: [{ base: 'くないです' }], meaning: 'dạng của tính từ い' }, { id: 'c', text: [{ base: 'いです' }], meaning: 'khẳng định sai' }], correctChoiceId: 'a', analysis: '「静か」 là tính từ đuôi な, vì vậy phủ định là 「静かじゃないです」.' },
      { id: 'q2', prompt: [{ base: '田中', ruby: 'たなか' }, { base: 'さん' }, { base: 'は' }, { base: '元気', ruby: 'げんき' }, { base: 'じゃないです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tanaka không khỏe.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tanaka rất khỏe.' }], meaning: 'ngược nghĩa' }, { id: 'c', text: [{ base: 'Tanaka không phải giáo viên.' }], meaning: 'không có trong câu' }], correctChoiceId: 'a', analysis: '「元気じゃないです」 nghĩa là không khỏe / không ổn.' },
      { id: 'q3', prompt: [{ base: '「Cửa hàng này không nổi tiếng」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: 'この' }, { base: '店', ruby: 'みせ' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'じゃないです' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'この' }, { base: '店', ruby: 'みせ' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'くないです' }, { base: '。' }], meaning: 'sai loại tính từ' }, { id: 'c', text: [{ base: 'この' }, { base: '店', ruby: 'みせ' }, { base: 'を' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'じゃないです' }, { base: '。' }], meaning: 'sai trợ từ chủ đề' }], correctChoiceId: 'a', analysis: 'Với 「有名」, dùng 「有名じゃないです」 và 「店」 là chủ đề nên đi với は.' },
    ],
  },
  'reading-10': {
    id: 'reading-10', level: 'N5', skill: 'reading', title: 'Bài đọc 10 · Khu phố mới',
    japaneseTitle: [{ base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: '町', ruby: 'まち' }],
    introduction: 'Đọc tính từ đuôi な ở thể phủ định và tách đúng thông tin khẳng định, phủ định trong một đoạn giới thiệu ngắn.',
    passage: [
      { base: 'ユキ' }, { base: 'さん' }, { base: 'の' }, { base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: '町', ruby: 'まち' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きくないです' }, { base: '。' },
      { base: 'でも' }, { base: '、' }, { base: '駅', ruby: 'えき' }, { base: 'の' }, { base: '近', ruby: 'ちか' }, { base: 'くに' }, { base: '便利', ruby: 'べんり' }, { base: 'な' }, { base: '店', ruby: 'みせ' }, { base: 'が' }, { base: 'あります' }, { base: '。' },
      { base: 'その' }, { base: '店', ruby: 'みせ' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'じゃないです' }, { base: 'が' }, { base: '、' }, { base: '店員', ruby: 'てんいん' }, { base: 'さん' }, { base: 'は' }, { base: '親切', ruby: 'しんせつ' }, { base: 'です' }, { base: '。' },
      { base: 'ユキ' }, { base: 'さん' }, { base: 'は' }, { base: 'その' }, { base: '町', ruby: 'まち' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' },
    ],
    translation: 'Khu phố mới của Yuki không lớn. Nhưng gần ga có một cửa hàng tiện lợi. Cửa hàng đó không nổi tiếng, nhưng nhân viên tốt bụng. Yuki thích khu phố ấy.',
    questions: [
      { id: 'q1', question: 'Khu phố mới của Yuki như thế nào?', choices: [{ id: 'a', label: 'Không lớn' }, { id: 'b', label: 'Rất nổi tiếng' }, { id: 'c', label: 'Không gần ga' }], correctChoiceId: 'a', analysis: 'Câu đầu nói 「町は大きくないです」: khu phố không lớn.' },
      { id: 'q2', question: 'Cửa hàng gần ga có đặc điểm nào?', choices: [{ id: 'a', label: 'Không nổi tiếng nhưng nhân viên tốt bụng' }, { id: 'b', label: 'Rất lớn và đông người' }, { id: 'c', label: 'Không tiện lợi' }], correctChoiceId: 'a', analysis: 'Đoạn văn dùng 「有名じゃないです」 và 「店員さんは親切です」.' },
      { id: 'q3', question: 'Yuki cảm thấy thế nào về khu phố?', choices: [{ id: 'a', label: 'Cô ấy thích khu phố' }, { id: 'b', label: 'Cô ấy không biết khu phố' }, { id: 'c', label: 'Cô ấy không thích cửa hàng vì xa ga' }], correctChoiceId: 'a', analysis: 'Câu cuối 「ユキさんはその町が好きです」 cho biết Yuki thích khu phố.' },
    ],
  },
  'grammar-11': {
    id: 'grammar-11', level: 'N5', skill: 'grammar', title: 'Bài 11 · から〜まで',
    japaneseTitle: [{ base: 'から' }, { base: '〜' }, { base: 'まで' }],
    explanation: [
      '「から」 chỉ điểm bắt đầu, còn 「まで」 chỉ điểm kết thúc. Hai từ thường đi cùng nhau để nói khung giờ hoặc quãng đường.',
      'Đặt mốc bắt đầu trước から và mốc kết thúc trước まで: 「九時から五時まで」. Có thể dùng chỉ から hoặc chỉ まで khi bối cảnh đã rõ.',
    ],
    formula: [{ base: 'N' }, { base: 'から' }, { base: 'N' }, { base: 'まで' }],
    examples: [
      { japanese: [{ base: '学校', ruby: 'がっこう' }, { base: 'は' }, { base: '九時', ruby: 'くじ' }, { base: 'から' }, { base: '三時', ruby: 'さんじ' }, { base: 'までです' }, { base: '。' }], translation: 'Trường học từ 9 giờ đến 3 giờ.', note: '九時 là điểm bắt đầu, 三時 là điểm kết thúc.' },
      { japanese: [{ base: '月曜日', ruby: 'げつようび' }, { base: 'から' }, { base: '金曜日', ruby: 'きんようび' }, { base: 'まで' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }], translation: 'Tôi học tiếng Nhật từ thứ Hai đến thứ Sáu.', note: 'Có thể dùng ngày trong tuần làm hai mốc.' },
      { japanese: [{ base: '駅', ruby: 'えき' }, { base: 'から' }, { base: '学校', ruby: 'がっこう' }, { base: 'まで' }, { base: '歩', ruby: 'ある' }, { base: 'きます' }, { base: '。' }], translation: 'Tôi đi bộ từ ga đến trường.', note: 'から〜まで cũng dùng cho vị trí, không chỉ thời gian.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '学校', ruby: 'がっこう' }, { base: 'は' }, { base: '九時', ruby: 'くじ' }, { base: '___' }, { base: '三時', ruby: 'さんじ' }, { base: 'までです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'から' }], meaning: 'từ' }, { id: 'b', text: [{ base: 'を' }], meaning: 'trợ từ tân ngữ' }, { id: 'c', text: [{ base: 'に' }], meaning: 'đích đến/thời điểm' }], correctChoiceId: 'a', analysis: 'Mốc bắt đầu 九時 đi cùng から, còn mốc kết thúc 三時 đi cùng まで.' },
      { id: 'q2', prompt: [{ base: '駅', ruby: 'えき' }, { base: 'から' }, { base: '学校', ruby: 'がっこう' }, { base: 'まで' }, { base: '歩', ruby: 'ある' }, { base: 'きます' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi đi bộ từ ga đến trường.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi đi đến ga lúc trường học.' }], meaning: 'sai trật tự' }, { id: 'c', text: [{ base: 'Ga và trường đều đi bộ.' }], meaning: 'không đúng nghĩa' }], correctChoiceId: 'a', analysis: 'Hai địa điểm được nối bởi から〜まで để chỉ quãng đường.' },
      { id: 'q3', prompt: [{ base: '「Từ thứ Hai đến thứ Sáu」' }, { base: 'は' }, { base: 'どれですか。' }], choices: [{ id: 'a', text: [{ base: '月曜日', ruby: 'げつようび' }, { base: 'から' }, { base: '金曜日', ruby: 'きんようび' }, { base: 'まで' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '月曜日', ruby: 'げつようび' }, { base: 'まで' }, { base: '金曜日', ruby: 'きんようび' }, { base: 'から' }], meaning: 'đảo điểm đầu/cuối' }, { id: 'c', text: [{ base: '月曜日', ruby: 'げつようび' }, { base: 'を' }, { base: '金曜日', ruby: 'きんようび' }, { base: 'に' }], meaning: 'sai mẫu' }], correctChoiceId: 'a', analysis: 'Bắt đầu là 月曜日 nên dùng から; kết thúc là 金曜日 nên dùng まで.' },
    ],
  },
  'reading-11': {
    id: 'reading-11', level: 'N5', skill: 'reading', title: 'Bài đọc 11 · Một ngày thứ Bảy',
    japaneseTitle: [{ base: '土曜日', ruby: 'どようび' }, { base: 'の' }, { base: '一日', ruby: 'いちにち' }],
    introduction: 'Đọc lịch ngắn và xác định chính xác mốc bắt đầu, mốc kết thúc của từng hoạt động.',
    passage: [
      { base: '土曜日', ruby: 'どようび' }, { base: '、' }, { base: 'ミン' }, { base: 'さん' }, { base: 'は' }, { base: '九時', ruby: 'くじ' }, { base: 'から' }, { base: '十二時', ruby: 'じゅうにじ' }, { base: 'まで' }, { base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' },
      { base: '十二時', ruby: 'じゅうにじ' }, { base: 'から' }, { base: '一時', ruby: 'いちじ' }, { base: 'まで' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' },
      { base: '午後', ruby: 'ごご' }, { base: '、' }, { base: '駅', ruby: 'えき' }, { base: 'から' }, { base: '公園', ruby: 'こうえん' }, { base: 'まで' }, { base: '歩', ruby: 'ある' }, { base: 'きます' }, { base: '。' },
    ],
    translation: 'Thứ Bảy, Minh học ở thư viện từ 9 giờ đến 12 giờ. Từ 12 giờ đến 1 giờ, bạn ấy ăn trưa với bạn. Buổi chiều, bạn ấy đi bộ từ ga đến công viên.',
    questions: [
      { id: 'q1', question: 'Minh học ở thư viện trong khung giờ nào?', choices: [{ id: 'a', label: 'Từ 9 giờ đến 12 giờ' }, { id: 'b', label: 'Từ 12 giờ đến 1 giờ' }, { id: 'c', label: 'Từ 1 giờ đến 9 giờ' }], correctChoiceId: 'a', analysis: 'Câu đầu có 「九時から十二時まで図書館で勉強します」.' },
      { id: 'q2', question: 'Minh làm gì từ 12 giờ đến 1 giờ?', choices: [{ id: 'a', label: 'Ăn trưa với bạn' }, { id: 'b', label: 'Học ở trường' }, { id: 'c', label: 'Đi tàu đến công viên' }], correctChoiceId: 'a', analysis: 'Câu thứ hai nói bạn ấy ăn trưa với 友達 trong khung giờ này.' },
      { id: 'q3', question: 'Buổi chiều Minh đi từ đâu đến đâu?', choices: [{ id: 'a', label: 'Từ ga đến công viên' }, { id: 'b', label: 'Từ thư viện đến trường' }, { id: 'c', label: 'Từ nhà đến ga' }], correctChoiceId: 'a', analysis: 'Câu cuối dùng 「駅から公園まで歩きます」.' },
    ],
  },
  'grammar-12': {
    id: 'grammar-12', level: 'N5', skill: 'grammar', title: 'Bài 12 · Động từ phủ định ません',
    japaneseTitle: [{ base: '動詞', ruby: 'どうし' }, { base: 'の' }, { base: '否定', ruby: 'ひてい' }],
    explanation: [
      'Để nói lịch sự rằng một hành động không diễn ra, đổi đuôi ます thành ません: 「行きます」→「行きません」.',
      'Thể ません dùng cho hiện tại và tương lai phủ định. Ví dụ 「今日は行きません」 có thể là “hôm nay không đi” hoặc “hôm nay sẽ không đi”.',
    ],
    formula: [{ base: 'Vます' }, { base: '→' }, { base: 'Vません' }],
    examples: [
      { japanese: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きません' }, { base: '。' }], translation: 'Hôm nay tôi không đi học.', note: '「行きます」 đổi thành 「行きません」.' },
      { japanese: [{ base: 'わたし' }, { base: 'は' }, { base: 'コーヒー' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みません' }, { base: '。' }], translation: 'Tôi không uống cà phê.', note: 'Giữ trợ từ を trước động từ, chỉ đổi ます thành ません.' },
      { japanese: [{ base: '日曜日', ruby: 'にちようび' }, { base: 'は' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ません' }, { base: '。' }], translation: 'Chủ nhật tôi không xem phim.', note: '「見ます」 chuyển sang phủ định là 「見ません」.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: '___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'きません' }], meaning: 'không đi' }, { id: 'b', text: [{ base: 'きます' }], meaning: 'có đi' }, { id: 'c', text: [{ base: 'きないです' }], meaning: 'dạng sai' }], correctChoiceId: 'a', analysis: 'Động từ lịch sự phủ định thay ます bằng ません: 行きます → 行きません.' },
      { id: 'q2', prompt: [{ base: 'わたし' }, { base: 'は' }, { base: 'コーヒー' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みません' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi không uống cà phê.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi uống cà phê.' }], meaning: 'mất nghĩa phủ định' }, { id: 'c', text: [{ base: 'Tôi không mua cà phê.' }], meaning: 'sai động từ' }], correctChoiceId: 'a', analysis: '「飲みません」 là thể phủ định của “uống”, nên câu nghĩa là không uống cà phê.' },
      { id: 'q3', prompt: [{ base: '「Chủ nhật tôi không xem phim」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '日曜日', ruby: 'にちようび' }, { base: 'は' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ません' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '日曜日', ruby: 'にちようび' }, { base: 'は' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' }], meaning: 'khẳng định' }, { id: 'c', text: [{ base: '日曜日', ruby: 'にちようび' }, { base: 'は' }, { base: '映画', ruby: 'えいが' }, { base: 'に' }, { base: '見', ruby: 'み' }, { base: 'ません' }, { base: '。' }], meaning: 'sai trợ từ tân ngữ' }], correctChoiceId: 'a', analysis: '映画 là tân ngữ nên dùng を; 「見ません」 mới diễn tả “không xem”.' },
    ],
  },
  'reading-12': {
    id: 'reading-12', level: 'N5', skill: 'reading', title: 'Bài đọc 12 · Cuối tuần của An',
    japaneseTitle: [{ base: '週末', ruby: 'しゅうまつ' }, { base: 'の' }, { base: '予定', ruby: 'よてい' }],
    introduction: 'Đọc thể ます và ません để nhận ra hoạt động nào được lên kế hoạch, hoạt động nào không.',
    passage: [
      { base: '土曜日', ruby: 'どようび' }, { base: '、' }, { base: 'アン' }, { base: 'さん' }, { base: 'は' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' },
      { base: '公園', ruby: 'こうえん' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ります' }, { base: '。' }, { base: 'でも' }, { base: '、' }, { base: 'テニス' }, { base: 'は' }, { base: 'しません' }, { base: '。' },
      { base: '日曜日', ruby: 'にちようび' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'で' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }, { base: 'テレビ' }, { base: 'は' }, { base: '見', ruby: 'み' }, { base: 'ません' }, { base: '。' },
    ],
    translation: 'Thứ Bảy, An đi công viên với bạn. Ở công viên, bạn ấy chụp ảnh. Nhưng bạn ấy không chơi tennis. Chủ nhật, bạn ấy học tiếng Nhật ở nhà. Bạn ấy không xem tivi.',
    questions: [
      { id: 'q1', question: 'Thứ Bảy An đi đâu?', choices: [{ id: 'a', label: 'Đi công viên với bạn' }, { id: 'b', label: 'Ở nhà xem tivi' }, { id: 'c', label: 'Đi chơi tennis' }], correctChoiceId: 'a', analysis: 'Câu đầu viết 「友達と公園へ行きます」.' },
      { id: 'q2', question: 'An không làm gì ở công viên?', choices: [{ id: 'a', label: 'Không chơi tennis' }, { id: 'b', label: 'Không chụp ảnh' }, { id: 'c', label: 'Không gặp bạn' }], correctChoiceId: 'a', analysis: 'Đoạn văn nêu 「テニスはしません」: không chơi tennis.' },
      { id: 'q3', question: 'Chủ nhật An làm gì?', choices: [{ id: 'a', label: 'Học tiếng Nhật ở nhà, không xem tivi' }, { id: 'b', label: 'Đi công viên, chơi tennis' }, { id: 'c', label: 'Xem phim với bạn' }], correctChoiceId: 'a', analysis: 'Câu cuối có cả 「日本語を勉強します」 và 「テレビは見ません」.' },
    ],
  },
  'grammar-13': {
    id: 'grammar-13', level: 'N5', skill: 'grammar', title: 'Bài 13 · Động từ quá khứ ました',
    japaneseTitle: [{ base: '動詞', ruby: 'どうし' }, { base: 'の' }, { base: '過去', ruby: 'かこ' }],
    explanation: [
      'Để kể một hành động đã xảy ra, đổi đuôi ます thành ました: 「食べます」→「食べました」.',
      'Thể ました thường đi với từ chỉ thời gian quá khứ như 昨日 (hôm qua) hoặc 先週 (tuần trước), nhưng thời gian có thể được lược bỏ nếu ngữ cảnh đã rõ.',
    ],
    formula: [{ base: 'Vます' }, { base: '→' }, { base: 'Vました' }],
    examples: [
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'しました' }, { base: '。' }], translation: 'Hôm qua tôi đã học tiếng Nhật.', note: '「します」 trở thành 「しました」.' },
      { japanese: [{ base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べました' }, { base: '。' }], translation: 'Tôi đã ăn trưa.', note: '「食べます」 đổi ます thành ました.' },
      { japanese: [{ base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'に' }, { base: '会', ruby: 'あ' }, { base: 'いました' }, { base: '。' }], translation: 'Tuần trước tôi đã gặp bạn.', note: '「会います」 ở quá khứ là 「会いました」.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'し___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'ました' }], meaning: 'đã học' }, { id: 'b', text: [{ base: 'ます' }], meaning: 'hiện tại/tương lai' }, { id: 'c', text: [{ base: 'ません' }], meaning: 'không học' }], correctChoiceId: 'a', analysis: '昨日 báo hiệu quá khứ; します chuyển thành しました.' },
      { id: 'q2', prompt: [{ base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べました' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi đã ăn trưa.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi không ăn trưa.' }], meaning: 'sai phủ định' }, { id: 'c', text: [{ base: 'Tôi sẽ ăn trưa.' }], meaning: 'không phải quá khứ' }], correctChoiceId: 'a', analysis: '「食べました」 là quá khứ lịch sự của ăn: đã ăn.' },
      { id: 'q3', prompt: [{ base: '「Tuần trước tôi đã gặp bạn」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'に' }, { base: '会', ruby: 'あ' }, { base: 'いました' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'に' }, { base: '会', ruby: 'あ' }, { base: 'います' }, { base: '。' }], meaning: 'hiện tại' }, { id: 'c', text: [{ base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'を' }, { base: '会', ruby: 'あ' }, { base: 'いました' }, { base: '。' }], meaning: 'sai trợ từ gặp ai' }], correctChoiceId: 'a', analysis: 'Người gặp đi với に, và 会いました đánh dấu hành động quá khứ.' },
    ],
  },
  'reading-13': {
    id: 'reading-13', level: 'N5', skill: 'reading', title: 'Bài đọc 13 · Nhật ký hôm qua',
    japaneseTitle: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: '日記', ruby: 'にっき' }],
    introduction: 'Đọc đuôi ました trong một nhật ký ngắn để đặt các hành động vào đúng thời điểm đã xảy ra.',
    passage: [
      { base: '昨日', ruby: 'きのう' }, { base: 'は' }, { base: '忙', ruby: 'いそが' }, { base: 'しい' }, { base: '一日', ruby: 'いちにち' }, { base: 'でした' }, { base: '。' }, { base: '朝', ruby: 'あさ' }, { base: '七時', ruby: 'しちじ' }, { base: 'に' }, { base: '起', ruby: 'お' }, { base: 'きました' }, { base: '。' },
      { base: '学校', ruby: 'がっこう' }, { base: 'で' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'しました' }, { base: '。' }, { base: '昼', ruby: 'ひる' }, { base: 'に' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: 'カレー' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べました' }, { base: '。' },
      { base: '夜', ruby: 'よる' }, { base: '、' }, { base: '家', ruby: 'いえ' }, { base: 'で' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みました' }, { base: '。' }, { base: '十時', ruby: 'じゅうじ' }, { base: 'に' }, { base: '寝', ruby: 'ね' }, { base: 'ました' }, { base: '。' },
    ],
    translation: 'Hôm qua là một ngày bận rộn. Tôi đã thức dậy lúc 7 giờ sáng. Ở trường, tôi đã học tiếng Nhật. Buổi trưa tôi đã ăn cà ri với bạn. Buổi tối tôi đã đọc sách ở nhà và đi ngủ lúc 10 giờ.',
    questions: [
      { id: 'q1', question: 'Người viết đã thức dậy lúc mấy giờ?', choices: [{ id: 'a', label: '7 giờ sáng' }, { id: 'b', label: '10 giờ sáng' }, { id: 'c', label: '12 giờ trưa' }], correctChoiceId: 'a', analysis: 'Câu đầu ghi 「朝七時に起きました」.' },
      { id: 'q2', question: 'Buổi trưa người viết đã làm gì?', choices: [{ id: 'a', label: 'Ăn cà ri với bạn' }, { id: 'b', label: 'Đọc sách ở nhà' }, { id: 'c', label: 'Học ở thư viện' }], correctChoiceId: 'a', analysis: 'Đoạn giữa nêu 「友達とカレーを食べました」.' },
      { id: 'q3', question: 'Buổi tối người viết làm gì trước khi ngủ?', choices: [{ id: 'a', label: 'Đọc sách ở nhà' }, { id: 'b', label: 'Đi công viên' }, { id: 'c', label: 'Uống cà phê ở trường' }], correctChoiceId: 'a', analysis: 'Câu cuối có 「家で本を読みました」 trước 「寝ました」.' },
    ],
  },
  'grammar-14': {
    id: 'grammar-14', level: 'N5', skill: 'grammar', title: 'Bài 14 · Động từ quá khứ phủ định',
    japaneseTitle: [{ base: '動詞', ruby: 'どうし' }, { base: 'の' }, { base: '過去', ruby: 'かこ' }, { base: '否定', ruby: 'ひてい' }],
    explanation: [
      'Để nói một hành động đã không xảy ra, đổi đuôi ます thành ませんでした: 「行きます」→「行きませんでした」.',
      'Mẫu này đi tự nhiên với 昨日, 先週 hoặc các mốc quá khứ. Đừng nhầm với ません, vốn phủ định ở hiện tại hoặc tương lai.',
    ],
    formula: [{ base: 'Vます' }, { base: '→' }, { base: 'Vませんでした' }],
    examples: [
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きませんでした' }, { base: '。' }], translation: 'Hôm qua tôi đã không đi học.', note: '行きます đổi thành 行きませんでした.' },
      { japanese: [{ base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ませんでした' }, { base: '。' }], translation: 'Tuần trước tôi đã không xem phim.', note: '見ませんでした là quá khứ phủ định của 見ます.' },
      { japanese: [{ base: '朝', ruby: 'あさ' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べませんでした' }, { base: '。' }], translation: 'Tôi đã không ăn sáng.', note: 'Động từ 食べます đổi sang 食べませんでした.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'き___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'ませんでした' }], meaning: 'đã không đi' }, { id: 'b', text: [{ base: 'ました' }], meaning: 'đã đi' }, { id: 'c', text: [{ base: 'ません' }], meaning: 'không đi (không quá khứ)' }], correctChoiceId: 'a', analysis: '昨日 yêu cầu quá khứ phủ định: 行きませんでした.' },
      { id: 'q2', prompt: [{ base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ませんでした' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tuần trước tôi đã không xem phim.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tuần trước tôi đã xem phim.' }], meaning: 'mất phủ định' }, { id: 'c', text: [{ base: 'Tuần trước tôi không muốn xem phim.' }], meaning: 'không có ý muốn' }], correctChoiceId: 'a', analysis: '見ませんでした có cả ません (phủ định) và でした (quá khứ).' },
      { id: 'q3', prompt: [{ base: '「Tôi đã không ăn sáng」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '朝', ruby: 'あさ' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べませんでした' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '朝', ruby: 'あさ' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べました' }, { base: '。' }], meaning: 'đã ăn' }, { id: 'c', text: [{ base: '朝', ruby: 'あさ' }, { base: 'ごはん' }, { base: 'に' }, { base: '食', ruby: 'た' }, { base: 'べませんでした' }, { base: '。' }], meaning: 'sai trợ từ tân ngữ' }], correctChoiceId: 'a', analysis: '朝ごはん là tân ngữ của 食べる nên dùng を; phủ định quá khứ là 食べませんでした.' },
    ],
  },
  'reading-14': {
    id: 'reading-14', level: 'N5', skill: 'reading', title: 'Bài đọc 14 · Chuyến đi mưa',
    japaneseTitle: [{ base: '雨', ruby: 'あめ' }, { base: 'の' }, { base: '旅行', ruby: 'りょこう' }],
    introduction: 'Đọc dạng ませんでした để xác định rõ việc không xảy ra trong quá khứ.',
    passage: [
      { base: '先週', ruby: 'せんしゅう' }, { base: 'の' }, { base: '土曜日', ruby: 'どようび' }, { base: '、' }, { base: 'マイ' }, { base: 'さん' }, { base: 'は' }, { base: '家族', ruby: 'かぞく' }, { base: 'と' }, { base: '海', ruby: 'うみ' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きました' }, { base: '。' },
      { base: 'でも' }, { base: '、' }, { base: '雨', ruby: 'あめ' }, { base: 'でした' }, { base: '。' }, { base: '海', ruby: 'うみ' }, { base: 'で' }, { base: '泳', ruby: 'およ' }, { base: 'ぎませんでした' }, { base: '。' },
      { base: 'ホテル' }, { base: 'で' }, { base: '魚', ruby: 'さかな' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べました' }, { base: '。' }, { base: '夜', ruby: 'よる' }, { base: 'は' }, { base: 'テレビ' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ませんでした' }, { base: '。' },
    ],
    translation: 'Thứ Bảy tuần trước, Mai đã đi biển với gia đình. Nhưng trời mưa. Bạn ấy đã không bơi ở biển. Ở khách sạn, bạn ấy đã ăn cá. Buổi tối, bạn ấy đã không xem tivi.',
    questions: [
      { id: 'q1', question: 'Vì sao Mai không bơi ở biển?', choices: [{ id: 'a', label: 'Vì trời mưa' }, { id: 'b', label: 'Vì không có biển' }, { id: 'c', label: 'Vì đi học' }], correctChoiceId: 'a', analysis: 'Đoạn văn nói 「雨でした」 rồi 「泳ぎませんでした」.' },
      { id: 'q2', question: 'Mai đã ăn gì ở khách sạn?', choices: [{ id: 'a', label: 'Cá' }, { id: 'b', label: 'Cà ri' }, { id: 'c', label: 'Không ăn gì' }], correctChoiceId: 'a', analysis: 'Câu thứ ba ghi 「魚を食べました」.' },
      { id: 'q3', question: 'Buổi tối Mai đã không làm gì?', choices: [{ id: 'a', label: 'Không xem tivi' }, { id: 'b', label: 'Không ăn cá' }, { id: 'c', label: 'Không đi biển' }], correctChoiceId: 'a', analysis: 'Câu cuối có 「テレビを見ませんでした」.' },
    ],
  },
  'grammar-15': {
    id: 'grammar-15', level: 'N5', skill: 'grammar', title: 'Bài 15 · N が ほしいです',
    japaneseTitle: [{ base: '欲', ruby: 'ほ' }, { base: 'しいです' }],
    explanation: [
      'Dùng 「N が ほしいです」 để nói bạn muốn có một đồ vật hoặc một danh từ: 「新しいかばんがほしいです」.',
      '「ほしい」 là tính từ nên danh từ mong muốn đi với が. Mẫu này nói về điều người nói muốn; khi hỏi người khác, dùng giọng điệu lịch sự và ngữ cảnh phù hợp.',
    ],
    formula: [{ base: 'N' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }],
    examples: [
      { japanese: [{ base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: 'かばん' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], translation: 'Tôi muốn có một chiếc cặp mới.', note: 'Đồ vật mong muốn là かばん, đi với が.' },
      { japanese: [{ base: '誕生日', ruby: 'たんじょうび' }, { base: 'に' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], translation: 'Tôi muốn có một quyển sách vào sinh nhật.', note: '本 là danh từ người nói mong muốn nhận.' },
      { japanese: [{ base: 'わたし' }, { base: 'は' }, { base: '小', ruby: 'ちい' }, { base: 'さい' }, { base: 'カメラ' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], translation: 'Tôi muốn có một chiếc máy ảnh nhỏ.', note: 'Tính từ 小さい mô tả danh từ カメラ.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: 'かばん' }, { base: '___' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'が' }], meaning: 'đánh dấu đồ vật mong muốn' }, { id: 'b', text: [{ base: 'を' }], meaning: 'không dùng trong mẫu này' }, { id: 'c', text: [{ base: 'に' }], meaning: 'thời điểm/đích' }], correctChoiceId: 'a', analysis: 'Mẫu cố định là N が ほしいです; danh từ mong muốn đi với が.' },
      { id: 'q2', prompt: [{ base: '誕生日', ruby: 'たんじょうび' }, { base: 'に' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi muốn có một quyển sách vào sinh nhật.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi đã tặng sách vào sinh nhật.' }], meaning: 'không có hành động tặng' }, { id: 'c', text: [{ base: 'Tôi không muốn sách.' }], meaning: 'mất nghĩa 欲しい' }], correctChoiceId: 'a', analysis: '「本が欲しいです」 nghĩa là muốn có sách.' },
      { id: 'q3', prompt: [{ base: '「Tôi muốn có một chiếc máy ảnh nhỏ」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '小', ruby: 'ちい' }, { base: 'さい' }, { base: 'カメラ' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '小', ruby: 'ちい' }, { base: 'さい' }, { base: 'カメラ' }, { base: 'を' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }], meaning: 'sai trợ từ của mẫu' }, { id: 'c', text: [{ base: '小', ruby: 'ちい' }, { base: 'さい' }, { base: 'カメラ' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きました' }, { base: '。' }], meaning: 'sai nghĩa và thì' }], correctChoiceId: 'a', analysis: 'Dùng カメラがほしいです để nói muốn có máy ảnh, không dùng を.' },
    ],
  },
  'reading-15': {
    id: 'reading-15', level: 'N5', skill: 'reading', title: 'Bài đọc 15 · Chọn quà sinh nhật',
    japaneseTitle: [{ base: '誕生日', ruby: 'たんじょうび' }, { base: 'の' }, { base: 'プレゼント' }],
    introduction: 'Đọc các câu N が ほしいです để biết từng người đang mong muốn đồ vật nào.',
    passage: [
      { base: '来週', ruby: 'らいしゅう' }, { base: 'は' }, { base: 'ミカ' }, { base: 'さん' }, { base: 'の' }, { base: '誕生日', ruby: 'たんじょうび' }, { base: 'です' }, { base: '。' }, { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: '赤', ruby: 'あか' }, { base: 'い' }, { base: 'かばん' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' },
      { base: '弟', ruby: 'おとうと' }, { base: 'は' }, { base: '青', ruby: 'あお' }, { base: 'い' }, { base: '自転車', ruby: 'じてんしゃ' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' }, { base: '父', ruby: 'ちち' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '欲', ruby: 'ほ' }, { base: 'しいです' }, { base: '。' },
      { base: 'わたし' }, { base: 'は' }, { base: 'みんな' }, { base: 'に' }, { base: '小', ruby: 'ちい' }, { base: 'さい' }, { base: 'プレゼント' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' },
    ],
    translation: 'Tuần sau là sinh nhật của Mika. Mika muốn có một chiếc cặp đỏ mới. Em trai muốn có một chiếc xe đạp xanh. Bố muốn có sách. Tôi sẽ mua quà nhỏ cho mọi người.',
    questions: [
      { id: 'q1', question: 'Mika muốn có gì?', choices: [{ id: 'a', label: 'Một chiếc cặp đỏ mới' }, { id: 'b', label: 'Một chiếc xe đạp xanh' }, { id: 'c', label: 'Một quyển sách' }], correctChoiceId: 'a', analysis: 'Câu đầu nêu 「赤いかばんが欲しいです」.' },
      { id: 'q2', question: 'Ai muốn có xe đạp xanh?', choices: [{ id: 'a', label: 'Em trai' }, { id: 'b', label: 'Bố' }, { id: 'c', label: 'Mika' }], correctChoiceId: 'a', analysis: 'Câu thứ hai ghi 「弟は青い自転車が欲しいです」.' },
      { id: 'q3', question: 'Người kể sẽ làm gì?', choices: [{ id: 'a', label: 'Mua quà nhỏ cho mọi người' }, { id: 'b', label: 'Mua xe đạp cho chính mình' }, { id: 'c', label: 'Không tặng quà' }], correctChoiceId: 'a', analysis: 'Câu cuối dùng 「みんなに小さいプレゼントを買います」.' },
    ],
  },
  'grammar-16': {
    id: 'grammar-16', level: 'N5', skill: 'grammar', title: 'Bài 16 · Vたいです',
    japaneseTitle: [{ base: '動詞', ruby: 'どうし' }, { base: 'の' }, { base: '希望', ruby: 'きぼう' }],
    explanation: [
      'Để nói muốn làm gì, đổi ます của động từ thành たいです: 「行きます」→「行きたいです」.',
      'Sau động từ たい, tân ngữ thường đi với を ở cấp độ cơ bản: 「映画を見たいです」. Đây là mong muốn của người nói, không phải lời ra lệnh.',
    ],
    formula: [{ base: 'Vます' }, { base: '→' }, { base: 'Vたいです' }],
    examples: [
      { japanese: [{ base: '日本', ruby: 'にほん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きたいです' }, { base: '。' }], translation: 'Tôi muốn đi Nhật Bản.', note: '行きます đổi thành 行きたいです.' },
      { japanese: [{ base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '話', ruby: 'はな' }, { base: 'したいです' }, { base: '。' }], translation: 'Tôi muốn nói tiếng Nhật.', note: 'します chuyển thành したいです.' },
      { japanese: [{ base: '今晩', ruby: 'こんばん' }, { base: '、' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'たいです' }, { base: '。' }], translation: 'Tối nay tôi muốn xem phim.', note: '見ます chuyển thành 見たいです.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '日本', ruby: 'にほん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'き___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'たいです' }], meaning: 'muốn đi' }, { id: 'b', text: [{ base: 'ません' }], meaning: 'không đi' }, { id: 'c', text: [{ base: 'ました' }], meaning: 'đã đi' }], correctChoiceId: 'a', analysis: 'Mong muốn hành động dùng たいです: 行きます → 行きたいです.' },
      { id: 'q2', prompt: [{ base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '話', ruby: 'はな' }, { base: 'したいです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi muốn nói tiếng Nhật.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi đã nói tiếng Nhật.' }], meaning: 'quá khứ' }, { id: 'c', text: [{ base: 'Tôi không nói tiếng Nhật.' }], meaning: 'phủ định' }], correctChoiceId: 'a', analysis: '話したいです là muốn nói chuyện / nói ngôn ngữ nào đó.' },
      { id: 'q3', prompt: [{ base: '「Tối nay tôi muốn xem phim」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '今晩', ruby: 'こんばん' }, { base: '、' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'たいです' }, { base: '。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '今晩', ruby: 'こんばん' }, { base: '、' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ました' }, { base: '。' }], meaning: 'đã xem' }, { id: 'c', text: [{ base: '今晩', ruby: 'こんばん' }, { base: '、' }, { base: '映画', ruby: 'えいが' }, { base: 'に' }, { base: '見', ruby: 'み' }, { base: 'たいです' }, { base: '。' }], meaning: 'sai trợ từ tân ngữ' }], correctChoiceId: 'a', analysis: '映画 là tân ngữ của xem nên dùng を, sau đó dùng 見たいです.' },
    ],
  },
  'reading-16': {
    id: 'reading-16', level: 'N5', skill: 'reading', title: 'Bài đọc 16 · Kế hoạch nghỉ hè',
    japaneseTitle: [{ base: '夏休', ruby: 'なつやす' }, { base: 'み' }, { base: 'の' }, { base: '計画', ruby: 'けいかく' }],
    introduction: 'Đọc dạng Vたいです để nhận diện mỗi nhân vật muốn làm gì trong kỳ nghỉ.',
    passage: [
      { base: '夏休', ruby: 'なつやす' }, { base: 'み' }, { base: 'に' }, { base: '、' }, { base: 'リン' }, { base: 'さん' }, { base: 'は' }, { base: '北海道', ruby: 'ほっかいどう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きたいです' }, { base: '。' }, { base: 'そこで' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: 'たくさん' }, { base: '撮', ruby: 'と' }, { base: 'りたいです' }, { base: '。' },
      { base: '弟', ruby: 'おとうと' }, { base: 'は' }, { base: '海', ruby: 'うみ' }, { base: 'で' }, { base: '泳', ruby: 'およ' }, { base: 'ぎたいです' }, { base: '。' }, { base: '母', ruby: 'はは' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'で' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みたいです' }, { base: '。' },
      { base: '家族', ruby: 'かぞく' }, { base: 'は' }, { base: '夜', ruby: 'よる' }, { base: 'に' }, { base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べたいです' }, { base: '。' },
    ],
    translation: 'Trong kỳ nghỉ hè, Lin muốn đi Hokkaido. Ở đó, bạn ấy muốn chụp nhiều ảnh. Em trai muốn bơi ở biển. Mẹ muốn đọc sách ở nhà. Cả gia đình muốn ăn tối cùng nhau.',
    questions: [
      { id: 'q1', question: 'Lin muốn đi đâu?', choices: [{ id: 'a', label: 'Hokkaido' }, { id: 'b', label: 'Trường học' }, { id: 'c', label: 'Nhà sách' }], correctChoiceId: 'a', analysis: 'Câu đầu có 「北海道へ行きたいです」.' },
      { id: 'q2', question: 'Mẹ muốn làm gì?', choices: [{ id: 'a', label: 'Đọc sách ở nhà' }, { id: 'b', label: 'Bơi ở biển' }, { id: 'c', label: 'Chụp ảnh ở Hokkaido' }], correctChoiceId: 'a', analysis: 'Đoạn giữa nói 「母は家で本を読みたいです」.' },
      { id: 'q3', question: 'Cả gia đình muốn làm gì vào buổi tối?', choices: [{ id: 'a', label: 'Ăn tối cùng nhau' }, { id: 'b', label: 'Xem tivi' }, { id: 'c', label: 'Đi học tiếng Nhật' }], correctChoiceId: 'a', analysis: 'Câu cuối ghi 「夜に一緒にごはんを食べたいです」.' },
    ],
  },
  'grammar-17': {
    id: 'grammar-17', level: 'N5', skill: 'grammar', title: 'Bài 17 · Vませんか',
    japaneseTitle: [{ base: '誘', ruby: 'さそ' }, { base: 'い' }],
    explanation: [
      'Dùng 「Vませんか」 để mời người nghe cùng làm gì một cách lịch sự. Hình thức giống phủ định ません nhưng ý nghĩa trong ngữ cảnh là “bạn có muốn… không?”.',
      'Có thể nhận lời bằng 「はい、いいですね」 hoặc từ chối mềm bằng 「すみません、ちょっと…」. Không dùng ませんか để nói một việc bạn không làm.',
    ],
    formula: [{ base: 'Vませんか' }],
    examples: [
      { japanese: [{ base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べませんか' }, { base: '。' }], translation: 'Bạn ăn trưa cùng tôi không?', note: 'Đây là lời mời cùng ăn, không phải phủ định “không ăn”.' },
      { japanese: [{ base: '土曜日', ruby: 'どようび' }, { base: 'に' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ませんか' }, { base: '。' }], translation: 'Thứ Bảy bạn đi xem phim không?', note: 'Mời người nghe xem phim vào thứ Bảy.' },
      { japanese: [{ base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'しませんか' }, { base: '。' }], translation: 'Chúng ta cùng học ở thư viện không?', note: 'します thành しませんか để tạo lời mời.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '土曜日', ruby: 'どようび' }, { base: 'に' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: '___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'ませんか' }], meaning: 'bạn xem không?' }, { id: 'b', text: [{ base: 'ました' }], meaning: 'đã xem' }, { id: 'c', text: [{ base: 'たいです' }], meaning: 'tôi muốn xem' }], correctChoiceId: 'a', analysis: 'Lời mời lịch sự dùng ませんか sau gốc động từ: 見ませんか.' },
      { id: 'q2', prompt: [{ base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べませんか' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Bạn ăn trưa cùng tôi không?' }], meaning: 'đúng lời mời' }, { id: 'b', text: [{ base: 'Tôi đã không ăn trưa.' }], meaning: 'sai chức năng' }, { id: 'c', text: [{ base: 'Bạn muốn mua cơm trưa không?' }], meaning: 'sai động từ' }], correctChoiceId: 'a', analysis: 'Có 一緒に và đuôi ませんか nên đây là lời mời cùng ăn.' },
      { id: 'q3', prompt: [{ base: 'Lời đáp nào nhận lời mời một cách tự nhiên?' }], choices: [{ id: 'a', text: [{ base: 'はい、いいですね。' }], meaning: 'vâng, hay đấy' }, { id: 'b', text: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '行', ruby: 'い' }, { base: 'きました。' }], meaning: 'đã đi hôm qua, không trả lời lời mời' }, { id: 'c', text: [{ base: '本', ruby: 'ほん' }, { base: 'がほしいです。' }], meaning: 'tôi muốn sách, sai ngữ cảnh' }], correctChoiceId: 'a', analysis: '「はい、いいですね」 là phản hồi tự nhiên để nhận lời mời.' },
    ],
  },
  'reading-17': {
    id: 'reading-17', level: 'N5', skill: 'reading', title: 'Bài đọc 17 · Lời mời cuối tuần',
    japaneseTitle: [{ base: '週末', ruby: 'しゅうまつ' }, { base: 'の' }, { base: '誘', ruby: 'さそ' }, { base: 'い' }],
    introduction: 'Đọc lời mời ませんか và xem ai nhận lời, ai không thể tham gia.',
    passage: [
      { base: '金曜日', ruby: 'きんようび' }, { base: '、' }, { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: 'ミカ' }, { base: 'さん' }, { base: 'に' }, { base: '言', ruby: 'い' }, { base: 'いました' }, { base: '。' }, { base: '「あした' }, { base: '、' }, { base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きませんか。' }, { base: '」' },
      { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '「はい' }, { base: '、' }, { base: 'いいですね。' }, { base: '」' }, { base: 'と' }, { base: '答', ruby: 'こた' }, { base: 'えました' }, { base: '。' }, { base: '二人', ruby: 'ふたり' }, { base: 'は' }, { base: '十時', ruby: 'じゅうじ' }, { base: 'に' }, { base: '駅', ruby: 'えき' }, { base: 'で' }, { base: '会', ruby: 'あ' }, { base: 'います' }, { base: '。' },
      { base: 'ユキ' }, { base: 'さん' }, { base: 'も' }, { base: '行', ruby: 'い' }, { base: 'きたいです' }, { base: '。' }, { base: 'でも' }, { base: '、' }, { base: 'その' }, { base: '日', ruby: 'ひ' }, { base: 'は' }, { base: '仕事', ruby: 'しごと' }, { base: 'です' }, { base: '。' }, { base: 'ユキ' }, { base: 'さん' }, { base: 'は' }, { base: '行', ruby: 'い' }, { base: 'きません' }, { base: '。' },
    ],
    translation: 'Thứ Sáu, Ken nói với Mika: “Ngày mai đi công viên cùng nhau không?” Mika trả lời: “Vâng, hay đấy.” Hai người gặp nhau ở ga lúc 10 giờ. Yuki cũng muốn đi, nhưng hôm đó phải làm việc. Yuki không đi.',
    questions: [
      { id: 'q1', question: 'Ken mời Mika làm gì?', choices: [{ id: 'a', label: 'Đi công viên cùng nhau' }, { id: 'b', label: 'Học ở thư viện' }, { id: 'c', label: 'Ăn trưa ở nhà' }], correctChoiceId: 'a', analysis: 'Lời mời là 「一緒に公園へ行きませんか」.' },
      { id: 'q2', question: 'Mika phản hồi thế nào?', choices: [{ id: 'a', label: 'Cô ấy nhận lời' }, { id: 'b', label: 'Cô ấy từ chối vì bận' }, { id: 'c', label: 'Cô ấy không trả lời' }], correctChoiceId: 'a', analysis: '「はい、いいですね」 cho biết Mika nhận lời.' },
      { id: 'q3', question: 'Vì sao Yuki không đi?', choices: [{ id: 'a', label: 'Vì hôm đó phải làm việc' }, { id: 'b', label: 'Vì trời mưa' }, { id: 'c', label: 'Vì không thích công viên' }], correctChoiceId: 'a', analysis: 'Đoạn cuối nêu 「その日は仕事です」 rồi 「行きません」.' },
    ],
  },
  'grammar-18': {
    id: 'grammar-18', level: 'N5', skill: 'grammar', title: 'Bài 18 · Vましょう',
    japaneseTitle: [{ base: '提案', ruby: 'ていあん' }],
    explanation: [
      'Dùng 「Vましょう」 để chủ động đề nghị “hãy/cùng làm…” trong tình huống thân thiện và lịch sự: 「行きましょう」.',
      'Khác với Vませんか là câu hỏi mời người nghe, Vましょう thể hiện đề xuất cùng làm ngay. Có thể đáp lại bằng 「はい、そうしましょう」.',
    ],
    formula: [{ base: 'Vます' }, { base: '→' }, { base: 'Vましょう' }],
    examples: [
      { japanese: [{ base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'りましょう' }, { base: '。' }], translation: 'Chúng ta cùng về nhé.', note: '帰ります đổi thành 帰りましょう.' },
      { japanese: [{ base: 'ここ' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'りましょう' }, { base: '。' }], translation: 'Hãy chụp ảnh ở đây.', note: 'Mẫu này đề xuất cùng thực hiện hành động.' },
      { japanese: [{ base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べましょう' }, { base: '。' }], translation: 'Chúng ta ăn trưa nhé.', note: '食べます chuyển thành 食べましょう.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '一緒', ruby: 'いっしょ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'り___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'ましょう' }], meaning: 'cùng về nhé' }, { id: 'b', text: [{ base: 'ませんか' }], meaning: 'lời mời dạng hỏi' }, { id: 'c', text: [{ base: 'ました' }], meaning: 'đã về' }], correctChoiceId: 'a', analysis: 'Đề nghị trực tiếp dùng 帰りましょう.' },
      { id: 'q2', prompt: [{ base: 'ここ' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'りましょう' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Hãy chụp ảnh ở đây.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi đã chụp ảnh ở đây.' }], meaning: 'quá khứ' }, { id: 'c', text: [{ base: 'Tôi không chụp ảnh ở đây.' }], meaning: 'phủ định' }], correctChoiceId: 'a', analysis: '撮りましょう là lời đề nghị cùng chụp ảnh.' },
      { id: 'q3', prompt: [{ base: 'Lời đáp tự nhiên cho một đề nghị Vましょう là gì?' }], choices: [{ id: 'a', text: [{ base: 'はい、そうしましょう。' }], meaning: 'vâng, cùng làm thế nhé' }, { id: 'b', text: [{ base: '本', ruby: 'ほん' }, { base: 'がほしいです。' }], meaning: 'không trả lời đề nghị' }, { id: 'c', text: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '行', ruby: 'い' }, { base: 'きませんでした。' }], meaning: 'một sự kiện quá khứ' }], correctChoiceId: 'a', analysis: '「はい、そうしましょう」 chấp nhận đề nghị cùng làm.' },
    ],
  },
  'reading-18': {
    id: 'reading-18', level: 'N5', skill: 'reading', title: 'Bài đọc 18 · Sau giờ học',
    japaneseTitle: [{ base: '放課後', ruby: 'ほうかご' }, { base: 'の' }, { base: '計画', ruby: 'けいかく' }],
    introduction: 'Đọc các đề nghị Vましょう để biết nhóm bạn quyết định làm gì và theo thứ tự nào.',
    passage: [
      { base: '放課後', ruby: 'ほうかご' }, { base: '、' }, { base: 'ナム' }, { base: 'さん' }, { base: 'は' }, { base: '友達', ruby: 'ともだち' }, { base: 'に' }, { base: '言', ruby: 'い' }, { base: 'いました' }, { base: '。' }, { base: '「まず' }, { base: '、' }, { base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'しましょう。' }, { base: '」' },
      { base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '「はい' }, { base: '、' }, { base: 'そうしましょう。' }, { base: '」' }, { base: 'と' }, { base: '言', ruby: 'い' }, { base: 'いました' }, { base: '。' }, { base: '二時間', ruby: 'にじかん' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'しました' }, { base: '。' },
      { base: 'その' }, { base: '後', ruby: 'あと' }, { base: '、' }, { base: 'ナム' }, { base: 'さん' }, { base: 'は' }, { base: '「カフェ' }, { base: 'で' }, { base: '休', ruby: 'やす' }, { base: 'みましょう。' }, { base: '」' }, { base: 'と' }, { base: '言', ruby: 'い' }, { base: 'いました' }, { base: '。' }, { base: '二人', ruby: 'ふたり' }, { base: 'は' }, { base: 'コーヒー' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みました' }, { base: '。' },
    ],
    translation: 'Sau giờ học, Nam nói với bạn: “Trước hết, chúng ta hãy học ở thư viện.” Bạn đáp: “Vâng, cùng làm thế nhé.” Hai người đã học hai tiếng. Sau đó Nam nói: “Hãy nghỉ ở quán cà phê.” Hai người đã uống cà phê.',
    questions: [
      { id: 'q1', question: 'Nhóm bạn làm gì trước?', choices: [{ id: 'a', label: 'Học ở thư viện' }, { id: 'b', label: 'Uống cà phê' }, { id: 'c', label: 'Đi công viên' }], correctChoiceId: 'a', analysis: 'Nam nói 「まず、図書館で勉強しましょう」.' },
      { id: 'q2', question: 'Họ học trong bao lâu?', choices: [{ id: 'a', label: 'Hai tiếng' }, { id: 'b', label: 'Một tiếng' }, { id: 'c', label: 'Cả ngày' }], correctChoiceId: 'a', analysis: 'Đoạn giữa có 「二時間勉強しました」.' },
      { id: 'q3', question: 'Sau khi học, Nam đề nghị gì?', choices: [{ id: 'a', label: 'Nghỉ ở quán cà phê' }, { id: 'b', label: 'Về nhà ngay' }, { id: 'c', label: 'Đi mua sách' }], correctChoiceId: 'a', analysis: 'Câu cuối có 「カフェで休みましょう」.' },
    ],
  },
  'grammar-19': {
    id: 'grammar-19', level: 'N5', skill: 'grammar', title: 'Bài 19 · N で Vます',
    japaneseTitle: [{ base: '行動', ruby: 'こうどう' }, { base: 'の' }, { base: '場所', ruby: 'ばしょ' }],
    explanation: [
      'Dùng trợ từ 「で」 sau địa điểm nơi một hành động diễn ra: 「図書館で勉強します」 nghĩa là học ở thư viện.',
      'Phân biệt với に/へ: に và へ thường chỉ nơi đến hoặc nơi tồn tại, còn で nhấn vào nơi thực hiện hành động như ăn, học, đọc hoặc mua.',
    ],
    formula: [{ base: '場所', ruby: 'ばしょ' }, { base: 'で' }, { base: 'Vます' }],
    examples: [
      { japanese: [{ base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }], translation: 'Tôi học ở thư viện.', note: '図書館 là nơi hành động học diễn ra.' },
      { japanese: [{ base: 'レストラン' }, { base: 'で' }, { base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' }], translation: 'Tôi ăn trưa ở nhà hàng.', note: 'Dùng で vì đây là hành động ăn tại một nơi.' },
      { japanese: [{ base: '店', ruby: 'みせ' }, { base: 'で' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], translation: 'Tôi mua sách ở cửa hàng.', note: '店で chỉ địa điểm mua.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '図書館', ruby: 'としょかん' }, { base: '___' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'で' }], meaning: 'tại nơi hành động diễn ra' }, { id: 'b', text: [{ base: 'を' }], meaning: 'tân ngữ' }, { id: 'c', text: [{ base: 'と' }], meaning: 'cùng với' }], correctChoiceId: 'a', analysis: 'Học là hành động diễn ra ở thư viện nên dùng 図書館で.' },
      { id: 'q2', prompt: [{ base: '店', ruby: 'みせ' }, { base: 'で' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi mua sách ở cửa hàng.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi đến cửa hàng để mua sách.' }], meaning: 'không phải nghĩa trực tiếp của mẫu' }, { id: 'c', text: [{ base: 'Tôi có sách ở cửa hàng.' }], meaning: 'sai động từ' }], correctChoiceId: 'a', analysis: '店で chỉ địa điểm của hành động 買います.' },
      { id: 'q3', prompt: [{ base: 'Câu nào dùng で đúng để chỉ nơi hành động?' }], choices: [{ id: 'a', text: [{ base: '公園', ruby: 'こうえん' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ります。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '公園', ruby: 'こうえん' }, { base: 'を' }, { base: '写真', ruby: 'しゃしん' }, { base: 'で' }, { base: '撮', ruby: 'と' }, { base: 'ります。' }], meaning: 'sai vai trò trợ từ' }, { id: 'c', text: [{ base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ります。' }], meaning: 'không dùng cho địa điểm hành động này' }], correctChoiceId: 'a', analysis: '公園で写真を撮ります: ở công viên chụp ảnh.' },
    ],
  },
  'reading-19': {
    id: 'reading-19', level: 'N5', skill: 'reading', title: 'Bài đọc 19 · Ngày thứ Bảy bận rộn',
    japaneseTitle: [{ base: '土曜日', ruby: 'どようび' }, { base: 'の' }, { base: '一日', ruby: 'いちにち' }],
    introduction: 'Đọc trợ từ で để gắn đúng hoạt động với đúng địa điểm trong một ngày.',
    passage: [
      { base: '土曜日', ruby: 'どようび' }, { base: 'の' }, { base: '朝', ruby: 'あさ' }, { base: '、' }, { base: 'ソン' }, { base: 'さん' }, { base: 'は' }, { base: 'カフェ' }, { base: 'で' }, { base: 'コーヒー' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みます' }, { base: '。' },
      { base: 'その' }, { base: '後', ruby: 'あと' }, { base: '、' }, { base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }, { base: '昼', ruby: 'ひる' }, { base: 'ごはん' }, { base: 'は' }, { base: 'レストラン' }, { base: 'で' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' },
      { base: '午後', ruby: 'ごご' }, { base: '、' }, { base: '公園', ruby: 'こうえん' }, { base: 'で' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ります' }, { base: '。' },
    ],
    translation: 'Sáng thứ Bảy, Son uống cà phê ở quán. Sau đó, bạn ấy học tiếng Nhật ở thư viện. Bạn ấy ăn trưa ở nhà hàng. Buổi chiều, bạn ấy chụp ảnh với bạn ở công viên.',
    questions: [
      { id: 'q1', question: 'Son học tiếng Nhật ở đâu?', choices: [{ id: 'a', label: 'Ở thư viện' }, { id: 'b', label: 'Ở quán cà phê' }, { id: 'c', label: 'Ở công viên' }], correctChoiceId: 'a', analysis: 'Đoạn giữa viết 「図書館で日本語を勉強します」.' },
      { id: 'q2', question: 'Son ăn trưa ở đâu?', choices: [{ id: 'a', label: 'Ở nhà hàng' }, { id: 'b', label: 'Ở thư viện' }, { id: 'c', label: 'Ở nhà' }], correctChoiceId: 'a', analysis: 'Câu thứ hai có 「レストランで食べます」.' },
      { id: 'q3', question: 'Buổi chiều Son làm gì ở công viên?', choices: [{ id: 'a', label: 'Chụp ảnh với bạn' }, { id: 'b', label: 'Học tiếng Nhật' }, { id: 'c', label: 'Uống cà phê' }], correctChoiceId: 'a', analysis: 'Câu cuối có 「公園で友達と写真を撮ります」.' },
    ],
  },
  'grammar-20': {
    id: 'grammar-20', level: 'N5', skill: 'grammar', title: 'Bài 20 · Vてください',
    japaneseTitle: [{ base: '依頼', ruby: 'いらい' }],
    explanation: [
      'Dùng động từ ở thể て với ください để đưa một yêu cầu lịch sự: 「読んでください」 nghĩa là “xin hãy đọc”.',
      'Một số đổi dạng quen thuộc: 食べます→食べて, 見ます→見て, 読みます→読んで, 行きます→行って. Hãy học từng động từ cùng thể て của nó.',
    ],
    formula: [{ base: 'Vてください' }],
    examples: [
      { japanese: [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'んでください' }, { base: '。' }], translation: 'Xin hãy đọc quyển sách này.', note: '読みます đổi thành 読んで rồi thêm ください.' },
      { japanese: [{ base: 'ここ' }, { base: 'に' }, { base: '名前', ruby: 'なまえ' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'いてください' }, { base: '。' }], translation: 'Xin hãy viết tên ở đây.', note: '書きます chuyển thành 書いてください.' },
      { japanese: [{ base: 'ちょっと' }, { base: '待', ruby: 'ま' }, { base: 'ってください' }, { base: '。' }], translation: 'Xin hãy đợi một chút.', note: '待ちます chuyển thành 待ってください.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'んで___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'ください' }], meaning: 'xin hãy đọc' }, { id: 'b', text: [{ base: 'いました' }], meaning: 'đã đọc (sai dạng)' }, { id: 'c', text: [{ base: 'たいです' }], meaning: 'muốn đọc' }], correctChoiceId: 'a', analysis: 'Yêu cầu lịch sự ghép thể て với ください: 読んでください.' },
      { id: 'q2', prompt: [{ base: 'ちょっと' }, { base: '待', ruby: 'ま' }, { base: 'ってください' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Xin hãy đợi một chút.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi đã đợi một chút.' }], meaning: 'quá khứ, không yêu cầu' }, { id: 'c', text: [{ base: 'Tôi không muốn đợi.' }], meaning: 'sai nghĩa' }], correctChoiceId: 'a', analysis: '待ってください là cách yêu cầu ai đó chờ một cách lịch sự.' },
      { id: 'q3', prompt: [{ base: 'Câu nào là yêu cầu lịch sự “xin hãy viết tên ở đây”?' }], choices: [{ id: 'a', text: [{ base: 'ここ' }, { base: 'に' }, { base: '名前', ruby: 'なまえ' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'いてください。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'ここ' }, { base: 'に' }, { base: '名前', ruby: 'なまえ' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'きました。' }], meaning: 'đã viết' }, { id: 'c', text: [{ base: 'ここ' }, { base: 'に' }, { base: '名前', ruby: 'なまえ' }, { base: 'が' }, { base: '書', ruby: 'か' }, { base: 'いてください。' }], meaning: 'sai trợ từ tân ngữ' }], correctChoiceId: 'a', analysis: 'Tên là tân ngữ của viết nên dùng を, và 書いてください tạo yêu cầu.' },
    ],
  },
  'reading-20': {
    id: 'reading-20', level: 'N5', skill: 'reading', title: 'Bài đọc 20 · Ở thư viện',
    japaneseTitle: [{ base: '図書館', ruby: 'としょかん' }, { base: 'の' }, { base: '案内', ruby: 'あんない' }],
    introduction: 'Đọc thể てください trong các chỉ dẫn ngắn và nhận ra người đọc cần làm hoặc không cần làm gì.',
    passage: [
      { base: '図書館', ruby: 'としょかん' }, { base: 'に' }, { base: '入', ruby: 'はい' }, { base: 'ってください' }, { base: '。' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '借', ruby: 'か' }, { base: 'りたいですか' }, { base: '。' },
      { base: 'まず' }, { base: '、' }, { base: 'ここ' }, { base: 'に' }, { base: '名前', ruby: 'なまえ' }, { base: 'と' }, { base: '電話番号', ruby: 'でんわばんごう' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'いてください' }, { base: '。' },
      { base: 'そして' }, { base: '、' }, { base: '借', ruby: 'か' }, { base: 'りたい' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '持', ruby: 'も' }, { base: 'ってきてください' }, { base: '。' }, { base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '大', ruby: 'おお' }, { base: 'きい' }, { base: '声', ruby: 'こえ' }, { base: 'で' }, { base: '話', ruby: 'はな' }, { base: 'さないでください' }, { base: '。' },
    ],
    translation: 'Xin hãy vào thư viện. Bạn muốn mượn sách phải không? Trước hết, xin hãy viết tên và số điện thoại ở đây. Sau đó, xin hãy mang quyển sách bạn muốn mượn tới. Xin đừng nói to ở thư viện.',
    questions: [
      { id: 'q1', question: 'Trước hết người đọc phải làm gì?', choices: [{ id: 'a', label: 'Viết tên và số điện thoại' }, { id: 'b', label: 'Nói to' }, { id: 'c', label: 'Đọc tất cả sách' }], correctChoiceId: 'a', analysis: 'Câu có 「まず」 yêu cầu viết 名前と電話番号.' },
      { id: 'q2', question: 'Sau đó người đọc cần mang gì?', choices: [{ id: 'a', label: 'Quyển sách muốn mượn' }, { id: 'b', label: 'Một chiếc máy ảnh' }, { id: 'c', label: 'Cà phê' }], correctChoiceId: 'a', analysis: 'Đoạn thứ ba viết 「借りたい本を持ってきてください」.' },
      { id: 'q3', question: 'Điều gì không được làm ở thư viện?', choices: [{ id: 'a', label: 'Nói to' }, { id: 'b', label: 'Viết tên' }, { id: 'c', label: 'Mượn sách' }], correctChoiceId: 'a', analysis: '「大きい声で話さないでください」 nghĩa là xin đừng nói to.' },
    ],
  },
  'grammar-21': {
    id: 'grammar-21', level: 'N5', skill: 'grammar', title: 'Bài 21 · Vています',
    japaneseTitle: [{ base: '進行中', ruby: 'しんこうちゅう' }],
    explanation: [
      'Nối thể て với います để nói một hành động đang diễn ra: 「読んでいます」 nghĩa là đang đọc.',
      'Cấu trúc này trả lời tốt cho câu hỏi 「何をしていますか」 (đang làm gì?). Hãy dùng cùng các thể て đã học: 食べている, 読んでいる, 書いている.',
    ],
    formula: [{ base: 'Vて' }, { base: 'います' }],
    examples: [
      { japanese: [{ base: '今', ruby: 'いま' }, { base: '、' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'しています' }, { base: '。' }], translation: 'Bây giờ tôi đang học tiếng Nhật.', note: 'しています diễn tả hành động học đang xảy ra.' },
      { japanese: [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: 'テレビ' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ています' }, { base: '。' }], translation: 'Mẹ đang xem tivi.', note: '見て + います tạo thành 見ています.' },
      { japanese: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '手紙', ruby: 'てがみ' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'いています' }, { base: '。' }], translation: 'Bạn tôi đang viết thư.', note: '書いています là đang viết.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '今', ruby: 'いま' }, { base: '、' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'し___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'ています' }], meaning: 'đang học' }, { id: 'b', text: [{ base: 'ました' }], meaning: 'đã học' }, { id: 'c', text: [{ base: 'ません' }], meaning: 'không học' }], correctChoiceId: 'a', analysis: '今 và しています cho biết hành động đang diễn ra.' },
      { id: 'q2', prompt: [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: 'テレビ' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ています' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Mẹ đang xem tivi.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Mẹ muốn xem tivi.' }], meaning: 'sai dạng たい' }, { id: 'c', text: [{ base: 'Mẹ đã không xem tivi.' }], meaning: 'sai phủ định quá khứ' }], correctChoiceId: 'a', analysis: '見ています dùng để mô tả hành động đang xem.' },
      { id: 'q3', prompt: [{ base: '「Bạn tôi đang viết thư」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '手紙', ruby: 'てがみ' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'いています。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '手紙', ruby: 'てがみ' }, { base: 'を' }, { base: '書', ruby: 'か' }, { base: 'きました。' }], meaning: 'đã viết' }, { id: 'c', text: [{ base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '手紙', ruby: 'てがみ' }, { base: 'に' }, { base: '書', ruby: 'か' }, { base: 'いています。' }], meaning: 'sai trợ từ tân ngữ' }], correctChoiceId: 'a', analysis: '手紙 là thứ được viết nên dùng を; 書いています là đang viết.' },
    ],
  },
  'reading-21': {
    id: 'reading-21', level: 'N5', skill: 'reading', title: 'Bài đọc 21 · Bây giờ mọi người đang làm gì?',
    japaneseTitle: [{ base: '今', ruby: 'いま' }, { base: '、' }, { base: '何', ruby: 'なに' }, { base: 'を' }, { base: 'していますか' }],
    introduction: 'Đọc Vています để biết từng người đang làm gì ở cùng một thời điểm.',
    passage: [
      { base: '今', ruby: 'いま' }, { base: '、' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '家族', ruby: 'かぞく' }, { base: 'が' }, { base: 'います' }, { base: '。' }, { base: '父', ruby: 'ちち' }, { base: 'は' }, { base: '新聞', ruby: 'しんぶん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'んでいます' }, { base: '。' },
      { base: '母', ruby: 'はは' }, { base: 'は' }, { base: '台所', ruby: 'だいどころ' }, { base: 'で' }, { base: 'ごはん' }, { base: 'を' }, { base: '作', ruby: 'つく' }, { base: 'っています' }, { base: '。' }, { base: '弟', ruby: 'おとうと' }, { base: 'は' }, { base: '部屋', ruby: 'へや' }, { base: 'で' }, { base: 'ゲーム' }, { base: 'を' }, { base: 'しています' }, { base: '。' },
      { base: 'わたし' }, { base: 'は' }, { base: '机', ruby: 'つくえ' }, { base: 'で' }, { base: '宿題', ruby: 'しゅくだい' }, { base: 'を' }, { base: 'しています' }, { base: '。' },
    ],
    translation: 'Bây giờ gia đình đang ở nhà. Bố đang đọc báo. Mẹ đang nấu cơm ở bếp. Em trai đang chơi game trong phòng. Tôi đang làm bài tập ở bàn.',
    questions: [
      { id: 'q1', question: 'Bố đang làm gì?', choices: [{ id: 'a', label: 'Đọc báo' }, { id: 'b', label: 'Nấu cơm' }, { id: 'c', label: 'Chơi game' }], correctChoiceId: 'a', analysis: 'Câu đầu nêu 「父は新聞を読んでいます」.' },
      { id: 'q2', question: 'Mẹ đang làm gì và ở đâu?', choices: [{ id: 'a', label: 'Nấu cơm ở bếp' }, { id: 'b', label: 'Đọc báo ở bàn' }, { id: 'c', label: 'Chơi game trong phòng' }], correctChoiceId: 'a', analysis: 'Đoạn giữa viết 「母は台所でごはんを作っています」.' },
      { id: 'q3', question: 'Người kể đang làm gì?', choices: [{ id: 'a', label: 'Làm bài tập ở bàn' }, { id: 'b', label: 'Nấu cơm ở bếp' }, { id: 'c', label: 'Đọc sách ở thư viện' }], correctChoiceId: 'a', analysis: 'Câu cuối có 「机で宿題をしています」.' },
    ],
  },
  'grammar-22': {
    id: 'grammar-22', level: 'N5', skill: 'grammar', title: 'Bài 22 · Vてもいいです',
    japaneseTitle: [{ base: '許可', ruby: 'きょか' }],
    explanation: [
      'Dùng 「Vてもいいですか」 để hỏi có được làm gì không. Khi cho phép, có thể trả lời 「はい、いいです」.',
      'Dạng này ghép thể て với もいいです: 「食べて」→「食べてもいいですか」. Đây là xin phép, không phải yêu cầu người khác làm.',
    ],
    formula: [{ base: 'Vてもいいですか' }],
    examples: [
      { japanese: [{ base: 'ここ' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ってもいいですか' }, { base: '。' }], translation: 'Tôi có được chụp ảnh ở đây không?', note: '撮って + もいいですか là hỏi xin phép.' },
      { japanese: [{ base: 'この' }, { base: '水', ruby: 'みず' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'んでもいいですか' }, { base: '。' }], translation: 'Tôi có được uống nước này không?', note: '飲んで + もいいですか.' },
      { japanese: [{ base: 'はい' }, { base: '、' }, { base: '使', ruby: 'つか' }, { base: 'ってもいいです' }, { base: '。' }], translation: 'Vâng, bạn có thể dùng nó.', note: 'Đây là câu trả lời cho phép.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: 'ここ' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'っても___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'いいですか' }], meaning: 'có được không?' }, { id: 'b', text: [{ base: 'ください' }], meaning: 'xin hãy chụp' }, { id: 'c', text: [{ base: 'います' }], meaning: 'đang chụp' }], correctChoiceId: 'a', analysis: 'Hỏi xin phép dùng 撮ってもいいですか.' },
      { id: 'q2', prompt: [{ base: 'この' }, { base: '水', ruby: 'みず' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'んでもいいですか' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi có được uống nước này không?' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Xin hãy uống nước này.' }], meaning: 'đó là yêu cầu' }, { id: 'c', text: [{ base: 'Tôi đang uống nước này.' }], meaning: 'đó là hành động đang diễn ra' }], correctChoiceId: 'a', analysis: '飲んでもいいですか là câu hỏi xin phép uống.' },
      { id: 'q3', prompt: [{ base: 'Câu trả lời nào cho phép người nghe dùng đồ vật?' }], choices: [{ id: 'a', text: [{ base: 'はい、' }, { base: '使', ruby: 'つか' }, { base: 'ってもいいです。' }], meaning: 'vâng, có thể dùng' }, { id: 'b', text: [{ base: 'いいえ、' }, { base: '見', ruby: 'み' }, { base: 'ています。' }], meaning: 'không trả lời xin phép' }, { id: 'c', text: [{ base: '昨日', ruby: 'きのう' }, { base: '、' }, { base: '買', ruby: 'か' }, { base: 'いました。' }], meaning: 'không liên quan' }], correctChoiceId: 'a', analysis: '使ってもいいです là cho phép người khác sử dụng.' },
    ],
  },
  'reading-22': {
    id: 'reading-22', level: 'N5', skill: 'reading', title: 'Bài đọc 22 · Trong lớp học',
    japaneseTitle: [{ base: '教室', ruby: 'きょうしつ' }, { base: 'の' }, { base: '質問', ruby: 'しつもん' }],
    introduction: 'Đọc câu hỏi Vてもいいですか và đáp án để biết hoạt động nào được phép trong lớp.',
    passage: [
      { base: '授業', ruby: 'じゅぎょう' }, { base: 'の' }, { base: '前', ruby: 'まえ' }, { base: 'に' }, { base: '、' }, { base: 'ミン' }, { base: 'さん' }, { base: 'は' }, { base: '先生', ruby: 'せんせい' }, { base: 'に' }, { base: '聞', ruby: 'き' }, { base: 'きました' }, { base: '。' }, { base: '「ここ' }, { base: 'に' }, { base: '座', ruby: 'すわ' }, { base: 'ってもいいですか。' }, { base: '」' },
      { base: '先生', ruby: 'せんせい' }, { base: 'は' }, { base: '「はい' }, { base: '、' }, { base: 'どうぞ。' }, { base: '」' }, { base: 'と' }, { base: '言', ruby: 'い' }, { base: 'いました' }, { base: '。' }, { base: 'ミン' }, { base: 'さん' }, { base: 'は' }, { base: '「水', ruby: 'みず' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'んでもいいですか。' }, { base: '」' }, { base: 'と' }, { base: '聞', ruby: 'き' }, { base: 'きました' },
      { base: '先生', ruby: 'せんせい' }, { base: 'は' }, { base: '「はい' }, { base: '、' }, { base: 'いいですよ。' }, { base: 'でも' }, { base: '、' }, { base: '教室', ruby: 'きょうしつ' }, { base: 'で' }, { base: '食', ruby: 'た' }, { base: 'べてはいけません。' }, { base: '」' }, { base: 'と' }, { base: '言', ruby: 'い' }, { base: 'いました' }, { base: '。' },
    ],
    translation: 'Trước giờ học, Minh hỏi giáo viên: “Em có được ngồi đây không?” Giáo viên trả lời: “Vâng, mời em.” Minh hỏi: “Em có được uống nước không?” Giáo viên nói: “Vâng, được. Nhưng không được ăn trong lớp.”',
    questions: [
      { id: 'q1', question: 'Minh có được ngồi ở đó không?', choices: [{ id: 'a', label: 'Có, giáo viên cho phép' }, { id: 'b', label: 'Không, giáo viên không trả lời' }, { id: 'c', label: 'Chỉ được đứng' }], correctChoiceId: 'a', analysis: 'Giáo viên nói 「はい、どうぞ」, tức là cho phép.' },
      { id: 'q2', question: 'Minh có được uống nước không?', choices: [{ id: 'a', label: 'Có' }, { id: 'b', label: 'Không' }, { id: 'c', label: 'Chỉ được uống cà phê' }], correctChoiceId: 'a', analysis: 'Giáo viên đáp 「はい、いいですよ」.' },
      { id: 'q3', question: 'Không được làm gì trong lớp?', choices: [{ id: 'a', label: 'Ăn' }, { id: 'b', label: 'Ngồi' }, { id: 'c', label: 'Uống nước' }], correctChoiceId: 'a', analysis: 'Câu cuối nói 「教室で食べてはいけません」: không được ăn trong lớp.' },
    ],
  },
  'grammar-23': {
    id: 'grammar-23', level: 'N5', skill: 'grammar', title: 'Bài 23 · Vてはいけません',
    japaneseTitle: [{ base: '禁止', ruby: 'きんし' }],
    explanation: [
      'Dùng 「Vてはいけません」 để nói không được phép làm một hành động: 「入ってはいけません」 nghĩa là không được vào.',
      'Mẫu này có sắc thái quy định/cấm đoán. Trong hội thoại thân mật, người Nhật cũng dùng ちゃだめ, nhưng N5 nên nắm chắc dạng lịch sự てはいけません trước.',
    ],
    formula: [{ base: 'Vてはいけません' }],
    examples: [
      { japanese: [{ base: 'ここ' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ってはいけません' }, { base: '。' }], translation: 'Không được chụp ảnh ở đây.', note: '撮って + はいけません tạo quy định cấm chụp ảnh.' },
      { japanese: [{ base: 'この' }, { base: '部屋', ruby: 'へや' }, { base: 'に' }, { base: '入', ruby: 'はい' }, { base: 'ってはいけません' }, { base: '。' }], translation: 'Không được vào phòng này.', note: '入ってはいけません là không được vào.' },
      { japanese: [{ base: '電車', ruby: 'でんしゃ' }, { base: 'で' }, { base: '大', ruby: 'おお' }, { base: 'きい' }, { base: '声', ruby: 'こえ' }, { base: 'で' }, { base: '話', ruby: 'はな' }, { base: 'してはいけません' }, { base: '。' }], translation: 'Không được nói to trên tàu.', note: '話してはいけません cấm nói chuyện to.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: 'ここ' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'っては___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'いけません' }], meaning: 'không được chụp' }, { id: 'b', text: [{ base: 'いいですか' }], meaning: 'có được chụp không?' }, { id: 'c', text: [{ base: 'います' }], meaning: 'đang chụp' }], correctChoiceId: 'a', analysis: 'Cấm đoán dùng 撮ってはいけません.' },
      { id: 'q2', prompt: [{ base: 'この' }, { base: '部屋', ruby: 'へや' }, { base: 'に' }, { base: '入', ruby: 'はい' }, { base: 'ってはいけません' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Không được vào phòng này.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Xin hãy vào phòng này.' }], meaning: 'yêu cầu, ngược nghĩa' }, { id: 'c', text: [{ base: 'Có được vào phòng này không?' }], meaning: 'câu xin phép' }], correctChoiceId: 'a', analysis: '入ってはいけません nói rõ là bị cấm vào.' },
      { id: 'q3', prompt: [{ base: 'Câu nào cấm nói to trên tàu?' }], choices: [{ id: 'a', text: [{ base: '電車', ruby: 'でんしゃ' }, { base: 'で' }, { base: '大', ruby: 'おお' }, { base: 'きい' }, { base: '声', ruby: 'こえ' }, { base: 'で' }, { base: '話', ruby: 'はな' }, { base: 'してはいけません。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '電車', ruby: 'でんしゃ' }, { base: 'で' }, { base: '大', ruby: 'おお' }, { base: 'きい' }, { base: '声', ruby: 'こえ' }, { base: 'で' }, { base: '話', ruby: 'はな' }, { base: 'してください。' }], meaning: 'xin hãy nói to, ngược nghĩa' }, { id: 'c', text: [{ base: '電車', ruby: 'でんしゃ' }, { base: 'に' }, { base: '大', ruby: 'おお' }, { base: 'きい' }, { base: '声', ruby: 'こえ' }, { base: 'を' }, { base: '話', ruby: 'はな' }, { base: 'しています。' }], meaning: 'sai cấu trúc và nghĩa' }], correctChoiceId: 'a', analysis: 'Địa điểm hành động là 電車で và mẫu cấm là 話してはいけません.' },
    ],
  },
  'reading-23': {
    id: 'reading-23', level: 'N5', skill: 'reading', title: 'Bài đọc 23 · Quy tắc ở bảo tàng',
    japaneseTitle: [{ base: '美術館', ruby: 'びじゅつかん' }, { base: 'の' }, { base: '規則', ruby: 'きそく' }],
    introduction: 'Đọc các biển báo cấm để biết điều gì không được làm khi tham quan bảo tàng.',
    passage: [
      { base: 'この' }, { base: '美術館', ruby: 'びじゅつかん' }, { base: 'に' }, { base: 'は' }, { base: '大切', ruby: 'たいせつ' }, { base: 'な' }, { base: '絵', ruby: 'え' }, { base: 'があります' }, { base: '。' }, { base: '絵', ruby: 'え' }, { base: 'に' }, { base: '触', ruby: 'さわ' }, { base: 'ってはいけません' }, { base: '。' },
      { base: '部屋', ruby: 'へや' }, { base: 'の' }, { base: '中', ruby: 'なか' }, { base: 'で' }, { base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '撮', ruby: 'と' }, { base: 'ってはいけません' }, { base: '。' }, { base: '食', ruby: 'た' }, { base: 'べたり' }, { base: '飲', ruby: 'の' }, { base: 'んだり' }, { base: 'してはいけません' }, { base: '。' },
      { base: '静', ruby: 'しず' }, { base: 'かに' }, { base: '見', ruby: 'み' }, { base: 'てください' }, { base: '。' },
    ],
    translation: 'Bảo tàng này có những bức tranh quan trọng. Không được chạm vào tranh. Không được chụp ảnh trong phòng. Không được ăn hoặc uống. Xin hãy xem một cách yên lặng.',
    questions: [
      { id: 'q1', question: 'Không được làm gì với tranh?', choices: [{ id: 'a', label: 'Chạm vào tranh' }, { id: 'b', label: 'Xem tranh' }, { id: 'c', label: 'Đi vào bảo tàng' }], correctChoiceId: 'a', analysis: 'Câu đầu có 「絵に触ってはいけません」.' },
      { id: 'q2', question: 'Có được chụp ảnh trong phòng không?', choices: [{ id: 'a', label: 'Không' }, { id: 'b', label: 'Có, nhưng chỉ buổi sáng' }, { id: 'c', label: 'Có, nếu không dùng đèn' }], correctChoiceId: 'a', analysis: 'Đoạn giữa ghi 「写真を撮ってはいけません」.' },
      { id: 'q3', question: 'Khách nên xem bảo tàng như thế nào?', choices: [{ id: 'a', label: 'Một cách yên lặng' }, { id: 'b', label: 'Vừa ăn vừa xem' }, { id: 'c', label: 'Nói thật to' }], correctChoiceId: 'a', analysis: 'Câu cuối yêu cầu 「静かに見てください」.' },
    ],
  },
  'grammar-24': {
    id: 'grammar-24', level: 'N5', skill: 'grammar', title: 'Bài 24 · A より B のほうが…です',
    japaneseTitle: [{ base: '比較', ruby: 'ひかく' }],
    explanation: [
      'Dùng 「AよりBのほうが…です」 để nói B có một đặc điểm mạnh hơn A: 「電車よりバスのほうが安いです」.',
      'A đứng trước より là mốc so sánh; B đứng trước のほうが là đối tượng nổi bật hơn. Sau đó dùng tính từ hoặc điều muốn so sánh.',
    ],
    formula: [{ base: 'A' }, { base: 'より' }, { base: 'B' }, { base: 'のほうが' }, { base: 'Aです' }],
    examples: [
      { japanese: [{ base: '電車', ruby: 'でんしゃ' }, { base: 'より' }, { base: 'バス' }, { base: 'のほうが' }, { base: '安', ruby: 'やす' }, { base: 'いです' }, { base: '。' }], translation: 'Xe buýt rẻ hơn tàu điện.', note: 'Xe buýt là đối tượng rẻ hơn nên đứng trước のほうが.' },
      { japanese: [{ base: '東京', ruby: 'とうきょう' }, { base: 'より' }, { base: '京都', ruby: 'きょうと' }, { base: 'のほうが' }, { base: '静', ruby: 'しず' }, { base: 'かです' }, { base: '。' }], translation: 'Kyoto yên tĩnh hơn Tokyo.', note: 'Tính từ đuôi な 「静か」 vẫn đi sau のほうが.' },
      { japanese: [{ base: '犬', ruby: 'いぬ' }, { base: 'より' }, { base: '猫', ruby: 'ねこ' }, { base: 'のほうが' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }], translation: 'Tôi thích mèo hơn chó.', note: 'Cấu trúc cũng dùng với 好きです để so sánh sở thích.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '電車', ruby: 'でんしゃ' }, { base: 'より' }, { base: 'バス' }, { base: 'のほうが' }, { base: '___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: '安', ruby: 'やす' }, { base: 'いです' }], meaning: 'rẻ hơn' }, { id: 'b', text: [{ base: '食', ruby: 'た' }, { base: 'べます' }], meaning: 'ăn, không phù hợp' }, { id: 'c', text: [{ base: 'ませんか' }], meaning: 'lời mời' }], correctChoiceId: 'a', analysis: 'Sau cấu trúc so sánh cần đặc điểm; 安いです nghĩa là rẻ.' },
      { id: 'q2', prompt: [{ base: '東京', ruby: 'とうきょう' }, { base: 'より' }, { base: '京都', ruby: 'きょうと' }, { base: 'のほうが' }, { base: '静', ruby: 'しず' }, { base: 'かです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Kyoto yên tĩnh hơn Tokyo.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tokyo yên tĩnh hơn Kyoto.' }], meaning: 'đảo đối tượng' }, { id: 'c', text: [{ base: 'Kyoto không yên tĩnh.' }], meaning: 'không có phủ định' }], correctChoiceId: 'a', analysis: 'B sau より là Kyoto đứng trước のほうが, nên Kyoto yên tĩnh hơn.' },
      { id: 'q3', prompt: [{ base: '「Tôi thích mèo hơn chó」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '犬', ruby: 'いぬ' }, { base: 'より' }, { base: '猫', ruby: 'ねこ' }, { base: 'のほうが' }, { base: '好', ruby: 'す' }, { base: 'きです。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '猫', ruby: 'ねこ' }, { base: 'より' }, { base: '犬', ruby: 'いぬ' }, { base: 'のほうが' }, { base: '好', ruby: 'す' }, { base: 'きです。' }], meaning: 'thích chó hơn' }, { id: 'c', text: [{ base: '犬', ruby: 'いぬ' }, { base: 'と' }, { base: '猫', ruby: 'ねこ' }, { base: 'を' }, { base: '好', ruby: 'す' }, { base: 'きです。' }], meaning: 'sai cấu trúc so sánh' }], correctChoiceId: 'a', analysis: 'Chó là mốc trước より; mèo là đối tượng được thích hơn trước のほうが.' },
    ],
  },
  'reading-24': {
    id: 'reading-24', level: 'N5', skill: 'reading', title: 'Bài đọc 24 · Hai thành phố',
    japaneseTitle: [{ base: '二', ruby: 'ふた' }, { base: 'つの' }, { base: '町', ruby: 'まち' }],
    introduction: 'Đọc AよりBのほうが để xác định thứ được mô tả là hơn về giá, độ lớn và sở thích.',
    passage: [
      { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '東京', ruby: 'とうきょう' }, { base: 'と' }, { base: '京都', ruby: 'きょうと' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }, { base: '東京', ruby: 'とうきょう' }, { base: 'は' }, { base: '京都', ruby: 'きょうと' }, { base: 'より' }, { base: '大', ruby: 'おお' }, { base: 'きいです' }, { base: '。' },
      { base: 'でも' }, { base: '、' }, { base: '東京', ruby: 'とうきょう' }, { base: 'より' }, { base: '京都', ruby: 'きょうと' }, { base: 'のほうが' }, { base: '静', ruby: 'しず' }, { base: 'かです' }, { base: '。' }, { base: '京都', ruby: 'きょうと' }, { base: 'の' }, { base: 'ホテル' }, { base: 'は' }, { base: '東京', ruby: 'とうきょう' }, { base: 'の' }, { base: 'ホテル' }, { base: 'より' }, { base: '安', ruby: 'やす' }, { base: 'いです' }, { base: '。' },
      { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '京都', ruby: 'きょうと' }, { base: 'のほうが' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' },
    ],
    translation: 'Mika thích Tokyo và Kyoto. Tokyo lớn hơn Kyoto. Nhưng Kyoto yên tĩnh hơn Tokyo. Khách sạn ở Kyoto rẻ hơn khách sạn ở Tokyo. Mika thích Kyoto hơn.',
    questions: [
      { id: 'q1', question: 'Thành phố nào lớn hơn?', choices: [{ id: 'a', label: 'Tokyo' }, { id: 'b', label: 'Kyoto' }, { id: 'c', label: 'Hai thành phố bằng nhau' }], correctChoiceId: 'a', analysis: 'Câu đầu viết 「東京は京都より大きいです」.' },
      { id: 'q2', question: 'Thành phố nào yên tĩnh hơn?', choices: [{ id: 'a', label: 'Kyoto' }, { id: 'b', label: 'Tokyo' }, { id: 'c', label: 'Không có thông tin' }], correctChoiceId: 'a', analysis: '「東京より京都のほうが静かです」.' },
      { id: 'q3', question: 'Mika thích thành phố nào hơn?', choices: [{ id: 'a', label: 'Kyoto' }, { id: 'b', label: 'Tokyo' }, { id: 'c', label: 'Không thích thành phố nào' }], correctChoiceId: 'a', analysis: 'Câu cuối nêu 「京都のほうが好きです」.' },
    ],
  },
  'grammar-25': {
    id: 'grammar-25', level: 'N5', skill: 'grammar', title: 'Bài 25 · N が できます',
    japaneseTitle: [{ base: '能力', ruby: 'のうりょく' }],
    explanation: [
      'Dùng 「N が できます」 để nói có khả năng về một hoạt động, môn học hoặc kỹ năng: 「日本語ができます」.',
      'Khả năng đi với が, không dùng を. Với môn thể thao, nhạc cụ hoặc ngôn ngữ, danh từ đó đứng trước ができます.',
    ],
    formula: [{ base: 'N' }, { base: 'が' }, { base: 'できます' }],
    examples: [
      { japanese: [{ base: 'わたし' }, { base: 'は' }, { base: '日本語', ruby: 'にほんご' }, { base: 'が' }, { base: 'できます' }, { base: '。' }], translation: 'Tôi biết / có thể dùng tiếng Nhật.', note: '日本語 là năng lực nên đi với ができます.' },
      { japanese: [{ base: '弟', ruby: 'おとうと' }, { base: 'は' }, { base: 'テニス' }, { base: 'が' }, { base: 'できます' }, { base: '。' }], translation: 'Em trai tôi biết chơi tennis.', note: 'Tên môn thể thao cũng dùng với ができます.' },
      { japanese: [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'が' }, { base: 'できます' }, { base: '。' }], translation: 'Mẹ tôi biết nấu ăn.', note: '料理ができます nghĩa là có thể nấu ăn.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '日本語', ruby: 'にほんご' }, { base: '___' }, { base: 'できます' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'が' }], meaning: 'đánh dấu khả năng' }, { id: 'b', text: [{ base: 'を' }], meaning: 'không dùng với できます' }, { id: 'c', text: [{ base: 'で' }], meaning: 'địa điểm hành động' }], correctChoiceId: 'a', analysis: 'Mẫu chuẩn là 日本語ができます.' },
      { id: 'q2', prompt: [{ base: '弟', ruby: 'おとうと' }, { base: 'は' }, { base: 'テニス' }, { base: 'が' }, { base: 'できます' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Em trai tôi biết chơi tennis.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Em trai tôi muốn mua tennis.' }], meaning: 'sai nghĩa' }, { id: 'c', text: [{ base: 'Em trai tôi không chơi tennis.' }], meaning: 'không có phủ định' }], correctChoiceId: 'a', analysis: 'テニスができます diễn tả khả năng chơi tennis.' },
      { id: 'q3', prompt: [{ base: 'Câu nào nói mẹ biết nấu ăn?' }], choices: [{ id: 'a', text: [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'が' }, { base: 'できます。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'を' }, { base: 'できます。' }], meaning: 'sai trợ từ' }, { id: 'c', text: [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'が' }, { base: 'ほしいです。' }], meaning: 'muốn món ăn, không phải khả năng' }], correctChoiceId: 'a', analysis: 'Khả năng nấu ăn là 料理ができます.' },
    ],
  },
  'reading-25': {
    id: 'reading-25', level: 'N5', skill: 'reading', title: 'Bài đọc 25 · Câu lạc bộ mới',
    japaneseTitle: [{ base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: 'クラブ' }],
    introduction: 'Đọc giới thiệu thành viên để biết mỗi người có kỹ năng nào và muốn tham gia câu lạc bộ nào.',
    passage: [
      { base: '学校', ruby: 'がっこう' }, { base: 'に' }, { base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: 'クラブ' }, { base: 'が' }, { base: 'あります' }, { base: '。' }, { base: 'テニス' }, { base: 'クラブ' }, { base: 'と' }, { base: '料理', ruby: 'りょうり' }, { base: 'クラブ' }, { base: 'です' }, { base: '。' },
      { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: 'テニス' }, { base: 'が' }, { base: 'できます' }, { base: '。' }, { base: 'だから' }, { base: '、' }, { base: 'テニス' }, { base: 'クラブ' }, { base: 'に' }, { base: '入', ruby: 'はい' }, { base: 'りたいです' }, { base: '。' },
      { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'が' }, { base: 'できます' }, { base: '。' }, { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'クラブ' }, { base: 'に' }, { base: '入', ruby: 'はい' }, { base: 'ります' }, { base: '。' },
    ],
    translation: 'Trường có các câu lạc bộ mới: câu lạc bộ tennis và câu lạc bộ nấu ăn. Ken biết chơi tennis, vì vậy bạn ấy muốn vào câu lạc bộ tennis. Mika biết nấu ăn. Mika sẽ vào câu lạc bộ nấu ăn.',
    questions: [
      { id: 'q1', question: 'Ken có khả năng gì?', choices: [{ id: 'a', label: 'Chơi tennis' }, { id: 'b', label: 'Nấu ăn' }, { id: 'c', label: 'Nói tiếng Trung' }], correctChoiceId: 'a', analysis: 'Đoạn văn nêu 「ケンさんはテニスができます」.' },
      { id: 'q2', question: 'Mika sẽ vào câu lạc bộ nào?', choices: [{ id: 'a', label: 'Câu lạc bộ nấu ăn' }, { id: 'b', label: 'Câu lạc bộ tennis' }, { id: 'c', label: 'Không vào câu lạc bộ nào' }], correctChoiceId: 'a', analysis: 'Câu cuối ghi 「料理クラブに入ります」.' },
      { id: 'q3', question: 'Vì sao Ken muốn vào câu lạc bộ tennis?', choices: [{ id: 'a', label: 'Vì bạn ấy biết chơi tennis' }, { id: 'b', label: 'Vì câu lạc bộ rẻ hơn' }, { id: 'c', label: 'Vì bạn ấy không biết nấu ăn' }], correctChoiceId: 'a', analysis: '「テニスができます。だから…入りたいです」 nêu khả năng là lý do.' },
    ],
  },
  'grammar-26': {
    id: 'grammar-26', level: 'N5', skill: 'grammar', title: 'Bài 26 · N と N',
    japaneseTitle: [{ base: '名詞', ruby: 'めいし' }, { base: 'の' }, { base: '列挙', ruby: 'れっきょ' }],
    explanation: [
      'Dùng 「と」 để nối các danh từ với nghĩa “và”: 「パンと牛乳」 là bánh mì và sữa.',
      'と dùng cho danh sách đầy đủ, rõ ràng. Nó cũng có thể chỉ người cùng làm gì đó, như 「友達と行きます」: đi cùng bạn.',
    ],
    formula: [{ base: 'N' }, { base: 'と' }, { base: 'N' }],
    examples: [
      { japanese: [{ base: 'パン' }, { base: 'と' }, { base: '牛乳', ruby: 'ぎゅうにゅう' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], translation: 'Tôi mua bánh mì và sữa.', note: 'Hai món được nối bằng と.' },
      { japanese: [{ base: '父', ruby: 'ちち' }, { base: 'と' }, { base: '母', ruby: 'はは' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: 'います' }, { base: '。' }], translation: 'Bố và mẹ ở nhà.', note: 'と nối hai người làm cùng chủ đề.' },
      { japanese: [{ base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' }], translation: 'Tôi xem phim cùng bạn.', note: 'Sau người, と có nghĩa là cùng với.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: 'パン' }, { base: '___' }, { base: '牛乳', ruby: 'ぎゅうにゅう' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'と' }], meaning: 'và' }, { id: 'b', text: [{ base: 'で' }], meaning: 'ở/tại' }, { id: 'c', text: [{ base: 'が' }], meaning: 'chủ ngữ/khả năng' }], correctChoiceId: 'a', analysis: 'Hai món bánh mì và sữa được liệt kê bằng と.' },
      { id: 'q2', prompt: [{ base: '父', ruby: 'ちち' }, { base: 'と' }, { base: '母', ruby: 'はは' }, { base: 'は' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: 'います' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Bố và mẹ ở nhà.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Bố ở cùng nhà của mẹ.' }], meaning: 'sai quan hệ' }, { id: 'c', text: [{ base: 'Bố muốn mẹ ở nhà.' }], meaning: 'không có ý muốn' }], correctChoiceId: 'a', analysis: '父と母 là “bố và mẹ” cùng làm chủ đề của câu.' },
      { id: 'q3', prompt: [{ base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Tôi xem phim cùng bạn.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi xem bạn và phim.' }], meaning: 'sai vai trò と' }, { id: 'c', text: [{ base: 'Bạn tôi không xem phim.' }], meaning: 'sai phủ định' }], correctChoiceId: 'a', analysis: 'Sau người, 友達と diễn tả “cùng với bạn”.' },
    ],
  },
  'reading-26': {
    id: 'reading-26', level: 'N5', skill: 'reading', title: 'Bài đọc 26 · Mua sắm cho bữa tiệc',
    japaneseTitle: [{ base: '買', ruby: 'か' }, { base: 'い' }, { base: '物', ruby: 'もの' }, { base: 'リスト' }],
    introduction: 'Đọc と trong danh sách đồ vật và người để biết chính xác những gì được mua cho bữa tiệc.',
    passage: [
      { base: '日曜日', ruby: 'にちようび' }, { base: 'に' }, { base: '、' }, { base: 'わたし' }, { base: 'は' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: 'パーティー' }, { base: 'を' }, { base: 'します' }, { base: '。' },
      { base: '今日', ruby: 'きょう' }, { base: '、' }, { base: 'スーパー' }, { base: 'で' }, { base: 'パン' }, { base: 'と' }, { base: 'チーズ' }, { base: 'と' }, { base: 'ジュース' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'いました' }, { base: '。' },
      { base: 'ミカ' }, { base: 'さん' }, { base: 'は' }, { base: 'ケーキ' }, { base: 'と' }, { base: '果物', ruby: 'くだもの' }, { base: 'を' }, { base: '持', ruby: 'も' }, { base: 'ってきます' }, { base: '。' }, { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '音楽', ruby: 'おんがく' }, { base: 'を' }, { base: '持', ruby: 'も' }, { base: 'ってきます' }, { base: '。' },
    ],
    translation: 'Chủ nhật, tôi sẽ tổ chức tiệc với bạn. Hôm nay, tôi đã mua bánh mì, phô mai và nước trái cây ở siêu thị. Mika sẽ mang bánh ngọt và trái cây. Ken sẽ mang nhạc.',
    questions: [
      { id: 'q1', question: 'Người kể đã mua gì ở siêu thị?', choices: [{ id: 'a', label: 'Bánh mì, phô mai và nước trái cây' }, { id: 'b', label: 'Bánh ngọt và trái cây' }, { id: 'c', label: 'Chỉ nhạc' }], correctChoiceId: 'a', analysis: 'Câu thứ hai liệt kê パンとチーズとジュース.' },
      { id: 'q2', question: 'Mika sẽ mang gì?', choices: [{ id: 'a', label: 'Bánh ngọt và trái cây' }, { id: 'b', label: 'Bánh mì và sữa' }, { id: 'c', label: 'Nhạc' }], correctChoiceId: 'a', analysis: 'Đoạn cuối có 「ケーキと果物を持ってきます」.' },
      { id: 'q3', question: 'Người kể tổ chức tiệc với ai?', choices: [{ id: 'a', label: 'Với bạn' }, { id: 'b', label: 'Một mình' }, { id: 'c', label: 'Với giáo viên' }], correctChoiceId: 'a', analysis: 'Câu đầu viết 「友達とパーティーをします」.' },
    ],
  },
  'grammar-27': {
    id: 'grammar-27', level: 'N5', skill: 'grammar', title: 'Bài 27 · Tính từ い quá khứ',
    japaneseTitle: [{ base: '形容詞', ruby: 'けいようし' }, { base: 'の' }, { base: '過去', ruby: 'かこ' }],
    explanation: [
      'Để nói một tính từ đuôi い ở quá khứ, đổi い thành かったです: 「楽しい」→「楽しかったです」.',
      'Mẫu này mô tả cảm nhận hoặc đặc điểm đã đúng trong quá khứ, thường đi với 昨日, 先週, きのうの旅行…',
    ],
    formula: [{ base: 'Aい' }, { base: '→' }, { base: 'Aかったです' }],
    examples: [
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: '映画', ruby: 'えいが' }, { base: 'は' }, { base: '楽', ruby: 'たの' }, { base: 'しかったです' }, { base: '。' }], translation: 'Bộ phim hôm qua rất thú vị.', note: '楽しい đổi thành 楽しかったです.' },
      { japanese: [{ base: '先週', ruby: 'せんしゅう' }, { base: 'の' }, { base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'かったです' }, { base: '。' }], translation: 'Chuyến đi tuần trước dài.', note: '長い đổi thành 長かったです.' },
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'かったです' }, { base: '。' }], translation: 'Hôm qua trời nóng.', note: '暑い đổi thành 暑かったです.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: '映画', ruby: 'えいが' }, { base: 'は' }, { base: '楽', ruby: 'たの' }, { base: 'し___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'かったです' }], meaning: 'đã thú vị' }, { id: 'b', text: [{ base: 'いです' }], meaning: 'hiện tại' }, { id: 'c', text: [{ base: 'くないです' }], meaning: 'phủ định hiện tại' }], correctChoiceId: 'a', analysis: '昨日 yêu cầu quá khứ; 楽しい → 楽しかったです.' },
      { id: 'q2', prompt: [{ base: '昨日', ruby: 'きのう' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'かったです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Hôm qua trời nóng.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Hôm qua trời không nóng.' }], meaning: 'sai phủ định' }, { id: 'c', text: [{ base: 'Hôm nay trời nóng.' }], meaning: 'sai thời gian' }], correctChoiceId: 'a', analysis: '暑かったです là thể quá khứ khẳng định của 暑い.' },
      { id: 'q3', prompt: [{ base: '「Chuyến đi tuần trước dài」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '先週', ruby: 'せんしゅう' }, { base: 'の' }, { base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'かったです。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '先週', ruby: 'せんしゅう' }, { base: 'の' }, { base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'いです。' }], meaning: 'hiện tại' }, { id: 'c', text: [{ base: '先週', ruby: 'せんしゅう' }, { base: 'の' }, { base: '旅行', ruby: 'りょこう' }, { base: 'を' }, { base: '長', ruby: 'なが' }, { base: 'かったです。' }], meaning: 'sai trợ từ chủ đề' }], correctChoiceId: 'a', analysis: '長い chuyển い thành かったです và 旅行 là chủ đề nên dùng は.' },
    ],
  },
  'reading-27': {
    id: 'reading-27', level: 'N5', skill: 'reading', title: 'Bài đọc 27 · Chuyến đi cuối tuần',
    japaneseTitle: [{ base: '週末', ruby: 'しゅうまつ' }, { base: 'の' }, { base: '旅行', ruby: 'りょこう' }],
    introduction: 'Đọc tính từ かったです để hiểu các nhận xét về một chuyến đi đã diễn ra.',
    passage: [
      { base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: 'わたし' }, { base: 'は' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '海', ruby: 'うみ' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きました' }, { base: '。' }, { base: '天気', ruby: 'てんき' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'かったです' }, { base: '。' },
      { base: '海', ruby: 'うみ' }, { base: 'は' }, { base: 'とても' }, { base: '青', ruby: 'あお' }, { base: 'かったです' }, { base: '。' }, { base: 'ホテル' }, { base: 'は' }, { base: '小', ruby: 'ちい' }, { base: 'さかったです' }, { base: 'が' }, { base: '、' }, { base: '静', ruby: 'しず' }, { base: 'かでした' }, { base: '。' },
      { base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '短', ruby: 'みじか' }, { base: 'かったです' }, { base: 'が' }, { base: '、' }, { base: '楽', ruby: 'たの' }, { base: 'しかったです' }, { base: '。' },
    ],
    translation: 'Tuần trước, tôi đã đi biển với bạn. Trời nóng. Biển rất xanh. Khách sạn nhỏ nhưng yên tĩnh. Chuyến đi ngắn nhưng thú vị.',
    questions: [
      { id: 'q1', question: 'Thời tiết trong chuyến đi như thế nào?', choices: [{ id: 'a', label: 'Nóng' }, { id: 'b', label: 'Lạnh' }, { id: 'c', label: 'Có tuyết' }], correctChoiceId: 'a', analysis: 'Đoạn văn có 「天気は暑かったです」.' },
      { id: 'q2', question: 'Khách sạn như thế nào?', choices: [{ id: 'a', label: 'Nhỏ nhưng yên tĩnh' }, { id: 'b', label: 'Lớn và ồn' }, { id: 'c', label: 'Đắt và xa' }], correctChoiceId: 'a', analysis: 'Câu thứ hai nói 「小さかったですが、静かでした」.' },
      { id: 'q3', question: 'Người kể cảm thấy chuyến đi thế nào?', choices: [{ id: 'a', label: 'Ngắn nhưng thú vị' }, { id: 'b', label: 'Dài và buồn' }, { id: 'c', label: 'Không có chuyến đi' }], correctChoiceId: 'a', analysis: 'Câu cuối có 「短かったですが、楽しかったです」.' },
    ],
  },
  'grammar-28': {
    id: 'grammar-28', level: 'N5', skill: 'grammar', title: 'Bài 28 · Tính từ な quá khứ',
    japaneseTitle: [{ base: 'な' }, { base: '形容詞', ruby: 'けいようし' }, { base: 'の' }, { base: '過去', ruby: 'かこ' }],
    explanation: [
      'Với tính từ đuôi な, bỏ です và thêm でした để nói ở quá khứ: 「静かです」→「静かでした」.',
      'Không thêm かった vào tính từ な. Ví dụ 「有名」 đúng là 「有名でした」, không phải 「有名かったです」.',
    ],
    formula: [{ base: 'Aです' }, { base: '→' }, { base: 'Aでした' }],
    examples: [
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: '公園', ruby: 'こうえん' }, { base: 'は' }, { base: '静', ruby: 'しず' }, { base: 'かでした' }, { base: '。' }], translation: 'Công viên hôm qua yên tĩnh.', note: '静かです đổi thành 静かでした.' },
      { japanese: [{ base: 'その' }, { base: '町', ruby: 'まち' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'でした' }, { base: '。' }], translation: 'Thị trấn đó nổi tiếng.', note: '有名 là tính từ な, dùng でした.' },
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: 'パーティー' }, { base: 'は' }, { base: 'にぎやかでした' }, { base: '。' }], translation: 'Bữa tiệc hôm qua đã náo nhiệt.', note: 'にぎやかです chuyển thành にぎやかでした.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: '公園', ruby: 'こうえん' }, { base: 'は' }, { base: '静', ruby: 'しず' }, { base: 'か___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'でした' }], meaning: 'đã yên tĩnh' }, { id: 'b', text: [{ base: 'かったです' }], meaning: 'dạng sai cho tính từ な' }, { id: 'c', text: [{ base: 'くないです' }], meaning: 'phủ định hiện tại tính từ い' }], correctChoiceId: 'a', analysis: '静か là tính từ な, nên quá khứ là 静かでした.' },
      { id: 'q2', prompt: [{ base: 'その' }, { base: '町', ruby: 'まち' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'でした' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Thị trấn đó nổi tiếng.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Thị trấn đó không nổi tiếng.' }], meaning: 'mất khẳng định' }, { id: 'c', text: [{ base: 'Thị trấn đó sẽ nổi tiếng.' }], meaning: 'sai thì' }], correctChoiceId: 'a', analysis: '有名でした là quá khứ khẳng định của 有名です.' },
      { id: 'q3', prompt: [{ base: 'Câu nào nói “Bữa tiệc đã náo nhiệt”?' }], choices: [{ id: 'a', text: [{ base: 'パーティー' }, { base: 'は' }, { base: 'にぎやかでした。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'パーティー' }, { base: 'は' }, { base: 'にぎやかったです。' }], meaning: 'sai biến đổi tính từ な' }, { id: 'c', text: [{ base: 'パーティー' }, { base: 'を' }, { base: 'にぎやかでした。' }], meaning: 'sai trợ từ chủ đề' }], correctChoiceId: 'a', analysis: 'にぎやか là tính từ な nên ghép trực tiếp với でした.' },
    ],
  },
  'reading-28': {
    id: 'reading-28', level: 'N5', skill: 'reading', title: 'Bài đọc 28 · Lễ hội trong thị trấn',
    japaneseTitle: [{ base: '町', ruby: 'まち' }, { base: 'の' }, { base: '祭', ruby: 'まつ' }, { base: 'り' }],
    introduction: 'Đọc tính từ な ở quá khứ để hiểu không khí và đặc điểm của một lễ hội đã diễn ra.',
    passage: [
      { base: '先週', ruby: 'せんしゅう' }, { base: '、' }, { base: '町', ruby: 'まち' }, { base: 'で' }, { base: '祭', ruby: 'まつ' }, { base: 'りがありました' }, { base: '。' }, { base: '祭', ruby: 'まつ' }, { base: 'りは' }, { base: 'とても' }, { base: 'にぎやかでした' }, { base: '。' },
      { base: '駅', ruby: 'えき' }, { base: 'の' }, { base: '近', ruby: 'ちか' }, { base: 'くの' }, { base: '公園', ruby: 'こうえん' }, { base: 'で' }, { base: '音楽', ruby: 'おんがく' }, { base: 'がありました' }, { base: '。' }, { base: '公園', ruby: 'こうえん' }, { base: 'は' }, { base: '有名', ruby: 'ゆうめい' }, { base: 'でした' }, { base: '。' },
      { base: 'わたし' }, { base: 'の' }, { base: '友達', ruby: 'ともだち' }, { base: 'は' }, { base: '元気', ruby: 'げんき' }, { base: 'でした' }, { base: '。' }, { base: 'みんな' }, { base: '楽', ruby: 'たの' }, { base: 'しかったです' }, { base: '。' },
    ],
    translation: 'Tuần trước có lễ hội trong thị trấn. Lễ hội rất náo nhiệt. Có âm nhạc ở công viên gần ga. Công viên đó nổi tiếng. Bạn tôi khỏe. Mọi người đã rất vui.',
    questions: [
      { id: 'q1', question: 'Lễ hội như thế nào?', choices: [{ id: 'a', label: 'Rất náo nhiệt' }, { id: 'b', label: 'Rất yên tĩnh' }, { id: 'c', label: 'Không có người' }], correctChoiceId: 'a', analysis: 'Câu đầu viết 「祭りはとてもにぎやかでした」.' },
      { id: 'q2', question: 'Công viên ở đâu?', choices: [{ id: 'a', label: 'Gần ga' }, { id: 'b', label: 'Gần trường' }, { id: 'c', label: 'Ở biển' }], correctChoiceId: 'a', analysis: 'Đoạn giữa có 「駅の近くの公園」.' },
      { id: 'q3', question: 'Bạn của người kể thế nào?', choices: [{ id: 'a', label: 'Khỏe' }, { id: 'b', label: 'Không khỏe' }, { id: 'c', label: 'Đang ngủ' }], correctChoiceId: 'a', analysis: 'Câu cuối nêu 「友達は元気でした」.' },
    ],
  },
  'grammar-29': {
    id: 'grammar-29', level: 'N5', skill: 'grammar', title: 'Bài 29 · Tính từ い quá khứ phủ định',
    japaneseTitle: [{ base: '形容詞', ruby: 'けいようし' }, { base: 'の' }, { base: '過去', ruby: 'かこ' }, { base: '否定', ruby: 'ひてい' }],
    explanation: [
      'Để nói “đã không …” với tính từ い, đổi い thành くなかったです: 「高い」→「高くなかったです」.',
      'Mẫu này kết hợp phủ định và quá khứ. Đừng dùng くないでした; dạng lịch sự đúng là くなかったです.',
    ],
    formula: [{ base: 'Aい' }, { base: '→' }, { base: 'Aくなかったです' }],
    examples: [
      { japanese: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: 'ホテル' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: 'くなかったです' }, { base: '。' }], translation: 'Khách sạn hôm qua không đắt.', note: '高い đổi thành 高くなかったです.' },
      { japanese: [{ base: 'その' }, { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'くなかったです' }, { base: '。' }], translation: 'Con đường đó không dài.', note: '長い đổi thành 長くなかったです.' },
      { japanese: [{ base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '楽', ruby: 'たの' }, { base: 'しくなかったです' }, { base: '。' }], translation: 'Chuyến đi đã không vui.', note: '楽しい đổi thành 楽しくなかったです.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '昨日', ruby: 'きのう' }, { base: 'の' }, { base: 'ホテル' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: 'く___' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'なかったです' }], meaning: 'đã không đắt' }, { id: 'b', text: [{ base: 'ないです' }], meaning: 'không đắt hiện tại' }, { id: 'c', text: [{ base: 'かったです' }], meaning: 'đã đắt' }], correctChoiceId: 'a', analysis: 'Quá khứ phủ định của 高い là 高くなかったです.' },
      { id: 'q2', prompt: [{ base: 'その' }, { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'くなかったです' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Con đường đó không dài.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Con đường đó rất dài.' }], meaning: 'ngược nghĩa' }, { id: 'c', text: [{ base: 'Con đường đó sẽ dài.' }], meaning: 'sai thì' }], correctChoiceId: 'a', analysis: '長くなかったです kết hợp phủ định và quá khứ.' },
      { id: 'q3', prompt: [{ base: '「Chuyến đi đã không vui」' }, { base: 'に' }, { base: '近', ruby: 'ちか' }, { base: 'い' }, { base: '文', ruby: 'ぶん' }, { base: 'はどれですか。' }], choices: [{ id: 'a', text: [{ base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '楽', ruby: 'たの' }, { base: 'しくなかったです。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: '楽', ruby: 'たの' }, { base: 'しかったです。' }], meaning: 'đã vui' }, { id: 'c', text: [{ base: '旅行', ruby: 'りょこう' }, { base: 'を' }, { base: '楽', ruby: 'たの' }, { base: 'しくなかったです。' }], meaning: 'sai trợ từ chủ đề' }], correctChoiceId: 'a', analysis: '楽しい → 楽しくなかったです khi quá khứ và phủ định.' },
    ],
  },
  'reading-29': {
    id: 'reading-29', level: 'N5', skill: 'reading', title: 'Bài đọc 29 · Khách sạn trên núi',
    japaneseTitle: [{ base: '山', ruby: 'やま' }, { base: 'の' }, { base: 'ホテル' }],
    introduction: 'Đọc Aくなかったです để phân biệt những điều không xảy ra trong chuyến đi trước.',
    passage: [
      { base: '先月', ruby: 'せんげつ' }, { base: '、' }, { base: 'わたし' }, { base: 'は' }, { base: '山', ruby: 'やま' }, { base: 'の' }, { base: 'ホテル' }, { base: 'に' }, { base: '泊', ruby: 'と' }, { base: 'まりました' }, { base: '。' },
      { base: 'ホテル' }, { base: 'は' }, { base: '新', ruby: 'あたら' }, { base: 'しくなかったです' }, { base: 'が' }, { base: '、' }, { base: '部屋', ruby: 'へや' }, { base: 'は' }, { base: 'きれいでした' }, { base: '。' }, { base: '値段', ruby: 'ねだん' }, { base: 'も' }, { base: '高', ruby: 'たか' }, { base: 'くなかったです' }, { base: '。' },
      { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'くなかったです' }, { base: '。' }, { base: 'だから' }, { base: '、' }, { base: '旅行', ruby: 'りょこう' }, { base: 'は' }, { base: 'とても' }, { base: '楽', ruby: 'たの' }, { base: 'しかったです' }, { base: '。' },
    ],
    translation: 'Tháng trước, tôi ở một khách sạn trên núi. Khách sạn không mới, nhưng phòng sạch. Giá cũng không đắt. Đường không dài. Vì vậy chuyến đi rất vui.',
    questions: [
      { id: 'q1', question: 'Khách sạn có mới không?', choices: [{ id: 'a', label: 'Không mới' }, { id: 'b', label: 'Rất mới' }, { id: 'c', label: 'Không có khách sạn' }], correctChoiceId: 'a', analysis: 'Câu thứ hai có 「新しくなかったです」.' },
      { id: 'q2', question: 'Giá khách sạn như thế nào?', choices: [{ id: 'a', label: 'Không đắt' }, { id: 'b', label: 'Rất đắt' }, { id: 'c', label: 'Không có giá' }], correctChoiceId: 'a', analysis: 'Đoạn văn nêu 「値段も高くなかったです」.' },
      { id: 'q3', question: 'Cuối cùng người kể cảm thấy chuyến đi thế nào?', choices: [{ id: 'a', label: 'Rất vui' }, { id: 'b', label: 'Không vui' }, { id: 'c', label: 'Rất dài' }], correctChoiceId: 'a', analysis: 'Câu cuối ghi 「旅行はとても楽しかったです」.' },
    ],
  },
  'grammar-30': {
    id: 'grammar-30', level: 'N5', skill: 'grammar', title: 'Bài 30 · S から、S',
    japaneseTitle: [{ base: '理由', ruby: 'りゆう' }],
    explanation: [
      'Dùng 「から」 sau một mệnh đề để nói lý do, rồi nêu kết quả hoặc quyết định: 「雨ですから、行きません」.',
      'Mệnh đề lý do đứng trước から. Mẫu này rất hữu ích khi từ chối lịch sự, giải thích lựa chọn hoặc nói vì sao mình muốn làm gì.',
    ],
    formula: [{ base: 'S' }, { base: 'から' }, { base: '、' }, { base: 'S' }],
    examples: [
      { japanese: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '雨', ruby: 'あめ' }, { base: 'ですから' }, { base: '、' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きません' }, { base: '。' }], translation: 'Hôm nay trời mưa nên tôi không đi công viên.', note: '雨です là lý do, đứng trước から.' },
      { japanese: [{ base: '日本語', ruby: 'にほんご' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きですから' }, { base: '、' }, { base: '毎日', ruby: 'まいにち' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }], translation: 'Vì thích tiếng Nhật, tôi học mỗi ngày.', note: '好きですから giải thích lý do học.' },
      { japanese: [{ base: '明日', ruby: 'あした' }, { base: 'は' }, { base: '仕事', ruby: 'しごと' }, { base: 'ですから' }, { base: '、' }, { base: '早', ruby: 'はや' }, { base: 'く' }, { base: '寝', ruby: 'ね' }, { base: 'ます' }, { base: '。' }], translation: 'Vì ngày mai phải làm việc, tôi ngủ sớm.', note: '仕事です là lý do của quyết định ngủ sớm.' },
    ],
    questions: [
      { id: 'q1', prompt: [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '雨', ruby: 'あめ' }, { base: 'です___' }, { base: '、' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きません' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'から' }], meaning: 'vì' }, { id: 'b', text: [{ base: 'まで' }], meaning: 'đến' }, { id: 'c', text: [{ base: 'と' }], meaning: 'và/cùng với' }], correctChoiceId: 'a', analysis: '雨ですから nghĩa là “vì trời mưa”.' },
      { id: 'q2', prompt: [{ base: '日本語', ruby: 'にほんご' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きですから' }, { base: '、' }, { base: '毎日', ruby: 'まいにち' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }], choices: [{ id: 'a', text: [{ base: 'Vì thích tiếng Nhật, tôi học mỗi ngày.' }], meaning: 'đúng' }, { id: 'b', text: [{ base: 'Tôi không thích tiếng Nhật nên không học.' }], meaning: 'ngược nghĩa' }, { id: 'c', text: [{ base: 'Tôi học tiếng Nhật ở trường.' }], meaning: 'không có lý do' }], correctChoiceId: 'a', analysis: '好きですから nêu lý do cho 毎日勉強します.' },
      { id: 'q3', prompt: [{ base: 'Câu nào giải thích “vì ngày mai phải làm việc nên tôi ngủ sớm”?' }], choices: [{ id: 'a', text: [{ base: '明日', ruby: 'あした' }, { base: 'は' }, { base: '仕事', ruby: 'しごと' }, { base: 'ですから' }, { base: '、' }, { base: '早', ruby: 'はや' }, { base: 'く' }, { base: '寝', ruby: 'ね' }, { base: 'ます。' }], meaning: 'đúng' }, { id: 'b', text: [{ base: '明日', ruby: 'あした' }, { base: 'は' }, { base: '仕事', ruby: 'しごと' }, { base: 'まで' }, { base: '、' }, { base: '早', ruby: 'はや' }, { base: 'く' }, { base: '寝', ruby: 'ね' }, { base: 'ます。' }], meaning: 'sai liên kết lý do' }, { id: 'c', text: [{ base: '明日', ruby: 'あした' }, { base: 'は' }, { base: '仕事', ruby: 'しごと' }, { base: 'ですから' }, { base: '、' }, { base: '早', ruby: 'はや' }, { base: 'く' }, { base: '寝', ruby: 'ね' }, { base: 'ません。' }], meaning: 'ngược kết quả' }], correctChoiceId: 'a', analysis: '仕事ですから nối lý do với hành động 寝ます.' },
    ],
  },
  'reading-30': {
    id: 'reading-30', level: 'N5', skill: 'reading', title: 'Bài đọc 30 · Đổi kế hoạch cuối tuần',
    japaneseTitle: [{ base: '週末', ruby: 'しゅうまつ' }, { base: 'の' }, { base: '予定', ruby: 'よてい' }],
    introduction: 'Đọc から để tìm chính xác vì sao nhân vật thay đổi kế hoạch hoặc đưa ra lựa chọn.',
    passage: [
      { base: '土曜日', ruby: 'どようび' }, { base: '、' }, { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きたいです' }, { base: '。' },
      { base: 'でも' }, { base: '、' }, { base: '天気', ruby: 'てんき' }, { base: 'は' }, { base: 'よくないです' }, { base: '。' }, { base: '雨', ruby: 'あめ' }, { base: 'ですから' }, { base: '、' }, { base: '公園', ruby: 'こうえん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きません' }, { base: '。' },
      { base: 'ケン' }, { base: 'さん' }, { base: 'は' }, { base: '映画', ruby: 'えいが' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きですから' }, { base: '、' }, { base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' },
    ],
    translation: 'Thứ Bảy, Ken muốn đi công viên với bạn. Nhưng thời tiết không tốt. Vì trời mưa, bạn ấy không đi công viên. Vì Ken thích phim, bạn ấy xem phim với bạn.',
    questions: [
      { id: 'q1', question: 'Vì sao Ken không đi công viên?', choices: [{ id: 'a', label: 'Vì trời mưa' }, { id: 'b', label: 'Vì không thích bạn' }, { id: 'c', label: 'Vì công viên đóng cửa' }], correctChoiceId: 'a', analysis: 'Câu có 「雨ですから、公園へ行きません」.' },
      { id: 'q2', question: 'Ken làm gì thay vì đi công viên?', choices: [{ id: 'a', label: 'Xem phim với bạn' }, { id: 'b', label: 'Học ở thư viện' }, { id: 'c', label: 'Đi làm' }], correctChoiceId: 'a', analysis: 'Câu cuối viết 「友達と映画を見ます」.' },
      { id: 'q3', question: 'Vì sao Ken chọn xem phim?', choices: [{ id: 'a', label: 'Vì bạn ấy thích phim' }, { id: 'b', label: 'Vì không có mưa' }, { id: 'c', label: 'Vì phim rẻ hơn xe buýt' }], correctChoiceId: 'a', analysis: '「映画が好きですから」 nêu lý do chọn xem phim.' },
    ],
  },
} as const satisfies Readonly<Record<string, JLPTN5Lesson>>;

export function getLessonCompletion(correct: number, total: number): LessonCompletion {
  const safeTotal = Math.max(1, total);
  const percent = Math.round((Math.max(0, Math.min(correct, safeTotal)) / safeTotal) * 100);
  return { percent, completed: percent >= 80 };
}

export function calculateLessonXp(correct: number, total: number): number {
  const completion = getLessonCompletion(correct, total);
  return Math.round(Math.max(0, Math.min(correct, Math.max(1, total))) * 10) + (completion.completed ? 20 : 0);
}

/** Guards authored local content before it reaches a learner-facing route. */
export function validateJLPTN5Lessons(): string[] {
  const issues: string[] = [];
  const seenLessonIds = new Set<string>();
  const lessons: Readonly<Record<string, JLPTN5Lesson>> = JLPT_N5_LESSONS;

  for (const [lessonKey, lesson] of Object.entries(lessons)) {
    if (lesson.id !== lessonKey) issues.push(`lesson key mismatch: ${lessonKey}`);
    if (seenLessonIds.has(lesson.id)) issues.push(`duplicate lesson id: ${lesson.id}`);
    seenLessonIds.add(lesson.id);
    if (lesson.questions.length < 3) issues.push(`too few questions: ${lesson.id}`);
    const questionIds = new Set<string>();

    for (const question of lesson.questions) {
      if (questionIds.has(question.id)) issues.push(`duplicate question id: ${lesson.id}:${question.id}`);
      questionIds.add(question.id);
      if (question.choices.length < 3) issues.push(`too few choices: ${lesson.id}:${question.id}`);
      if (!question.choices.some((choice) => choice.id === question.correctChoiceId)) issues.push(`missing correct choice: ${lesson.id}:${question.id}`);
      if (!question.analysis.trim()) issues.push(`missing analysis: ${lesson.id}:${question.id}`);
    }

    if (lesson.skill === 'grammar') {
      if (lesson.explanation.length === 0 || lesson.examples.length < 2) issues.push(`incomplete grammar instruction: ${lesson.id}`);
      if (lesson.examples.some((example) => !example.japanese.some((segment) => Boolean(segment.ruby)))) issues.push(`unannotated grammar example: ${lesson.id}`);
      const japaneseSegments = [
        ...lesson.japaneseTitle,
        ...lesson.formula,
        ...lesson.examples.flatMap((example) => example.japanese),
        ...lesson.questions.flatMap((question) => [
          ...question.prompt,
          ...question.choices.flatMap((choice) => choice.text),
        ]),
      ];
      if (japaneseSegments.some((segment) => /[\u3400-\u9fff]/u.test(segment.base) && !segment.ruby)) issues.push(`unannotated grammar kanji: ${lesson.id}`);
    } else if (!lesson.passage.some((segment) => Boolean(segment.ruby))) {
      issues.push(`unannotated reading passage: ${lesson.id}`);
    } else {
      const japaneseSegments = [...lesson.japaneseTitle, ...lesson.passage];
      if (japaneseSegments.some((segment) => /[\u3400-\u9fff]/u.test(segment.base) && !segment.ruby)) issues.push(`unannotated reading kanji: ${lesson.id}`);
    }
  }

  return issues;
}
