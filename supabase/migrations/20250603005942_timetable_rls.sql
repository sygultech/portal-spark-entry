-- Drop existing policies if they exist
DROP POLICY IF EXISTS "School admins can manage timetable configurations" ON "public"."timetable_configurations";
DROP POLICY IF EXISTS "School admins can manage period settings" ON "public"."period_settings";
DROP POLICY IF EXISTS "School admins can manage batch mappings" ON "public"."batch_configuration_mapping";

-- Enable RLS on timetable-related tables
ALTER TABLE "public"."timetable_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."period_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."batch_configuration_mapping" ENABLE ROW LEVEL SECURITY;

-- Policy for school admins to manage timetable configurations
CREATE POLICY "School admins can manage timetable configurations"
    ON "public"."timetable_configurations"
    FOR ALL
    TO authenticated
    USING (
        school_id IN (
            SELECT school_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'school_admin'::user_role = ANY(roles)
        )
    )
    WITH CHECK (
        school_id IN (
            SELECT school_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'school_admin'::user_role = ANY(roles)
        )
    );

-- Policy for school admins to manage period settings
CREATE POLICY "School admins can manage period settings"
    ON "public"."period_settings"
    FOR ALL
    TO authenticated
    USING (
        configuration_id IN (
            SELECT id
            FROM public.timetable_configurations tc
            WHERE tc.school_id IN (
                SELECT school_id
                FROM public.profiles
                WHERE id = auth.uid()
                AND 'school_admin'::user_role = ANY(roles)
            )
        )
    )
    WITH CHECK (
        configuration_id IN (
            SELECT id
            FROM public.timetable_configurations tc
            WHERE tc.school_id IN (
                SELECT school_id
                FROM public.profiles
                WHERE id = auth.uid()
                AND 'school_admin'::user_role = ANY(roles)
            )
        )
    );

-- Policy for school admins to manage batch mappings
CREATE POLICY "School admins can manage batch mappings"
    ON "public"."batch_configuration_mapping"
    FOR ALL
    TO authenticated
    USING (
        configuration_id IN (
            SELECT id
            FROM public.timetable_configurations tc
            WHERE tc.school_id IN (
                SELECT school_id
                FROM public.profiles
                WHERE id = auth.uid()
                AND 'school_admin'::user_role = ANY(roles)
            )
        )
    )
    WITH CHECK (
        configuration_id IN (
            SELECT id
            FROM public.timetable_configurations tc
            WHERE tc.school_id IN (
                SELECT school_id
                FROM public.profiles
                WHERE id = auth.uid()
                AND 'school_admin'::user_role = ANY(roles)
            )
        )
    );

-- Policy for teachers to view timetable configurations
CREATE POLICY "Teachers can view timetable configurations"
    ON "public"."timetable_configurations"
    FOR SELECT
    TO authenticated
    USING (
        school_id IN (
            SELECT school_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'teacher'::user_role = ANY(roles)
        )
    );

-- Policy for teachers to view period settings
CREATE POLICY "Teachers can view period settings"
    ON "public"."period_settings"
    FOR SELECT
    TO authenticated
    USING (
        configuration_id IN (
            SELECT id 
            FROM public.timetable_configurations tc
            WHERE tc.school_id IN (
                SELECT school_id 
                FROM public.profiles 
                WHERE id = auth.uid() 
                AND 'teacher'::user_role = ANY(roles)
            )
        )
    ); 