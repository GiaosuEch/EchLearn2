// Full 6-Module Course Structure for English (A1 -> C2 Mastery)
import type { CourseUnit } from '../../englishCourse';

export const course: CourseUnit[] = [
  {
    id: 'en_mod_1',
    title: 'Module 1 - Sơ Cấp (A1)',
    description: 'Khởi đầu nhập môn, chào hỏi, từ vựng gia đình, đồ vật & câu đơn cơ bản.',
    level: 'A1',
    lessons: [
      { id: 'en_les_1', title: 'Bài 1: Từ Vựng Chào Hỏi & Gia Đình', type: 'vocabulary', referenceId: 'v_en_1' },
      { id: 'en_les_2', title: 'Bài 2: Ngữ Pháp Câu Đơn & Đại Từ', type: 'grammar', referenceId: 'g_en_2' },
      { id: 'en_les_3', title: 'Bài 3: Luyện Nghe Nhận Biết Phát Âm', type: 'listening', referenceId: 'l_en_3' },
      { id: 'en_les_4', title: 'Bài 4: Luyện Nói Tự Giới Thiệu Bản Thân', type: 'speaking', referenceId: 's_en_4' },
      { id: 'en_les_5', title: 'Bài 5: Đọc Hiểu Đoạn Văn Ngắn A1', type: 'reading', referenceId: 'r_en_5' },
    ]
  },
  {
    id: 'en_mod_2',
    title: 'Module 2 - Sơ Cấp Nâng Cao (A2)',
    description: 'Mua sắm, hỏi đường, nhà hàng, thời tiết & thói quen hằng ngày.',
    level: 'A2',
    lessons: [
      { id: 'en_les_6', title: 'Bài 6: Ngữ Pháp Thì Quá Khứ Đơn', type: 'grammar', referenceId: 'g_en_6' },
      { id: 'en_les_7', title: 'Bài 7: Từ Vựng Mua Sắm & Ăn Uống', type: 'vocabulary', referenceId: 'v_en_7' },
      { id: 'en_les_8', title: 'Bài 8: Luyện Nghe Hội Thoại Nhà Hàng', type: 'listening', referenceId: 'l_en_8' },
      { id: 'en_les_9', title: 'Bài 9: Luyện Nói Hỏi Đường & Địa Điểm', type: 'speaking', referenceId: 's_en_9' },
      { id: 'en_les_10', title: 'Bài 10: Đọc Hiểu Email & Thư Từ A2', type: 'reading', referenceId: 'r_en_10' },
    ]
  },
  {
    id: 'en_mod_3',
    title: 'Module 3 - Trung Cấp Giao Tiếp (B1)',
    description: 'Du lịch, công việc, mô tả trải nghiệm, cảm xúc & lập kế hoạch.',
    level: 'B1',
    lessons: [
      { id: 'en_les_11', title: 'Bài 11: Thì Hiện Tại Hoàn Thành', type: 'grammar', referenceId: 'g_en_11' },
      { id: 'en_les_12', title: 'Bài 12: Từ Vựng Công Việc & Du Lịch', type: 'vocabulary', referenceId: 'v_en_12' },
      { id: 'en_les_13', title: 'Bài 13: Luyện Nghe Tin Tức & Podcast B1', type: 'listening', referenceId: 'l_en_13' },
      { id: 'en_les_14', title: 'Bài 14: Thuyết Trình Kế Hoạch Tương Lai', type: 'speaking', referenceId: 's_en_14' },
      { id: 'en_les_15', title: 'Bài 15: Luyện Viết Đoạn Văn Thuyết Phục', type: 'writing', referenceId: 'w_en_15' },
    ]
  },
  {
    id: 'en_mod_4',
    title: 'Module 4 - Trung Cấp Nâng Cao (B2)',
    description: 'Thảo luận chủ đề xã hội, môi trường, công nghệ & tư duy phản biện.',
    level: 'B2',
    lessons: [
      { id: 'en_les_16', title: 'Bài 16: Câu Đảo Ngữ & Cấu Trúc Nhấn Mạnh', type: 'grammar', referenceId: 'g_en_16' },
      { id: 'en_les_17', title: 'Bài 17: Từ Vựng Môi Trường & Công Nghệ', type: 'vocabulary', referenceId: 'v_en_17' },
      { id: 'en_les_18', title: 'Bài 18: Luyện Nghe Phỏng Vấn Chuyên Gia B2', type: 'listening', referenceId: 'l_en_18' },
      { id: 'en_les_19', title: 'Bài 19: Luyện Nói Phản Bật Tranh Luận', type: 'speaking', referenceId: 's_en_19' },
      { id: 'en_les_20', title: 'Bài 20: Viết Bài Luận 250 Từ B2', type: 'writing', referenceId: 'w_en_20' },
    ]
  },
  {
    id: 'en_mod_5',
    title: 'Module 5 - Cao Cấp Doanh Nghiệp (C1)',
    description: 'Giao tiếp kinh doanh, hợp đồng, hội thảo quốc tế & thuyết trình chuyên nghiệp.',
    level: 'C1',
    lessons: [
      { id: 'en_les_21', title: 'Bài 21: Ngữ Pháp Cao Cấp Trong Thương Mại', type: 'grammar', referenceId: 'g_en_21' },
      { id: 'en_les_22', title: 'Bài 22: Thuật Ngữ Kinh Doanh & Tài Chính', type: 'vocabulary', referenceId: 'v_en_22' },
      { id: 'en_les_23', title: 'Bài 23: Nghe Tọa Đàm & Bài Báo Tạp Chí C1', type: 'listening', referenceId: 'l_en_23' },
      { id: 'en_les_24', title: 'Bài 24: Thực Hành Phỏng Vấn Doanh Nghiệp', type: 'speaking', referenceId: 's_en_24' },
      { id: 'en_les_25', title: 'Bài 25: Viết Báo Cáo Phân Tích Dữ Liệu', type: 'writing', referenceId: 'w_en_25' },
    ]
  },
  {
    id: 'en_mod_6',
    title: 'Module 6 - Thành Thạo Tuyệt Đối (C2 Mastery & IELTS 8.5+)',
    description: 'Chinh phục IELTS Academic Band 8.5+, phong thái nói tự tin như người bản xứ.',
    level: 'mastery',
    lessons: [
      { id: 'en_les_26', title: 'Bài 26: Tuyệt Chiêu IELTS Academic Writing Task 2', type: 'writing', referenceId: 'w_en_26' },
      { id: 'en_les_27', title: 'Bài 27: IELTS Speaking Part 1, 2, 3 Refinement', type: 'speaking', referenceId: 's_en_27' },
      { id: 'en_les_28', title: 'Bài 28: IELTS Listening Part 4 Fast Speech', type: 'listening', referenceId: 'l_en_28' },
      { id: 'en_les_29', title: 'Bài 29: IELTS Reading True/False/Not Given Mastery', type: 'reading', referenceId: 'r_en_29' },
      { id: 'en_les_30', title: 'Bài 30: Thi Thử IELTS 8.5 Full Simulation', type: 'grammar', referenceId: 'g_en_30' },
    ]
  }
];
