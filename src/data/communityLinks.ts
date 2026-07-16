export const DEFAULT_DISCORD_INVITE_URL = 'https://discord.com/channels/@me';

export function getDiscordCommunityUrl(): string {
  const configured = (import.meta.env.VITE_ECHLERN_DISCORD_URL || import.meta.env.VITE_DISCORD_INVITE_URL || '').trim();
  return configured || DEFAULT_DISCORD_INVITE_URL;
}

export function getDiscordSetupHint(isVi = true): string {
  return isVi
    ? 'Chưa cấu hình link kênh Discord thật. Thêm VITE_ECHLERN_DISCORD_URL vào .env hoặc Netlify để nút này mở đúng server/kênh của bạn.'
    : 'Discord channel URL is not configured yet. Add VITE_ECHLERN_DISCORD_URL to .env or Netlify so this button opens your real server/channel.';
}
