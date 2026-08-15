# Implementation Plan: JLPT N4 Pack Foundation

## Overview

Mở rộng Japanese pack từ N5-only sang level-aware content mà không sao chép UI, không dùng runtime API và giữ tiến độ SRS theo namespace `ja:jlpt:<level>`. N4 sẽ được triển khai theo lát dọc: một chuỗi bài local có route, guard, XP/SRS và kiểm thử trước khi mở rộng nội dung.

## Architecture Decisions

- Thay kho `JLPT_N5_LESSONS` hard-code trong page bằng resolver content theo `JLPTLevel`.
- Giữ ID lesson content không đổi trong từng level; progress ID luôn namespaced theo level để N4 không ảnh hưởng N5.
- Tạo pack N4 riêng, không làm N4 đi qua N5 pack resolver hoặc dùng nội dung N5 làm fallback.
- Chỉ xuất bản node N4 khi lesson, registry, pack, route guard và test đã hiện diện hai chiều.

## Task List

### Phase 1: Level-aware foundation

- [ ] Task 1: Tạo Japanese content resolver và type chung cho N5/N4.
  - Acceptance: grammar/reading pages resolve lesson theo `level`, không còn hard-code N5 khi route đã hợp lệ.
  - Verification: unit test resolver cho N5, N4 và ID sai level.

- [ ] Task 2: Xuất bản Japanese JLPT N4 pack với một vertical slice local.
  - Acceptance: có registry node, pack route ownership và một grammar + reading N4 đầy đủ Furigana/đáp án/phân tích.
  - Verification: registry và pack validators từ chối route/lesson cross-level.

### Checkpoint: Foundation

- [ ] TypeScript, `npm test`, lint và Vite build xanh.
- [ ] N5 deep link/review vẫn vào đúng N5 lesson.

### Phase 2: N4 progression

- [ ] Task 3: Thêm vocabulary N4 namespaced, không trộn SRS với N5.
- [ ] Task 4: Mở rộng N4 theo các cặp grammar-reading theo prerequisite graph.
- [ ] Task 5: Thay copy N5-only trong dashboard/page bằng copy level-aware chính xác.

### Checkpoint: User flow

- [ ] N4 node locked/active/completed thay đổi dựa trên progress thực.
- [ ] Dashboard mở đúng N4 review/lesson và không làm tăng N5 progress.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| N5 regressions do hard-code | Resolver test cho N5 trước khi thêm N4 data |
| Cross-level SRS collision | Bắt buộc `getJapaneseLessonProgressId(id, level)` cho mọi path |
| N4 chỉ có UI giả | Pack validator yêu cầu lesson local hai chiều trước publish |

## Open Questions

- N4 starter nên là một vertical slice 6 bài hay một course 30 cặp ngay từ đầu? Mặc định triển khai 6 bài, sau checkpoint mới mở rộng.
