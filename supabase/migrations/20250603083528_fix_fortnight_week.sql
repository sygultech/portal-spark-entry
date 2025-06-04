-- Update the save_timetable_configuration function to correctly handle fortnight week values
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
    "p_batch_ids" "uuid"[] DEFAULT NULL::uuid[]
) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_config_id uuid;
    v_period_record record;
    v_day text;
    v_week int;
BEGIN
    -- Validate inputs
    IF NOT p_is_weekly_mode AND p_fortnight_start_date IS NULL THEN
        RAISE EXCEPTION 'Fortnight start date is required for fortnightly mode';
    END IF;

    IF array_length(p_selected_days, 1) = 0 THEN
        RAISE EXCEPTION 'At least one school day must be selected';
    END IF;

    -- Create or update timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id,
        is_fortnightly,
        "Fortnight_Start_Date",
        selected_days,
        default_periods,
        enable_flexible_timings,
        batch_ids
    ) VALUES (
        p_school_id,
        p_name,
        p_is_active,
        p_is_default,
        p_academic_year_id,
        NOT p_is_weekly_mode,
        p_fortnight_start_date,
        p_selected_days,
        p_default_periods,
        p_enable_flexible_timings,
        p_batch_ids
    )
    RETURNING id INTO v_config_id;

    -- Delete existing period settings for this configuration
    DELETE FROM period_settings WHERE configuration_id = v_config_id;

    -- Insert default periods for each selected day
    FOREACH v_day IN ARRAY p_selected_days
    LOOP
        -- For fortnightly mode, extract week number from day ID
        IF NOT p_is_weekly_mode AND v_day LIKE 'week%-%' THEN
            v_week := CASE 
                WHEN split_part(v_day, '-', 1) = 'week1' THEN 1
                WHEN split_part(v_day, '-', 1) = 'week2' THEN 2
                ELSE NULL
            END;
            v_day := split_part(v_day, '-', 2);
        ELSE
            v_week := NULL;
        END IF;

        -- Insert default periods for this day
        FOR v_period_record IN 
            SELECT * FROM jsonb_to_recordset(p_default_periods) AS x(
                number int,
                start_time time,
                end_time time,
                type text,
                label text
            )
        LOOP
            INSERT INTO period_settings (
                configuration_id,
                period_number,
                start_time,
                end_time,
                type,
                label,
                day_of_week,
                fortnight_week
            ) VALUES (
                v_config_id,
                v_period_record.number,
                v_period_record.start_time,
                v_period_record.end_time,
                v_period_record.type,
                v_period_record.label,
                v_day,
                v_week
            );
        END LOOP;
    END LOOP;

    -- Insert day-specific periods if provided
    IF p_day_specific_periods IS NOT NULL AND p_enable_flexible_timings THEN
        FOR v_day IN SELECT * FROM jsonb_object_keys(p_day_specific_periods)
        LOOP
            -- For fortnightly mode, extract week number from day ID
            IF NOT p_is_weekly_mode AND v_day LIKE 'week%-%' THEN
                v_week := CASE 
                    WHEN split_part(v_day, '-', 1) = 'week1' THEN 1
                    WHEN split_part(v_day, '-', 1) = 'week2' THEN 2
                    ELSE NULL
                END;
                v_day := split_part(v_day, '-', 2);
            ELSE
                v_week := NULL;
            END IF;

            -- Insert day-specific periods
            FOR v_period_record IN 
                SELECT * FROM jsonb_to_recordset(p_day_specific_periods->v_day) AS x(
                    number int,
                    start_time time,
                    end_time time,
                    type text,
                    label text
                )
            LOOP
                INSERT INTO period_settings (
                    configuration_id,
                    period_number,
                    start_time,
                    end_time,
                    type,
                    label,
                    day_of_week,
                    fortnight_week
                ) VALUES (
                    v_config_id,
                    v_period_record.number,
                    v_period_record.start_time,
                    v_period_record.end_time,
                    v_period_record.type,
                    v_period_record.label,
                    v_day,
                    v_week
                );
            END LOOP;
        END LOOP;
    END IF;

    RETURN v_config_id;
END;
$$;

-- Grant permissions to the function
GRANT ALL ON FUNCTION "public"."save_timetable_configuration"(
    "p_school_id" "uuid",
    "p_name" "text",
    "p_is_active" boolean,
    "p_is_default" boolean,
    "p_academic_year_id" "uuid",
    "p_is_weekly_mode" boolean,
    "p_selected_days" text[],
    "p_default_periods" jsonb,
    "p_fortnight_start_date" date,
    "p_day_specific_periods" jsonb,
    "p_enable_flexible_timings" boolean,
    "p_batch_ids" "uuid"[]
) TO "anon", "authenticated", "service_role"; 