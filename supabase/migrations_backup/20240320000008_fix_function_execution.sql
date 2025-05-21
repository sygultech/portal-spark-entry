-- Update the function to properly set execution context
DROP FUNCTION IF EXISTS public.create_and_confirm_student_user;

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
  profile_error text;
  details_error text;
  profile_exists boolean;
  details_exists boolean;
BEGIN
  -- Log function execution context
  RAISE NOTICE '[CONTEXT] Current role: %, search_path: %', current_setting('role'), current_setting('search_path');
  RAISE NOTICE '[CONTEXT] Current user: %, session_user: %', current_user, session_user;
  
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

    -- Verify profile was created
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = new_user_id
    ) INTO profile_exists;

    IF profile_exists THEN
      RAISE NOTICE '[PROFILE] Successfully created and verified profile for user: %', new_user_id;
    ELSE
      RAISE NOTICE '[PROFILE WARNING] Profile insert succeeded but record not found for user: %', new_user_id;
      RAISE EXCEPTION 'Critical error: Profile insert succeeded but record not found';
    END IF;

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

    -- Verify student details were created
    SELECT EXISTS (
      SELECT 1 FROM public.student_details WHERE id = new_user_id
    ) INTO details_exists;

    IF details_exists THEN
      RAISE NOTICE '[DETAILS] Successfully created and verified student details for user: %', new_user_id;
    ELSE
      RAISE NOTICE '[DETAILS WARNING] Student details insert succeeded but record not found for user: %', new_user_id;
      RAISE EXCEPTION 'Critical error: Student details insert succeeded but record not found';
    END IF;

  EXCEPTION WHEN OTHERS THEN
    details_error := SQLERRM;
    RAISE NOTICE '[DETAILS ERROR] Error creating student details: %', details_error;
    RAISE NOTICE '[DETAILS ROLLBACK] Student details creation failed for user: %. Rolling back previous operations...', new_user_id;
    
    -- Rollback previous operations
    DELETE FROM public.profiles WHERE id = new_user_id;
    DELETE FROM auth.users WHERE id = new_user_id;
    RAISE EXCEPTION 'Failed to create student details: %', details_error;
  END;

  -- Final verification
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = new_user_id
  ) INTO profile_exists;

  SELECT EXISTS (
    SELECT 1 FROM public.student_details WHERE id = new_user_id
  ) INTO details_exists;

  RAISE NOTICE '[FINAL CHECK] Record existence - Profile: %, Student Details: %, User ID: %',
    profile_exists,
    details_exists,
    new_user_id;

  IF NOT profile_exists OR NOT details_exists THEN
    RAISE EXCEPTION 'Final verification failed - Profile: %, Student Details: %', 
      profile_exists, 
      details_exists;
  END IF;

  -- Commit explicitly (though PostgreSQL functions automatically commit)
  RAISE NOTICE '[COMMIT] Committing transaction for user: %', new_user_id;
  
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

-- Grant execute permission to authenticated users and service_role explicitly
GRANT EXECUTE ON FUNCTION public.create_and_confirm_student_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_and_confirm_student_user TO service_role;

-- Update the edge function - modify the verification to be stricter
COMMENT ON FUNCTION public.create_and_confirm_student_user IS 'Creates a student user with auth, profile, and student details records. Now includes verification that profile and student details were created successfully.'; 