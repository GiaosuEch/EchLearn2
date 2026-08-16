/**
 * Semantic Evaluator
 * Xử lý việc chấm điểm mềm dẻo cho các câu trả lời ngắn (Fill in the blank)
 * Chấp nhận lỗi đánh máy nhỏ (typos) và các biến thể hợp lệ.
 */

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Tiền xử lý chuỗi: Xóa khoảng trắng thừa, dấu câu cơ bản, đưa về chữ thường.
 */
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') // Remove punctuation
    .replace(/\s{2,}/g, ' '); // Replace multiple spaces with a single space
}

/**
 * Đánh giá câu trả lời của học sinh
 * @param userAnswer Câu trả lời của user
 * @param correctAnswer Đáp án đúng chuẩn
 * @param acceptedAnswers (Tùy chọn) Danh sách các đáp án được chấp nhận khác
 * @param tolerance Mức độ tha thứ (0 = Chính xác tuyệt đối, 1 = Sai 1 ký tự, 2 = Sai 2 ký tự)
 */
export function evaluateAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptedAnswers: string[] = [],
  tolerance: number = 1
): { isCorrect: boolean; distance: number } {
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);

  // 1. Kiểm tra chính xác tuyệt đối (sau khi normalize)
  if (normalizedUser === normalizedCorrect) return { isCorrect: true, distance: 0 };

  // 2. Kiểm tra trong danh sách chấp nhận
  for (const accepted of acceptedAnswers) {
    if (normalizedUser === normalizeString(accepted)) return { isCorrect: true, distance: 0 };
  }

  // 3. Kiểm tra lỗi đánh máy (Levenshtein) - chỉ áp dụng cho từ/cụm từ dài
  // (ví dụ không áp dụng sai số cho đáp án 1-2 ký tự)
  if (normalizedCorrect.length > 3) {
    const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
    if (distance <= tolerance) {
      return { isCorrect: true, distance }; // Chấp nhận lỗi typo nhỏ
    }
  }
  
  // 4. Nếu có accepted answers, thử tính typo trên các đáp án đó
  for (const accepted of acceptedAnswers) {
    const normAccepted = normalizeString(accepted);
    if (normAccepted.length > 3) {
      const distance = levenshteinDistance(normalizedUser, normAccepted);
      if (distance <= tolerance) {
        return { isCorrect: true, distance };
      }
    }
  }

  const defaultDistance = levenshteinDistance(normalizedUser, normalizedCorrect);
  return { isCorrect: false, distance: defaultDistance };
}
