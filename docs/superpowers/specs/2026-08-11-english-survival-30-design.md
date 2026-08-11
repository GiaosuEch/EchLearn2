# English Survival 30 — Thiết kế chương trình nền tảng

## Quyết định

EchLearn sẽ xây khóa **English Survival 30** cho người Việt từ Pre-A1 đến A1 sớm. Đây là khóa giao tiếp sinh tồn 30 bài, không phải khóa IELTS và không hứa tạo trình độ A1 đầy đủ sau 30 ngày.

Mỗi bài có nhịp chuẩn 20 phút; người bận rộn có thể hoàn thành phiên tối thiểu 8 phút để giữ đà, nhưng chỉ được tính là hoàn thành đầy đủ khi đã làm phần đầu ra cá nhân hóa.

Nền tảng bằng chứng và nguồn được ghi tại [english-vietnamese-beginner-course-evidence.md](../../research/english-vietnamese-beginner-course-evidence.md).

## Outcome có thể kiểm chứng

Sau bài 30, người học có thể xử lý một role-play 45–60 giây gồm: chào hỏi, giới thiệu bản thân, gọi món hoặc mua một món quen thuộc, hỏi giờ/địa điểm/chỉ dẫn, phản hồi lời mời và hỏi lại khi chưa hiểu.

Đánh giá dựa trên `Can-do` và bằng chứng nhiệm vụ, không dựa trên điểm số phát âm, band IELTS hay số từ ghi âm.

## Ba lựa chọn đã đánh giá

1. Flashcard và trắc nghiệm mở rộng: nhanh nhưng không buộc người học dùng ngôn ngữ.
2. Danh mục audio/video: nhiều nội dung nhưng lệ thuộc nguồn và thiếu đầu ra.
3. **Được chọn — khóa 30 bài theo nhiệm vụ:** hội thoại ngắn tự biên soạn/có quyền sử dụng, shadowing có hướng dẫn, giải thích ngữ cảnh, câu tự tạo và ôn giãn cách.

## Cấu trúc 30 bài

| Cụm | Bài | Can-do cuối cụm |
|---|---:|---|
| Gặp gỡ | 1–5 | Chào hỏi, nói tên/quê quán, đánh vần, hỏi lại và kết thúc một cuộc gặp ngắn. |
| Con người và nhịp sống | 6–10 | Nói ngắn về người thân, việc học/công việc, thời gian và thói quen hằng ngày. |
| Ăn uống và mua sắm | 11–15 | Gọi món, nêu lựa chọn, hỏi giá/số lượng và thay đổi yêu cầu đơn giản. |
| Đi lại và hẹn gặp | 16–20 | Hỏi/đáp giờ, địa điểm, đường đi và xác nhận kế hoạch. |
| Kết nối xã hội | 21–25 | Nói sở thích, mời, đồng ý/từ chối lịch sự và làm rõ ý định. |
| Xử lý tình huống | 26–30 | Xin trợ giúp, xử lý hiểu nhầm và hoàn thành role-play sinh tồn tổng hợp. |

Mỗi cụm có một checkpoint role-play không chấm band: người học chọn hoặc nhập câu phù hợp, ghi âm nếu muốn, tự tick checklist và nhận “đã hoàn thành Can-do” khi hoàn tất nhiệm vụ.

## Cấu trúc từng bài

1. **Bối cảnh và mục tiêu (1 phút):** một tình huống, một `Can-do`, một ví dụ thành công.
2. **Nghe hiểu (4 phút):** hội thoại 2–4 lượt; có transcript, dịch Việt ngắn, nút nghe lại và câu kiểm tra hiểu.
3. **Nhại có hướng dẫn (4 phút):** 2–4 chunks ngắn, nghe chậm → tốc độ thường → tự nhại. UI chỉ lưu lượt ghi âm/thời lượng; không tự nhận là chấm phát âm.
4. **Bóc tách ngữ cảnh (3 phút):** khi nào dùng, biến thể lịch sự, một lỗi điển hình của người Việt.
5. **Tự tạo (5 phút):** thay tên, món, nơi, thời gian hoặc ý định của chính người học. Không chấp nhận nguyên văn câu mẫu.
6. **Truy xuất và ôn (3 phút):** nhớ lại cụm/câu trước khi hiện đáp án; lưu kết quả cho spaced repetition.

## Nội dung và asset

- Câu, hội thoại, bản dịch và bài tập là nội dung gốc của EchLearn, được TESOL/ELT review trước phát hành.
- Audio mẫu chỉ dùng bản thu có quyền sử dụng, transcript, biến thể giọng (ví dụ General American) và tốc độ được gắn nhãn. Không dùng TTS chưa duyệt như một “native model”.
- Mỗi chunk lưu cấp độ CEFR theo **nghĩa/cách dùng**, context, bản dịch, cue phát âm, asset ownership và revision history.
- Chỉ liên kết tới tài liệu ngoài khi quyền nhúng/sử dụng đã được xác nhận; không sao chép British Council, Cambridge hay IELTS.

## Tích hợp sản phẩm

- Dùng lại Roadmap, Lesson Player, practice attempt và adaptive review queue đang có.
- Thêm một content package rõ ràng cho `english-survival-30`; không tạo “generator” sinh hàng loạt bài template.
- Lesson Player hiển thị một chuỗi cố định gồm context, listen, shadow, context cue, production và retrieval.
- Completion lưu: lesson id, Can-do, retrieval result, production modality (typed/recorded), self-review, thời lượng và consent của audio. Không lưu hay hiển thị proficiency score từ thời lượng.
- Review queue ưu tiên: retrieval sai, production chưa hoàn thành, item đến hạn; không ưu tiên vì người dùng bấm nhiều.

## Hành vi lỗi và giới hạn

- Audio không tải được: transcript + bản dịch + nút thử lại vẫn cho phép tiếp tục; không đánh dấu nghe đã hoàn thành nếu chưa xác nhận hiểu.
- Micro không được cấp quyền: cho phép typed production; không phạt XP hay báo “phát âm kém”.
- Không có AI chấm đã benchmark: UI nói rõ chỉ lưu audio và checklist tự so sánh.
- Không có quyền asset: lesson bị chặn phát hành, không thay bằng asset lấy từ web không rõ quyền.

## QA và đo lường

Mỗi bài cần pass trước khi phát hành:

- Can-do có thể quan sát, hội thoại tự nhiên ở A1 sớm, Vietnamese explanation ngắn và đúng.
- Một nội dung reviewer ELT duyệt, một reviewer native/near-native duyệt tính tự nhiên, và owner asset được ghi lại.
- Test content: có 2–4 chunks, 1 comprehension task, 1 production task mới, 1 retrieval task, transcript/dịch/asset metadata đầy đủ.
- Product test: desktop/mobile, offline/error state, keyboard, screen reader, persistence và review queue.

Đo cohort sau phát hành: tỷ lệ hoàn thành production, retrieval sau 7/30 ngày, bài bị bỏ dở, thời lượng thực học và self-rating. Không dùng XP làm chỉ số học hiệu quả duy nhất.

## Ngoài phạm vi đợt đầu

- Chấm phát âm AI, chấm writing tự động, band IELTS.
- 12 ngôn ngữ còn lại.
- Marketplace video/audio hoặc nội dung do cộng đồng xuất bản.

