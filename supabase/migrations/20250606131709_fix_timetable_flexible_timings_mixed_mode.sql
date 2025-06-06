
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
          AND p.proname = 'save_timetable_configuration'
    );
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create updated function to handle mixed flexible timings correctly
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
    v_days_with_custom text[];
BEGIN
    -- Input validation
    IF NOT p_is_weekly_mode AND p_fortnight_start_date IS NULL THEN
        RAISE EXCEPTION 'Fortnight start date is required for fortnightly mode';
    END IF;

    IF array_length(p_selected_days, 1) = 0 THEN
        RAISE EXCEPTION 'At least one school day must be selected';
    END IF;

    -- Create timetable configuration
    INSERT INTO timetable_configurations (
        school_id,
        name,
        is_active,
        is_default,
        academic_year_id,
        is_weekly_mode,
        fortnight_start_date,
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
        p_is_weekly_mode,
        p_fortnight_start_date,
        p_selected_days,
        p_default_periods,
        p_enable_flexible_timings,
        p_batch_ids
    )
    RETURNING id INTO v_config_id;

    -- Delete existing period settings for this configuration
    DELETE FROM period_settings WHERE configuration_id = v_config_id;

    -- Get array of days with custom timings (if any)
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        SELECT array_agg(key) INTO v_days_with_custom
        FROM jsonb_object_keys(p_day_specific_periods) AS key;
    ELSE
        v_days_with_custom := ARRAY[]::text[];
    END IF;

    -- Handle custom timings if enabled and provided
    IF p_enable_flexible_timings AND p_day_specific_periods IS NOT NULL THEN
        WITH custom_periods AS (
            SELECT
                day_key,
                (period->>'number')::integer as period_number,
                (period->>'startTime')::time as start_time,
                (period->>'endTime')::time as end_time,
                period->>'type' as type,
                period->>'label' as label,
                -- Extract base day name (e.g., 'monday' from 'week1-monday' or just 'monday')
                CASE 
                    WHEN day_key LIKE 'week%-%' THEN 
                        lower(split_part(day_key, '-', 2))
                    ELSE 
                        lower(day_key)
                END as base_day,
                -- Extract week number for fortnightly mode
                CASE 
                    WHEN NOT p_is_weekly_mode AND day_key LIKE 'week%-%' THEN 
                        CASE split_part(day_key, '-', 1)
                            WHEN 'week1' THEN 1
                            WHEN 'week2' THEN 2
                            ELSE NULL
                        END
                    ELSE 
                        NULL
                END as week_num
            FROM jsonb_each(p_day_specific_periods) AS days(day_key, day_periods),
                 jsonb_array_elements(day_periods) AS period
        )
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
        SELECT DISTINCT ON (v_config_id, period_number, base_day, week_num)
            v_config_id,
            period_number,
            start_time,
            end_time,
            type,
            label,
            base_day,
            week_num
        FROM custom_periods
        ORDER BY v_config_id, period_number, base_day, week_num;
    END IF;

    -- Handle default timings for remaining selected days 
    -- (either when flexible timings is disabled, or for days without custom timings)
    WITH selected_days_processed AS (
        SELECT 
            day,
            -- Extract base day name
            CASE 
                WHEN NOT p_is_weekly_mode AND day LIKE 'week%-%' THEN 
                    lower(split_part(day, '-', 2))
                ELSE 
                    lower(day)
            END AS base_day,
            -- Extract week number for fortnightly mode
            CASE 
                WHEN NOT p_is_weekly_mode AND day LIKE 'week%-%' THEN 
                    CASE split_part(day, '-', 1)
                        WHEN 'week1' THEN 1
                        WHEN 'week2' THEN 2
                        ELSE NULL
                    END
                ELSE 
                    NULL
            END AS week_num
        FROM unnest(p_selected_days) AS day
        WHERE (
            NOT p_enable_flexible_timings  -- Include all days when flexible timings is disabled
            OR NOT (day = ANY(COALESCE(v_days_with_custom, ARRAY[]::text[])))  -- Include days without custom timings when flexible timings is enabled
        )
    ),
    default_periods AS (
        SELECT
            (period->>'number')::integer as period_number,
            (period->>'startTime')::time as start_time,
            (period->>'endTime')::time as end_time,
            period->>'type' as type,
            period->>'label' as label
        FROM jsonb_array_elements(p_default_periods) AS period
    )
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
    SELECT DISTINCT ON (v_config_id, dp.period_number, sdp.base_day, sdp.week_num)
        v_config_id,
        dp.period_number,
        dp.start_time,
        dp.end_time,
        dp.type,
        dp.label,
        sdp.base_day,
        sdp.week_num
    FROM default_periods dp
    CROSS JOIN selected_days_processed sdp
    ORDER BY v_config_id, dp.period_number, sdp.base_day, sdp.week_num;

    -- Insert batch mappings if provided and not default
    IF NOT p_is_default AND p_batch_ids IS NOT NULL AND array_length(p_batch_ids, 1) > 0 THEN
        INSERT INTO batch_configuration_mapping (
            configuration_id,
            batch_id
        )
        SELECT
            v_config_id,
            batch_id
        FROM unnest(p_batch_ids) AS batch_id
        ON CONFLICT (configuration_id, batch_id) DO NOTHING;
    END IF;

    RETURN v_config_id;
END;
$$;

-- Grant permissions
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
