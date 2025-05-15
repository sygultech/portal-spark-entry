
-- Function to update auth user details with additional fields
CREATE OR REPLACE FUNCTION public.update_auth_user(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email_confirmed boolean DEFAULT NULL,
  p_phone_confirmed boolean DEFAULT NULL,
  p_banned boolean DEFAULT NULL,
  p_confirmation_token text DEFAULT NULL,
  p_confirmation_sent_at text DEFAULT NULL,
  p_instance_id text DEFAULT NULL,
  p_user_metadata jsonb DEFAULT NULL,
  p_app_metadata jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update auth user details';
  END IF;
  
  -- Update user details with additional metadata fields
  UPDATE auth.users
  SET
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    raw_user_meta_data = COALESCE(p_user_metadata, raw_user_meta_data),
    raw_app_meta_data = COALESCE(p_app_metadata, raw_app_meta_data),
    instance_id = COALESCE(p_instance_id, instance_id),
    confirmation_token = COALESCE(p_confirmation_token, confirmation_token),
    email_confirmed_at = CASE
      WHEN p_email_confirmed IS NOT NULL THEN
        CASE WHEN p_email_confirmed THEN now() ELSE NULL END
      ELSE email_confirmed_at
    END,
    phone_confirmed_at = CASE
      WHEN p_phone_confirmed IS NOT NULL THEN
        CASE WHEN p_phone_confirmed THEN now() ELSE NULL END
      ELSE phone_confirmed_at
    END,
    confirmation_sent_at = CASE 
      WHEN p_confirmation_sent_at IS NOT NULL THEN
        p_confirmation_sent_at::timestamptz
      ELSE confirmation_sent_at
    END,
    banned_until = CASE
      WHEN p_banned IS NOT NULL THEN
        CASE WHEN p_banned THEN '2099-12-31 23:59:59+00'::timestamptz ELSE NULL END
      ELSE banned_until
    END
  WHERE id = p_user_id
  RETURNING jsonb_build_object(
    'id', id,
    'email', email,
    'phone', phone,
    'created_at', created_at,
    'last_sign_in_at', last_sign_in_at,
    'confirmation_token', confirmation_token,
    'confirmation_sent_at', confirmation_sent_at,
    'instance_id', instance_id,
    'user_metadata', raw_user_meta_data,
    'app_metadata', raw_app_meta_data,
    'email_confirmed', email_confirmed_at IS NOT NULL,
    'phone_confirmed', phone_confirmed_at IS NOT NULL,
    'is_banned', banned_until IS NOT NULL,
    'banned_until', banned_until,
    'updated_at', updated_at
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Update get_auth_user_details to include additional fields
CREATE OR REPLACE FUNCTION public.get_auth_user_details(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_data JSONB;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can view detailed auth user information';
  END IF;
  
  -- Get extended user data with more fields
  SELECT 
    jsonb_build_object(
      'id', id,
      'aud', aud,
      'role', role,
      'email', email,
      'phone', phone,
      'created_at', created_at,
      'updated_at', updated_at,
      'last_sign_in_at', last_sign_in_at,
      'invited_at', invited_at,
      'confirmation_token', confirmation_token,
      'confirmation_sent_at', confirmation_sent_at,
      'recovery_sent_at', recovery_sent_at,
      'email_change_sent_at', email_change_sent_at,
      'email_change', email_change,
      'phone_change', phone_change,
      'phone_change_sent_at', phone_change_sent_at,
      'instance_id', instance_id,
      'user_metadata', raw_user_meta_data,
      'app_metadata', raw_app_meta_data,
      'email_confirmed', email_confirmed_at IS NOT NULL,
      'phone_confirmed', phone_confirmed_at IS NOT NULL,
      'is_banned', banned_until IS NOT NULL,
      'banned_until', banned_until,
      'is_super_admin', is_super_admin,
      'is_sso_user', is_sso_user,
      'is_anonymous', is_anonymous,
      'confirmed_at', confirmed_at,
      'deleted_at', deleted_at
    ) INTO user_data
  FROM auth.users
  WHERE id = p_user_id;
  
  RETURN user_data;
END;
$function$;
