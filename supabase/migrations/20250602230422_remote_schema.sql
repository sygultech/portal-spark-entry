alter table "public"."certificates" drop constraint "certificates_status_check";

alter table "public"."disciplinary_records" drop constraint "disciplinary_records_severity_check";

alter table "public"."disciplinary_records" drop constraint "disciplinary_records_status_check";

alter table "public"."student_documents" drop constraint "student_documents_verification_status_check";

alter table "public"."transfer_records" drop constraint "transfer_records_status_check";

alter table "public"."transfer_records" drop constraint "transfer_records_type_check";

drop function if exists "public"."check_user_role"(p_user_id uuid, p_role user_role);

alter table "public"."certificates" add constraint "certificates_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'revoked'::character varying])::text[]))) not valid;

alter table "public"."certificates" validate constraint "certificates_status_check";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_severity_check" CHECK (((severity)::text = ANY ((ARRAY['minor'::character varying, 'moderate'::character varying, 'severe'::character varying])::text[]))) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_severity_check";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'resolved'::character varying, 'escalated'::character varying])::text[]))) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_status_check";

alter table "public"."student_documents" add constraint "student_documents_verification_status_check" CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."student_documents" validate constraint "student_documents_verification_status_check";

alter table "public"."transfer_records" add constraint "transfer_records_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_status_check";

alter table "public"."transfer_records" add constraint "transfer_records_type_check" CHECK (((type)::text = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::text[]))) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_student_v2(p_data jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_student_id uuid;
BEGIN
    -- Generate a new UUID for the student
    v_student_id := gen_random_uuid();

    -- Check if email is provided and if it already exists
    IF p_data->>'email' IS NOT NULL AND p_data->>'email' != '' THEN
        IF EXISTS (
            SELECT 1 
            FROM public.student_details 
            WHERE email = p_data->>'email'
        ) THEN
            RAISE EXCEPTION 'Student with email % already exists', p_data->>'email';
        END IF;
    END IF;

    -- Insert the student record
    INSERT INTO public.student_details (
        id,
        admission_number,
        school_id,
        gender,
        batch_id,
        first_name,
        last_name,
        email,
        date_of_birth,
        address,
        nationality,
        mother_tongue,
        blood_group,
        religion,
        caste,
        category,
        phone,
        previous_school_name,
        previous_school_board,
        previous_school_year,
        previous_school_percentage,
        status,
        admission_date,
        created_at,
        updated_at
    ) VALUES (
        v_student_id,
        p_data->>'admission_number',
        (p_data->>'school_id')::uuid,
        p_data->>'gender',
        (p_data->>'batch_id')::uuid,
        p_data->>'first_name',
        p_data->>'last_name',
        NULLIF(p_data->>'email', ''),
        NULLIF(p_data->>'date_of_birth', '')::date,
        NULLIF(p_data->>'address', ''),
        NULLIF(p_data->>'nationality', ''),
        NULLIF(p_data->>'mother_tongue', ''),
        NULLIF(p_data->>'blood_group', ''),
        NULLIF(p_data->>'religion', ''),
        NULLIF(p_data->>'caste', ''),
        NULLIF(p_data->>'category', ''),
        NULLIF(p_data->>'phone', ''),
        NULLIF(p_data->>'previous_school_name', ''),
        NULLIF(p_data->>'previous_school_board', ''),
        NULLIF(p_data->>'previous_school_year', ''),
        NULLIF(p_data->>'previous_school_percentage', '')::numeric,
        'active',
        CURRENT_DATE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_student_id;

    RETURN v_student_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auto_confirm_email(target_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  is_admin BOOLEAN;
  user_id UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;
  
  -- Check if the user is a school admin in any school
  SELECT EXISTS (
    SELECT 1 FROM public.user_school_roles
    WHERE user_id = user_id AND role = 'school_admin'
  ) INTO is_admin;
  
  -- Only auto-confirm for school admins 
  IF is_admin THEN
    -- Set the email_confirmed_at field
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = user_id AND (email_confirmed_at IS NULL);
    
    RETURN TRUE;
  END IF;
  
  -- Return false if not a school admin
  RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_role(p_user_id uuid, p_role user_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if the requesting user has permission to check roles
    IF NOT (
        auth.uid() = p_user_id -- user checking their own role
        OR EXISTS ( -- school admin checking user in their school
            SELECT 1 FROM user_school_roles usr
            WHERE usr.user_id = auth.uid()
            AND usr.role = 'school_admin'
            AND usr.school_id IN (
                SELECT school_id FROM user_school_roles
                WHERE user_id = p_user_id
            )
        )
        OR EXISTS ( -- super admin can check any role
            SELECT 1 FROM user_school_roles usr
            WHERE usr.user_id = auth.uid()
            AND usr.role = 'super_admin'
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized to check roles for this user';
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM user_school_roles
        WHERE user_id = p_user_id
        AND role = p_role
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_academic_year(p_name text, p_start_date date, p_end_date date, p_school_id uuid, p_is_active boolean DEFAULT false, p_is_archived boolean DEFAULT false)
 RETURNS academic_years
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_academic_year academic_years;
BEGIN
  -- Insert the new academic year with explicit table qualification
  INSERT INTO academic_years (
    name,
    start_date,
    end_date,
    school_id,
    is_active,
    is_archived,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_start_date,
    p_end_date,
    p_school_id,
    p_is_active,
    p_is_archived,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_academic_year;

  -- Return the created academic year
  RETURN v_academic_year;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_and_confirm_admin_user(admin_email text, admin_password text, admin_first_name text, admin_last_name text, admin_school_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_and_confirm_librarian_user(librarian_email text, librarian_password text, librarian_first_name text, librarian_last_name text, librarian_school_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_and_confirm_staff_user(staff_email text, staff_password text, staff_first_name text, staff_last_name text, staff_school_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_and_confirm_student_user(student_email text, student_password text, student_first_name text, student_last_name text, student_school_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_student_login(p_email text, p_first_name text, p_last_name text, p_school_id uuid, p_password text, p_student_id uuid)
 RETURNS TABLE(user_id uuid, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_student_profile(p_user_id uuid, p_email text, p_first_name text, p_last_name text, p_school_id uuid, p_student_id uuid)
 RETURNS TABLE(user_id uuid, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_profile_id uuid;
    v_student_exists boolean;
    v_update_count integer;
BEGIN
    -- Check if student exists
    SELECT EXISTS (
        SELECT 1 FROM public.student_details 
        WHERE id = p_student_id AND school_id = p_school_id
    ) INTO v_student_exists;

    IF NOT v_student_exists THEN
        RAISE EXCEPTION 'Student not found in student_details table';
    END IF;

    -- Create profile for this school with student role
    INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
    VALUES (p_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
    
    -- Update student_details with the profile_id
    UPDATE public.student_details 
    SET profile_id = p_user_id,
        updated_at = now()
    WHERE id = p_student_id AND school_id = p_school_id;
    
    GET DIAGNOSTICS v_update_count = ROW_COUNT;
    
    IF v_update_count = 0 THEN
        RAISE EXCEPTION 'No rows were updated in student_details';
    END IF;
    
    RETURN QUERY SELECT p_user_id, 'created';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_batch_students_table()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename  = 'batch_students'
  ) INTO table_exists;
  
  -- If table doesn't exist, create it
  IF NOT table_exists THEN
    -- Create the batch_students table
    CREATE TABLE public.batch_students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batch_id UUID REFERENCES batches(id) NOT NULL,
      student_id UUID REFERENCES profiles(id) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(batch_id, student_id)
    );
    
    -- Add RLS policies
    ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
    
    -- School admin policies
    CREATE POLICY "School admins can view student assignments" 
    ON public.batch_students FOR SELECT 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can insert student assignments" 
    ON public.batch_students FOR INSERT 
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can update student assignments" 
    ON public.batch_students FOR UPDATE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
    
    CREATE POLICY "School admins can delete student assignments" 
    ON public.batch_students FOR DELETE 
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.batches 
        WHERE public.batches.id = public.batch_students.batch_id 
        AND public.batches.school_id = (SELECT school_id FROM profiles WHERE id = auth.uid())
      )
    );
  END IF;
  
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.execute_admin_sql(sql text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Execute the SQL statement
  EXECUTE sql;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_auth_user_details(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_data jsonb;
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN public.get_user_primary_school(auth.uid());
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_timetable_configurations(p_school_id uuid, p_academic_year_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', tc.id,
            'name', tc.name,
            'isActive', tc.is_active,
            'isDefault', tc.is_default,
            'academicYearId', tc.academic_year_id,
            'periods', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ps.id,
                        'number', ps.period_number,
                        'startTime', ps.start_time,
                        'endTime', ps.end_time,
                        'type', ps.type,
                        'label', ps.label,
                        'dayOfWeek', ps.day_of_week,
                        'isFortnightly', ps.is_fortnightly,
                        'fortnightWeek', ps.fortnight_week
                    )
                )
                FROM period_settings ps
                WHERE ps.configuration_id = tc.id
            ),
            'batchIds', (
                SELECT jsonb_agg(bcm.batch_id)
                FROM batch_configuration_mapping bcm
                WHERE bcm.configuration_id = tc.id
            )
        )
    )
    INTO v_result
    FROM timetable_configurations tc
    WHERE tc.school_id = p_school_id
    AND tc.academic_year_id = p_academic_year_id;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_primary_school(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_school_roles
        WHERE user_id = p_user_id
        AND is_primary = true
        LIMIT 1
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_primary_school_id(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND is_primary = true
        LIMIT 1
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_profile_roles(p_user_id uuid)
 RETURNS TABLE(user_id uuid, school_id uuid, role user_role, is_primary boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        usr.user_id,
        usr.school_id,
        usr.role,
        usr.is_primary
    FROM public.get_user_roles_bypass_rls(p_user_id) usr;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles_bypass_rls(p_user_id uuid)
 RETURNS TABLE(role_id uuid, user_id uuid, school_id uuid, role user_role, is_primary boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        usr.id as role_id,
        usr.user_id,
        usr.school_id,
        usr.role,
        usr.is_primary,
        usr.created_at,
        usr.updated_at
    FROM public.user_school_roles usr
    WHERE usr.user_id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles_in_school(p_user_id uuid, p_school_id uuid)
 RETURNS SETOF user_role
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_user_school_roles(p_user_id, p_school_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_librarian(p_user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id
        AND school_id = p_school_id
        AND role = 'librarian'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_school_admin_direct(user_id uuid, p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check metadata directly from auth.users
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'school_admin'
        AND raw_user_meta_data->>'school_id' = p_school_id::text
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin_direct(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check metadata directly from auth.users
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'super_admin'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manage_primary_school()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.is_primary THEN
        -- Set is_primary to false for all other schools of this user
        UPDATE public.user_school_roles
        SET is_primary = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manually_confirm_email(email_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_address
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Get the user ID
  SELECT id INTO user_id FROM auth.users WHERE email = email_address;
  
  -- Set the email_confirmed_at field
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = user_id AND (email_confirmed_at IS NULL);
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_user_role_cache(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Delete existing cache entries for this user
    DELETE FROM user_role_cache WHERE user_id = p_user_id;
    
    -- Insert one record per role from the profiles table's roles array
    INSERT INTO user_role_cache (
        user_id,
        school_id,
        user_role,
        created_at,
        updated_at
    )
    SELECT 
        p.id as user_id,
        p.school_id,
        unnest(p.roles) as user_role,
        now() as created_at,
        now() as updated_at
    FROM profiles p
    WHERE p.id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_user_roles(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Delete existing cache entries for this user
    DELETE FROM public.user_role_cache WHERE user_id = p_user_id;
    
    -- Insert fresh data from user_role_cache
    INSERT INTO public.user_role_cache (user_id, school_id, role, is_primary, last_updated)
    SELECT 
        user_id,
        school_id,
        role,
        is_primary,
        now()
    FROM public.user_role_cache
    WHERE user_id = p_user_id;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.save_timetable_configuration(p_school_id uuid, p_name text, p_is_active boolean, p_is_default boolean, p_academic_year_id uuid, p_periods jsonb, p_batch_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_config_id uuid;
BEGIN
    -- Insert timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id
    ) VALUES (
        p_school_id,
        p_name,
        p_is_active,
        p_is_default,
        p_academic_year_id
    ) RETURNING id INTO v_config_id;

    -- Insert period settings
    INSERT INTO period_settings (
        configuration_id,
        period_number,
        start_time,
        end_time,
        type,
        label,
        day_of_week,
        is_fortnightly,
        fortnight_week
    )
    SELECT
        v_config_id,
        (period->>'number')::integer,
        (period->>'startTime')::time,
        (period->>'endTime')::time,
        period->>'type',
        period->>'label',
        period->>'dayOfWeek',
        (period->>'isFortnightly')::boolean,
        (period->>'fortnightWeek')::integer
    FROM jsonb_array_elements(p_periods) AS period;

    -- Insert batch mappings if provided
    IF p_batch_ids IS NOT NULL THEN
        INSERT INTO batch_configuration_mapping (
            configuration_id,
            batch_id
        )
        SELECT
            v_config_id,
            batch_id
        FROM unnest(p_batch_ids) AS batch_id;
    END IF;

    RETURN v_config_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.switch_primary_school(p_school_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Verify user has role in the target school
    IF NOT EXISTS (
        SELECT 1 FROM public.user_school_roles
        WHERE user_id = auth.uid()
        AND school_id = p_school_id
    ) THEN
        RETURN false;
    END IF;

    -- Update primary school
    UPDATE public.user_school_roles
    SET is_primary = (school_id = p_school_id)
    WHERE user_id = auth.uid();

    RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_auth_user(p_user_id uuid, p_email text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_email_confirmed boolean DEFAULT NULL::boolean, p_phone_confirmed boolean DEFAULT NULL::boolean, p_banned boolean DEFAULT NULL::boolean, p_user_metadata jsonb DEFAULT NULL::jsonb, p_app_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;


