# 🏛️ ECHLEARN PRODUCT OVERHAUL & DESIGN SYSTEM SPECIFICATION (TOP 0.1% EDTECH)

> **Document Version:** 1.0.0  
> **Date:** 2026-07-31  
> **Author Team:** Principal Product Designer, Senior UX Architect, Design System Lead, Creative Director, 3D Artist, Motion Designer, Senior Frontend Engineer, Accessibility Specialist, Performance Engineer.  
> **Status:** APPROVED FOR IMPLEMENTATION  

---

##  EXECUTIVE SUMMARY

**EchLearn** là nền tảng học tiếng Anh & luyện thi IELTS hàng đầu với linh vật Ếch Buri. Tài liệu thiết kế này định nghĩa toàn bộ quy chuẩn giao diện (UI), trải nghiệm người dùng (UX), Design System, 3D Mascot, Motion Tokens và Frontend Architecture để biến EchLearn thành một sản phẩm EdTech chuẩn thương mại quốc tế (đứng ngang hàng với Duolingo, Elsa Speak, Apple & MasterClass).

---

## I. SCOPE & AUDIT OF ALL 19 ZONES

Hệ thống đã kiểm thử và quy chuẩn toàn bộ 19 khu vực trải nghiệm:

| STT | Khu Vực Chức Năng | Route URL | Vấn Đề Trước Đây | Quy Chuẩn Thiết Kế Mới (Top 0.1%) |
|:---:|:---|:---|:---|:---|
| **1** | **Landing Page** | `/` | Lệch tông đen/trắng | 100% Light Mode Canvas (`#f8fafc`), Hero Mascot Card trắng ngọc bích mượt mờ (`bg-white/90 backdrop-blur-md border border-emerald-100/80 shadow-[0_20px_50px_rgba(16,185,129,0.08)]`). |
| **2** | **Auth (Login/Register)** | `/login`, `/register` | Trùng email rác | Khóa chặt **1 Email = 1 Tài khoản**, gửi OTP thật qua Supabase Auth API khi kết nối. |
| **3** | **AI Onboarding & Level Test** | `/app/ai-onboarding` | Khảo sát dài dòng | Quy trình 3 bước thích ứng với Mascot Buri tương tác hướng dẫn. |
| **4** | **Dashboard** | `/app` | 25+ Icon gây choáng ngợp | Chỉnh lại 4 nhóm rõ ràng, Banner chào mừng tinh tế, Widget Streak 3D, Tiến độ ngày rõ ràng. |
| **5** | **Course Roadmap 365 Days** | `/app/roadmap` | Nút lộ trình phẳng | Các Node bài học 3D nổi khối Duolingo (`#58cc02`), hiệu ứng mở khóa hiệu ứng ánh sáng. |
| **6** | **Lesson Player** | `/app/lesson` | Giao diện rối mắt | Focus Mode 100% tập trung, Progress Ring SVG, âm thanh phản hồi đúng/sai tức thì. |
| **7** | **AI Speaking & Pronunciation** | `/app/speaking` | Thiếu phản hồi trực quan | Sóng âm Voice Visualizer, phân tích điểm yếu phát âm từng âm tiết IPA. |
| **8** | **Listening Practice** | `/app/listening` | Audio Player đơn điệu | Japanese Lofi Player & Categorized Video Shadowing bản xứ. |
| **9** | **Reading & Bilingual News** | `/app/reading` | Chữ nhỏ chật chội | Phông chữ Inter/Outfit tương phản cao (Slate 900 / Slate 700), chế độ dịch song ngữ tức thì. |
| **10** | **Writing Coach & Master** | `/app/writing` | Thiếu tiêu chí IELTS | Chấm điểm AI 4 tiêu chí Task Response, Coherence, Lexical, Grammar với Band Score dự đoán. |
| **11** | **IELTS Academic Suite** | `/app/ielts` | Thiếu bộ đề thi | Bộ đề thi Cambridge Academic 4 kỹ năng & Thi thử Mock Test Center. |
| **12** | **Vocabulary & Flashcards 3D** | `/app/vocabulary` | Thẻ từ vựng phẳng | Lật mặt Flashcard 3D mượt mà, thuật toán Spaced Repetition (SRS) tính khoảng thời gian ôn lại. |
| **13** | **Grammar Trainer** | `/app/grammar` | Lý thuyết khô khan | Bài tập ngữ pháp tương tác kéo thả (Drag & Drop), giải thích quy tắc trực quan. |
| **14** | **Leaderboard & Gamification** | `/app/leaderboard` | Bảng điểm phẳng | Top 3 Bục vinh quang 3D (Gold, Silver, Bronze), cập nhật vị trí thời gian thực. |
| **15** | **Achievements & Daily Missions** | `/app/achievements` | Badge hình xấu | Bộ danh hiệu Vector Pins sáng lấp lánh, thanh tiến độ nhận XP. |
| **16** | **Profile & Customization** | `/app/profile`, `/app/customize` | Skin mascot trùng 3D | Tủ đồ Ech Buri 3D phong phú (Hokage, Super Saiyan, Luffy, Cyberpunk) với hiệu ứng Aura. |
| **17** | **Settings & Preferences** | `/app/settings` | Thiếu cài đặt giao diện | Tùy chỉnh Font size, Phông chữ, Âm thanh hiệu ứng, Entitlements sync. |
| **18** | **Pricing & Subscription** | `/app/pricing` | Thẻ giá không nổi | 4 Tầng gói cước (FREE, GO, PLUS, PRO) chuẩn kinh tế học vĩ mô Việt Nam. |
| **19** | **System States (Loading/Error)** | Global Fallbacks | Loading thô cứng | Skeleton Loaders mượt mượt, Toast Notifications phản hồi nhanh, Error Boundary tự phục hồi. |

---

## II. DESIGN SYSTEM TOKENS (FIGMA & TAILWIND 4)

### 1. Palette Màu Sắc (Color Palette)
- **Canvas Base:** `bg-[#f8fafc]` (Slate 50 - Nền sáng dịu mắt)
- **Surface Elevation:** `bg-[#ffffff]` (Pure White Card)
- **Brand Primary:** `bg-[#10b981]` (Emerald 500)
- **Duolingo 3D CTA:** `bg-[#58cc02]` (Duolingo Green) | Viền đáy: `border-[#357c02]` (4px 3D depth)
- **High Contrast Text:** `text-[#0f172a]` (Slate 900 - Headings) & `text-[#334155]` (Slate 700 - Subtitles/Body)
- **Muted Label:** `text-[#64748b]` (Slate 500)

### 2. Thước Đo Spacing & Typography
- **Type Scale:** Display (48px/56px), H1 (36px/44px), H2 (28px/36px), H3 (20px/28px), Body (16px/24px), Small (14px/20px), Caption (12px/16px).
- **Spacing Scale:** 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.
- **Border Radius:** `rounded-2xl` (20px), `rounded-3xl` (24px), `rounded-full` (9999px).
- **Elevation Shadows:**
  - *Apple Elevation:* `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
  - *Emerald Ambient:* `shadow-[0_20px_50px_rgba(16,185,129,0.08)]`

---

## III. FRONTEND ARCHITECTURE & QUALITY ASSURANCE

1. **Shadcn UI Integration:** Dùng 100% Shadcn UI components trong `src/components/ui/` (`Card`, `Button`, `Badge`, `Dialog`, `Tabs`).
2. **Strict Verification:** `npx tsc -b` = **0 errors**, `npm run build` = **✓ Production Pass**.
3. **Accessibility (A11y):** Đáp ứng chuẩn WCAG 2.2 AA (Tương phản chữ ≥ 4.5:1, hỗ trợ bàn phím Focus trap, Screen Reader aria-labels).
