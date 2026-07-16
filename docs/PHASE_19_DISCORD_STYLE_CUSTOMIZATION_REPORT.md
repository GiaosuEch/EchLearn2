# Phase 19 — Discord-style Customization + Frog Mascot Wardrobe

## Goal

Add a user-facing customization layer so Ech Lern can feel personal like a social/Discord-style app:

- runtime accent color palettes;
- UI surface style choices;
- animated frog mascot skin system;
- 100+ mascot skins;
- safe skin request/update pathway;
- local persistence through Zustand;
- optional Supabase persistence through `user_settings` migration.

## Copyright / asset rule

The mascot remains an original Ech Lern frog. Skins are original outfits inspired by seasons, weather, streetwear, fantasy, sci-fi, school, sports, music, travel, festivals, and anime fashion. The app does not bundle protected anime character costumes, logos, or trademarked symbols.

If a specific licensed anime outfit is desired later, it must be added only with licensed/legal artwork.

## New route

- `/app/customize`

## Main files

- `src/data/customization.ts`
- `src/services/customizationService.ts`
- `src/pages/app/customization/CustomizationPage.tsx`
- `src/components/mascot/Mascot.tsx`
- `src/stores/appStore.ts`
- `src/components/layout/AppLayout.tsx`
- `src/App.tsx`
- `supabase/migrations/009_cosmetic_customization.sql`

## User-facing features

### Theme palettes

Twelve runtime palettes are available, including frog default, Discord-like blurple, cyber lime, winter frost, sakura, ocean, aurora, and more. They update CSS variables used by the Tailwind v4 design system.

### UI surface styles

- Glass
- Solid
- Cozy
- Compact

### Mascot skins

The app now includes more than 100 original frog mascot skins. Categories:

- Starter
- Seasonal
- Weather
- Anime-inspired
- Streetwear
- Fantasy
- Sci-fi
- School
- Sports
- Music
- Travel
- Festival

### Persistence

Settings persist locally through `echlern-app-storage`. If the user is logged in and Supabase is configured, cosmetic choices can be saved to `user_settings`.

## Supabase migration

Run:

```sql
supabase/migrations/009_cosmetic_customization.sql
```

It adds:

- `accent_palette_id`
- `mascot_skin_id`
- `ui_surface`
- `mascot_animation`
- `seasonal_effects`

## Verification

New scripts:

```bash
node scripts/verify_customization_system.cjs
node scripts/verify_mascot_skins.cjs
npm run verify:phase19
```

## Manual QA checklist

1. Open `/app/customize`.
2. Change accent palette.
3. Confirm colors update immediately across sidebar/buttons/cards.
4. Choose several frog skins.
5. Confirm mascot preview and app mascot update.
6. Toggle animation and seasonal effects.
7. Refresh the page and confirm choices persist.
8. Open `/app/settings` and `/app/dashboard` to ensure UI still works.
9. Check no protected anime names/logos are bundled as official assets.
