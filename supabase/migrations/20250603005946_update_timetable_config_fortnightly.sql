-- Update the save_timetable_configuration function to handle day-specific periods and fortnightly mode
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
        Fortnight_Start_Date
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

-- Update function permissions
GRANT ALL ON FUNCTION "public"."save_timetable_configuration"("p_school_id" "uuid", "p_name" "text", "p_is_active" boolean, "p_is_default" boolean, "p_academic_year_id" "uuid", "p_is_weekly_mode" boolean, "p_selected_days" text[], "p_default_periods" jsonb, "p_fortnight_start_date" date, "p_day_specific_periods" jsonb, "p_enable_flexible_timings" boolean, "p_batch_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."save_timetable_configuration"("p_school_id" "uuid", "p_name" "text", "p_is_active" boolean, "p_is_default" boolean, "p_academic_year_id" "uuid", "p_is_weekly_mode" boolean, "p_selected_days" text[], "p_default_periods" jsonb, "p_fortnight_start_date" date, "p_day_specific_periods" jsonb, "p_enable_flexible_timings" boolean, "p_batch_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_timetable_configuration"("p_school_id" "uuid", "p_name" "text", "p_is_active" boolean, "p_is_default" boolean, "p_academic_year_id" "uuid", "p_is_weekly_mode" boolean, "p_selected_days" text[], "p_default_periods" jsonb, "p_fortnight_start_date" date, "p_day_specific_periods" jsonb, "p_enable_flexible_timings" boolean, "p_batch_ids" "uuid"[]) TO "service_role"; 