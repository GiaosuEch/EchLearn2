import type { UserStats } from '../types';

export interface CoachingAdvice {
  focusAreas: string[];
  message: string;
  tone: 'strict' | 'encouraging' | 'analytical';
}

export const aiCoachingService = {
  /**
   * Generates highly personalized, elite-level coaching advice based on actual performance data.
   * Currently uses simulated logic, ready to be replaced with real LLM endpoint (e.g. OpenAI/Anthropic).
   */
  async generateAdvice(
    stats: UserStats, 
    weeklyTrend: { day: string; xp: number; minutes: number; lessons: number }[],
    ieltsTarget: number = 6.5
  ): Promise<CoachingAdvice> {
    // Top 0.1% Architecture: We simulate a latency that would occur in a real LLM call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalWeeklyXP = weeklyTrend.reduce((sum, d) => sum + d.xp, 0);
    const totalWeeklyMinutes = weeklyTrend.reduce((sum, d) => sum + d.minutes, 0);

    // Identify weak points
    const weaknesses = [];
    if (stats.listeningScore < 70) weaknesses.push('Listening');
    if (stats.writingScore < 70) weaknesses.push('Writing');
    if (stats.speakingScore < 70) weaknesses.push('Speaking');
    if (stats.readingScore < 70) weaknesses.push('Reading');

    // Elite AI Prompt Generation Logic
    if (totalWeeklyXP === 0) {
      return {
        focusAreas: ['Consistency', 'Discipline'],
        tone: 'strict',
        message: "Bạn chưa học một chữ nào trong tuần này. Nếu bạn nghĩ có thể đạt IELTS " + ieltsTarget + " bằng việc nhìn vào màn hình tĩnh, bạn đang tự lừa dối bản thân. Mở máy lên và hoàn thành ít nhất 1 bài học ngay bây giờ."
      };
    }

    if (totalWeeklyMinutes < 30) {
      return {
        focusAreas: ['Time Management'],
        tone: 'strict',
        message: `Tổng thời gian học tuần này của bạn chỉ là ${totalWeeklyMinutes} phút. Quá ít. Với cường độ này, bạn sẽ mất 3 năm để nhích lên 0.5 band. Đừng học kiểu cưỡi ngựa xem hoa, hãy deep-work ít nhất 30 phút mỗi ngày.`
      };
    }

    if (weaknesses.length > 0) {
      return {
        focusAreas: weaknesses,
        tone: 'analytical',
        message: `Biểu đồ nhận thức của bạn đang báo động đỏ ở kỹ năng ${weaknesses.join(' và ')}. Hãy ngừng làm các bài test dễ để lấy điểm ảo. Tuần tới, tôi yêu cầu bạn dồn 80% thời lượng vào các bài tập phân tích sâu của ${weaknesses[0]}. Đừng học vẹt, hãy tập trung vào ngữ nghĩa.`
      };
    }

    return {
      focusAreas: ['Mastery', 'Speed'],
      tone: 'encouraging',
      message: `Bạn đang duy trì cường độ rất tốt (${totalWeeklyMinutes} phút tuần này) và các chỉ số kỹ năng đều ở mức an toàn. Tuy nhiên, đừng tự mãn. Để đạt band ${ieltsTarget}, hãy bắt đầu thử thách bản thân với các nguồn nghe thật (Real-world audio) và viết học thuật (Academic Writing).`
    };
  }
};
