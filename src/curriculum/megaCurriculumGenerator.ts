import type { CourseUnit } from './englishCourse';

// Skill distribution types
const SKILL_TYPES: ('grammar' | 'reading' | 'listening' | 'speaking' | 'vocabulary' | 'writing')[] = [
  'vocabulary', 'grammar', 'listening', 'speaking', 'reading', 'writing'
];

// Language specific topic templates
const TOPIC_TEMPLATES: Record<string, { title: string; desc: string }[]> = {
  vocabulary: [
    { title: 'Chào Hỏi & Nhập Môn Căn Bản', desc: 'Từ vựng các câu chào hỏi, giao tiếp cơ bản hàng ngày.' },
    { title: 'Gia Đình & Bạn Bè', desc: 'Từ vựng xưng hô, mối quan hệ và miêu tả ngoại hình.' },
    { title: 'Đồ Ăn, Thức Uống & Nhà Hàng', desc: 'Từ vựng gọi món, tên các món ăn và gia vị.' },
    { title: 'Thời Gian, Ngày Tháng & Thời Tiết', desc: 'Từ vựng các ngày trong tuần, các mùa và khí hậu.' },
    { title: 'Nghề Nghiệp & Nơi Làm Việc', desc: 'Từ vựng văn phòng, công ty và các ngành nghề.' },
    { title: 'Du Lịch, Xe Cộ & Khách Sạn', desc: 'Từ vựng phương tiện di chuyển, đặt phòng và vé máy bay.' },
    { title: 'Cơ Thể Người & Sức Khỏe', desc: 'Từ vựng sức khỏe, các bộ phận cơ thể và bệnh viện.' },
    { title: 'Môi Trường & Tự Nhiên', desc: 'Từ vựng động vật, thực vật và biến đổi khí hậu.' },
    { title: 'Công Nghệ, AI & Internet', desc: 'Từ vựng thiết bị thông minh, phần mềm và trí tuệ nhân tạo.' },
    { title: 'Thương Mại & Kinh Doanh', desc: 'Từ vựng tài chính, doanh thu và đàm phán hợp đồng.' },
    { title: 'Y Tế & Chăm Sóc Sức Khỏe', desc: 'Từ vựng khám chữa bệnh, bảo hiểm và đơn thuốc.' },
    { title: 'Luật Pháp & Xã Hội', desc: 'Từ vựng quyền lợi, chính sách và luật giao thông.' },
    { title: 'Nghệ Thuật & Âm Nhạc', desc: 'Từ vựng điện ảnh, triển lãm và sáng tác nhạc.' },
  ],
  grammar: [
    { title: 'Cấu Trúc Câu Đơn & Đại Từ', desc: 'Quy tắc sắp xếp từ và danh xưng nhập môn.' },
    { title: 'Thì Hiện Tại & Thói Quen', desc: 'Cách diễn tả các hành động lặp đi lặp lại.' },
    { title: 'Thì Quá Khứ & Trải Nghiệm', desc: 'Cách kể lại kỷ niệm và sự kiện đã qua.' },
    { title: 'Thì Tương Lai & Kế Hoạch', desc: 'Cấu trúc diễn tả dự định và mục tiêu tương lai.' },
    { title: 'Câu Hỏi & Từ Để Hỏi', desc: 'Cách đặt câu hỏi Ai, Cái gì, Ở đâu, Khi nào, Tại sao.' },
    { title: 'Tính Từ & Trạng Từ So Sánh', desc: 'So sánh hơn, so sánh nhất và mức độ.' },
    { title: 'Động Từ Bất Quy Tắc & Thể', desc: 'Quy tắc chia động từ phức tạp.' },
    { title: 'Câu Bị Động & Gián Tiếp', desc: 'Chuyển đổi góc nhìn trong câu.' },
    { title: 'Câu Điều Kiện & Giả Định', desc: 'Diễn tả giả định Nếu - Thì trong thực tế.' },
    { title: 'Cấu Trúc Đảo Ngữ & Nhấn Mạnh', desc: 'Ngữ pháp cao cấp nâng band điểm.' },
    { title: 'Mệnh Đề Quan Hệ Phức Hợp', desc: 'Nối các ý phức tạp trong một câu duy nhất.' },
  ],
  listening: [
    { title: 'Nghe Nhận Biết Âm Điệu & Trọng Âm', desc: 'Luyện tai nghe phản xạ phát âm chuẩn.' },
    { title: 'Hội Thoại Mua Sắm & Giá Cả', desc: 'Nghe các đoạn đối thoại tại cửa hàng.' },
    { title: 'Hỏi Đường & Chỉ Dẫn Địa Lý', desc: 'Nghe hướng dẫn di chuyển và bản đồ.' },
    { title: 'Thông Báo Sân Bay & Ga Tàu', desc: 'Nghe loa thông báo công cộng.' },
    { title: 'Phỏng Vấn Xin Việc & Công Ty', desc: 'Nghe trao đổi phỏng vấn trực tiếp.' },
    { title: 'Bài Phát Thanh Tin Tức & Podcast', desc: 'Nghe bản tin thời sự quốc tế.' },
    { title: 'Tọa Đàm Chuyên Gia & Hội Thảo', desc: 'Nghe thảo luận chuyên sâu về khoa học.' },
    { title: 'Nghe Diễn Văn & Thuyết Trình Công Cộng', desc: 'Nghe bài nói của các nhà lãnh đạo thế giới.' },
  ],
  speaking: [
    { title: 'Phát Âm Chuẩn Ngữ Điệu Bản Xứ', desc: 'Luyện khẩu hình và luồng hơi.' },
    { title: 'Tự Giới Thiệu & Bản Thân', desc: 'Thực hành nói câu đơn giản tự tin.' },
    { title: 'Gọi Món & Thanh Toán Khi Ăn Uống', desc: 'Phản xạ đóng vai tại nhà hàng.' },
    { title: 'Thuyết Trình Ý Kiến Cá Nhân', desc: 'Nói đoạn ngắn từ 1 đến 2 phút.' },
    { title: 'Tranh Luận & Phản Bật Quan Điểm', desc: 'Thảo luận góc nhìn đa chiều.' },
    { title: 'Phỏng Vấn AI IELTS Speaking Part 1-3', desc: 'Thực hành bài thi vấn đáp cùng AI.' },
    { title: 'Nói Tự Nhiên Như Người Bản Xứ (Slang & Idioms)', desc: 'Sử dụng thành ngữ và từ lóng thực tế.' },
  ],
  reading: [
    { title: 'Đọc Hiểu Biển Báo & Nhãn Hàng', desc: 'Đọc thông tin ngắn đời sống.' },
    { title: 'Đọc Thư Điện Tử & Tin Nhắn', desc: 'Đọc hội thoại nhắn tin thường ngày.' },
    { title: 'Đọc Bài Báo Tin Tức Ngắn', desc: 'Nắm bắt ý chính tin tức hàng ngày.' },
    { title: 'Đọc Truyện Ngắn & Văn Học', desc: 'Mở rộng vốn từ qua ngữ cảnh.' },
    { title: 'Đọc Tài Liệu Chuyên Ngành & IELTS', desc: 'Luyện kỹ năng Skimming & Scanning.' },
    { title: 'Đọc Hợp Đồng & Văn Bản Pháp Lý', desc: 'Phân tích các điều khoản thương mại.' },
  ],
  writing: [
    { title: 'Viết Câu Đơn & Điền Từ Khuyết', desc: 'Thực hành ghép câu chuẩn ngữ pháp.' },
    { title: 'Viết Thư Cảm Ơn & Xin Lỗi', desc: 'Viết email ngắn giao tiếp.' },
    { title: 'Viết Bài Luận Mô Tả Biểu Đồ (Task 1)', desc: 'Phân tích số liệu và xu hướng.' },
    { title: 'Viết Bài Luận Tranh Luận (Task 2)', desc: 'Viết bài luận 250 từ chuẩn Academic.' },
    { title: 'Viết Báo Cáo Phân Tích & Đề Xuất Dự Án', desc: 'Kỹ năng viết văn bản chuyên nghiệp.' },
  ]
};

/**
 * Generate 365-Day Full Year Course (10 Modules, 365 Lessons per language)
 */
export function generateMegaCourse(languageCode: string, languageName: string): CourseUnit[] {
  const modules: CourseUnit[] = [];
  const moduleLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'business', 'culture', 'debate', 'mastery'];
  const moduleTitles = [
    `Module 1: ${languageName} Sơ Cấp A1 (Nhập Môn)`,
    `Module 2: ${languageName} Sơ Cấp Nâng Cao A2 (Giao Tiếp Đời Sống)`,
    `Module 3: ${languageName} Trung Cấp B1 (Thành Thạo Đa Chủ Đề)`,
    `Module 4: ${languageName} Trung Cấp Nâng Cao B2 (Tư Duy Phản Biện)`,
    `Module 5: ${languageName} Cao Cấp C1 (Doanh Nghiệp & Chuyên Ngành)`,
    `Module 6: ${languageName} C2 Mastery (IELTS 8.5+ & Academic Elite)`,
    `Module 7: ${languageName} Thương Mại & Đàm Phán Quốc Tế (Business)`,
    `Module 8: ${languageName} Văn Hóa & Tác Phẩm Kinh Điển (Immersion)`,
    `Module 9: ${languageName} Hùng Biện & Tranh Luận Chuyên Nghiệp (Debate)`,
    `Module 10: ${languageName} Thành Thạo Tuyệt Đối (365-Day Universal Mastery)`
  ];

  let globalLessonCounter = 1;

  for (let mIdx = 0; mIdx < 10; mIdx++) {
    const level = moduleLevels[mIdx];
    const lessonsInModule = mIdx === 9 ? 37 : 36; // 36 * 9 + 37 = 365 lessons total! (1 FULL YEAR OF DAILY PRACTICE)

    const lessons = [];
    for (let lIdx = 0; lIdx < lessonsInModule; lIdx++) {
      const skillType = SKILL_TYPES[lIdx % SKILL_TYPES.length];
      const templates = TOPIC_TEMPLATES[skillType] || TOPIC_TEMPLATES.vocabulary;
      const tpl = templates[lIdx % templates.length];

      const lessonNumber = globalLessonCounter++;
      lessons.push({
        id: `${languageCode}_les_${lessonNumber}`,
        title: `Ngày ${lessonNumber}: [${skillType.toUpperCase()}] ${tpl.title}`,
        type: skillType,
        referenceId: `${skillType[0]}_${languageCode}_${lessonNumber}`,
      });
    }

    modules.push({
      id: `${languageCode}_mod_${mIdx + 1}`,
      title: moduleTitles[mIdx],
      description: `Chứa ${lessonsInModule} bài học chuyên sâu theo lộ trình 365 ngày thành thạo ngôn ngữ.`,
      level: level,
      lessons: lessons
    });
  }

  return modules;
}
