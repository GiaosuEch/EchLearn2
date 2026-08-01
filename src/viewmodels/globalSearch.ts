export type GlobalSearchResult = {
  label: string;
  description: string;
  to: string;
  keywords: string[];
};

const searchIndex: GlobalSearchResult[] = [
  { label: 'Lộ trình 90 ngày', description: 'Mục tiêu, tuần học và bài học tiếp theo', to: '/app/roadmap', keywords: ['lo trinh', 'roadmap', '90 ngay', 'bai hoc', 'muc tieu'] },
  { label: 'Bảng điều khiển', description: 'Tiến độ, streak và buổi học tiếp theo', to: '/app', keywords: ['dashboard', 'bang dieu khien', 'tien do', 'xp', 'streak'] },
  { label: 'Hồ sơ cá nhân', description: 'Thành tích, cài đặt và cộng đồng', to: '/app/profile', keywords: ['profile', 'ho so', 'tai khoan', 'thanh tich'] },
  { label: 'Trung tâm luyện tập', description: 'Chọn kỹ năng cần luyện hôm nay', to: '/app/practice', keywords: ['luyen tap', 'practice', 'ky nang'] },
  { label: 'Từ vựng', description: 'Ôn đúng từ cần dùng trong bối cảnh', to: '/app/vocabulary', keywords: ['tu vung', 'vocabulary', 'word'] },
  { label: 'Luyện IELTS', description: 'Bài tập theo band mục tiêu', to: '/app/ielts', keywords: ['ielts', 'band', 'academic'] },
];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function findGlobalSearchResults(query: string): GlobalSearchResult[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  return searchIndex.filter((item) => [item.label, item.description, ...item.keywords].map(normalize).join(' ').includes(normalizedQuery));
}
