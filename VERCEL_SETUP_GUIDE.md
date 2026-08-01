# 🚀 HƯỚNG DẪN SETUP & DEPLOY ECHLEARN LÊN VERCEL

Tệp hướng dẫn nhanh cấu hình Vercel, cài đặt Biến môi trường và trỏ DNS cho tên miền **`echlearn.dpdns.org`**.

---

## 1. 🔑 DANH SÁCH BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

Copy và dán các biến sau vào phần **Environment Variables** trên Vercel Dashboard:

### ⚡ Biến Bắt Buộc (Supabase Auth & Database)
| Key | Value Mẫu / Mô Tả |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` *(Public Anon Key từ Supabase Dashboard)* |
| `VITE_ENABLE_SUPABASE` | `true` |

### 🛠️ Biến Tùy Chọn (Tính Năng Bổ Sung)
| Key | Mô Tả |
| :--- | :--- |
| `VITE_SPOTIFY_CLIENT_ID` | Client ID từ Spotify Developer App *(Cho trang Lofi/Podcast)* |
| `VITE_EMAILJS_SERVICE_ID` | Service ID gửi mail OTP khôi phục mật khẩu |
| `VITE_EMAILJS_TEMPLATE_ID` | Template ID EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | Public Key EmailJS |
| `VITE_ECHLERN_DISCORD_URL` | Link mời tham gia Discord Cộng đồng |

> ⚠️ **LƯU Ý BẢO MẬT**: Tuyệt đối **KHÔNG** đưa `SUPABASE_SERVICE_ROLE_KEY` hoặc bất kỳ Private Key nào vào Vercel Environment Variables của Frontend Vite!

---

## 2. 🌐 CẤU HÌNH BẢN GHI DNS (CHO TÊN MIỀN `echlearn.dpdns.org`)

Mở trang Quản lý DNS (như Cloudflare, DPDNS, hoặc Nhà cung cấp tên miền của bạn) và thêm bản ghi:

### Đối với Subdomain (`echlearn.dpdns.org`)
* **Type**: `CNAME`
* **Name / Host**: `echlearn` *(hoặc `echlearn.dpdns.org` tùy giao diện)*
* **Target / Points to**: `cname.vercel-dns.com`
* **TTL**: Auto / 3600
* **Proxy status** *(nếu dùng Cloudflare)*: **DNS only** *(Tắt đám mây cam để Vercel tự cấp chứng chỉ SSL Let's Encrypt)*

### (Tham khảo) Đối với Apex Domain (`dpdns.org`)
* **Type**: `A`
* **Name / Host**: `@`
* **Value / IP**: `76.76.21.21` *(Địa chỉ IP Vercel)*

---

## 3. 🎯 CÁC BƯỚC THAO TÁC TRÊN VERCEL DASHBOARD

1. **Import Project**:
   - Mở [Vercel Dashboard](https://vercel.com/dashboard) $\rightarrow$ Bấm **`Add New...`** $\rightarrow$ Chọn **`Project`**.
   - Tìm và bấm **`Import`** tại repository **`EchLearn`** (hoặc `ANTI_Phase20_avatar_mascot_fix`).

2. **Cấu hình Framework & Build**:
   - **Framework Preset**: Chọn **`Vite`** *(Vercel tự phát hiện)*.
   - **Root Directory**: `./` *(Để mặc định)*.
   - **Build Command**: `npm run build` *(Để mặc định)*.
   - **Output Directory**: `dist` *(Để mặc định)*.

3. **Dán Environment Variables**:
   - Mở mục **`Environment Variables`**.
   - Copy & dán `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, và `VITE_ENABLE_SUPABASE=true`.

4. **Deploy & Thêm Tên Miền**:
   - Bấm nút **`Deploy`** và đợi 1-2 phút để Vercel build xong.
   - Sau khi deploy thành công, truy cập **`Settings`** $\rightarrow$ **`Domains`**.
   - Nhập `echlearn.dpdns.org` $\rightarrow$ Bấm **`Add`**.
