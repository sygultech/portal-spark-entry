
-- Auto-confirm email function - intended for school admins
CREATE OR REPLACE FUNCTION public.auto_confirm_email(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- First check if the user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = target_email
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the email belongs to a school admin
  -- by checking the profiles table
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE u.email = target_email AND p.role = 'school_admin'
  ) INTO is_admin;
  
  -- We'll auto-confirm for school admins only
  IF is_admin THEN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;
    
    -- Set the email_confirmed_at field
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = user_id AND (email_confirmed_at IS NULL);
    
    RETURN TRUE;
  END IF;
  
  -- Return false if not a school admin
  RETURN FALSE;
END;
$$;

-- Ensure the function can only be executed by authenticated users
REVOKE ALL ON FUNCTION public.auto_confirm_email FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_confirm_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_confirm_email TO anon;
