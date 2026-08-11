export function getTurnstileSiteKey(value: string | undefined): string | null {
  const key = value?.trim();
  return key || null;
}

export function turnstileSubmissionError({ siteKey, token }: { siteKey: string | null; token: string | null }): string | null {
  if (siteKey && !token) return 'Vui lòng hoàn tất bước xác minh chống bot trước khi tiếp tục.';
  return null;
}
