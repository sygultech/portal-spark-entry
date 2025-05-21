

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'super_admin',
    'school_admin',
    'teacher',
    'student',
    'parent',
    'staff'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_student_v2"("p_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."add_student_v2"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_confirm_email"("target_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."auto_confirm_email"("target_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") IS 'Checks if a user has a specific role.';



CREATE OR REPLACE FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = p_role
    );
END;
$$;


ALTER FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_and_confirm_admin_user"("admin_email" "text", "admin_password" "text", "admin_first_name" "text", "admin_last_name" "text", "admin_school_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert the user into auth.users with email_confirmed_at already set
  -- Note: We've removed the instance_id field since it doesn't exist
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
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),  -- Set email_confirmed_at to current time
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
    now()
  )
  RETURNING id INTO new_user_id;

  -- Return the new user ID as text
  RETURN new_user_id::text;
END;
$$;


ALTER FUNCTION "public"."create_and_confirm_admin_user"("admin_email" "text", "admin_password" "text", "admin_first_name" "text", "admin_last_name" "text", "admin_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_and_confirm_student_user"("student_email" "text", "student_password" "text", "student_first_name" "text", "student_last_name" "text", "student_school_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
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


ALTER FUNCTION "public"."create_and_confirm_student_user"("student_email" "text", "student_password" "text", "student_first_name" "text", "student_last_name" "text", "student_school_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_and_confirm_student_user"("student_email" "text", "student_password" "text", "student_first_name" "text", "student_last_name" "text", "student_school_id" "uuid") IS 'Simplified function to create a student user with auth, profile, and student details.';



CREATE OR REPLACE FUNCTION "public"."create_profile_for_existing_user"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role" DEFAULT 'student'::"public"."user_role") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_metadata JSONB;
  first_name TEXT;
  last_name TEXT;
  school_id UUID;
  role_from_metadata user_role;
BEGIN
  -- Get user metadata
  SELECT raw_user_meta_data INTO user_metadata
  FROM auth.users
  WHERE id = user_id;
  
  -- Extract first name and last name
  first_name := user_metadata->>'first_name';
  last_name := user_metadata->>'last_name';
  
  -- Extract role if available in metadata (with security validation)
  BEGIN
    role_from_metadata := (user_metadata->>'role')::user_role;
    
    -- Security check: Only allow school_admin role if explicitly set in auth metadata
    IF role_from_metadata = 'school_admin'::user_role THEN
      user_role := 'school_admin'::user_role;
    ELSIF role_from_metadata = 'super_admin'::user_role THEN
      user_role := 'super_admin'::user_role;
    ELSE
      -- Default to specified role or 'student'
      user_role := user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If role in metadata is invalid, use the provided default
    user_role := user_role;
  END;
  
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


ALTER FUNCTION "public"."create_profile_for_existing_user"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_student_login"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_school_id" "uuid", "p_password" "text") RETURNS TABLE("user_id" "uuid", "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id uuid;
    v_profile_id uuid;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

    IF v_user_id IS NOT NULL THEN
        -- User exists, check if profile exists for this school
        SELECT id INTO v_profile_id FROM public.profiles WHERE id = v_user_id AND school_id = p_school_id;
        IF v_profile_id IS NOT NULL THEN
            RETURN QUERY SELECT v_user_id, 'already_exists';
            RETURN;
        ELSE
            -- Create profile for this school with student role
            INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
            VALUES (v_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
            RETURN QUERY SELECT v_user_id, 'linked';
            RETURN;
        END IF;
    ELSE
        -- User does not exist, create user in auth.users
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            aud,
            role,
            email_confirmed_at
        )
        VALUES (
            gen_random_uuid(),
            p_email,
            crypt(p_password, gen_salt('bf')),
            jsonb_build_object('provider', 'email', 'providers', array['email']),
            jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'role', 'student', 'school_id', p_school_id),
            now(),
            now(),
            'authenticated',
            'authenticated',
            now()
        ) RETURNING id INTO v_user_id;

        -- Create profile for this school with student role
        INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
        VALUES (v_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
        
        RETURN QUERY SELECT v_user_id, 'created';
        RETURN;
    END IF;
END;
$$;


ALTER FUNCTION "public"."create_student_login"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_school_id" "uuid", "p_password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_first_name" "text", "user_last_name" "text", "user_role" "public"."user_role") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (user_id, user_email, user_first_name, user_last_name, user_role);
  EXCEPTION WHEN unique_violation THEN
    -- Profile already exists, do nothing
    NULL;
END;
$$;


ALTER FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_first_name" "text", "user_last_name" "text", "user_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_current_academic_year"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE public.academic_years
    SET is_current = false
    WHERE school_id = NEW.school_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_current_academic_year"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."execute_admin_sql"("sql" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result jsonb;
BEGIN
  -- Execute the SQL statement
  EXECUTE sql;
  
  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'message', 'SQL executed successfully'
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error response
  result := jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."execute_admin_sql"("sql" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_admission_number"("p_school_id" "uuid") RETURNS character varying
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  school_prefix VARCHAR;
  year_prefix VARCHAR;
  last_number INT;
  next_number VARCHAR;
BEGIN
  -- Get school prefix (first 3 letters of school name, uppercase)
  SELECT UPPER(SUBSTRING(name, 1, 3)) INTO school_prefix
  FROM public.schools
  WHERE id = p_school_id;
  
  -- Get current year as 2-digit string
  year_prefix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Find the highest existing number for this school and year
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(
        admission_number 
        FROM '[0-9]+$'
      ) AS INTEGER
    )
  ), 0) INTO last_number
  FROM public.student_details
  WHERE school_id = p_school_id
    AND admission_number LIKE school_prefix || year_prefix || '%';
  
  -- Format the next number with leading zeros (4 digits)
  next_number := TO_CHAR(last_number + 1, 'FM0000');
  
  -- Return the full admission number
  RETURN school_prefix || year_prefix || next_number;
END;
$_$;


ALTER FUNCTION "public"."generate_admission_number"("p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auth_user_details"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_data JSONB;
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
$$;


ALTER FUNCTION "public"."get_auth_user_details"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_school_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN public.get_user_primary_school(auth.uid());
END;
$$;


ALTER FUNCTION "public"."get_current_user_school_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_highest_role"("p_user_id" "uuid") RETURNS "public"."user_role"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_role user_role;
BEGIN
    -- Check for super_admin first
    SELECT role INTO v_role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND role = 'super_admin'::user_role
    LIMIT 1;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Then check for school_admin
    SELECT role INTO v_role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND role = 'school_admin'::user_role
    LIMIT 1;

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- Finally, return any other role
    SELECT role INTO v_role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    LIMIT 1;

    RETURN v_role;
END;
$$;


ALTER FUNCTION "public"."get_user_highest_role"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_metadata_by_email"("email_address" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_user_metadata_by_email"("email_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_primary_school"("p_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_school_roles
        WHERE user_id = p_user_id
        AND is_primary = true
        LIMIT 1
    );
END;
$$;


ALTER FUNCTION "public"."get_user_primary_school"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_primary_school_id"("p_user_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND is_primary = true
        LIMIT 1
    );
END;
$$;


ALTER FUNCTION "public"."get_user_primary_school_id"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "avatar_url" "text", "school_id" "uuid", "role" "public"."user_role", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.avatar_url,
        urc.school_id,
        urc.role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    LEFT JOIN public.user_role_cache urc ON urc.user_id = p.id AND urc.is_primary = true
    WHERE p.id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_profile"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile_roles"("p_user_id" "uuid") RETURNS TABLE("user_id" "uuid", "school_id" "uuid", "role" "public"."user_role", "is_primary" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        usr.user_id,
        usr.school_id,
        usr.role,
        usr.is_primary
    FROM public.get_user_roles_bypass_rls(p_user_id) usr;
END;
$$;


ALTER FUNCTION "public"."get_user_profile_roles"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_roles_bypass_rls"("p_user_id" "uuid") RETURNS TABLE("role_id" "uuid", "user_id" "uuid", "school_id" "uuid", "role" "public"."user_role", "is_primary" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."get_user_roles_bypass_rls"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_roles_for_school"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS SETOF "public"."user_role"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND school_id = p_school_id;
END;
$$;


ALTER FUNCTION "public"."get_user_roles_for_school"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_roles_in_school"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS SETOF "public"."user_role"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.get_user_school_roles(p_user_id, p_school_id);
END;
$$;


ALTER FUNCTION "public"."get_user_roles_in_school"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_school_roles"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS SETOF "public"."user_role"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT role
    FROM public.user_role_cache
    WHERE user_id = p_user_id
    AND school_id = p_school_id;
END;
$$;


ALTER FUNCTION "public"."get_user_school_roles"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_any_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
    );
END;
$$;


ALTER FUNCTION "public"."has_any_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_any_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid") IS 'Checks if a user has any role in a school using the role cache.';



CREATE OR REPLACE FUNCTION "public"."has_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = p_role
    );
END;
$$;


ALTER FUNCTION "public"."has_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_email_confirmed"("email_address" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_confirmed BOOLEAN;
BEGIN
  SELECT (email_confirmed_at IS NOT NULL) INTO is_confirmed
  FROM auth.users
  WHERE email = email_address;
  
  RETURN COALESCE(is_confirmed, false);
END;
$$;


ALTER FUNCTION "public"."is_email_confirmed"("email_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_school_admin"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = 'school_admin'::public.user_role
    );
END;
$$;


ALTER FUNCTION "public"."is_school_admin"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_school_admin"("p_user_id" "uuid", "p_school_id" "uuid") IS 'Checks if a user is a school admin for a specific school using the role cache.';



CREATE OR REPLACE FUNCTION "public"."is_school_admin_bypass_rls"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = 'school_admin'::user_role
    );
END;
$$;


ALTER FUNCTION "public"."is_school_admin_bypass_rls"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_school_admin_direct"("user_id" "uuid", "p_school_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check metadata directly from auth.users
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'school_admin'
        AND raw_user_meta_data->>'school_id' = p_school_id::text
    );
END;
$$;


ALTER FUNCTION "public"."is_school_admin_direct"("user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_school_admin_no_rls"("p_user_id" "uuid", "p_school_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = 'school_admin'::user_role
    );
END;
$$;


ALTER FUNCTION "public"."is_school_admin_no_rls"("p_user_id" "uuid", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_role_cache
        WHERE user_id = p_user_id
        AND role = 'super_admin'::public.user_role
    );
END;
$$;


ALTER FUNCTION "public"."is_super_admin"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") IS 'Checks if a user is a super admin using the role cache.';



CREATE OR REPLACE FUNCTION "public"."is_super_admin_bypass_rls"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_role_cache
        WHERE user_id = p_user_id
        AND role = 'super_admin'::user_role
    );
END;
$$;


ALTER FUNCTION "public"."is_super_admin_bypass_rls"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin_direct"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check metadata directly from auth.users
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id 
        AND raw_user_meta_data->>'role' = 'super_admin'
    );
END;
$$;


ALTER FUNCTION "public"."is_super_admin_direct"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_primary_school"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."manage_primary_school"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manually_confirm_email"("email_address" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."manually_confirm_email"("email_address" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manually_confirm_user_by_id"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Update the user to set confirmation fields and remove any ban
  UPDATE auth.users
  SET 
    email_confirmed_at = now(),
    confirmed_at = now(),
    banned_until = NULL
  WHERE id = user_id;
  
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."manually_confirm_user_by_id"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Delete existing cache entries for this user
    DELETE FROM user_role_cache WHERE user_id = p_user_id;
    
    -- Insert fresh data only for this user
    INSERT INTO user_role_cache (user_id, school_id, is_super_admin, is_school_admin, roles, last_updated)
    SELECT 
        user_id,
        school_id,
        bool_or(role = 'super_admin') as is_super_admin,
        bool_or(role = 'school_admin') as is_school_admin,
        array_agg(DISTINCT role) as roles,
        now() as last_updated
    FROM user_school_roles
    WHERE user_id = p_user_id
    GROUP BY user_id, school_id;
END;
$$;


ALTER FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_user_roles"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."refresh_user_roles"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."refresh_user_roles"("p_user_id" "uuid") IS 'Refreshes the role cache for a specific user.';



CREATE OR REPLACE FUNCTION "public"."switch_primary_school"("p_school_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."switch_primary_school"("p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_user"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_password" "text" DEFAULT NULL::"text", "p_school_id" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  admin_user_id UUID;
  result JSONB;
  profile_exists BOOLEAN;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update admin user details';
  END IF;
  
  -- Get user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- Check if user exists
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = admin_user_id
  ) INTO profile_exists;
  
  -- Update user metadata
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'first_name', p_first_name,
      'last_name', p_last_name,
      'role', 'school_admin',
      'school_id', p_school_id
    ),
    updated_at = now()
  WHERE id = admin_user_id;
  
  -- Update password if provided
  IF p_password IS NOT NULL AND p_password != '' THEN
    UPDATE auth.users
    SET encrypted_password = crypt(p_password, gen_salt('bf'))
    WHERE id = admin_user_id;
  END IF;
  
  -- Update profile if it exists
  IF profile_exists THEN
    UPDATE public.profiles
    SET 
      first_name = p_first_name,
      last_name = p_last_name,
      school_id = p_school_id,
      updated_at = now()
    WHERE id = admin_user_id;
  ELSE
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id)
    VALUES (admin_user_id, p_email, p_first_name, p_last_name, 'school_admin', p_school_id);
  END IF;
  
  -- Return result
  result := jsonb_build_object(
    'user_id', admin_user_id,
    'email', p_email,
    'first_name', p_first_name,
    'last_name', p_last_name,
    'school_id', p_school_id,
    'password_updated', p_password IS NOT NULL AND p_password != ''
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."update_admin_user"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_password" "text", "p_school_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_email_confirmed" boolean DEFAULT NULL::boolean, "p_phone_confirmed" boolean DEFAULT NULL::boolean, "p_banned" boolean DEFAULT NULL::boolean, "p_user_metadata" "jsonb" DEFAULT NULL::"jsonb", "p_app_metadata" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
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
$$;


ALTER FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_email_confirmed" boolean DEFAULT NULL::boolean, "p_phone_confirmed" boolean DEFAULT NULL::boolean, "p_banned" boolean DEFAULT NULL::boolean, "p_confirmation_token" "text" DEFAULT NULL::"text", "p_confirmation_sent_at" "text" DEFAULT NULL::"text", "p_instance_id" "text" DEFAULT NULL::"text", "p_user_metadata" "jsonb" DEFAULT NULL::"jsonb", "p_app_metadata" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
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
    instance_id = COALESCE(p_instance_id, instance_id),
    confirmation_token = COALESCE(p_confirmation_token, confirmation_token),
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
    confirmation_sent_at = CASE 
      WHEN p_confirmation_sent_at IS NOT NULL THEN
        p_confirmation_sent_at::timestamptz
      ELSE confirmation_sent_at
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
    'confirmation_token', confirmation_token,
    'confirmation_sent_at', confirmation_sent_at,
    'instance_id', instance_id,
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
$$;


ALTER FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_confirmation_token" "text", "p_confirmation_sent_at" "text", "p_instance_id" "text", "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_school_details"("p_school_id" "uuid", "p_name" "text", "p_domain" "text", "p_contact_number" "text", "p_region" "text", "p_status" "text", "p_admin_email" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
  old_admin_email TEXT;
BEGIN
  -- Check if user is super_admin
  IF NOT (SELECT is_super_admin()) THEN
    RAISE EXCEPTION 'Only super administrators can update school details';
  END IF;
  
  -- Get the current admin email for the school
  SELECT admin_email INTO old_admin_email 
  FROM public.schools 
  WHERE id = p_school_id;
  
  -- Update school details
  UPDATE public.schools
  SET 
    name = p_name,
    domain = p_domain,
    contact_number = p_contact_number,
    region = p_region,
    status = p_status,
    admin_email = p_admin_email,
    updated_at = now()
  WHERE id = p_school_id
  RETURNING jsonb_build_object(
    'id', id,
    'name', name,
    'domain', domain,
    'contact_number', contact_number,
    'region', region,
    'status', status,
    'admin_email', admin_email,
    'old_admin_email', old_admin_email
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."update_school_details"("p_school_id" "uuid", "p_name" "text", "p_domain" "text", "p_contact_number" "text", "p_region" "text", "p_status" "text", "p_admin_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_student_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.student_id AND role = 'student') THEN
    RAISE EXCEPTION 'Only students can be added to batches';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_student_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_teacher_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.class_teacher_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.class_teacher_id AND role = 'teacher') THEN
      RAISE EXCEPTION 'Only teachers can be assigned as class teachers';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_teacher_role"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."academic_years" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_current" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "start_before_end" CHECK (("start_date" < "end_date"))
);


ALTER TABLE "public"."academic_years" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batch_students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "roll_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."batch_students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batch_subjects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "is_mandatory" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."batch_subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "capacity" integer,
    "course_id" "uuid" NOT NULL,
    "class_teacher_id" "uuid",
    "academic_year_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "is_archived" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "grading_system_id" "uuid"
);


ALTER TABLE "public"."batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."certificates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "type" character varying(50) NOT NULL,
    "template_id" character varying(100) NOT NULL,
    "issued_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "valid_until" "date",
    "serial_number" character varying(100) NOT NULL,
    "status" character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    "issued_by" "uuid" NOT NULL,
    "data" "jsonb",
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "certificates_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'revoked'::character varying])::"text"[])))
);


ALTER TABLE "public"."certificates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "duration" integer,
    "duration_unit" "text",
    "department_id" "uuid",
    "academic_year_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "courses_duration_unit_check" CHECK (("duration_unit" = ANY (ARRAY['years'::"text", 'months'::"text", 'days'::"text"])))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."disciplinary_evidence" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "disciplinary_record_id" "uuid" NOT NULL,
    "type" character varying(50) NOT NULL,
    "file_path" "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "school_id" "uuid" NOT NULL
);


ALTER TABLE "public"."disciplinary_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."disciplinary_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "incident_type" character varying(100) NOT NULL,
    "description" "text" NOT NULL,
    "date" "date" NOT NULL,
    "severity" character varying(20) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "action_taken" "text",
    "reported_by" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "disciplinary_records_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['minor'::character varying, 'moderate'::character varying, 'severe'::character varying])::"text"[]))),
    CONSTRAINT "disciplinary_records_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'resolved'::character varying, 'escalated'::character varying])::"text"[])))
);


ALTER TABLE "public"."disciplinary_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."grade_thresholds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "grading_system_id" "uuid" NOT NULL,
    "grade" "text" NOT NULL,
    "name" "text" NOT NULL,
    "min_score" numeric NOT NULL,
    "max_score" numeric NOT NULL,
    "grade_point" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."grade_thresholds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."grading_systems" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "description" "text",
    "passing_score" numeric NOT NULL,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "grading_systems_type_check" CHECK (("type" = ANY (ARRAY['marks'::"text", 'grades'::"text", 'hybrid'::"text"])))
);


ALTER TABLE "public"."grading_systems" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guardians" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" character varying(100) NOT NULL,
    "last_name" character varying(100),
    "relation" character varying(50) NOT NULL,
    "occupation" character varying(100),
    "email" character varying(255),
    "phone" character varying(20) NOT NULL,
    "address" "text",
    "is_emergency_contact" boolean DEFAULT false,
    "can_pickup" boolean DEFAULT false,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."guardians" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parent_meetings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "disciplinary_record_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "attendees" "text" NOT NULL,
    "discussion" "text" NOT NULL,
    "outcome" "text",
    "follow_up_date" "date",
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."parent_meetings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text" NOT NULL,
    "avatar_url" "text",
    "school_id" "uuid",
    "role" "public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."profiles" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "domain" "text",
    "admin_email" "text",
    "contact_number" "text",
    "region" "text",
    "status" "text",
    "timezone" "text",
    "plan" "text",
    "storage_limit" integer,
    "user_limit" integer,
    "modules" "jsonb",
    "default_grading_system_id" "uuid"
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "color" character varying(20),
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_category_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_category_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_details" (
    "id" "uuid" NOT NULL,
    "admission_number" character varying(50) NOT NULL,
    "date_of_birth" "date",
    "gender" character varying(10),
    "address" "text",
    "batch_id" "uuid",
    "nationality" character varying(100),
    "mother_tongue" character varying(50),
    "blood_group" character varying(5),
    "religion" character varying(50),
    "caste" character varying(50),
    "category" character varying(50),
    "phone" character varying(20),
    "previous_school_name" character varying(200),
    "previous_school_board" character varying(100),
    "previous_school_year" character varying(20),
    "previous_school_percentage" numeric(5,2),
    "tc_number" character varying(100),
    "admission_date" "date" DEFAULT CURRENT_DATE,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "school_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "first_name" "text" DEFAULT ''::"text" NOT NULL,
    "last_name" "text" DEFAULT ''::"text" NOT NULL,
    "email" "text",
    CONSTRAINT "student_details_gender_check" CHECK ((("gender")::"text" = ANY (ARRAY[('male'::character varying)::"text", ('female'::character varying)::"text", ('other'::character varying)::"text"]))),
    CONSTRAINT "student_details_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('transferred'::character varying)::"text", ('graduated'::character varying)::"text", ('inactive'::character varying)::"text"])))
);

ALTER TABLE ONLY "public"."student_details" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "type" character varying(50) NOT NULL,
    "description" "text",
    "file_path" "text" NOT NULL,
    "upload_date" timestamp with time zone DEFAULT "now"(),
    "verification_status" character varying(20) DEFAULT 'pending'::character varying,
    "verified_by" "uuid",
    "verification_date" timestamp with time zone,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "student_documents_verification_status_check" CHECK ((("verification_status")::"text" = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::"text"[])))
);


ALTER TABLE "public"."student_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_guardians" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "guardian_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."student_guardians" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subject_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subject_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subject_teachers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "batch_id" "uuid" NOT NULL,
    "academic_year_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subject_teachers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subject_time_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_teacher_id" "uuid" NOT NULL,
    "day_of_week" integer,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "room_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "subject_time_slots_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."subject_time_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "description" "text",
    "category_id" "uuid",
    "subject_type" "text",
    "academic_year_id" "uuid" NOT NULL,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "grading_system_id" "uuid",
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    CONSTRAINT "subjects_subject_type_check" CHECK (("subject_type" = ANY (ARRAY['core'::"text", 'elective'::"text", 'activity-based'::"text", 'language'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transfer_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "type" character varying(20) NOT NULL,
    "date" "date" NOT NULL,
    "from_batch_id" "uuid",
    "to_batch_id" "uuid",
    "to_school" character varying(200),
    "reason" "text" NOT NULL,
    "tc_number" character varying(100),
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "school_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "transfer_records_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::"text"[]))),
    CONSTRAINT "transfer_records_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::"text"[])))
);


ALTER TABLE "public"."transfer_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_role_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "school_id" "uuid",
    "user_role" "public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_role_cache" OWNER TO "postgres";


ALTER TABLE ONLY "public"."academic_years"
    ADD CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_students"
    ADD CONSTRAINT "batch_students_batch_id_student_id_key" UNIQUE ("batch_id", "student_id");



ALTER TABLE ONLY "public"."batch_students"
    ADD CONSTRAINT "batch_students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_subjects"
    ADD CONSTRAINT "batch_subjects_batch_id_subject_id_key" UNIQUE ("batch_id", "subject_id");



ALTER TABLE ONLY "public"."batch_subjects"
    ADD CONSTRAINT "batch_subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disciplinary_evidence"
    ADD CONSTRAINT "disciplinary_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."disciplinary_records"
    ADD CONSTRAINT "disciplinary_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."grade_thresholds"
    ADD CONSTRAINT "grade_thresholds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."grading_systems"
    ADD CONSTRAINT "grading_systems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guardians"
    ADD CONSTRAINT "guardians_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parent_meetings"
    ADD CONSTRAINT "parent_meetings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_categories"
    ADD CONSTRAINT "student_categories_name_school_id_key" UNIQUE ("name", "school_id");



ALTER TABLE ONLY "public"."student_categories"
    ADD CONSTRAINT "student_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_category_assignments"
    ADD CONSTRAINT "student_category_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_category_assignments"
    ADD CONSTRAINT "student_category_assignments_student_id_category_id_key" UNIQUE ("student_id", "category_id");



ALTER TABLE ONLY "public"."student_details"
    ADD CONSTRAINT "student_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_documents"
    ADD CONSTRAINT "student_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_student_id_guardian_id_key" UNIQUE ("student_id", "guardian_id");



ALTER TABLE ONLY "public"."subject_categories"
    ADD CONSTRAINT "subject_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subject_teachers"
    ADD CONSTRAINT "subject_teachers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subject_teachers"
    ADD CONSTRAINT "subject_teachers_subject_id_teacher_id_batch_id_key" UNIQUE ("subject_id", "teacher_id", "batch_id");



ALTER TABLE ONLY "public"."subject_time_slots"
    ADD CONSTRAINT "subject_time_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transfer_records"
    ADD CONSTRAINT "transfer_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_role_cache"
    ADD CONSTRAINT "user_role_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_role_cache"
    ADD CONSTRAINT "user_role_cache_user_id_school_id_user_role_key" UNIQUE ("user_id", "school_id", "user_role");



CREATE INDEX "academic_years_is_current_idx" ON "public"."academic_years" USING "btree" ("is_current");



CREATE INDEX "academic_years_school_id_idx" ON "public"."academic_years" USING "btree" ("school_id");



CREATE INDEX "batch_students_batch_id_idx" ON "public"."batch_students" USING "btree" ("batch_id");



CREATE INDEX "batch_students_student_id_idx" ON "public"."batch_students" USING "btree" ("student_id");



CREATE INDEX "batch_subjects_batch_id_idx" ON "public"."batch_subjects" USING "btree" ("batch_id");



CREATE INDEX "batch_subjects_subject_id_idx" ON "public"."batch_subjects" USING "btree" ("subject_id");



CREATE INDEX "batches_academic_year_id_idx" ON "public"."batches" USING "btree" ("academic_year_id");



CREATE INDEX "batches_class_teacher_id_idx" ON "public"."batches" USING "btree" ("class_teacher_id");



CREATE INDEX "batches_course_id_idx" ON "public"."batches" USING "btree" ("course_id");



CREATE INDEX "batches_school_id_idx" ON "public"."batches" USING "btree" ("school_id");



CREATE INDEX "courses_academic_year_id_idx" ON "public"."courses" USING "btree" ("academic_year_id");



CREATE INDEX "courses_department_id_idx" ON "public"."courses" USING "btree" ("department_id");



CREATE INDEX "courses_school_id_idx" ON "public"."courses" USING "btree" ("school_id");



CREATE INDEX "departments_school_id_idx" ON "public"."departments" USING "btree" ("school_id");



CREATE INDEX "idx_student_details_batch_id" ON "public"."student_details" USING "btree" ("batch_id");



CREATE INDEX "idx_student_details_profile_id" ON "public"."student_details" USING "btree" ("profile_id");



CREATE INDEX "idx_student_details_school_id" ON "public"."student_details" USING "btree" ("school_id");



CREATE INDEX "idx_subjects_is_archived" ON "public"."subjects" USING "btree" ("is_archived");



CREATE UNIQUE INDEX "student_details_email_unique_idx" ON "public"."student_details" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "subject_teachers_batch_id_idx" ON "public"."subject_teachers" USING "btree" ("batch_id");



CREATE INDEX "subject_teachers_subject_id_idx" ON "public"."subject_teachers" USING "btree" ("subject_id");



CREATE INDEX "subject_teachers_teacher_id_idx" ON "public"."subject_teachers" USING "btree" ("teacher_id");



CREATE INDEX "subject_time_slots_subject_teacher_id_idx" ON "public"."subject_time_slots" USING "btree" ("subject_teacher_id");



CREATE INDEX "subjects_academic_year_id_idx" ON "public"."subjects" USING "btree" ("academic_year_id");



CREATE INDEX "subjects_category_id_idx" ON "public"."subjects" USING "btree" ("category_id");



CREATE INDEX "subjects_school_id_idx" ON "public"."subjects" USING "btree" ("school_id");



CREATE OR REPLACE TRIGGER "check_student_role" BEFORE INSERT OR UPDATE ON "public"."batch_students" FOR EACH ROW EXECUTE FUNCTION "public"."validate_student_role"();



CREATE OR REPLACE TRIGGER "check_teacher_role" BEFORE INSERT OR UPDATE ON "public"."batches" FOR EACH ROW EXECUTE FUNCTION "public"."validate_teacher_role"();



CREATE OR REPLACE TRIGGER "single_current_academic_year_trigger" BEFORE INSERT OR UPDATE ON "public"."academic_years" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_current_academic_year"();



ALTER TABLE ONLY "public"."academic_years"
    ADD CONSTRAINT "academic_years_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."batch_students"
    ADD CONSTRAINT "batch_students_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id");



ALTER TABLE ONLY "public"."batch_students"
    ADD CONSTRAINT "batch_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."batch_subjects"
    ADD CONSTRAINT "batch_subjects_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_subjects"
    ADD CONSTRAINT "batch_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id");



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_grading_system_id_fkey" FOREIGN KEY ("grading_system_id") REFERENCES "public"."grading_systems"("id");



ALTER TABLE ONLY "public"."batches"
    ADD CONSTRAINT "batches_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."certificates"
    ADD CONSTRAINT "certificates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."disciplinary_evidence"
    ADD CONSTRAINT "disciplinary_evidence_disciplinary_record_id_fkey" FOREIGN KEY ("disciplinary_record_id") REFERENCES "public"."disciplinary_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."disciplinary_evidence"
    ADD CONSTRAINT "disciplinary_evidence_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."disciplinary_records"
    ADD CONSTRAINT "disciplinary_records_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."disciplinary_records"
    ADD CONSTRAINT "disciplinary_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."grade_thresholds"
    ADD CONSTRAINT "grade_thresholds_grading_system_id_fkey" FOREIGN KEY ("grading_system_id") REFERENCES "public"."grading_systems"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."grading_systems"
    ADD CONSTRAINT "grading_systems_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."guardians"
    ADD CONSTRAINT "guardians_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."parent_meetings"
    ADD CONSTRAINT "parent_meetings_disciplinary_record_id_fkey" FOREIGN KEY ("disciplinary_record_id") REFERENCES "public"."disciplinary_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."parent_meetings"
    ADD CONSTRAINT "parent_meetings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_default_grading_system_id_fkey" FOREIGN KEY ("default_grading_system_id") REFERENCES "public"."grading_systems"("id");



ALTER TABLE ONLY "public"."student_categories"
    ADD CONSTRAINT "student_categories_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."student_category_assignments"
    ADD CONSTRAINT "student_category_assignments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."student_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_details"
    ADD CONSTRAINT "student_details_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."student_details"
    ADD CONSTRAINT "student_details_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."student_details"
    ADD CONSTRAINT "student_details_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_documents"
    ADD CONSTRAINT "student_documents_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."student_documents"
    ADD CONSTRAINT "student_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."student_guardians"
    ADD CONSTRAINT "student_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "public"."guardians"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_categories"
    ADD CONSTRAINT "subject_categories_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_teachers"
    ADD CONSTRAINT "subject_teachers_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_teachers"
    ADD CONSTRAINT "subject_teachers_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_teachers"
    ADD CONSTRAINT "subject_teachers_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_teachers"
    ADD CONSTRAINT "subject_teachers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_time_slots"
    ADD CONSTRAINT "subject_time_slots_subject_teacher_id_fkey" FOREIGN KEY ("subject_teacher_id") REFERENCES "public"."subject_teachers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."subject_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_grading_system_id_fkey" FOREIGN KEY ("grading_system_id") REFERENCES "public"."grading_systems"("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transfer_records"
    ADD CONSTRAINT "transfer_records_from_batch_id_fkey" FOREIGN KEY ("from_batch_id") REFERENCES "public"."batches"("id");



ALTER TABLE ONLY "public"."transfer_records"
    ADD CONSTRAINT "transfer_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id");



ALTER TABLE ONLY "public"."transfer_records"
    ADD CONSTRAINT "transfer_records_to_batch_id_fkey" FOREIGN KEY ("to_batch_id") REFERENCES "public"."batches"("id");



ALTER TABLE ONLY "public"."user_role_cache"
    ADD CONSTRAINT "user_role_cache_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_role_cache"
    ADD CONSTRAINT "user_role_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can create student details" ON "public"."student_details" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Profiles policy for students" ON "public"."profiles" USING (true) WITH CHECK (((( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = 'super_admin'::"public"."user_role") OR ((( SELECT "profiles_1"."role"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = 'school_admin'::"public"."user_role") AND (( SELECT "profiles_1"."school_id"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())) = "school_id")) OR ("id" = "auth"."uid"()) OR ( SELECT ("current_setting"('role'::"text") = 'service_role'::"text"))));



CREATE POLICY "Student details policy" ON "public"."student_details" USING (true) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'super_admin'::"public"."user_role")))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'school_admin'::"public"."user_role") AND ("profiles"."school_id" = "student_details"."school_id")))) OR ("id" = "auth"."uid"()) OR ( SELECT ("current_setting"('role'::"text") = 'service_role'::"text"))));



CREATE POLICY "academic_years_delete_policy" ON "public"."academic_years" FOR DELETE USING ((("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())) AND (NOT "is_locked") AND (NOT "is_current")));



CREATE POLICY "academic_years_insert_policy" ON "public"."academic_years" FOR INSERT WITH CHECK (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "academic_years_select_policy" ON "public"."academic_years" FOR SELECT USING (("public"."has_any_role_in_school"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "academic_years_update_policy" ON "public"."academic_years" FOR UPDATE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "batch_subjects_delete_policy" ON "public"."batch_subjects" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."subjects" "s"
  WHERE (("s"."id" = "batch_subjects"."subject_id") AND ("public"."is_school_admin_direct"("auth"."uid"(), "s"."school_id") OR "public"."is_super_admin_direct"("auth"."uid"()))))));



CREATE POLICY "batch_subjects_insert_policy" ON "public"."batch_subjects" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."subjects" "s"
  WHERE (("s"."id" = "batch_subjects"."subject_id") AND ("public"."is_school_admin_direct"("auth"."uid"(), "s"."school_id") OR "public"."is_super_admin_direct"("auth"."uid"()))))));



CREATE POLICY "batch_subjects_update_policy" ON "public"."batch_subjects" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."subjects" "s"
  WHERE (("s"."id" = "batch_subjects"."subject_id") AND ("public"."is_school_admin_direct"("auth"."uid"(), "s"."school_id") OR "public"."is_super_admin_direct"("auth"."uid"()))))));



CREATE POLICY "batches_delete_policy" ON "public"."batches" FOR DELETE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "batches_insert_policy" ON "public"."batches" FOR INSERT WITH CHECK (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "batches_select_policy" ON "public"."batches" FOR SELECT USING (("public"."has_any_role_in_school"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "batches_update_policy" ON "public"."batches" FOR UPDATE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "courses_delete_policy" ON "public"."courses" FOR DELETE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "courses_insert_policy" ON "public"."courses" FOR INSERT WITH CHECK (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));



CREATE POLICY "courses_select_policy" ON "public"."courses" FOR SELECT USING (("public"."has_any_role_in_school"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "courses_update_policy" ON "public"."courses" FOR UPDATE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "departments_delete_policy" ON "public"."departments" FOR DELETE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "departments_select_policy" ON "public"."departments" FOR SELECT USING (("public"."has_any_role_in_school"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "departments_update_policy" ON "public"."departments" FOR UPDATE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "grade_thresholds_delete_policy" ON "public"."grade_thresholds" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_role_cache" "urc"
     JOIN "public"."grading_systems" "gs" ON (("gs"."school_id" = "urc"."school_id")))
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("gs"."id" = "grade_thresholds"."grading_system_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role"))))));



CREATE POLICY "grade_thresholds_insert_policy" ON "public"."grade_thresholds" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_role_cache" "urc"
     JOIN "public"."grading_systems" "gs" ON (("gs"."school_id" = "urc"."school_id")))
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("gs"."id" = "grade_thresholds"."grading_system_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role"))))));



CREATE POLICY "grade_thresholds_read_policy" ON "public"."grade_thresholds" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_role_cache" "urc"
     JOIN "public"."grading_systems" "gs" ON (("gs"."school_id" = "urc"."school_id")))
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("gs"."id" = "grade_thresholds"."grading_system_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role") OR ("urc"."user_role" = 'teacher'::"public"."user_role"))))));



CREATE POLICY "grade_thresholds_update_policy" ON "public"."grade_thresholds" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."user_role_cache" "urc"
     JOIN "public"."grading_systems" "gs" ON (("gs"."school_id" = "urc"."school_id")))
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("gs"."id" = "grade_thresholds"."grading_system_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role"))))));



CREATE POLICY "grading_systems_delete_policy" ON "public"."grading_systems" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_role_cache" "urc"
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("urc"."school_id" = "grading_systems"."school_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role"))))));



CREATE POLICY "grading_systems_insert_policy" ON "public"."grading_systems" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_role_cache" "urc"
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("urc"."school_id" = "grading_systems"."school_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role"))))));



CREATE POLICY "grading_systems_read_policy" ON "public"."grading_systems" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_role_cache" "urc"
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("urc"."school_id" = "grading_systems"."school_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role") OR ("urc"."user_role" = 'teacher'::"public"."user_role"))))));



CREATE POLICY "grading_systems_update_policy" ON "public"."grading_systems" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_role_cache" "urc"
  WHERE (("urc"."user_id" = "auth"."uid"()) AND ("urc"."school_id" = "grading_systems"."school_id") AND (("urc"."user_role" = 'school_admin'::"public"."user_role") OR ("urc"."user_role" = 'super_admin'::"public"."user_role"))))));



CREATE POLICY "profiles_delete_policy" ON "public"."profiles" FOR DELETE USING (("public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "profiles_insert_policy" ON "public"."profiles" FOR INSERT WITH CHECK (("public"."has_any_role_in_school"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "profiles_read_policy" ON "public"."profiles" FOR SELECT USING (("public"."has_any_role_in_school"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "profiles_update_policy" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR "public"."is_school_admin"("auth"."uid"(), "school_id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "schools_delete_policy" ON "public"."schools" FOR DELETE USING ("public"."is_super_admin"("auth"."uid"()));



CREATE POLICY "schools_select_policy" ON "public"."schools" FOR SELECT USING (("public"."has_any_role_in_school"("auth"."uid"(), "id") OR "public"."is_super_admin"("auth"."uid"())));



CREATE POLICY "schools_update_policy" ON "public"."schools" FOR UPDATE USING (("public"."is_school_admin"("auth"."uid"(), "id") OR "public"."is_super_admin"("auth"."uid"())));



ALTER TABLE "public"."student_details" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "subject_categories_delete_policy" ON "public"."subject_categories" FOR DELETE USING (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));



CREATE POLICY "subject_categories_insert_policy" ON "public"."subject_categories" FOR INSERT WITH CHECK (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));



CREATE POLICY "subject_categories_update_policy" ON "public"."subject_categories" FOR UPDATE USING (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));



CREATE POLICY "subjects_delete_policy" ON "public"."subjects" FOR DELETE USING (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));



CREATE POLICY "subjects_insert_policy" ON "public"."subjects" FOR INSERT WITH CHECK (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));



CREATE POLICY "subjects_update_policy" ON "public"."subjects" FOR UPDATE USING (("public"."is_school_admin_direct"("auth"."uid"(), "school_id") OR "public"."is_super_admin_direct"("auth"."uid"())));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."add_student_v2"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_student_v2"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_student_v2"("p_data" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."auto_confirm_email"("target_email" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."auto_confirm_email"("target_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."auto_confirm_email"("target_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_confirm_email"("target_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_role"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_and_confirm_admin_user"("admin_email" "text", "admin_password" "text", "admin_first_name" "text", "admin_last_name" "text", "admin_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_and_confirm_admin_user"("admin_email" "text", "admin_password" "text", "admin_first_name" "text", "admin_last_name" "text", "admin_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_and_confirm_admin_user"("admin_email" "text", "admin_password" "text", "admin_first_name" "text", "admin_last_name" "text", "admin_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_and_confirm_student_user"("student_email" "text", "student_password" "text", "student_first_name" "text", "student_last_name" "text", "student_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_and_confirm_student_user"("student_email" "text", "student_password" "text", "student_first_name" "text", "student_last_name" "text", "student_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_and_confirm_student_user"("student_email" "text", "student_password" "text", "student_first_name" "text", "student_last_name" "text", "student_school_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_profile_for_existing_user"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_profile_for_existing_user"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_existing_user"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_existing_user"("user_id" "uuid", "user_email" "text", "user_role" "public"."user_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_student_login"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_school_id" "uuid", "p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_student_login"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_school_id" "uuid", "p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_student_login"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_school_id" "uuid", "p_password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_first_name" "text", "user_last_name" "text", "user_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_first_name" "text", "user_last_name" "text", "user_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_profile"("user_id" "uuid", "user_email" "text", "user_first_name" "text", "user_last_name" "text", "user_role" "public"."user_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_current_academic_year"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_current_academic_year"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_current_academic_year"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."execute_admin_sql"("sql" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."execute_admin_sql"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."execute_admin_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."execute_admin_sql"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_admission_number"("p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_admission_number"("p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_admission_number"("p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auth_user_details"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_auth_user_details"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auth_user_details"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_school_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_school_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_school_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_highest_role"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_highest_role"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_highest_role"("p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_user_metadata_by_email"("email_address" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_metadata_by_email"("email_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_metadata_by_email"("email_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_metadata_by_email"("email_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_primary_school"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_primary_school"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_primary_school"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_primary_school_id"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_primary_school_id"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_primary_school_id"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile_roles"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile_roles"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile_roles"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_roles_bypass_rls"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_roles_bypass_rls"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_roles_bypass_rls"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_roles_for_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_roles_for_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_roles_for_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_roles_in_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_roles_in_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_roles_in_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_school_roles"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_school_roles"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_school_roles"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_any_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_any_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_any_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role_in_school"("p_user_id" "uuid", "p_school_id" "uuid", "p_role" "public"."user_role") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_email_confirmed"("email_address" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_email_confirmed"("email_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_email_confirmed"("email_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_email_confirmed"("email_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_school_admin"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_school_admin"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_school_admin"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_school_admin_bypass_rls"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_school_admin_bypass_rls"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_school_admin_bypass_rls"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_school_admin_direct"("user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_school_admin_direct"("user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_school_admin_direct"("user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_school_admin_no_rls"("p_user_id" "uuid", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_school_admin_no_rls"("p_user_id" "uuid", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_school_admin_no_rls"("p_user_id" "uuid", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin_bypass_rls"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin_bypass_rls"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin_bypass_rls"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin_direct"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin_direct"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin_direct"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_primary_school"() TO "anon";
GRANT ALL ON FUNCTION "public"."manage_primary_school"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_primary_school"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."manually_confirm_email"("email_address" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."manually_confirm_email"("email_address" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."manually_confirm_email"("email_address" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."manually_confirm_email"("email_address" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."manually_confirm_user_by_id"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."manually_confirm_user_by_id"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."manually_confirm_user_by_id"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_user_role_cache"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_user_roles"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_user_roles"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_user_roles"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."switch_primary_school"("p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."switch_primary_school"("p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."switch_primary_school"("p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_user"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_password" "text", "p_school_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_user"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_password" "text", "p_school_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_user"("p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_password" "text", "p_school_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_confirmation_token" "text", "p_confirmation_sent_at" "text", "p_instance_id" "text", "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_confirmation_token" "text", "p_confirmation_sent_at" "text", "p_instance_id" "text", "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_auth_user"("p_user_id" "uuid", "p_email" "text", "p_phone" "text", "p_email_confirmed" boolean, "p_phone_confirmed" boolean, "p_banned" boolean, "p_confirmation_token" "text", "p_confirmation_sent_at" "text", "p_instance_id" "text", "p_user_metadata" "jsonb", "p_app_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_school_details"("p_school_id" "uuid", "p_name" "text", "p_domain" "text", "p_contact_number" "text", "p_region" "text", "p_status" "text", "p_admin_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_school_details"("p_school_id" "uuid", "p_name" "text", "p_domain" "text", "p_contact_number" "text", "p_region" "text", "p_status" "text", "p_admin_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_school_details"("p_school_id" "uuid", "p_name" "text", "p_domain" "text", "p_contact_number" "text", "p_region" "text", "p_status" "text", "p_admin_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_student_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_student_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_student_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_teacher_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_teacher_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_teacher_role"() TO "service_role";


















GRANT ALL ON TABLE "public"."academic_years" TO "anon";
GRANT ALL ON TABLE "public"."academic_years" TO "authenticated";
GRANT ALL ON TABLE "public"."academic_years" TO "service_role";



GRANT ALL ON TABLE "public"."batch_students" TO "anon";
GRANT ALL ON TABLE "public"."batch_students" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_students" TO "service_role";



GRANT ALL ON TABLE "public"."batch_subjects" TO "anon";
GRANT ALL ON TABLE "public"."batch_subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_subjects" TO "service_role";



GRANT ALL ON TABLE "public"."batches" TO "anon";
GRANT ALL ON TABLE "public"."batches" TO "authenticated";
GRANT ALL ON TABLE "public"."batches" TO "service_role";



GRANT ALL ON TABLE "public"."certificates" TO "anon";
GRANT ALL ON TABLE "public"."certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."certificates" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."disciplinary_evidence" TO "anon";
GRANT ALL ON TABLE "public"."disciplinary_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."disciplinary_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."disciplinary_records" TO "anon";
GRANT ALL ON TABLE "public"."disciplinary_records" TO "authenticated";
GRANT ALL ON TABLE "public"."disciplinary_records" TO "service_role";



GRANT ALL ON TABLE "public"."grade_thresholds" TO "anon";
GRANT ALL ON TABLE "public"."grade_thresholds" TO "authenticated";
GRANT ALL ON TABLE "public"."grade_thresholds" TO "service_role";



GRANT ALL ON TABLE "public"."grading_systems" TO "anon";
GRANT ALL ON TABLE "public"."grading_systems" TO "authenticated";
GRANT ALL ON TABLE "public"."grading_systems" TO "service_role";



GRANT ALL ON TABLE "public"."guardians" TO "anon";
GRANT ALL ON TABLE "public"."guardians" TO "authenticated";
GRANT ALL ON TABLE "public"."guardians" TO "service_role";



GRANT ALL ON TABLE "public"."parent_meetings" TO "anon";
GRANT ALL ON TABLE "public"."parent_meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."parent_meetings" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."student_categories" TO "anon";
GRANT ALL ON TABLE "public"."student_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."student_categories" TO "service_role";



GRANT ALL ON TABLE "public"."student_category_assignments" TO "anon";
GRANT ALL ON TABLE "public"."student_category_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."student_category_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."student_details" TO "anon";
GRANT ALL ON TABLE "public"."student_details" TO "authenticated";
GRANT ALL ON TABLE "public"."student_details" TO "service_role";



GRANT ALL ON TABLE "public"."student_documents" TO "anon";
GRANT ALL ON TABLE "public"."student_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."student_documents" TO "service_role";



GRANT ALL ON TABLE "public"."student_guardians" TO "anon";
GRANT ALL ON TABLE "public"."student_guardians" TO "authenticated";
GRANT ALL ON TABLE "public"."student_guardians" TO "service_role";



GRANT ALL ON TABLE "public"."subject_categories" TO "anon";
GRANT ALL ON TABLE "public"."subject_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."subject_categories" TO "service_role";



GRANT ALL ON TABLE "public"."subject_teachers" TO "anon";
GRANT ALL ON TABLE "public"."subject_teachers" TO "authenticated";
GRANT ALL ON TABLE "public"."subject_teachers" TO "service_role";



GRANT ALL ON TABLE "public"."subject_time_slots" TO "anon";
GRANT ALL ON TABLE "public"."subject_time_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."subject_time_slots" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON TABLE "public"."transfer_records" TO "anon";
GRANT ALL ON TABLE "public"."transfer_records" TO "authenticated";
GRANT ALL ON TABLE "public"."transfer_records" TO "service_role";



GRANT ALL ON TABLE "public"."user_role_cache" TO "anon";
GRANT ALL ON TABLE "public"."user_role_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."user_role_cache" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;


