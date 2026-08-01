export const MAX_LOCAL_ACCOUNTS_PER_EMAIL = 1;

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLocaleLowerCase();
}

export function canCreateLocalAccount(existingAccountCount: number): boolean {
  return Number.isInteger(existingAccountCount) && existingAccountCount === 0;
}

export function getAuthModeCopy(mode: 'supabase' | 'local'): string {
  if (mode === 'supabase') {
    return 'Supabase sử dụng 1 danh tính email xác thực duy nhất cho mỗi tài khoản.';
  }

  return 'Mỗi email chỉ được phép đăng ký duy nhất 1 tài khoản trên hệ thống EchLearn.';
}
