-- Drop the existing function
DROP FUNCTION IF EXISTS public.create_and_confirm_student_user;

-- Create the fixed function
CREATE OR REPLACE FUNCTION public.create_and_confirm_student_user(
  student_email text,
  student_password text,
  student_first_name text,
  student_last_name text,
  student_school_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  profile_error text;
  details_error text;
BEGIN
  -- Log function parameters
  RAISE NOTICE '[START] Creating student user with email: %, first_name: %, last_name: %, school_id: %',
    student_email, student_first_name, student_last_name, student_school_id;

  -- Insert the user into auth.users with email_confirmed_at already set
  BEGIN
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
      now(),  -- Set email_confirmed_at to current time
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

    RAISE NOTICE '[AUTH] Created auth user with ID: %', new_user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '[AUTH ERROR] Error creating auth user: %', SQLERRM;
    RAISE;
  END;

  -- Create profile for the student
  BEGIN
    RAISE NOTICE '[PROFILE] Attempting to create profile for user: %', new_user_id;
    
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

    RAISE NOTICE '[PROFILE] Successfully created profile for user: %', new_user_id;
  EXCEPTION WHEN OTHERS THEN
    profile_error := SQLERRM;
    RAISE NOTICE '[PROFILE ERROR] Error creating profile: %', profile_error;
    RAISE NOTICE '[PROFILE ROLLBACK] Profile creation failed for user: %. Rolling back auth user...', new_user_id;
    
    -- Rollback auth user creation
    DELETE FROM auth.users WHERE id = new_user_id;
    RAISE EXCEPTION 'Failed to create profile: %', profile_error;
  END;

  -- Create initial student details record
  BEGIN
    RAISE NOTICE '[DETAILS] Attempting to create student details for user: %', new_user_id;
    
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
      'PENDING', -- This will be updated later with the actual admission number
      student_school_id,
      'active',
      now(),
      now()
    );

    RAISE NOTICE '[DETAILS] Successfully created student details for user: %', new_user_id;
  EXCEPTION WHEN OTHERS THEN
    details_error := SQLERRM;
    RAISE NOTICE '[DETAILS ERROR] Error creating student details: %', details_error;
    RAISE NOTICE '[DETAILS ROLLBACK] Student details creation failed for user: %. Rolling back previous operations...', new_user_id;
    
    -- Rollback previous operations
    DELETE FROM public.profiles WHERE id = new_user_id;
    DELETE FROM auth.users WHERE id = new_user_id;
    RAISE EXCEPTION 'Failed to create student details: %', details_error;
  END;

  -- Return the new user ID
  RETURN new_user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any unhandled errors
    RAISE NOTICE '[UNHANDLED ERROR] Error in create_and_confirm_student_user: %', SQLERRM;
    
    -- Attempt to clean up any created records
    IF new_user_id IS NOT NULL THEN
      DELETE FROM public.student_details WHERE id = new_user_id;
      DELETE FROM public.profiles WHERE id = new_user_id;
      DELETE FROM auth.users WHERE id = new_user_id;
    END IF;
    
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_and_confirm_student_user TO authenticated;

-- Drop all existing policies
DROP POLICY IF EXISTS "School admins can create students" ON public.profiles;
DROP POLICY IF EXISTS "Function can create student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation for students" ON public.profiles;
DROP POLICY IF EXISTS "School admins can create student details" ON public.student_details;
DROP POLICY IF EXISTS "Allow student details creation" ON public.student_details;

-- Create a new policy that allows both school admins and the function to create profiles
CREATE POLICY "Allow profile creation for students"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the inserting user is a school admin for the same school
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'school_admin'
      AND p.school_id = school_id
    )
    OR 
    -- Allow if the profile being created is for the authenticated user
    auth.uid() = id
  );

-- Create a new policy for student_details
CREATE POLICY "Allow student details creation"
  ON public.student_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the inserting user is a school admin for the same school
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'school_admin'
      AND p.school_id = school_id
    )
    OR 
    -- Allow if the details being created are for the authenticated user
    auth.uid() = id
  ); 