-- Function to get timetable configuration with period settings
CREATE OR REPLACE FUNCTION "public"."get_timetable_configuration"(
    "p_config_id" "uuid"
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', tc.id,
        'name', tc.name,
        'isActive', tc.is_active,
        'isDefault', tc.is_default,
        'academicYearId', tc.academic_year_id,
        'isWeeklyMode', NOT tc.is_fortnightly,
        'fortnightStartDate', tc.Fortnight_Start_Date,
        'periods', (
            SELECT jsonb_object_agg(
                ps.day_of_week,
                jsonb_agg(
                    jsonb_build_object(
                        'id', ps.id,
                        'number', ps.period_number,
                        'startTime', ps.start_time,
                        'endTime', ps.end_time,
                        'type', ps.type,
                        'label', ps.label,
                        'fortnightWeek', ps.fortnight_week
                    )
                    ORDER BY ps.period_number
                )
            )
            FROM period_settings ps
            WHERE ps.configuration_id = tc.id
            GROUP BY ps.day_of_week
        ),
        'batchIds', (
            SELECT jsonb_agg(bcm.batch_id)
            FROM batch_configuration_mapping bcm
            WHERE bcm.configuration_id = tc.id
        )
    ) INTO v_result
    FROM timetable_configurations tc
    WHERE tc.id = p_config_id;

    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- Grant permissions
GRANT ALL ON FUNCTION "public"."get_timetable_configuration"("p_config_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_timetable_configuration"("p_config_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_timetable_configuration"("p_config_id" "uuid") TO "service_role"; 