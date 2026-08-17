export type RealworldSurvivalUnit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export type RetrievalPattern = {
  requiredFragments: string[];
  rejectedNames?: string[];
};

export type RealworldSurvivalLesson = {
  id: string;
  language: string;
  unit: RealworldSurvivalUnit;
  order: number;
  titleVi: string;
  titleEn: string;
  canDoVi: string;
  scenario: { settingVi: string; roles: [string, string]; emotion?: string; intensity?: 'low' | 'medium' | 'high' };
  dialogue: { 
    speaker: 'A' | 'B'; 
    text: string; 
    vi: string;
    phonetics?: { ipa: string; connectedSpeech?: string };
  }[];
  chunks: { 
    text: string; 
    vi: string; 
    useWhenVi: string; 
    vietnameseLearnerCueVi: string;
    pragmatics?: { formality: 'casual' | 'neutral' | 'formal'; politeness: number; context: string };
  }[];
  contextCue: { titleVi: string; bodyVi: string };
  comprehension: { promptVi: string; options: string[]; correctAnswer: string; explanationVi: string };
  production: { promptVi: string; requiredSlots: string[]; exemplar: string; rejectExactModelCopy: true };
  retrieval: { promptVi: string; cueVi: string; acceptedPatterns: RetrievalPattern[]; answerHintVi: string };
  semanticDiscrimination: {
    scenarioVi: string;
    correctPragmaticAction: string;
    plausibleDistractors: { text: string; errorType: string; explanationVi: string; socraticHintVi?: string }[];
  };
  generativeSimulation: {
    promptVi: string;
    pragmaticGoal: string;
    semanticSlots: string[];
    cognitiveBlindspots: { errorPattern: string; remediationPrompt: string }[];
  };
  selfReview: string[];
};

export const realworldSurvivalLessons: Record<string, RealworldSurvivalLesson[]> = {
  en: [
    {
      id: 'en-survival-1', language: 'en', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào và giới thiệu", titleEn: "Say hello and introduce yourself", canDoVi: "Tôi có thể nói tên của mình khi gặp người mới.",
      scenario: { settingVi: "Bạn gặp một người mới ở lớp.", roles: ["Người học", "Bạn cùng lớp"], emotion: "Hồi hộp nhẹ", intensity: "low" },
      dialogue: [
        { speaker: 'A', text: "Hello, I'm Lan.", vi: "Chào, tôi là Lan.", phonetics: { ipa: "/həˈloʊ, aɪm læn/", connectedSpeech: "I'm -> /aɪm/" } },
        { speaker: 'B', text: "Nice to meet you, Lan.", vi: "Rất vui được gặp bạn, Lan.", phonetics: { ipa: "/naɪs tə mit ju, læn/", connectedSpeech: "meet you -> /mitʃu/" } },
      ],
      chunks: [
        { text: "Hello", vi: "Xin chào", useWhenVi: "chào thân mật", vietnameseLearnerCueVi: "Trọng âm rơi vào âm tiết 2 /loʊ/", pragmatics: { formality: 'neutral', politeness: 3, context: "Phổ biến, dùng được cho hầu hết mọi người" } },
        { text: "I'm...", vi: "Tôi là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Ai'm", pragmatics: { formality: 'casual', politeness: 2, context: "Giới thiệu bản thân ngắn gọn" } },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Luôn bắt đầu bằng Hello hoặc Hi." },
      comprehension: { promptVi: "Cách giới thiệu tên?", options: ["I'm", "I have"], correctAnswer: "I'm", explanationVi: "I'm = Tôi là." },
      production: { promptVi: "Giới thiệu bản thân.", requiredSlots: ["Hello"], exemplar: "Hello, I'm Lan.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại cụm giới thiệu.", cueVi: "I'm...", acceptedPatterns: [{ requiredFragments: ["i'm"] }], answerHintVi: "I'm" },
      semanticDiscrimination: {
        scenarioVi: "Cách giới thiệu tên?",
        correctPragmaticAction: "I'm",
        plausibleDistractors: [
          { text: "I have", errorType: "L1 Transfer", explanationVi: "'I have' nghĩa là 'Tôi có' (chỉ sự sở hữu), không thể dùng để giới thiệu bản thân. Để nói tên hoặc danh tính, bắt buộc dùng cấu trúc 'I am' / 'I\'m' (Tôi là).", socraticHintVi: "Bạn đang nói về BẢN CHẤT của bạn (là ai) hay là SỞ HỮU (có cái gì)? Hãy dùng động từ To-be." }
        ]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu bản thân.",
        pragmaticGoal: "Chào và tự giới thiệu tên tự nhiên",
        semanticSlots: ["Hello"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Literal Translation (Dịch sát nghĩa từng từ)", remediationPrompt: "BỎ NGAY tư duy dịch word-by-word. Khi người bản xứ hỏi 'How\'s it going?', họ đang mở lời, không phải bắt mạch khám bệnh. Trả lời cụt ngủn 'Fine' tạo ra sự gượng gạo (awkward silence) chết chóc trong giao tiếp." }
        ]
      },
      selfReview: ["Phát âm 'Hello' rõ ràng", "Ngữ điệu thân thiện, không phẳng", "Dùng 'I\'m' tự nhiên"],
    },
    {
      id: 'en-survival-2', language: 'en', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường đến ga tàu.",
      scenario: { settingVi: "Bạn đang lạc đường ở New York.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Excuse me, where is the station?", vi: "Xin lỗi, nhà ga ở đâu vậy?", phonetics: { ipa: "/ɪkˈskjuz mi, wɛr ɪz ðə ˈsteɪʃən/", connectedSpeech: "Excuse me -> /ɪkˈskjuzmi/" } },
        { speaker: 'B', text: "It's over there.", vi: "Nó ở đằng kia.", phonetics: { ipa: "/ɪts ˈoʊvər ðɛr/", connectedSpeech: "It's -> /ɪts/" } },
      ],
      chunks: [
        { text: "Excuse me...", vi: "Xin lỗi...", useWhenVi: "bắt chuyện", vietnameseLearnerCueVi: "Bật nhẹ /k/, giữ âm /s/ và kéo dài /juːz/" },
        { text: "Where is...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Mở tròn môi /w/, nối âm /r/ sang /ɪz/" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Tự tin bắt chuyện người lạ." },
      comprehension: { promptVi: "Bắt chuyện hỏi đường bằng?", options: ["Excuse me", "I am sorry"], correctAnswer: "Excuse me", explanationVi: "Excuse me dùng để thu hút sự chú ý." },
      production: { promptVi: "Hỏi đường đến khách sạn.", requiredSlots: ["hotel"], exemplar: "Excuse me, where is the hotel?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại từ hỏi ở đâu.", cueVi: "Where...", acceptedPatterns: [{ requiredFragments: ["where", "is"] }], answerHintVi: "Where is" },
      semanticDiscrimination: {
        scenarioVi: "Bắt chuyện hỏi đường bằng?",
        correctPragmaticAction: "Excuse me",
        plausibleDistractors: [
          { text: "I am sorry", errorType: "Pragmatic Confusion", explanationVi: "THẢM HỌA NGỮ CẢNH: 'I want' là cách trẻ con đòi kẹo. Dùng nó trong nhà hàng hay môi trường chuyên nghiệp, bạn sẽ bị coi là thô lỗ và thiếu giáo dục (Uneducated register).", socraticHintVi: "Gợi ý tư duy: Bạn có làm đổ ly nước vào người ta không? Nếu không mắc lỗi, đừng dùng 'Sorry'. Hãy dùng cụm từ thu hút sự chú ý." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến khách sạn.",
        pragmaticGoal: "Bắt chuyện lịch sự để hỏi đường",
        semanticSlots: ["hotel"],
        cognitiveBlindspots: [
          { errorPattern: "Register Failure (Sai lệch tầng giao tiếp)", remediationPrompt: "Tiếng Việt có thể nói 'Tôi muốn cà phê'. Tiếng Anh thì không! Dùng 'I\'d like' là quy tắc sinh tồn tối thiểu. Không có 'please' ở cuối, giá trị câu nói của bạn là con số 0." }
        ]
      },
      selfReview: ["Bắt đầu bằng 'Excuse me'", "Phát âm 'where' rõ ràng", "Ngữ điệu hỏi đi lên cuối"],
    },
    {
      id: 'en-survival-3', language: 'en', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá tiền.",
      scenario: { settingVi: "Mua đồ ở siêu thị.", roles: ["Khách hàng", "Thu ngân"] },
      dialogue: [
        { speaker: 'A', text: "How much is this?", vi: "Cái này bao nhiêu tiền?" },
        { speaker: 'B', text: "It's 10 dollars.", vi: "10 đô la." },
      ],
      chunks: [
        { text: "How much...", vi: "Bao nhiêu...", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Hao mấch" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá tiền." },
      comprehension: { promptVi: "Từ hỏi giá tiền?", options: ["How much", "How many"], correctAnswer: "How much", explanationVi: "How much dùng cho giá tiền." },
      production: { promptVi: "Hỏi giá chiếc áo.", requiredSlots: ["How much"], exemplar: "How much is the shirt?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại cụm từ hỏi giá.", cueVi: "How...", acceptedPatterns: [{ requiredFragments: ["how", "much"] }], answerHintVi: "How much" },
      semanticDiscrimination: {
        scenarioVi: "Từ hỏi giá tiền?",
        correctPragmaticAction: "How much",
        plausibleDistractors: [
          { text: "How many", errorType: "Countable/Uncountable", explanationVi: "LỖI TƯ DUY NGÔN NGỮ: 'How many' đếm từng đồng xu vật lý. 'How much' đại diện cho khái niệm giá trị tổng thể. Dùng sai, bạn trông như một người không hiểu khái niệm trừu tượng." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá chiếc áo.",
        pragmaticGoal: "Hỏi giá sản phẩm tại cửa hàng",
        semanticSlots: ["How much"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer (Sự nguỵ biện 'Bao Nhiêu' của Tiếng Việt)", remediationPrompt: "BỘ NÃO BẠN ĐANG BỊ LỪA! Tiếng Việt gom chung 'bao nhiêu' cho mọi thứ. Tiếng Anh tách biệt tuyệt đối khối lượng (Much) và số lượng (Many). Dùng 'How many money', đối tác sẽ cười thầm vào năng lực của bạn." }
        ]
      },
      selfReview: ["Dùng 'How much' cho giá", "Chỉ rõ sản phẩm", "Ngữ điệu hỏi tự nhiên"],
    },
    {
      id: 'en-survival-4', language: 'en', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món ăn.",
      scenario: { settingVi: "Gọi món ở nhà hàng.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "I'd like a pizza, please.", vi: "Cho tôi một pizza." },
        { speaker: 'B', text: "Sure.", vi: "Được ạ." },
      ],
      chunks: [
        { text: "I'd like...", vi: "Tôi muốn...", useWhenVi: "gọi món lịch sự", vietnameseLearnerCueVi: "Ai'd lai" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Dịch vụ nhà hàng." },
      comprehension: { promptVi: "Cách gọi món lịch sự?", options: ["I'd like", "I want"], correctAnswer: "I'd like", explanationVi: "I'd like lịch sự hơn I want." },
      production: { promptVi: "Gọi cà phê.", requiredSlots: ["coffee"], exemplar: "I'd like a coffee, please.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại cụm tôi muốn.", cueVi: "I'd...", acceptedPatterns: [{ requiredFragments: ["i'd", "like"] }], answerHintVi: "I'd like" },
      semanticDiscrimination: {
        scenarioVi: "Cách gọi món lịch sự?",
        correctPragmaticAction: "I'd like",
        plausibleDistractors: [
          { text: "I want", errorType: "Register Error", explanationVi: "LỖI LỊCH SỰ CƠ BẢN: 'I want' (Tôi muốn) biến bạn thành kẻ ra lệnh hống hách. 'I would like' (Tôi mong muốn) là chuẩn mực giao tiếp văn minh." }
        ]
      },
      generativeSimulation: {
        promptVi: "Gọi cà phê.",
        pragmaticGoal: "Gọi món lịch sự trong nhà hàng",
        semanticSlots: ["coffee"],
        cognitiveBlindspots: [
          { errorPattern: "Pragmatic Blindness (Mù lòa Ngữ dụng)", remediationPrompt: "GIAO TIẾP LÀ CẤP BẬC! Bạn đang là khách, nhưng không phải là vua. Không bao giờ được dùng 'I want' với nhân viên dịch vụ trừ khi bạn muốn họ phỉ nhổ vào đồ ăn của bạn." }
        ]
      },
      selfReview: ["Dùng 'I\'d like' thay 'I want'", "Thêm 'please' cuối câu", "Phát âm rõ ràng"],
    },
    {
      id: 'en-survival-5', language: 'en', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể nói xin lỗi.",
      scenario: { settingVi: "Bạn lỡ làm đổ nước.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "I'm so sorry.", vi: "Tôi rất xin lỗi." },
        { speaker: 'B', text: "That's okay.", vi: "Không sao." },
      ],
      chunks: [
        { text: "I'm so sorry.", vi: "Tôi rất xin lỗi.", useWhenVi: "xin lỗi chân thành", vietnameseLearnerCueVi: "so sorry" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Trấn an người khác." },
      comprehension: { promptVi: "Cách đáp lại lời xin lỗi?", options: ["That's okay", "You are welcome"], correctAnswer: "That's okay", explanationVi: "That's okay = không sao." },
      production: { promptVi: "Xin lỗi vì đến muộn.", requiredSlots: ["sorry"], exemplar: "I am sorry I am late.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại từ xin lỗi.", cueVi: "I'm...", acceptedPatterns: [{ requiredFragments: ["sorry"] }], answerHintVi: "sorry" },
      semanticDiscrimination: {
        scenarioVi: "Cách đáp lại lời xin lỗi?",
        correctPragmaticAction: "That's okay",
        plausibleDistractors: [
          { text: "You are welcome", errorType: "Pragmatic Confusion", explanationVi: "NHẦM LẪN CHẾT NGƯỜI: 'You are welcome' là 'Không có chi' (đáp lại lời Cảm ơn). Dùng nó để đáp lại lời Xin lỗi chứng tỏ bạn chỉ học vẹt mà không hiểu não bộ đang xử lý tín hiệu gì." }
        ]
      },
      generativeSimulation: {
        promptVi: "Xin lỗi vì đến muộn.",
        pragmaticGoal: "Xin lỗi và đáp lại lời xin lỗi",
        semanticSlots: ["sorry"],
        cognitiveBlindspots: [
          { errorPattern: "Synapse Cross-wiring (Chập mạch phản xạ)", remediationPrompt: "HẬU QUẢ CỦA VIỆC HỌC VẸT! Phản xạ não bộ của bạn đang bị lỗi. Khi nghe 'Sorry', phải bật ra 'That\'s okay' hoặc 'No worries'. Dùng 'You\'re welcome' trong tình huống này là sự lố bịch tột cùng." }
        ]
      },
      selfReview: ["Phân biệt 'sorry' vs 'excuse me'", "Giọng chân thành", "Đáp lại bằng 'That\'s okay'"],
    },
    {
      id: 'en-survival-6', language: 'en', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ người khác giúp.",
      scenario: { settingVi: "Nhờ xách hộ hành lý.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Can you help me, please?", vi: "Bạn giúp tôi được không?" },
        { speaker: 'B', text: "Of course.", vi: "Đương nhiên." },
      ],
      chunks: [
        { text: "Can you...", vi: "Bạn có thể...", useWhenVi: "nhờ vả", vietnameseLearnerCueVi: "Can you" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Yêu cầu sự giúp đỡ." },
      comprehension: { promptVi: "Bắt đầu câu hỏi nhờ vả?", options: ["Can you", "Do you"], correctAnswer: "Can you", explanationVi: "Can you là yêu cầu khả năng." },
      production: { promptVi: "Nhờ mở cửa.", requiredSlots: ["open", "door"], exemplar: "Can you open the door, please?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ cụm bạn có thể giúp tôi.", cueVi: "Can...", acceptedPatterns: [{ requiredFragments: ["can", "you", "help"] }], answerHintVi: "Can you help me" },
      semanticDiscrimination: {
        scenarioVi: "Bắt đầu câu hỏi nhờ vả?",
        correctPragmaticAction: "Can you",
        plausibleDistractors: [
          { text: "Help me now", errorType: "Imperative Rudeness", explanationVi: "Ra lệnh 'Help me now' thô lỗ. Dùng 'Can you help me, please?'" }
        ]
      },
      generativeSimulation: {
        promptVi: "Nhờ mở cửa.",
        pragmaticGoal: "Nhờ người lạ giúp đỡ lịch sự",
        semanticSlots: ["open", "door"],
        cognitiveBlindspots: [
          { errorPattern: "Imperative vs question", remediationPrompt: "Tiếng Anh: mệnh lệnh thô, phải dùng 'Can/Could you...?'" }
        ]
      },
      selfReview: ["Dùng 'Can you...' thay ra lệnh", "Thêm 'please'", "Ngữ điệu nhẹ nhàng"],
    },
    {
      id: 'en-survival-7', language: 'en', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Help me, please!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "I need a doctor.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Help me, please!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Help me, please!", "I need a doctor."], correctAnswer: "Help me, please!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Help me, please!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Help me, please!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Help me, please!",
        plausibleDistractors: [
          { text: "What time it is?", errorType: "Word Order Error", explanationVi: "Đảo ngữ sai. Đúng: 'What time is it?' — 'is' trước 'it'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hỏi giờ và hiểu câu trả lời",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Question word order", remediationPrompt: "Tiếng Việt không đảo ngữ. Tiếng Anh BẮT BUỘC đảo trong câu hỏi." }
        ]
      },
      selfReview: ["Đảo ngữ đúng", "Hiểu cách đọc giờ", "Dùng 'Excuse me' trước"],
    },
    {
      id: 'en-survival-8', language: 'en', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "To the airport, please.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "How much to the station?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "To the airport, please.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["To the airport, please.", "How much to the station?"], correctAnswer: "To the airport, please.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "To the airport, please.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "To the airport, please." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "To the airport, please.",
        plausibleDistractors: [
          { text: "Today weather is good", errorType: "Missing Article", explanationVi: "Thiếu 'The'. Nói 'The weather is nice today'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Nói về thời tiết để phá băng",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Omitting articles", remediationPrompt: "Tiếng Việt không có mạo từ. Tiếng Anh: danh từ cần 'the/a/an'." }
        ]
      },
      selfReview: ["Dùng 'the' trước 'weather'", "Tính từ mô tả phù hợp", "Cấu trúc S-V-C đúng"],
    },
    {
      id: 'en-survival-9', language: 'en', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "I have a reservation.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "My room key, please.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "I have a reservation.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["I have a reservation.", "My room key, please."], correctAnswer: "I have a reservation.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "I have a reservation.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "I have a reservation." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "I have a reservation.",
        plausibleDistractors: [
          { text: "I very tired", errorType: "Missing Verb", explanationVi: "Thiếu 'am'. Đúng: 'I AM very tired'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Diễn tả cảm xúc hiện tại",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Omitting to-be", remediationPrompt: "Tiếng Việt bỏ 'là'. Tiếng Anh BẮT BUỘC có 'am/is/are'." }
        ]
      },
      selfReview: ["Không quên 'am/is/are'", "Tính từ đúng cho cảm xúc", "Ngữ điệu phù hợp cảm xúc"],
    },
    {
      id: 'en-survival-10', language: 'en', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "What time is it?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "It is 5 o clock.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "What time is it?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["What time is it?", "It is 5 o clock."], correctAnswer: "What time is it?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "What time is it?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "What time is it?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "What time is it?",
        plausibleDistractors: [
          { text: "I have 2 brother", errorType: "Plural Error", explanationVi: "Thiếu 's'. Đúng: '2 brothers'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Giới thiệu gia đình",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Forgetting plural -s", remediationPrompt: "Tiếng Việt không biến đổi theo số. Tiếng Anh: > 1 thì thêm -s." }
        ]
      },
      selfReview: ["Thêm -s số nhiều", "Từ quan hệ gia đình đúng", "Nói số lượng rõ ràng"],
    },
    {
      id: 'en-survival-11', language: 'en', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "I want to exchange money.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "Where is the ATM?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "I want to exchange money.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["I want to exchange money.", "Where is the ATM?"], correctAnswer: "I want to exchange money.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "I want to exchange money.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "I want to exchange money." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "I want to exchange money.",
        plausibleDistractors: [
          { text: "I like play football", errorType: "Missing Gerund", explanationVi: "Sau 'like' cần V-ing. 'I like PLAYING football'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Nói về sở thích cá nhân",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Omitting gerund", remediationPrompt: "Tiếng Việt: 'thích chơi' — nguyên. Tiếng Anh: 'like' + V-ing." }
        ]
      },
      selfReview: ["Dùng V-ing sau 'like'", "Hỏi lại 'What about you?'", "Phát âm tên sở thích đúng"],
    },
    {
      id: 'en-survival-12', language: 'en', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "I have a headache.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "I need medicine.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "I have a headache.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["I have a headache.", "I need medicine."], correctAnswer: "I have a headache.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "I have a headache.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "I have a headache." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "I have a headache.",
        plausibleDistractors: [
          { text: "Who is this?", errorType: "Pragmatic Rudeness", explanationVi: "'Who is this?' nghe thẩm vấn. Dùng 'May I ask who\'s calling?'" }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Nghe và gọi điện thoại cơ bản",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Too direct on phone", remediationPrompt: "Tiếng Việt 'Ai đấy?' bình thường. Tiếng Anh: 'Who is this?' thô." }
        ]
      },
      selfReview: ["Mở đầu bằng 'Hello'", "Hỏi lịch sự trên điện thoại", "Biết 'Can I leave a message?'"],
    },
    {
      id: 'en-survival-13', language: 'en', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Hello, who is speaking?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "I will call back.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Hello, who is speaking?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Hello, who is speaking?", "I will call back."], correctAnswer: "Hello, who is speaking?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Hello, who is speaking?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Hello, who is speaking?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Hello, who is speaking?",
        plausibleDistractors: [
          { text: "I am teacher", errorType: "Missing Article", explanationVi: "Thiếu 'a'. Đúng: 'I am A teacher'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Nói về công việc hiện tại",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Omitting article before job", remediationPrompt: "Tiếng Việt không cần mạo từ trước nghề. Tiếng Anh BẮT BUỘC 'a/an'." }
        ]
      },
      selfReview: ["Thêm 'a/an' trước nghề", "Hỏi 'What do you do?'", "Phát âm nghề rõ ràng"],
    },
    {
      id: 'en-survival-14', language: 'en', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "This is delicious.", vi: "Ngon quá." },
        { speaker: 'B', text: "You are very kind.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "This is delicious.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["This is delicious.", "You are very kind."], correctAnswer: "This is delicious.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "This is delicious.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "This is delicious." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "This is delicious.",
        plausibleDistractors: [
          { text: "Your cook very delicious", errorType: "Word Class Error", explanationVi: "Nhầm loại từ. Đúng: 'Your COOKING is delicious'." }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Khen ngợi tự nhiên và đáp lời khen",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "Mixing word classes", remediationPrompt: "Tiếng Việt linh hoạt loại từ. Tiếng Anh: mỗi vị trí cần đúng loại." }
        ]
      },
      selfReview: ["Dùng tính từ đúng khi khen", "Đáp 'Thank you!'", "Ngữ điệu chân thành"],
    },
    {
      id: 'en-survival-15', language: 'en', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Goodbye, see you later.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Have a good day!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Goodbye, see you later.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Goodbye, see you later.", "Have a good day!"], correctAnswer: "Goodbye, see you later.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Goodbye, see you later.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Goodbye, see you later." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Goodbye, see you later.",
        plausibleDistractors: [
          { text: "I go now bye", errorType: "Abrupt Leaving", explanationVi: "Quá đột ngột. Cần: 'It was nice talking to you. Goodbye!'" }
        ]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Nói lời tạm biệt lịch sự",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "No transition phrase", remediationPrompt: "Tiếng Anh: cần câu chuyển tiếp trước 'Goodbye'." }
        ]
      },
      selfReview: ["Câu chuyển tiếp trước tạm biệt", "Nói 'See you later'", "Ngữ điệu thân thiện"],
    },
  ],
  ja: [
    {
      id: 'ja-survival-1', language: 'ja', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào và giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào và giới thiệu bản thân bằng tiếng Nhật.",
      scenario: { settingVi: "Bạn gặp người mới ở lớp tiếng Nhật.", roles: ["Người học", "Bạn cùng lớp"] },
      dialogue: [
        { speaker: 'A', text: "こんにちは、私はランです。", vi: "Xin chào, tôi là Lan." },
        { speaker: 'B', text: "はじめまして、ランさん。", vi: "Rất vui được gặp bạn, Lan." },
      ],
      chunks: [
        { text: "こんにちは", vi: "Xin chào", useWhenVi: "chào ban ngày", vietnameseLearnerCueVi: "Kon-ni-chi-wa" },
        { text: "私は...です", vi: "Tôi là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Watashi wa ... desu" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Luôn mở đầu bằng こんにちは." },
      comprehension: { promptVi: "Cách giới thiệu tên?", options: ["私は...です", "私が...です"], correctAnswer: "私は...です", explanationVi: "Watashi wa ... desu là mẫu chuẩn." },
      production: { promptVi: "Giới thiệu bản thân.", requiredSlots: ["こんにちは"], exemplar: "こんにちは、私はランです。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại mẫu giới thiệu.", cueVi: "私は...", acceptedPatterns: [{ requiredFragments: ["私", "です"] }], answerHintVi: "私は...です" },
      semanticDiscrimination: {
        scenarioVi: "Cách giới thiệu tên?",
        correctPragmaticAction: "私は...です",
        plausibleDistractors: [{ text: "私が...です", errorType: "L1 Transfer", explanationVi: "Watashi wa ... desu là mẫu chuẩn." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu bản thân.",
        pragmaticGoal: "Giới thiệu bản thân.",
        semanticSlots: ["こんにちは"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm wa", "Cúi đầu chào"],
    },
    {
      id: 'ja-survival-2', language: 'ja', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường đến ga tàu.",
      scenario: { settingVi: "Bạn đang lạc đường và muốn hỏi đường đến ga Shinjuku.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "すみません、新宿駅はどこですか？", vi: "Xin lỗi, ga Shinjuku ở đâu vậy?" },
        { speaker: 'B', text: "あそこです。まっすぐ行ってください。", vi: "Ở đằng kia. Xin hãy đi thẳng." },
      ],
      chunks: [
        { text: "すみません、...", vi: "Xin lỗi, ...", useWhenVi: "khi bắt chuyện người lạ", vietnameseLearnerCueVi: "Sumimasen" },
        { text: "...はどこですか？", vi: "... ở đâu vậy?", useWhenVi: "khi hỏi địa điểm", vietnameseLearnerCueVi: "... wa doko desu ka" },
      ],
      contextCue: { titleVi: "Lạc đường ở Tokyo", bodyVi: "Hãy mạnh dạn hỏi đường người bản xứ." },
      comprehension: { promptVi: "Để hỏi địa điểm, bạn dùng cấu trúc nào?", options: ["はどこですか？", "は何ですか？"], correctAnswer: "はどこですか？", explanationVi: "どこ nghĩa là \"ở đâu\"." },
      production: { promptVi: "Hỏi đường đến ga Shibuya.", requiredSlots: ["Shibuya"], exemplar: "すみません、渋谷駅はどこですか？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại mẫu câu hỏi \"ở đâu\".", cueVi: "... はどこですか？", acceptedPatterns: [{ requiredFragments: ["は", "どこ", "ですか"] }], answerHintVi: "はどこですか" },
      semanticDiscrimination: {
        scenarioVi: "Để hỏi địa điểm, bạn dùng cấu trúc nào?",
        correctPragmaticAction: "はどこですか？",
        plausibleDistractors: [{ text: "は何ですか？", errorType: "L1 Transfer", explanationVi: "どこ nghĩa là \"ở đâu\"." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến ga Shibuya.",
        pragmaticGoal: "Hỏi đường đến ga Shibuya.",
        semanticSlots: ["Shibuya"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Dùng đúng trợ từ wa", "Phát âm đúng doko"],
    },
    {
      id: 'ja-survival-3', language: 'ja', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá tiền khi mua sắm.",
      scenario: { settingVi: "Bạn mua một chiếc áo ở cửa hàng.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "これはいくらですか？", vi: "Cái này bao nhiêu tiền?" },
        { speaker: 'B', text: "二千円です。", vi: "2000 yên ạ." },
      ],
      chunks: [
        { text: "これは...", vi: "Cái này...", useWhenVi: "khi chỉ vào vật", vietnameseLearnerCueVi: "Kore wa" },
        { text: "いくらですか？", vi: "Bao nhiêu tiền?", useWhenVi: "khi hỏi giá", vietnameseLearnerCueVi: "Ikura desu ka" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá trước khi thanh toán." },
      comprehension: { promptVi: "Từ nào dùng để hỏi giá?", options: ["いくら", "どこ"], correctAnswer: "いくら", explanationVi: "いくら là bao nhiêu tiền." },
      production: { promptVi: "Chỉ vào cái túi và hỏi giá.", requiredSlots: ["Cái này"], exemplar: "これはいくらですか？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ mẫu câu hỏi giá tiền.", cueVi: "これは...", acceptedPatterns: [{ requiredFragments: ["いくら", "ですか"] }], answerHintVi: "いくらですか" },
      semanticDiscrimination: {
        scenarioVi: "Từ nào dùng để hỏi giá?",
        correctPragmaticAction: "いくら",
        plausibleDistractors: [{ text: "どこ", errorType: "L1 Transfer", explanationVi: "いくら là bao nhiêu tiền." }]
      },
      generativeSimulation: {
        promptVi: "Chỉ vào cái túi và hỏi giá.",
        pragmaticGoal: "Chỉ vào cái túi và hỏi giá.",
        semanticSlots: ["Cái này"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Dùng kore đúng vật gần"],
    },
    {
      id: 'ja-survival-4', language: 'ja', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món ăn tại nhà hàng.",
      scenario: { settingVi: "Bạn vào nhà hàng và muốn gọi món Sushi.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "寿司をお願いします。", vi: "Cho tôi Sushi." },
        { speaker: 'B', text: "かしこまりました。", vi: "Tôi hiểu rồi ạ." },
      ],
      chunks: [
        { text: "...をお願いします。", vi: "Làm ơn cho tôi...", useWhenVi: "khi gọi món/nhờ vả", vietnameseLearnerCueVi: "... wo onegaishimasu" },
      ],
      contextCue: { titleVi: "Vào quán ăn", bodyVi: "Sử dụng cách nói lịch sự khi gọi món." },
      comprehension: { promptVi: "Đâu là cách lịch sự khi gọi món?", options: ["をお願いします", "をください"], correctAnswer: "をお願いします", explanationVi: "Onegaishimasu lịch sự hơn." },
      production: { promptVi: "Bạn muốn gọi món Ramen.", requiredSlots: ["Ramen"], exemplar: "ラーメンをお願いします。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại mẫu câu gọi món.", cueVi: "...をお願いします。", acceptedPatterns: [{ requiredFragments: ["お願い", "します"] }], answerHintVi: "お願いします" },
      semanticDiscrimination: {
        scenarioVi: "Đâu là cách lịch sự khi gọi món?",
        correctPragmaticAction: "をお願いします",
        plausibleDistractors: [{ text: "をください", errorType: "L1 Transfer", explanationVi: "Onegaishimasu lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Bạn muốn gọi món Ramen.",
        pragmaticGoal: "Bạn muốn gọi món Ramen.",
        semanticSlots: ["Ramen"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Trợ từ wo", "Phát âm onegaishimasu"],
    },
    {
      id: 'ja-survival-5', language: 'ja', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể nói xin lỗi khi làm phiền.",
      scenario: { settingVi: "Bạn lỡ giẫm vào chân người khác trên tàu điện.", roles: ["Bạn", "Người bị giẫm"] },
      dialogue: [
        { speaker: 'A', text: "あっ、ごめんなさい。", vi: "Á, tôi xin lỗi." },
        { speaker: 'B', text: "大丈夫ですよ。", vi: "Không sao đâu." },
      ],
      chunks: [
        { text: "ごめんなさい。", vi: "Tôi xin lỗi.", useWhenVi: "khi gây lỗi nhỏ", vietnameseLearnerCueVi: "Gomen nasai" },
        { text: "大丈夫です。", vi: "Không sao.", useWhenVi: "khi trấn an", vietnameseLearnerCueVi: "Daijoubu" },
      ],
      contextCue: { titleVi: "Xử lý tình huống", bodyVi: "Nhanh chóng xin lỗi khi lỡ lời/gây lỗi." },
      comprehension: { promptVi: "Khi xin lỗi vì lỗi nhỏ thân mật, dùng từ nào?", options: ["ごめんなさい", "ありがとう"], correctAnswer: "ごめんなさい", explanationVi: "Gomen nasai dùng để xin lỗi." },
      production: { promptVi: "Xin lỗi vì đến trễ.", requiredSlots: ["xin lỗi"], exemplar: "遅れてごめんなさい。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại từ xin lỗi.", cueVi: "ごめん...", acceptedPatterns: [{ requiredFragments: ["ごめんなさい"] }], answerHintVi: "ごめんなさい" },
      semanticDiscrimination: {
        scenarioVi: "Khi xin lỗi vì lỗi nhỏ thân mật, dùng từ nào?",
        correctPragmaticAction: "ごめんなさい",
        plausibleDistractors: [{ text: "ありがとう", errorType: "L1 Transfer", explanationVi: "Gomen nasai dùng để xin lỗi." }]
      },
      generativeSimulation: {
        promptVi: "Xin lỗi vì đến trễ.",
        pragmaticGoal: "Xin lỗi vì đến trễ.",
        semanticSlots: ["xin lỗi"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thái độ chân thành"],
    },
    {
      id: 'ja-survival-6', language: 'ja', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ người khác chụp ảnh giúp.",
      scenario: { settingVi: "Bạn đến núi Phú Sĩ và muốn nhờ chụp ảnh.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "すみません、写真を撮ってください。", vi: "Xin lỗi, làm ơn chụp ảnh giúp tôi." },
        { speaker: 'B', text: "はい、いいですよ。", vi: "Vâng, được chứ." },
      ],
      chunks: [
        { text: "...を撮ってください。", vi: "Xin hãy chụp...", useWhenVi: "khi nhờ vả trực tiếp", vietnameseLearnerCueVi: "... wo totte kudasai" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Kèm lời cảm ơn trước và sau khi nhờ." },
      comprehension: { promptVi: "Mẫu câu nào dùng để nhờ làm việc gì đó?", options: ["〜てください", "〜ています"], correctAnswer: "〜てください", explanationVi: "te-kudasai là yêu cầu lịch sự." },
      production: { promptVi: "Hãy nhờ một người chụp ảnh giúp bạn.", requiredSlots: ["chụp ảnh"], exemplar: "すみません、写真を撮ってください。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại đuôi câu nhờ vả.", cueVi: "...て...", acceptedPatterns: [{ requiredFragments: ["て", "ください"] }], answerHintVi: "てください" },
      semanticDiscrimination: {
        scenarioVi: "Mẫu câu nào dùng để nhờ làm việc gì đó?",
        correctPragmaticAction: "〜てください",
        plausibleDistractors: [{ text: "〜ています", errorType: "L1 Transfer", explanationVi: "te-kudasai là yêu cầu lịch sự." }]
      },
      generativeSimulation: {
        promptVi: "Hãy nhờ một người chụp ảnh giúp bạn.",
        pragmaticGoal: "Hãy nhờ một người chụp ảnh giúp bạn.",
        semanticSlots: ["chụp ảnh"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Dùng sumimasen trước khi nhờ"],
    },
    {
      id: 'ja-survival-7', language: 'ja', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "助けてください！", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "医者が必要です。", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "助けてください！", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["助けてください！", "医者が必要です。"], correctAnswer: "助けてください！", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "助けてください！", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "助けてください！" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "助けてください！",
        plausibleDistractors: [{ text: "医者が必要です。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-8', language: 'ja', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "空港までお願いします。", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "駅までいくらですか？", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "空港までお願いします。", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["空港までお願いします。", "駅までいくらですか？"], correctAnswer: "空港までお願いします。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "空港までお願いします。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "空港までお願いします。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "空港までお願いします。",
        plausibleDistractors: [{ text: "駅までいくらですか？", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-9', language: 'ja', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "予約しています。", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "部屋の鍵をお願いします。", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "予約しています。", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["予約しています。", "部屋の鍵をお願いします。"], correctAnswer: "予約しています。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "予約しています。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "予約しています。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "予約しています。",
        plausibleDistractors: [{ text: "部屋の鍵をお願いします。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-10', language: 'ja', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "今何時ですか？", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "5時です。", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "今何時ですか？", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["今何時ですか？", "5時です。"], correctAnswer: "今何時ですか？", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "今何時ですか？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "今何時ですか？" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "今何時ですか？",
        plausibleDistractors: [{ text: "5時です。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-11', language: 'ja', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "両替したいです。", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "ATMはどこですか？", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "両替したいです。", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["両替したいです。", "ATMはどこですか？"], correctAnswer: "両替したいです。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "両替したいです。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "両替したいです。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "両替したいです。",
        plausibleDistractors: [{ text: "ATMはどこですか？", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-12', language: 'ja', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "頭が痛いです。", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "薬が必要です。", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "頭が痛いです。", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["頭が痛いです。", "薬が必要です。"], correctAnswer: "頭が痛いです。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "頭が痛いです。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "頭が痛いです。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "頭が痛いです。",
        plausibleDistractors: [{ text: "薬が必要です。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-13', language: 'ja', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "もしもし、どなたですか？", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "かけ直します。", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "もしもし、どなたですか？", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["もしもし、どなたですか？", "かけ直します。"], correctAnswer: "もしもし、どなたですか？", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "もしもし、どなたですか？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "もしもし、どなたですか？" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "もしもし、どなたですか？",
        plausibleDistractors: [{ text: "かけ直します。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-14', language: 'ja', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "美味しいです。", vi: "Ngon quá." },
        { speaker: 'B', text: "ご親切に。", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "美味しいです。", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["美味しいです。", "ご親切に。"], correctAnswer: "美味しいです。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "美味しいです。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "美味しいです。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "美味しいです。",
        plausibleDistractors: [{ text: "ご親切に。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ja-survival-15', language: 'ja', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "さようなら、またね。", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "良い一日を！", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "さようなら、またね。", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["さようなら、またね。", "良い一日を！"], correctAnswer: "さようなら、またね。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "さようなら、またね。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "さようなら、またね。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "さようなら、またね。",
        plausibleDistractors: [{ text: "良い一日を！", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  zh: [
    {
      id: 'zh-survival-1', language: 'zh', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào và giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào và giới thiệu bản thân bằng tiếng Trung.",
      scenario: { settingVi: "Bạn gặp người mới ở lớp.", roles: ["Người học", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "你好，我叫阿兰。", vi: "Xin chào, tôi tên là Lan." },
        { speaker: 'B', text: "你好，很高兴认识你。", vi: "Chào, rất vui được gặp bạn." },
      ],
      chunks: [
        { text: "你好", vi: "Xin chào", useWhenVi: "chào mọi lúc", vietnameseLearnerCueVi: "Nỉ hảo" },
        { text: "我叫...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Wǒ jiào" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "你好 dùng mọi lúc." },
      comprehension: { promptVi: "Cách giới thiệu tên?", options: ["我叫", "我有"], correctAnswer: "我叫", explanationVi: "我叫 = tôi tên là." },
      production: { promptVi: "Giới thiệu bản thân.", requiredSlots: ["你好"], exemplar: "你好，我叫阿兰。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "我叫...", acceptedPatterns: [{ requiredFragments: ["我叫"] }], answerHintVi: "我叫" },
      semanticDiscrimination: {
        scenarioVi: "Cách giới thiệu tên?",
        correctPragmaticAction: "我叫",
        plausibleDistractors: [{ text: "我有", errorType: "L1 Transfer", explanationVi: "我叫 = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu bản thân.",
        pragmaticGoal: "Giới thiệu bản thân.",
        semanticSlots: ["你好"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu", "Phát âm jiào"],
    },
    {
      id: 'zh-survival-2', language: 'zh', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường đến nhà vệ sinh.",
      scenario: { settingVi: "Bạn ở trung tâm thương mại và tìm nhà vệ sinh.", roles: ["Bạn", "Bảo vệ"] },
      dialogue: [
        { speaker: 'A', text: "请问，洗手间在哪里？", vi: "Xin hỏi, nhà vệ sinh ở đâu?" },
        { speaker: 'B', text: "在前面。", vi: "Ở phía trước." },
      ],
      chunks: [
        { text: "请问...", vi: "Xin hỏi...", useWhenVi: "khi bắt chuyện", vietnameseLearnerCueVi: "Qǐng wèn" },
        { text: "...在哪里？", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Zài nǎ lǐ" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Tìm đường đi." },
      comprehension: { promptVi: "Hỏi địa điểm dùng từ nào?", options: ["在哪里", "什么时候"], correctAnswer: "在哪里", explanationVi: "在哪里 nghĩa là ở đâu." },
      production: { promptVi: "Hỏi đường đến ga tàu.", requiredSlots: ["车站"], exemplar: "请问，车站在哪里？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ từ \"xin hỏi\".", cueVi: "请...", acceptedPatterns: [{ requiredFragments: ["请问"] }], answerHintVi: "请问" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi địa điểm dùng từ nào?",
        correctPragmaticAction: "在哪里",
        plausibleDistractors: [{ text: "什么时候", errorType: "L1 Transfer", explanationVi: "在哪里 nghĩa là ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến ga tàu.",
        pragmaticGoal: "Hỏi đường đến ga tàu.",
        semanticSlots: ["车站"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu"],
    },
    {
      id: 'zh-survival-3', language: 'zh', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá tiền.",
      scenario: { settingVi: "Mua táo ở chợ.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "这个多少钱？", vi: "Cái này bao nhiêu tiền?" },
        { speaker: 'B', text: "五块钱。", vi: "5 tệ." },
      ],
      chunks: [
        { text: "多少钱？", vi: "Bao nhiêu tiền?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Duō shao qián" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Từ hỏi giá tiền?", options: ["多少钱", "怎么去"], correctAnswer: "多少钱", explanationVi: "多少钱 là bao nhiêu tiền." },
      production: { promptVi: "Hỏi giá một ly trà sữa.", requiredSlots: ["多少钱"], exemplar: "一杯奶茶多少钱？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại cụm từ hỏi giá.", cueVi: "多少...", acceptedPatterns: [{ requiredFragments: ["多少钱"] }], answerHintVi: "多少钱" },
      semanticDiscrimination: {
        scenarioVi: "Từ hỏi giá tiền?",
        correctPragmaticAction: "多少钱",
        plausibleDistractors: [{ text: "怎么去", errorType: "L1 Transfer", explanationVi: "多少钱 là bao nhiêu tiền." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá một ly trà sữa.",
        pragmaticGoal: "Hỏi giá một ly trà sữa.",
        semanticSlots: ["多少钱"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu qián"],
    },
    {
      id: 'zh-survival-4', language: 'zh', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món ăn.",
      scenario: { settingVi: "Gọi món sủi cảo.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "我要一份饺子。", vi: "Tôi muốn một phần sủi cảo." },
        { speaker: 'B', text: "好的，稍等。", vi: "Vâng, đợi một chút." },
      ],
      chunks: [
        { text: "我要...", vi: "Tôi muốn...", useWhenVi: "gọi món", vietnameseLearnerCueVi: "Wǒ yào" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Tại nhà hàng." },
      comprehension: { promptVi: "Cách xưng hô gọi món?", options: ["我要", "我想"], correctAnswer: "我要", explanationVi: "我要 là cách gọi món trực tiếp." },
      production: { promptVi: "Gọi một bát mì.", requiredSlots: ["我要", "面条"], exemplar: "我要一碗面条。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ từ \"Tôi muốn\".", cueVi: "我...", acceptedPatterns: [{ requiredFragments: ["我要"] }], answerHintVi: "我要" },
      semanticDiscrimination: {
        scenarioVi: "Cách xưng hô gọi món?",
        correctPragmaticAction: "我要",
        plausibleDistractors: [{ text: "我想", errorType: "L1 Transfer", explanationVi: "我要 là cách gọi món trực tiếp." }]
      },
      generativeSimulation: {
        promptVi: "Gọi một bát mì.",
        pragmaticGoal: "Gọi một bát mì.",
        semanticSlots: ["我要", "面条"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Lượng từ phù hợp"],
    },
    {
      id: 'zh-survival-5', language: 'zh', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể nói xin lỗi.",
      scenario: { settingVi: "Đến trễ cuộc hẹn.", roles: ["Bạn", "Đối tác"] },
      dialogue: [
        { speaker: 'A', text: "对不起，我迟到了。", vi: "Xin lỗi, tôi đến muộn." },
        { speaker: 'B', text: "没关系。", vi: "Không sao." },
      ],
      chunks: [
        { text: "对不起", vi: "Xin lỗi", useWhenVi: "xin lỗi chân thành", vietnameseLearnerCueVi: "Duì bu qǐ" },
        { text: "没关系", vi: "Không sao", useWhenVi: "đáp lại", vietnameseLearnerCueVi: "Méi guān xì" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Tình huống giao tiếp." },
      comprehension: { promptVi: "Cách đáp lại lời xin lỗi?", options: ["没关系", "不客气"], correctAnswer: "没关系", explanationVi: "没关系 là không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["对不起"], exemplar: "对不起，我不知道。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại từ xin lỗi.", cueVi: "对...", acceptedPatterns: [{ requiredFragments: ["对不起"] }], answerHintVi: "对不起" },
      semanticDiscrimination: {
        scenarioVi: "Cách đáp lại lời xin lỗi?",
        correctPragmaticAction: "没关系",
        plausibleDistractors: [{ text: "不客气", errorType: "L1 Transfer", explanationVi: "没关系 là không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["对不起"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thái độ"],
    },
    {
      id: 'zh-survival-6', language: 'zh', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ người khác giúp.",
      scenario: { settingVi: "Nhờ lấy nước.", roles: ["Bạn", "Đồng nghiệp"] },
      dialogue: [
        { speaker: 'A', text: "请给我一杯水，好吗？", vi: "Làm ơn cho tôi một cốc nước được không?" },
        { speaker: 'B', text: "好的。", vi: "Được." },
      ],
      chunks: [
        { text: "请给我...", vi: "Làm ơn cho tôi...", useWhenVi: "nhờ vả lấy đồ", vietnameseLearnerCueVi: "Qǐng gěi wǒ" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Xin phép/Nhờ vả." },
      comprehension: { promptVi: "Đuôi câu hỏi xin phép?", options: ["好吗", "在哪里"], correctAnswer: "好吗", explanationVi: "好吗 nghĩa là được không?" },
      production: { promptVi: "Nhờ cho xem thực đơn.", requiredSlots: ["菜单"], exemplar: "请给我菜单，好吗？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ từ \"làm ơn cho tôi\".", cueVi: "请...", acceptedPatterns: [{ requiredFragments: ["请给我"] }], answerHintVi: "请给我" },
      semanticDiscrimination: {
        scenarioVi: "Đuôi câu hỏi xin phép?",
        correctPragmaticAction: "好吗",
        plausibleDistractors: [{ text: "在哪里", errorType: "L1 Transfer", explanationVi: "好吗 nghĩa là được không?" }]
      },
      generativeSimulation: {
        promptVi: "Nhờ cho xem thực đơn.",
        pragmaticGoal: "Nhờ cho xem thực đơn.",
        semanticSlots: ["菜单"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phép lịch sự"],
    },
    {
      id: 'zh-survival-7', language: 'zh', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "救命啊！", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "我需要医生。", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "救命啊！", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["救命啊！", "我需要医生。"], correctAnswer: "救命啊！", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "救命啊！", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "救命啊！" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "救命啊！",
        plausibleDistractors: [{ text: "我需要医生。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-8', language: 'zh', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "请到机场。", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "去火车站多少钱？", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "请到机场。", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["请到机场。", "去火车站多少钱？"], correctAnswer: "请到机场。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "请到机场。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "请到机场。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "请到机场。",
        plausibleDistractors: [{ text: "去火车站多少钱？", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-9', language: 'zh', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "我有预订。", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "请给我房间钥匙。", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "我有预订。", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["我有预订。", "请给我房间钥匙。"], correctAnswer: "我有预订。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "我有预订。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "我有预订。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "我有预订。",
        plausibleDistractors: [{ text: "请给我房间钥匙。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-10', language: 'zh', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "现在几点？", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "现在五点。", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "现在几点？", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["现在几点？", "现在五点。"], correctAnswer: "现在几点？", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "现在几点？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "现在几点？" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "现在几点？",
        plausibleDistractors: [{ text: "现在五点。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-11', language: 'zh', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "我想换钱。", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "ATM在哪里？", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "我想换钱。", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["我想换钱。", "ATM在哪里？"], correctAnswer: "我想换钱。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "我想换钱。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "我想换钱。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "我想换钱。",
        plausibleDistractors: [{ text: "ATM在哪里？", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-12', language: 'zh', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "我头痛。", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "我需要买药。", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "我头痛。", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["我头痛。", "我需要买药。"], correctAnswer: "我头痛。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "我头痛。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "我头痛。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "我头痛。",
        plausibleDistractors: [{ text: "我需要买药。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-13', language: 'zh', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "喂，你是谁？", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "我等下打给你。", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "喂，你是谁？", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["喂，你是谁？", "我等下打给你。"], correctAnswer: "喂，你是谁？", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "喂，你是谁？", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "喂，你是谁？" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "喂，你是谁？",
        plausibleDistractors: [{ text: "我等下打给你。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-14', language: 'zh', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "很好吃。", vi: "Ngon quá." },
        { speaker: 'B', text: "你真好。", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "很好吃。", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["很好吃。", "你真好。"], correctAnswer: "很好吃。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "很好吃。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "很好吃。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "很好吃。",
        plausibleDistractors: [{ text: "你真好。", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'zh-survival-15', language: 'zh', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "再见，回头见。", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "祝你今天愉快！", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "再见，回头见。", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["再见，回头见。", "祝你今天愉快！"], correctAnswer: "再见，回头见。", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "再见，回头见。", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "再见，回头见。" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "再见，回头见。",
        plausibleDistractors: [{ text: "祝你今天愉快！", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  ko: [
    {
      id: 'ko-survival-1', language: 'ko', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào và giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào và giới thiệu bản thân bằng tiếng Hàn.",
      scenario: { settingVi: "Gặp bạn mới ở Seoul.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "안녕하세요, 저는 란이에요.", vi: "Xin chào, tôi là Lan." },
        { speaker: 'B', text: "반갑습니다, 란 씨.", vi: "Rất vui, Lan." },
      ],
      chunks: [
        { text: "안녕하세요", vi: "Xin chào", useWhenVi: "chào lịch sự", vietnameseLearnerCueVi: "An-nyeong-ha-se-yo" },
        { text: "저는...이에요", vi: "Tôi là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Jeo-neun ... i-e-yo" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "안녕하세요 dùng mọi lúc." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["저는...이에요", "저는...있어요"], correctAnswer: "저는...이에요", explanationVi: "저는...이에요 = tôi là..." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["안녕하세요"], exemplar: "안녕하세요, 저는 란이에요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "저는...", acceptedPatterns: [{ requiredFragments: ["저는"] }], answerHintVi: "저는...이에요" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "저는...이에요",
        plausibleDistractors: [{ text: "저는...있어요", errorType: "L1 Transfer", explanationVi: "저는...이에요 = tôi là..." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["안녕하세요"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Kính ngữ", "Phát âm"],
    },
    {
      id: 'ko-survival-2', language: 'ko', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Tìm ga Seoul.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "실례합니다, 서울역이 어디에 있습니까?", vi: "Xin lỗi, ga Seoul ở đâu vậy?" },
        { speaker: 'B', text: "저기 있습니다.", vi: "Ở đằng kia." },
      ],
      chunks: [
        { text: "어디에 있습니까?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Eo-di-e" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Giao tiếp đường phố." },
      comprehension: { promptVi: "Từ hỏi địa điểm?", options: ["어디", "누구"], correctAnswer: "어디", explanationVi: "어디 là ở đâu." },
      production: { promptVi: "Hỏi nhà vệ sinh ở đâu.", requiredSlots: ["화장실"], exemplar: "화장실이 어디에 있습니까?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại từ ở đâu.", cueVi: "어...", acceptedPatterns: [{ requiredFragments: ["어디"] }], answerHintVi: "어디" },
      semanticDiscrimination: {
        scenarioVi: "Từ hỏi địa điểm?",
        correctPragmaticAction: "어디",
        plausibleDistractors: [{ text: "누구", errorType: "L1 Transfer", explanationVi: "어디 là ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi nhà vệ sinh ở đâu.",
        pragmaticGoal: "Hỏi nhà vệ sinh ở đâu.",
        semanticSlots: ["화장실"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-3', language: 'ko', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá tiền.",
      scenario: { settingVi: "Mua sắm ở Dongdaemun.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "이거 얼마입니까?", vi: "Cái này bao nhiêu tiền?" },
        { speaker: 'B', text: "만 원입니다.", vi: "10,000 won." },
      ],
      chunks: [
        { text: "얼마입니까?", vi: "Bao nhiêu tiền?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Eol-ma" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Thương lượng giá." },
      comprehension: { promptVi: "Hỏi giá dùng cụm nào?", options: ["얼마입니까", "어디입니까"], correctAnswer: "얼마입니까", explanationVi: "얼마 là bao nhiêu." },
      production: { promptVi: "Hỏi giá áo này.", requiredSlots: ["얼마"], exemplar: "이 옷은 얼마입니까?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại cụm từ hỏi giá.", cueVi: "얼...", acceptedPatterns: [{ requiredFragments: ["얼마"] }], answerHintVi: "얼마" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá dùng cụm nào?",
        correctPragmaticAction: "얼마입니까",
        plausibleDistractors: [{ text: "어디입니까", errorType: "L1 Transfer", explanationVi: "얼마 là bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá áo này.",
        pragmaticGoal: "Hỏi giá áo này.",
        semanticSlots: ["얼마"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Kính ngữ"],
    },
    {
      id: 'ko-survival-4', language: 'ko', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món ăn.",
      scenario: { settingVi: "Gọi món Bibimbap.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "비빔밥 하나 주세요.", vi: "Cho tôi một Bibimbap." },
        { speaker: 'B', text: "네, 알겠습니다.", vi: "Vâng, tôi hiểu rồi." },
      ],
      chunks: [
        { text: "...주세요.", vi: "Làm ơn cho tôi...", useWhenVi: "gọi món", vietnameseLearnerCueVi: "Ju-se-yo" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Nhà hàng." },
      comprehension: { promptVi: "Cách xin đồ vật/gọi món?", options: ["주세요", "합니다"], correctAnswer: "주세요", explanationVi: "주세요 là hãy cho tôi." },
      production: { promptVi: "Gọi Kimchi.", requiredSlots: ["주세요"], exemplar: "김치 좀 주세요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ từ \"hãy cho tôi\".", cueVi: "주...", acceptedPatterns: [{ requiredFragments: ["주세요"] }], answerHintVi: "주세요" },
      semanticDiscrimination: {
        scenarioVi: "Cách xin đồ vật/gọi món?",
        correctPragmaticAction: "주세요",
        plausibleDistractors: [{ text: "합니다", errorType: "L1 Transfer", explanationVi: "주세요 là hãy cho tôi." }]
      },
      generativeSimulation: {
        promptVi: "Gọi Kimchi.",
        pragmaticGoal: "Gọi Kimchi.",
        semanticSlots: ["주세요"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-5', language: 'ko', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể nói xin lỗi.",
      scenario: { settingVi: "Làm phiền người khác.", roles: ["Bạn", "Đối tác"] },
      dialogue: [
        { speaker: 'A', text: "죄송합니다.", vi: "Tôi xin lỗi." },
        { speaker: 'B', text: "괜찮습니다.", vi: "Không sao." },
      ],
      chunks: [
        { text: "죄송합니다.", vi: "Tôi xin lỗi.", useWhenVi: "xin lỗi chân thành", vietnameseLearnerCueVi: "Joe-song-ham-ni-da" },
        { text: "괜찮습니다.", vi: "Không sao.", useWhenVi: "đáp lại", vietnameseLearnerCueVi: "Gwen-chan-seum-ni-da" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Lịch sự." },
      comprehension: { promptVi: "Xin lỗi lịch sự dùng?", options: ["죄송합니다", "감사합니다"], correctAnswer: "죄송합니다", explanationVi: "죄송합니다 là xin lỗi." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["죄송"], exemplar: "정말 죄송합니다.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại từ xin lỗi.", cueVi: "죄송...", acceptedPatterns: [{ requiredFragments: ["죄송합니다"] }], answerHintVi: "죄송합니다" },
      semanticDiscrimination: {
        scenarioVi: "Xin lỗi lịch sự dùng?",
        correctPragmaticAction: "죄송합니다",
        plausibleDistractors: [{ text: "감사합니다", errorType: "L1 Transfer", explanationVi: "죄송합니다 là xin lỗi." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["죄송"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thái độ"],
    },
    {
      id: 'ko-survival-6', language: 'ko', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ người khác giúp.",
      scenario: { settingVi: "Nhờ giúp đỡ.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "도와주실 수 있나요?", vi: "Có thể giúp tôi được không?" },
        { speaker: 'B', text: "네, 물론이죠.", vi: "Vâng, dĩ nhiên." },
      ],
      chunks: [
        { text: "도와주실 수 있나요?", vi: "Có thể giúp tôi được không?", useWhenVi: "nhờ giúp đỡ", vietnameseLearnerCueVi: "Do-wa-ju-sil su in-na-yo" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Yêu cầu sự giúp đỡ." },
      comprehension: { promptVi: "Hỏi xem ai đó có thể giúp mình không?", options: ["도와주실 수 있나요", "어디에 있나요"], correctAnswer: "도와주실 수 있나요", explanationVi: "도와주다 là giúp đỡ." },
      production: { promptVi: "Nhờ giúp.", requiredSlots: ["도와"], exemplar: "저 좀 도와주실 수 있나요?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ từ \"có thể giúp\".", cueVi: "도와...", acceptedPatterns: [{ requiredFragments: ["도와주"] }], answerHintVi: "도와" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi xem ai đó có thể giúp mình không?",
        correctPragmaticAction: "도와주실 수 있나요",
        plausibleDistractors: [{ text: "어디에 있나요", errorType: "L1 Transfer", explanationVi: "도와주다 là giúp đỡ." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ giúp.",
        pragmaticGoal: "Nhờ giúp.",
        semanticSlots: ["도와"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Kính ngữ"],
    },
    {
      id: 'ko-survival-7', language: 'ko', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "도와주세요!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "의사가 필요해요.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "도와주세요!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["도와주세요!", "의사가 필요해요."], correctAnswer: "도와주세요!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "도와주세요!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "도와주세요!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "도와주세요!",
        plausibleDistractors: [{ text: "의사가 필요해요.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-8', language: 'ko', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "공항으로 가주세요.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "역까지 얼마인가요?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "공항으로 가주세요.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["공항으로 가주세요.", "역까지 얼마인가요?"], correctAnswer: "공항으로 가주세요.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "공항으로 가주세요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "공항으로 가주세요." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "공항으로 가주세요.",
        plausibleDistractors: [{ text: "역까지 얼마인가요?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-9', language: 'ko', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "예약했습니다.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "방 열쇠 주세요.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "예약했습니다.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["예약했습니다.", "방 열쇠 주세요."], correctAnswer: "예약했습니다.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "예약했습니다.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "예약했습니다." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "예약했습니다.",
        plausibleDistractors: [{ text: "방 열쇠 주세요.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-10', language: 'ko', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "지금 몇 시예요?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "5시입니다.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "지금 몇 시예요?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["지금 몇 시예요?", "5시입니다."], correctAnswer: "지금 몇 시예요?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "지금 몇 시예요?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "지금 몇 시예요?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "지금 몇 시예요?",
        plausibleDistractors: [{ text: "5시입니다.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-11', language: 'ko', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "환전하고 싶어요.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "ATM이 어디에 있나요?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "환전하고 싶어요.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["환전하고 싶어요.", "ATM이 어디에 있나요?"], correctAnswer: "환전하고 싶어요.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "환전하고 싶어요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "환전하고 싶어요." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "환전하고 싶어요.",
        plausibleDistractors: [{ text: "ATM이 어디에 있나요?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-12', language: 'ko', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "머리가 아파요.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "약이 필요해요.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "머리가 아파요.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["머리가 아파요.", "약이 필요해요."], correctAnswer: "머리가 아파요.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "머리가 아파요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "머리가 아파요." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "머리가 아파요.",
        plausibleDistractors: [{ text: "약이 필요해요.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-13', language: 'ko', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "여보세요, 누구세요?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "다시 걸게요.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "여보세요, 누구세요?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["여보세요, 누구세요?", "다시 걸게요."], correctAnswer: "여보세요, 누구세요?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "여보세요, 누구세요?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "여보세요, 누구세요?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "여보세요, 누구세요?",
        plausibleDistractors: [{ text: "다시 걸게요.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-14', language: 'ko', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "맛있어요.", vi: "Ngon quá." },
        { speaker: 'B', text: "친절하시네요.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "맛있어요.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["맛있어요.", "친절하시네요."], correctAnswer: "맛있어요.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "맛있어요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "맛있어요." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "맛있어요.",
        plausibleDistractors: [{ text: "친절하시네요.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ko-survival-15', language: 'ko', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "안녕히 가세요, 또 봐요.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "좋은 하루 보내세요!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "안녕히 가세요, 또 봐요.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["안녕히 가세요, 또 봐요.", "좋은 하루 보내세요!"], correctAnswer: "안녕히 가세요, 또 봐요.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "안녕히 가세요, 또 봐요.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "안녕히 가세요, 또 봐요." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "안녕히 가세요, 또 봐요.",
        plausibleDistractors: [{ text: "좋은 하루 보내세요!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  fr: [
    {
      id: 'fr-survival-1', language: 'fr', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào hỏi bằng tiếng Pháp.",
      scenario: { settingVi: "Gặp người mới ở Paris.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "Bonjour, je m'appelle Lan.", vi: "Xin chào, tôi tên là Lan." },
        { speaker: 'B', text: "Enchanté, Lan.", vi: "Rất vui, Lan." },
      ],
      chunks: [
        { text: "Bonjour", vi: "Xin chào", useWhenVi: "chào", vietnameseLearnerCueVi: "Bông-zhur" },
        { text: "Je m'appelle...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Zhơ ma-pel" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Luôn bắt đầu bằng Bonjour." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Je m'appelle", "Je suis"], correctAnswer: "Je m'appelle", explanationVi: "Je m'appelle = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["Bonjour"], exemplar: "Bonjour, je m'appelle Lan.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Je m'...", acceptedPatterns: [{ requiredFragments: ["appelle"] }], answerHintVi: "Je m'appelle" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Je m'appelle",
        plausibleDistractors: [{ text: "Je suis", errorType: "L1 Transfer", explanationVi: "Je m'appelle = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["Bonjour"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm Bonjour"],
    },
    {
      id: 'fr-survival-2', language: 'fr', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Paris.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Excusez-moi, où est la gare ?", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "Tout droit, puis à gauche.", vi: "Đi thẳng, rồi rẽ trái." },
      ],
      chunks: [
        { text: "Où est...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "U è" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Dùng Excusez-moi." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["Où est", "Qu'est-ce que"], correctAnswer: "Où est", explanationVi: "Où est = ở đâu." },
      production: { promptVi: "Hỏi đường đến bảo tàng.", requiredSlots: ["musée"], exemplar: "Excusez-moi, où est le musée ?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi ở đâu.", cueVi: "Où...", acceptedPatterns: [{ requiredFragments: ["où", "est"] }], answerHintVi: "Où est" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "Où est",
        plausibleDistractors: [{ text: "Qu'est-ce que", errorType: "L1 Transfer", explanationVi: "Où est = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến bảo tàng.",
        pragmaticGoal: "Hỏi đường đến bảo tàng.",
        semanticSlots: ["musée"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm où"],
    },
    {
      id: 'fr-survival-3', language: 'fr', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Tiệm bánh Pháp.", roles: ["Khách hàng", "Thợ bánh"] },
      dialogue: [
        { speaker: 'A', text: "Combien coûte cette baguette ?", vi: "Bánh mì này bao nhiêu?" },
        { speaker: 'B', text: "Un euro cinquante.", vi: "1.50 euro." },
      ],
      chunks: [
        { text: "Combien coûte...?", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Comb-biêng cut" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["Combien", "Comment"], correctAnswer: "Combien", explanationVi: "Combien = bao nhiêu." },
      production: { promptVi: "Hỏi giá cà phê.", requiredSlots: ["café"], exemplar: "Combien coûte un café ?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Combien...", acceptedPatterns: [{ requiredFragments: ["combien", "coûte"] }], answerHintVi: "Combien coûte" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "Combien",
        plausibleDistractors: [{ text: "Comment", errorType: "L1 Transfer", explanationVi: "Combien = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá cà phê.",
        pragmaticGoal: "Hỏi giá cà phê.",
        semanticSlots: ["café"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm combien"],
    },
    {
      id: 'fr-survival-4', language: 'fr', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Nhà hàng ở Lyon.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Je voudrais un croissant, s'il vous plaît.", vi: "Tôi muốn một bánh sừng bò." },
        { speaker: 'B', text: "Bien sûr.", vi: "Dĩ nhiên." },
      ],
      chunks: [
        { text: "Je voudrais...", vi: "Tôi muốn...", useWhenVi: "gọi món lịch sự", vietnameseLearnerCueVi: "Zhơ vu-đrè" },
        { text: "s'il vous plaît", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "sil vu plè" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm s'il vous plaît." },
      comprehension: { promptVi: "Gọi món lịch sự?", options: ["Je voudrais", "Je veux"], correctAnswer: "Je voudrais", explanationVi: "Je voudrais lịch sự hơn." },
      production: { promptVi: "Gọi nước.", requiredSlots: ["eau"], exemplar: "Je voudrais de l'eau, s'il vous plaît.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Je...", acceptedPatterns: [{ requiredFragments: ["voudrais"] }], answerHintVi: "Je voudrais" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món lịch sự?",
        correctPragmaticAction: "Je voudrais",
        plausibleDistractors: [{ text: "Je veux", errorType: "L1 Transfer", explanationVi: "Je voudrais lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi nước.",
        pragmaticGoal: "Gọi nước.",
        semanticSlots: ["eau"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm s'il vous plaît"],
    },
    {
      id: 'fr-survival-5', language: 'fr', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người trên metro.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Pardon, je suis désolé.", vi: "Xin lỗi, tôi rất tiếc." },
        { speaker: 'B', text: "Ce n'est pas grave.", vi: "Không sao." },
      ],
      chunks: [
        { text: "Pardon", vi: "Xin lỗi", useWhenVi: "xin lỗi nhanh", vietnameseLearnerCueVi: "Pa-đông" },
        { text: "Merci beaucoup", vi: "Cảm ơn nhiều", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Mè-xi bô-cu" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Nhanh chóng xin lỗi." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["Ce n'est pas grave", "De rien"], correctAnswer: "Ce n'est pas grave", explanationVi: "Ce n'est pas grave = Không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["désolé"], exemplar: "Je suis vraiment désolé.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "dé...", acceptedPatterns: [{ requiredFragments: ["désolé"] }], answerHintVi: "désolé" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "Ce n'est pas grave",
        plausibleDistractors: [{ text: "De rien", errorType: "L1 Transfer", explanationVi: "Ce n'est pas grave = Không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["désolé"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thái độ"],
    },
    {
      id: 'fr-survival-6', language: 'fr', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh ở tháp Eiffel.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Pourriez-vous prendre une photo, s'il vous plaît ?", vi: "Chụp ảnh giúp tôi được không?" },
        { speaker: 'B', text: "Avec plaisir !", vi: "Sẵn lòng!" },
      ],
      chunks: [
        { text: "Pourriez-vous...?", vi: "Bạn có thể...?", useWhenVi: "nhờ vả lịch sự", vietnameseLearnerCueVi: "Pu-ri-ê vu" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng pourriez-vous." },
      comprehension: { promptVi: "Nhờ vả lịch sự?", options: ["Pourriez-vous", "Tu peux"], correctAnswer: "Pourriez-vous", explanationVi: "Pourriez-vous lịch sự nhất." },
      production: { promptVi: "Nhờ mở cửa.", requiredSlots: ["porte"], exemplar: "Pourriez-vous ouvrir la porte ?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "Pourriez...", acceptedPatterns: [{ requiredFragments: ["pourriez", "vous"] }], answerHintVi: "Pourriez-vous" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả lịch sự?",
        correctPragmaticAction: "Pourriez-vous",
        plausibleDistractors: [{ text: "Tu peux", errorType: "L1 Transfer", explanationVi: "Pourriez-vous lịch sự nhất." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ mở cửa.",
        pragmaticGoal: "Nhờ mở cửa.",
        semanticSlots: ["porte"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Ngữ điệu lịch sự"],
    },
    {
      id: 'fr-survival-7', language: 'fr', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Au secours !", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "J'ai besoin d'un médecin.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Au secours !", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Au secours !", "J'ai besoin d'un médecin."], correctAnswer: "Au secours !", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Au secours !", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Au secours !" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Au secours !",
        plausibleDistractors: [{ text: "J'ai besoin d'un médecin.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-8', language: 'fr', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "À l'aéroport, s'il vous plaît.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "Combien pour la gare ?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "À l'aéroport, s'il vous plaît.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["À l'aéroport, s'il vous plaît.", "Combien pour la gare ?"], correctAnswer: "À l'aéroport, s'il vous plaît.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "À l'aéroport, s'il vous plaît.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "À l'aéroport, s'il vous plaît." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "À l'aéroport, s'il vous plaît.",
        plausibleDistractors: [{ text: "Combien pour la gare ?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-9', language: 'fr', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "J'ai une réservation.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "Ma clé de chambre, s'il vous plaît.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "J'ai une réservation.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["J'ai une réservation.", "Ma clé de chambre, s'il vous plaît."], correctAnswer: "J'ai une réservation.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "J'ai une réservation.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "J'ai une réservation." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "J'ai une réservation.",
        plausibleDistractors: [{ text: "Ma clé de chambre, s'il vous plaît.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-10', language: 'fr', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "Quelle heure est-il ?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "Il est 5 heures.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "Quelle heure est-il ?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Quelle heure est-il ?", "Il est 5 heures."], correctAnswer: "Quelle heure est-il ?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Quelle heure est-il ?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Quelle heure est-il ?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Quelle heure est-il ?",
        plausibleDistractors: [{ text: "Il est 5 heures.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-11', language: 'fr', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Je veux changer de la monnaie.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "Où est le distributeur ?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Je veux changer de la monnaie.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Je veux changer de la monnaie.", "Où est le distributeur ?"], correctAnswer: "Je veux changer de la monnaie.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Je veux changer de la monnaie.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Je veux changer de la monnaie." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Je veux changer de la monnaie.",
        plausibleDistractors: [{ text: "Où est le distributeur ?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-12', language: 'fr', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "J'ai mal à la tête.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "J'ai besoin de médicaments.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "J'ai mal à la tête.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["J'ai mal à la tête.", "J'ai besoin de médicaments."], correctAnswer: "J'ai mal à la tête.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "J'ai mal à la tête.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "J'ai mal à la tête." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "J'ai mal à la tête.",
        plausibleDistractors: [{ text: "J'ai besoin de médicaments.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-13', language: 'fr', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Allô, qui est à l'appareil ?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Je rappellerai.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Allô, qui est à l'appareil ?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Allô, qui est à l'appareil ?", "Je rappellerai."], correctAnswer: "Allô, qui est à l'appareil ?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Allô, qui est à l'appareil ?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Allô, qui est à l'appareil ?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Allô, qui est à l'appareil ?",
        plausibleDistractors: [{ text: "Je rappellerai.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-14', language: 'fr', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "C'est délicieux.", vi: "Ngon quá." },
        { speaker: 'B', text: "Vous êtes très gentil.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "C'est délicieux.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["C'est délicieux.", "Vous êtes très gentil."], correctAnswer: "C'est délicieux.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "C'est délicieux.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "C'est délicieux." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "C'est délicieux.",
        plausibleDistractors: [{ text: "Vous êtes très gentil.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'fr-survival-15', language: 'fr', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Au revoir, à plus tard.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Bonne journée !", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Au revoir, à plus tard.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Au revoir, à plus tard.", "Bonne journée !"], correctAnswer: "Au revoir, à plus tard.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Au revoir, à plus tard.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Au revoir, à plus tard." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Au revoir, à plus tard.",
        plausibleDistractors: [{ text: "Bonne journée !", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  de: [
    {
      id: 'de-survival-1', language: 'de', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Đức.",
      scenario: { settingVi: "Gặp đồng nghiệp mới ở Berlin.", roles: ["Bạn", "Đồng nghiệp"] },
      dialogue: [
        { speaker: 'A', text: "Hallo, ich heiße Lan.", vi: "Xin chào, tôi tên Lan." },
        { speaker: 'B', text: "Freut mich, Lan. Ich bin Max.", vi: "Rất vui, Lan. Tôi là Max." },
      ],
      chunks: [
        { text: "Hallo", vi: "Xin chào", useWhenVi: "chào thân mật", vietnameseLearnerCueVi: "Ha-lô" },
        { text: "Ich heiße...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Ích hai-xờ" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Hallo hoặc Guten Tag." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Ich heiße", "Ich habe"], correctAnswer: "Ich heiße", explanationVi: "Ich heiße = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["heiße"], exemplar: "Hallo, ich heiße Lan.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Ich h...", acceptedPatterns: [{ requiredFragments: ["heiße"] }], answerHintVi: "Ich heiße" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Ich heiße",
        plausibleDistractors: [{ text: "Ich habe", errorType: "L1 Transfer", explanationVi: "Ich heiße = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["heiße"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm ß"],
    },
    {
      id: 'de-survival-2', language: 'de', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Munich.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Entschuldigung, wo ist der Bahnhof?", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "Geradeaus, dann links.", vi: "Đi thẳng, rồi rẽ trái." },
      ],
      chunks: [
        { text: "Wo ist...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Vô ist" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Dùng Entschuldigung." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["Wo ist", "Was ist"], correctAnswer: "Wo ist", explanationVi: "Wo = ở đâu." },
      production: { promptVi: "Hỏi đường đến khách sạn.", requiredSlots: ["Hotel"], exemplar: "Entschuldigung, wo ist das Hotel?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "Wo...", acceptedPatterns: [{ requiredFragments: ["wo", "ist"] }], answerHintVi: "Wo ist" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "Wo ist",
        plausibleDistractors: [{ text: "Was ist", errorType: "L1 Transfer", explanationVi: "Wo = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến khách sạn.",
        pragmaticGoal: "Hỏi đường đến khách sạn.",
        semanticSlots: ["Hotel"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm Entschuldigung"],
    },
    {
      id: 'de-survival-3', language: 'de', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ ở Berlin.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "Was kostet das?", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "Fünf Euro.", vi: "5 Euro." },
      ],
      chunks: [
        { text: "Was kostet...?", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Vát cốt-stet" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["Was kostet", "Wo ist"], correctAnswer: "Was kostet", explanationVi: "Was kostet = bao nhiêu." },
      production: { promptVi: "Hỏi giá áo.", requiredSlots: ["kostet"], exemplar: "Was kostet dieses Hemd?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Was...", acceptedPatterns: [{ requiredFragments: ["was", "kostet"] }], answerHintVi: "Was kostet" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "Was kostet",
        plausibleDistractors: [{ text: "Wo ist", errorType: "L1 Transfer", explanationVi: "Was kostet = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá áo.",
        pragmaticGoal: "Hỏi giá áo.",
        semanticSlots: ["kostet"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm kostet"],
    },
    {
      id: 'de-survival-4', language: 'de', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Quán bia Đức.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Ich hätte gerne ein Bier, bitte.", vi: "Tôi muốn một ly bia." },
        { speaker: 'B', text: "Gerne!", vi: "Sẵn lòng!" },
      ],
      chunks: [
        { text: "Ich hätte gerne...", vi: "Tôi muốn...", useWhenVi: "gọi món lịch sự", vietnameseLearnerCueVi: "Ích hét-tơ ghè-nơ" },
        { text: "bitte", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "Bít-tơ" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm bitte." },
      comprehension: { promptVi: "Gọi món lịch sự?", options: ["Ich hätte gerne", "Ich will"], correctAnswer: "Ich hätte gerne", explanationVi: "Ich hätte gerne lịch sự hơn." },
      production: { promptVi: "Gọi cà phê.", requiredSlots: ["Kaffee"], exemplar: "Ich hätte gerne einen Kaffee, bitte.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Ich hätte...", acceptedPatterns: [{ requiredFragments: ["hätte", "gerne"] }], answerHintVi: "Ich hätte gerne" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món lịch sự?",
        correctPragmaticAction: "Ich hätte gerne",
        plausibleDistractors: [{ text: "Ich will", errorType: "L1 Transfer", explanationVi: "Ich hätte gerne lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi cà phê.",
        pragmaticGoal: "Gọi cà phê.",
        semanticSlots: ["Kaffee"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm bitte"],
    },
    {
      id: 'de-survival-5', language: 'de', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người trên tàu.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Entschuldigung, es tut mir leid.", vi: "Xin lỗi, tôi rất tiếc." },
        { speaker: 'B', text: "Kein Problem.", vi: "Không sao." },
      ],
      chunks: [
        { text: "Es tut mir leid", vi: "Tôi rất tiếc", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Ét tut mia lai-đờ" },
        { text: "Danke schön", vi: "Cảm ơn nhiều", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Đan-kơ sơn" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Nói xin lỗi ngay." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["Kein Problem", "Danke"], correctAnswer: "Kein Problem", explanationVi: "Kein Problem = không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["leid"], exemplar: "Es tut mir leid.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "Es tut...", acceptedPatterns: [{ requiredFragments: ["tut", "mir", "leid"] }], answerHintVi: "Es tut mir leid" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "Kein Problem",
        plausibleDistractors: [{ text: "Danke", errorType: "L1 Transfer", explanationVi: "Kein Problem = không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["leid"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm leid"],
    },
    {
      id: 'de-survival-6', language: 'de', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh ở Brandenburg.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Könnten Sie bitte ein Foto machen?", vi: "Bạn có thể chụp ảnh không?" },
        { speaker: 'B', text: "Natürlich!", vi: "Dĩ nhiên!" },
      ],
      chunks: [
        { text: "Könnten Sie...?", vi: "Bạn có thể...?", useWhenVi: "nhờ vả lịch sự", vietnameseLearnerCueVi: "Côn-ten zi" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng Könnten Sie." },
      comprehension: { promptVi: "Nhờ vả lịch sự?", options: ["Könnten Sie", "Kannst du"], correctAnswer: "Könnten Sie", explanationVi: "Könnten Sie lịch sự nhất." },
      production: { promptVi: "Nhờ mở cửa.", requiredSlots: ["Tür"], exemplar: "Könnten Sie bitte die Tür öffnen?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "Könnten...", acceptedPatterns: [{ requiredFragments: ["könnten", "sie"] }], answerHintVi: "Könnten Sie" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả lịch sự?",
        correctPragmaticAction: "Könnten Sie",
        plausibleDistractors: [{ text: "Kannst du", errorType: "L1 Transfer", explanationVi: "Könnten Sie lịch sự nhất." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ mở cửa.",
        pragmaticGoal: "Nhờ mở cửa.",
        semanticSlots: ["Tür"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm ö"],
    },
    {
      id: 'de-survival-7', language: 'de', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Hilfe, bitte!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "Ich brauche einen Arzt.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Hilfe, bitte!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Hilfe, bitte!", "Ich brauche einen Arzt."], correctAnswer: "Hilfe, bitte!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Hilfe, bitte!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Hilfe, bitte!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Hilfe, bitte!",
        plausibleDistractors: [{ text: "Ich brauche einen Arzt.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-8', language: 'de', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "Zum Flughafen, bitte.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "Wie viel kostet es zum Bahnhof?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "Zum Flughafen, bitte.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Zum Flughafen, bitte.", "Wie viel kostet es zum Bahnhof?"], correctAnswer: "Zum Flughafen, bitte.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Zum Flughafen, bitte.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Zum Flughafen, bitte." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Zum Flughafen, bitte.",
        plausibleDistractors: [{ text: "Wie viel kostet es zum Bahnhof?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-9', language: 'de', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "Ich habe eine Reservierung.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "Meinen Zimmerschlüssel, bitte.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "Ich habe eine Reservierung.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Ich habe eine Reservierung.", "Meinen Zimmerschlüssel, bitte."], correctAnswer: "Ich habe eine Reservierung.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Ich habe eine Reservierung.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Ich habe eine Reservierung." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Ich habe eine Reservierung.",
        plausibleDistractors: [{ text: "Meinen Zimmerschlüssel, bitte.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-10', language: 'de', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "Wie spät ist es?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "Es ist 5 Uhr.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "Wie spät ist es?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Wie spät ist es?", "Es ist 5 Uhr."], correctAnswer: "Wie spät ist es?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Wie spät ist es?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Wie spät ist es?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Wie spät ist es?",
        plausibleDistractors: [{ text: "Es ist 5 Uhr.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-11', language: 'de', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Ich möchte Geld wechseln.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "Wo ist der Geldautomat?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Ich möchte Geld wechseln.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Ich möchte Geld wechseln.", "Wo ist der Geldautomat?"], correctAnswer: "Ich möchte Geld wechseln.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Ich möchte Geld wechseln.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Ich möchte Geld wechseln." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Ich möchte Geld wechseln.",
        plausibleDistractors: [{ text: "Wo ist der Geldautomat?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-12', language: 'de', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "Ich habe Kopfschmerzen.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "Ich brauche Medizin.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "Ich habe Kopfschmerzen.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Ich habe Kopfschmerzen.", "Ich brauche Medizin."], correctAnswer: "Ich habe Kopfschmerzen.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Ich habe Kopfschmerzen.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Ich habe Kopfschmerzen." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Ich habe Kopfschmerzen.",
        plausibleDistractors: [{ text: "Ich brauche Medizin.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-13', language: 'de', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Hallo, wer spricht dort?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Ich rufe zurück.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Hallo, wer spricht dort?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Hallo, wer spricht dort?", "Ich rufe zurück."], correctAnswer: "Hallo, wer spricht dort?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Hallo, wer spricht dort?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Hallo, wer spricht dort?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Hallo, wer spricht dort?",
        plausibleDistractors: [{ text: "Ich rufe zurück.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-14', language: 'de', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "Das ist lecker.", vi: "Ngon quá." },
        { speaker: 'B', text: "Sie sind sehr freundlich.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "Das ist lecker.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Das ist lecker.", "Sie sind sehr freundlich."], correctAnswer: "Das ist lecker.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Das ist lecker.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Das ist lecker." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Das ist lecker.",
        plausibleDistractors: [{ text: "Sie sind sehr freundlich.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'de-survival-15', language: 'de', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Auf Wiedersehen, bis später.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Einen schönen Tag noch!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Auf Wiedersehen, bis später.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Auf Wiedersehen, bis später.", "Einen schönen Tag noch!"], correctAnswer: "Auf Wiedersehen, bis später.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Auf Wiedersehen, bis später.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Auf Wiedersehen, bis später." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Auf Wiedersehen, bis später.",
        plausibleDistractors: [{ text: "Einen schönen Tag noch!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  es: [
    {
      id: 'es-survival-1', language: 'es', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Tây Ban Nha.",
      scenario: { settingVi: "Gặp bạn mới ở Madrid.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "¡Hola! Me llamo Lan.", vi: "Chào! Tôi tên Lan." },
        { speaker: 'B', text: "Mucho gusto, Lan.", vi: "Rất vui, Lan." },
      ],
      chunks: [
        { text: "¡Hola!", vi: "Chào!", useWhenVi: "chào", vietnameseLearnerCueVi: "Ô-la" },
        { text: "Me llamo...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Mê da-mô" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Hola dùng mọi lúc." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Me llamo", "Me gusta"], correctAnswer: "Me llamo", explanationVi: "Me llamo = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["Hola"], exemplar: "¡Hola! Me llamo Lan.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Me ll...", acceptedPatterns: [{ requiredFragments: ["llamo"] }], answerHintVi: "Me llamo" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Me llamo",
        plausibleDistractors: [{ text: "Me gusta", errorType: "L1 Transfer", explanationVi: "Me llamo = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["Hola"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm ll"],
    },
    {
      id: 'es-survival-2', language: 'es', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Barcelona.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Perdone, ¿dónde está la estación?", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "Siga recto.", vi: "Đi thẳng." },
      ],
      chunks: [
        { text: "¿Dónde está...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Đôn-đê ét-ta" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Bắt đầu bằng Perdone." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["¿Dónde está?", "¿Qué es?"], correctAnswer: "¿Dónde está?", explanationVi: "Dónde = ở đâu." },
      production: { promptVi: "Hỏi đường đến khách sạn.", requiredSlots: ["hotel"], exemplar: "¿Dónde está el hotel?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "Dónde...", acceptedPatterns: [{ requiredFragments: ["dónde", "está"] }], answerHintVi: "Dónde está" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "¿Dónde está?",
        plausibleDistractors: [{ text: "¿Qué es?", errorType: "L1 Transfer", explanationVi: "Dónde = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến khách sạn.",
        pragmaticGoal: "Hỏi đường đến khách sạn.",
        semanticSlots: ["hotel"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Dấu nhấn trên ó"],
    },
    {
      id: 'es-survival-3', language: 'es', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ ở Mexico City.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "¿Cuánto cuesta esto?", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "Diez pesos.", vi: "10 pesos." },
      ],
      chunks: [
        { text: "¿Cuánto cuesta...?", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Cuan-tô cuết-ta" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["¿Cuánto cuesta?", "¿Cómo es?"], correctAnswer: "¿Cuánto cuesta?", explanationVi: "Cuánto cuesta = bao nhiêu." },
      production: { promptVi: "Hỏi giá áo.", requiredSlots: ["cuesta"], exemplar: "¿Cuánto cuesta esta camisa?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Cuánto...", acceptedPatterns: [{ requiredFragments: ["cuánto", "cuesta"] }], answerHintVi: "Cuánto cuesta" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "¿Cuánto cuesta?",
        plausibleDistractors: [{ text: "¿Cómo es?", errorType: "L1 Transfer", explanationVi: "Cuánto cuesta = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá áo.",
        pragmaticGoal: "Hỏi giá áo.",
        semanticSlots: ["cuesta"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Dấu nhấn"],
    },
    {
      id: 'es-survival-4', language: 'es', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Nhà hàng Tây Ban Nha.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Quisiera una paella, por favor.", vi: "Tôi muốn paella." },
        { speaker: 'B', text: "Por supuesto.", vi: "Dĩ nhiên." },
      ],
      chunks: [
        { text: "Quisiera...", vi: "Tôi muốn...", useWhenVi: "gọi món lịch sự", vietnameseLearnerCueVi: "Ki-siê-ra" },
        { text: "por favor", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "Po fa-vo" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm por favor." },
      comprehension: { promptVi: "Gọi món lịch sự?", options: ["Quisiera", "Quiero"], correctAnswer: "Quisiera", explanationVi: "Quisiera lịch sự hơn." },
      production: { promptVi: "Gọi nước.", requiredSlots: ["agua"], exemplar: "Quisiera agua, por favor.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Quisiera...", acceptedPatterns: [{ requiredFragments: ["quisiera"] }], answerHintVi: "Quisiera" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món lịch sự?",
        correctPragmaticAction: "Quisiera",
        plausibleDistractors: [{ text: "Quiero", errorType: "L1 Transfer", explanationVi: "Quisiera lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi nước.",
        pragmaticGoal: "Gọi nước.",
        semanticSlots: ["agua"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm por favor"],
    },
    {
      id: 'es-survival-5', language: 'es', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Lo siento mucho.", vi: "Tôi rất xin lỗi." },
        { speaker: 'B', text: "No pasa nada.", vi: "Không sao." },
      ],
      chunks: [
        { text: "Lo siento", vi: "Tôi xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Lô siên-tô" },
        { text: "Gracias", vi: "Cảm ơn", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Gra-thiát" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi ngay." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["No pasa nada", "De nada"], correctAnswer: "No pasa nada", explanationVi: "No pasa nada = không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["siento"], exemplar: "Lo siento mucho.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "Lo...", acceptedPatterns: [{ requiredFragments: ["lo", "siento"] }], answerHintVi: "Lo siento" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "No pasa nada",
        plausibleDistractors: [{ text: "De nada", errorType: "L1 Transfer", explanationVi: "No pasa nada = không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["siento"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm siento"],
    },
    {
      id: 'es-survival-6', language: 'es', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "¿Podría tomar una foto, por favor?", vi: "Chụp ảnh giúp tôi được không?" },
        { speaker: 'B', text: "¡Claro que sí!", vi: "Dĩ nhiên!" },
      ],
      chunks: [
        { text: "¿Podría...?", vi: "Bạn có thể...?", useWhenVi: "nhờ vả lịch sự", vietnameseLearnerCueVi: "Pô-đri-a" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng Podría." },
      comprehension: { promptVi: "Nhờ vả lịch sự?", options: ["¿Podría?", "¿Puedes?"], correctAnswer: "¿Podría?", explanationVi: "Podría lịch sự hơn." },
      production: { promptVi: "Nhờ giúp.", requiredSlots: ["ayudar"], exemplar: "¿Podría ayudarme, por favor?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "Podría...", acceptedPatterns: [{ requiredFragments: ["podría"] }], answerHintVi: "Podría" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả lịch sự?",
        correctPragmaticAction: "¿Podría?",
        plausibleDistractors: [{ text: "¿Puedes?", errorType: "L1 Transfer", explanationVi: "Podría lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ giúp.",
        pragmaticGoal: "Nhờ giúp.",
        semanticSlots: ["ayudar"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm por favor"],
    },
    {
      id: 'es-survival-7', language: 'es', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "¡Ayuda, por favor!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "Necesito un médico.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "¡Ayuda, por favor!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["¡Ayuda, por favor!", "Necesito un médico."], correctAnswer: "¡Ayuda, por favor!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "¡Ayuda, por favor!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "¡Ayuda, por favor!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "¡Ayuda, por favor!",
        plausibleDistractors: [{ text: "Necesito un médico.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-8', language: 'es', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "Al aeropuerto, por favor.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "¿Cuánto cuesta hasta la estación?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "Al aeropuerto, por favor.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Al aeropuerto, por favor.", "¿Cuánto cuesta hasta la estación?"], correctAnswer: "Al aeropuerto, por favor.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Al aeropuerto, por favor.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Al aeropuerto, por favor." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Al aeropuerto, por favor.",
        plausibleDistractors: [{ text: "¿Cuánto cuesta hasta la estación?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-9', language: 'es', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "Tengo una reserva.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "La llave de mi habitación, por favor.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "Tengo una reserva.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tengo una reserva.", "La llave de mi habitación, por favor."], correctAnswer: "Tengo una reserva.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tengo una reserva.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tengo una reserva." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tengo una reserva.",
        plausibleDistractors: [{ text: "La llave de mi habitación, por favor.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-10', language: 'es', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "¿Qué hora es?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "Son las 5.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "¿Qué hora es?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["¿Qué hora es?", "Son las 5."], correctAnswer: "¿Qué hora es?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "¿Qué hora es?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "¿Qué hora es?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "¿Qué hora es?",
        plausibleDistractors: [{ text: "Son las 5.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-11', language: 'es', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Quiero cambiar dinero.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "¿Dónde está el cajero automático?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Quiero cambiar dinero.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Quiero cambiar dinero.", "¿Dónde está el cajero automático?"], correctAnswer: "Quiero cambiar dinero.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Quiero cambiar dinero.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Quiero cambiar dinero." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Quiero cambiar dinero.",
        plausibleDistractors: [{ text: "¿Dónde está el cajero automático?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-12', language: 'es', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "Tengo dolor de cabeza.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "Necesito medicinas.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "Tengo dolor de cabeza.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tengo dolor de cabeza.", "Necesito medicinas."], correctAnswer: "Tengo dolor de cabeza.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tengo dolor de cabeza.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tengo dolor de cabeza." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tengo dolor de cabeza.",
        plausibleDistractors: [{ text: "Necesito medicinas.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-13', language: 'es', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Hola, ¿quién habla?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Llamaré más tarde.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Hola, ¿quién habla?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Hola, ¿quién habla?", "Llamaré más tarde."], correctAnswer: "Hola, ¿quién habla?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Hola, ¿quién habla?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Hola, ¿quién habla?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Hola, ¿quién habla?",
        plausibleDistractors: [{ text: "Llamaré más tarde.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-14', language: 'es', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "Esto es delicioso.", vi: "Ngon quá." },
        { speaker: 'B', text: "Usted es muy amable.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "Esto es delicioso.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Esto es delicioso.", "Usted es muy amable."], correctAnswer: "Esto es delicioso.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Esto es delicioso.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Esto es delicioso." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Esto es delicioso.",
        plausibleDistractors: [{ text: "Usted es muy amable.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'es-survival-15', language: 'es', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Adiós, hasta luego.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "¡Que tenga un buen día!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Adiós, hasta luego.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Adiós, hasta luego.", "¡Que tenga un buen día!"], correctAnswer: "Adiós, hasta luego.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Adiós, hasta luego.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Adiós, hasta luego." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Adiós, hasta luego.",
        plausibleDistractors: [{ text: "¡Que tenga un buen día!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  it: [
    {
      id: 'it-survival-1', language: 'it', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Ý.",
      scenario: { settingVi: "Gặp bạn mới ở Rome.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "Ciao, mi chiamo Lan.", vi: "Chào, tôi tên Lan." },
        { speaker: 'B', text: "Piacere, Lan.", vi: "Hân hạnh, Lan." },
      ],
      chunks: [
        { text: "Ciao", vi: "Chào", useWhenVi: "chào", vietnameseLearnerCueVi: "Chao" },
        { text: "Mi chiamo...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Mi kia-mô" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Ciao dùng mọi lúc." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Mi chiamo", "Mi piace"], correctAnswer: "Mi chiamo", explanationVi: "Mi chiamo = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["chiamo"], exemplar: "Ciao, mi chiamo Lan.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Mi ch...", acceptedPatterns: [{ requiredFragments: ["chiamo"] }], answerHintVi: "Mi chiamo" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Mi chiamo",
        plausibleDistractors: [{ text: "Mi piace", errorType: "L1 Transfer", explanationVi: "Mi chiamo = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["chiamo"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm ch = k"],
    },
    {
      id: 'it-survival-2', language: 'it', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Florence.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Scusi, dov'è la stazione?", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "Sempre dritto.", vi: "Đi thẳng." },
      ],
      chunks: [
        { text: "Dov'è...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Đô-vè" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Bắt đầu bằng Scusi." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["Dov'è", "Che cosa"], correctAnswer: "Dov'è", explanationVi: "Dov'è = ở đâu." },
      production: { promptVi: "Hỏi đường đến bảo tàng.", requiredSlots: ["museo"], exemplar: "Scusi, dov'è il museo?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "Dov...", acceptedPatterns: [{ requiredFragments: ["dov"] }], answerHintVi: "Dov'è" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "Dov'è",
        plausibleDistractors: [{ text: "Che cosa", errorType: "L1 Transfer", explanationVi: "Dov'è = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến bảo tàng.",
        pragmaticGoal: "Hỏi đường đến bảo tàng.",
        semanticSlots: ["museo"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm dov'è"],
    },
    {
      id: 'it-survival-3', language: 'it', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ ở Rome.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "Quanto costa questo?", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "Cinque euro.", vi: "5 Euro." },
      ],
      chunks: [
        { text: "Quanto costa...?", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Quan-tô cốt-ta" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["Quanto costa", "Come si dice"], correctAnswer: "Quanto costa", explanationVi: "Quanto costa = bao nhiêu." },
      production: { promptVi: "Hỏi giá pizza.", requiredSlots: ["costa"], exemplar: "Quanto costa questa pizza?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Quanto...", acceptedPatterns: [{ requiredFragments: ["quanto", "costa"] }], answerHintVi: "Quanto costa" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "Quanto costa",
        plausibleDistractors: [{ text: "Come si dice", errorType: "L1 Transfer", explanationVi: "Quanto costa = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá pizza.",
        pragmaticGoal: "Hỏi giá pizza.",
        semanticSlots: ["costa"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm qu"],
    },
    {
      id: 'it-survival-4', language: 'it', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Nhà hàng ở Italia.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Vorrei una pizza margherita, per favore.", vi: "Tôi muốn pizza margherita." },
        { speaker: 'B', text: "Certo!", vi: "Được!" },
      ],
      chunks: [
        { text: "Vorrei...", vi: "Tôi muốn...", useWhenVi: "gọi món lịch sự", vietnameseLearnerCueVi: "Vo-rây" },
        { text: "per favore", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "Pe fa-vô-rê" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm per favore." },
      comprehension: { promptVi: "Gọi món lịch sự?", options: ["Vorrei", "Voglio"], correctAnswer: "Vorrei", explanationVi: "Vorrei lịch sự hơn." },
      production: { promptVi: "Gọi pasta.", requiredSlots: ["pasta"], exemplar: "Vorrei la pasta, per favore.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Vorrei...", acceptedPatterns: [{ requiredFragments: ["vorrei"] }], answerHintVi: "Vorrei" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món lịch sự?",
        correctPragmaticAction: "Vorrei",
        plausibleDistractors: [{ text: "Voglio", errorType: "L1 Transfer", explanationVi: "Vorrei lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi pasta.",
        pragmaticGoal: "Gọi pasta.",
        semanticSlots: ["pasta"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm per favore"],
    },
    {
      id: 'it-survival-5', language: 'it', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Mi scusi, mi dispiace.", vi: "Xin lỗi, tôi rất tiếc." },
        { speaker: 'B', text: "Non c'è problema.", vi: "Không sao." },
      ],
      chunks: [
        { text: "Mi dispiace", vi: "Tôi xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Mi đít-pia-chê" },
        { text: "Grazie mille", vi: "Cảm ơn rất nhiều", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Gra-tsiê mi-lê" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi ngay." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["Non c'è problema", "Prego"], correctAnswer: "Non c'è problema", explanationVi: "Non c'è problema = Không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["dispiace"], exemplar: "Mi dispiace tanto.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "Mi dis...", acceptedPatterns: [{ requiredFragments: ["dispiace"] }], answerHintVi: "Mi dispiace" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "Non c'è problema",
        plausibleDistractors: [{ text: "Prego", errorType: "L1 Transfer", explanationVi: "Non c'è problema = Không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["dispiace"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm dispiace"],
    },
    {
      id: 'it-survival-6', language: 'it', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh ở Colosseum.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Potrebbe fare una foto, per favore?", vi: "Chụp ảnh giúp không?" },
        { speaker: 'B', text: "Certo, con piacere!", vi: "Sẵn lòng!" },
      ],
      chunks: [
        { text: "Potrebbe...?", vi: "Bạn có thể...?", useWhenVi: "nhờ vả lịch sự", vietnameseLearnerCueVi: "Pô-trèb-bê" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng Potrebbe." },
      comprehension: { promptVi: "Nhờ vả lịch sự?", options: ["Potrebbe", "Puoi"], correctAnswer: "Potrebbe", explanationVi: "Potrebbe lịch sự hơn." },
      production: { promptVi: "Nhờ mở cửa.", requiredSlots: ["porta"], exemplar: "Potrebbe aprire la porta?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "Potrebbe...", acceptedPatterns: [{ requiredFragments: ["potrebbe"] }], answerHintVi: "Potrebbe" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả lịch sự?",
        correctPragmaticAction: "Potrebbe",
        plausibleDistractors: [{ text: "Puoi", errorType: "L1 Transfer", explanationVi: "Potrebbe lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ mở cửa.",
        pragmaticGoal: "Nhờ mở cửa.",
        semanticSlots: ["porta"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm per favore"],
    },
    {
      id: 'it-survival-7', language: 'it', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Aiuto, per favore!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "Ho bisogno di un medico.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Aiuto, per favore!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Aiuto, per favore!", "Ho bisogno di un medico."], correctAnswer: "Aiuto, per favore!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Aiuto, per favore!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Aiuto, per favore!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Aiuto, per favore!",
        plausibleDistractors: [{ text: "Ho bisogno di un medico.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-8', language: 'it', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "All'aeroporto, per favore.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "Quanto costa per la stazione?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "All'aeroporto, per favore.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["All'aeroporto, per favore.", "Quanto costa per la stazione?"], correctAnswer: "All'aeroporto, per favore.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "All'aeroporto, per favore.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "All'aeroporto, per favore." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "All'aeroporto, per favore.",
        plausibleDistractors: [{ text: "Quanto costa per la stazione?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-9', language: 'it', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "Ho una prenotazione.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "La chiave della mia camera, per favore.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "Ho una prenotazione.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Ho una prenotazione.", "La chiave della mia camera, per favore."], correctAnswer: "Ho una prenotazione.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Ho una prenotazione.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Ho una prenotazione." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Ho una prenotazione.",
        plausibleDistractors: [{ text: "La chiave della mia camera, per favore.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-10', language: 'it', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "Che ore sono?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "Sono le 5.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "Che ore sono?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Che ore sono?", "Sono le 5."], correctAnswer: "Che ore sono?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Che ore sono?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Che ore sono?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Che ore sono?",
        plausibleDistractors: [{ text: "Sono le 5.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-11', language: 'it', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Voglio cambiare soldi.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "Dov'è il bancomat?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Voglio cambiare soldi.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Voglio cambiare soldi.", "Dov'è il bancomat?"], correctAnswer: "Voglio cambiare soldi.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Voglio cambiare soldi.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Voglio cambiare soldi." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Voglio cambiare soldi.",
        plausibleDistractors: [{ text: "Dov'è il bancomat?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-12', language: 'it', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "Ho mal di testa.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "Ho bisogno di medicine.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "Ho mal di testa.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Ho mal di testa.", "Ho bisogno di medicine."], correctAnswer: "Ho mal di testa.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Ho mal di testa.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Ho mal di testa." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Ho mal di testa.",
        plausibleDistractors: [{ text: "Ho bisogno di medicine.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-13', language: 'it', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Pronto, chi parla?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Richiamerò.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Pronto, chi parla?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Pronto, chi parla?", "Richiamerò."], correctAnswer: "Pronto, chi parla?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Pronto, chi parla?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Pronto, chi parla?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Pronto, chi parla?",
        plausibleDistractors: [{ text: "Richiamerò.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-14', language: 'it', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "È delizioso.", vi: "Ngon quá." },
        { speaker: 'B', text: "Sei molto gentile.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "È delizioso.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["È delizioso.", "Sei molto gentile."], correctAnswer: "È delizioso.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "È delizioso.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "È delizioso." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "È delizioso.",
        plausibleDistractors: [{ text: "Sei molto gentile.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'it-survival-15', language: 'it', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Arrivederci, a dopo.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Buona giornata!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Arrivederci, a dopo.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Arrivederci, a dopo.", "Buona giornata!"], correctAnswer: "Arrivederci, a dopo.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Arrivederci, a dopo.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Arrivederci, a dopo." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Arrivederci, a dopo.",
        plausibleDistractors: [{ text: "Buona giornata!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  pt: [
    {
      id: 'pt-survival-1', language: 'pt', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Bồ Đào Nha.",
      scenario: { settingVi: "Gặp bạn mới ở Lisbon.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "Olá, eu me chamo Lan.", vi: "Chào, tôi tên Lan." },
        { speaker: 'B', text: "Prazer, Lan.", vi: "Hân hạnh, Lan." },
      ],
      chunks: [
        { text: "Olá", vi: "Chào", useWhenVi: "chào", vietnameseLearnerCueVi: "Ô-la" },
        { text: "Eu me chamo...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Ê-u mê sha-mu" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Olá dùng mọi lúc." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Eu me chamo", "Eu tenho"], correctAnswer: "Eu me chamo", explanationVi: "Eu me chamo = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["chamo"], exemplar: "Olá, eu me chamo Lan.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Eu me...", acceptedPatterns: [{ requiredFragments: ["chamo"] }], answerHintVi: "Eu me chamo" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Eu me chamo",
        plausibleDistractors: [{ text: "Eu tenho", errorType: "L1 Transfer", explanationVi: "Eu me chamo = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["chamo"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm ch"],
    },
    {
      id: 'pt-survival-2', language: 'pt', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Rio.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Com licença, onde fica a estação?", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "Em frente.", vi: "Ở phía trước." },
      ],
      chunks: [
        { text: "Onde fica...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Ôn-đê fi-ca" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Com licença để bắt đầu." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["Onde fica", "O que é"], correctAnswer: "Onde fica", explanationVi: "Onde fica = ở đâu." },
      production: { promptVi: "Hỏi đường.", requiredSlots: ["onde"], exemplar: "Onde fica o hotel?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "Onde...", acceptedPatterns: [{ requiredFragments: ["onde", "fica"] }], answerHintVi: "Onde fica" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "Onde fica",
        plausibleDistractors: [{ text: "O que é", errorType: "L1 Transfer", explanationVi: "Onde fica = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường.",
        pragmaticGoal: "Hỏi đường.",
        semanticSlots: ["onde"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm onde"],
    },
    {
      id: 'pt-survival-3', language: 'pt', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ ở São Paulo.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "Quanto custa isso?", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "Dez reais.", vi: "10 reais." },
      ],
      chunks: [
        { text: "Quanto custa...?", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Quan-tu cút-ta" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["Quanto custa", "Como é"], correctAnswer: "Quanto custa", explanationVi: "Quanto custa = bao nhiêu." },
      production: { promptVi: "Hỏi giá.", requiredSlots: ["custa"], exemplar: "Quanto custa esta camiseta?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Quanto...", acceptedPatterns: [{ requiredFragments: ["quanto", "custa"] }], answerHintVi: "Quanto custa" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "Quanto custa",
        plausibleDistractors: [{ text: "Como é", errorType: "L1 Transfer", explanationVi: "Quanto custa = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá.",
        pragmaticGoal: "Hỏi giá.",
        semanticSlots: ["custa"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm custa"],
    },
    {
      id: 'pt-survival-4', language: 'pt', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Nhà hàng ở Brazil.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Eu gostaria de um café, por favor.", vi: "Tôi muốn một ly cà phê." },
        { speaker: 'B', text: "Claro!", vi: "Được!" },
      ],
      chunks: [
        { text: "Eu gostaria de...", vi: "Tôi muốn...", useWhenVi: "gọi món", vietnameseLearnerCueVi: "Ê-u gốt-ta-ri-a đê" },
        { text: "por favor", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "Po fa-vo" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm por favor." },
      comprehension: { promptVi: "Gọi món lịch sự?", options: ["Eu gostaria de", "Eu quero"], correctAnswer: "Eu gostaria de", explanationVi: "Gostaria lịch sự hơn." },
      production: { promptVi: "Gọi nước.", requiredSlots: ["água"], exemplar: "Eu gostaria de água, por favor.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Eu gostaria...", acceptedPatterns: [{ requiredFragments: ["gostaria"] }], answerHintVi: "Eu gostaria" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món lịch sự?",
        correctPragmaticAction: "Eu gostaria de",
        plausibleDistractors: [{ text: "Eu quero", errorType: "L1 Transfer", explanationVi: "Gostaria lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi nước.",
        pragmaticGoal: "Gọi nước.",
        semanticSlots: ["água"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm por favor"],
    },
    {
      id: 'pt-survival-5', language: 'pt', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Desculpe, sinto muito.", vi: "Xin lỗi, tôi rất tiếc." },
        { speaker: 'B', text: "Sem problema.", vi: "Không sao." },
      ],
      chunks: [
        { text: "Desculpe", vi: "Xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Đét-cun-pê" },
        { text: "Obrigado/a", vi: "Cảm ơn", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Ô-bri-ga-đu" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi nhanh." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["Sem problema", "De nada"], correctAnswer: "Sem problema", explanationVi: "Sem problema = không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["desculpe"], exemplar: "Desculpe, sinto muito.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "Desculpe...", acceptedPatterns: [{ requiredFragments: ["desculpe"] }], answerHintVi: "Desculpe" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "Sem problema",
        plausibleDistractors: [{ text: "De nada", errorType: "L1 Transfer", explanationVi: "Sem problema = không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["desculpe"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm desculpe"],
    },
    {
      id: 'pt-survival-6', language: 'pt', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Poderia tirar uma foto, por favor?", vi: "Chụp ảnh giúp tôi?" },
        { speaker: 'B', text: "Claro que sim!", vi: "Dĩ nhiên!" },
      ],
      chunks: [
        { text: "Poderia...?", vi: "Bạn có thể...?", useWhenVi: "nhờ vả lịch sự", vietnameseLearnerCueVi: "Pô-đê-ri-a" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng Poderia." },
      comprehension: { promptVi: "Nhờ vả lịch sự?", options: ["Poderia", "Pode"], correctAnswer: "Poderia", explanationVi: "Poderia lịch sự hơn." },
      production: { promptVi: "Nhờ mở cửa.", requiredSlots: ["porta"], exemplar: "Poderia abrir a porta?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "Poderia...", acceptedPatterns: [{ requiredFragments: ["poderia"] }], answerHintVi: "Poderia" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả lịch sự?",
        correctPragmaticAction: "Poderia",
        plausibleDistractors: [{ text: "Pode", errorType: "L1 Transfer", explanationVi: "Poderia lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ mở cửa.",
        pragmaticGoal: "Nhờ mở cửa.",
        semanticSlots: ["porta"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm por favor"],
    },
    {
      id: 'pt-survival-7', language: 'pt', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Socorro, por favor!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "Preciso de um médico.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Socorro, por favor!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Socorro, por favor!", "Preciso de um médico."], correctAnswer: "Socorro, por favor!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Socorro, por favor!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Socorro, por favor!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Socorro, por favor!",
        plausibleDistractors: [{ text: "Preciso de um médico.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-8', language: 'pt', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "Para o aeroporto, por favor.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "Quanto custa para a estação?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "Para o aeroporto, por favor.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Para o aeroporto, por favor.", "Quanto custa para a estação?"], correctAnswer: "Para o aeroporto, por favor.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Para o aeroporto, por favor.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Para o aeroporto, por favor." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Para o aeroporto, por favor.",
        plausibleDistractors: [{ text: "Quanto custa para a estação?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-9', language: 'pt', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "Tenho uma reserva.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "A chave do meu quarto, por favor.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "Tenho uma reserva.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tenho uma reserva.", "A chave do meu quarto, por favor."], correctAnswer: "Tenho uma reserva.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tenho uma reserva.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tenho uma reserva." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tenho uma reserva.",
        plausibleDistractors: [{ text: "A chave do meu quarto, por favor.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-10', language: 'pt', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "Que horas são?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "São 5 horas.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "Que horas são?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Que horas são?", "São 5 horas."], correctAnswer: "Que horas são?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Que horas são?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Que horas são?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Que horas são?",
        plausibleDistractors: [{ text: "São 5 horas.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-11', language: 'pt', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Quero trocar dinheiro.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "Onde fica o caixa eletrônico?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Quero trocar dinheiro.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Quero trocar dinheiro.", "Onde fica o caixa eletrônico?"], correctAnswer: "Quero trocar dinheiro.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Quero trocar dinheiro.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Quero trocar dinheiro." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Quero trocar dinheiro.",
        plausibleDistractors: [{ text: "Onde fica o caixa eletrônico?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-12', language: 'pt', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "Estou com dor de cabeça.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "Preciso de remédio.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "Estou com dor de cabeça.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Estou com dor de cabeça.", "Preciso de remédio."], correctAnswer: "Estou com dor de cabeça.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Estou com dor de cabeça.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Estou com dor de cabeça." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Estou com dor de cabeça.",
        plausibleDistractors: [{ text: "Preciso de remédio.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-13', language: 'pt', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Alô, quem está falando?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Ligo de volta.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Alô, quem está falando?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Alô, quem está falando?", "Ligo de volta."], correctAnswer: "Alô, quem está falando?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Alô, quem está falando?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Alô, quem está falando?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Alô, quem está falando?",
        plausibleDistractors: [{ text: "Ligo de volta.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-14', language: 'pt', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "Isso é delicioso.", vi: "Ngon quá." },
        { speaker: 'B', text: "Você é muito gentil.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "Isso é delicioso.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Isso é delicioso.", "Você é muito gentil."], correctAnswer: "Isso é delicioso.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Isso é delicioso.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Isso é delicioso." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Isso é delicioso.",
        plausibleDistractors: [{ text: "Você é muito gentil.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'pt-survival-15', language: 'pt', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Adeus, até logo.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Tenha um bom dia!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Adeus, até logo.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Adeus, até logo.", "Tenha um bom dia!"], correctAnswer: "Adeus, até logo.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Adeus, até logo.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Adeus, até logo." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Adeus, até logo.",
        plausibleDistractors: [{ text: "Tenha um bom dia!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  ru: [
    {
      id: 'ru-survival-1', language: 'ru', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Nga.",
      scenario: { settingVi: "Gặp bạn mới ở Moscow.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "Здравствуйте, меня зовут Лан.", vi: "Xin chào, tôi tên Lan." },
        { speaker: 'B', text: "Очень приятно. Я Иван.", vi: "Rất vui. Tôi là Ivan." },
      ],
      chunks: [
        { text: "Здравствуйте", vi: "Xin chào", useWhenVi: "chào lịch sự", vietnameseLearnerCueVi: "Zdra-stvui-chê" },
        { text: "Меня зовут...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Mi-nha za-vút" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Здравствуйте trang trọng, Привет thân mật." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Меня зовут", "У меня есть"], correctAnswer: "Меня зовут", explanationVi: "Меня зовут = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["зовут"], exemplar: "Здравствуйте, меня зовут Лан.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Меня з...", acceptedPatterns: [{ requiredFragments: ["зовут"] }], answerHintVi: "Меня зовут" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Меня зовут",
        plausibleDistractors: [{ text: "У меня есть", errorType: "L1 Transfer", explanationVi: "Меня зовут = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["зовут"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm Здравствуйте"],
    },
    {
      id: 'ru-survival-2', language: 'ru', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Saint Petersburg.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Извините, где вокзал?", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "Прямо, потом налево.", vi: "Đi thẳng, rồi rẽ trái." },
      ],
      chunks: [
        { text: "Где...?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Gdê" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Bắt đầu bằng Извините." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["Где", "Что"], correctAnswer: "Где", explanationVi: "Где = ở đâu." },
      production: { promptVi: "Hỏi đường đến metro.", requiredSlots: ["метро"], exemplar: "Извините, где метро?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi đường.", cueVi: "Где...", acceptedPatterns: [{ requiredFragments: ["где"] }], answerHintVi: "Где" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "Где",
        plausibleDistractors: [{ text: "Что", errorType: "L1 Transfer", explanationVi: "Где = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường đến metro.",
        pragmaticGoal: "Hỏi đường đến metro.",
        semanticSlots: ["метро"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm Где"],
    },
    {
      id: 'ru-survival-3', language: 'ru', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ ở Moscow.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "Сколько это стоит?", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "Сто рублей.", vi: "100 rúp." },
      ],
      chunks: [
        { text: "Сколько стоит...?", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Scôn-ka stô-it" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["Сколько стоит", "Как дела"], correctAnswer: "Сколько стоит", explanationVi: "Сколько стоит = bao nhiêu." },
      production: { promptVi: "Hỏi giá.", requiredSlots: ["стоит"], exemplar: "Сколько стоит эта книга?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Сколько...", acceptedPatterns: [{ requiredFragments: ["сколько", "стоит"] }], answerHintVi: "Сколько стоит" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "Сколько стоит",
        plausibleDistractors: [{ text: "Как дела", errorType: "L1 Transfer", explanationVi: "Сколько стоит = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá.",
        pragmaticGoal: "Hỏi giá.",
        semanticSlots: ["стоит"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm сколько"],
    },
    {
      id: 'ru-survival-4', language: 'ru', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Nhà hàng Nga.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Я бы хотел борщ, пожалуйста.", vi: "Tôi muốn borscht." },
        { speaker: 'B', text: "Конечно!", vi: "Dĩ nhiên!" },
      ],
      chunks: [
        { text: "Я бы хотел...", vi: "Tôi muốn...", useWhenVi: "gọi món lịch sự", vietnameseLearnerCueVi: "Ya bư kha-chel" },
        { text: "пожалуйста", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "Pa-zha-lus-ta" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm пожалуйста." },
      comprehension: { promptVi: "Gọi món lịch sự?", options: ["Я бы хотел", "Я хочу"], correctAnswer: "Я бы хотел", explanationVi: "Я бы хотел lịch sự hơn." },
      production: { promptVi: "Gọi trà.", requiredSlots: ["чай"], exemplar: "Я бы хотел чай, пожалуйста.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Я бы...", acceptedPatterns: [{ requiredFragments: ["хотел"] }], answerHintVi: "Я бы хотел" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món lịch sự?",
        correctPragmaticAction: "Я бы хотел",
        plausibleDistractors: [{ text: "Я хочу", errorType: "L1 Transfer", explanationVi: "Я бы хотел lịch sự hơn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi trà.",
        pragmaticGoal: "Gọi trà.",
        semanticSlots: ["чай"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm пожалуйста"],
    },
    {
      id: 'ru-survival-5', language: 'ru', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Простите, мне очень жаль.", vi: "Xin lỗi, tôi rất tiếc." },
        { speaker: 'B', text: "Ничего страшного.", vi: "Không sao." },
      ],
      chunks: [
        { text: "Простите", vi: "Xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Pra-sti-chê" },
        { text: "Спасибо", vi: "Cảm ơn", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Spa-si-ba" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi nhanh." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["Ничего страшного", "Не за что"], correctAnswer: "Ничего страшного", explanationVi: "Ничего страшного = Không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["простите"], exemplar: "Простите, пожалуйста.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "Простите...", acceptedPatterns: [{ requiredFragments: ["простите"] }], answerHintVi: "Простите" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "Ничего страшного",
        plausibleDistractors: [{ text: "Не за что", errorType: "L1 Transfer", explanationVi: "Ничего страшного = Không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["простите"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm простите"],
    },
    {
      id: 'ru-survival-6', language: 'ru', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh ở Quảng trường Đỏ.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Не могли бы вы сфотографировать?", vi: "Chụp ảnh giúp được không?" },
        { speaker: 'B', text: "Конечно!", vi: "Dĩ nhiên!" },
      ],
      chunks: [
        { text: "Не могли бы вы...?", vi: "Bạn có thể...?", useWhenVi: "nhờ vả lịch sự", vietnameseLearnerCueVi: "Nê mog-li bư vư" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng Не могли бы вы." },
      comprehension: { promptVi: "Nhờ vả lịch sự?", options: ["Не могли бы вы", "Ты можешь"], correctAnswer: "Не могли бы вы", explanationVi: "Lịch sự nhất." },
      production: { promptVi: "Nhờ giúp.", requiredSlots: ["помочь"], exemplar: "Не могли бы вы мне помочь?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "Не могли...", acceptedPatterns: [{ requiredFragments: ["могли", "бы"] }], answerHintVi: "Не могли бы вы" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả lịch sự?",
        correctPragmaticAction: "Не могли бы вы",
        plausibleDistractors: [{ text: "Ты можешь", errorType: "L1 Transfer", explanationVi: "Lịch sự nhất." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ giúp.",
        pragmaticGoal: "Nhờ giúp.",
        semanticSlots: ["помочь"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm пожалуйста"],
    },
    {
      id: 'ru-survival-7', language: 'ru', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Помогите, пожалуйста!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "Мне нужен врач.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Помогите, пожалуйста!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Помогите, пожалуйста!", "Мне нужен врач."], correctAnswer: "Помогите, пожалуйста!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Помогите, пожалуйста!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Помогите, пожалуйста!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Помогите, пожалуйста!",
        plausibleDistractors: [{ text: "Мне нужен врач.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-8', language: 'ru', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "В аэропорт, пожалуйста.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "Сколько стоит до вокзала?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "В аэропорт, пожалуйста.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["В аэропорт, пожалуйста.", "Сколько стоит до вокзала?"], correctAnswer: "В аэропорт, пожалуйста.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "В аэропорт, пожалуйста.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "В аэропорт, пожалуйста." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "В аэропорт, пожалуйста.",
        plausibleDistractors: [{ text: "Сколько стоит до вокзала?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-9', language: 'ru', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "У меня есть бронь.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "Ключ от моей комнаты, пожалуйста.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "У меня есть бронь.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["У меня есть бронь.", "Ключ от моей комнаты, пожалуйста."], correctAnswer: "У меня есть бронь.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "У меня есть бронь.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "У меня есть бронь." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "У меня есть бронь.",
        plausibleDistractors: [{ text: "Ключ от моей комнаты, пожалуйста.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-10', language: 'ru', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "Который час?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "Сейчас 5 часов.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "Который час?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Который час?", "Сейчас 5 часов."], correctAnswer: "Который час?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Который час?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Который час?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Который час?",
        plausibleDistractors: [{ text: "Сейчас 5 часов.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-11', language: 'ru', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Я хочу обменять деньги.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "Где банкомат?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Я хочу обменять деньги.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Я хочу обменять деньги.", "Где банкомат?"], correctAnswer: "Я хочу обменять деньги.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Я хочу обменять деньги.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Я хочу обменять деньги." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Я хочу обменять деньги.",
        plausibleDistractors: [{ text: "Где банкомат?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-12', language: 'ru', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "У меня болит голова.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "Мне нужны лекарства.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "У меня болит голова.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["У меня болит голова.", "Мне нужны лекарства."], correctAnswer: "У меня болит голова.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "У меня болит голова.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "У меня болит голова." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "У меня болит голова.",
        plausibleDistractors: [{ text: "Мне нужны лекарства.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-13', language: 'ru', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Алло, кто говорит?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Я перезвоню.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Алло, кто говорит?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Алло, кто говорит?", "Я перезвоню."], correctAnswer: "Алло, кто говорит?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Алло, кто говорит?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Алло, кто говорит?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Алло, кто говорит?",
        plausibleDistractors: [{ text: "Я перезвоню.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-14', language: 'ru', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "Это очень вкусно.", vi: "Ngon quá." },
        { speaker: 'B', text: "Вы очень добры.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "Это очень вкусно.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Это очень вкусно.", "Вы очень добры."], correctAnswer: "Это очень вкусно.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Это очень вкусно.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Это очень вкусно." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Это очень вкусно.",
        plausibleDistractors: [{ text: "Вы очень добры.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ru-survival-15', language: 'ru', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "До свидания, до скорого.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Хорошего дня!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "До свидания, до скорого.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["До свидания, до скорого.", "Хорошего дня!"], correctAnswer: "До свидания, до скорого.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "До свидания, до скорого.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "До свидания, до скорого." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "До свидания, до скорого.",
        plausibleDistractors: [{ text: "Хорошего дня!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  vi: [
    {
      id: 'vi-survival-1', language: 'vi', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Việt.",
      scenario: { settingVi: "Gặp người mới ở Hà Nội.", roles: ["Bạn", "Người mới"] },
      dialogue: [
        { speaker: 'A', text: "Xin chào, tôi tên là Lan.", vi: "Xin chào, tôi tên là Lan." },
        { speaker: 'B', text: "Rất vui được gặp bạn.", vi: "Rất vui được gặp bạn." },
      ],
      chunks: [
        { text: "Xin chào", vi: "Xin chào", useWhenVi: "chào lịch sự", vietnameseLearnerCueVi: "Sin jào" },
        { text: "Tôi tên là...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Toy ten là" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Xin chào dùng mọi lúc." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["Tôi tên là", "Tôi có"], correctAnswer: "Tôi tên là", explanationVi: "Tôi tên là + tên." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["tên"], exemplar: "Xin chào, tôi tên là John.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "Tôi...", acceptedPatterns: [{ requiredFragments: ["tên", "là"] }], answerHintVi: "Tôi tên là" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "Tôi tên là",
        plausibleDistractors: [{ text: "Tôi có", errorType: "L1 Transfer", explanationVi: "Tôi tên là + tên." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["tên"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu"],
    },
    {
      id: 'vi-survival-2', language: 'vi', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Sài Gòn.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "Xin lỗi, bưu điện ở đâu ạ?", vi: "Xin lỗi, bưu điện ở đâu ạ?" },
        { speaker: 'B', text: "Đi thẳng rồi rẽ phải.", vi: "Đi thẳng rồi rẽ phải." },
      ],
      chunks: [
        { text: "...ở đâu?", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Ưr đâu" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Thêm ạ cho lịch sự." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["ở đâu", "cái gì"], correctAnswer: "ở đâu", explanationVi: "Ở đâu = where." },
      production: { promptVi: "Hỏi đường.", requiredSlots: ["ở đâu"], exemplar: "Nhà hàng ở đâu ạ?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "...ở...", acceptedPatterns: [{ requiredFragments: ["ở", "đâu"] }], answerHintVi: "ở đâu" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "ở đâu",
        plausibleDistractors: [{ text: "cái gì", errorType: "L1 Transfer", explanationVi: "Ở đâu = where." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường.",
        pragmaticGoal: "Hỏi đường.",
        semanticSlots: ["ở đâu"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu đâu"],
    },
    {
      id: 'vi-survival-3', language: 'vi', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ Bến Thành.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "Cái này bao nhiêu tiền?", vi: "Cái này bao nhiêu tiền?" },
        { speaker: 'B', text: "Năm mươi nghìn đồng.", vi: "50,000 đồng." },
      ],
      chunks: [
        { text: "Bao nhiêu tiền?", vi: "Bao nhiêu tiền?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Bao nhiu tien" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["Bao nhiêu tiền", "Ở đâu"], correctAnswer: "Bao nhiêu tiền", explanationVi: "Bao nhiêu tiền = how much." },
      production: { promptVi: "Hỏi giá.", requiredSlots: ["bao nhiêu"], exemplar: "Cái áo này bao nhiêu tiền?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "Bao...", acceptedPatterns: [{ requiredFragments: ["bao", "nhiêu"] }], answerHintVi: "Bao nhiêu tiền" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "Bao nhiêu tiền",
        plausibleDistractors: [{ text: "Ở đâu", errorType: "L1 Transfer", explanationVi: "Bao nhiêu tiền = how much." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá.",
        pragmaticGoal: "Hỏi giá.",
        semanticSlots: ["bao nhiêu"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu nhiêu"],
    },
    {
      id: 'vi-survival-4', language: 'vi', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Quán phở.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "Cho tôi một tô phở bò.", vi: "Cho tôi một tô phở bò." },
        { speaker: 'B', text: "Dạ, được ạ.", vi: "Vâng, được ạ." },
      ],
      chunks: [
        { text: "Cho tôi...", vi: "Cho tôi...", useWhenVi: "gọi món", vietnameseLearnerCueVi: "Cho toy" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Dùng Cho tôi để gọi." },
      comprehension: { promptVi: "Gọi món?", options: ["Cho tôi", "Tôi có"], correctAnswer: "Cho tôi", explanationVi: "Cho tôi = give me." },
      production: { promptVi: "Gọi cà phê.", requiredSlots: ["cà phê"], exemplar: "Cho tôi một ly cà phê sữa đá.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "Cho...", acceptedPatterns: [{ requiredFragments: ["cho", "tôi"] }], answerHintVi: "Cho tôi" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món?",
        correctPragmaticAction: "Cho tôi",
        plausibleDistractors: [{ text: "Tôi có", errorType: "L1 Transfer", explanationVi: "Cho tôi = give me." }]
      },
      generativeSimulation: {
        promptVi: "Gọi cà phê.",
        pragmaticGoal: "Gọi cà phê.",
        semanticSlots: ["cà phê"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu"],
    },
    {
      id: 'vi-survival-5', language: 'vi', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Xin lỗi anh/chị.", vi: "Xin lỗi anh/chị." },
        { speaker: 'B', text: "Không sao đâu.", vi: "Không sao đâu." },
      ],
      chunks: [
        { text: "Xin lỗi", vi: "Xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Sin lôi" },
        { text: "Cảm ơn", vi: "Cảm ơn", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Cam ưn" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi ngay." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["Không sao", "Cảm ơn"], correctAnswer: "Không sao", explanationVi: "Không sao = it's okay." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["xin lỗi"], exemplar: "Xin lỗi, tôi không cố ý.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "Xin...", acceptedPatterns: [{ requiredFragments: ["xin", "lỗi"] }], answerHintVi: "Xin lỗi" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "Không sao",
        plausibleDistractors: [{ text: "Cảm ơn", errorType: "L1 Transfer", explanationVi: "Không sao = it's okay." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["xin lỗi"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu lỗi"],
    },
    {
      id: 'vi-survival-6', language: 'vi', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh ở Hội An.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "Anh/Chị ơi, chụp ảnh giúp tôi được không?", vi: "Chụp ảnh giúp tôi được không?" },
        { speaker: 'B', text: "Được chứ!", vi: "Được chứ!" },
      ],
      chunks: [
        { text: "...giúp tôi được không?", vi: "...giúp tôi được không?", useWhenVi: "nhờ vả", vietnameseLearnerCueVi: "Giúp toy đươk không" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Thêm anh/chị ơi." },
      comprehension: { promptVi: "Nhờ vả?", options: ["giúp tôi được không", "tôi muốn"], correctAnswer: "giúp tôi được không", explanationVi: "Giúp tôi được không = can you help me." },
      production: { promptVi: "Nhờ giúp.", requiredSlots: ["giúp"], exemplar: "Giúp tôi mở cửa được không?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "giúp...", acceptedPatterns: [{ requiredFragments: ["giúp", "tôi"] }], answerHintVi: "giúp tôi" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả?",
        correctPragmaticAction: "giúp tôi được không",
        plausibleDistractors: [{ text: "tôi muốn", errorType: "L1 Transfer", explanationVi: "Giúp tôi được không = can you help me." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ giúp.",
        pragmaticGoal: "Nhờ giúp.",
        semanticSlots: ["giúp"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu giúp"],
    },
    {
      id: 'vi-survival-7', language: 'vi', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "Cứu tôi với!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "Tôi cần bác sĩ.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "Cứu tôi với!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Cứu tôi với!", "Tôi cần bác sĩ."], correctAnswer: "Cứu tôi với!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Cứu tôi với!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Cứu tôi với!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Cứu tôi với!",
        plausibleDistractors: [{ text: "Tôi cần bác sĩ.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-8', language: 'vi', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "Đến sân bay nhé.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "Đến ga bao nhiêu tiền?", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "Đến sân bay nhé.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Đến sân bay nhé.", "Đến ga bao nhiêu tiền?"], correctAnswer: "Đến sân bay nhé.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Đến sân bay nhé.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Đến sân bay nhé." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Đến sân bay nhé.",
        plausibleDistractors: [{ text: "Đến ga bao nhiêu tiền?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-9', language: 'vi', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "Tôi có đặt phòng.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "Cho tôi chìa khóa phòng.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "Tôi có đặt phòng.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tôi có đặt phòng.", "Cho tôi chìa khóa phòng."], correctAnswer: "Tôi có đặt phòng.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tôi có đặt phòng.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tôi có đặt phòng." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tôi có đặt phòng.",
        plausibleDistractors: [{ text: "Cho tôi chìa khóa phòng.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-10', language: 'vi', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "Mấy giờ rồi?", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "Bây giờ là 5 giờ.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "Mấy giờ rồi?", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Mấy giờ rồi?", "Bây giờ là 5 giờ."], correctAnswer: "Mấy giờ rồi?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Mấy giờ rồi?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Mấy giờ rồi?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Mấy giờ rồi?",
        plausibleDistractors: [{ text: "Bây giờ là 5 giờ.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-11', language: 'vi', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "Tôi muốn đổi tiền.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "ATM ở đâu?", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "Tôi muốn đổi tiền.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tôi muốn đổi tiền.", "ATM ở đâu?"], correctAnswer: "Tôi muốn đổi tiền.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tôi muốn đổi tiền.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tôi muốn đổi tiền." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tôi muốn đổi tiền.",
        plausibleDistractors: [{ text: "ATM ở đâu?", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-12', language: 'vi', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "Tôi bị đau đầu.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "Tôi cần mua thuốc.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "Tôi bị đau đầu.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tôi bị đau đầu.", "Tôi cần mua thuốc."], correctAnswer: "Tôi bị đau đầu.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tôi bị đau đầu.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tôi bị đau đầu." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tôi bị đau đầu.",
        plausibleDistractors: [{ text: "Tôi cần mua thuốc.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-13', language: 'vi', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "Alo, ai đó?", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "Tôi sẽ gọi lại.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "Alo, ai đó?", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Alo, ai đó?", "Tôi sẽ gọi lại."], correctAnswer: "Alo, ai đó?", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Alo, ai đó?", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Alo, ai đó?" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Alo, ai đó?",
        plausibleDistractors: [{ text: "Tôi sẽ gọi lại.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-14', language: 'vi', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "Ngon quá.", vi: "Ngon quá." },
        { speaker: 'B', text: "Bạn rất tốt.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "Ngon quá.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Ngon quá.", "Bạn rất tốt."], correctAnswer: "Ngon quá.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Ngon quá.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Ngon quá." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Ngon quá.",
        plausibleDistractors: [{ text: "Bạn rất tốt.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'vi-survival-15', language: 'vi', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "Tạm biệt, hẹn gặp lại.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "Chúc một ngày tốt lành!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "Tạm biệt, hẹn gặp lại.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["Tạm biệt, hẹn gặp lại.", "Chúc một ngày tốt lành!"], correctAnswer: "Tạm biệt, hẹn gặp lại.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "Tạm biệt, hẹn gặp lại.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "Tạm biệt, hẹn gặp lại." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "Tạm biệt, hẹn gặp lại.",
        plausibleDistractors: [{ text: "Chúc một ngày tốt lành!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  th: [
    {
      id: 'th-survival-1', language: 'th', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Thái.",
      scenario: { settingVi: "Gặp bạn mới ở Bangkok.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "สวัสดีค่ะ ฉันชื่อลัน", vi: "Xin chào, tôi tên Lan." },
        { speaker: 'B', text: "ยินดีที่ได้รู้จักค่ะ", vi: "Rất vui được quen." },
      ],
      chunks: [
        { text: "สวัสดี", vi: "Xin chào", useWhenVi: "chào", vietnameseLearnerCueVi: "Sa-wàt-đi" },
        { text: "ฉันชื่อ...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Chan chư" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "Thêm ค่ะ/ครับ." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["ฉันชื่อ", "ฉันมี"], correctAnswer: "ฉันชื่อ", explanationVi: "ฉันชื่อ = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["ชื่อ"], exemplar: "สวัสดีค่ะ ฉันชื่อลัน", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "ฉัน...", acceptedPatterns: [{ requiredFragments: ["ชื่อ"] }], answerHintVi: "ฉันชื่อ" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "ฉันชื่อ",
        plausibleDistractors: [{ text: "ฉันมี", errorType: "L1 Transfer", explanationVi: "ฉันชื่อ = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["ชื่อ"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu", "Thêm ค่ะ/ครับ"],
    },
    {
      id: 'th-survival-2', language: 'th', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Chiang Mai.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "ขอโทษค่ะ สถานีรถไฟอยู่ที่ไหนคะ", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "ตรงไปค่ะ", vi: "Đi thẳng." },
      ],
      chunks: [
        { text: "...อยู่ที่ไหน", vi: "...ở đâu", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Yu thi nai" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Bắt đầu bằng ขอโทษ." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["อยู่ที่ไหน", "อะไร"], correctAnswer: "อยู่ที่ไหน", explanationVi: "อยู่ที่ไหน = ở đâu." },
      production: { promptVi: "Hỏi đường.", requiredSlots: ["ที่ไหน"], exemplar: "ห้องน้ำอยู่ที่ไหนคะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "อยู่...", acceptedPatterns: [{ requiredFragments: ["ที่ไหน"] }], answerHintVi: "อยู่ที่ไหน" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "อยู่ที่ไหน",
        plausibleDistractors: [{ text: "อะไร", errorType: "L1 Transfer", explanationVi: "อยู่ที่ไหน = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường.",
        pragmaticGoal: "Hỏi đường.",
        semanticSlots: ["ที่ไหน"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu"],
    },
    {
      id: 'th-survival-3', language: 'th', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Chợ đêm Bangkok.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "อันนี้เท่าไหร่คะ", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "ร้อยบาทค่ะ", vi: "100 Baht." },
      ],
      chunks: [
        { text: "เท่าไหร่", vi: "Bao nhiêu", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Thao rai" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["เท่าไหร่", "ที่ไหน"], correctAnswer: "เท่าไหร่", explanationVi: "เท่าไหร่ = bao nhiêu." },
      production: { promptVi: "Hỏi giá.", requiredSlots: ["เท่าไหร่"], exemplar: "อันนี้เท่าไหร่คะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "เท่า...", acceptedPatterns: [{ requiredFragments: ["เท่าไหร่"] }], answerHintVi: "เท่าไหร่" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "เท่าไหร่",
        plausibleDistractors: [{ text: "ที่ไหน", errorType: "L1 Transfer", explanationVi: "เท่าไหร่ = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá.",
        pragmaticGoal: "Hỏi giá.",
        semanticSlots: ["เท่าไหร่"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu"],
    },
    {
      id: 'th-survival-4', language: 'th', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Quán ăn đường phố.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "ขอผัดไทยหนึ่งจานค่ะ", vi: "Cho tôi một đĩa Pad Thai." },
        { speaker: 'B', text: "ได้ค่ะ", vi: "Được ạ." },
      ],
      chunks: [
        { text: "ขอ...หนึ่ง...", vi: "Cho tôi một...", useWhenVi: "gọi món", vietnameseLearnerCueVi: "Khó...nung..." },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Dùng ขอ để gọi." },
      comprehension: { promptVi: "Gọi món?", options: ["ขอ", "มี"], correctAnswer: "ขอ", explanationVi: "ขอ = xin cho." },
      production: { promptVi: "Gọi cơm.", requiredSlots: ["ข้าว"], exemplar: "ขอข้าวผัดหนึ่งจานค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "ขอ...", acceptedPatterns: [{ requiredFragments: ["ขอ"] }], answerHintVi: "ขอ" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món?",
        correctPragmaticAction: "ขอ",
        plausibleDistractors: [{ text: "มี", errorType: "L1 Transfer", explanationVi: "ขอ = xin cho." }]
      },
      generativeSimulation: {
        promptVi: "Gọi cơm.",
        pragmaticGoal: "Gọi cơm.",
        semanticSlots: ["ข้าว"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm ค่ะ/ครับ"],
    },
    {
      id: 'th-survival-5', language: 'th', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "ขอโทษค่ะ", vi: "Xin lỗi." },
        { speaker: 'B', text: "ไม่เป็นไรค่ะ", vi: "Không sao." },
      ],
      chunks: [
        { text: "ขอโทษ", vi: "Xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Khó-thôt" },
        { text: "ขอบคุณ", vi: "Cảm ơn", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Khóp-khun" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi nhanh." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["ไม่เป็นไร", "ขอบคุณ"], correctAnswer: "ไม่เป็นไร", explanationVi: "ไม่เป็นไร = không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["ขอโทษ"], exemplar: "ขอโทษค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "ขอ...", acceptedPatterns: [{ requiredFragments: ["ขอโทษ"] }], answerHintVi: "ขอโทษ" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "ไม่เป็นไร",
        plausibleDistractors: [{ text: "ขอบคุณ", errorType: "L1 Transfer", explanationVi: "ไม่เป็นไร = không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["ขอโทษ"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thanh điệu"],
    },
    {
      id: 'th-survival-6', language: 'th', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh ở Wat Arun.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "ช่วยถ่ายรูปให้หน่อยได้ไหมคะ", vi: "Chụp ảnh giúp được không?" },
        { speaker: 'B', text: "ได้ค่ะ", vi: "Được ạ." },
      ],
      chunks: [
        { text: "ช่วย...ได้ไหม", vi: "Giúp...được không", useWhenVi: "nhờ vả", vietnameseLearnerCueVi: "Chuai...đai mai" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng ช่วย." },
      comprehension: { promptVi: "Nhờ vả?", options: ["ช่วย...ได้ไหม", "มี...ไหม"], correctAnswer: "ช่วย...ได้ไหม", explanationVi: "ช่วย = giúp." },
      production: { promptVi: "Nhờ giúp.", requiredSlots: ["ช่วย"], exemplar: "ช่วยหน่อยได้ไหมคะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "ช่วย...", acceptedPatterns: [{ requiredFragments: ["ช่วย"] }], answerHintVi: "ช่วย" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả?",
        correctPragmaticAction: "ช่วย...ได้ไหม",
        plausibleDistractors: [{ text: "มี...ไหม", errorType: "L1 Transfer", explanationVi: "ช่วย = giúp." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ giúp.",
        pragmaticGoal: "Nhờ giúp.",
        semanticSlots: ["ช่วย"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm ค่ะ/ครับ"],
    },
    {
      id: 'th-survival-7', language: 'th', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "ช่วยด้วยค่ะ!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "ฉันต้องการหมอ", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "ช่วยด้วยค่ะ!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ช่วยด้วยค่ะ!", "ฉันต้องการหมอ"], correctAnswer: "ช่วยด้วยค่ะ!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ช่วยด้วยค่ะ!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ช่วยด้วยค่ะ!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ช่วยด้วยค่ะ!",
        plausibleDistractors: [{ text: "ฉันต้องการหมอ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-8', language: 'th', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "ไปสนามบินค่ะ", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "ไปสถานีราคาเท่าไหร่คะ", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "ไปสนามบินค่ะ", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ไปสนามบินค่ะ", "ไปสถานีราคาเท่าไหร่คะ"], correctAnswer: "ไปสนามบินค่ะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ไปสนามบินค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ไปสนามบินค่ะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ไปสนามบินค่ะ",
        plausibleDistractors: [{ text: "ไปสถานีราคาเท่าไหร่คะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-9', language: 'th', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "ฉันมีจองไว้ค่ะ", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "ขอกุญแจห้องหน่อยค่ะ", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "ฉันมีจองไว้ค่ะ", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ฉันมีจองไว้ค่ะ", "ขอกุญแจห้องหน่อยค่ะ"], correctAnswer: "ฉันมีจองไว้ค่ะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ฉันมีจองไว้ค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ฉันมีจองไว้ค่ะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ฉันมีจองไว้ค่ะ",
        plausibleDistractors: [{ text: "ขอกุญแจห้องหน่อยค่ะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-10', language: 'th', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "กี่โมงแล้วคะ", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "ห้าโมงค่ะ", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "กี่โมงแล้วคะ", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["กี่โมงแล้วคะ", "ห้าโมงค่ะ"], correctAnswer: "กี่โมงแล้วคะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "กี่โมงแล้วคะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "กี่โมงแล้วคะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "กี่โมงแล้วคะ",
        plausibleDistractors: [{ text: "ห้าโมงค่ะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-11', language: 'th', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "ฉันต้องการแลกเงินค่ะ", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "ตู้เอทีเอ็มอยู่ที่ไหนคะ", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "ฉันต้องการแลกเงินค่ะ", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ฉันต้องการแลกเงินค่ะ", "ตู้เอทีเอ็มอยู่ที่ไหนคะ"], correctAnswer: "ฉันต้องการแลกเงินค่ะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ฉันต้องการแลกเงินค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ฉันต้องการแลกเงินค่ะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ฉันต้องการแลกเงินค่ะ",
        plausibleDistractors: [{ text: "ตู้เอทีเอ็มอยู่ที่ไหนคะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-12', language: 'th', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "ฉันปวดหัวค่ะ", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "ฉันต้องการยาค่ะ", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "ฉันปวดหัวค่ะ", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ฉันปวดหัวค่ะ", "ฉันต้องการยาค่ะ"], correctAnswer: "ฉันปวดหัวค่ะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ฉันปวดหัวค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ฉันปวดหัวค่ะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ฉันปวดหัวค่ะ",
        plausibleDistractors: [{ text: "ฉันต้องการยาค่ะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-13', language: 'th', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "ฮัลโหล ใครพูดคะ", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "เดี๋ยวโทรกลับนะคะ", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "ฮัลโหล ใครพูดคะ", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ฮัลโหล ใครพูดคะ", "เดี๋ยวโทรกลับนะคะ"], correctAnswer: "ฮัลโหล ใครพูดคะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ฮัลโหล ใครพูดคะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ฮัลโหล ใครพูดคะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ฮัลโหล ใครพูดคะ",
        plausibleDistractors: [{ text: "เดี๋ยวโทรกลับนะคะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-14', language: 'th', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "อร่อยมากค่ะ", vi: "Ngon quá." },
        { speaker: 'B', text: "คุณใจดีมากค่ะ", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "อร่อยมากค่ะ", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["อร่อยมากค่ะ", "คุณใจดีมากค่ะ"], correctAnswer: "อร่อยมากค่ะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "อร่อยมากค่ะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "อร่อยมากค่ะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "อร่อยมากค่ะ",
        plausibleDistractors: [{ text: "คุณใจดีมากค่ะ", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'th-survival-15', language: 'th', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "ลาก่อน ไว้เจอกันใหม่นะคะ", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "ขอให้มีวันที่ดีค่ะ!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "ลาก่อน ไว้เจอกันใหม่นะคะ", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["ลาก่อน ไว้เจอกันใหม่นะคะ", "ขอให้มีวันที่ดีค่ะ!"], correctAnswer: "ลาก่อน ไว้เจอกันใหม่นะคะ", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "ลาก่อน ไว้เจอกันใหม่นะคะ", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "ลาก่อน ไว้เจอกันใหม่นะคะ" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "ลาก่อน ไว้เจอกันใหม่นะคะ",
        plausibleDistractors: [{ text: "ขอให้มีวันที่ดีค่ะ!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
  ar: [
    {
      id: 'ar-survival-1', language: 'ar', unit: 1 as RealworldSurvivalUnit, order: 1,
      titleVi: "Chào hỏi & giới thiệu", titleEn: "Greetings and introductions", canDoVi: "Tôi có thể chào bằng tiếng Ả Rập.",
      scenario: { settingVi: "Gặp người mới ở Dubai.", roles: ["Bạn", "Bạn mới"] },
      dialogue: [
        { speaker: 'A', text: "مرحبًا، اسمي لان.", vi: "Xin chào, tôi tên Lan." },
        { speaker: 'B', text: "أهلًا، أنا أحمد.", vi: "Chào, tôi là Ahmed." },
      ],
      chunks: [
        { text: "مرحبًا", vi: "Xin chào", useWhenVi: "chào", vietnameseLearnerCueVi: "Marhaba" },
        { text: "اسمي...", vi: "Tôi tên là...", useWhenVi: "giới thiệu", vietnameseLearnerCueVi: "Ismi" },
      ],
      contextCue: { titleVi: "Gặp gỡ", bodyVi: "مرحبًا dùng mọi lúc." },
      comprehension: { promptVi: "Giới thiệu tên?", options: ["اسمي", "عندي"], correctAnswer: "اسمي", explanationVi: "اسمي = tôi tên là." },
      production: { promptVi: "Giới thiệu.", requiredSlots: ["اسمي"], exemplar: "مرحبًا، اسمي لان.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ giới thiệu.", cueVi: "اسمي...", acceptedPatterns: [{ requiredFragments: ["اسمي"] }], answerHintVi: "اسمي" },
      semanticDiscrimination: {
        scenarioVi: "Giới thiệu tên?",
        correctPragmaticAction: "اسمي",
        plausibleDistractors: [{ text: "عندي", errorType: "L1 Transfer", explanationVi: "اسمي = tôi tên là." }]
      },
      generativeSimulation: {
        promptVi: "Giới thiệu.",
        pragmaticGoal: "Giới thiệu.",
        semanticSlots: ["اسمي"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Viết từ phải sang trái"],
    },
    {
      id: 'ar-survival-2', language: 'ar', unit: 2 as RealworldSurvivalUnit, order: 2,
      titleVi: "Hỏi đường", titleEn: "Asking for directions", canDoVi: "Tôi có thể hỏi đường.",
      scenario: { settingVi: "Lạc đường ở Cairo.", roles: ["Bạn", "Người qua đường"] },
      dialogue: [
        { speaker: 'A', text: "عفوًا، أين المحطة؟", vi: "Xin lỗi, nhà ga ở đâu?" },
        { speaker: 'B', text: "على طول ثم يسار.", vi: "Đi thẳng rồi rẽ trái." },
      ],
      chunks: [
        { text: "أين...؟", vi: "...ở đâu?", useWhenVi: "hỏi địa điểm", vietnameseLearnerCueVi: "Aina" },
      ],
      contextCue: { titleVi: "Hỏi đường", bodyVi: "Bắt đầu bằng عفوًا." },
      comprehension: { promptVi: "Hỏi ở đâu?", options: ["أين", "ماذا"], correctAnswer: "أين", explanationVi: "أين = ở đâu." },
      production: { promptVi: "Hỏi đường.", requiredSlots: ["أين"], exemplar: "عفوًا، أين الفندق؟", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi.", cueVi: "أين...", acceptedPatterns: [{ requiredFragments: ["أين"] }], answerHintVi: "أين" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi ở đâu?",
        correctPragmaticAction: "أين",
        plausibleDistractors: [{ text: "ماذا", errorType: "L1 Transfer", explanationVi: "أين = ở đâu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi đường.",
        pragmaticGoal: "Hỏi đường.",
        semanticSlots: ["أين"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Viết từ phải sang trái"],
    },
    {
      id: 'ar-survival-3', language: 'ar', unit: 3 as RealworldSurvivalUnit, order: 3,
      titleVi: "Mua sắm & Giá cả", titleEn: "Shopping and Prices", canDoVi: "Tôi có thể hỏi giá.",
      scenario: { settingVi: "Souq ở Marrakech.", roles: ["Khách hàng", "Người bán"] },
      dialogue: [
        { speaker: 'A', text: "بكم هذا؟", vi: "Cái này bao nhiêu?" },
        { speaker: 'B', text: "عشرة دراهم.", vi: "10 dirham." },
      ],
      chunks: [
        { text: "بكم...؟", vi: "Bao nhiêu...?", useWhenVi: "hỏi giá", vietnameseLearnerCueVi: "Bikam" },
      ],
      contextCue: { titleVi: "Mua sắm", bodyVi: "Hỏi giá." },
      comprehension: { promptVi: "Hỏi giá?", options: ["بكم", "أين"], correctAnswer: "بكم", explanationVi: "بكم = bao nhiêu." },
      production: { promptVi: "Hỏi giá.", requiredSlots: ["بكم"], exemplar: "بكم هذا القميص؟", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ hỏi giá.", cueVi: "بكم...", acceptedPatterns: [{ requiredFragments: ["بكم"] }], answerHintVi: "بكم" },
      semanticDiscrimination: {
        scenarioVi: "Hỏi giá?",
        correctPragmaticAction: "بكم",
        plausibleDistractors: [{ text: "أين", errorType: "L1 Transfer", explanationVi: "بكم = bao nhiêu." }]
      },
      generativeSimulation: {
        promptVi: "Hỏi giá.",
        pragmaticGoal: "Hỏi giá.",
        semanticSlots: ["بكم"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Viết từ phải sang trái"],
    },
    {
      id: 'ar-survival-4', language: 'ar', unit: 4 as RealworldSurvivalUnit, order: 4,
      titleVi: "Gọi món", titleEn: "Ordering Food", canDoVi: "Tôi có thể gọi món.",
      scenario: { settingVi: "Nhà hàng Ả Rập.", roles: ["Thực khách", "Phục vụ"] },
      dialogue: [
        { speaker: 'A', text: "أريد شاورما، من فضلك.", vi: "Tôi muốn shawarma." },
        { speaker: 'B', text: "حاضر!", vi: "Được!" },
      ],
      chunks: [
        { text: "أريد...", vi: "Tôi muốn...", useWhenVi: "gọi món", vietnameseLearnerCueVi: "Urid" },
        { text: "من فضلك", vi: "xin vui lòng", useWhenVi: "lịch sự", vietnameseLearnerCueVi: "Min fadlik" },
      ],
      contextCue: { titleVi: "Gọi món", bodyVi: "Thêm من فضلك." },
      comprehension: { promptVi: "Gọi món?", options: ["أريد", "أين"], correctAnswer: "أريد", explanationVi: "أريد = tôi muốn." },
      production: { promptVi: "Gọi trà.", requiredSlots: ["شاي"], exemplar: "أريد شاي، من فضلك.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ gọi món.", cueVi: "أريد...", acceptedPatterns: [{ requiredFragments: ["أريد"] }], answerHintVi: "أريد" },
      semanticDiscrimination: {
        scenarioVi: "Gọi món?",
        correctPragmaticAction: "أريد",
        plausibleDistractors: [{ text: "أين", errorType: "L1 Transfer", explanationVi: "أريد = tôi muốn." }]
      },
      generativeSimulation: {
        promptVi: "Gọi trà.",
        pragmaticGoal: "Gọi trà.",
        semanticSlots: ["شاي"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm من فضلك"],
    },
    {
      id: 'ar-survival-5', language: 'ar', unit: 5 as RealworldSurvivalUnit, order: 5,
      titleVi: "Xin lỗi & Cảm ơn", titleEn: "Apologize & Thank", canDoVi: "Tôi có thể xin lỗi.",
      scenario: { settingVi: "Va vào người.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "آسف جدًا.", vi: "Tôi rất xin lỗi." },
        { speaker: 'B', text: "لا مشكلة.", vi: "Không sao." },
      ],
      chunks: [
        { text: "آسف", vi: "Xin lỗi", useWhenVi: "xin lỗi", vietnameseLearnerCueVi: "Aasif" },
        { text: "شكرًا", vi: "Cảm ơn", useWhenVi: "cảm ơn", vietnameseLearnerCueVi: "Shukran" },
      ],
      contextCue: { titleVi: "Xin lỗi", bodyVi: "Xin lỗi nhanh." },
      comprehension: { promptVi: "Đáp lại xin lỗi?", options: ["لا مشكلة", "شكرًا"], correctAnswer: "لا مشكلة", explanationVi: "لا مشكلة = không sao." },
      production: { promptVi: "Nói xin lỗi.", requiredSlots: ["آسف"], exemplar: "أنا آسف جدًا.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ xin lỗi.", cueVi: "آسف...", acceptedPatterns: [{ requiredFragments: ["آسف"] }], answerHintVi: "آسف" },
      semanticDiscrimination: {
        scenarioVi: "Đáp lại xin lỗi?",
        correctPragmaticAction: "لا مشكلة",
        plausibleDistractors: [{ text: "شكرًا", errorType: "L1 Transfer", explanationVi: "لا مشكلة = không sao." }]
      },
      generativeSimulation: {
        promptVi: "Nói xin lỗi.",
        pragmaticGoal: "Nói xin lỗi.",
        semanticSlots: ["آسف"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Viết từ phải sang trái"],
    },
    {
      id: 'ar-survival-6', language: 'ar', unit: 6 as RealworldSurvivalUnit, order: 6,
      titleVi: "Nhờ vả", titleEn: "Making Requests", canDoVi: "Tôi có thể nhờ giúp.",
      scenario: { settingVi: "Nhờ chụp ảnh.", roles: ["Bạn", "Người lạ"] },
      dialogue: [
        { speaker: 'A', text: "هل يمكنك التقاط صورة، من فضلك؟", vi: "Chụp ảnh giúp được không?" },
        { speaker: 'B', text: "طبعًا!", vi: "Dĩ nhiên!" },
      ],
      chunks: [
        { text: "هل يمكنك...؟", vi: "Bạn có thể...?", useWhenVi: "nhờ vả", vietnameseLearnerCueVi: "Hal yumkinak" },
      ],
      contextCue: { titleVi: "Nhờ vả", bodyVi: "Dùng هل يمكنك." },
      comprehension: { promptVi: "Nhờ vả?", options: ["هل يمكنك", "هل عندك"], correctAnswer: "هل يمكنك", explanationVi: "هل يمكنك = bạn có thể." },
      production: { promptVi: "Nhờ giúp.", requiredSlots: ["مساعدة"], exemplar: "هل يمكنك مساعدتي؟", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ nhờ vả.", cueVi: "هل يمكنك...", acceptedPatterns: [{ requiredFragments: ["يمكنك"] }], answerHintVi: "هل يمكنك" },
      semanticDiscrimination: {
        scenarioVi: "Nhờ vả?",
        correctPragmaticAction: "هل يمكنك",
        plausibleDistractors: [{ text: "هل عندك", errorType: "L1 Transfer", explanationVi: "هل يمكنك = bạn có thể." }]
      },
      generativeSimulation: {
        promptVi: "Nhờ giúp.",
        pragmaticGoal: "Nhờ giúp.",
        semanticSlots: ["مساعدة"],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Thêm من فضلك"],
    },
    {
      id: 'ar-survival-7', language: 'ar', unit: 7 as RealworldSurvivalUnit, order: 7,
      titleVi: "Khẩn cấp", titleEn: "Emergencies", canDoVi: "Tôi có thể yêu cầu giúp đỡ khẩn cấp.",
      scenario: { settingVi: "Tình huống khẩn cấp.", roles: ["Bạn", "Người trợ giúp"] },
      dialogue: [
        { speaker: 'A', text: "النجدة، من فضلك!", vi: "Cứu tôi với!" },
        { speaker: 'B', text: "أحتاج إلى طبيب.", vi: "Tôi cần bác sĩ." },
      ],
      chunks: [
        { text: "النجدة، من فضلك!", vi: "Cứu tôi với!", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giúp tôi" },
      ],
      contextCue: { titleVi: "Khẩn cấp", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["النجدة، من فضلك!", "أحتاج إلى طبيب."], correctAnswer: "النجدة، من فضلك!", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "النجدة، من فضلك!", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "النجدة، من فضلك!" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "النجدة، من فضلك!",
        plausibleDistractors: [{ text: "أحتاج إلى طبيب.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-8', language: 'ar', unit: 8 as RealworldSurvivalUnit, order: 8,
      titleVi: "Taxi", titleEn: "Taxi", canDoVi: "Tôi có thể đi lại bằng phương tiện công cộng.",
      scenario: { settingVi: "Đón xe taxi.", roles: ["Bạn", "Tài xế"] },
      dialogue: [
        { speaker: 'A', text: "إلى المطار، من فضلك.", vi: "Đến sân bay nhé." },
        { speaker: 'B', text: "بكم إلى المحطة؟", vi: "Đến ga bao nhiêu tiền?" },
      ],
      chunks: [
        { text: "إلى المطار، من فضلك.", vi: "Đến sân bay nhé.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Đến" },
      ],
      contextCue: { titleVi: "Taxi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["إلى المطار، من فضلك.", "بكم إلى المحطة؟"], correctAnswer: "إلى المطار، من فضلك.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "إلى المطار، من فضلك.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "إلى المطار، من فضلك." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "إلى المطار، من فضلك.",
        plausibleDistractors: [{ text: "بكم إلى المحطة؟", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-9', language: 'ar', unit: 9 as RealworldSurvivalUnit, order: 9,
      titleVi: "Khách sạn", titleEn: "Hotel", canDoVi: "Tôi có thể giao tiếp tại khách sạn.",
      scenario: { settingVi: "Lễ tân khách sạn.", roles: ["Khách", "Lễ tân"] },
      dialogue: [
        { speaker: 'A', text: "لدي حجز.", vi: "Tôi có đặt phòng." },
        { speaker: 'B', text: "مفتاح غرفتي، من فضلك.", vi: "Cho tôi chìa khóa phòng." },
      ],
      chunks: [
        { text: "لدي حجز.", vi: "Tôi có đặt phòng.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Phòng" },
      ],
      contextCue: { titleVi: "Khách sạn", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["لدي حجز.", "مفتاح غرفتي، من فضلك."], correctAnswer: "لدي حجز.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "لدي حجز.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "لدي حجز." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "لدي حجز.",
        plausibleDistractors: [{ text: "مفتاح غرفتي، من فضلك.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-10', language: 'ar', unit: 10 as RealworldSurvivalUnit, order: 10,
      titleVi: "Thời gian", titleEn: "Time", canDoVi: "Tôi có thể hỏi và trả lời về thời gian.",
      scenario: { settingVi: "Hỏi giờ trên phố.", roles: ["Bạn", "Người đi đường"] },
      dialogue: [
        { speaker: 'A', text: "كم الساعة؟", vi: "Mấy giờ rồi?" },
        { speaker: 'B', text: "إنها الساعة 5.", vi: "Bây giờ là 5 giờ." },
      ],
      chunks: [
        { text: "كم الساعة؟", vi: "Mấy giờ rồi?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Giờ" },
      ],
      contextCue: { titleVi: "Thời gian", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["كم الساعة؟", "إنها الساعة 5."], correctAnswer: "كم الساعة؟", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "كم الساعة؟", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "كم الساعة؟" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "كم الساعة؟",
        plausibleDistractors: [{ text: "إنها الساعة 5.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-11', language: 'ar', unit: 11 as RealworldSurvivalUnit, order: 11,
      titleVi: "Ngân hàng", titleEn: "Bank", canDoVi: "Tôi có thể giao dịch tại ngân hàng.",
      scenario: { settingVi: "Ngân hàng địa phương.", roles: ["Khách hàng", "Nhân viên"] },
      dialogue: [
        { speaker: 'A', text: "أريد صرف العملة.", vi: "Tôi muốn đổi tiền." },
        { speaker: 'B', text: "أين الصراف الآلي؟", vi: "ATM ở đâu?" },
      ],
      chunks: [
        { text: "أريد صرف العملة.", vi: "Tôi muốn đổi tiền.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tiền" },
      ],
      contextCue: { titleVi: "Ngân hàng", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["أريد صرف العملة.", "أين الصراف الآلي؟"], correctAnswer: "أريد صرف العملة.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "أريد صرف العملة.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "أريد صرف العملة." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "أريد صرف العملة.",
        plausibleDistractors: [{ text: "أين الصراف الآلي؟", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-12', language: 'ar', unit: 12 as RealworldSurvivalUnit, order: 12,
      titleVi: "Nhà thuốc", titleEn: "Pharmacy", canDoVi: "Tôi có thể mua thuốc tại nhà thuốc.",
      scenario: { settingVi: "Nhà thuốc.", roles: ["Người bệnh", "Dược sĩ"] },
      dialogue: [
        { speaker: 'A', text: "عندي صداع.", vi: "Tôi bị đau đầu." },
        { speaker: 'B', text: "أحتاج إلى دواء.", vi: "Tôi cần mua thuốc." },
      ],
      chunks: [
        { text: "عندي صداع.", vi: "Tôi bị đau đầu.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Thuốc" },
      ],
      contextCue: { titleVi: "Nhà thuốc", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["عندي صداع.", "أحتاج إلى دواء."], correctAnswer: "عندي صداع.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "عندي صداع.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "عندي صداع." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "عندي صداع.",
        plausibleDistractors: [{ text: "أحتاج إلى دواء.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-13', language: 'ar', unit: 13 as RealworldSurvivalUnit, order: 13,
      titleVi: "Điện thoại", titleEn: "Phone", canDoVi: "Tôi có thể giao tiếp qua điện thoại.",
      scenario: { settingVi: "Nghe điện thoại.", roles: ["Người gọi", "Người nghe"] },
      dialogue: [
        { speaker: 'A', text: "آلو، من يتحدث؟", vi: "Alo, ai đó?" },
        { speaker: 'B', text: "سأتصل لاحقًا.", vi: "Tôi sẽ gọi lại." },
      ],
      chunks: [
        { text: "آلو، من يتحدث؟", vi: "Alo, ai đó?", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Alo" },
      ],
      contextCue: { titleVi: "Điện thoại", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["آلو، من يتحدث؟", "سأتصل لاحقًا."], correctAnswer: "آلو، من يتحدث؟", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "آلو، من يتحدث؟", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "آلو، من يتحدث؟" },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "آلو، من يتحدث؟",
        plausibleDistractors: [{ text: "سأتصل لاحقًا.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-14', language: 'ar', unit: 14 as RealworldSurvivalUnit, order: 14,
      titleVi: "Khen ngợi", titleEn: "Compliments", canDoVi: "Tôi có thể khen ngợi người khác.",
      scenario: { settingVi: "Khen ngợi.", roles: ["Bạn", "Người quen"] },
      dialogue: [
        { speaker: 'A', text: "هذا لذيذ.", vi: "Ngon quá." },
        { speaker: 'B', text: "أنت لطيف جداً.", vi: "Bạn rất tốt." },
      ],
      chunks: [
        { text: "هذا لذيذ.", vi: "Ngon quá.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Khen" },
      ],
      contextCue: { titleVi: "Khen ngợi", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["هذا لذيذ.", "أنت لطيف جداً."], correctAnswer: "هذا لذيذ.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "هذا لذيذ.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "هذا لذيذ." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "هذا لذيذ.",
        plausibleDistractors: [{ text: "أنت لطيف جداً.", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
    {
      id: 'ar-survival-15', language: 'ar', unit: 15 as RealworldSurvivalUnit, order: 15,
      titleVi: "Tạm biệt", titleEn: "Goodbye", canDoVi: "Tôi có thể nói lời tạm biệt.",
      scenario: { settingVi: "Chia tay.", roles: ["Bạn", "Bạn bè"] },
      dialogue: [
        { speaker: 'A', text: "وداعاً، أراك لاحقاً.", vi: "Tạm biệt, hẹn gặp lại." },
        { speaker: 'B', text: "طاب يومك!", vi: "Chúc một ngày tốt lành!" },
      ],
      chunks: [
        { text: "وداعاً، أراك لاحقاً.", vi: "Tạm biệt, hẹn gặp lại.", useWhenVi: "tình huống cụ thể", vietnameseLearnerCueVi: "Tạm biệt" },
      ],
      contextCue: { titleVi: "Tạm biệt", bodyVi: "Sử dụng cấu trúc cơ bản." },
      comprehension: { promptVi: "Bạn muốn nói gì?", options: ["وداعاً، أراك لاحقاً.", "طاب يومك!"], correctAnswer: "وداعاً، أراك لاحقاً.", explanationVi: "Đây là câu đúng." },
      production: { promptVi: "Hãy luyện tập.", requiredSlots: [], exemplar: "وداعاً، أراك لاحقاً.", rejectExactModelCopy: true },
      retrieval: { promptVi: "Gõ lại", cueVi: "...", acceptedPatterns: [{ requiredFragments: [] }], answerHintVi: "وداعاً، أراك لاحقاً." },
      semanticDiscrimination: {
        scenarioVi: "Bạn muốn nói gì?",
        correctPragmaticAction: "وداعاً، أراك لاحقاً.",
        plausibleDistractors: [{ text: "طاب يومك!", errorType: "L1 Transfer", explanationVi: "Đây là câu đúng." }]
      },
      generativeSimulation: {
        promptVi: "Hãy luyện tập.",
        pragmaticGoal: "Hãy luyện tập.",
        semanticSlots: [],
        cognitiveBlindspots: [
          { errorPattern: "L1 Transfer", remediationPrompt: "Tập trung vào cách nói tự nhiên của ngôn ngữ đích, không dịch từng từ từ tiếng Việt." }
        ]
      },
      selfReview: ["Phát âm"],
    },
  ],
};

export function getRealworldSurvivalLesson(lang: string, id: string): RealworldSurvivalLesson | undefined {
  return realworldSurvivalLessons[lang]?.find(l => l.id === id);
}

export function getAllRealworldLessonsForLanguage(lang: string): RealworldSurvivalLesson[] {
  return realworldSurvivalLessons[lang] || [];
}
