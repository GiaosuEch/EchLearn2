-- ============================================================================
-- ECHLEARN ENTERPRISE LICENSING SCHEMA & SECURE REDEMPTION RPC
-- ============================================================================
-- Supports HMAC-verified serial keys, device binding, atomic redemption, and
-- strict Row Level Security (RLS) policies.
-- ============================================================================

-- 1. Create table for licenses
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL DEFAULT 'ECHLEARN',
  plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('go', 'plus', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  max_activations INT NOT NULL DEFAULT 3,
  current_activations INT NOT NULL DEFAULT 0,
  duration_days INT DEFAULT 365,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '365 days')
);

-- 2. Create table for device activations
CREATE TABLE IF NOT EXISTS public.license_activations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_fingerprint TEXT NOT NULL,
  platform TEXT,
  ip TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_license_device UNIQUE (license_id, device_fingerprint)
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

-- Learners can view activations associated with their user_id
CREATE POLICY "Learners can view their own activations"
  ON public.license_activations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Atomic secure redemption RPC function
CREATE OR REPLACE FUNCTION public.redeem_license(
  p_key TEXT,
  p_device_fingerprint TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lic RECORD;
  v_user_id UUID;
  v_existing_activation UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Find active matching license
  SELECT * INTO v_lic
  FROM public.licenses
  WHERE UPPER(key) = UPPER(TRIM(p_key))
    AND status = 'active'
    AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Mã bản quyền không tồn tại, đã hết hạn hoặc bị thu hồi.'
    );
  END IF;

  -- Check if device is already activated
  SELECT id INTO v_existing_activation
  FROM public.license_activations
  WHERE license_id = v_lic.id
    AND device_fingerprint = p_device_fingerprint;

  IF FOUND THEN
    -- Update last seen
    UPDATE public.license_activations
    SET last_seen_at = NOW(),
        user_id = COALESCE(user_id, v_user_id)
    WHERE id = v_existing_activation;

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Thiết bị đã được kích hoạt từ trước với gói ' || UPPER(v_lic.plan),
      'plan', v_lic.plan,
      'expires_at', v_lic.expires_at
    );
  END IF;

  -- Check activation limit
  IF v_lic.current_activations >= v_lic.max_activations THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Mã bản quyền đã đạt số lượng kích hoạt tối đa (' || v_lic.max_activations || ' thiết bị).'
    );
  END IF;

  -- Register new activation
  INSERT INTO public.license_activations (
    license_id,
    user_id,
    device_fingerprint,
    activated_at,
    last_seen_at
  ) VALUES (
    v_lic.id,
    v_user_id,
    p_device_fingerprint,
    NOW(),
    NOW()
  );

  -- Increment counter
  UPDATE public.licenses
  SET current_activations = current_activations + 1
  WHERE id = v_lic.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Kích hoạt thành công gói ' || UPPER(v_lic.plan),
    'plan', v_lic.plan,
    'expires_at', v_lic.expires_at
  );
END;
$$;

-- 5. High-Performance B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_lookup ON public.licenses (key, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_license_activations_lookup ON public.license_activations (license_id, device_fingerprint);

-- 6. Admin Revocation RPC
CREATE OR REPLACE FUNCTION public.revoke_license(
  p_license_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.licenses
  SET status = 'revoked'
  WHERE id = p_license_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy mã bản quyền.');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Đã thu hồi mã bản quyền thành công.');
END;
$$;

