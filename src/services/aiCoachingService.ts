import type { UserStats } from '../types';

export interface CoachingAdvice {
  focusAreas: string[];
  message: string;
  tone: 'strict' | 'encouraging' | 'analytical';
}

/**
 * Builds deterministic study guidance from the learner's recorded weekly data.
 * This is a transparent rules engine, not AI or a calibrated exam forecast.
 */
export const learningAdviceService = {
  generateAdvice(
    stats: UserStats,
    weeklyTrend: { day: string; xp: number; minutes: number; lessons: number }[],
  ): CoachingAdvice {
    const totalWeeklyXP = weeklyTrend.reduce((sum, day) => sum + day.xp, 0);
    const totalWeeklyMinutes = weeklyTrend.reduce((sum, day) => sum + day.minutes, 0);

    const focusAreas: string[] = [];
    if (stats.listeningScore < 70) focusAreas.push('Listening');
    if (stats.writingScore < 70) focusAreas.push('Writing');
    if (stats.speakingScore < 70) focusAreas.push('Speaking');
    if (stats.readingScore < 70) focusAreas.push('Reading');

    if (totalWeeklyXP === 0) {
      return {
        focusAreas: ['Consistency'],
        tone: 'strict',
        message: 'Tuần này chưa ghi nhận hoạt động học. Hãy bắt đầu bằng một bài học ngắn và quay lại báo cáo sau khi hoàn thành.',
      };
    }

    if (totalWeeklyMinutes < 30) {
      return {
        focusAreas: ['Time Management'],
        tone: 'strict',
        message: `Tuần này đã ghi nhận ${totalWeeklyMinutes} phút học. Hãy chọn một khung giờ ngắn, đều đặn và tăng dần theo lịch phù hợp với bạn.`,
      };
    }

    if (focusAreas.length > 0) {
      return {
        focusAreas,
        tone: 'analytical',
        message: `Theo các hoạt động đã ghi nhận, ${focusAreas.join(' và ')} đang có tỷ lệ hoàn thành thấp hơn các kỹ năng còn lại. Hãy ưu tiên một bài luyện phù hợp và xem lại lỗi sau mỗi lượt.`,
      };
    }

    return {
      focusAreas: ['Review', 'Challenge'],
      tone: 'encouraging',
      message: `Bạn đã ghi nhận ${totalWeeklyMinutes} phút học trong tuần này. Hãy tiếp tục ôn lỗi cũ và chọn một hoạt động khó hơn khi đã sẵn sàng.`,
    };
  },
};
