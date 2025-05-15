
-- Create function to get user metadata by email
CREATE OR REPLACE FUNCTION public.get_user_metadata_by_email(email_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_metadata_by_email(text) TO authenticated;
