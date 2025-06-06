-- Drop existing function first
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg(
            format('DROP FUNCTION IF EXISTS %s(%s);',
                   p.oid::regproc,
                   oidvectortypes(p.proargtypes)),
            E'\n'
        )
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname = 'get_timetable_configurations'
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create updated function
CREATE OR REPLACE FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") 
RETURNS "jsonb"
LANGUAGE "plpgsql" 
SECURITY DEFINER
AS $$
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
            'isWeeklyMode', tc.is_weekly_mode,
            'fortnightStartDate', tc.fortnight_start_date,
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
$$;

-- Grant permissions
GRANT ALL ON FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") 
TO "anon", "authenticated", "service_role"; 