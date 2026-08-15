-- Action: Create user_mistakes table for Event-Sourced Sync

CREATE TABLE IF NOT EXISTS public.user_mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    mistake TEXT NOT NULL,
    correction TEXT NOT NULL,
    notes TEXT,
    language_id VARCHAR(10),
    lesson_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;

-- Create Policies (Strict user isolation)
CREATE POLICY "Users can view their own mistakes" 
ON public.user_mistakes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mistakes" 
ON public.user_mistakes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mistakes" 
ON public.user_mistakes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mistakes" 
ON public.user_mistakes FOR DELETE 
USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX idx_user_mistakes_user_id ON public.user_mistakes(user_id);
CREATE INDEX idx_user_mistakes_language_id ON public.user_mistakes(language_id);
CREATE INDEX idx_user_mistakes_lesson_id ON public.user_mistakes(lesson_id);
