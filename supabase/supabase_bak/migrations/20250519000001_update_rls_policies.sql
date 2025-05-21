-- Update RLS policies to use new role system

-- Helper function to check if user has any role in school
CREATE OR REPLACE FUNCTION public.has_any_role_in_school(p_user_id uuid, p_school_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_school_roles
        WHERE user_id = p_user_id
        AND school_id = p_school_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is school admin
CREATE OR REPLACE FUNCTION public.is_school_admin(p_user_id uuid, p_school_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN public.has_role_in_school(p_user_id, p_school_id, 'school_admin'::public.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update academic years policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "academic_years_select_policy" ON public.academic_years;
    DROP POLICY IF EXISTS "academic_years_insert_policy" ON public.academic_years;
    DROP POLICY IF EXISTS "academic_years_update_policy" ON public.academic_years;
    DROP POLICY IF EXISTS "academic_years_delete_policy" ON public.academic_years;
    
    CREATE POLICY "academic_years_select_policy" ON public.academic_years
        FOR SELECT USING (
            public.has_any_role_in_school(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "academic_years_insert_policy" ON public.academic_years
        FOR INSERT WITH CHECK (
            public.is_school_admin(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "academic_years_update_policy" ON public.academic_years
        FOR UPDATE USING (
            public.is_school_admin(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "academic_years_delete_policy" ON public.academic_years
        FOR DELETE USING (
            (public.is_school_admin(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())) AND
            NOT is_locked AND NOT is_current
        );
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Update batch policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "batches_select_policy" ON public.batches;
    DROP POLICY IF EXISTS "batches_insert_policy" ON public.batches;
    DROP POLICY IF EXISTS "batches_update_policy" ON public.batches;
    DROP POLICY IF EXISTS "batches_delete_policy" ON public.batches;

    CREATE POLICY "batches_select_policy" ON public.batches
        FOR SELECT USING (
            public.has_any_role_in_school(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "batches_insert_policy" ON public.batches
        FOR INSERT WITH CHECK (
            public.is_school_admin(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "batches_update_policy" ON public.batches
        FOR UPDATE USING (
            public.is_school_admin(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "batches_delete_policy" ON public.batches
        FOR DELETE USING (
            public.is_school_admin(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Update schools policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "students_can_view_own_school" ON public.schools;
    DROP POLICY IF EXISTS "school_admins_can_view_and_update_own_school" ON public.schools;
    DROP POLICY IF EXISTS "parents_can_view_related_school" ON public.schools;
    DROP POLICY IF EXISTS "users_can_view_their_schools" ON public.schools;
    DROP POLICY IF EXISTS "school_admins_can_manage_school" ON public.schools;

    CREATE POLICY "users_can_view_their_schools" ON public.schools
        FOR SELECT USING (
            public.has_any_role_in_school(auth.uid(), id) OR
            public.is_super_admin(auth.uid())
        );

    CREATE POLICY "school_admins_can_manage_school" ON public.schools
        FOR ALL USING (
            public.is_school_admin(auth.uid(), id) OR
            public.is_super_admin(auth.uid())
        );
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Update student_details policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "student_details_school_admin_policy" ON public.student_details;
    DROP POLICY IF EXISTS "student_details_access_policy" ON public.student_details;

    CREATE POLICY "student_details_access_policy" ON public.student_details
        FOR ALL USING (
            public.has_any_role_in_school(auth.uid(), school_id) OR
            public.is_super_admin(auth.uid())
        );
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Update profiles policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view profiles from their school" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

    CREATE POLICY "Users can view all profiles" ON public.profiles
        FOR SELECT USING (true);
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Update the auto_confirm_email function to work with new role system
CREATE OR REPLACE FUNCTION public.auto_confirm_email(target_email text)
RETURNS boolean AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 