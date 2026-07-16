const fs = require('fs');

const lessonEn = `
  "lesson": {
    "generating": "Generating lesson...",
    "missing_data": "This lesson is missing data.",
    "missing_options": "This lesson is missing answer options.",
    "choose_another": "Please choose another lesson.",
    "progress": {
      "step": "Step {{current}} of {{total}}"
    },
    "types": {
      "multiplechoice": "MULTIPLE CHOICE",
      "typewhatyouhear": "DICTATION",
      "matchpairs": "MATCH PAIRS",
      "translate": "TRANSLATION",
      "listenchoose": "LISTEN & CHOOSE"
    },
    "instructions": {
      "chooseCorrectMeaning": "Choose the correct meaning",
      "listenAndType": "Listen carefully and type the word"
    },
    "questions": {
      "whatIsMeaning": "What is the meaning of \\"{{word}}\\"?",
      "typeWhatYouHear": "Type what you hear"
    },
    "explanations": {
      "correctMeaning": "The correct meaning is {{meaning}}",
      "example": "Example: {{example}}",
      "correctWordWas": "The correct word was \\"{{word}}\\""
    },
    "buttons": {
      "check": "Check",
      "continue": "Continue",
      "tryAgain": "Try Again",
      "skip": "Skip"
    },
    "feedback": {
      "correct": "Correct!",
      "incorrect": "Incorrect"
    },
    "placeholders": {
      "typeAnswer": "Type your answer..."
    },
    "completion": {
      "title": "Lesson Complete!",
      "accuracy": "Accuracy",
      "xpEarned": "XP Earned",
      "coins": "Coins",
      "perfect": "PERFECT! You're on fire today! 🔥",
      "great": "Great job! You're getting stronger! 💪",
      "good": "Not bad! A little more practice and you'll nail it. 🐸",
      "poor": "Oops! Looks like we need to review this one. Don't give up! 🌱"
    },
    "generic_distractors": {
      "1": "To run quickly",
      "2": "A type of food",
      "3": "A place to sleep",
      "4": "To read a book",
      "5": "Something beautiful",
      "6": "A large animal"
    }
  },`;

const lessonVi = `
  "lesson": {
    "generating": "Đang tạo bài học...",
    "missing_data": "Bài học này đang thiếu dữ liệu.",
    "missing_options": "Bài học này đang thiếu lựa chọn trả lời.",
    "choose_another": "Hãy chọn bài khác.",
    "progress": {
      "step": "Bước {{current}} / {{total}}"
    },
    "types": {
      "multiplechoice": "TRẮC NGHIỆM",
      "typewhatyouhear": "NGHE CHÉP CHÍNH TẢ",
      "matchpairs": "GHÉP CẶP",
      "translate": "DỊCH THUẬT",
      "listenchoose": "NGHE & CHỌN"
    },
    "instructions": {
      "chooseCorrectMeaning": "Chọn nghĩa đúng",
      "listenAndType": "Nghe kỹ và gõ lại từ"
    },
    "questions": {
      "whatIsMeaning": "Nghĩa của từ \\"{{word}}\\" là gì?",
      "typeWhatYouHear": "Gõ lại những gì bạn nghe"
    },
    "explanations": {
      "correctMeaning": "Nghĩa đúng là {{meaning}}",
      "example": "Ví dụ: {{example}}",
      "correctWordWas": "Từ đúng là \\"{{word}}\\""
    },
    "buttons": {
      "check": "Kiểm tra",
      "continue": "Tiếp tục",
      "tryAgain": "Thử lại",
      "skip": "Bỏ qua"
    },
    "feedback": {
      "correct": "Chính xác!",
      "incorrect": "Không đúng"
    },
    "placeholders": {
      "typeAnswer": "Nhập câu trả lời của bạn..."
    },
    "completion": {
      "title": "Hoàn thành bài học!",
      "accuracy": "Độ chính xác",
      "xpEarned": "Điểm KN",
      "coins": "Xu",
      "perfect": "HOÀN HẢO! Tuyệt vời quá! 🔥",
      "great": "Làm tốt lắm! Bạn đang mạnh lên! 💪",
      "good": "Khá tốt! Luyện thêm chút nữa là chuẩn. 🐸",
      "poor": "Chà! Cần ôn tập lại phần này rồi. Đừng bỏ cuộc! 🌱"
    },
    "generic_distractors": {
      "1": "Chạy thật nhanh",
      "2": "Một loại thức ăn",
      "3": "Nơi để ngủ",
      "4": "Đọc một cuốn sách",
      "5": "Thứ gì đó đẹp đẽ",
      "6": "Một loài động vật lớn"
    }
  },`;

function inject(file, payload) {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('"lesson": {')) {
    c = c.replace(/export default \{/, "export default {" + payload);
    fs.writeFileSync(file, c);
    console.log(`Updated ${file}`);
  }
}

inject('src/i18n/locales/en.ts', lessonEn);
inject('src/i18n/locales/vi.ts', lessonVi);
