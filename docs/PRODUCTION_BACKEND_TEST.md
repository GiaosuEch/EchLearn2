# Production Backend Test Checklist

This checklist ensures that Ech Lern is fully integrated with your live Supabase project in a production environment (like Netlify).

## Step 1: Infrastructure Setup
- [ ] **Create Supabase project**: Go to [Supabase](https://supabase.com) and create a new project.
- [ ] **Run schema.sql**: In the Supabase SQL Editor, run the complete `supabase/schema.sql` script to create all 23 tables and RLS policies.
- [ ] **Add env keys locally**: Create a `.env` file at the root of your project and add:
  - `VITE_SUPABASE_URL=your_project_url`
  - `VITE_SUPABASE_ANON_KEY=your_anon_key`
- [ ] **Add env keys in Netlify**: Go to your Netlify site settings -> Environment Variables, and add the same two variables.
- [ ] **Redeploy Netlify**: Trigger a manual deploy in Netlify so the build picks up the new environment variables.

## Step 2: Auth and Profile Test
- [ ] **Register test user**: Go to your deployed app, click "Get Started" and create a new account.
- [ ] **Check Auth**: Open Supabase dashboard -> Authentication -> Users. Verify the user is created.
- [ ] **Check Profile**: Open Supabase dashboard -> Table Editor -> `profiles`. Verify a row exists for the new user.

## Step 3: Core Learning Loop
- [ ] **Complete lesson**: Navigate to a lesson in the app, answer the exercises, and finish the lesson.
- [ ] **Check Supabase table rows**: 
  - Verify a row in `lesson_attempts`.
  - Verify a row in `xp_events` (for lesson completion XP).
  - Verify `learning_progress` is updated (XP added).

## Step 4: Community & Social
- [ ] **Create community post**: Go to the Community tab and create a new post. Verify it appears in the `community_posts` table.
- [ ] **Create voice room**: Go to the Voice Rooms tab and create a room. Verify it appears in the `voice_rooms` table.

## Step 5: Advanced Features
- [ ] **Run IELTS diagnostic**: Go to the IELTS section and complete the 4-question placement test.
- [ ] **Verify dashboard updates**: Check your dashboard. The IELTS estimated band should now be visible and pulling from `ielts_placement_results`.

## Troubleshooting
If data is not writing:
1. Open the Developer Tools (F12) -> Console, check for CORS or RLS policy errors.
2. Verify the Backend Health Panel (available to admin users) shows "Supabase Live Mode".
3. Check `supabase/schema.sql` to ensure RLS allows `INSERT` for authenticated users (`auth.uid() = user_id`).
