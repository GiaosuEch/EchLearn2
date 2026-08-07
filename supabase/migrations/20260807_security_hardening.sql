-- EchLearn Platform Security Hardening Migration
-- 1. Enable Row Level Security (RLS) on all user data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ielts_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Security Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( is_public_profile = true OR auth.uid() = id );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 3. Strict Owner-Only Access for Learning & IELTS Results
DROP POLICY IF EXISTS "Users can view own learning_progress" ON public.learning_progress;
CREATE POLICY "Users can view own learning_progress" ON public.learning_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own learning_progress" ON public.learning_progress;
CREATE POLICY "Users can manage own learning_progress" ON public.learning_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own lesson_attempts" ON public.lesson_attempts;
CREATE POLICY "Users can view own lesson_attempts" ON public.lesson_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own lesson_attempts" ON public.lesson_attempts;
CREATE POLICY "Users can insert own lesson_attempts" ON public.lesson_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own ielts_results" ON public.ielts_results;
CREATE POLICY "Users can view own ielts_results" ON public.ielts_results FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own ielts_results" ON public.ielts_results;
CREATE POLICY "Users can insert own ielts_results" ON public.ielts_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Community Post Security Policy
DROP POLICY IF EXISTS "Everyone can view community posts" ON public.community_posts;
CREATE POLICY "Everyone can view community posts" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 5. Safe Public Profile View (hides sensitive fields)
CREATE OR REPLACE VIEW public.public_learner_profiles AS
SELECT 
  id,
  display_name,
  username,
  avatar_url,
  level,
  xp,
  streak,
  ielts_target_band,
  created_at
FROM public.profiles
WHERE is_public_profile = true;
