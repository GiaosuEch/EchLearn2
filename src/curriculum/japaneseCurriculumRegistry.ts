import type { LessonProgress } from '../stores/srsStore';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type JapaneseSkill = 'kana' | 'vocabulary' | 'grammar' | 'reading';
export type JapaneseLessonStatus = 'locked' | 'active' | 'completed';

export interface JapaneseLessonDescriptor {
  id: string;
  level: JLPTLevel;
  skill: JapaneseSkill;
  title: string;
  objective: string;
  estimatedMinutes: number;
  version: 1;
  masteryThreshold: number;
  prerequisites: readonly Readonly<{ lessonId: string; minimumPercent: number }>[];
  progressSource: 'baseline' | 'japanese-vocabulary-reviews' | 'lesson-progress';
  reviewItemCount?: number;
}

export interface JapanesePathNode {
  id: string;
  level: JLPTLevel;
  title: string;
  type: JapaneseSkill;
  status: JapaneseLessonStatus;
  progress: number;
  unmetPrerequisites: readonly string[];
}

const JAPANESE_PROGRESS_NAMESPACE = 'ja:jlpt';
const N5_VOCABULARY_CARD_COUNT = 30;

export function getJapaneseLessonProgressId(lessonId: string, level: JLPTLevel = 'N5'): string {
  return `${JAPANESE_PROGRESS_NAMESPACE}:${level.toLowerCase()}:${lessonId}`;
}

export function getJapaneseReviewItemId(lessonId: string, questionId: string, level: JLPTLevel = 'N5'): string {
  return `${getJapaneseLessonProgressId(lessonId, level)}:${questionId}`;
}

export const JAPANESE_LESSON_REGISTRY: readonly JapaneseLessonDescriptor[] = [
  {
    id: 'kana-1', level: 'N5', skill: 'kana', title: 'Nhập môn Kana', objective: 'Đọc và nhận diện Hiragana, Katakana cơ bản.',
    estimatedMinutes: 20, version: 1, masteryThreshold: 80, prerequisites: [], progressSource: 'lesson-progress',
  },
  {
    id: 'vocab-1', level: 'N5', skill: 'vocabulary', title: 'Từ vựng cơ bản 1', objective: 'Ôn 30 từ tiếng Nhật nền tảng bằng SRS.',
    estimatedMinutes: 15, version: 1, masteryThreshold: 100, prerequisites: [{ lessonId: 'kana-1', minimumPercent: 80 }], progressSource: 'japanese-vocabulary-reviews', reviewItemCount: 30,
  },
  {
    id: 'grammar-1', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 1', objective: 'Dùng mẫu câu A は B です.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'vocab-1', minimumPercent: 50 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-1', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 1', objective: 'Hiểu thông tin tường minh trong đoạn văn N5 ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-1', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-2', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 2', objective: 'Phân biệt これ・それ・あれ khi chỉ đồ vật.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-1', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-2', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 2', objective: 'Đọc thông tin mua sắm đơn giản và xác định vật được nhắc đến.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-2', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'vocab-2', level: 'N5', skill: 'vocabulary', title: 'Từ vựng cơ bản 2', objective: 'Ôn 30 từ về thời gian, địa điểm và sinh hoạt hằng ngày bằng SRS.',
    estimatedMinutes: 15, version: 1, masteryThreshold: 100, prerequisites: [{ lessonId: 'reading-2', minimumPercent: 80 }], progressSource: 'japanese-vocabulary-reviews', reviewItemCount: 30,
  },
  {
    id: 'grammar-3', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 3', objective: 'Nói nơi đến bằng mẫu N に 行きます／来ます／帰ります.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'vocab-2', minimumPercent: 50 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-3', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 3', objective: 'Xác định điểm đến và thời điểm trong lịch trình ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-3', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-4', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 4', objective: 'Dùng trợ từ の để nối danh từ và diễn tả sở hữu / quan hệ.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-3', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-4', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 4', objective: 'Nhận diện người, đồ vật và địa điểm được liên kết bằng trợ từ の.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-4', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-5', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 5', objective: 'Diễn tả sự tồn tại của đồ vật và người bằng あります／います.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-4', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-5', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 5', objective: 'Xác định người và đồ vật có mặt tại một địa điểm quen thuộc.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-5', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-6', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 6', objective: 'Dùng trợ từ を để nói tân ngữ trực tiếp của hành động.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-5', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-6', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 6', objective: 'Xác định người làm hành động và đồ vật được ăn, uống hoặc đọc.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-6', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-7', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 7', objective: 'Nói sở thích bằng mẫu N が 好きです.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-6', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-7', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 7', objective: 'Nhận diện sở thích và hoạt động của từng nhân vật.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-7', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'vocab-3', level: 'N5', skill: 'vocabulary', title: 'Từ vựng cơ bản 3', objective: 'Ôn 30 từ mô tả người, đồ vật và thời tiết bằng SRS.',
    estimatedMinutes: 15, version: 1, masteryThreshold: 100, prerequisites: [{ lessonId: 'reading-7', minimumPercent: 80 }], progressSource: 'japanese-vocabulary-reviews', reviewItemCount: 30,
  },
  {
    id: 'grammar-8', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 8', objective: 'Miêu tả bằng tính từ đuôi い trong mẫu N は A です.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'vocab-3', minimumPercent: 50 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-8', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 8', objective: 'Hiểu đặc điểm của đồ vật và thời tiết trong đoạn mô tả ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-8', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-9', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 9', objective: 'Phủ định tính từ đuôi い bằng mẫu Aい → Aくないです.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-8', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-9', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 9', objective: 'Tìm thông tin phủ định về địa điểm, đồ vật và thời tiết trong đoạn văn ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-9', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-10', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 10', objective: 'Phủ định tính từ đuôi な bằng mẫu Aじゃないです.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-9', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-10', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 10', objective: 'Đối chiếu đặc điểm phủ định của địa điểm, con người và đồ vật trong đoạn văn ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-10', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-11', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 11', objective: 'Nói điểm bắt đầu và kết thúc bằng mẫu N から N まで.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-10', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-11', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 11', objective: 'Tìm mốc thời gian và nơi chốn trong lịch sinh hoạt ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-11', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-12', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 12', objective: 'Nói một hành động không diễn ra bằng thể lịch sự Vません.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-11', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-12', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 12', objective: 'Phân biệt hoạt động có làm và không làm trong kế hoạch cuối tuần.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-12', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-13', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 13', objective: 'Kể hành động đã xảy ra bằng thể lịch sự Vました.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-12', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-13', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 13', objective: 'Xác định những hoạt động đã hoàn thành trong nhật ký ngày hôm qua.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-13', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-14', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 14', objective: 'Nói một hành động đã không xảy ra bằng thể lịch sự Vませんでした.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-13', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-14', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 14', objective: 'Nhận ra những kế hoạch đã không thực hiện trong câu chuyện ngắn về chuyến đi.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-14', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-15', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 15', objective: 'Diễn đạt mong muốn có một danh từ bằng mẫu N が ほしいです.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-14', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-15', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 15', objective: 'Nhận diện đồ vật mà mỗi nhân vật muốn có trong hội thoại mua quà.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-15', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-16', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 16', objective: 'Diễn đạt mong muốn làm một hành động bằng mẫu Vたいです.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-15', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-16', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 16', objective: 'Tìm kế hoạch và mong muốn hoạt động của từng nhân vật trong đoạn hội thoại ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-16', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-17', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 17', objective: 'Mời ai làm một hành động bằng mẫu Vませんか.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-16', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-17', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 17', objective: 'Hiểu lời mời, lời nhận và lời từ chối lịch sự trong hội thoại đơn giản.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-17', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-18', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 18', objective: 'Đề nghị cùng làm một hành động bằng mẫu Vましょう.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-17', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-18', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 18', objective: 'Theo dõi các đề nghị và kế hoạch chung trong cuộc hội thoại ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-18', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-19', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 19', objective: 'Chỉ nơi diễn ra hành động bằng mẫu N で Vます.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-18', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-19', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 19', objective: 'Xác định đúng nơi mỗi hành động diễn ra trong lịch sinh hoạt ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-19', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-20', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 20', objective: 'Đưa yêu cầu lịch sự bằng mẫu Vてください.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-19', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-20', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 20', objective: 'Hiểu các yêu cầu lịch sự trong chỉ dẫn tại thư viện.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-20', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-21', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 21', objective: 'Mô tả hành động đang diễn ra bằng mẫu Vています.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-20', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-21', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 21', objective: 'Nhận diện các hành động đang diễn ra trong lớp học và ở nhà.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-21', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-22', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 22', objective: 'Hỏi và cho phép một hành động bằng mẫu Vてもいいです.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-21', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-22', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 22', objective: 'Hiểu các câu hỏi xin phép và câu trả lời về quy định trong lớp học.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-22', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-23', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 23', objective: 'Nói một hành động bị cấm bằng mẫu Vてはいけません.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-22', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-23', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 23', objective: 'Hiểu biển báo và quy tắc không được làm tại địa điểm công cộng.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-23', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-24', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 24', objective: 'So sánh hai đối tượng bằng mẫu A より B のほうが…です.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-23', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-24', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 24', objective: 'Tìm đối tượng được so sánh và đặc điểm nổi bật trong đoạn văn ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-24', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-25', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 25', objective: 'Nói khả năng làm hoặc biết một việc bằng mẫu N が できます.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-24', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-25', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 25', objective: 'Nhận diện các khả năng và kỹ năng của từng nhân vật trong đoạn giới thiệu ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-25', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-26', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 26', objective: 'Liệt kê hai danh từ bằng trợ từ N と N.',
    estimatedMinutes: 12, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-25', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-26', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 26', objective: 'Xác định các đồ vật, món ăn và người được liệt kê trong đoạn mô tả ngắn.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-26', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-27', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 27', objective: 'Kể đặc điểm của quá khứ bằng mẫu tính từ い Aかったです.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-26', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-27', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 27', objective: 'Nhận diện nhận xét về thời tiết, địa điểm và đồ vật trong quá khứ.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-27', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-28', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 28', objective: 'Kể đặc điểm quá khứ bằng mẫu tính từ な Aでした.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-27', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-28', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 28', objective: 'Hiểu các nhận xét quá khứ về địa điểm, sự kiện và con người.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-28', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-29', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 29', objective: 'Diễn đạt quá khứ phủ định của tính từ い bằng mẫu Aくなかったです.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-28', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-29', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 29', objective: 'Nhận diện những đặc điểm không đúng trong một chuyến đi đã qua.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-29', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'grammar-30', level: 'N5', skill: 'grammar', title: 'Ngữ pháp Bài 30', objective: 'Nêu lý do đơn giản bằng mẫu S から、S.',
    estimatedMinutes: 14, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'reading-29', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
  {
    id: 'reading-30', level: 'N5', skill: 'reading', title: 'Đọc hiểu ngắn 30', objective: 'Xác định lý do của lựa chọn hoặc hành động trong đoạn hội thoại thực tế.',
    estimatedMinutes: 10, version: 1, masteryThreshold: 80, prerequisites: [{ lessonId: 'grammar-30', minimumPercent: 80 }], progressSource: 'lesson-progress',
  },
] as const;

export function getJapaneseLessonsForLevel(level: JLPTLevel): readonly JapaneseLessonDescriptor[] {
  return JAPANESE_LESSON_REGISTRY.filter((lesson) => lesson.level === level);
}

type ReviewMasteryById = Readonly<Record<string, Readonly<{ n: number }>>>;

function getJapaneseVocabularyProgress(lesson: JapaneseLessonDescriptor, reviewItems: ReviewMasteryById): number {
  const progressPrefix = `${getJapaneseLessonProgressId(lesson.id, lesson.level)}:`;
  const supportsLegacyIds = lesson.id === 'vocab-1';
  const reviewed = Object.entries(reviewItems)
    .filter(([id, item]) => item.n > 0 && (id.startsWith(progressPrefix) || (supportsLegacyIds && id.startsWith('ja_v_'))))
    .length;
  const reviewItemCount = lesson.reviewItemCount ?? N5_VOCABULARY_CARD_COUNT;
  return Math.min(100, Math.round((reviewed / reviewItemCount) * 100));
}

function getRawProgress(
  lesson: JapaneseLessonDescriptor,
  reviewItems: ReviewMasteryById,
  lessonProgress: Readonly<Record<string, LessonProgress>>,
): number {
  if (lesson.progressSource === 'baseline') return 100;
  if (lesson.progressSource === 'japanese-vocabulary-reviews') return getJapaneseVocabularyProgress(lesson, reviewItems);
  return lessonProgress[getJapaneseLessonProgressId(lesson.id, lesson.level)]?.percent
    ?? lessonProgress[lesson.id]?.percent
    ?? 0;
}

export function resolveJapanesePathProgress(input: Readonly<{
  level: JLPTLevel;
  reviewItems: ReviewMasteryById;
  lessonProgress: Readonly<Record<string, LessonProgress>>;
}>): JapanesePathNode[] {
  const lessons = JAPANESE_LESSON_REGISTRY.filter((lesson) => lesson.level === input.level);
  const progressByLessonId = new Map(lessons.map((lesson) => [lesson.id, getRawProgress(lesson, input.reviewItems, input.lessonProgress)]));

  return lessons.map((lesson) => {
    const progress = progressByLessonId.get(lesson.id) ?? 0;
    const unmetPrerequisites = lesson.prerequisites
      .filter(({ lessonId, minimumPercent }) => (progressByLessonId.get(lessonId) ?? 0) < minimumPercent)
      .map(({ lessonId }) => lessonId);
    const status: JapaneseLessonStatus = progress >= lesson.masteryThreshold
      ? 'completed'
      : unmetPrerequisites.length > 0
        ? 'locked'
        : 'active';

    return { id: lesson.id, level: lesson.level, title: lesson.title, type: lesson.skill, status, progress, unmetPrerequisites };
  });
}

export function validateJapaneseLessonRegistry(lessons: readonly JapaneseLessonDescriptor[]): string[] {
  const issues: string[] = [];
  const byId = new Map<string, JapaneseLessonDescriptor>();
  for (const lesson of lessons) {
    if (byId.has(lesson.id)) issues.push(`duplicate lesson id: ${lesson.id}`);
    byId.set(lesson.id, lesson);
    if (lesson.masteryThreshold < 1 || lesson.masteryThreshold > 100) issues.push(`invalid mastery threshold: ${lesson.id}`);
    if (lesson.progressSource === 'japanese-vocabulary-reviews' && (!Number.isInteger(lesson.reviewItemCount) || (lesson.reviewItemCount ?? 0) < 1)) {
      issues.push(`missing review item count: ${lesson.id}`);
    }
    for (const prerequisite of lesson.prerequisites) {
      if (prerequisite.minimumPercent < 1 || prerequisite.minimumPercent > 100) issues.push(`invalid prerequisite threshold: ${lesson.id}`);
    }
  }
  for (const lesson of lessons) {
    for (const prerequisite of lesson.prerequisites) {
      if (!byId.has(prerequisite.lessonId)) issues.push(`missing prerequisite: ${lesson.id} -> ${prerequisite.lessonId}`);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (lessonId: string) => {
    if (visiting.has(lessonId)) {
      issues.push(`prerequisite cycle: ${lessonId}`);
      return;
    }
    if (visited.has(lessonId)) return;
    const lesson = byId.get(lessonId);
    if (!lesson) return;
    visiting.add(lessonId);
    lesson.prerequisites.forEach(({ lessonId: prerequisiteId }) => visit(prerequisiteId));
    visiting.delete(lessonId);
    visited.add(lessonId);
  };
  lessons.forEach((lesson) => visit(lesson.id));

  return issues;
}
