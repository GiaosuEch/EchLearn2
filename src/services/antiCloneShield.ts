/**
 * Anti-Cloning & Intellectual Property Shield for EchLearn Platform
 * Protects source code, backend APIs, domain integrity, and curriculum assets.
 */

const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'echlearn.dpdns.org',
  'echlearn2.vercel.app',
  'echlearn.netlify.app',
];

export function initializeAntiCloneShield() {
  if (typeof window === 'undefined') return;

  // Developer Bypass Override: localStorage.setItem('echlearn_dev_override', 'true')
  try {
    if (localStorage.getItem('echlearn_dev_override') === 'true') {
      console.info('[EchLearn Shield] Developer override active. Anti-inspection disabled.');
      return;
    }
  } catch {}

  const currentHost = window.location.hostname.toLowerCase();

  // 1. Domain Fingerprint Check
  const isAllowedDomain = ALLOWED_DOMAINS.some(
    (domain) => currentHost === domain || currentHost.endsWith('.' + domain) || currentHost.endsWith('.vercel.app')
  );

  if (!isAllowedDomain && import.meta.env.PROD) {
    console.warn('Unauthorized domain clone detected:', currentHost);
    window.location.href = 'https://echlearn.dpdns.org';
    return;
  }

  // 2. Console Defense & Enterprise Security Notice
  try {
    const bannerStyle = 'color: #10B981; font-weight: 900; font-size: 16px; background: #064E3B; padding: 8px 16px; border-radius: 8px;';
    const warningStyle = 'color: #EF4444; font-weight: bold; font-size: 12px; margin-top: 4px;';
    console.log('%c🛡️ ECHLEARN ENTERPRISE SECURITY SHIELD ACTIVE', bannerStyle);
    console.log('%c⚠️ CẢNH BÁO: Đây là tính năng dành riêng cho lập trình viên hệ thống. Mọi hành vi cố tình dịch ngược mã nguồn (Reverse Engineering) hoặc khai thác API đều được ghi nhận trong Immutable Audit Log.', warningStyle);
  } catch {}

  // 3. Anti-Inspection & Anti-Scraping Safeguards in Production / Active Mode
  // Disable Right-Click Context Menu (except on standard editable inputs)
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement | null;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (!isInput) {
      e.preventDefault();
    }
  });

  // Disable DevTools / View-Source Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const key = e.key?.toLowerCase();

    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }

    // Ctrl+Shift+I / J / C (Inspect / Console / Element Picker)
    if (isCtrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault();
      return;
    }

    // Ctrl+U (View Source)
    if (isCtrlOrCmd && key === 'u') {
      e.preventDefault();
      return;
    }

    // Ctrl+S (Save Page HTML)
    if (isCtrlOrCmd && key === 's') {
      e.preventDefault();
      return;
    }
  });

  // 4. Anti-Debugger Deterrent (Production Only)
  if (import.meta.env.PROD) {
    setInterval(() => {
      const startTime = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const executionTime = performance.now() - startTime;
      if (executionTime > 100) {
        // DevTools breakpoint was hit
        try {
          console.clear();
          console.warn('[EchLearn Shield] DevTools inspection monitored and recorded.');
        } catch {}
      }
    }, 2000);
  }
}

export const antiCloneShield = {
  initialize: initializeAntiCloneShield,
};

