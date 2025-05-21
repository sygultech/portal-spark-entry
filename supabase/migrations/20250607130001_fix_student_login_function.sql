-- Migration: Fix create_student_login function

-- First drop the old version of the function
DROP FUNCTION IF EXISTS public.create_student_login(text, text, text, uuid, text);

-- Now create the new version with 6 parameters
CREATE OR REPLACE FUNCTION public.create_student_login(
    p_email text,
    p_first_name text,
    p_last_name text,
    p_school_id uuid,
    p_password text,
    p_student_id uuid
) RETURNS TABLE(user_id uuid, status text) AS $$
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

        RAISE NOTICE 'Student exists check: %', v_student_exists;

        IF NOT v_student_exists THEN
            RAISE EXCEPTION 'Student not found in student_details table';
        END IF;

        -- Get current profile_id from student_details
        SELECT profile_id INTO v_current_profile_id 
        FROM public.student_details 
        WHERE id = p_student_id AND school_id = p_school_id;

        RAISE NOTICE 'Current profile_id in student_details: %', v_current_profile_id;

        -- Check if user exists in auth.users
        SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

        IF v_user_id IS NOT NULL THEN
            RAISE NOTICE 'User exists in auth.users with id: %', v_user_id;
            
            -- User exists, check if profile exists for this school
            SELECT id INTO v_profile_id FROM public.profiles WHERE id = v_user_id AND school_id = p_school_id;
            
            IF v_profile_id IS NOT NULL THEN
                RAISE NOTICE 'Profile exists for this school with id: %', v_profile_id;
                
                -- Update student_details with the profile_id using student_id
                UPDATE public.student_details 
                SET profile_id = v_user_id,
                    updated_at = now()
                WHERE id = p_student_id AND school_id = p_school_id;
                
                GET DIAGNOSTICS v_update_count = ROW_COUNT;
                RAISE NOTICE 'Updated student_details rows: %', v_update_count;
                
                IF v_update_count = 0 THEN
                    RAISE EXCEPTION 'No rows were updated in student_details';
                END IF;
                
                -- Verify the update
                SELECT profile_id INTO v_current_profile_id 
                FROM public.student_details 
                WHERE id = p_student_id AND school_id = p_school_id;
                
                RAISE NOTICE 'New profile_id in student_details after update: %', v_current_profile_id;
                
                IF v_current_profile_id IS NULL OR v_current_profile_id != v_user_id THEN
                    RAISE EXCEPTION 'Failed to update student_details profile_id';
                END IF;
                
                RETURN QUERY SELECT v_user_id, 'already_exists';
                RETURN;
            ELSE
                RAISE NOTICE 'Creating new profile for existing user';
                
                -- Create profile for this school with student role
                INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
                VALUES (v_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
                
                -- Update student_details with the profile_id using student_id
                UPDATE public.student_details 
                SET profile_id = v_user_id,
                    updated_at = now()
                WHERE id = p_student_id AND school_id = p_school_id;
                
                GET DIAGNOSTICS v_update_count = ROW_COUNT;
                RAISE NOTICE 'Updated student_details rows: %', v_update_count;
                
                IF v_update_count = 0 THEN
                    RAISE EXCEPTION 'No rows were updated in student_details';
                END IF;
                
                -- Verify the update
                SELECT profile_id INTO v_current_profile_id 
                FROM public.student_details 
                WHERE id = p_student_id AND school_id = p_school_id;
                
                RAISE NOTICE 'New profile_id in student_details after update: %', v_current_profile_id;
                
                IF v_current_profile_id IS NULL OR v_current_profile_id != v_user_id THEN
                    RAISE EXCEPTION 'Failed to update student_details profile_id';
                END IF;
                
                RETURN QUERY SELECT v_user_id, 'linked';
                RETURN;
            END IF;
        ELSE
            RAISE NOTICE 'Creating new user';
            
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

            RAISE NOTICE 'Created new user with id: %', v_user_id;

            -- Create profile for this school with student role
            INSERT INTO public.profiles (id, email, first_name, last_name, role, school_id, created_at, updated_at)
            VALUES (v_user_id, p_email, p_first_name, p_last_name, 'student', p_school_id, now(), now());
            
            -- Update student_details with the profile_id using student_id
            UPDATE public.student_details 
            SET profile_id = v_user_id,
                updated_at = now()
            WHERE id = p_student_id AND school_id = p_school_id;
            
            GET DIAGNOSTICS v_update_count = ROW_COUNT;
            RAISE NOTICE 'Updated student_details rows: %', v_update_count;
            
            IF v_update_count = 0 THEN
                RAISE EXCEPTION 'No rows were updated in student_details';
            END IF;
            
            -- Verify the update
            SELECT profile_id INTO v_current_profile_id 
            FROM public.student_details 
            WHERE id = p_student_id AND school_id = p_school_id;
            
            RAISE NOTICE 'New profile_id in student_details after update: %', v_current_profile_id;
            
            IF v_current_profile_id IS NULL OR v_current_profile_id != v_user_id THEN
                RAISE EXCEPTION 'Failed to update student_details profile_id';
            END IF;
            
            RETURN QUERY SELECT v_user_id, 'created';
            RETURN;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_student_login TO authenticated, service_role; 