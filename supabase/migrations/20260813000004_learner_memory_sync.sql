-- Create table for IELTS Essay Submissions (Learner Memory)
CREATE TABLE IF NOT EXISTS public.ielts_essay_submissions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    text TEXT NOT NULL,
    metrics JSONB NOT NULL,
    feedback JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ielts_essay_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Users can insert their own submissions"
    ON public.ielts_essay_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
    ON public.ielts_essay_submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
    ON public.ielts_essay_submissions FOR DELETE
    USING (auth.uid() = user_id);
