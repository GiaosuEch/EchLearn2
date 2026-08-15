import type { LessonProgress } from '../stores/srsStore';

export type KoreanTopikSkill = 'hangul' | 'vocabulary' | 'grammar' | 'reading' | 'pronunciation';
export type KoreanTopikLessonId = `ko:topik:topik1:${KoreanTopikSkill}:${string}`;
export type KoreanTopikLessonStatus = 'locked' | 'active' | 'completed';

export interface KoreanTopikLessonDescriptor {
  id: KoreanTopikLessonId;
  level: 'TOPIK1-starter';
  skill: KoreanTopikSkill;
  title: string;
  objective: string;
  estimatedMinutes: number;
  masteryThreshold: number;
  prerequisites: readonly Readonly<{ lessonId: KoreanTopikLessonId; minimumPercent: number }>[];
  reviewItemIds?: readonly string[];
  unlockPolicy: 'historical-completion';
  unlockDisclosure: string;
}

export interface KoreanTopikPathNode {
  id: KoreanTopikLessonId;
  level: 'TOPIK1-starter';
  title: string;
  type: KoreanTopikSkill;
  status: KoreanTopikLessonStatus;
  progress: number;
  unmetPrerequisites: readonly KoreanTopikLessonId[];
  unlockReason: string;
}

const disclosure = 'Khóa/mở là UX theo mastery hiện tại, không phải authorization hoặc entitlement.';
const vocabIds = (start: number) => Array.from({ length: 20 }, (_, offset) => `ko:topik:topik1:vocab:${String(start + offset).padStart(3, '0')}`);

export const KOREAN_TOPIK1_REGISTRY: readonly KoreanTopikLessonDescriptor[] = [
  { id: 'ko:topik:topik1:hangul:foundations-01', level: 'TOPIK1-starter', skill: 'hangul', title: 'Hangul nền tảng', objective: 'Nhận diện phụ âm, nguyên âm và âm tiết cơ bản.', estimatedMinutes: 20, masteryThreshold: 80, prerequisites: [], unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:pronunciation:batchim-01', level: 'TOPIK1-starter', skill: 'pronunciation', title: 'Batchim cơ bản', objective: 'Nhận diện phụ âm cuối trong các âm tiết quen thuộc.', estimatedMinutes: 12, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:hangul:foundations-01', minimumPercent: 80 }], unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:vocabulary:foundations-01', level: 'TOPIK1-starter', skill: 'vocabulary', title: 'Từ nền tảng', objective: 'Ôn 20 từ chào hỏi, con người và đồ vật quen thuộc.', estimatedMinutes: 18, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:hangul:foundations-01', minimumPercent: 80 }], reviewItemIds: vocabIds(1), unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:grammar:ieyo-yeyo-01', level: 'TOPIK1-starter', skill: 'grammar', title: '이에요 / 예요', objective: 'Giới thiệu danh từ bằng đuôi lịch sự hiện tại.', estimatedMinutes: 14, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:vocabulary:foundations-01', minimumPercent: 50 }], unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:reading:introduction-01', level: 'TOPIK1-starter', skill: 'reading', title: 'Bài đọc: Giới thiệu', objective: 'Tìm thông tin trực tiếp trong đoạn giới thiệu ngắn.', estimatedMinutes: 12, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:grammar:ieyo-yeyo-01', minimumPercent: 80 }], unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:vocabulary:daily-life-02', level: 'TOPIK1-starter', skill: 'vocabulary', title: 'Sinh hoạt hằng ngày', objective: 'Ôn 20 từ về thời gian, địa điểm và hoạt động.', estimatedMinutes: 18, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:reading:introduction-01', minimumPercent: 80 }], reviewItemIds: vocabIds(21), unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:grammar:topic-eun-neun-02', level: 'TOPIK1-starter', skill: 'grammar', title: '은 / 는', objective: 'Nêu chủ đề câu bằng tiểu từ 은 hoặc 는.', estimatedMinutes: 14, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:vocabulary:daily-life-02', minimumPercent: 50 }], unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
  { id: 'ko:topik:topik1:reading:daily-life-02', level: 'TOPIK1-starter', skill: 'reading', title: 'Bài đọc: Một ngày đi học', objective: 'Xác định thời gian và hoạt động trong lịch trình ngắn.', estimatedMinutes: 12, masteryThreshold: 80, prerequisites: [{ lessonId: 'ko:topik:topik1:grammar:topic-eun-neun-02', minimumPercent: 80 }], unlockPolicy: 'historical-completion', unlockDisclosure: disclosure },
] as const;

type ReviewProgress = Readonly<Record<string, Readonly<{ n: number }>>>;
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function resolveKoreanTopikPath(input: Readonly<{ reviewItems: ReviewProgress; lessonProgress: Readonly<Record<string, LessonProgress>> }>): KoreanTopikPathNode[] {
  const progress = new Map<KoreanTopikLessonId, number>(KOREAN_TOPIK1_REGISTRY.map((lesson) => {
    if (lesson.reviewItemIds) {
      const recalled = lesson.reviewItemIds.filter((id) => input.reviewItems[id]?.n > 0).length;
      return [lesson.id, clamp((recalled / lesson.reviewItemIds.length) * 100)];
    }
    return [lesson.id, clamp(input.lessonProgress[lesson.id]?.percent ?? 0)];
  }));
  return KOREAN_TOPIK1_REGISTRY.map((lesson) => {
    const unmetPrerequisites = lesson.prerequisites.filter((item) => (progress.get(item.lessonId) ?? 0) < item.minimumPercent && !input.lessonProgress[item.lessonId]?.completed).map((item) => item.lessonId);
    const percent = progress.get(lesson.id) ?? 0;
    const status: KoreanTopikLessonStatus = percent >= lesson.masteryThreshold || input.lessonProgress[lesson.id]?.completed ? 'completed' : unmetPrerequisites.length ? 'locked' : 'active';
    return { id: lesson.id, level: lesson.level, title: lesson.title, type: lesson.skill, status, progress: percent, unmetPrerequisites, unlockReason: status === 'locked' ? `Cần mastery hiện tại ở: ${unmetPrerequisites.join(', ')}.` : status === 'completed' ? 'Đã đạt ngưỡng hoàn thành.' : lesson.unlockDisclosure };
  });
}

export function validateKoreanTopikRegistry(lessons: readonly KoreanTopikLessonDescriptor[]): string[] {
  const issues: string[] = [];
  const byId = new Map<string, KoreanTopikLessonDescriptor>();
  for (const lesson of lessons) {
    if (byId.has(lesson.id)) issues.push(`duplicate lesson id: ${lesson.id}`);
    byId.set(lesson.id, lesson);
    if (!lesson.id.startsWith(`ko:topik:topik1:${lesson.skill}:`)) issues.push(`non-canonical lesson id: ${lesson.id}`);
    if (!lesson.title.trim() || !lesson.objective.trim() || !lesson.unlockDisclosure.trim()) issues.push(`missing lesson copy: ${lesson.id}`);
    if (lesson.masteryThreshold < 1 || lesson.masteryThreshold > 100) issues.push(`invalid mastery threshold: ${lesson.id}`);
    if (lesson.reviewItemIds && new Set(lesson.reviewItemIds).size !== lesson.reviewItemIds.length) issues.push(`duplicate review item: ${lesson.id}`);
  }
  for (const lesson of lessons) for (const prerequisite of lesson.prerequisites) {
    if (!byId.has(prerequisite.lessonId)) issues.push(`missing prerequisite: ${lesson.id} -> ${prerequisite.lessonId}`);
    if (prerequisite.minimumPercent < 1 || prerequisite.minimumPercent > 100) issues.push(`invalid prerequisite threshold: ${lesson.id}`);
  }
  const visiting = new Set<string>(); const visited = new Set<string>();
  const visit = (id: string) => { if (visiting.has(id)) { issues.push(`prerequisite cycle: ${id}`); return; } if (visited.has(id)) return; const lesson = byId.get(id); if (!lesson) return; visiting.add(id); lesson.prerequisites.forEach((item) => visit(item.lessonId)); visiting.delete(id); visited.add(id); };
  lessons.forEach((lesson) => visit(lesson.id));
  return [...new Set(issues)];
}
