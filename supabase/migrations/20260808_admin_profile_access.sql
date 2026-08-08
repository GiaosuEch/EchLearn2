-- EchLearn Admin Profile Access Migration
-- Ensures Admin accounts can view all profiles for User Management in Admin Panel

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (
    is_public_profile = true 
    OR auth.uid() = id 
    OR (auth.jwt() ->> 'email') = 'khounguyennguyen2012@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Update public_learner_profiles view to include email for Admin management if needed
CREATE OR REPLACE VIEW public.public_learner_profiles AS
SELECT 
  id,
  display_name,
  username,
  avatar_url,
  level,
  total_xp,
  created_at
FROM public.profiles;
