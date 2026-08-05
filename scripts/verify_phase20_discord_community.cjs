const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (msg) => { console.error(`FAIL: ${msg}`); process.exit(1); };

const required = [
  'src/data/communityLinks.ts',
  'src/data/socialPolish.ts',
  'src/pages/app/community/DiscordCommunityPage.tsx',
  'docs/PHASE_20_DISCORD_COMMUNITY_PROFILE_REPORT.md',
  'supabase/migrations/010_discord_profile_polish.sql',
];
for (const file of required) if (!exists(file)) fail(`${file} is missing`);

const customization = read('src/pages/app/customization/CustomizationPage.tsx');
if (/Facebook|profile\.php|facebookSkinRequestUrl/i.test(customization)) fail('Customization page still references Facebook');
if (!/Discord|discordSkinRequestUrl|getDiscordCommunityUrl/.test(customization)) fail('Customization page does not use Discord CTA');

const app = read('src/App.tsx');
if (!/DiscordCommunityPage/.test(app) || !/community\/discord/.test(app)) fail('Discord community route is missing');

// The sidebar links live in SidebarNav since the render-perf split; fall back
// to AppLayout so this stays green on older checkouts.
const sidebarSources = ['src/components/layout/SidebarNav.tsx', 'src/components/layout/AppLayout.tsx']
  .filter(exists)
  .map(read)
  .join('\n');
if (!/discord_channel/.test(sidebarSources) || !/\/app\/community\/discord/.test(sidebarSources)) fail('Sidebar Discord navigation is missing');

const profile = read('src/pages/app/profile/ProfilePage.tsx');
if (!/profileWidgets/.test(profile) || !/getDiscordCommunityUrl|isDiscordInviteConfigured/.test(profile)) fail('Profile page lacks Discord-style widgets/CTA');

const migration = read('supabase/migrations/010_discord_profile_polish.sql');
for (const token of ['discord_handle', 'profile_nameplate_id', 'discord_channel_url', 'show_discord_cta']) {
  if (!migration.includes(token)) fail(`Migration missing ${token}`);
}

const docs = read('docs/PHASE_20_DISCORD_COMMUNITY_PROFILE_REPORT.md');
if (!docs.includes('VITE_ECHLERN_DISCORD_URL')) fail('Phase 20 docs must mention Discord env var');

// A `discord.com/channels/...` deep link is member-only and 404s for everyone
// the invite is meant to reach, so it must never come back as a hardcoded CTA.
const links = read('src/data/communityLinks.ts');
if (!/https:\/\/discord\.gg\/[\w-]+/.test(links)) fail('communityLinks must ship a discord.gg invite link');
const discordPages = [
  'src/data/communityLinks.ts',
  'src/pages/app/community/DiscordCommunityPage.tsx',
  'src/pages/app/community/CommunityFeedPage.tsx',
  'src/pages/app/profile/ProfilePage.tsx',
  'src/pages/app/customization/CustomizationPage.tsx',
];
for (const file of discordPages) {
  const source = read(file);
  if (/https:\/\/discord(app)?\.com\/channels\//.test(source)) fail(`${file} still hardcodes a Discord channel deep link`);
  // Only a real URL counts — the normalizer legitimately names the typo it repairs.
  if (/https?:\/\/dcd\.gg/.test(source)) fail(`${file} still uses the dcd.gg typo`);
  const unsafeExternal = source.match(/target="_blank"(?![^>]*rel="noopener noreferrer")/g);
  if (unsafeExternal) fail(`${file} has ${unsafeExternal.length} target="_blank" link(s) without rel="noopener noreferrer"`);
}

console.log('PASS: Phase 20 Discord community/profile polish verified.');
