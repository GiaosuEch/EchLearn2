-- 20260813000006_strict_jsonb_constraints.sql
-- Enforce structural integrity on immersion content JSONB columns

-- 1. Validation function for article content (must be array of paragraphs with text and paragraphId)
CREATE OR REPLACE FUNCTION public.is_valid_article_content(content jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    elem jsonb;
BEGIN
    IF jsonb_typeof(content) != 'array' THEN
        RETURN false;
    END IF;
    
    FOR elem IN SELECT * FROM jsonb_array_elements(content)
    LOOP
        IF NOT (elem ? 'paragraphId' AND elem ? 'text') THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;

-- 2. Validation function for podcast transcript (must be array of chunks with id, startTimeSec, endTimeSec, speaker, text)
CREATE OR REPLACE FUNCTION public.is_valid_podcast_transcript(transcript jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    elem jsonb;
BEGIN
    IF jsonb_typeof(transcript) != 'array' THEN
        RETURN false;
    END IF;
    
    FOR elem IN SELECT * FROM jsonb_array_elements(transcript)
    LOOP
        IF NOT (
            elem ? 'id' AND 
            elem ? 'startTimeSec' AND 
            elem ? 'endTimeSec' AND 
            elem ? 'speaker' AND 
            elem ? 'text'
        ) THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$$;

-- Apply the CHECK constraints
ALTER TABLE public.immersion_articles 
ADD CONSTRAINT ck_immersion_articles_content 
CHECK (public.is_valid_article_content(content));

ALTER TABLE public.immersion_podcasts 
ADD CONSTRAINT ck_immersion_podcasts_transcript 
CHECK (public.is_valid_podcast_transcript(transcript));
