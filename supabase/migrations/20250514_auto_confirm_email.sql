
-- Auto-confirm email function - intended for school admins
CREATE OR REPLACE FUNCTION public.auto_confirm_email(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if the email belongs to a school admin
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.profiles p ON u.id = p.id
    WHERE u.email = target_email AND p.role = 'school_admin'
  ) INTO is_admin;
  
  -- Only auto-confirm for school admins 
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
