import type { CurriculumCourse } from '../../domain/curriculum/curriculumEngine';
import type { LearnerCompetencyProfile } from '../../domain/curriculum/competencyTracker';
import type { PathNode } from '../../components/learning/LearningPathMap';

export function generateJapanesePathNodes(
  course: CurriculumCourse,
  profile: LearnerCompetencyProfile
): PathNode[] {
  const nodes: PathNode[] = [];
  
  // Track lessons that are already added as remediation to avoid duplicates
  const remediationAdded = new Set<string>();

  course.units.forEach((unit, unitIndex) => {
    const isCompleted = unitIndex < profile.currentUnitIndex;
    const isActive = unitIndex === profile.currentUnitIndex;
    const isLocked = unitIndex > profile.currentUnitIndex;

    // 1. Add standard lessons for this unit
    unit.lessons.forEach((lesson) => {
      // If the lesson is going to be shown as a remediation node in the current active unit,
      // we can still show it here as completed/active depending on the unit status.
      // But actually, for simplicity, all standard lessons appear first.
      nodes.push({
        id: lesson.id,
        level: course.level,
        title: lesson.title,
        type: (lesson.title.includes('Ngữ pháp') ? 'grammar' : lesson.title.includes('Hán tự') ? 'kanji' : lesson.title.includes('Nghe') ? 'listening' : 'vocabulary') as PathNode['type'],
        status: isLocked ? 'locked' : (isCompleted ? 'completed' : 'active'),
        progress: isCompleted ? 100 : (isActive ? 50 : 0) // Dummy progress for now
      });
    });

    // 2. If this is the active unit and there are weak areas, insert remediation nodes BEFORE the checkpoint
    if (isActive) {
      profile.weakAreas.forEach((weakArea) => {
        weakArea.remediationLessonIds.forEach((lessonId) => {
          if (!remediationAdded.has(lessonId)) {
            // Find the lesson details from the course
            let lessonDetails = undefined;
            for (const u of course.units) {
              const found = u.lessons.find((l) => l.id === lessonId);
              if (found) {
                lessonDetails = found;
                break;
              }
            }
            
            if (lessonDetails) {
              remediationAdded.add(lessonId);
              nodes.push({
                id: `remedy-${lessonId}`,
                level: course.level,
                title: `Ôn tập: ${lessonDetails.title}`,
                type: (lessonDetails.title.includes('Ngữ pháp') ? 'grammar' : lessonDetails.title.includes('Hán tự') ? 'kanji' : lessonDetails.title.includes('Nghe') ? 'listening' : 'vocabulary') as PathNode['type'],
                status: 'active',
                progress: 0
              });
            }
          }
        });
      });
    }

    // 3. Add the Checkpoint for this unit
    nodes.push({
      id: unit.checkpoint.id,
      level: course.level,
      title: `Kiểm tra Unit ${unitIndex}`,
      type: 'checkpoint' as any, // We will extend PathNode type in LearningPathMap
      status: isLocked ? 'locked' : (isCompleted ? 'completed' : 'active'),
      progress: isCompleted ? 100 : 0
    });
  });

  // 4. Add the Exit Gate
  nodes.push({
    id: course.exitGate.id,
    level: course.level,
    title: 'Bài thi vượt cấp',
    type: 'mastery-gate' as any,
    status: 'active', // Mastery gate is always available for advanced learners to skip
    progress: 0
  });

  return nodes;
}
