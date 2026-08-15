import type { JapaneseSegment } from './jlptN5Lessons';

export interface JLPTN5VocabularyCard {
  id: string;
  word: readonly JapaneseSegment[];
  meaning: string;
  partOfSpeech: 'noun' | 'pronoun' | 'verb' | 'adjective' | 'adverb' | 'expression';
  example: readonly JapaneseSegment[];
  exampleTranslation: string;
}

const card = (
  id: string,
  base: string,
  ruby: string,
  meaning: string,
  partOfSpeech: JLPTN5VocabularyCard['partOfSpeech'],
  example: readonly JapaneseSegment[],
  exampleTranslation: string,
): JLPTN5VocabularyCard => ({ id, word: [{ base, ruby }], meaning, partOfSpeech, example, exampleTranslation });

/** Authored starter deck: compact, high-frequency N5 vocabulary with example context. */
export const JLPT_N5_VOCABULARY: readonly JLPTN5VocabularyCard[] = [
  card('v001', '私', 'わたし', 'tôi', 'pronoun', [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '学生', ruby: 'がくせい' }, { base: 'です' }, { base: '。' }], 'Tôi là học sinh / sinh viên.'),
  card('v002', 'あなた', 'あなた', 'bạn', 'pronoun', [{ base: 'あなた' }, { base: 'は' }, { base: '先生', ruby: 'せんせい' }, { base: 'です' }, { base: 'か' }, { base: '。' }], 'Bạn là giáo viên phải không?'),
  card('v003', '学生', 'がくせい', 'học sinh / sinh viên', 'noun', [{ base: '田中', ruby: 'たなか' }, { base: 'さん' }, { base: 'は' }, { base: '学生', ruby: 'がくせい' }, { base: 'です' }, { base: '。' }], 'Tanaka là học sinh / sinh viên.'),
  card('v004', '先生', 'せんせい', 'giáo viên', 'noun', [{ base: '先生', ruby: 'せんせい' }, { base: 'は' }, { base: '日本人', ruby: 'にほんじん' }, { base: 'です' }, { base: '。' }], 'Giáo viên là người Nhật.'),
  card('v005', '日本', 'にほん', 'Nhật Bản', 'noun', [{ base: '日本', ruby: 'にほん' }, { base: 'は' }, { base: 'きれい' }, { base: 'です' }, { base: '。' }], 'Nhật Bản đẹp.'),
  card('v006', '日本語', 'にほんご', 'tiếng Nhật', 'noun', [{ base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'します' }, { base: '。' }], 'Tôi học tiếng Nhật.'),
  card('v007', '本', 'ほん', 'sách', 'noun', [{ base: 'これ' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }], 'Đây là sách.'),
  card('v008', '水', 'みず', 'nước', 'noun', [{ base: '水', ruby: 'みず' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みます' }, { base: '。' }], 'Tôi uống nước.'),
  card('v009', 'ご飯', 'ごはん', 'cơm / bữa ăn', 'noun', [{ base: '朝', ruby: 'あさ' }, { base: 'ご飯', ruby: 'ごはん' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' }], 'Tôi ăn sáng.'),
  card('v010', '友達', 'ともだち', 'bạn bè', 'noun', [{ base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '話', ruby: 'はな' }, { base: 'します' }, { base: '。' }], 'Tôi nói chuyện với bạn.'),
  card('v011', '学校', 'がっこう', 'trường học', 'noun', [{ base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đi đến trường.'),
  card('v012', '家', 'いえ', 'nhà', 'noun', [{ base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'ります' }, { base: '。' }], 'Tôi về nhà.'),
  card('v013', '今日', 'きょう', 'hôm nay', 'adverb', [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '月曜日', ruby: 'げつようび' }, { base: 'です' }, { base: '。' }], 'Hôm nay là thứ Hai.'),
  card('v014', '明日', 'あした', 'ngày mai', 'adverb', [{ base: '明日', ruby: 'あした' }, { base: 'は' }, { base: '休', ruby: 'やす' }, { base: 'みです' }, { base: '。' }], 'Ngày mai là ngày nghỉ.'),
  card('v015', '毎日', 'まいにち', 'mỗi ngày', 'adverb', [{ base: '毎日', ruby: 'まいにち' }, { base: '日本語', ruby: 'にほんご' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' }], 'Mỗi ngày tôi đọc tiếng Nhật.'),
  card('v016', '朝', 'あさ', 'buổi sáng', 'noun', [{ base: '朝', ruby: 'あさ' }, { base: 'は' }, { base: '早', ruby: 'はや' }, { base: 'いです' }, { base: '。' }], 'Buổi sáng sớm.'),
  card('v017', '夜', 'よる', 'buổi tối / đêm', 'noun', [{ base: '夜', ruby: 'よる' }, { base: 'に' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' }], 'Tối tôi đọc sách.'),
  card('v018', '行く', 'いく', 'đi', 'verb', [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '店', ruby: 'みせ' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đi đến cửa hàng.'),
  card('v019', '来る', 'くる', 'đến', 'verb', [{ base: '友達', ruby: 'ともだち' }, { base: 'が' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '来', ruby: 'き' }, { base: 'ます' }, { base: '。' }], 'Bạn đến nhà.'),
  card('v020', '食べる', 'たべる', 'ăn', 'verb', [{ base: 'パン' }, { base: 'を' }, { base: '食', ruby: 'た' }, { base: 'べます' }, { base: '。' }], 'Tôi ăn bánh mì.'),
  card('v021', '飲む', 'のむ', 'uống', 'verb', [{ base: '牛乳', ruby: 'ぎゅうにゅう' }, { base: 'を' }, { base: '飲', ruby: 'の' }, { base: 'みます' }, { base: '。' }], 'Tôi uống sữa.'),
  card('v022', '見る', 'みる', 'xem / nhìn', 'verb', [{ base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' }], 'Tôi xem phim.'),
  card('v023', '話す', 'はなす', 'nói chuyện', 'verb', [{ base: '日本語', ruby: 'にほんご' }, { base: 'で' }, { base: '話', ruby: 'はな' }, { base: 'します' }, { base: '。' }], 'Tôi nói bằng tiếng Nhật.'),
  card('v024', '大きい', 'おおきい', 'to lớn', 'adjective', [{ base: 'この' }, { base: '家', ruby: 'いえ' }, { base: 'は' }, { base: '大', ruby: 'おお' }, { base: 'きいです' }, { base: '。' }], 'Ngôi nhà này lớn.'),
  card('v025', '小さい', 'ちいさい', 'nhỏ', 'adjective', [{ base: 'その' }, { base: '犬', ruby: 'いぬ' }, { base: 'は' }, { base: '小', ruby: 'ちい' }, { base: 'さいです' }, { base: '。' }], 'Con chó đó nhỏ.'),
  card('v026', '新しい', 'あたらしい', 'mới', 'adjective', [{ base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: '本', ruby: 'ほん' }, { base: 'です' }, { base: '。' }], 'Đó là sách mới.'),
  card('v027', 'これ', 'これ', 'đây / cái này', 'pronoun', [{ base: 'これ' }, { base: 'は' }, { base: '何', ruby: 'なん' }, { base: 'です' }, { base: 'か' }, { base: '。' }], 'Đây là gì?'),
  card('v028', 'それ', 'それ', 'đó / cái đó', 'pronoun', [{ base: 'それ' }, { base: 'は' }, { base: 'ペン' }, { base: 'です' }, { base: '。' }], 'Đó là cây bút.'),
  card('v029', 'あれ', 'あれ', 'kia / cái kia', 'pronoun', [{ base: 'あれ' }, { base: 'は' }, { base: '学校', ruby: 'がっこう' }, { base: 'です' }, { base: '。' }], 'Kia là trường học.'),
  card('v030', '何', 'なん', 'cái gì', 'pronoun', [{ base: 'それ' }, { base: 'は' }, { base: '何', ruby: 'なん' }, { base: 'です' }, { base: 'か' }, { base: '。' }], 'Đó là gì?'),
] as const;

const JLPT_N5_VOCABULARY_TWO: readonly JLPTN5VocabularyCard[] = [
  card('v031', '昨日', 'きのう', 'hôm qua', 'adverb', [{ base: '昨日', ruby: 'きのう' }, { base: 'は' }, { base: '日曜日', ruby: 'にちようび' }, { base: 'でした' }, { base: '。' }], 'Hôm qua là Chủ nhật.'),
  card('v032', '午前', 'ごぜん', 'buổi sáng / a.m.', 'noun', [{ base: '午前', ruby: 'ごぜん' }, { base: '九時', ruby: 'くじ' }, { base: 'に' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đi đến trường lúc 9 giờ sáng.'),
  card('v033', '午後', 'ごご', 'buổi chiều / p.m.', 'noun', [{ base: '午後', ruby: 'ごご' }, { base: 'に' }, { base: '友達', ruby: 'ともだち' }, { base: 'に' }, { base: '会', ruby: 'あ' }, { base: 'います' }, { base: '。' }], 'Buổi chiều tôi gặp bạn.'),
  card('v034', '時間', 'じかん', 'thời gian / giờ', 'noun', [{ base: '時間', ruby: 'じかん' }, { base: 'が' }, { base: 'ありません' }, { base: '。' }], 'Tôi không có thời gian.'),
  card('v035', '時', 'じ', 'giờ', 'noun', [{ base: '今', ruby: 'いま' }, { base: 'は' }, { base: '何時', ruby: 'なんじ' }, { base: 'です' }, { base: 'か' }, { base: '。' }], 'Bây giờ là mấy giờ?'),
  card('v036', '分', 'ふん', 'phút', 'noun', [{ base: '十分', ruby: 'じゅっぷん' }, { base: '待', ruby: 'ま' }, { base: 'ちます' }, { base: '。' }], 'Tôi đợi 10 phút.'),
  card('v037', '月曜日', 'げつようび', 'thứ Hai', 'noun', [{ base: '月曜日', ruby: 'げつようび' }, { base: 'に' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đi học vào thứ Hai.'),
  card('v038', '火曜日', 'かようび', 'thứ Ba', 'noun', [{ base: '火曜日', ruby: 'かようび' }, { base: 'は' }, { base: '忙', ruby: 'いそが' }, { base: 'しいです' }, { base: '。' }], 'Thứ Ba bận rộn.'),
  card('v039', '土曜日', 'どようび', 'thứ Bảy', 'noun', [{ base: '土曜日', ruby: 'どようび' }, { base: 'に' }, { base: '図書館', ruby: 'としょかん' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đến thư viện vào thứ Bảy.'),
  card('v040', '日曜日', 'にちようび', 'Chủ nhật', 'noun', [{ base: '日曜日', ruby: 'にちようび' }, { base: 'は' }, { base: '休', ruby: 'やす' }, { base: 'みです' }, { base: '。' }], 'Chủ nhật là ngày nghỉ.'),
  card('v041', '図書館', 'としょかん', 'thư viện', 'noun', [{ base: '図書館', ruby: 'としょかん' }, { base: 'で' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '読', ruby: 'よ' }, { base: 'みます' }, { base: '。' }], 'Tôi đọc sách ở thư viện.'),
  card('v042', '駅', 'えき', 'ga tàu', 'noun', [{ base: '駅', ruby: 'えき' }, { base: 'に' }, { base: '友達', ruby: 'ともだち' }, { base: 'が' }, { base: 'います' }, { base: '。' }], 'Bạn tôi ở ga.'),
  card('v043', '店', 'みせ', 'cửa hàng', 'noun', [{ base: '店', ruby: 'みせ' }, { base: 'で' }, { base: 'パン' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], 'Tôi mua bánh mì ở cửa hàng.'),
  card('v044', '病院', 'びょういん', 'bệnh viện', 'noun', [{ base: '病院', ruby: 'びょういん' }, { base: 'は' }, { base: '駅', ruby: 'えき' }, { base: 'の' }, { base: '近', ruby: 'ちか' }, { base: 'くです' }, { base: '。' }], 'Bệnh viện gần ga.'),
  card('v045', '公園', 'こうえん', 'công viên', 'noun', [{ base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: '犬', ruby: 'いぬ' }, { base: 'が' }, { base: 'います' }, { base: '。' }], 'Có một con chó ở công viên.'),
  card('v046', '電車', 'でんしゃ', 'tàu điện', 'noun', [{ base: '電車', ruby: 'でんしゃ' }, { base: 'で' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đi tàu điện đến trường.'),
  card('v047', 'バス', 'バス', 'xe buýt', 'noun', [{ base: 'バス' }, { base: 'で' }, { base: '駅', ruby: 'えき' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Tôi đi xe buýt đến ga.'),
  card('v048', '車', 'くるま', 'xe hơi', 'noun', [{ base: '父', ruby: 'ちち' }, { base: 'は' }, { base: '車', ruby: 'くるま' }, { base: 'で' }, { base: '来', ruby: 'き' }, { base: 'ます' }, { base: '。' }], 'Bố tôi đến bằng xe hơi.'),
  card('v049', '会う', 'あう', 'gặp', 'verb', [{ base: '明日', ruby: 'あした' }, { base: '友達', ruby: 'ともだち' }, { base: 'に' }, { base: '会', ruby: 'あ' }, { base: 'います' }, { base: '。' }], 'Ngày mai tôi gặp bạn.'),
  card('v050', '買う', 'かう', 'mua', 'verb', [{ base: '新', ruby: 'あたら' }, { base: 'しい' }, { base: '本', ruby: 'ほん' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], 'Tôi mua một quyển sách mới.'),
  card('v051', '帰る', 'かえる', 'về', 'verb', [{ base: '夜', ruby: 'よる' }, { base: 'に' }, { base: '家', ruby: 'いえ' }, { base: 'に' }, { base: '帰', ruby: 'かえ' }, { base: 'ります' }, { base: '。' }], 'Buổi tối tôi về nhà.'),
  card('v052', '休む', 'やすむ', 'nghỉ', 'verb', [{ base: '明日', ruby: 'あした' }, { base: 'は' }, { base: '休', ruby: 'やす' }, { base: 'みます' }, { base: '。' }], 'Ngày mai tôi nghỉ.'),
  card('v053', '待つ', 'まつ', 'đợi', 'verb', [{ base: '駅', ruby: 'えき' }, { base: 'で' }, { base: '電車', ruby: 'でんしゃ' }, { base: 'を' }, { base: '待', ruby: 'ま' }, { base: 'ちます' }, { base: '。' }], 'Tôi đợi tàu ở ga.'),
  card('v054', '忙しい', 'いそがしい', 'bận', 'adjective', [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '忙', ruby: 'いそが' }, { base: 'しいです' }, { base: '。' }], 'Hôm nay bận.'),
  card('v055', '楽しい', 'たのしい', 'vui', 'adjective', [{ base: '日本語', ruby: 'にほんご' }, { base: 'の' }, { base: '勉強', ruby: 'べんきょう' }, { base: 'は' }, { base: '楽', ruby: 'たの' }, { base: 'しいです' }, { base: '。' }], 'Việc học tiếng Nhật vui.'),
  card('v056', '好き', 'すき', 'thích', 'adjective', [{ base: '私', ruby: 'わたし' }, { base: 'は' }, { base: '本', ruby: 'ほん' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }], 'Tôi thích sách.'),
  card('v057', '大丈夫', 'だいじょうぶ', 'ổn / không sao', 'adjective', [{ base: '大丈夫', ruby: 'だいじょうぶ' }, { base: 'です' }, { base: 'か' }, { base: '。' }], 'Bạn ổn chứ?'),
  card('v058', 'いつ', 'いつ', 'khi nào', 'adverb', [{ base: 'いつ' }, { base: '学校', ruby: 'がっこう' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: 'か' }, { base: '。' }], 'Bạn đi học khi nào?'),
  card('v059', 'どこ', 'どこ', 'ở đâu', 'adverb', [{ base: 'どこ' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: 'か' }, { base: '。' }], 'Bạn đi đâu?'),
  card('v060', 'だれ', 'だれ', 'ai', 'pronoun', [{ base: 'だれ' }, { base: 'と' }, { base: '図書館', ruby: 'としょかん' }, { base: 'に' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: 'か' }, { base: '。' }], 'Bạn đi thư viện với ai?'),
] as const;

const JLPT_N5_VOCABULARY_THREE: readonly JLPTN5VocabularyCard[] = [
  card('v061', '白い', 'しろい', 'trắng', 'adjective', [{ base: '白', ruby: 'しろ' }, { base: 'い' }, { base: '犬', ruby: 'いぬ' }, { base: 'が' }, { base: 'います' }, { base: '。' }], 'Có một con chó trắng.'),
  card('v062', '黒い', 'くろい', 'đen', 'adjective', [{ base: '黒', ruby: 'くろ' }, { base: 'い' }, { base: 'かばん' }, { base: 'です' }, { base: '。' }], 'Đó là một chiếc túi đen.'),
  card('v063', '赤い', 'あかい', 'đỏ', 'adjective', [{ base: '赤', ruby: 'あか' }, { base: 'い' }, { base: 'ペン' }, { base: 'を' }, { base: '買', ruby: 'か' }, { base: 'います' }, { base: '。' }], 'Tôi mua một cây bút đỏ.'),
  card('v064', '青い', 'あおい', 'xanh dương', 'adjective', [{ base: '空', ruby: 'そら' }, { base: 'は' }, { base: '青', ruby: 'あお' }, { base: 'いです' }, { base: '。' }], 'Bầu trời xanh.'),
  card('v065', '高い', 'たかい', 'cao / đắt', 'adjective', [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: 'いです' }, { base: '。' }], 'Quyển sách này đắt.'),
  card('v066', '安い', 'やすい', 'rẻ', 'adjective', [{ base: 'その' }, { base: 'ペン' }, { base: 'は' }, { base: '安', ruby: 'やす' }, { base: 'いです' }, { base: '。' }], 'Cây bút đó rẻ.'),
  card('v067', '暑い', 'あつい', 'nóng (thời tiết)', 'adjective', [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '暑', ruby: 'あつ' }, { base: 'いです' }, { base: '。' }], 'Hôm nay nóng.'),
  card('v068', '寒い', 'さむい', 'lạnh (thời tiết)', 'adjective', [{ base: '冬', ruby: 'ふゆ' }, { base: 'は' }, { base: '寒', ruby: 'さむ' }, { base: 'いです' }, { base: '。' }], 'Mùa đông lạnh.'),
  card('v069', '長い', 'ながい', 'dài', 'adjective', [{ base: 'この' }, { base: '道', ruby: 'みち' }, { base: 'は' }, { base: '長', ruby: 'なが' }, { base: 'いです' }, { base: '。' }], 'Con đường này dài.'),
  card('v070', '短い', 'みじかい', 'ngắn', 'adjective', [{ base: '休', ruby: 'やす' }, { base: 'みは' }, { base: '短', ruby: 'みじか' }, { base: 'いです' }, { base: '。' }], 'Kỳ nghỉ ngắn.'),
  card('v071', '面白い', 'おもしろい', 'thú vị', 'adjective', [{ base: 'この' }, { base: '本', ruby: 'ほん' }, { base: 'は' }, { base: '面白', ruby: 'おもしろ' }, { base: 'いです' }, { base: '。' }], 'Quyển sách này thú vị.'),
  card('v072', '難しい', 'むずかしい', 'khó', 'adjective', [{ base: '日本語', ruby: 'にほんご' }, { base: 'は' }, { base: '難', ruby: 'むずか' }, { base: 'しいです' }, { base: '。' }], 'Tiếng Nhật khó.'),
  card('v073', 'やさしい', 'やさしい', 'dễ / tốt bụng', 'adjective', [{ base: 'この' }, { base: '問題', ruby: 'もんだい' }, { base: 'は' }, { base: 'やさしいです' }, { base: '。' }], 'Bài này dễ.'),
  card('v074', '早い', 'はやい', 'sớm / nhanh', 'adjective', [{ base: '朝', ruby: 'あさ' }, { base: 'は' }, { base: '早', ruby: 'はや' }, { base: 'いです' }, { base: '。' }], 'Buổi sáng sớm.'),
  card('v075', '遅い', 'おそい', 'muộn / chậm', 'adjective', [{ base: '電車', ruby: 'でんしゃ' }, { base: 'は' }, { base: '遅', ruby: 'おそ' }, { base: 'いです' }, { base: '。' }], 'Tàu điện muộn.'),
  card('v076', '天気', 'てんき', 'thời tiết', 'noun', [{ base: '今日', ruby: 'きょう' }, { base: 'の' }, { base: '天気', ruby: 'てんき' }, { base: 'は' }, { base: 'いいです' }, { base: '。' }], 'Thời tiết hôm nay đẹp.'),
  card('v077', '雨', 'あめ', 'mưa', 'noun', [{ base: '今日', ruby: 'きょう' }, { base: 'は' }, { base: '雨', ruby: 'あめ' }, { base: 'です' }, { base: '。' }], 'Hôm nay trời mưa.'),
  card('v078', '雪', 'ゆき', 'tuyết', 'noun', [{ base: '冬', ruby: 'ふゆ' }, { base: 'に' }, { base: '雪', ruby: 'ゆき' }, { base: 'が' }, { base: 'あります' }, { base: '。' }], 'Mùa đông có tuyết.'),
  card('v079', '空', 'そら', 'bầu trời', 'noun', [{ base: '空', ruby: 'そら' }, { base: 'は' }, { base: '青', ruby: 'あお' }, { base: 'いです' }, { base: '。' }], 'Bầu trời xanh.'),
  card('v080', '山', 'やま', 'núi', 'noun', [{ base: 'あれ' }, { base: 'は' }, { base: '高', ruby: 'たか' }, { base: 'い' }, { base: '山', ruby: 'やま' }, { base: 'です' }, { base: '。' }], 'Kia là ngọn núi cao.'),
  card('v081', '海', 'うみ', 'biển', 'noun', [{ base: '夏', ruby: 'なつ' }, { base: 'に' }, { base: '海', ruby: 'うみ' }, { base: 'へ' }, { base: '行', ruby: 'い' }, { base: 'きます' }, { base: '。' }], 'Mùa hè tôi đi biển.'),
  card('v082', '川', 'かわ', 'sông', 'noun', [{ base: '川', ruby: 'かわ' }, { base: 'の' }, { base: '水', ruby: 'みず' }, { base: 'は' }, { base: '冷', ruby: 'つめ' }, { base: 'たいです' }, { base: '。' }], 'Nước sông lạnh.'),
  card('v083', '花', 'はな', 'hoa', 'noun', [{ base: '公園', ruby: 'こうえん' }, { base: 'に' }, { base: '花', ruby: 'はな' }, { base: 'が' }, { base: 'あります' }, { base: '。' }], 'Có hoa ở công viên.'),
  card('v084', '写真', 'しゃしん', 'ảnh', 'noun', [{ base: '写真', ruby: 'しゃしん' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' }], 'Tôi xem ảnh.'),
  card('v085', '音楽', 'おんがく', 'âm nhạc', 'noun', [{ base: '音楽', ruby: 'おんがく' }, { base: 'が' }, { base: '好', ruby: 'す' }, { base: 'きです' }, { base: '。' }], 'Tôi thích âm nhạc.'),
  card('v086', '映画', 'えいが', 'phim', 'noun', [{ base: '友達', ruby: 'ともだち' }, { base: 'と' }, { base: '映画', ruby: 'えいが' }, { base: 'を' }, { base: '見', ruby: 'み' }, { base: 'ます' }, { base: '。' }], 'Tôi xem phim với bạn.'),
  card('v087', '家族', 'かぞく', 'gia đình', 'noun', [{ base: '私', ruby: 'わたし' }, { base: 'の' }, { base: '家族', ruby: 'かぞく' }, { base: 'は' }, { base: '五人', ruby: 'ごにん' }, { base: 'です' }, { base: '。' }], 'Gia đình tôi có năm người.'),
  card('v088', '父', 'ちち', 'bố (của mình)', 'noun', [{ base: '父', ruby: 'ちち' }, { base: 'は' }, { base: '車', ruby: 'くるま' }, { base: 'で' }, { base: '来', ruby: 'き' }, { base: 'ます' }, { base: '。' }], 'Bố tôi đến bằng xe hơi.'),
  card('v089', '母', 'はは', 'mẹ (của mình)', 'noun', [{ base: '母', ruby: 'はは' }, { base: 'は' }, { base: '料理', ruby: 'りょうり' }, { base: 'が' }, { base: '上手', ruby: 'じょうず' }, { base: 'です' }, { base: '。' }], 'Mẹ tôi nấu ăn giỏi.'),
  card('v090', '兄', 'あに', 'anh trai (của mình)', 'noun', [{ base: '兄', ruby: 'あに' }, { base: 'は' }, { base: '背', ruby: 'せ' }, { base: 'が' }, { base: '高', ruby: 'たか' }, { base: 'いです' }, { base: '。' }], 'Anh trai tôi cao.'),
] as const;

export interface JLPTN5VocabularyLesson {
  id: 'vocab-1' | 'vocab-2' | 'vocab-3';
  title: string;
  cards: readonly JLPTN5VocabularyCard[];
}

export const JLPT_N5_VOCABULARY_LESSONS: Readonly<Record<JLPTN5VocabularyLesson['id'], JLPTN5VocabularyLesson>> = {
  'vocab-1': { id: 'vocab-1', title: 'Từ vựng cơ bản 1', cards: JLPT_N5_VOCABULARY },
  'vocab-2': { id: 'vocab-2', title: 'Từ vựng cơ bản 2', cards: JLPT_N5_VOCABULARY_TWO },
  'vocab-3': { id: 'vocab-3', title: 'Từ vựng cơ bản 3', cards: JLPT_N5_VOCABULARY_THREE },
};

/** Single source of truth for the number of cards required to complete Vocabulary 01. */
export const JLPT_N5_VOCABULARY_CARD_COUNT = JLPT_N5_VOCABULARY.length;

export function validateJLPTN5Vocabulary(): string[] {
  const issues: string[] = [];
  for (const lesson of Object.values(JLPT_N5_VOCABULARY_LESSONS)) {
    const ids = new Set<string>();
    if (lesson.cards.length !== 30) issues.push(`invalid vocabulary lesson size: ${lesson.id}`);
    for (const item of lesson.cards) {
      if (ids.has(item.id)) issues.push(`duplicate vocabulary id: ${lesson.id}:${item.id}`);
      ids.add(item.id);
      if (!item.word.some((segment) => Boolean(segment.ruby))) issues.push(`missing reading: ${lesson.id}:${item.id}`);
      if (!item.meaning.trim() || item.example.length === 0 || !item.exampleTranslation.trim()) issues.push(`incomplete vocabulary card: ${lesson.id}:${item.id}`);
    }
  }
  return issues;
}
