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

const layout = read('src/components/layout/AppLayout.tsx');
if (!/discord_channel/.test(layout) || !/\/app\/community\/discord/.test(layout)) fail('Sidebar Discord navigation is missing');

const profile = read('src/pages/app/profile/ProfilePage.tsx');
if (!/profileWidgets/.test(profile) || !/getDiscordCommunityUrl/.test(profile)) fail('Profile page lacks Discord-style widgets/CTA');

const migration = read('supabase/migrations/010_discord_profile_polish.sql');
for (const token of ['discord_handle', 'profile_nameplate_id', 'discord_channel_url', 'show_discord_cta']) {
  if (!migration.includes(token)) fail(`Migration missing ${token}`);
}

const docs = read('docs/PHASE_20_DISCORD_COMMUNITY_PROFILE_REPORT.md');
if (!docs.includes('VITE_ECHLERN_DISCORD_URL')) fail('Phase 20 docs must mention Discord env var');

console.log('PASS: Phase 20 Discord community/profile polish verified.');
