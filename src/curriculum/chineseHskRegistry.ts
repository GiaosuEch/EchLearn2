import type { LessonProgress } from '../stores/srsStore';

export type HSKLevel = 'HSK1';
export type ChineseSkill = 'vocabulary' | 'grammar' | 'reading' | 'pronunciation';
export type ChineseLessonStatus = 'locked' | 'active' | 'completed';
export type ChineseLessonId = `zh:hsk:hsk1:${ChineseSkill}:${string}`;

export interface ChineseLessonDescriptor {
  id: ChineseLessonId;
  track: 'hsk';
  level: HSKLevel;
  skill: ChineseSkill;
  title: string;
  objective: string;
  prerequisites: readonly Readonly<{ lessonId: ChineseLessonId; minimumPercent: number }>[];
  estimatedMinutes: number;
  version: 1;
  masteryThreshold: number;
  reviewItemIds?: readonly string[];
}

export interface ChinesePathNode {
  id: ChineseLessonId;
  level: HSKLevel;
  title: string;
  type: ChineseSkill;
  status: ChineseLessonStatus;
  progress: number;
  unmetPrerequisites: readonly ChineseLessonId[];
  unlockReason: string;
}

export const CHINESE_HSK_REGISTRY: readonly ChineseLessonDescriptor[] = [
  { id: 'zh:hsk:hsk1:vocabulary:foundations-01', track: 'hsk', level: 'HSK1', skill: 'vocabulary', title: 'Từ nền tảng', objective: 'Nhận diện và nhớ 20 từ HSK 1 dùng trong chào hỏi, con người và sinh hoạt.', prerequisites: [], estimatedMinutes: 18, version: 1, masteryThreshold: 80, reviewItemIds: Array.from({ length: 20 }, (_, i) => `zh:hsk:hsk1:vocab:${String(i + 1).padStart(3, '0')}`) },
  { id: 'zh:hsk:hsk1:pronunciation:tones-01', track: 'hsk', level: 'HSK1', skill: 'pronunciation', title: 'Bốn thanh điệu', objective: 'Phân biệt bốn thanh và thanh nhẹ bằng bài tập đối chiếu xác định.', prerequisites: [], estimatedMinutes: 10, version: 1, masteryThreshold: 80 },
  { id: 'zh:hsk:hsk1:grammar:shi-ma-01', track: 'hsk', level: 'HSK1', skill: 'grammar', title: '是 và câu hỏi 吗', objective: 'Tạo câu khẳng định với 是 và câu hỏi yes/no với 吗.', prerequisites: [{ lessonId: 'zh:hsk:hsk1:vocabulary:foundations-01', minimumPercent: 50 }], estimatedMinutes: 14, version: 1, masteryThreshold: 80 },
  { id: 'zh:hsk:hsk1:reading:introduction-01', track: 'hsk', level: 'HSK1', skill: 'reading', title: 'Bài đọc: Làm quen', objective: 'Tìm thông tin tường minh trong đoạn giới thiệu ngắn HSK 1.', prerequisites: [{ lessonId: 'zh:hsk:hsk1:grammar:shi-ma-01', minimumPercent: 80 }], estimatedMinutes: 12, version: 1, masteryThreshold: 80 },
  { id: 'zh:hsk:hsk1:vocabulary:daily-life-02', track: 'hsk', level: 'HSK1', skill: 'vocabulary', title: 'Sinh hoạt hằng ngày', objective: 'Nhớ 20 từ HSK 1 về thời gian, địa điểm và hoạt động hằng ngày.', prerequisites: [{ lessonId: 'zh:hsk:hsk1:reading:introduction-01', minimumPercent: 80 }], estimatedMinutes: 18, version: 1, masteryThreshold: 80, reviewItemIds: Array.from({ length: 20 }, (_, i) => `zh:hsk:hsk1:vocab:${String(i + 21).padStart(3, '0')}`) },
  { id: 'zh:hsk:hsk1:pronunciation:tone-sandhi-02', track: 'hsk', level: 'HSK1', skill: 'pronunciation', title: 'Biến điệu 不 và 一', objective: 'Nhận diện hai biến điệu phổ biến trong phát âm tiếng Trung.', prerequisites: [{ lessonId: 'zh:hsk:hsk1:pronunciation:tones-01', minimumPercent: 80 }], estimatedMinutes: 10, version: 1, masteryThreshold: 80 },
  { id: 'zh:hsk:hsk1:grammar:you-meiyou-02', track: 'hsk', level: 'HSK1', skill: 'grammar', title: '有 và 没有', objective: 'Diễn đạt sự sở hữu/tồn tại bằng 有 và phủ định bằng 没有.', prerequisites: [{ lessonId: 'zh:hsk:hsk1:vocabulary:daily-life-02', minimumPercent: 50 }], estimatedMinutes: 14, version: 1, masteryThreshold: 80 },
  { id: 'zh:hsk:hsk1:reading:daily-life-02', track: 'hsk', level: 'HSK1', skill: 'reading', title: 'Bài đọc: Một ngày của Minh', objective: 'Tìm thời gian và hoạt động trong một lịch trình ngắn HSK 1.', prerequisites: [{ lessonId: 'zh:hsk:hsk1:grammar:you-meiyou-02', minimumPercent: 80 }], estimatedMinutes: 12, version: 1, masteryThreshold: 80 },
] as const;

export const chineseLessonProgressKey = (id: ChineseLessonId) => id;
export const isChineseHskReviewId = (id: string) => id.startsWith('zh:hsk:');

function clampPercent(value: number): number { return Math.max(0, Math.min(100, Math.round(value))); }

/**
 * A vocabulary card counts toward unlock progress only after it has been
 * recalled at least once.  Keeping this structural avoids coupling the
 * curriculum to the entire SRS store while preventing a failed first review
 * from opening the next lesson.
 */
export type ChineseReviewProgress = Readonly<Record<string, Readonly<{ n: number }>>>;

export function resolveChineseHskPath(input: Readonly<{ level: HSKLevel; reviewItems: ChineseReviewProgress; lessonProgress: Readonly<Record<string, LessonProgress>> }>): ChinesePathNode[] {
  const lessons = CHINESE_HSK_REGISTRY.filter((lesson) => lesson.level === input.level);
  const reviewed = new Set(
    Object.entries(input.reviewItems)
      .filter(([id, item]) => isChineseHskReviewId(id) && item.n > 0)
      .map(([id]) => id),
  );
  const progress = new Map<ChineseLessonId, number>(lessons.map((lesson) => {
    if (lesson.reviewItemIds) {
      const done = lesson.reviewItemIds.filter((id) => reviewed.has(id)).length;
      return [lesson.id, clampPercent((done / lesson.reviewItemIds.length) * 100)];
    }
    return [lesson.id, clampPercent(input.lessonProgress[chineseLessonProgressKey(lesson.id)]?.percent ?? 0)];
  }));
  return lessons.map((lesson) => {
    const percent = progress.get(lesson.id) ?? 0;
    const unmetPrerequisites = lesson.prerequisites.filter((p) => (progress.get(p.lessonId) ?? 0) < p.minimumPercent).map((p) => p.lessonId);
    const status: ChineseLessonStatus = percent >= lesson.masteryThreshold ? 'completed' : unmetPrerequisites.length ? 'locked' : 'active';
    const unlockReason = status === 'completed' ? `Đã đạt ngưỡng ${lesson.masteryThreshold}%.` : status === 'active' ? (percent ? 'Tiếp tục để đạt ngưỡng thành thạo.' : 'Đã đáp ứng mọi điều kiện tiên quyết.') : `Cần hoàn thành: ${unmetPrerequisites.join(', ')}.`;
    return { id: lesson.id, level: lesson.level, title: lesson.title, type: lesson.skill, status, progress: percent, unmetPrerequisites, unlockReason };
  });
}

export function validateChineseHskRegistry(lessons: readonly ChineseLessonDescriptor[]): string[] {
  const issues: string[] = [];
  const byId = new Map<string, ChineseLessonDescriptor>();
  for (const lesson of lessons) {
    if (byId.has(lesson.id)) issues.push(`duplicate lesson id: ${lesson.id}`);
    else byId.set(lesson.id, lesson);
    if (!lesson.id.startsWith(`zh:hsk:${lesson.level.toLowerCase()}:${lesson.skill}:`)) issues.push(`non-canonical lesson id: ${lesson.id}`);
    if (lesson.track !== 'hsk' || lesson.level !== 'HSK1') issues.push(`wrong-level reference/content: ${lesson.id}`);
    if (lesson.masteryThreshold < 1 || lesson.masteryThreshold > 100) issues.push(`invalid mastery threshold: ${lesson.id}`);
  }
  for (const lesson of lessons) for (const prerequisite of lesson.prerequisites) {
    const target = byId.get(prerequisite.lessonId);
    if (!target) issues.push(`missing prerequisite: ${lesson.id} -> ${prerequisite.lessonId}`);
    else if (target.level !== lesson.level) issues.push(`wrong-level prerequisite: ${lesson.id} -> ${prerequisite.lessonId}`);
  }
  const visiting = new Set<string>(); const visited = new Set<string>();
  const visit = (id: string) => { if (visiting.has(id)) { issues.push(`prerequisite cycle: ${id}`); return; } if (visited.has(id)) return; const lesson = byId.get(id); if (!lesson) return; visiting.add(id); lesson.prerequisites.forEach((p) => visit(p.lessonId)); visiting.delete(id); visited.add(id); };
  lessons.forEach((lesson) => visit(lesson.id));
  return [...new Set(issues)];
}
