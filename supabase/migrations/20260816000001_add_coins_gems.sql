-- Add coins and gems to profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins integer not null default 100,
ADD COLUMN IF NOT EXISTS gems integer not null default 10;

-- RPC functions to safely increment coins and gems
CREATE OR REPLACE FUNCTION public.increment_profile_coins(amount_to_add INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET coins = coins + amount_to_add
  WHERE id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_profile_gems(amount_to_add INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET gems = gems + amount_to_add
  WHERE id = auth.uid();
END;
$$;
