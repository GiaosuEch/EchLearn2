# Phase 12.9 — AI Onboarding, Unique Placement, and Music/Podcast Integration

## Product decision

Normal learners must not configure Supabase or Spotify. The app owner configures production credentials once. Learners only sign up, answer the AI level question, take a personal placement test, and follow a roadmap.

## What changed

- Added AI onboarding route: `/app/ai-onboarding`.
- After registration, logged-in learners are sent to the AI placement coach before the roadmap.
- The AI coach asks the learner to self-assess:
  - Chưa biết gì / I know nothing yet
  - Biết chút ít / I know a little
  - Biết rồi / I already know the basics
  - Thông thạo / comfortable or fluent
- Added deterministic unique placement generation using account id, target language, native language, self-assessed level, and attempt time.
- Added transparent local scoring and an 8-week personalized roadmap.
- Added Music & Podcast Lab route: `/app/music`.
- Added Spotify-ready PKCE integration with curated fallback search links by target language.
- Added Supabase migration `006_ai_onboarding_music.sql` for AI placement records and saved learning media.
- Added verification scripts for AI personalization and media integration.

## Honesty rule

The app does not claim a certified score. It shows local AI estimates and explains that the roadmap updates as the learner studies. This avoids fake claims while still giving useful personalization.

## Spotify rule

Spotify Web API requires authorization. For browser apps, use Authorization Code with PKCE. `VITE_SPOTIFY_CLIENT_ID` may be public, but client secret must never be exposed in frontend code.

## Manual tests

1. Register a new user.
2. Select native language and target language.
3. Confirm the app redirects to `/app/ai-onboarding`.
4. Choose a level.
5. Verify a placement test appears and is not blank.
6. Submit answers.
7. Verify an estimated level and 8-week roadmap appears.
8. Open `/app/music`.
9. Verify songs and podcasts are shown for the target language.
10. If Spotify client id is missing, verify the app shows a clear fallback message.

## Known limitations

- The current AI is a local deterministic engine, not a server LLM.
- Spotify live API search requires app owner to create a Spotify Developer app and set `VITE_SPOTIFY_CLIENT_ID`.
- Song/podcast suggestions use curated search links until Spotify OAuth is configured.
