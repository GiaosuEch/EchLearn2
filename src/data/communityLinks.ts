/**
 * Canonical Discord invite for the EchLearn community server.
 *
 * It must stay in the `discord.gg/<code>` (or `discord.com/invite/<code>`)
 * form: that is the only shape that opens the join dialog for someone who is
 * not a member yet. A `discord.com/channels/<guild>/<channel>` deep link is a
 * dead end for them — it resolves to their own DM list or a 404.
 */
export const DISCORD_INVITE_URL = 'https://discord.gg/ech-lern-sv';

/** @deprecated Kept as an alias so existing imports keep resolving. */
export const DEFAULT_DISCORD_INVITE_URL = DISCORD_INVITE_URL;

export const FACEBOOK_COMMUNITY_URL = 'https://www.facebook.com/profile.php?id=61576223186362';

/**
 * Accepts only real invite links, and repairs the two mistakes we have
 * actually shipped: the `dcd.gg` typo, and channel deep links pasted from the
 * desktop client's "Copy Link" (which is a per-channel URL, not an invite).
 * Anything unusable returns null so callers fall back to the canonical invite
 * instead of routing learners to a broken page.
 */
export function normalizeDiscordInviteUrl(raw: string | undefined | null): string | null {
  const value = (raw || '').trim();
  if (!value) return null;

  // Channel deep links are member-only; treat them as unconfigured.
  if (/discord(app)?\.com\/channels\//i.test(value)) return null;

  // `dcd.gg` / `discrod.gg` style typos of the invite host.
  const typoRepaired = value.replace(/^(https?:\/\/)?(dcd|discrod|discord)\.gg\//i, 'https://discord.gg/');

  if (/^https:\/\/discord\.gg\/[\w-]+$/i.test(typoRepaired)) return typoRepaired;
  if (/^https:\/\/discord(app)?\.com\/invite\/[\w-]+$/i.test(typoRepaired)) return typoRepaired;

  // A bare invite code, e.g. `aB3xYz9`.
  if (/^[\w-]+$/.test(value)) return `https://discord.gg/${value}`;

  return null;
}

export function getDiscordCommunityUrl(): string {
  const configured = import.meta.env.VITE_ECHLERN_DISCORD_URL || import.meta.env.VITE_DISCORD_INVITE_URL;
  return normalizeDiscordInviteUrl(configured) || DISCORD_INVITE_URL;
}

/**
 * False only when a deployment overrode the invite with something unusable —
 * the shipped default is always a well-formed invite, so the setup hint stays
 * out of the way in normal operation.
 */
export function isDiscordInviteConfigured(): boolean {
  return Boolean(getDiscordCommunityUrl());
}

export function getFacebookCommunityUrl(): string {
  const configured = (import.meta.env.VITE_ECHLERN_FACEBOOK_URL || '').trim();
  return configured || FACEBOOK_COMMUNITY_URL;
}

export function getDiscordSetupHint(isVi = true): string {
  return isVi
    ? 'Chưa cấu hình link mời Discord thật. Thêm VITE_ECHLERN_DISCORD_URL (dạng https://discord.gg/<mã-mời>) vào .env hoặc Netlify để nút này mở đúng server của bạn.'
    : 'Discord invite link is not configured yet. Add VITE_ECHLERN_DISCORD_URL (as https://discord.gg/<invite-code>) to .env or Netlify so this button opens your real server.';
}
