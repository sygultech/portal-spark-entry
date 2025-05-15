
-- Function to get user metadata by email (safely)
CREATE OR REPLACE FUNCTION public.get_user_metadata_by_email(email_address TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data JSONB;
BEGIN
  -- Get user data by email
  SELECT 
    jsonb_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'user_metadata', raw_user_meta_data
    ) INTO user_data
  FROM auth.users
  WHERE email = email_address;
  
  RETURN user_data;
END;
$$;

-- Ensure the function can only be executed by authenticated users and service roles
REVOKE ALL ON FUNCTION public.get_user_metadata_by_email FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_metadata_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_metadata_by_email TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_metadata_by_email TO service_role;

-- Function to create a profile for an existing user
CREATE OR REPLACE FUNCTION public.create_profile_for_existing_user(
  user_id UUID,
  user_email TEXT,
  user_role user_role DEFAULT 'student'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_metadata JSONB;
  first_name TEXT;
  last_name TEXT;
  school_id UUID;
BEGIN
  -- Get user metadata
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;
  
  -- Extract first name and last name
  first_name := user_metadata->>'first_name';
  last_name := user_metadata->>'last_name';
  
  -- Extract school_id if available
  BEGIN
    school_id := (user_metadata->>'school_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    school_id := NULL;
  END;
  
  -- If first_name is still null, use part of email
  IF first_name IS NULL THEN
    first_name := split_part(user_email, '@', 1);
  END IF;
  
  -- Create or update profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    school_id
  ) 
  VALUES (
    user_id, 
    user_email, 
    first_name, 
    last_name, 
    user_role,
    school_id
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    school_id = EXCLUDED.school_id;
    
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Ensure the function can only be executed by authenticated users and service roles
REVOKE ALL ON FUNCTION public.create_profile_for_existing_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_profile_for_existing_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_for_existing_user TO anon;
GRANT EXECUTE ON FUNCTION public.create_profile_for_existing_user TO service_role;
