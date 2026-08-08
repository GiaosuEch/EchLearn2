import { Outlet, Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import EchLearnLogo from '../brand/EchLearnLogo';
import { useAuthStore } from '../../stores/authStore';

const navLinks = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Về EchLearn', path: '/about' },
  { label: 'Ngôn ngữ', path: '/languages' },
  { label: 'IELTS', path: '/ielts-program' },
  { label: 'Cộng đồng', path: '/community-preview' },
  { label: 'Gói học', path: '/pricing' },
];

export default function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  return (
    <div className="ech-public min-h-screen bg-[var(--ech-canvas)] text-[var(--ech-text)]">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-[70] -translate-y-20 rounded-md bg-[var(--ech-action)] px-4 py-3 text-sm font-bold text-slate-950 transition-transform focus:translate-y-0"
      >
        Đi đến nội dung chính
      </a>

      {/* The landing owns its chapter navigation; secondary public pages use this fixed shell. */}
      {!isHomePage && (
        <nav
          aria-label="Public navigation"
          className="fixed inset-x-0 top-0 z-50 border-b border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[var(--ech-canvas)]/95 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-sm"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex min-h-11 items-center rounded-md text-[var(--ech-text)]">
                <EchLearnLogo compact />
              </Link>

              <div className="hidden items-center gap-1 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                    className={`min-h-11 rounded-md px-4 py-2 text-sm transition-colors duration-200 ${
                      location.pathname === link.path
                        ? 'bg-[color-mix(in_srgb,var(--ech-action)_16%,transparent)] font-semibold text-[var(--ech-text)]'
                        : 'text-[var(--ech-text-muted)] hover:bg-[color-mix(in_srgb,var(--ech-surface-2)_72%,transparent)] hover:text-[var(--ech-text)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="hidden items-center gap-3 md:flex">
                {isAuthenticated && user ? (
                  <Link to="/app" className="min-h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-sm font-black text-slate-950 transition-colors flex items-center gap-2 shadow-md">
                    <span>Vào Học (Dashboard)</span> ➔
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="min-h-11 rounded-md px-4 py-2 text-sm text-[var(--ech-text-muted)] transition-colors hover:text-[var(--ech-text)]">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="min-h-11 rounded-md bg-[var(--ech-action)] px-5 py-2 text-sm font-bold text-slate-950 transition-colors hover:brightness-110">
                      Bắt đầu miễn phí
                    </Link>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-label={mobileMenu ? 'Đóng điều hướng' : 'Mở điều hướng'}
                aria-expanded={mobileMenu}
                aria-controls="public-mobile-menu"
                className="min-h-11 min-w-11 rounded-md p-2 text-[var(--ech-text)] transition-colors hover:bg-[var(--ech-surface-2)] md:hidden"
              >
                {mobileMenu ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mobileMenu && (
            <div id="public-mobile-menu" className="border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[var(--ech-surface-1)] md:hidden">
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenu(false)}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                    className="block min-h-11 rounded-md px-4 py-3 text-[var(--ech-text-muted)] hover:bg-[var(--ech-surface-2)] hover:text-[var(--ech-text)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] pt-4">
                  <Link to="/login" onClick={() => setMobileMenu(false)} className="min-h-11 rounded-md border border-[color-mix(in_srgb,var(--ech-text-muted)_35%,transparent)] px-4 py-3 text-center text-[var(--ech-text)] hover:bg-[var(--ech-surface-2)]">
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenu(false)} className="min-h-11 rounded-md bg-[var(--ech-action)] px-4 py-3 text-center font-bold text-slate-950 hover:brightness-110">
                    Bắt đầu miễn phí
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}

      <main id="main-content" tabIndex={-1} className={isHomePage ? '' : 'pt-16'}>
        <Outlet />
      </main>

      <footer className="border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] bg-[var(--ech-surface-1)] py-12 text-[var(--ech-text-muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center">
                <EchLearnLogo compact />
              </div>
              <p className="text-sm">Học theo lộ trình rõ ràng, theo dõi tiến độ và luyện tập cùng cộng đồng.</p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--ech-text)]">Sản phẩm</h4>
              <div className="space-y-2 text-sm">
                <Link to="/languages" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">Ngôn ngữ</Link>
                <Link to="/ielts-program" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">Chương trình IELTS</Link>
                <Link to="/pricing" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">Gói học</Link>
                <Link to="/about" className="block rounded-sm transition-colors hover:text-[var(--ech-action)]">Về EchLearn</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--ech-text)]">Tính năng</h4>
              <div className="space-y-2 text-sm">
                <p>Luyện nói</p>
                <p>Luyện viết</p>
                <p>Nhóm học</p>
                <p>Phòng trò chuyện</p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--ech-text)]">Thông tin</h4>
              <div className="space-y-2 text-sm">
                <p>Chính sách riêng tư</p>
                <p>Điều khoản sử dụng</p>
                <p>Chính sách cookie</p>
                <p>Liên hệ</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[color-mix(in_srgb,var(--ech-text-muted)_18%,transparent)] pt-8 sm:flex-row">
            <div className="space-y-1 text-left">
              <p className="text-sm">© 2025 EchLearn. Bảo lưu mọi quyền.</p>
              <p className="text-xs">Học theo lộ trình rõ ràng, có bài kiểm tra mốc và kết quả đầu ra theo từng giai đoạn.</p>
              <p className="text-xs">Một số tính năng đánh giá tự động đang được phát triển và sẽ được thông báo khi sẵn sàng.</p>
            </div>
            <p className="text-sm">Được xây dựng cho người học ngôn ngữ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
