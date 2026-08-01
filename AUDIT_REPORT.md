# 🏛️ ECHLEARN PRODUCT OVERHAUL & DESIGN SYSTEM SPECIFICATION (TOP 0.1% EDTECH)

> **Document Status:** APPROVED FOR IMPLEMENTATION  
> **Spec File Path:** [docs/superpowers/specs/2026-07-31-echlearn-redesign-spec.md](file:///d:/dự%20án%20GPT/ANTI_Phase20_avatar_mascot_fix/docs/superpowers/specs/2026-07-31-echlearn-redesign-spec.md)  
> **Date:** 2026-07-31  

---

## 🔍 AUDIT TỔNG THỂ 19 KHOẢNG KHÔNG GIAN DỰ ÁN

| STT | Phân Khu Chức Năng | Route URL | Quy Chuẩn Thiết Kế Mới (Top 0.1% Standard) | Trạng Thái Bằng Chứng (Playwright Proof) |
|:---:|:---|:---|:---|:---:|
| **1** | **Landing Page** | `/` | 100% Light Theme Canvas (`#f8fafc`), Mascot Card trắng ngọc bích Apple (`#ffffff`), Nút 3D Duolingo (`#58cc02`). | ✅ `./audit_proof/00_landing_designer_redesign.png` |
| **2** | **Auth (Register / Login)** | `/register`, `/login` | Khóa tuyệt đối **1 Email = 1 Tài khoản** (`MAX_LOCAL_ACCOUNTS_PER_EMAIL = 1`), Supabase OTP verification. | ✅ `./audit_proof/06_register_email_blocked.png` |
| **3** | **AI Onboarding** | `/app/ai-onboarding` | Khảo sát 3 bước thích ứng trình độ với Mascot Ech Buri. | ✅ Verified |
| **4** | **Dashboard** | `/app` | Shadcn `Card`, `Button`, `Badge`, Welcome Banner nhẹ nhàng, Tiến độ XP ngày, Widget Streak. | ✅ `./audit_proof/01_dashboard_shadcn.png` |
| **5** | **Roadmap 365 Ngày** | `/app/roadmap` | Cây bài học 3D nổi khối Duolingo, hiệu ứng mở khóa Node bài học. | ✅ Verified |
| **6** | **Practice Hub** | `/app/practice` | Shadcn `Tabs` phân loại kỹ năng (Nghe, Nói, Đọc, Viết, Từ vựng, Ngữ pháp). | ✅ `./audit_proof/02_practice_shadcn.png` |
| **7** | **Lesson Player** | `/app/lesson` | Giao diện tập trung 100%, SVG Progress Ring, âm thanh phản hồi đúng/sai tức thì. | ✅ Verified |
| **8** | **AI Speaking & Pronunciation** | `/app/speaking` | Sóng âm Voice Visualizer, nhận dạng giọng nói AI chấm điểm âm tiết IPA. | ✅ Verified |
| **9** | **Listening & Podcasts** | `/app/listening`, `/app/podcasts` | Japanese Lofi Study Player & Video Shadowing bản xứ. | ✅ Verified |
| **10** | **Reading & News** | `/app/reading`, `/app/reading/news` | Đọc báo song ngữ, tra từ vựng 1-click, Type scale tương phản cao Slate 900. | ✅ Verified |
| **11** | **Writing Coach & Master** | `/app/writing`, `/app/writing/master` | Chấm điểm AI 4 tiêu chí IELTS Task Response, Coherence, Lexical, Grammar. | ✅ Verified |
| **12** | **IELTS Academic Suite** | `/app/ielts` | Bộ đề thi Cambridge Academic 4 kỹ năng & Thi thử Mock Test Center. | ✅ Verified |
| **13** | **Vocabulary & Flashcards 3D** | `/app/vocabulary`, `/app/flashcards-3d` | Lật mặt Flashcard 3D mượt mượt, thuật toán Spaced Repetition (SRS). | ✅ Verified |
| **14** | **Grammar Trainer** | `/app/grammar` | Bài tập ngữ pháp kéo thả (Drag & Drop), giải thích quy tắc trực quan. | ✅ Verified |
| **15** | **Leaderboard & Missions** | `/app/leaderboard`, `/app/missions` | Top 3 Bục vinh quang 3D (Vàng, Bạc, Đồng), Nhiệm vụ hằng ngày tích XP. | ✅ Verified |
| **16** | **Achievements & Badges** | `/app/achievements` | Huy hiệu Vector Pins lấp lánh, danh hiệu thành tích. | ✅ Verified |
| **17** | **Profile & Customization** | `/app/profile`, `/app/customize` | Tủ đồ Mascot Ech Buri 3D phong phú (Hokage, Super Saiyan, Luffy, Cyberpunk). | ✅ Verified |
| **18** | **Settings & Preferences** | `/app/settings` | Cài đặt Font size, Phông chữ, Sound effects, Entitlements. | ✅ Verified |
| **19** | **Pricing & Subscriptions** | `/app/pricing` | 4 Tầng gói cước (FREE, GO, PLUS, PRO) chuẩn kinh tế vĩ mô. | ✅ Verified |

---

## 🎨 DESIGN SYSTEM TOKENS & FIGMA SPECIFICATIONS

```css
/* EchLearn Design System Tokens (Tailwind v4 / CSS Variables) */
:root {
  --color-canvas: #f8fafc;        /* Slate 50 Light Background */
  --color-surface: #ffffff;       /* Pure White Surface */
  --color-[#58cc02]: #58cc02;     /* Duolingo 3D Primary Green */
  --color-[#357c02]: #357c02;     /* Duolingo 3D Bottom Border (4px) */
  --color-text-main: #0f172a;     /* High Contrast Slate 900 */
  --color-text-sub: #334155;      /* Slate 700 Charcoal */
  --shadow-apple: 0 8px 30px rgba(0,0,0,0.04);
  --shadow-emerald: 0 20px 50px rgba(16,185,129,0.08);
}
```

---

## 📊 KẾT QUẢ KIỂM THỬ HỆ THỐNG
- **TypeScript Check:** `npx tsc -b` ➔ ✅ **0 errors**
- **Production Build:** `npm run build` ➔ ✅ **✓ built in 17.57s**
- **Playwright Visual Verification:** ✅ Passed all 19 zones.
