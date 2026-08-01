// Rich Multi-Level Course Structure for Japanese (JLPT N5 -> N1)
import type { CourseUnit } from '../../englishCourse';

export const course: CourseUnit[] = [
  {
    id: 'ja_mod_1',
    title: 'N5 - Khởi Đầu & Giao Tiếp Nhập Môn',
    description: 'Bảng chữ cái Hiragana, Katakana, chào hỏi & câu giao tiếp cơ bản hằng ngày.',
    level: 'A1',
    lessons: [
      { id: 'ja_les_1', title: 'Chào Hỏi & Giới Thiệu Bản Thân (あいさつ)', type: 'vocabulary', referenceId: 'v_ja_1' },
      { id: 'ja_les_2', title: 'Bảng Chữ Cái & Ngữ Âm Hiragana', type: 'grammar', referenceId: 'g_ja_2' },
      { id: 'ja_les_3', title: 'Luyện Nghe Nhịp Điệu Nhật Bản (聴解)', type: 'listening', referenceId: 'l_ja_3' },
      { id: 'ja_les_4', title: 'Phát Âm Chuẩn Cao Độ Giọng Nói (発音)', type: 'speaking', referenceId: 's_ja_4' },
      { id: 'ja_les_5', title: 'Đọc Hiểu Đoạn Văn Ngắn N5 (読解)', type: 'reading', referenceId: 'r_ja_5' },
    ]
  },
  {
    id: 'ja_mod_2',
    title: 'N5 - Cuộc Sống Hằng Ngày & Mua Sắm',
    description: 'Hỏi giá tiền, đi siêu thị, nhà hàng, hỏi đường & gọi món ăn.',
    level: 'A1',
    lessons: [
      { id: 'ja_les_6', title: 'Từ Vựng Mua Sắm & Giá Cả (買い物)', type: 'vocabulary', referenceId: 'v_ja_6' },
      { id: 'ja_les_7', title: 'Cấu Trúc Câu Mua Sắm Đây/Đó/Kia', type: 'grammar', referenceId: 'g_ja_7' },
      { id: 'ja_les_8', title: 'Nghe Hội Thoại Tại Quán Ăn Nhật', type: 'listening', referenceId: 'l_ja_8' },
      { id: 'ja_les_9', title: 'Thực Hành Nói Hỏi Đường & Địa Điểm', type: 'speaking', referenceId: 's_ja_9' },
    ]
  },
  {
    id: 'ja_mod_3',
    title: 'N4 - Sơ Cấp Nâng Cao & Trường Học',
    description: 'Thì quá thì, chia động thể Te (て形), xin lỗi, cảm ơn & thói quen.',
    level: 'A2',
    lessons: [
      { id: 'ja_les_10', title: 'Chia Động Từ Thể Te (て形)', type: 'grammar', referenceId: 'g_ja_10' },
      { id: 'ja_les_11', title: 'Từ Vựng Trường Học & Công Việc', type: 'vocabulary', referenceId: 'v_ja_11' },
      { id: 'ja_les_12', title: 'Luyện Nghe Tin Tức Sơ Cấp', type: 'listening', referenceId: 'l_ja_12' },
      { id: 'ja_les_13', title: 'Luyện Viết Đoạn Văn Nhật Bản', type: 'writing', referenceId: 'w_ja_13' },
    ]
  },
  {
    id: 'ja_mod_4',
    title: 'N3 - Trung Cấp & Du Lịch Văn Hóa',
    description: 'Văn hóa Nhật Bản, du lịch Tokyo, Kyoto, giao thông xe điện Shinkansen.',
    level: 'B1',
    lessons: [
      { id: 'ja_les_14', title: 'Từ Vựng Du Lịch & Khách Sạn', type: 'vocabulary', referenceId: 'v_ja_14' },
      { id: 'ja_les_15', title: 'Ngữ Pháp Biểu Thị Lý Do & Giả Định', type: 'grammar', referenceId: 'g_ja_15' },
      { id: 'ja_les_16', title: 'Nghe Đội Ngũ Hướng Dẫn Viên Du Lịch', type: 'listening', referenceId: 'l_ja_16' },
    ]
  },
  {
    id: 'ja_mod_5',
    title: 'N2/N1 - Cao Cấp & Kính Ngữ Doanh Nghiệp',
    description: 'Kính ngữ Kenjougo (謙譲語), Sonkeigo (尊敬語), phỏng vấn công ty Nhật.',
    level: 'B2',
    lessons: [
      { id: 'ja_les_17', title: 'Kính Ngữ Trong Giao Tiếp Tiếng Nhật', type: 'grammar', referenceId: 'g_ja_17' },
      { id: 'ja_les_18', title: 'Từ Vựng Thương Mại & Kinh Doanh', type: 'vocabulary', referenceId: 'v_ja_18' },
      { id: 'ja_les_19', title: 'Phản Hồi Trả Lời Phỏng Vấn AI', type: 'speaking', referenceId: 's_ja_19' },
    ]
  }
];
