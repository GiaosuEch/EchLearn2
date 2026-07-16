# Netlify Deployment — Ech Lern

## Goal

A normal learner should only visit the website and create an account. They should never see Supabase setup instructions.

## Steps

1. Push the source code to GitHub.
2. Create a Netlify site from the repository.
3. Set build command:

```bash
npm run build
```

4. Set publish directory:

```txt
dist
```

5. Add environment variables in Netlify:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

6. Do **not** add service-role/private values to Netlify frontend env.

## SPA routing

This repo includes both:
- `public/_redirects`
- `netlify.toml`

Both point unknown routes back to `/index.html` so refresh works on `/app/...` pages.

## Production checks

Before sharing the public URL:

```bash
node scripts/check_supabase_env.cjs
node scripts/audit_no_service_role_frontend.cjs
node scripts/verify_supabase_migrations.cjs
node scripts/verify_auth_routes.cjs
node scripts/verify_vocab_counts.cjs
node scripts/audit_vocab_quality.cjs
node scripts/verify_lesson_options.cjs
node scripts/audit_ui_i18n_runtime.cjs
npm run build
```

Manual checks:
- New user can sign up without creating Supabase.
- If email confirmation is on, user sees the email confirmation message.
- Login persists after refresh.
- Settings save and reload.
- Profile edits save and reload.
- Lesson progress can be recorded.
- Friends/chat/rooms show honest empty states or stored data.

## Optional Spotify env

For Music & Podcast Lab live Spotify authorization, add:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

Do not add Spotify client secret. Without this env var, the app still shows curated Spotify search links for each target language.
