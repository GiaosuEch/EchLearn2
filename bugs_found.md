# Báo Cáo Kiểm Thử & Danh Sách Lỗi (Bugs Found) - LingFrog App

**Ngày kiểm thử:** 31/07/2026  
**Người kiểm thử:** Lead QA / Dev Agent  
**Môi trường:** Local Server (http://127.0.0.1:5173/app) | Windows x64 | Vite + React 19 + TypeScript 6 + Tailwind CSS 4

---

## 1. Lỗi Trình Duyệt Tự Động (Browser Subagent / Playwright Tool Failure)
- **Mô tả:** Công cụ `open_browser_url` không thể mở trình duyệt do lỗi tải gói driver Playwright từ Azure CDN:
  `404 Not Found from https://playwright.azureedge.net/builds/driver/playwright-1.57.0-win32_x64.zip`
- **Tác động:** Không thể ghi hình session browser automation trực tiếp từ MCP runner. Cần xin ý kiến người dùng hoặc chạy Playwright E2E local qua terminal CLI.

---

## 2. Danh Sách Lỗi Code & Runtime Verification (Phát Hiện Qua Diagnostic Suite)

### 🔴 Lỗi 1: TypeScript Build Failure (`npm run build`)
- **Tệp tin:** `src/services/communitySupabaseService.ts`
- **Mô tả:** 
  - Line 15: Lỗi `TS6196: 'FriendRecord' is declared but never used.`
  - Line 35: Lỗi `TS6133: 'toPublicLearnerFromRow' is declared but its value is never read.`
  - Line 46: Lỗi `TS6133: 'assertFriendRequestIsValid' is declared but its value is never read.`
- **Nguyên nhân:** Khai báo unused types/functions trong chế độ strict TypeScript.

---

### 🔴 Lỗi 2: Thiếu Route Onboarding AI (`verify_route_smoke.cjs`)
- **Tệp tin:** `src/App.tsx`
- **Mô tả:** Kiểm thử route smoke báo lỗi `Missing route ai-onboarding`.
- **Nguyên nhân:** Component `src/pages/app/onboarding/AIOnboardingPage.tsx` đã tồn tại nhưng chưa được đăng ký trong danh sách tuyến đường (`<Route path="ai-onboarding" ... />`).

---

### 🔴 Lỗi 3: Navigation Sidebar Thiếu Tùy Chỉnh Linh Vật (`verify_customization_system.cjs`)
- **Tệp tin:** `src/components/layout/AppLayout.tsx`
- **Mô tả:** Thất bại kiểm thử Phase 19: `sidebar customization nav or runtime cosmetic application is missing.`
- **Nguyên nhân:** Danh sách `navSections` trong `AppLayout.tsx` thiếu mục `customize` (`path: '/app/customize'`).

---

### 🔴 Lỗi 4: Navigation Sidebar Thiếu Kênh Discord Cộng Đồng (`verify_phase20_discord_community.cjs`)
- **Tệp tin:** `src/components/layout/AppLayout.tsx`
- **Mô tả:** Thất bại kiểm thử Phase 20: `Sidebar Discord navigation is missing`.
- **Nguyên nhân:** `AppLayout.tsx` chưa có item điều hướng cho `discord_channel` (`path: '/app/community/discord'`).

---

### 🔴 Lỗi 5: Landing Page Thiếu Định Danh Chapter Anchors (`verify_atelier_ui_contract.cjs`)
- **Tệp tin:** `src/pages/public/LandingPage.tsx` / `src/components/landing/CinematicHero.tsx`
- **Mô tả:** Thất bại kiểm thử Atelier UI: `landing chapter meet is missing`.
- **Nguyên nhân:** Các anchor ID `meet`, `listen`, `speak`, `return`, `begin` và thuộc tính menu mobile `aria-expanded` / `aria-controls` chưa khớp với hợp đồng giao diện landing page.

---

### 🔴 Lỗi 6: Dashboard Thiếu Thông Tin Lộ Trình Thích Ứng & Hardcoded Text (`verify_dashboard_plan.cjs`, `verify_dashboard_reactivity.cjs`, `verify_i18n_runtime_pages.cjs`)
- **Tệp tin:** `src/pages/app/DashboardPage.tsx`
- **Mô tả:** 
  - Thiếu hiển thị các trường thích ứng: `Lộ trình thích ứng`, `Kế hoạch học hôm nay`, `todayPlan.reviewQueue`, `todayPlan.weakSkills`, `getMasteryLabel`, `recommendedLesson`.
  - Chứa văn bản cứng chưa được bản địa hóa: `Speaking Practice`.

---

### 🔴 Lỗi 7: Điểm Thưởng Đăng Ký & Luồng Người Dùng Mới (`verify_user_flow.cjs`)
- **Tệp tin:** `src/pages/auth/RegisterPage.tsx`
- **Mô tả:** Đăng ký tài khoản thành công phải chuyển hướng người dùng mới đến trang `/app/ai-onboarding` để thiết lập lộ trình thích ứng ban đầu.

---

## 3. Kế Hoạch Sửa Lỗi Tự Động (Auto-Repair Plan)
1. Xóa các biến/hàm không sử dụng trong `communitySupabaseService.ts`.
2. Đăng ký route `ai-onboarding` trong `src/App.tsx`.
3. Thêm các mục menu `customize` và `discord_channel` vào `AppLayout.tsx`.
4. Cập nhật `LandingPage.tsx` và `CinematicHero.tsx` đáp ứng Atelier UI Contract.
5. Bổ sung giao diện thích ứng & i18n cho `DashboardPage.tsx`.
6. Cập nhật chuyển hướng trong `RegisterPage.tsx` sang `/app/ai-onboarding`.
7. Chạy lại toàn bộ bộ test verification & build để xác nhận 100% PASS.
