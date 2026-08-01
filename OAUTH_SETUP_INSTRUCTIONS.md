# 🔐 HƯỚNG DẪN CẤU HÌNH GOOGLE & GITHUB OAUTH CHO SUPABASE

Tài liệu hướng dẫn vắn tắt các bước lấy **Client ID** và **Client Secret** từ **Google Cloud Console** & **GitHub Developer Settings** để dán vào **Supabase Dashboard**.

---

## 1. 🔵 CẤU HÌNH GOOGLE OAUTH PROVIDER

### Bước 1: Lấy Credentials từ Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo dự án mới hoặc chọn dự án hiện tại của bạn.
3. Mở menu: **APIs & Services** $\rightarrow$ **Credentials**.
4. Bấm **Create Credentials** $\rightarrow$ Chọn **OAuth client ID**:
   * **Application type**: `Web application`
   * **Name**: `EchLearn App`
   * **Authorized JavaScript origins**:
     - `https://<YOUR-PROJECT-REF>.supabase.co`
     - `https://echlearn.dpdns.org`
     - `http://localhost:5173` *(Phục vụ test local)*
   * **Authorized redirect URIs**:
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
5. Bấm **Create** và lưu lại 2 thông số:
   - **Client ID** (dạng `xxx.apps.googleusercontent.com`)
   - **Client Secret** (dạng `GOCSPX-xxx`)

### Bước 2: Dán vào Supabase Dashboard
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) $\rightarrow$ Chọn project **EchLearn**.
2. Mở mục **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Google**.
3. Bật **Enable Google provider**.
4. Dán **Client ID** và **Client Secret** vừa lấy ở trên.
5. Bấm **Save**.

---

## 2. 🐙 CẤU HÌNH GITHUB OAUTH PROVIDER

### Bước 1: Tạo OAuth App trên GitHub
1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers).
2. Chọn **OAuth Apps** $\rightarrow$ Bấm **New OAuth App**:
   * **Application name**: `EchLearn`
   * **Homepage URL**: `https://echlearn.dpdns.org`
   * **Authorization callback URL**:
     - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
3. Bấm **Register application**.
4. Bấm **Generate a new client secret**.
5. Copy **Client ID** và **Client Secret**.

### Bước 2: Dán vào Supabase Dashboard
1. Trở lại [Supabase Dashboard](https://supabase.com/dashboard) $\rightarrow$ **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **GitHub**.
2. Bật **Enable GitHub provider**.
3. Dán **Client ID** và **Client Secret**.
4. Bấm **Save**.

---

## 3. 💻 HÀM SỬ DỤNG TRONG CODEBASE (CLIENT-SIDE)

Trong ứng dụng React, 2 hàm đã được tích hợp sẵn tại `src/services/authService.ts`:

```typescript
// Đăng nhập / Đăng ký bằng Google
await authService.signInWithGoogle();

// Đăng nhập / Đăng ký bằng GitHub
await authService.signInWithGitHub();
```

Khi bấm vào nút Google hoặc GitHub ở trang **Login** (`/login`) hoặc **Register** (`/register`), người dùng sẽ được chuyển hướng tới trang xác thực chính thức và quay trở lại ứng dụng với đầy đủ thông tin đăng nhập!
