-- Fix get_timetable_configurations function to reference is_fortnightly from correct table
CREATE OR REPLACE FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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
            'isFortnightly', tc.is_fortnightly,
            'fortnightStartDate', tc.Fortnight_Start_Date,
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

-- Update function permissions
GRANT ALL ON FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") TO "service_role"; 