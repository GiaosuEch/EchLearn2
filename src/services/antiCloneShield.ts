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

  const currentHost = window.location.hostname.toLowerCase();

  // 1. Domain Fingerprint Check
  const isAllowedDomain = ALLOWED_DOMAINS.some(
    (domain) => currentHost === domain || currentHost.endsWith('.' + domain) || currentHost.endsWith('.vercel.app')
  );

  if (!isAllowedDomain && import.meta.env.PROD) {
    console.warn('Unauthorized domain clone detected:', currentHost);
    // Redirect unauthorized clone attempts back to official domain
    window.location.href = 'https://echlearn.dpdns.org';
    return;
  }

  // 2. Anti-DevTools / Anti-Scraping Safeguards in Production
  if (import.meta.env.PROD) {
    // Disable Right-Click Context Menu on critical assets
    document.addEventListener('contextmenu', (e) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'IMG' || target.tagName === 'CANVAS' || target.closest('.no-copy'))) {
        e.preventDefault();
      }
    });

    // Disable F12, Ctrl+U, Ctrl+Shift+I inspect shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        // Prevent default shortcut
        e.preventDefault();
      }
    });
  }
}

export const antiCloneShield = {
  initialize: initializeAntiCloneShield,
};
