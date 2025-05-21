-- Create user_school_roles table for multiple roles per user per school
DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS public.user_school_roles (
        id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
        role public.user_role NOT NULL,
        is_primary boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        UNIQUE(user_id, school_id, role)
    );
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
END $$;

-- Add RLS to user_school_roles
ALTER TABLE public.user_school_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_school_roles;
DROP POLICY IF EXISTS "School admins can manage roles for their school" ON public.user_school_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_school_roles;

-- Policies for user_school_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_school_roles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "School admins can manage roles for their school"
    ON public.user_school_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_school_roles
            WHERE user_id = auth.uid()
            AND school_id = user_school_roles.school_id
            AND role = 'school_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_school_roles
            WHERE user_id = auth.uid()
            AND school_id = user_school_roles.school_id
            AND role = 'school_admin'
        )
    );

CREATE POLICY "Super admins can manage all roles"
    ON public.user_school_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_school_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_school_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
        )
    );

-- Create function to get user's roles for a specific school
CREATE OR REPLACE FUNCTION public.get_user_roles_for_school(p_user_id uuid, p_school_id uuid)
RETURNS SETOF public.user_role AS $$
BEGIN
    RETURN QUERY
    SELECT role
    FROM public.user_school_roles
    WHERE user_id = p_user_id
    AND school_id = p_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has role in school
CREATE OR REPLACE FUNCTION public.has_role_in_school(p_user_id uuid, p_school_id uuid, p_role public.user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_school_roles
        WHERE user_id = p_user_id
        AND school_id = p_school_id
        AND role = p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing data from profiles to user_school_roles
DO $$ 
BEGIN
    -- Only migrate if the columns still exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name IN ('school_id', 'role')
    ) THEN
        INSERT INTO public.user_school_roles (user_id, school_id, role, is_primary)
        SELECT id, school_id, role, true
        FROM public.profiles
        WHERE school_id IS NOT NULL
        ON CONFLICT DO NOTHING;

        -- Update profiles table to remove school_id and role
        ALTER TABLE public.profiles
            DROP COLUMN IF EXISTS school_id,
            DROP COLUMN IF EXISTS role;
    END IF;
END $$;

-- Update RLS policies that were dependent on profiles.school_id and profiles.role
CREATE OR REPLACE FUNCTION public.get_user_primary_school_id(user_id uuid)
RETURNS uuid AS $$
BEGIN
    RETURN (
        SELECT school_id
        FROM public.user_school_roles
        WHERE user_id = $1
        AND is_primary = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_school_roles
        WHERE user_id = $1
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies to use the new functions
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS uuid AS $$
BEGIN
    RETURN public.get_user_primary_school_id(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 