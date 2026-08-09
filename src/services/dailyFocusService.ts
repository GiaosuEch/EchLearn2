import type { EchBuriAnimationState } from '../components/mascot/EchBuriAnimated';
import type { MissionWithProgress } from './missionProgressService';

export interface DailyFocusInput {
  missions: readonly MissionWithProgress[];
  currentLanguage: string;
  recommendedLessonPath?: string;
  streak: number;
}

export interface DailyFocus {
  status: 'in_progress' | 'complete';
  title: string;
  detail: string;
  progressLabel: string;
  actionLabel: string;
  actionPath: string;
  mascotState: EchBuriAnimationState;
}

const routeByMissionType: Partial<Record<MissionWithProgress['type'], string>> = {
  listening: '/app/listening',
  speaking: '/app/speaking',
  reading: '/app/reading',
  writing: '/app/writing',
  vocabulary: '/app/vocabulary',
  grammar: '/app/grammar',
};

function lessonFallback(currentLanguage: string): string {
  return `/app/lesson?id=${currentLanguage}_mod_1&lesId=${currentLanguage}_les_1`;
}

function actionForMission(mission: MissionWithProgress, input: DailyFocusInput): string {
  return routeByMissionType[mission.type] ?? input.recommendedLessonPath ?? lessonFallback(input.currentLanguage);
}

function mascotForMission(mission: MissionWithProgress, streak: number): EchBuriAnimationState {
  if (mission.type === 'listening') return 'listening';
  if (streak > 0) return 'streak';
  return 'thinking';
}

export function createDailyFocus(input: DailyFocusInput): DailyFocus {
  const nextMission = input.missions.find((mission) => !mission.completed);
  if (!nextMission) {
    return {
      status: 'complete',
      title: 'Bạn đã hoàn thành nhịp học hôm nay.',
      detail: 'Nhận thưởng nhiệm vụ để khép lại một ngày học thật đẹp.',
      progressLabel: 'Đã hoàn thành',
      actionLabel: 'Xem nhiệm vụ và nhận thưởng',
      actionPath: '/app/missions',
      mascotState: 'cheering',
    };
  }

  return {
    status: 'in_progress',
    title: nextMission.title,
    detail: nextMission.description,
    progressLabel: `${nextMission.progress} / ${nextMission.target}`,
    actionLabel: `Làm tiếp: ${nextMission.title}`,
    actionPath: actionForMission(nextMission, input),
    mascotState: mascotForMission(nextMission, input.streak),
  };
}
