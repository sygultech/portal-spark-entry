-- First, clean up any duplicate periods for the affected configuration
DELETE FROM period_settings ps1
USING period_settings ps2
WHERE ps1.id > ps2.id
  AND ps1.configuration_id = ps2.configuration_id
  AND ps1.period_number = ps2.period_number
  AND ps1.day_of_week = ps2.day_of_week
  AND (
    (ps1.fortnight_week IS NULL AND ps2.fortnight_week IS NOT NULL)
    OR
    (ps1.fortnight_week IS NOT NULL AND ps2.fortnight_week IS NULL)
  );

-- Drop all functions with this name
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

-- Create the new function with improved filtering
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
        WITH selected_days AS (
            SELECT 
                CASE 
                    WHEN NOT p_is_weekly_mode AND day LIKE 'week%-%' THEN 
                        lower(split_part(day, '-', 2))  -- Extract base day name and convert to lowercase
                    ELSE 
                        lower(day)  -- Convert day to lowercase for consistency
                END AS base_day,
                CASE 
                    WHEN NOT p_is_weekly_mode AND day LIKE 'week%-%' THEN 
                        CASE split_part(day, '-', 1)
                            WHEN 'week1' THEN 1
                            WHEN 'week2' THEN 2
                            ELSE NULL
                        END
                    ELSE 
                        NULL  -- No fortnight week for weekly mode
                END AS week_num
            FROM unnest(p_selected_days) AS day
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
        SELECT DISTINCT ON (v_config_id, (period->>'number')::integer, sd.base_day, sd.week_num)
            v_config_id,
            (period->>'number')::integer,
            (period->>'startTime')::time,
            (period->>'endTime')::time,
            period->>'type',
            period->>'label',
            sd.base_day,
            sd.week_num
        FROM jsonb_array_elements(p_default_periods) AS period
        CROSS JOIN selected_days sd
        ORDER BY v_config_id, (period->>'number')::integer, sd.base_day, sd.week_num;
    ELSE
        -- When flexible timings are enabled, use day-specific periods
        WITH selected_days AS (
            SELECT 
                day_key,
                CASE 
                    WHEN NOT p_is_weekly_mode AND day_key LIKE 'week%-%' THEN 
                        lower(split_part(day_key, '-', 2))  -- Extract base day name and convert to lowercase
                    ELSE 
                        lower(day_key)  -- Convert day to lowercase for consistency
                END AS base_day,
                CASE 
                    WHEN NOT p_is_weekly_mode AND day_key LIKE 'week%-%' THEN 
                        CASE split_part(day_key, '-', 1)
                            WHEN 'week1' THEN 1
                            WHEN 'week2' THEN 2
                            ELSE NULL
                        END
                    ELSE 
                        NULL  -- No fortnight week for weekly mode
                END AS week_num
            FROM jsonb_object_keys(p_day_specific_periods) AS day_key
            WHERE day_key = ANY(p_selected_days)
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
        SELECT DISTINCT ON (v_config_id, (period->>'number')::integer, sd.base_day, sd.week_num)
            v_config_id,
            (period->>'number')::integer,
            (period->>'startTime')::time,
            (period->>'endTime')::time,
            period->>'type',
            period->>'label',
            sd.base_day,
            sd.week_num
        FROM selected_days sd
        CROSS JOIN jsonb_array_elements(p_day_specific_periods->sd.day_key) AS period
        ORDER BY v_config_id, (period->>'number')::integer, sd.base_day, sd.week_num;
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