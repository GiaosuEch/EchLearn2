export function validateNewPassword(password: string, confirmation: string): string | null {
  if (password.length < 8) return 'Mật khẩu mới cần có ít nhất 8 ký tự.';
  if (password !== confirmation) return 'Hai mật khẩu mới không khớp.';
  return null;
}
