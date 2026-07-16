-- Supabase Database Schema for Ech Lern
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  native_language TEXT DEFAULT 'Vietnamese',
  target_languages TEXT[] DEFAULT '{"English"}',
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  bio TEXT,
  is_public_profile BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROGRESS & LEARNING
-- ============================================================================
CREATE TABLE learning_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id TEXT,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed', -- 'started', 'completed'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Mastery
CREATE TABLE vocabulary_mastery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0, -- 0-100
  next_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE grammar_mastery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE reading_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passage_id TEXT NOT NULL,
  score INTEGER,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listening_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE speaking_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  audio_url TEXT,
  feedback JSONB,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE writing_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  content TEXT NOT NULL,
  feedback JSONB,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- IELTS
-- ============================================================================
CREATE TABLE ielts_placement_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  estimated_band NUMERIC(3, 1),
  listening_score NUMERIC(3, 1),
  reading_score NUMERIC(3, 1),
  writing_score NUMERIC(3, 1),
  speaking_score NUMERIC(3, 1),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ielts_skill_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL, -- 'listening', 'reading', 'writing', 'speaking'
  task_id TEXT,
  band_score NUMERIC(3, 1),
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GAMIFICATION
-- ============================================================================
CREATE TABLE xp_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE streaks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
  id TEXT PRIMARY KEY, -- String ID like 'first_blood'
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- COMMUNITY
-- ============================================================================
CREATE TABLE community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  language TEXT,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE study_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  language TEXT,
  level TEXT,
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_group_members (
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (group_id, user_id)
);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read study group members"
    ON study_group_members FOR SELECT
    USING (true);

CREATE POLICY "Users can join groups"
    ON study_group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
    ON study_group_members FOR DELETE
    USING (auth.uid() = user_id);

-- Group Messages
DROP TABLE IF EXISTS group_messages CASCADE;
CREATE TABLE group_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can read messages"
    ON group_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM study_group_members
            WHERE study_group_members.group_id = group_messages.group_id
            AND study_group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can send messages"
    ON group_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM study_group_members
            WHERE study_group_members.group_id = group_messages.group_id
            AND study_group_members.user_id = auth.uid()
        )
        AND auth.uid() = author_id
    );

CREATE TABLE voice_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  topic TEXT,
  language TEXT,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_live BOOLEAN DEFAULT TRUE,
  max_participants INTEGER DEFAULT 10,
  study_timer INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE voice_room_participants (
  room_id UUID REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_speaking BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(room_id, user_id)
);

-- ============================================================================
-- ADMIN
-- ============================================================================
CREATE TABLE admin_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_placement_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_skill_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all (for community), but only update their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (is_public_profile = TRUE OR auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Private Progress: Only the user can view/update their own stats
DROP POLICY IF EXISTS "Users can view own learning_progress" ON learning_progress;
CREATE POLICY "Users can view own learning_progress" ON learning_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own learning_progress" ON learning_progress;
CREATE POLICY "Users can update own learning_progress" ON learning_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own lesson_attempts" ON lesson_attempts;
CREATE POLICY "Users can view own lesson_attempts" ON lesson_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own lesson_attempts" ON lesson_attempts;
CREATE POLICY "Users can update own lesson_attempts" ON lesson_attempts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own vocabulary_mastery" ON vocabulary_mastery;
CREATE POLICY "Users can manage own vocabulary_mastery" ON vocabulary_mastery FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own grammar_mastery" ON grammar_mastery;
CREATE POLICY "Users can manage own grammar_mastery" ON grammar_mastery FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own reading_attempts" ON reading_attempts;
CREATE POLICY "Users can manage own reading_attempts" ON reading_attempts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own listening_attempts" ON listening_attempts;
CREATE POLICY "Users can manage own listening_attempts" ON listening_attempts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own speaking_attempts" ON speaking_attempts;
CREATE POLICY "Users can manage own speaking_attempts" ON speaking_attempts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own writing_submissions" ON writing_submissions;
CREATE POLICY "Users can manage own writing_submissions" ON writing_submissions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own ielts_placement_results" ON ielts_placement_results;
CREATE POLICY "Users can manage own ielts_placement_results" ON ielts_placement_results FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own ielts_skill_attempts" ON ielts_skill_attempts;
CREATE POLICY "Users can manage own ielts_skill_attempts" ON ielts_skill_attempts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own xp_events" ON xp_events;
CREATE POLICY "Users can manage own xp_events" ON xp_events FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own streaks" ON streaks;
CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own user_achievements" ON user_achievements;
CREATE POLICY "Users can manage own user_achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- Community: Public reads, auth writes
DROP POLICY IF EXISTS "Anyone can read posts" ON community_posts;
CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own posts" ON community_posts;
CREATE POLICY "Users can insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Anyone can read comments" ON community_comments;
CREATE POLICY "Anyone can read comments" ON community_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own comments" ON community_comments;
CREATE POLICY "Users can insert own comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Anyone can read likes" ON community_likes;
CREATE POLICY "Anyone can read likes" ON community_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own likes" ON community_likes;
CREATE POLICY "Users can insert own likes" ON community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own likes" ON community_likes;
CREATE POLICY "Users can delete own likes" ON community_likes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read study groups" ON study_groups;
CREATE POLICY "Anyone can read study groups" ON study_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;
CREATE POLICY "Users can create study groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Anyone can read group members" ON study_group_members;
CREATE POLICY "Anyone can read group members" ON study_group_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join groups" ON study_group_members;
CREATE POLICY "Users can join groups" ON study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave groups" ON study_group_members;
CREATE POLICY "Users can leave groups" ON study_group_members FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_study_groups_updated_at ON study_groups;
CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON study_groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- ADDITIONAL POLICIES
-- ============================================================================

-- Achievements
DROP POLICY IF EXISTS "Anyone can read achievements" ON achievements;
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);

-- Voice Rooms
DROP POLICY IF EXISTS "Anyone authenticated can read voice_rooms" ON voice_rooms;
CREATE POLICY "Anyone authenticated can read voice_rooms" ON voice_rooms FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create own voice_rooms" ON voice_rooms;
CREATE POLICY "Users can create own voice_rooms" ON voice_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Host can update own voice_rooms" ON voice_rooms;
CREATE POLICY "Host can update own voice_rooms" ON voice_rooms FOR UPDATE USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Host can delete own voice_rooms" ON voice_rooms;
CREATE POLICY "Host can delete own voice_rooms" ON voice_rooms FOR DELETE USING (auth.uid() = host_id);

-- Voice Room Participants
DROP POLICY IF EXISTS "Authenticated users can read voice_room_participants" ON voice_room_participants;
CREATE POLICY "Authenticated users can read voice_room_participants" ON voice_room_participants FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join voice_rooms as themselves" ON voice_room_participants;
CREATE POLICY "Users can join voice_rooms as themselves" ON voice_room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participant row" ON voice_room_participants;
CREATE POLICY "Users can update own participant row" ON voice_room_participants FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave voice_rooms" ON voice_room_participants;
CREATE POLICY "Users can leave voice_rooms" ON voice_room_participants FOR DELETE USING (auth.uid() = user_id);

-- Admin Activity Logs (Locked down for now since no admin role exists)
DROP POLICY IF EXISTS "No public access to admin_activity_logs" ON admin_activity_logs;
CREATE POLICY "No public access to admin_activity_logs" ON admin_activity_logs FOR ALL USING (false);
