# Phase 20 — Discord Community + Profile Polish Report

## Goal
Move all skin requests and community feedback away from Facebook and into the owner's Discord channel, while making profile/community screens feel closer to Discord-style customization.

## Product decisions
- End users do not configure Discord.
- The app owner sets `VITE_ECHLERN_DISCORD_URL` in `.env` or Netlify.
- If the Discord link is not configured, the app shows a clear owner setup hint instead of silently sending users to the wrong place.
- Anime-style skins remain original frog outfits inspired by fashion/anime; no copyrighted logos or characters are bundled.

## Added
- `/app/community/discord` route.
- Sidebar navigation item for Discord.
- Discord channel cards for welcome, skin requests, study rooms, voice lounge, and bug feedback.
- Customization page CTA changed from Facebook to Discord.
- Discord-style profile board with nameplate, mascot skin, widgets, and Discord CTA.
- Migration `010_discord_profile_polish.sql` for profile/nameplate/Discord fields.
- Verification script `scripts/verify_phase20_discord_community.cjs`.

## Environment variable
```env
VITE_ECHLERN_DISCORD_URL=https://discord.gg/your-invite-or-channel
```

## Manual QA
1. Open `/app/customize`.
2. Confirm the skin request button says Discord, not Facebook.
3. Open `/app/community/discord`.
4. Confirm Discord setup hint appears if no URL is configured.
5. Add `VITE_ECHLERN_DISCORD_URL`, restart Vite, and confirm buttons open your Discord link.
6. Open `/app/profile` and confirm nameplate/widgets/Discord CTA render.

## Known limitations
- The real Discord invite/channel URL must be provided by the owner.
- The app does not use the Discord API yet; it opens the configured Discord community link.
