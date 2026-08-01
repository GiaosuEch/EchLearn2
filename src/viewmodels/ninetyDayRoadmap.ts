export type RoadmapPhase = {
  id: 'foundation' | 'fluency' | 'performance';
  startDay: number;
  endDay: number;
  label: string;
  title: string;
  outcome: string;
  checkpoint: string;
};

export const ninetyDayRoadmap: RoadmapPhase[] = [
  { id: 'foundation', startDay: 1, endDay: 30, label: 'Giai đoạn 01', title: 'Dùng được ngay', outcome: 'Tự giới thiệu, xử lý tình huống hằng ngày và hiểu ý chính của nội dung ngắn.', checkpoint: 'Gửi bản nói 60 giây + hoàn thành hội thoại thực tế.' },
  { id: 'fluency', startDay: 31, endDay: 60, label: 'Giai đoạn 02', title: 'Nói mạch lạc', outcome: 'Giải thích ý kiến, hỏi–đáp tự nhiên và viết tin nhắn/câu trả lời rõ ràng.', checkpoint: 'Ghi âm 2 phút + viết phản hồi có cấu trúc.' },
  { id: 'performance', startDay: 61, endDay: 90, label: 'Giai đoạn 03', title: 'Chứng minh năng lực', outcome: 'Hoàn thành thử thách mô phỏng đúng mục tiêu học: giao tiếp hoặc IELTS.', checkpoint: 'Bài đánh giá cuối kỳ với minh chứng trước/sau.' },
];

export function getRoadmapPhase(day: number): RoadmapPhase {
  return ninetyDayRoadmap.find((phase) => day >= phase.startDay && day <= phase.endDay) ?? ninetyDayRoadmap.at(-1)!;
}
