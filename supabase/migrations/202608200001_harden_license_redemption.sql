-- Harden license redemption as a server-authoritative, authenticated operation.
-- Client-side checks are UX only and must never grant paid access.

create or replace function public.redeem_license(
  p_key text,
  p_device_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lic record;
  v_user_id uuid := (select auth.uid());
  v_existing_activation public.license_activations%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_key, ''))) > 64
     or coalesce(p_device_fingerprint, '') !~ '^[0-9a-f]{32}$' then
    return jsonb_build_object('success', false, 'message', 'Yêu cầu kích hoạt không hợp lệ.');
  end if;

  select id, plan, max_activations, current_activations, expires_at
    into v_lic
  from public.licenses
  where upper(key) = upper(trim(p_key))
    and status = 'active'
    and expires_at > now()
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'message', 'Mã bản quyền không tồn tại, đã hết hạn hoặc bị thu hồi.'
    );
  end if;

  select * into v_existing_activation
  from public.license_activations
  where license_id = v_lic.id
    and device_fingerprint = lower(p_device_fingerprint)
  for update;

  if found then
    -- A device activation belongs to the account that first redeemed it. Do
    -- not let another account replay a copied browser fingerprint.
    if v_existing_activation.user_id is distinct from v_user_id then
      return jsonb_build_object(
        'success', false,
        'message', 'Thiết bị này đã liên kết với một tài khoản khác.'
      );
    end if;

    update public.license_activations
    set last_seen_at = now()
    where id = v_existing_activation.id;
  else
    if v_lic.current_activations >= v_lic.max_activations then
      return jsonb_build_object(
        'success', false,
        'message', 'Mã bản quyền đã đạt số lượng kích hoạt tối đa.'
      );
    end if;

    insert into public.license_activations (
      license_id, user_id, device_fingerprint, activated_at, last_seen_at
    ) values (
      v_lic.id, v_user_id, lower(p_device_fingerprint), now(), now()
    );

    update public.licenses
    set current_activations = current_activations + 1
    where id = v_lic.id;
  end if;

  -- Redemption and paid-access assignment are one transaction. Browser-local
  -- state is only a cache and cannot create an entitlement.
  update public.profiles
  set subscription_tier = v_lic.plan,
      is_pro = v_lic.plan in ('plus', 'pro'),
      role = case
        when role = 'admin' then 'admin'
        when v_lic.plan in ('plus', 'pro') then 'pro'
        else 'user'
      end,
      pro_granted_at = case
        when v_lic.plan in ('plus', 'pro') then coalesce(pro_granted_at, now())
        else null
      end,
      updated_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'profile not found' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'success', true,
    'message', 'Kích hoạt thành công gói ' || upper(v_lic.plan),
    'plan', v_lic.plan,
    'expires_at', v_lic.expires_at
  );
end;
$$;

create or replace function public.revoke_license(p_license_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_giaosuech_admin() then
    raise exception 'admin required' using errcode = '42501';
  end if;

  update public.licenses
  set status = 'revoked'
  where id = p_license_id;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Không tìm thấy mã bản quyền.');
  end if;

  return jsonb_build_object('success', true, 'message', 'Đã thu hồi mã bản quyền thành công.');
end;
$$;

revoke all on function public.redeem_license(text, text) from public, anon;
grant execute on function public.redeem_license(text, text) to authenticated;

revoke all on function public.revoke_license(uuid) from public, anon;
grant execute on function public.revoke_license(uuid) to authenticated;
