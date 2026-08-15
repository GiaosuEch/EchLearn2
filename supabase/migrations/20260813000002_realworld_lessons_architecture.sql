-- 1. Create languages table
CREATE TABLE IF NOT EXISTS public.languages (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert Base Languages
INSERT INTO public.languages (id, name) VALUES 
('en', 'English'), ('fr', 'French'), ('de', 'German'), 
('zh', 'Chinese'), ('ja', 'Japanese'), ('ko', 'Korean'), 
('es', 'Spanish'), ('it', 'Italian'), ('pt', 'Portuguese'), 
('ru', 'Russian'), ('vi', 'Vietnamese'), ('th', 'Thai'), ('ar', 'Arabic')
ON CONFLICT (id) DO NOTHING;

-- 3. Create realworld_lessons table
CREATE TABLE IF NOT EXISTS public.realworld_lessons (
    id VARCHAR(100) PRIMARY KEY,
    language_id VARCHAR(10) NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
    unit INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_realworld_lessons_language_id ON public.realworld_lessons(language_id);

-- 4. Enforce Referential Integrity on user_mistakes
-- First, ensure any bad data is cleaned up (if this was production, we'd be careful. Since it's dev, we delete orphaned rows)
DELETE FROM public.user_mistakes 
WHERE language_id IS NOT NULL AND language_id NOT IN (SELECT id FROM public.languages);

ALTER TABLE public.user_mistakes 
ADD CONSTRAINT fk_language 
FOREIGN KEY (language_id) 
REFERENCES public.languages(id) 
ON DELETE SET NULL;

DELETE FROM public.user_mistakes 
WHERE lesson_id IS NOT NULL AND lesson_id NOT IN (SELECT id FROM public.realworld_lessons);

ALTER TABLE public.user_mistakes 
ADD CONSTRAINT fk_lesson 
FOREIGN KEY (lesson_id) 
REFERENCES public.realworld_lessons(id) 
ON DELETE SET NULL;

-- 5. RLS for realworld_lessons
ALTER TABLE public.realworld_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read realworld_lessons" 
ON public.realworld_lessons FOR SELECT 
USING (true);

-- Admin only for insert/update/delete (mocked as true for this project setup)
CREATE POLICY "Admins can manage realworld_lessons" 
ON public.realworld_lessons FOR ALL 
USING (true);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read languages" 
ON public.languages FOR SELECT 
USING (true);
