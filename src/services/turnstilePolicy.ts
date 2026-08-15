export function getTurnstileSiteKey(value: string | undefined): string | null {
  const key = value?.trim();
  return key || null;
}

// `import.meta.env` is injected by Vite, but is absent when this policy is
// evaluated by Node-only tests or local tooling. An unconfigured key is the
// intentional inactive state, not a module-load failure.
export const turnstileSiteKey = getTurnstileSiteKey(import.meta.env?.VITE_TURNSTILE_SITE_KEY);

export function turnstileSubmissionError({ siteKey, token }: { siteKey: string | null; token: string | null }): string | null {
  if (siteKey && !token) return 'Vui lòng hoàn tất bước xác minh chống bot trước khi tiếp tục.';
  return null;
}
