export type Phase13Lang = 'en' | 'vi' | 'es' | 'de' | 'fr' | 'ja' | 'ko' | 'zh' | 'it' | 'pt' | 'ru' | 'th' | 'ar';

type Dict = Record<string, string>;

const en: Dict = {
  practiceHubTitle: 'Practice Hub', practiceHubDesc: 'Choose a skill to practice',
  listening: 'Listening', speaking: 'Speaking', reading: 'Reading', writing: 'Writing', vocabulary: 'Vocabulary', grammar: 'Grammar', ielts: 'IELTS',
  listeningDesc: 'Audio exercises and comprehension', speakingDesc: 'Pronunciation and conversation', readingDesc: 'Passages and comprehension', writingDesc: 'Essays and AI feedback', vocabularyDesc: 'Word mastery and flashcards', grammarDesc: 'Rules and exercises', ieltsDesc: 'Full IELTS preparation',
  courseRoadmap: 'Course Roadmap', courseRoadmapDesc: 'Your path from beginner to mastery', lessons: 'lessons', completed: 'completed', all: 'All', tasks: 'tasks', passages: 'passages', topics: 'topics', questions: 'questions', words: 'words',
  listeningPractice: 'Listening Practice', listeningPracticeDesc: 'Improve listening with target-language audio content', readingPractice: 'Reading Practice', readingPracticeDesc: 'Build comprehension with target-language passages', speakingPractice: 'Speaking Practice', writingPractice: 'Writing Practice', grammarCourse: 'Grammar Course',
  back: 'Back', backToTasks: 'Back to tasks', audioPlayer: 'Audio player', textToSpeech: 'Text-to-Speech', tapToPlay: 'Tap to play audio', stop: 'Stop', transcript: 'Transcript', comprehensionQuestions: 'Comprehension questions', score: 'Score', correctAnswer: 'Correct answer', keyVocabulary: 'Key vocabulary', submitAnswers: 'Submit answers', startSkimming: 'Start skimming challenge', skimmingTime: 'Skimming time', timeUp: 'Time is up! Read the full text and answer the questions.',
  aiQa: 'AI QA', native: 'Native', target: 'Target', uniqueSeed: 'Unique seed', perAccount: 'Per-account test generation', localScoring: 'Local scoring transparency', roadmapUpdates: 'Roadmap updates after answers', pending: 'pending',
  honestIntegration: 'Honest integration', spotifyListening: 'Spotify listening', fallbackSearch: 'Search fallback',
  weekLabel: 'Week', estimatedLevel: 'Estimated level', confidence: 'Confidence', localAiNotice: 'Local AI estimate — not an official exam score. The roadmap updates as you learn.',
  skillVocabulary: 'vocabulary', skillListening: 'listening', skillReading: 'reading', skillGrammar: 'grammar', skillSpeaking: 'speaking', skillWriting: 'writing', skillPronunciation: 'pronunciation',
};

const vi: Dict = {
  practiceHubTitle: 'Trung tâm luyện tập', practiceHubDesc: 'Chọn kỹ năng bạn muốn luyện',
  listening: 'Nghe', speaking: 'Nói', reading: 'Đọc', writing: 'Viết', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', ielts: 'IELTS',
  listeningDesc: 'Bài nghe và câu hỏi hiểu nội dung', speakingDesc: 'Phát âm và hội thoại', readingDesc: 'Đoạn đọc và câu hỏi hiểu bài', writingDesc: 'Bài viết và phản hồi AI', vocabularyDesc: 'Ôn từ, flashcard và ghi nhớ', grammarDesc: 'Quy tắc và bài tập', ieltsDesc: 'Luyện IELTS đầy đủ',
  courseRoadmap: 'Lộ trình khóa học', courseRoadmapDesc: 'Con đường từ nhập môn đến thành thạo', lessons: 'bài học', completed: 'đã hoàn thành', all: 'Tất cả', tasks: 'bài', passages: 'đoạn đọc', topics: 'chủ đề', questions: 'câu hỏi', words: 'từ',
  listeningPractice: 'Luyện nghe', listeningPracticeDesc: 'Luyện nghe bằng nội dung đúng ngôn ngữ đang học', readingPractice: 'Luyện đọc', readingPracticeDesc: 'Đọc đoạn văn đúng ngôn ngữ đang học', speakingPractice: 'Luyện nói', writingPractice: 'Luyện viết', grammarCourse: 'Khóa ngữ pháp',
  back: 'Quay lại', backToTasks: 'Quay lại danh sách', audioPlayer: 'Trình phát âm thanh', textToSpeech: 'Đọc bằng giọng máy', tapToPlay: 'Bấm để nghe', stop: 'Dừng', transcript: 'Bản chép lời', comprehensionQuestions: 'Câu hỏi hiểu nội dung', score: 'Điểm', correctAnswer: 'Đáp án đúng', keyVocabulary: 'Từ vựng chính', submitAnswers: 'Nộp câu trả lời', startSkimming: 'Bắt đầu đọc lướt', skimmingTime: 'Thời gian đọc lướt', timeUp: 'Hết giờ! Hãy đọc toàn văn và trả lời câu hỏi.',
  aiQa: 'Kiểm tra AI', native: 'Tiếng mẹ đẻ', target: 'Ngôn ngữ học', uniqueSeed: 'Mã test riêng', perAccount: 'Tạo bài test riêng cho từng tài khoản', localScoring: 'Chấm điểm cục bộ minh bạch', roadmapUpdates: 'Lộ trình cập nhật theo câu trả lời', pending: 'đang chờ',
  honestIntegration: 'Tích hợp trung thực', spotifyListening: 'Luyện nghe với Spotify', fallbackSearch: 'Chế độ tìm kiếm dự phòng',
  weekLabel: 'Tuần', estimatedLevel: 'Trình độ ước tính', confidence: 'Độ tin cậy', localAiNotice: 'Ước tính AI cục bộ — không phải chứng chỉ chính thức. Lộ trình sẽ cập nhật khi bạn học.',
  skillVocabulary: 'từ vựng', skillListening: 'nghe', skillReading: 'đọc', skillGrammar: 'ngữ pháp', skillSpeaking: 'nói', skillWriting: 'viết', skillPronunciation: 'phát âm',
};

const es: Dict = { ...en, practiceHubTitle: 'Centro de práctica', practiceHubDesc: 'Elige una habilidad para practicar', listening: 'Escucha', speaking: 'Habla', reading: 'Lectura', writing: 'Escritura', vocabulary: 'Vocabulario', grammar: 'Gramática', courseRoadmap: 'Ruta del curso', weekLabel: 'Semana' };
const de: Dict = { ...en, practiceHubTitle: 'Übungszentrum', practiceHubDesc: 'Wähle eine Fähigkeit zum Üben', listening: 'Hören', speaking: 'Sprechen', reading: 'Lesen', writing: 'Schreiben', vocabulary: 'Wortschatz', grammar: 'Grammatik', courseRoadmap: 'Kursfahrplan', weekLabel: 'Woche' };
const fr: Dict = { ...en, practiceHubTitle: 'Centre de pratique', listening: 'Écoute', speaking: 'Expression orale', reading: 'Lecture', writing: 'Écriture', vocabulary: 'Vocabulaire', grammar: 'Grammaire', weekLabel: 'Semaine' };
const ja: Dict = { ...en, practiceHubTitle: '練習センター', listening: '聞く', speaking: '話す', reading: '読む', writing: '書く', vocabulary: '語彙', grammar: '文法', weekLabel: '週' };
const ko: Dict = { ...en, practiceHubTitle: '연습 센터', listening: '듣기', speaking: '말하기', reading: '읽기', writing: '쓰기', vocabulary: '어휘', grammar: '문법', weekLabel: '주차' };
const zh: Dict = { ...en, practiceHubTitle: '练习中心', listening: '听力', speaking: '口语', reading: '阅读', writing: '写作', vocabulary: '词汇', grammar: '语法', weekLabel: '周' };
const it: Dict = { ...en, practiceHubTitle: 'Centro pratica', listening: 'Ascolto', speaking: 'Parlato', reading: 'Lettura', writing: 'Scrittura', vocabulary: 'Vocabolario', grammar: 'Grammatica', weekLabel: 'Settimana' };
const pt: Dict = { ...en, practiceHubTitle: 'Centro de prática', listening: 'Escuta', speaking: 'Fala', reading: 'Leitura', writing: 'Escrita', vocabulary: 'Vocabulário', grammar: 'Gramática', weekLabel: 'Semana' };
const ru: Dict = { ...en, practiceHubTitle: 'Центр практики', listening: 'Аудирование', speaking: 'Разговор', reading: 'Чтение', writing: 'Письмо', vocabulary: 'Словарь', grammar: 'Грамматика', weekLabel: 'Неделя' };
const th: Dict = { ...en, practiceHubTitle: 'ศูนย์ฝึกฝน', listening: 'ฟัง', speaking: 'พูด', reading: 'อ่าน', writing: 'เขียน', vocabulary: 'คำศัพท์', grammar: 'ไวยากรณ์', weekLabel: 'สัปดาห์' };
const ar: Dict = { ...en, practiceHubTitle: 'مركز التدريب', listening: 'استماع', speaking: 'تحدث', reading: 'قراءة', writing: 'كتابة', vocabulary: 'مفردات', grammar: 'قواعد', weekLabel: 'الأسبوع' };

const all: Record<string, Dict> = { en, vi, es, de, fr, ja, ko, zh, it, pt, ru, th, ar };

export function t13(lang: string | undefined, key: string): string {
  const normalized = (lang || 'en').split('-')[0];
  return all[normalized]?.[key] || en[key] || key;
}

export function skillLabel(lang: string | undefined, skill: string): string {
  return t13(lang, `skill${skill.charAt(0).toUpperCase()}${skill.slice(1)}`) || skill;
}
