-- Update the save_timetable_configuration function to use the new column name
CREATE OR REPLACE FUNCTION "public"."save_timetable_configuration"(
    "p_school_id" "uuid",
    "p_name" "text",
    "p_is_active" boolean,
    "p_is_default" boolean,
    "p_academic_year_id" "uuid",
    "p_is_weekly_mode" boolean,
    "p_selected_days" text[],
    "p_default_periods" jsonb,
    "p_fortnight_start_date" date DEFAULT NULL,
    "p_day_specific_periods" jsonb DEFAULT NULL,
    "p_enable_flexible_timings" boolean DEFAULT false,
    "p_batch_ids" "uuid"[] DEFAULT NULL::"uuid"[]
) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config_id uuid;
    v_base_day text;
    v_week_number integer;
BEGIN
    -- Validate inputs
    IF NOT p_is_weekly_mode AND p_fortnight_start_date IS NULL THEN
        RAISE EXCEPTION 'Fortnight start date is required for fortnightly mode';
    END IF;

    IF array_length(p_selected_days, 1) = 0 THEN
        RAISE EXCEPTION 'At least one school day must be selected';
    END IF;

    -- Insert timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id,
        is_fortnightly,
        fortnight_start_date
    ) VALUES (
        p_school_id,
        p_name,
        p_is_active,
        p_is_default,
        p_academic_year_id,
        NOT p_is_weekly_mode,
        p_fortnight_start_date
    ) RETURNING id INTO v_config_id;

    -- Handle period settings based on flexible timings mode
    IF NOT p_enable_flexible_timings THEN
        -- When flexible timings are disabled, use default periods for all selected days
        INSERT INTO period_settings (
            configuration_id,
            period_number,
            start_time,
            end_time,
            type,
            label,
            day_of_week,
            fortnight_week
        )
        SELECT
            v_config_id,
            (period->>'number')::integer,
            (period->>'startTime')::time,
            (period->>'endTime')::time,
            period->>'type',
            period->>'label',
            CASE 
                WHEN NOT p_is_weekly_mode AND day LIKE 'week%-%' THEN 
                    split_part(day, '-', 2)  -- Extract base day name for fortnightly mode
                ELSE 
                    day  -- Use day as is for weekly mode
            END,
            CASE 
                WHEN NOT p_is_weekly_mode AND day LIKE 'week%-%' THEN 
                    (split_part(day, '-', 1) = 'week1')::int + 1  -- Convert week1/week2 to 1/2
                ELSE 
                    NULL  -- No fortnight week for weekly mode
            END
        FROM jsonb_array_elements(p_default_periods) AS period
        CROSS JOIN unnest(p_selected_days) AS day;
    ELSE
        -- When flexible timings are enabled, use day-specific periods
        INSERT INTO period_settings (
            configuration_id,
            period_number,
            start_time,
            end_time,
            type,
            label,
            day_of_week,
            fortnight_week
        )
        SELECT
            v_config_id,
            (period->>'number')::integer,
            (period->>'startTime')::time,
            (period->>'endTime')::time,
            period->>'type',
            period->>'label',
            CASE 
                WHEN NOT p_is_weekly_mode AND day_key LIKE 'week%-%' THEN 
                    split_part(day_key, '-', 2)  -- Extract base day name for fortnightly mode
                ELSE 
                    day_key  -- Use day as is for weekly mode
            END,
            CASE 
                WHEN NOT p_is_weekly_mode AND day_key LIKE 'week%-%' THEN 
                    (split_part(day_key, '-', 1) = 'week1')::int + 1  -- Convert week1/week2 to 1/2
                ELSE 
                    NULL  -- No fortnight week for weekly mode
            END
        FROM jsonb_each(p_day_specific_periods) AS days(day_key, day_periods),
             jsonb_array_elements(day_periods) AS period;
    END IF;

    -- Insert batch mappings if provided and not default
    IF NOT p_is_default AND p_batch_ids IS NOT NULL AND array_length(p_batch_ids, 1) > 0 THEN
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
$$;

-- Update the get_timetable_configuration function to use the new column name
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
        'fortnightStartDate', tc.fortnight_start_date,
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

-- Update the get_timetable_configurations function to use the new column name
CREATE OR REPLACE FUNCTION "public"."get_timetable_configurations"(
    "p_school_id" "uuid",
    "p_academic_year_id" "uuid"
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
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
            'isWeeklyMode', NOT tc.is_fortnightly,
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

-- Grant permissions to the functions
GRANT ALL ON FUNCTION "public"."save_timetable_configuration"("p_school_id" "uuid", "p_name" "text", "p_is_active" boolean, "p_is_default" boolean, "p_academic_year_id" "uuid", "p_is_weekly_mode" boolean, "p_selected_days" text[], "p_default_periods" jsonb, "p_fortnight_start_date" date, "p_day_specific_periods" jsonb, "p_enable_flexible_timings" boolean, "p_batch_ids" "uuid"[]) TO "anon", "authenticated", "service_role";

GRANT ALL ON FUNCTION "public"."get_timetable_configuration"("p_config_id" "uuid") TO "anon", "authenticated", "service_role";
GRANT ALL ON FUNCTION "public"."get_timetable_configurations"("p_school_id" "uuid", "p_academic_year_id" "uuid") TO "anon", "authenticated", "service_role"; 