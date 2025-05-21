-- Drop the existing function
DROP FUNCTION IF EXISTS public.create_and_confirm_student_user;

-- Create a simplified version
CREATE OR REPLACE FUNCTION public.create_and_confirm_student_user(
  student_email text,
  student_password text,
  student_first_name text,
  student_last_name text,
  student_school_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Log basic info
  RAISE NOTICE 'Creating student user with email: %', student_email;

  -- Step 1: Create auth user
  INSERT INTO auth.users (
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
    updated_at
  )
  VALUES (
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
    now()
  )
  RETURNING id INTO new_user_id;

  RAISE NOTICE 'Created auth user with ID: %', new_user_id;

  -- Step 2: Create profile
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

  -- Step 3: Create student details
  INSERT INTO public.student_details (
    id,
    admission_number,
    school_id,
    status,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    'PENDING',
    student_school_id,
    'active',
    now(),
    now()
  );

  RAISE NOTICE 'Created student details for user: %', new_user_id;

  -- Return the user ID
  RETURN new_user_id;
END;
$$;

-- Grant execute permission 
GRANT EXECUTE ON FUNCTION public.create_and_confirm_student_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_and_confirm_student_user TO service_role;

-- Explicitly grant insert on the tables
GRANT INSERT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO service_role;
GRANT INSERT ON public.student_details TO authenticated;
GRANT INSERT ON public.student_details TO service_role;

-- Comment on function
COMMENT ON FUNCTION public.create_and_confirm_student_user IS 'Simplified function to create a student user with auth, profile, and student details.'; 