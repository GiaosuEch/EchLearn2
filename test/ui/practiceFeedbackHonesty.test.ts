import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const integrationSource = readFileSync('src/services/practiceLearningIntegration.ts', 'utf8');

test('speaking feedback records duration without inventing language-quality scores', () => {
  assert.match(integrationSource, /const pronunciation = 0;[\s\S]*const fluency = 0;[\s\S]*const vocabulary = 0;[\s\S]*const grammar = 0;/);
  assert.match(integrationSource, /isIELTS: false,[\s\S]*band: undefined,[\s\S]*duration,/);
  assert.match(integrationSource, /không phân tích nội dung, phát âm/i);
  assert.doesNotMatch(integrationSource, /58 \+ ratio|Math\.round\(\(score \/ 100\) \* 9/);
});

test('writing feedback is explicitly limited to observable form checks', () => {
  assert.match(integrationSource, /checksPassed \* 25/);
  assert.match(integrationSource, /độ dài, số câu, từ nối và dấu câu/);
  assert.match(integrationSource, /không đánh giá đúng đề, ngữ pháp/);
  assert.doesNotMatch(integrationSource, /band: isIELTS \? band/);
});

test('primary IELTS surfaces do not advertise fabricated automated scoring', () => {
  const files = [
    'src/pages/ielts/IELTSDashboardPage.tsx',
    'src/pages/app/ielts/IELTSWritingPage.tsx',
    'src/pages/app/ielts/MockTestCenterPage.tsx',
  ];
  const source = files.map((file) => readFileSync(file, 'utf8')).join('\n');

  assert.doesNotMatch(source, /AI 24\/7|Standard Cambridge|chấm Band tự động|100% định dạng đề thi thật/i);
  assert.doesNotMatch(source, /overallBand:\s*'6\.5'|Band \{test\.score\}/);
});

test('public product copy only promises feedback the current learning tools provide', () => {
  const landing = readFileSync('src/pages/public/LandingPage.tsx', 'utf8');

  assert.doesNotMatch(landing, /ôn luyện bằng AI|Nhận xét về phát âm và ngữ điệu ngay|Bài viết được phân tích lỗi|tham chiếu band descriptors/i);
  assert.match(landing, /kết quả hiện có không được quy đổi thành band IELTS/i);
  assert.match(landing, /chỉ hiển thị tiến độ từ hoạt động đã được ghi nhận/i);
});
