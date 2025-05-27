-- Drop existing functions that directly manipulate auth.users
DROP FUNCTION IF EXISTS public.create_and_confirm_student_user(text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.create_and_confirm_admin_user(text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.create_student_login(text, text, text, uuid, text, uuid);

-- Create new function that uses Supabase's auth API
CREATE OR REPLACE FUNCTION public.create_and_confirm_student_user(
  student_email text,
  student_password text,
  student_first_name text,
  student_last_name text,
  student_school_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Log basic info
  RAISE NOTICE 'Creating student user with email: %', student_email;

  -- Create user using Supabase's auth.users() function
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
    student_email,
    crypt(student_password, gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', student_first_name,
      'last_name', student_last_name,
      'role', 'student',
      'school_id', student_school_id
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  RAISE NOTICE 'Created auth user with ID: %', new_user_id;

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
    student_email,
    student_first_name,
    student_last_name,
    'student',
    student_school_id,
    now(),
    now()
  );

  RAISE NOTICE 'Created profile for user: %', new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Create new function for admin user creation
CREATE OR REPLACE FUNCTION public.create_and_confirm_admin_user(
  admin_email text,
  admin_password text,
  admin_first_name text,
  admin_last_name text,
  admin_school_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Log basic info
  RAISE NOTICE 'Creating admin user with email: %', admin_email;

  -- Create user using Supabase's auth.users() function
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
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', admin_first_name,
      'last_name', admin_last_name,
      'role', 'school_admin',
      'school_id', admin_school_id
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  RAISE NOTICE 'Created auth user with ID: %', new_user_id;

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
    admin_email,
    admin_first_name,
    admin_last_name,
    'school_admin',
    admin_school_id,
    now(),
    now()
  );

  RAISE NOTICE 'Created profile for user: %', new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Create new function for student login creation
CREATE OR REPLACE FUNCTION public.create_student_login(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_school_id uuid,
  p_password text,
  p_student_id uuid
)
RETURNS TABLE(user_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_student_exists boolean;
  v_current_profile_id uuid;
  v_update_count integer;
  v_error_context text;
BEGIN
  -- Start transaction
  BEGIN
    -- First check if student exists in student_details using ID
    SELECT EXISTS (
      SELECT 1 FROM public.student_details 
      WHERE id = p_student_id AND school_id = p_school_id
    ) INTO v_student_exists;

    IF NOT v_student_exists THEN
      RAISE EXCEPTION 'Student not found in student_details table';
    END IF;

    -- Check if user exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

    IF v_user_id IS NULL THEN
      -- Create new user using Supabase's auth.users() function
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
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
          'first_name', p_first_name,
          'last_name', p_last_name,
          'role', 'student',
          'school_id', p_school_id
        ),
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
      RETURNING id INTO v_user_id;

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
        v_user_id,
        p_email,
        p_first_name,
        p_last_name,
        'student',
        p_school_id,
        now(),
        now()
      );

      -- Update student_details with the profile_id
      UPDATE public.student_details 
      SET profile_id = v_user_id,
          updated_at = now()
      WHERE id = p_student_id AND school_id = p_school_id;

      RETURN QUERY SELECT v_user_id, 'created';
    ELSE
      -- User exists, check if they have a profile for this school
      SELECT id INTO v_profile_id 
      FROM public.profiles 
      WHERE id = v_user_id AND school_id = p_school_id;

      IF v_profile_id IS NULL THEN
        -- Create profile for existing user
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
          v_user_id,
          p_email,
          p_first_name,
          p_last_name,
          'student',
          p_school_id,
          now(),
          now()
        );

        -- Update student_details with the profile_id
        UPDATE public.student_details 
        SET profile_id = v_user_id,
            updated_at = now()
        WHERE id = p_student_id AND school_id = p_school_id;

        RETURN QUERY SELECT v_user_id, 'linked';
      ELSE
        RETURN QUERY SELECT v_user_id, 'already_exists';
      END IF;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Get detailed error information
      GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
      
      -- Log the error with context
      RAISE NOTICE 'Error in create_student_login: %', SQLERRM;
      RAISE NOTICE 'Error detail: %', SQLSTATE;
      RAISE NOTICE 'Error context: %', v_error_context;
      
      -- Re-raise the error
      RAISE;
  END;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_and_confirm_student_user(text, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_and_confirm_admin_user(text, text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_student_login(text, text, text, uuid, text, uuid) TO authenticated; 