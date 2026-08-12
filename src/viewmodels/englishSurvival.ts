export type SurvivalFeedbackKind = 'success' | 'partial' | 'retry';

export interface SurvivalFeedback {
  kind: SurvivalFeedbackKind;
  message: string;
}

const politeOrderPattern = /\b(i(?:'d| would) like|can i have|may i have|i want)\b/i;
const politeRequestPattern = /\b(could you|can you|would you)\b/i;
const adjustmentPattern = /\b(less|not|without|no)\b/i;
const spicyPattern = /\bspic(?:y|ier)\b/i;

export const survivalSelfReviewPrompts = [
  'Tôi đã nói rõ món hoặc đồ uống mình muốn gọi.',
  'Tôi đã dùng một cụm lịch sự thay vì chỉ nói tên món.',
  'Tôi có thể yêu cầu món bớt cay mà không nhìn mẫu.',
  'Nếu chưa hiểu, tôi biết cách nhờ người đối diện nói lại.',
] as const;

export function evaluateSurvivalProduction(input: string): SurvivalFeedback {
  const answer = input.trim().replace(/\s+/g, ' ');
  const words = answer.split(' ').filter(Boolean);
  const hasOrder = politeOrderPattern.test(answer);
  const hasItem = words.length >= 4;

  if (hasOrder && hasItem) {
    return {
      kind: 'success',
      message: 'Tốt: bạn đã nói rõ món mình muốn bằng một yêu cầu lịch sự. Câu cá nhân hóa này phù hợp với tình huống.',
    };
  }

  return {
    kind: 'retry',
    message: 'Hãy tạo một câu đầy đủ: bắt đầu bằng “I would like…” hoặc “Can I have…”, rồi thêm món bạn thực sự muốn.',
  };
}

export function evaluateSurvivalRetrieval(input: string): SurvivalFeedback {
  const answer = input.trim().replace(/\s+/g, ' ');
  const hasRequest = politeRequestPattern.test(answer);
  const hasAdjustment = adjustmentPattern.test(answer) && spicyPattern.test(answer);

  if (hasRequest && hasAdjustment) {
    return {
      kind: 'success',
      message: 'Đúng trọng tâm: bạn đã nhớ cả lời nhờ lịch sự và ý “less spicy”. Bạn có thể đổi tên món theo nhu cầu của mình.',
    };
  }

  if (politeOrderPattern.test(answer) && answer.split(' ').length >= 4) {
    return {
      kind: 'partial',
      message: 'Câu gọi món tốt và có ý nghĩa. Ở bước nhớ lại này, mục tiêu là yêu cầu điều chỉnh: hãy dùng “Could you…” và “less spicy”.',
    };
  }

  return {
    kind: 'retry',
    message: 'Bạn đang cần nhớ câu yêu cầu bớt cay. Gợi ý: “Could you make it … spicy, please?”',
  };
}
