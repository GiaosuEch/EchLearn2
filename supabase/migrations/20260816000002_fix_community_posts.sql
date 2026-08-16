-- Add image_url to community_posts

ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS image_url text;
