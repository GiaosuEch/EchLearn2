# Phase 17 — Full Practice Integration + Writing/Speaking Feedback

## Mục tiêu
Phase 16 đã tạo adaptive learning engine. Phase 17 đóng vòng lặp học tập: mọi trang luyện tập chính phải ghi dữ liệu vào engine để dashboard, mastery và spaced repetition phản ứng theo kết quả thật.

## Đã làm

- Kết nối `ListeningPracticePage` với `recordPracticeAttempt`.
- Kết nối `ReadingPracticePage` với `recordPracticeAttempt`.
- Kết nối `WritingPracticePage` với feedback cục bộ có cấu trúc và lưu progress.
- Kết nối `SpeakingPracticePage` với ghi âm, phát lại, feedback cục bộ và lưu progress.
- Kết nối `VocabularyTrainerPage` với mastery/spaced repetition runtime.
- Kết nối `GrammarTrainerPage` với learning engine.
- Thêm `practiceLearningIntegration.ts` làm lớp tích hợp chung.
- Thêm migration `008_practice_feedback.sql` cho Supabase production.

## Writing feedback
Writing feedback hiện chấm theo heuristic cục bộ:

- Task response
- Coherence
- Vocabulary diversity
- Grammar/punctuation baseline
- Strengths
- Improvements
- Rewrite suggestion

Có disclaimer rõ ràng: đây là phản hồi cục bộ, không phải điểm chính thức.

## Speaking feedback
Speaking feedback hiện hỗ trợ:

- Recording bằng `MediaRecorder`
- Playback bản ghi
- Feedback cục bộ theo duration/goal
- Pronunciation/fluency/vocabulary/grammar estimate
- Self-review checklist

Không fake là chấm phát âm chuyên sâu 100%.

## Persistence
Khi Supabase configured:

- `practice_attempt_summaries`
- `writing_feedback_results`
- `speaking_feedback_results`
- `learning_item_progress`
- `learning_events`
- `review_queue`

Nếu Supabase thiếu, app dùng local fallback.

## QA scripts

```powershell
node scripts/verify_practice_learning_integration.cjs
node scripts/verify_writing_feedback.cjs
node scripts/verify_speaking_feedback.cjs
node scripts/verify_dashboard_reactivity.cjs
node scripts/verify_no_fake_ai_claims.cjs
```

## Manual QA

1. Làm một bài Listening, quay lại dashboard: due reviews / weak skills phải có cơ sở thay đổi.
2. Làm một bài Reading, sai vài câu: item phải vào review queue.
3. Viết bài Writing: feedback phải có điểm, 4 tiêu chí, strengths, improvements, rewrite suggestion.
4. Nói: ghi âm, phát lại, submit, thấy checklist và feedback.
5. Vocabulary quiz/fill/match: mỗi câu đúng/sai phải ghi progress.
6. Grammar quiz: kết quả phải lưu vào learning engine.

## Known limitations

- Speaking feedback là local heuristic, chưa phải speech-to-text/phoneme analysis chuyên sâu.
- Writing feedback chưa dùng LLM/API thật nên chỉ là chấm ước tính cục bộ.
- Supabase migration cần chạy thêm file `008_practice_feedback.sql` trong SQL Editor.
