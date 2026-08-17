/**
 * Socratic Morphosyntactic & Pragmatic Diagnostic Engine
 * 
 * Deep linguistic analyzer for detecting cognitive blindspots, L1 negative transfer,
 * and generating targeted Socratic dialogue prompts to stimulate meta-linguistic self-correction.
 */

export interface LinguisticDiagnosis {
  category: 'L1_TRANSFER' | 'AGREEMENT' | 'PREPOSITION_COLLOCATION' | 'REGISTER' | 'TENSE_ASPECT' | 'PERFECT_ACCURACY';
  severity: 'CRITICAL' | 'MODERATE' | 'NUANCE' | 'NONE';
  detectedPattern: string;
  linguisticExplanationVi: string;
  socraticQuestionVi: string;
  exemplarCorrection: string;
}

export interface DiagnosticEvaluation {
  overallScore: number; // 0 - 100
  hasCriticalErrors: boolean;
  diagnoses: LinguisticDiagnosis[];
  encouragementPromptVi: string;
}

interface TransferRule {
  regex: RegExp;
  category: LinguisticDiagnosis['category'];
  severity: LinguisticDiagnosis['severity'];
  detectedPattern: string;
  explanationVi: string;
  socraticVi: string;
  correction: string;
}

const KNOWN_L1_TRANSFER_RULES: TransferRule[] = [
  {
    regex: /\b(very\s+like|really\s+like\s+too\s+much)\b/i,
    category: 'L1_TRANSFER',
    severity: 'CRITICAL',
    detectedPattern: 'Phó từ "very" đứng trước động từ thường (L1 Transfer: Rất thích)',
    explanationVi: 'Trong tiếng Anh, "very" là phó từ chỉ mức độ dùng cho tính từ/trạng từ (very good). Để bổ nghĩa cho động từ "like", phải dùng "really like" hoặc "like ... very much" đặt ở cuối câu.',
    socraticVi: 'Trong câu của bạn, "very" đang đứng trước từ loại nào? Có quy tắc nào cấm "very" đứng trực tiếp trước một động từ hành động không?',
    correction: 'I really like this / I like this very much'
  },
  {
    regex: /\b(have\s+many\s+people|have\s+a\s+lot\s+of\s+people)\b/i,
    category: 'L1_TRANSFER',
    severity: 'CRITICAL',
    detectedPattern: 'Dùng "Have" thay cho cấu trúc tồn tại (L1 Transfer: "Có nhiều người")',
    explanationVi: 'Tiếng Việt dùng "Có..." cho cả sở hữu lẫn sự tồn tại. Nhưng trong tiếng Anh, "have" chỉ quyền sở hữu của chủ ngữ. Để chỉ sự hiện diện, bắt buộc dùng "There are / There is".',
    socraticVi: 'Ai là người "sở hữu" những người này trong câu của bạn? Nếu không có chủ sở hữu, cấu trúc tồn tại chuẩn trong tiếng Anh là gì?',
    correction: 'There are many people'
  },
  {
    regex: /\b(i\s+have\s+\d+\s+years\s+old|i\s+have\s+\d+\s+years)\b/i,
    category: 'L1_TRANSFER',
    severity: 'CRITICAL',
    detectedPattern: 'Dùng "have" để nói tuổi (L1 Transfer: "Tôi có ... tuổi")',
    explanationVi: 'Tuổi tác trong tiếng Anh là một trạng thái tồn tại (dùng To-be: "I am 20 years old"), không phải đồ vật sở hữu.',
    socraticVi: 'Tuổi tác là một trạng thái bản chất hay một vật thể bạn cầm nắm được? Bạn nên dùng To-be hay To-have?',
    correction: 'I am ... years old'
  },
  {
    regex: /\b(marry\s+with|married\s+with)\b/i,
    category: 'PREPOSITION_COLLOCATION',
    severity: 'MODERATE',
    detectedPattern: 'Giới từ sai với "marry" (L1: Kết hôn với)',
    explanationVi: 'Ngoại động từ "marry" đi trực tiếp với tân ngữ ("marry someone"). Ở dạng tính từ bị động dùng "married to someone", không dùng "married with".',
    socraticVi: 'Hãy kiểm tra xem động từ "marry" là nội động từ hay ngoại động từ khi theo sau là một đối tượng kết hôn?',
    correction: 'marry someone / married to someone'
  },
  {
    regex: /\b(listen\s+(the\s+music|music|to\s+the\s+music))\b/i,
    category: 'PREPOSITION_COLLOCATION',
    severity: 'MODERATE',
    detectedPattern: 'Thiếu giới từ "to" sau "listen"',
    explanationVi: '"Listen" là nội động từ, luôn cần giới từ "to" trước đối tượng tiếp nhận âm thanh ("listen to music").',
    socraticVi: 'Khác với "hear" (nghe thấy vô thức), động từ "listen" (lắng nghe có chủ đích) đòi hỏi giới từ nào kết nối với tân ngữ?',
    correction: 'listen to music'
  },
  {
    regex: /\b(he\s+don't|she\s+don't|it\s+don't)\b/i,
    category: 'AGREEMENT',
    severity: 'CRITICAL',
    detectedPattern: 'Bất hòa hợp Chủ ngữ - Trợ động từ (Subject-Auxiliary Agreement)',
    explanationVi: 'Chủ ngữ ngôi thứ 3 số ít (He/She/It) đòi hỏi trợ động từ "doesn\'t" ở thì hiện tại đơn, không dùng "don\'t".',
    socraticVi: 'Chủ ngữ ngôi thứ 3 số ít đi với trợ động từ phủ định nào ở hiện tại đơn?',
    correction: 'doesn\'t'
  }
];

export function diagnoseLearnerSentence(text: string, _targetLanguage: string = 'en'): DiagnosticEvaluation {
  const clean = text.trim();
  const diagnoses: LinguisticDiagnosis[] = [];

  for (const rule of KNOWN_L1_TRANSFER_RULES) {
    if (rule.regex.test(clean)) {
      diagnoses.push({
        category: rule.category,
        severity: rule.severity,
        detectedPattern: rule.detectedPattern,
        linguisticExplanationVi: rule.explanationVi,
        socraticQuestionVi: rule.socraticVi,
        exemplarCorrection: rule.correction
      });
    }
  }

  const hasCriticalErrors = diagnoses.some(d => d.severity === 'CRITICAL');
  const penalty = diagnoses.reduce((acc, d) => acc + (d.severity === 'CRITICAL' ? 25 : d.severity === 'MODERATE' ? 12 : 5), 0);
  const overallScore = Math.max(20, Math.min(100, 100 - penalty));

  let encouragementPromptVi = 'Cú pháp rất chính xác và tự nhiên! Bạn đang tư duy trực tiếp bằng ngôn ngữ đích.';
  if (hasCriticalErrors) {
    encouragementPromptVi = 'Phát hiện điểm mù nhận thức hoặc lỗi dịch thô từ tiếng mẹ đẻ (L1 Transfer). Hãy đọc gợi ý phản tư bên dưới để não bộ tự sửa lỗi.';
  } else if (diagnoses.length > 0) {
    encouragementPromptVi = 'Câu tương đối tốt, chỉ cần tinh chỉnh một vài điểm kết hợp từ (Collocation) để đạt chuẩn bản xứ.';
  }

  return {
    overallScore,
    hasCriticalErrors,
    diagnoses,
    encouragementPromptVi
  };
}
