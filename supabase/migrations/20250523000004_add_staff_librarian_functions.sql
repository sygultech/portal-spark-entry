-- Function to create staff user
CREATE OR REPLACE FUNCTION public.create_and_confirm_staff_user(
  staff_email text,
  staff_password text,
  staff_first_name text,
  staff_last_name text,
  staff_school_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    staff_email,
    crypt(staff_password, gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', staff_first_name,
      'last_name', staff_last_name,
      'role', 'staff',
      'school_id', staff_school_id
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    school_id,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    staff_email,
    staff_first_name,
    staff_last_name,
    'staff',
    staff_school_id,
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- Function to create librarian user
CREATE OR REPLACE FUNCTION public.create_and_confirm_librarian_user(
  librarian_email text,
  librarian_password text,
  librarian_first_name text,
  librarian_last_name text,
  librarian_school_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    librarian_email,
    crypt(librarian_password, gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', librarian_first_name,
      'last_name', librarian_last_name,
      'role', 'librarian',
      'school_id', librarian_school_id
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    school_id,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    librarian_email,
    librarian_first_name,
    librarian_last_name,
    'librarian',
    librarian_school_id,
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_and_confirm_staff_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_and_confirm_librarian_user TO authenticated; 