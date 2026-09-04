import { ReadingPassage } from './readingLibrary';

export const readingLibraryVi: ReadingPassage[] = [
  // ═══ A1 ═══
  {
    id: 'vi_r1', title: 'Một ngày của tôi', level: 'A1', topic: 'Daily Life', sourceType: 'original',
    content: 'Tôi tên là Hoa. Tôi hai mươi tuổi. Tôi là sinh viên ở Thành phố Hồ Chí Minh. Mỗi sáng tôi thức dậy lúc sáu giờ. Tôi đánh răng và tắm rửa. Sau đó tôi ăn sáng. Tôi thường ăn phở hoặc bánh mì. Tôi uống một ly cà phê sữa đá. Sau bữa sáng tôi đi xe buýt đến trường đại học. Lớp học bắt đầu lúc bảy giờ rưỡi. Tôi học ngành kinh tế. Buổi chiều tôi đi thư viện để học bài. Tôi về nhà lúc năm giờ. Buổi tối tôi nấu cơm với chị gái. Chúng tôi ăn cơm cùng gia đình và nói chuyện vui vẻ. Tôi đi ngủ lúc mười một giờ.',
    wordCount: 108,
    vocabularyHighlights: ['thức dậy', 'ăn sáng', 'đại học', 'thư viện', 'gia đình'],
    questions: [
      { id: 'vi_r1q1', type: 'multiple_choice', question: 'Hoa thức dậy lúc mấy giờ?', options: ['Năm giờ', 'Sáu giờ', 'Bảy giờ', 'Tám giờ'], correctAnswer: 'Sáu giờ', explanation: 'Bài đọc nói: "tôi thức dậy lúc sáu giờ".' },
      { id: 'vi_r1q2', type: 'true_false', question: 'Hoa đi xe máy đến trường.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Bài đọc nói: "tôi đi xe buýt đến trường đại học".' },
      { id: 'vi_r1q3', type: 'multiple_choice', question: 'Hoa thường ăn gì vào buổi sáng?', options: ['Cơm và canh', 'Phở hoặc bánh mì', 'Xôi và chè', 'Bánh cuốn'], correctAnswer: 'Phở hoặc bánh mì', explanation: 'Bài đọc nói: "Tôi thường ăn phở hoặc bánh mì".' },
    ],
    tags: ['daily life', 'basics']
  },
  {
    id: 'vi_r2', title: 'Đi chợ', level: 'A1', topic: 'Shopping', sourceType: 'original',
    content: 'Hôm nay là thứ bảy. Tôi đi chợ với mẹ. Chợ gần nhà tôi. Ở chợ có rất nhiều người. Đầu tiên chúng tôi mua trái cây. Chúng tôi mua xoài, cam và dưa hấu. Sau đó chúng tôi đi mua thịt. Mẹ mua thịt heo và gà. Rồi chúng tôi mua rau. Mẹ mua rau muống, cà chua và hành. Tôi muốn mua bánh kẹo nhưng mẹ nói không cần. Mẹ còn mua cá tươi để nấu canh. Cá ở chợ tươi hơn ở siêu thị. Chúng tôi trả tiền và về nhà. Tôi giúp mẹ bỏ đồ vào tủ lạnh. Mẹ nấu bữa trưa rất ngon.',
    wordCount: 105,
    vocabularyHighlights: ['chợ', 'trái cây', 'rau', 'tủ lạnh', 'trả tiền'],
    questions: [
      { id: 'vi_r2q1', type: 'multiple_choice', question: 'Hôm nay là thứ mấy?', options: ['Thứ sáu', 'Thứ bảy', 'Chủ nhật', 'Thứ hai'], correctAnswer: 'Thứ bảy', explanation: 'Bài đọc bắt đầu bằng: "Hôm nay là thứ bảy".' },
      { id: 'vi_r2q2', type: 'true_false', question: 'Tôi mua được bánh kẹo ở chợ.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Bài đọc nói: "Tôi muốn mua bánh kẹo nhưng mẹ nói không cần".' },
      { id: 'vi_r2q3', type: 'multiple_choice', question: 'Tại sao mẹ mua cá ở chợ?', options: ['Vì rẻ hơn', 'Vì tươi hơn ở siêu thị', 'Vì gần nhà', 'Vì cá to hơn'], correctAnswer: 'Vì tươi hơn ở siêu thị', explanation: 'Bài đọc nói: "Cá ở chợ tươi hơn ở siêu thị".' },
    ],
    tags: ['shopping', 'food', 'basics']
  },

  // ═══ A2 ═══
  {
    id: 'vi_r3', title: 'Du lịch Hà Nội', level: 'A2', topic: 'Travel', sourceType: 'original',
    content: 'Tuần trước tôi và bạn bè đi du lịch Hà Nội. Hà Nội là thủ đô của Việt Nam. Chúng tôi bay từ Thành phố Hồ Chí Minh ra Hà Nội. Chuyến bay mất khoảng hai tiếng. Chúng tôi ở khách sạn nhỏ gần Hồ Hoàn Kiếm.\n\nNgày đầu tiên chúng tôi đi thăm Hồ Hoàn Kiếm và đền Ngọc Sơn. Hồ rất đẹp, có cầu Thê Húc màu đỏ. Buổi tối chúng tôi đi bộ trong phố cổ. Phố cổ có nhiều cửa hàng nhỏ bán đồ thủ công mỹ nghệ. Chúng tôi ăn bún chả và phở bò ở một quán nhỏ. Ngon lắm!\n\nNgày thứ hai chúng tôi đi Lăng Bác Hồ và Chùa Một Cột. Chùa Một Cột rất đặc biệt vì được xây trên một cây cột. Buổi chiều chúng tôi uống cà phê trứng ở một quán cà phê cổ. Cà phê trứng là đặc sản của Hà Nội. Tôi rất thích Hà Nội vì thành phố này có nhiều lịch sử và văn hóa.',
    wordCount: 145,
    vocabularyHighlights: ['thủ đô', 'phố cổ', 'thủ công mỹ nghệ', 'đặc sản', 'lịch sử'],
    questions: [
      { id: 'vi_r3q1', type: 'multiple_choice', question: 'Chuyến bay từ TP.HCM ra Hà Nội mất bao lâu?', options: ['Một tiếng', 'Hai tiếng', 'Ba tiếng', 'Bốn tiếng'], correctAnswer: 'Hai tiếng', explanation: 'Bài đọc nói: "Chuyến bay mất khoảng hai tiếng".' },
      { id: 'vi_r3q2', type: 'true_false', question: 'Chùa Một Cột được xây trên mặt nước.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Bài đọc nói: "Chùa Một Cột rất đặc biệt vì được xây trên một cây cột".' },
      { id: 'vi_r3q3', type: 'multiple_choice', question: 'Đặc sản của Hà Nội được nhắc đến là gì?', options: ['Phở bò', 'Bún chả', 'Cà phê trứng', 'Bánh mì'], correctAnswer: 'Cà phê trứng', explanation: 'Bài đọc nói: "Cà phê trứng là đặc sản của Hà Nội".' },
    ],
    tags: ['travel', 'vietnam', 'culture']
  },

  // ═══ B1 ═══
  {
    id: 'vi_r4', title: 'Ẩm thực Việt Nam', level: 'B1', topic: 'Food & Culture', sourceType: 'original',
    content: 'Ẩm thực Việt Nam được biết đến trên toàn thế giới nhờ sự cân bằng giữa các hương vị và việc sử dụng nhiều rau thơm tươi. Khác với nhiều nền ẩm thực châu Á khác, món ăn Việt Nam thường nhẹ nhàng, ít dầu mỡ và rất tốt cho sức khỏe.\n\nMỗi vùng miền có những món ăn đặc trưng riêng. Miền Bắc nổi tiếng với phở Hà Nội, bún chả và chả cá Lã Vọng. Phở là món ăn quốc hồn quốc túy của Việt Nam, được nấu từ nước dùng xương hầm trong nhiều giờ. Miền Trung có bún bò Huế, mì Quảng và bánh xèo. Đặc điểm của ẩm thực miền Trung là vị cay và mặn hơn so với các vùng khác. Miền Nam thì thích vị ngọt, với các món như hủ tiếu, bánh tráng trộn và nhiều loại chè.\n\nNước mắm là gia vị không thể thiếu trong bữa ăn Việt Nam. Nước mắm được làm từ cá và muối, ủ trong nhiều tháng. Mỗi gia đình đều có cách pha nước mắm chấm riêng. Bữa cơm gia đình truyền thống thường có cơm trắng, một món canh, một món mặn và rau sống. Người Việt Nam coi bữa cơm gia đình là thời gian quan trọng để gắn kết tình cảm.',
    wordCount: 168,
    vocabularyHighlights: ['hương vị', 'rau thơm', 'nước mắm', 'đặc trưng', 'truyền thống'],
    questions: [
      { id: 'vi_r4q1', type: 'multiple_choice', question: 'Đặc điểm chính của ẩm thực Việt Nam là gì?', options: ['Nhiều dầu mỡ', 'Nhẹ nhàng và ít dầu mỡ', 'Rất cay', 'Nhiều đường'], correctAnswer: 'Nhẹ nhàng và ít dầu mỡ', explanation: 'Bài đọc nói: "món ăn Việt Nam thường nhẹ nhàng, ít dầu mỡ".' },
      { id: 'vi_r4q2', type: 'true_false', question: 'Ẩm thực miền Trung có vị ngọt hơn các vùng khác.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Bài đọc nói: "Đặc điểm của ẩm thực miền Trung là vị cay và mặn hơn". Miền Nam mới thích vị ngọt.' },
      { id: 'vi_r4q3', type: 'multiple_choice', question: 'Nước mắm được làm từ gì?', options: ['Đậu nành và muối', 'Cá và muối', 'Tôm và đường', 'Gạo và muối'], correctAnswer: 'Cá và muối', explanation: 'Bài đọc nói: "Nước mắm được làm từ cá và muối".' },
    ],
    tags: ['food', 'culture', 'vietnam']
  },
];
