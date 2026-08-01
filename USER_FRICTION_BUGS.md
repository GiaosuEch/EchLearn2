# USER FRICTION BUGS & HARDCORE E2E AUDIT LOG — EchLearn

**Audit Date:** 2026-07-31  
**Persona:** Ultra-Picky Power User & Lead QA Architect (Top 0.1%)  
**Target Environment:** Local Dev Server (`http://127.0.0.1:5173/app`)

---

## 🛑 Friction Points Found & Root Cause Fixes

### 1. Residual Branding Leftovers ("LingFrog" -> "EchLearn")
- **Issue:** Found lingering references to "LingFrog" in `RegisterPage.tsx`, `LoginPage.tsx`, `Mascot.tsx`, `AppLayout.tsx`.
- **Impact:** Undermined brand authority and polish for paying users.
- **Fix:** Replaced all user-facing instances with **EchLearn** across titles, headers, alt attributes, and mascot tooltips.

### 2. Pricing Transparency & Value Proposition (`/app/pricing`)
- **Issue:** Pricing page lacked monetary figures and clear feature matrices for the 4 plans (`Free`, `GO`, `PLUS`, `PRO`).
- **Impact:** High friction for conversion — a user with funds ready couldn't evaluate ROI or pricing tiers.
- **Fix:** Created a 4-tier pricing matrix (`0 VNĐ`, `199.000 VNĐ / 6Tháng`, `399.000 VNĐ / Năm`, `799.000 VNĐ Trọn Đời`) with detailed feature checklists and dark/light mode visual hierarchy.

### 3. Customization Wardrobe Accessibility (`/app/customize`)
- **Issue:** Mascot Wardrobe was pushed to the bottom below color palettes; card text suffered contrast issues in Light Mode.
- **Impact:** User couldn't interact with Buri frog skins easily.
- **Fix:** Reordered Mascot Wardrobe (132+ skins) to the top of `/app/customize`, updated card containers with theme-adaptive classes (`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`), and enabled 1-click instant skin equip with toast feedback.

### 4. Friend List Privacy Enforcement (`/app/community/friends`)
- **Issue:** Exposing raw emails (`ID: ... • email`) in friend search cards.
- **Impact:** Privacy leak violation.
- **Fix:** Removed raw email lines completely; displayed user's `displayName`, `@username`, custom avatar, level, and XP points.

### 5. Multi-Pose Mascot Dynamic Rendering (`Mascot.tsx`)
- **Issue:** Mascot rendered a single pose without dynamic learning context feedback.
- **Impact:** Felt like a static image.
- **Fix:** Extended `Mascot` component with `action` prop mapping (`reading`, `listening`, `speaking`, `celebrating`, `thinking`, `workout`, `coffee`, `sleeping`, `wave`).

---

## 🧪 Verification Matrix

| Verification Check | Executed Command | Result |
| :--- | :--- | :--- |
| **Lint Audit** | `npm.cmd run lint` | PASS (0 errors) |
| **Test Suite** | `npm.cmd run test` | 17/17 PASS (100% clean) |
| **Vite Bundle Build** | `npm.cmd run build` | PASS (13.28s compilation) |
| **Static Verification Scripts** | `verify_*.cjs` (31 scripts) | 31/31 PASS (100% clean) |
